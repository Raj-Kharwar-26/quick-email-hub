
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendEmailRequest {
  tempEmailId: string;
  to: string;
  subject: string;
  body: string;
  from: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { tempEmailId, to, subject, body, from }: SendEmailRequest = await req.json();

    // Verify the temporary email belongs to the authenticated user
    const { data: tempEmail, error: tempEmailError } = await supabase
      .from("temporary_emails")
      .select("*")
      .eq("id", tempEmailId)
      .eq("is_active", true)
      .single();

    if (tempEmailError || !tempEmail) {
      return new Response(
        JSON.stringify({ error: "Temporary email not found or not accessible" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if email is expired
    if (new Date(tempEmail.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Temporary email expired" }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For demo purposes, we'll simulate email sending
    // In a real implementation, you would integrate with an SMTP service like:
    // - Resend
    // - SendGrid
    // - Amazon SES
    // - Postmark
    
    console.log(`Simulating email send from ${from} to ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);

    // Store the sent email in the database
    const { data: sentEmail, error: insertError } = await supabase
      .from("emails")
      .insert({
        temporary_email_id: tempEmailId,
        from_address: from,
        to_address: to,
        subject,
        body_text: body,
        email_type: "sent",
        is_sent: true,
        received_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error storing sent email:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to store sent email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: sentEmail.id,
        message: "Email sent successfully (simulated)"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
