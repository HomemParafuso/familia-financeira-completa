
// Email service for sending emails to users
import { toast } from 'sonner';

interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  type: 'invitation' | 'reset_password' | 'account_activation';
}

// In a real application, this would connect to a backend service
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    // Here we would connect to a real email service API
    console.log(`SENDING EMAIL:
    To: ${options.to}
    Subject: ${options.subject}
    Type: ${options.type}
    Body: ${options.body}`);
    
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real application, verify email sending was successful
    // For now, we'll just show a toast notification for testing
    toast.success(`Email enviado para ${options.to}`);
    
    // Return success
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    toast.error(`Falha ao enviar email para ${options.to}`);
    return false;
  }
};

// Helper functions for specific email types
export const sendInvitationEmail = async (
  email: string,
  groupName: string,
  inviterName: string,
  activationLink: string
): Promise<boolean> => {
  const subject = `Convite para participar do grupo ${groupName}`;
  const body = `
    <h2>Você foi convidado para participar do grupo ${groupName}</h2>
    <p>Olá,</p>
    <p>${inviterName} convidou você para participar do grupo ${groupName} no sistema de finanças.</p>
    <p>Para ativar sua conta e definir sua senha, clique no link abaixo:</p>
    <p><a href="${activationLink}">Ativar minha conta</a></p>
    <p>Este link expira em 48 horas.</p>
    <p>Atenciosamente,<br>Equipe de Finanças</p>
  `;
  
  return sendEmail({
    to: email,
    subject,
    body,
    type: 'invitation'
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  resetLink: string
): Promise<boolean> => {
  const subject = `Recuperação de senha`;
  const body = `
    <h2>Redefinição de senha</h2>
    <p>Olá,</p>
    <p>Recebemos uma solicitação para redefinir sua senha.</p>
    <p>Para criar uma nova senha, clique no link abaixo:</p>
    <p><a href="${resetLink}">Redefinir minha senha</a></p>
    <p>Este link expira em 24 horas.</p>
    <p>Se você não solicitou esta alteração, ignore este email.</p>
    <p>Atenciosamente,<br>Equipe de Finanças</p>
  `;
  
  return sendEmail({
    to: email,
    subject,
    body,
    type: 'reset_password'
  });
};
