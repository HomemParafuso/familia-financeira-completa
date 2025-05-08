
// Email service for sending real emails to users using EmailJS
import { toast } from 'sonner';
import emailjs from 'emailjs-com';

// Configuração do EmailJS - você precisará criar uma conta em emailjs.com
// e configurar os templates e IDs do serviço
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';  // Substitua pelo seu ID de serviço do EmailJS
const EMAILJS_USER_ID = 'YOUR_USER_ID';        // Substitua pelo seu User ID do EmailJS
const INVITATION_TEMPLATE_ID = 'YOUR_INVITATION_TEMPLATE_ID';  // Template para convites
const RESET_PASSWORD_TEMPLATE_ID = 'YOUR_RESET_PASSWORD_TEMPLATE_ID'; // Template para redefinição de senha

// Inicialização do EmailJS
const initEmailJS = () => {
  emailjs.init(EMAILJS_USER_ID);
};

// Inicializa o EmailJS automaticamente
initEmailJS();

interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  type: 'invitation' | 'reset_password' | 'account_activation';
}

// Função para enviar emails usando o serviço EmailJS
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    console.log(`Preparando para enviar email para ${options.to}`);
    
    // Prepara as variáveis do template com base no tipo de email
    const templateId = options.type === 'reset_password' 
      ? RESET_PASSWORD_TEMPLATE_ID 
      : INVITATION_TEMPLATE_ID;
    
    // Dados a serem enviados para o template do EmailJS
    const templateParams = {
      to_email: options.to,
      to_name: options.to.split('@')[0], // Usa a parte inicial do email como nome (você pode ajustar isso)
      subject: options.subject,
      message: options.body,
      // Remove HTML do corpo para compatibilidade com diferentes provedores de email
      plain_message: options.body.replace(/<[^>]*>?/gm, '')
    };
    
    // Envia o email usando o EmailJS
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      templateId,
      templateParams
    );
    
    if (response.status === 200) {
      console.log('Email enviado com sucesso:', response);
      toast.success(`Email enviado para ${options.to}`);
      return true;
    } else {
      throw new Error(`Falha ao enviar email: ${response.text}`);
    }
  } catch (error) {
    console.error('Falha ao enviar email:', error);
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
