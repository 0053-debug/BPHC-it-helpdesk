import emailjs from '@emailjs/browser';
import {
  generateWelcomeHtml,
  generateTicketCreatedHtml,
  generateTicketProgressHtml,
  generateTicketResolvedHtml,
  generateSlaBreachHtml,
  generatePasswordResetRequestHtml,
  generatePasswordUpdatedHtml,
} from './emailTemplates';

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_2c6usin';
const EMAILJS_TEMPLATE_RESET_PASSWORD = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_q5i4cvk';
const EMAILJS_TEMPLATE_RESET_SUCCESS = import.meta.env.VITE_EMAILJS_TEMPLATE_RESET_SUCCESS || 'template_q5i4cvk';
const EMAILJS_TEMPLATE_TICKET_CREATED = import.meta.env.VITE_EMAILJS_TEMPLATE_TICKET_CREATED || 'template_y8gkreo';
const EMAILJS_TEMPLATE_TICKET_PROGRESS = import.meta.env.VITE_EMAILJS_TEMPLATE_TICKET_PROGRESS || 'template_y8gkreo';
const EMAILJS_TEMPLATE_TICKET_RESOLVED = import.meta.env.VITE_EMAILJS_TEMPLATE_TICKET_RESOLVED || 'template_y8gkreo';
const EMAILJS_TEMPLATE_SLA_BREACH = import.meta.env.VITE_EMAILJS_TEMPLATE_SLA_BREACH || 'template_y8gkreo';
const EMAILJS_TEMPLATE_WELCOME = import.meta.env.VITE_EMAILJS_TEMPLATE_WELCOME || 'template_y8gkreo';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'CzMJDOJR9b-LtHStA';

const DISPATCH_HISTORY_KEY = 'iitsm_email_dispatches';

export function getEmailDispatchHistory() {
  try {
    const raw = sessionStorage.getItem(DISPATCH_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function recordDispatch(entry) {
  try {
    const history = getEmailDispatchHistory();
    history.unshift({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      timestamp: new Date().toISOString(),
      ...entry,
    });
    sessionStorage.setItem(DISPATCH_HISTORY_KEY, JSON.stringify(history.slice(0, 30)));
    // Also dispatch a browser custom event so any open UI listeners can refresh immediately
    window.dispatchEvent(new CustomEvent('iitsm:email-dispatched', { detail: entry }));
  } catch {
    // Non-fatal
  }
}

export function isEmailConfigured(templateId) {
  return Boolean(EMAILJS_SERVICE_ID && templateId && EMAILJS_PUBLIC_KEY);
}

/**
 * 1. Password Reset Request Email (template_q5i4cvk)
 */
export async function sendPasswordResetEmail({ toEmail, resetLink, recipientName = 'User', validMinutes = 15 }) {
  const templateId = EMAILJS_TEMPLATE_RESET_PASSWORD || 'template_q5i4cvk';
  const htmlContent = generatePasswordResetRequestHtml({ recipientName, resetLink, validMinutes });
  const subject = `[I-ITSM Security] Password Reset Instructions for ${recipientName}`;
  const plainText = `Hello ${recipientName},\n\nYou requested a password reset for your BPHC IT HelpDesk account.\nReset link (valid for ${validMinutes} mins): ${resetLink}\n\nIf you did not request this, please ignore this email.`;

  const templateParams = {
    to_name: recipientName,
    name: recipientName,
    to_email: toEmail,
    recipient_email: toEmail,
    email: toEmail,
    user_email: toEmail,
    subject: subject,
    message_html: htmlContent,
    html: htmlContent,
    html_body: htmlContent,
    content: htmlContent,
    message: plainText,
    reset_link: resetLink,
    link: resetLink,
    url: resetLink,
  };

  try {
    console.log('[I-ITSM Email] Dispatching Password Reset Email to:', toEmail);
    const result = await emailjs.send(EMAILJS_SERVICE_ID, templateId, templateParams, EMAILJS_PUBLIC_KEY);
    recordDispatch({ type: 'PASSWORD_RESET', toEmail, subject, status: 'DELIVERED', result, html: htmlContent });
    return { sent: true, result, html: htmlContent };
  } catch (error) {
    console.warn('[I-ITSM Email] Password reset dispatch failed:', error);
    recordDispatch({ type: 'PASSWORD_RESET', toEmail, subject, status: 'FAILED', error: error?.text || error?.message, html: htmlContent });
    return { sent: false, error, html: htmlContent };
  }
}

/**
 * 2. Password Updated Confirmation Email (template_q5i4cvk)
 */
export async function sendPasswordResetSuccessEmail({ toEmail, recipientName = 'User', changeTime = new Date().toLocaleString() }) {
  const templateId = EMAILJS_TEMPLATE_RESET_SUCCESS;
  const htmlContent = generatePasswordUpdatedHtml({ recipientName, userEmail: toEmail, changeTime });
  const subject = `[I-ITSM Security Alert] Password Successfully Updated`;
  const plainText = `Hello ${recipientName},\n\nYour BPHC IT HelpDesk password was successfully changed on ${changeTime}.\nIf you did not perform this action, please contact CC Lab 1 immediately.`;

  const templateParams = {
    to_name: recipientName,
    name: recipientName,
    to_email: toEmail,
    recipient_email: toEmail,
    email: toEmail,
    user_email: toEmail,
    subject: subject,
    message_html: htmlContent,
    html: htmlContent,
    html_body: htmlContent,
    content: htmlContent,
    message: plainText,
    change_time: changeTime,
    time: changeTime,
  };

  try {
    console.log('[I-ITSM Email] Dispatching Password Updated Email to:', toEmail);
    const result = await emailjs.send(EMAILJS_SERVICE_ID, templateId, templateParams, EMAILJS_PUBLIC_KEY);
    recordDispatch({ type: 'PASSWORD_UPDATED', toEmail, subject, status: 'DELIVERED', result, html: htmlContent });
    return { sent: true, result, html: htmlContent };
  } catch (error) {
    console.warn('[I-ITSM Email] Password reset confirmation dispatch failed:', error);
    recordDispatch({ type: 'PASSWORD_UPDATED', toEmail, subject, status: 'FAILED', error: error?.text || error?.message, html: htmlContent });
    return { sent: false, error, html: htmlContent };
  }
}

/**
 * 3. Welcome to BPHC I-ITSM Email (template_y8gkreo)
 */
export async function sendWelcomeEmail({ toEmail, userName = 'Student / Faculty', role = 'Student / Employee' }) {
  const templateId = EMAILJS_TEMPLATE_WELCOME;
  const htmlContent = generateWelcomeHtml({ recipientName: userName, userEmail: toEmail, userRole: role, portalUrl: 'https://bphc-it-helpdesk.web.app' });
  const subject = `[I-ITSM] Welcome to Campus IT HelpDesk, ${userName}`;
  const plainText = `Welcome to BPHC I-ITSM, ${userName}!\nYour campus account (${toEmail}) is activated for role: ${role}.\nPortal: https://bphc-it-helpdesk.web.app`;

  const templateParams = {
    to_name: userName,
    name: userName,
    to_email: toEmail,
    recipient_email: toEmail,
    email: toEmail,
    user_email: toEmail,
    subject: subject,
    message_html: htmlContent,
    html: htmlContent,
    html_body: htmlContent,
    content: htmlContent,
    message: plainText,
    user_role: role,
    portal_url: 'https://bphc-it-helpdesk.web.app',
    ticket_id: 'ONBOARDING',
    id: 'ONBOARDING',
    title: `Welcome to BPHC I-ITSM`,
    ticket_title: `Welcome to BPHC I-ITSM`,
  };

  try {
    console.log('[I-ITSM Email] Dispatching Welcome Email to:', toEmail);
    const result = await emailjs.send(EMAILJS_SERVICE_ID, templateId, templateParams, EMAILJS_PUBLIC_KEY);
    recordDispatch({ type: 'WELCOME', toEmail, subject, status: 'DELIVERED', result, html: htmlContent });
    return { sent: true, result, html: htmlContent };
  } catch (error) {
    console.warn('[I-ITSM Email] Welcome dispatch failed:', error);
    recordDispatch({ type: 'WELCOME', toEmail, subject, status: 'FAILED', error: error?.text || error?.message, html: htmlContent });
    return { sent: false, error, html: htmlContent };
  }
}

/**
 * 4. Ticket Created / Logged Notification (template_y8gkreo)
 */
export async function sendTicketCreatedEmail({ toEmail, userName = 'User', ticketId = 'INC-NEW', title = 'Issue Reported', priority = 'MEDIUM', assignedTo = 'Automatic Assignment Pool' }) {
  const templateId = EMAILJS_TEMPLATE_TICKET_CREATED;
  const ticketUrl = `https://bphc-it-helpdesk.web.app/?app=console&tab=incidents`;
  const htmlContent = generateTicketCreatedHtml({ ticketId, recipientName: userName, ticketTitle: title, ticketPriority: priority, assignedTechnician: assignedTo, ticketUrl });
  const subject = `[I-ITSM Ticket Logged] #${ticketId} - ${title}`;
  const plainText = `Ticket #${ticketId} has been logged.\nSubject: ${title}\nPriority: ${priority}\nAssigned to: ${assignedTo}\nTrack here: ${ticketUrl}`;

  const templateParams = {
    to_name: userName,
    name: userName,
    to_email: toEmail,
    recipient_email: toEmail,
    email: toEmail,
    user_email: toEmail,
    subject: subject,
    message_html: htmlContent,
    html: htmlContent,
    html_body: htmlContent,
    content: htmlContent,
    message: plainText,
    ticket_id: ticketId,
    id: ticketId,
    ticket_title: title,
    title: title,
    ticket_priority: priority,
    priority: priority,
    assigned_technician: assignedTo,
    technician: assignedTo,
    ticket_url: ticketUrl,
    url: ticketUrl,
  };

  try {
    console.log('[I-ITSM Email] Dispatching Ticket Created Email to:', toEmail);
    const result = await emailjs.send(EMAILJS_SERVICE_ID, templateId, templateParams, EMAILJS_PUBLIC_KEY);
    recordDispatch({ type: 'TICKET_CREATED', toEmail, subject, status: 'DELIVERED', result, html: htmlContent });
    return { sent: true, result, html: htmlContent };
  } catch (error) {
    console.warn('[I-ITSM Email] Ticket creation dispatch failed:', error);
    recordDispatch({ type: 'TICKET_CREATED', toEmail, subject, status: 'FAILED', error: error?.text || error?.message, html: htmlContent });
    return { sent: false, error, html: htmlContent };
  }
}

/**
 * 5. Ticket Progress / Status Transition Notification (template_y8gkreo)
 */
export async function sendTicketProgressEmail({ toEmail, userName = 'User', ticketId = 'INC-001', title = 'Incident', previousStatus = 'ASSIGNED', currentStatus = 'IN_PROGRESS', technicianName = 'IT Specialist', statusNote = 'Diagnostics underway on site.' }) {
  const templateId = EMAILJS_TEMPLATE_TICKET_PROGRESS;
  const ticketUrl = `https://bphc-it-helpdesk.web.app/?app=console&tab=incidents`;
  const htmlContent = generateTicketProgressHtml({ ticketId, recipientName: userName, ticketTitle: title, previousStatus, currentStatus, technicianName, statusNote, ticketUrl });
  const subject = `[I-ITSM Update] #${ticketId} Status Changed to ${currentStatus}`;
  const plainText = `Ticket #${ticketId} Update:\nSubject: ${title}\nStatus: ${previousStatus} -> ${currentStatus}\nSpecialist: ${technicianName}\nNote: ${statusNote}\nView: ${ticketUrl}`;

  const templateParams = {
    to_name: userName,
    name: userName,
    to_email: toEmail,
    recipient_email: toEmail,
    email: toEmail,
    user_email: toEmail,
    subject: subject,
    message_html: htmlContent,
    html: htmlContent,
    html_body: htmlContent,
    content: htmlContent,
    message: plainText,
    ticket_id: ticketId,
    id: ticketId,
    ticket_title: title,
    title: title,
    previous_status: previousStatus,
    current_status: currentStatus,
    technician_name: technicianName,
    assigned_technician: technicianName,
    status_note: statusNote,
    ticket_url: ticketUrl,
    url: ticketUrl,
  };

  try {
    console.log('[I-ITSM Email] Dispatching Ticket Progress Email to:', toEmail);
    const result = await emailjs.send(EMAILJS_SERVICE_ID, templateId, templateParams, EMAILJS_PUBLIC_KEY);
    recordDispatch({ type: 'TICKET_PROGRESS', toEmail, subject, status: 'DELIVERED', result, html: htmlContent });
    return { sent: true, result, html: htmlContent };
  } catch (error) {
    console.warn('[I-ITSM Email] Ticket progress dispatch failed:', error);
    recordDispatch({ type: 'TICKET_PROGRESS', toEmail, subject, status: 'FAILED', error: error?.text || error?.message, html: htmlContent });
    return { sent: false, error, html: htmlContent };
  }
}

/**
 * 6. Ticket Resolved Notification (template_y8gkreo)
 */
export async function sendTicketResolvedEmail({ toEmail, userName = 'User', ticketId = 'INC-001', title = 'Issue', technicianName = 'IT Specialist', resolutionNotes = 'Verified operational.', rootCause = 'Component serviced.' }) {
  const templateId = EMAILJS_TEMPLATE_TICKET_RESOLVED;
  const ticketUrl = `https://bphc-it-helpdesk.web.app/?app=console&tab=incidents`;
  const htmlContent = generateTicketResolvedHtml({ ticketId, recipientName: userName, ticketTitle: title, technicianName, resolutionNotes, rootCause, ticketUrl });
  const subject = `[I-ITSM Resolved] #${ticketId} Has Been Fixed & Verified`;
  const plainText = `Ticket #${ticketId} has been RESOLVED.\nSubject: ${title}\nTechnician: ${technicianName}\nResolution: ${resolutionNotes}\nRoot Cause: ${rootCause}\nConfirm fix here: ${ticketUrl}`;

  const templateParams = {
    to_name: userName,
    name: userName,
    to_email: toEmail,
    recipient_email: toEmail,
    email: toEmail,
    user_email: toEmail,
    subject: subject,
    message_html: htmlContent,
    html: htmlContent,
    html_body: htmlContent,
    content: htmlContent,
    message: plainText,
    ticket_id: ticketId,
    id: ticketId,
    ticket_title: title,
    title: title,
    technician_name: technicianName,
    assigned_technician: technicianName,
    resolution_notes: resolutionNotes,
    root_cause: rootCause,
    ticket_url: ticketUrl,
    url: ticketUrl,
  };

  try {
    console.log('[I-ITSM Email] Dispatching Ticket Resolved Email to:', toEmail);
    const result = await emailjs.send(EMAILJS_SERVICE_ID, templateId, templateParams, EMAILJS_PUBLIC_KEY);
    recordDispatch({ type: 'TICKET_RESOLVED', toEmail, subject, status: 'DELIVERED', result, html: htmlContent });
    return { sent: true, result, html: htmlContent };
  } catch (error) {
    console.warn('[I-ITSM Email] Ticket resolved dispatch failed:', error);
    recordDispatch({ type: 'TICKET_RESOLVED', toEmail, subject, status: 'FAILED', error: error?.text || error?.message, html: htmlContent });
    return { sent: false, error, html: htmlContent };
  }
}

/**
 * 7. SLA Breach / Escalation Alert (template_y8gkreo)
 */
export async function sendSlaBreachEmail({ toEmail, userName = 'Operations', ticketId = 'INC-001', title = 'SLA Outage', priority = 'HIGH', deadline = 'Target Exceeded', escalationStatus = 'ESCALATED_TIER_2', slaType = 'Resolution' }) {
  const templateId = EMAILJS_TEMPLATE_SLA_BREACH;
  const ticketUrl = `https://bphc-it-helpdesk.web.app/?app=console&tab=incidents`;
  const htmlContent = generateSlaBreachHtml({ ticketId, ticketTitle: title, priority, deadline, escalationStatus, slaType, ticketUrl });
  const subject = `[I-ITSM URGENT] ${slaType.toUpperCase()} SLA Breach on #${ticketId}`;
  const plainText = `URGENT SLA BREACH on Ticket #${ticketId}!\nSubject: ${title}\nPriority: ${priority}\nDeadline: ${deadline}\nStatus: ${escalationStatus}\nExpedite here: ${ticketUrl}`;

  const templateParams = {
    to_name: userName,
    name: userName,
    to_email: toEmail,
    recipient_email: toEmail,
    email: toEmail,
    user_email: toEmail,
    subject: subject,
    message_html: htmlContent,
    html: htmlContent,
    html_body: htmlContent,
    content: htmlContent,
    message: plainText,
    ticket_id: ticketId,
    id: ticketId,
    ticket_title: title,
    title: title,
    priority: priority,
    ticket_priority: priority,
    deadline: deadline,
    escalation_status: escalationStatus,
    sla_type: slaType,
    ticket_url: ticketUrl,
    url: ticketUrl,
  };

  try {
    console.log('[I-ITSM Email] Dispatching SLA Breach Email to:', toEmail);
    const result = await emailjs.send(EMAILJS_SERVICE_ID, templateId, templateParams, EMAILJS_PUBLIC_KEY);
    recordDispatch({ type: 'SLA_BREACH', toEmail, subject, status: 'DELIVERED', result, html: htmlContent });
    return { sent: true, result, html: htmlContent };
  } catch (error) {
    console.warn('[I-ITSM Email] SLA breach dispatch failed:', error);
    recordDispatch({ type: 'SLA_BREACH', toEmail, subject, status: 'FAILED', error: error?.text || error?.message, html: htmlContent });
    return { sent: false, error, html: htmlContent };
  }
}
