import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationPayload {
  transactionId?: string;
  testMode?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-notifications function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: NotificationPayload = await req.json().catch(() => ({}));
    console.log("Payload received:", payload);

    // Get today's date and date range for notifications
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    // Query transactions that need notifications
    // - notify_on_due = true
    // - not paid
    // - notification_sent = false
    // - due_date is within notify_days_before range OR is today
    const { data: transactions, error: fetchError } = await supabase
      .from("transactions")
      .select(`
        *,
        profiles:user_id (
          id,
          email,
          full_name
        )
      `)
      .eq("notify_on_due", true)
      .eq("is_paid", false)
      .eq("notification_sent", false);

    if (fetchError) {
      console.error("Error fetching transactions:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${transactions?.length || 0} transactions with notifications enabled`);

    const notificationsToSend: Array<{
      transaction: any;
      email: string;
      name: string;
      daysUntilDue: number;
    }> = [];

    // Filter transactions that should receive notifications today
    for (const transaction of transactions || []) {
      const dueDate = new Date(transaction.due_date);
      const diffTime = dueDate.getTime() - today.getTime();
      const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const notifyDaysBefore = transaction.notify_days_before || 0;
      const profile = transaction.profiles as any;

      // Send notification if:
      // - It's the due date (daysUntilDue === 0)
      // - We're within the notify_days_before window
      if (daysUntilDue === notifyDaysBefore || daysUntilDue === 0) {
        if (profile?.email) {
          notificationsToSend.push({
            transaction,
            email: profile.email,
            name: profile.full_name || profile.email,
            daysUntilDue,
          });
        }
      }
    }

    console.log(`${notificationsToSend.length} notifications to send`);

    // If no Resend API key, just log and mark as sent (for testing)
    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured - logging notifications only");

      for (const notification of notificationsToSend) {
        console.log(`Would send email to ${notification.email}:`, {
          transaction: notification.transaction.name,
          amount: notification.transaction.amount,
          dueDate: notification.transaction.due_date,
          daysUntilDue: notification.daysUntilDue,
        });

        // Mark as sent even without sending (for testing)
        await supabase
          .from("transactions")
          .update({ notification_sent: true })
          .eq("id", notification.transaction.id);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `${notificationsToSend.length} notifications logged (RESEND_API_KEY not configured)`,
          notifications: notificationsToSend.map((n) => ({
            email: n.email,
            transaction: n.transaction.name,
            dueDate: n.transaction.due_date,
          })),
        }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send emails using Resend
    const resend = new Resend(resendApiKey);
    const sentNotifications: string[] = [];
    const failedNotifications: string[] = [];

    for (const notification of notificationsToSend) {
      const { transaction, email, name, daysUntilDue } = notification;
      const formattedAmount = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(transaction.amount);

      const dueMessage =
        daysUntilDue === 0
          ? "vence HOJE"
          : daysUntilDue === 1
          ? "vence AMANHÃ"
          : `vence em ${daysUntilDue} dias`;

      try {
        const emailResponse = await resend.emails.send({
          from: "Sistema Financeiro <onboarding@resend.dev>",
          to: [email],
          subject: `⚠️ Lembrete: ${transaction.name} ${dueMessage}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #1e40af;">Lembrete de Vencimento</h1>
              <p>Olá, ${name}!</p>
              <p>Este é um lembrete de que o seguinte lançamento <strong>${dueMessage}</strong>:</p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0;"><strong>Descrição:</strong> ${transaction.name}</p>
                <p style="margin: 0 0 10px 0;"><strong>Valor:</strong> ${formattedAmount}</p>
                <p style="margin: 0 0 10px 0;"><strong>Vencimento:</strong> ${new Date(transaction.due_date).toLocaleDateString("pt-BR")}</p>
                <p style="margin: 0;"><strong>Tipo:</strong> ${transaction.type === "expense" ? "Despesa" : "Receita"}</p>
              </div>
              
              <p>Não se esqueça de efetuar o pagamento para evitar atrasos.</p>
              
              <p style="color: #6b7280; font-size: 12px; margin-top: 40px;">
                Este é um email automático do Sistema de Organização Financeira Familiar.
              </p>
            </div>
          `,
        });

        console.log(`Email sent to ${email}:`, emailResponse);
        sentNotifications.push(email);

        // Mark notification as sent
        await supabase
          .from("transactions")
          .update({ notification_sent: true })
          .eq("id", transaction.id);
      } catch (emailError) {
        console.error(`Failed to send email to ${email}:`, emailError);
        failedNotifications.push(email);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sent ${sentNotifications.length} notifications, ${failedNotifications.length} failed`,
        sent: sentNotifications,
        failed: failedNotifications,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-notifications function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
