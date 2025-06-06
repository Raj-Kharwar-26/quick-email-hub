
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IncomingEmail {
  to: string;
  from: string;
  subject?: string;
  text?: string;
  html?: string;
  messageId?: string;
  date?: string;
  attachments?: any[];
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const emailData: IncomingEmail = await req.json();
    console.log("Received email:", emailData);

    // Find the temporary email address
    const { data: tempEmail, error: tempEmailError } = await supabase
      .from("temporary_emails")
      .select("*")
      .eq("email_address", emailData.to)
      .eq("is_active", true)
      .single();

    if (tempEmailError || !tempEmail) {
      console.log("Temporary email not found or inactive:", emailData.to);
      return new Response(
        JSON.stringify({ error: "Email address not found or inactive" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if email is expired
    if (new Date(tempEmail.expires_at) < new Date()) {
      console.log("Temporary email expired:", emailData.to);
      return new Response(
        JSON.stringify({ error: "Email address expired" }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store the email in the database
    const { data: newEmail, error: insertError } = await supabase
      .from("emails")
      .insert({
        temporary_email_id: tempEmail.id,
        from_address: emailData.from,
        to_address: emailData.to,
        subject: emailData.subject || "No Subject",
        body_text: emailData.text,
        body_html: emailData.html,
        message_id: emailData.messageId,
        email_type: "received",
        is_read: false,
        received_at: emailData.date ? new Date(emailData.date).toISOString() : new Date().toISOString(),
        attachments: emailData.attachments || [],
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting email:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to store email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Email stored successfully:", newEmail.id);

    return new Response(
      JSON.stringify({ success: true, emailId: newEmail.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in handle-incoming-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
