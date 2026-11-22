/**
 * Green-API WhatsApp Background Notification Service
 * Sends automated WhatsApp alerts silently in the background on incident and auth lifecycle events.
 */

const GREEN_API_URL = 'https://7107.api.greenapi.com';
const ID_INSTANCE = '710722810067';
const API_TOKEN = 'aaa929a2de6c4288b62ac705f28741423cce6f1b73a340cd87';
export const DEFAULT_PHONE = '919082829190';

/**
 * Normalizes phone numbers to Green-API chatId format (e.g. 919082829190@c.us)
 */
export function formatChatId(phone) {
  if (!phone) return `${DEFAULT_PHONE}@c.us`;
  const clean = String(phone).replace(/\D/g, '');
  if (clean.length === 10) return `91${clean}@c.us`;
  if (clean.length >= 11) return `${clean}@c.us`;
  return `${DEFAULT_PHONE}@c.us`;
}

/**
 * Dispatches a raw text message via Green-API in the background.
 * Fire-and-forget: does not block the caller or UI.
 */
export async function sendWhatsAppMessage(phone, message) {
  const chatId = formatChatId(phone);
  const endpoint = `${GREEN_API_URL}/waInstance${ID_INSTANCE}/sendMessage/${API_TOKEN}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatId,
        message,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn('Green-API WhatsApp response status:', response.status, errText);
      return { success: false, error: errText };
    }

    const data = await response.json();
    console.info('Green-API WhatsApp dispatched successfully, messageId:', data.idMessage);
    return { success: true, messageId: data.idMessage };
  } catch (error) {
    console.warn('Background WhatsApp dispatch error:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 1. Welcome / Mobile Session Alert
 */
export function sendWelcomeWhatsApp({ toPhone, userName = 'Campus User' }) {
  const msg = [
    `👋 *Welcome to BPHC IT HelpDesk*`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `Hello *${userName}*, your campus mobile session has been connected!`,
    ``,
    `📱 *Real-time Alerts:* Enabled`,
    `🔔 You will receive automated WhatsApp alerts here whenever your support tickets are logged, assigned, updated, or resolved.`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `Portal: https://bphc-it-helpdesk.web.app`,
  ].join('\n');

  return sendWhatsAppMessage(toPhone, msg);
}

/**
 * 2. Ticket Created Alert
 */
export function sendTicketCreatedWhatsApp({
  toPhone,
  userName = 'User',
  ticketId,
  title,
  priority = 'P3_MEDIUM',
  assignedTo = 'Automatic Assignment Pool',
}) {
  const priorityEmoji = priority.startsWith('P1') ? '🔴' : priority.startsWith('P2') ? '🟠' : '🔵';
  const msg = [
    `🎫 *I-ITSM Incident Logged*`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `• *Ticket ID:* #${ticketId}`,
    `• *Subject:* ${title}`,
    `• *Priority:* ${priorityEmoji} ${priority}`,
    `• *Assigned Specialist:* ${assignedTo}`,
    `• *Status:* CLASSIFIED / ASSIGNED`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `Your request has been registered in the campus queue. You will receive real-time notifications here as work progresses.`,
    ``,
    `Track live: https://bphc-it-helpdesk.web.app`,
  ].join('\n');

  return sendWhatsAppMessage(toPhone, msg);
}

/**
 * 3. Ticket Progress Transition Alert
 */
export function sendTicketProgressWhatsApp({
  toPhone,
  userName = 'User',
  ticketId,
  title,
  previousStatus = 'ASSIGNED',
  currentStatus = 'IN_PROGRESS',
  statusNote = 'Technician started investigation',
  technicianName = 'Campus IT Specialist',
}) {
  const msg = [
    `🔄 *I-ITSM Ticket Update*`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `• *Ticket ID:* #${ticketId}`,
    `• *Subject:* ${title}`,
    `• *Transition:* ${previousStatus} ➔ *${currentStatus}*`,
    `• *Technician:* ${technicianName}`,
    `• *Note:* ${statusNote}`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `Live status updated on the portal.`,
    `Portal: https://bphc-it-helpdesk.web.app`,
  ].join('\n');

  return sendWhatsAppMessage(toPhone, msg);
}

/**
 * 4. Ticket Resolved Alert
 */
export function sendTicketResolvedWhatsApp({
  toPhone,
  userName = 'User',
  ticketId,
  title,
  resolutionNotes = 'Issue addressed by support technician.',
  rootCause = 'Operational resolution complete.',
}) {
  const msg = [
    `✅ *I-ITSM Incident Resolved*`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `• *Ticket ID:* #${ticketId}`,
    `• *Subject:* ${title}`,
    `• *Resolution:* ${resolutionNotes}`,
    rootCause ? `• *Root Cause:* ${rootCause}` : null,
    `• *Status:* RESOLVED`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `Please log in to the portal and confirm the fix to close your ticket:`,
    `https://bphc-it-helpdesk.web.app`,
  ].filter(Boolean).join('\n');

  return sendWhatsAppMessage(toPhone, msg);
}

/**
 * 5. Urgent SLA Breach Alert
 */
export function sendSlaBreachWhatsApp({
  toPhone,
  userName = 'Operational Lead',
  ticketId,
  title,
  priority = 'P1_CRITICAL',
  deadline = 'Target window exceeded',
}) {
  const msg = [
    `🚨 *URGENT: I-ITSM SLA Breach Alert*`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `• *Ticket ID:* #${ticketId}`,
    `• *Subject:* ${title}`,
    `• *Priority:* 🔴 ${priority}`,
    `• *Escalation:* TIER-2 ESCALATION`,
    `• *Target Window:* ${deadline}`,
    `• *Action Required:* Expedite resolution immediately`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `Portal: https://bphc-it-helpdesk.web.app`,
  ].join('\n');

  return sendWhatsAppMessage(toPhone, msg);
}
