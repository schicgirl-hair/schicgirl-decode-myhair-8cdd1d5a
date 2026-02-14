import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id } = await req.json();
    if (!session_id || typeof session_id !== "string") {
      return new Response(JSON.stringify({ error: "Missing session_id" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify with Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    const paid = session.payment_status === "paid";

    if (!paid) {
      return new Response(JSON.stringify({ paid: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerEmail = session.customer_details?.email;
    if (!customerEmail) {
      return new Response(JSON.stringify({ error: "No email found in payment session" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to manage users and payments
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(
      (u) => u.email === customerEmail
    );

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create a new user with a random password (they'll set their own later)
      const tempPassword = crypto.randomUUID();
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: customerEmail,
        password: tempPassword,
        email_confirm: true,
      });
      if (createError || !newUser.user) {
        throw new Error(`Failed to create user: ${createError?.message}`);
      }
      userId = newUser.user.id;
    }

    // Record payment
    const { data: existingPayment } = await supabaseAdmin
      .from("payments")
      .select("id")
      .eq("stripe_session_id", session_id)
      .maybeSingle();

    if (existingPayment) {
      await supabaseAdmin.from("payments").update({ status: "paid", user_id: userId }).eq("id", existingPayment.id);
    } else {
      await supabaseAdmin.from("payments").insert({
        user_id: userId,
        stripe_session_id: session_id,
        status: "paid",
      });
    }

    // Generate a magic link so the frontend can auto-sign the user in
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: customerEmail,
    });

    if (linkError || !linkData) {
      // Payment is verified but couldn't auto-login — still return paid
      console.error("Magic link generation failed:", linkError);
      return new Response(JSON.stringify({ paid: true, email: customerEmail }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract the token_hash from the generated link
    const url = new URL(linkData.properties.action_link);
    const tokenHash = url.searchParams.get("token_hash") || url.hash;

    return new Response(JSON.stringify({
      paid: true,
      email: customerEmail,
      token_hash: tokenHash,
      needs_password: !existingUser,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Payment verification failed:", error);
    return new Response(JSON.stringify({ error: "Verification failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
