import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface TeamInvitationRequest {
  name: string;
  email: string;
  role: string;
  whatsapp?: string;
  inviterName: string;
  projectName?: string;
  token: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    const { name, email, role, whatsapp, inviterName, projectName, token }: TeamInvitationRequest = await req.json();

    console.log(`Sending team invitation to ${email} for role ${role}`);

    // Use environment variable for from domain or fallback to default
    const fromDomain = Deno.env.get("EMAIL_FROM_DOMAIN") || "onboarding@resend.dev";
    const fromEmail = `Wedding Team <${fromDomain}>`;
    
    // Get app URL for invitation link
    const appUrl = Deno.env.get("APP_URL") || "https://fszciuimghdmkuyhefmj.lovableproject.com";
    const invitationUrl = `${appUrl}/accept-invitation/${token}`;

    const emailResponse = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject: `You've been invited to join the wedding team as a ${role}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Wedding Team Invitation</h1>
          
          <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">Hello ${name}!</h2>
            <p style="color: #666; line-height: 1.6;">
              You have been invited by <strong>${inviterName}</strong> to join the wedding team as a <strong>${role}</strong>.
              ${projectName ? ` This invitation is for the project: <strong>${projectName}</strong>.` : ''}
            </p>
            
            <div style="background-color: white; border-radius: 6px; padding: 15px; margin: 15px 0;">
              <h3 style="color: #333; margin-top: 0;">Your Details:</h3>
              <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
              <p style="margin: 5px 0;"><strong>Role:</strong> ${role}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
              ${whatsapp ? `<p style="margin: 5px 0;"><strong>WhatsApp:</strong> ${whatsapp}</p>` : ''}
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${invitationUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Accept Invitation
              </a>
            </div>
            
            <p style="color: #666; font-size: 12px; text-align: center; margin-top: 15px;">
              Or copy and paste this link: <br>
              <a href="${invitationUrl}" style="color: #007bff; word-break: break-all;">${invitationUrl}</a>
            </p>
            
            <p style="color: #666; font-size: 14px; text-align: center;">
              If you have any questions, please contact ${inviterName} directly.
            </p>
          </div>
          
          <div style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
            <p>This invitation was sent through our Wedding Management System.</p>
          </div>
        </div>
      `,
    });

    console.log("Team invitation sent successfully:", emailResponse);

    // Check for specific email errors and provide detailed response
    if (emailResponse.error) {
      const errorMessage = emailResponse.error;
      
      // Handle specific Resend errors
      if (errorMessage.includes("verify a domain")) {
        return new Response(JSON.stringify({
          success: false,
          error: "Domain verification required",
          message: "To send emails to external recipients, please verify your domain in Resend.",
          details: {
            action: "verify_domain",
            url: "https://resend.com/domains"
          }
        }), {
          status: 403,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        });
      }

      if (errorMessage.includes("testing emails")) {
        return new Response(JSON.stringify({
          success: false,
          error: "Testing mode limitation",
          message: "Currently in testing mode. Can only send to verified email address.",
          details: {
            action: "verify_domain_or_upgrade",
            testingEmail: email
          }
        }), {
          status: 403,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        });
      }

      // Generic email error
      return new Response(JSON.stringify({
        success: false,
        error: "Email sending failed",
        message: errorMessage,
        details: emailResponse
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Team invitation sent successfully",
      emailResponse 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-team-invitation function:", error);
    
    // Provide more detailed error information
    const errorDetails = {
      success: false,
      error: error.message || "Unknown error occurred",
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(errorDetails), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);