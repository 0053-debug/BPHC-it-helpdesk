import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_RESET_PASSWORD = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_TEMPLATE_RESET_SUCCESS = import.meta.env.VITE_EMAILJS_TEMPLATE_RESET_SUCCESS || '';
const EMAILJS_TEMPLATE_WELCOME = import.meta.env.VITE_EMAILJS_TEMPLATE_WELCOME || '';
const EMAILJS_TEMPLATE_TICKET_CREATED = import.meta.env.VITE_EMAILJS_TEMPLATE_TICKET_CREATED || '';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

export function isEmailConfigured(templateId = EMAILJS_TEMPLATE_RESET_PASSWORD) {
  return Boolean(EMAILJS_SERVICE_ID && templateId && EMAILJS_PUBLIC_KEY);
}

/**
 * 1. Password Reset Request Email
 */
export async function sendPasswordResetEmail({ toEmail, resetLink, recipientName = 'User' }) {
  if (!isEmailConfigured(EMAILJS_TEMPLATE_RESET_PASSWORD)) {
    return { sent: false, reason: 'UNCONFIGURED', message: 'EmailJS keys are not set yet.' };
  }

  try {
    const templateParams = {
      to_name: recipientName,
      to_email: toEmail,
      recipient_email: toEmail,
      email: toEmail,
      reset_link: resetLink,
      link: resetLink,
      url: resetLink,
      message: `You requested a password reset for your BPHC IT HelpDesk account. Click here to reset your password: ${resetLink}`,
    };

    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_RESET_PASSWORD,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    return { sent: true, result };
  } catch (error) {
    console.warn('EmailJS password reset dispatch failed:', error);
    return { sent: false, reason: 'FAILED', error, message: error?.text || error?.message || 'Could not deliver email.' };
  }
}

/**
 * 2. Password Reset Confirmation (Security Alert)
 */
export async function sendPasswordResetSuccessEmail({ toEmail, recipientName = 'User' }) {
  const templateId = EMAILJS_TEMPLATE_RESET_SUCCESS || EMAILJS_TEMPLATE_RESET_PASSWORD;
  if (!isEmailConfigured(templateId)) return { sent: false, reason: 'UNCONFIGURED' };

  try {
    const templateParams = {
      to_name: recipientName,
      to_email: toEmail,
      change_time: new Date().toLocaleString(),
      message: 'Your BPHC IT HelpDesk password was successfully updated.',
    };

    const result = await emailjs.send(EMAILJS_SERVICE_ID, templateId, templateParams, EMAILJS_PUBLIC_KEY);
    return { sent: true, result };
  } catch (error) {
    console.warn('EmailJS reset success email failed:', error);
    return { sent: false, error };
  }
}

/**
 * 3. Welcome to BPHC I-ITSM Email
 */
export async function sendWelcomeEmail({ toEmail, userName, role = 'End User' }) {
  const templateId = EMAILJS_TEMPLATE_WELCOME || EMAILJS_TEMPLATE_RESET_PASSWORD;
  if (!isEmailConfigured(templateId)) return { sent: false, reason: 'UNCONFIGURED' };

  try {
    const templateParams = {
      to_name: userName || 'Student / Faculty',
      to_email: toEmail,
      user_role: role,
      portal_url: 'https://bphc-it-helpdesk.web.app',
      login_email: toEmail,
    };

    const result = await emailjs.send(EMAILJS_SERVICE_ID, templateId, templateParams, EMAILJS_PUBLIC_KEY);
    return { sent: true, result };
  } catch (error) {
    console.warn('EmailJS welcome dispatch failed:', error);
    return { sent: false, error };
  }
}

/**
 * 4. Ticket Created / Auto-Assigned Notification
 */
export async function sendTicketCreatedEmail({ toEmail, userName, ticketId, title, priority, assignedTo }) {
  const templateId = EMAILJS_TEMPLATE_TICKET_CREATED || EMAILJS_TEMPLATE_RESET_PASSWORD;
  if (!isEmailConfigured(templateId)) return { sent: false, reason: 'UNCONFIGURED' };

  try {
    const templateParams = {
      to_name: userName || 'User',
      to_email: toEmail,
      ticket_id: ticketId,
      ticket_title: title,
      ticket_priority: priority,
      assigned_technician: assignedTo || 'Automatic Assignment Pool',
      ticket_url: `https://bphc-it-helpdesk.web.app/tickets/${ticketId}`,
    };

    const result = await emailjs.send(EMAILJS_SERVICE_ID, templateId, templateParams, EMAILJS_PUBLIC_KEY);
    return { sent: true, result };
  } catch (error) {
    console.warn('EmailJS ticket notification failed:', error);
    return { sent: false, error };
  }
}
