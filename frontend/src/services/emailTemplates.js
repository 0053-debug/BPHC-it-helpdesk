/**
 * In-memory HTML Email Template Engine for BPHC I-ITSM.
 * Generates fully styled, responsive, inline-CSS email templates matching /templates/*.html
 */

export function generateWelcomeHtml({ recipientName = 'User', userEmail = '', userRole = 'Student / Employee', portalUrl = 'https://bphc-it-helpdesk.web.app' }) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome - BPHC IT HelpDesk</title>
</head>
<body style="margin:0;padding:24px;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f8fafc;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="580" border="0" cellspacing="0" cellpadding="0" style="background:#1e293b;border-radius:12px;overflow:hidden;border:1px solid #334155;">
          <tr>
            <td style="background:linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);padding:22px 28px;color:#ffffff;">
              <h1 style="margin:0;font-size:18px;font-weight:800;letter-spacing:-0.5px;">BPHC I-ITSM</h1>
              <p style="margin:3px 0 0;font-size:12px;color:#bfdbfe;">Campus IT Infrastructure & Service Management</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <h2 style="margin:0 0 8px;font-size:16px;color:#f8fafc;">Welcome, <span style="color:#f59e0b;">${recipientName}</span>!</h2>
              <p style="margin:0 0 16px;font-size:13px;color:#cbd5e1;line-height:1.6;">
                Your campus IT HelpDesk account is activated and ready. You can now lodge service requests, report hardware or network issues, and track resolutions.
              </p>
              <div style="background:#0f172a;border-radius:8px;padding:16px;margin-bottom:20px;border:1px solid #334155;">
                <p style="margin:0 0 8px;font-size:12px;color:#94a3b8;font-weight:600;text-transform:uppercase;">Account Profile:</p>
                <ul style="margin:0;padding-left:18px;font-size:13px;color:#cbd5e1;line-height:1.8;">
                  <li><strong>Registered Email:</strong> ${userEmail}</li>
                  <li><strong>Role:</strong> ${userRole}</li>
                  <li><strong>Campus Wi-Fi:</strong> BPHC-Student / BPHC-Staff</li>
                </ul>
              </div>
              <div style="text-align:center;margin:24px 0 12px;">
                <a href="${portalUrl}" style="background:#f59e0b;color:#0f172a;text-decoration:none;padding:11px 26px;border-radius:8px;font-size:13px;font-weight:700;display:inline-block;">
                  Open IT HelpDesk Portal &rarr;
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background:#0f172a;padding:14px 28px;border-top:1px solid #334155;font-size:11px;color:#64748b;text-align:center;">
              Computer Centre (CC) Lab 1 • BITS Pilani Hyderabad Campus
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function generateTicketCreatedHtml({ ticketId = 'INC-NEW', recipientName = 'User', ticketTitle = 'Campus IT Request', ticketPriority = 'MEDIUM', assignedTechnician = 'Automatic Assignment Pool', ticketUrl = 'https://bphc-it-helpdesk.web.app/?app=console&tab=incidents' }) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Ticket Logged - BPHC IT HelpDesk</title>
</head>
<body style="margin:0;padding:24px;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f8fafc;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="580" border="0" cellspacing="0" cellpadding="0" style="background:#1e293b;border-radius:12px;overflow:hidden;border:1px solid #334155;">
          <tr>
            <td style="background:linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);padding:22px 28px;color:#ffffff;">
              <table width="100%">
                <tr>
                  <td>
                    <h1 style="margin:0;font-size:18px;font-weight:800;letter-spacing:-0.5px;">BPHC I-ITSM</h1>
                    <p style="margin:3px 0 0;font-size:12px;color:#bfdbfe;">Campus Incident & Request Lifecycle</p>
                  </td>
                  <td align="right">
                    <span style="background:#1d4ed8;color:#ffffff;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:700;text-transform:uppercase;">CONFIRMATION</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <h2 style="margin:0 0 8px;font-size:16px;color:#f8fafc;">Ticket Logged: <span style="color:#38bdf8;">#${ticketId}</span></h2>
              <p style="margin:0 0 18px;font-size:13px;color:#94a3b8;line-height:1.5;">
                Hello <strong>${recipientName}</strong>, your IT service request has been received and prioritized by our automated dispatch system.
              </p>
              <div style="background:#0f172a;border-radius:8px;padding:16px;margin-bottom:20px;border:1px solid #334155;">
                <table width="100%" style="font-size:13px;color:#cbd5e1;border-collapse:collapse;">
                  <tr style="border-bottom:1px solid #1e293b;">
                    <td style="padding:7px 0;color:#94a3b8;width:35%;">Subject:</td>
                    <td style="padding:7px 0;font-weight:600;color:#f8fafc;">${ticketTitle}</td>
                  </tr>
                  <tr style="border-bottom:1px solid #1e293b;">
                    <td style="padding:7px 0;color:#94a3b8;">Priority:</td>
                    <td style="padding:7px 0;font-weight:700;color:#f59e0b;">${ticketPriority}</td>
                  </tr>
                  <tr>
                    <td style="padding:7px 0;color:#94a3b8;">Assigned Specialist:</td>
                    <td style="padding:7px 0;font-weight:600;color:#10b981;">${assignedTechnician}</td>
                  </tr>
                </table>
              </div>
              <div style="text-align:center;margin:24px 0 12px;">
                <a href="${ticketUrl}" style="background:#38bdf8;color:#0f172a;text-decoration:none;padding:11px 26px;border-radius:8px;font-size:13px;font-weight:700;display:inline-block;">
                  Track Ticket Progress &rarr;
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background:#0f172a;padding:14px 28px;border-top:1px solid #334155;font-size:11px;color:#64748b;text-align:center;">
              Computer Centre (CC) Lab 1 • Extension #4055
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function generateTicketProgressHtml({ ticketId = 'INC-STATUS', recipientName = 'User', ticketTitle = 'Incident in Progress', previousStatus = 'ASSIGNED', currentStatus = 'IN_PROGRESS', technicianName = 'Field Specialist', statusNote = 'Diagnostics underway on site.', ticketUrl = 'https://bphc-it-helpdesk.web.app/?app=console&tab=incidents' }) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Ticket Progress Update - BPHC IT HelpDesk</title>
</head>
<body style="margin:0;padding:24px;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f8fafc;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="580" border="0" cellspacing="0" cellpadding="0" style="background:#1e293b;border-radius:12px;overflow:hidden;border:1px solid #334155;">
          <tr>
            <td style="background:linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);padding:22px 28px;color:#ffffff;">
              <table width="100%">
                <tr>
                  <td>
                    <h1 style="margin:0;font-size:18px;font-weight:800;letter-spacing:-0.5px;">BPHC I-ITSM</h1>
                    <p style="margin:3px 0 0;font-size:12px;color:#bfdbfe;">Campus Incident & Request Lifecycle</p>
                  </td>
                  <td align="right">
                    <span style="background:#1d4ed8;color:#ffffff;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:700;text-transform:uppercase;">STATUS UPDATE</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <h2 style="margin:0 0 8px;font-size:16px;color:#f8fafc;">Progress on Ticket <span style="color:#38bdf8;">#${ticketId}</span></h2>
              <p style="margin:0 0 18px;font-size:13px;color:#94a3b8;line-height:1.5;">
                Hello <strong>${recipientName}</strong>, your request has progressed to the next operational phase:
              </p>
              <div style="background:#0f172a;border-radius:8px;padding:16px;margin-bottom:20px;border:1px solid #334155;">
                <p style="margin:0 0 10px;font-size:12px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Status Transition</p>
                <div style="font-size:14px;font-weight:700;display:flex;align-items:center;gap:8px;margin-bottom:14px;">
                  <span style="background:#334155;color:#94a3b8;padding:4px 10px;border-radius:4px;">${previousStatus}</span>
                  <span style="color:#64748b;">&rarr;</span>
                  <span style="background:#0284c7;color:#ffffff;padding:4px 10px;border-radius:4px;">${currentStatus}</span>
                </div>
                <table width="100%" style="font-size:13px;color:#cbd5e1;border-collapse:collapse;margin-top:12px;border-top:1px solid #1e293b;padding-top:10px;">
                  <tr>
                    <td style="padding:6px 0;color:#94a3b8;width:35%;">Subject:</td>
                    <td style="padding:6px 0;font-weight:600;color:#f8fafc;">${ticketTitle}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#94a3b8;">Technician:</td>
                    <td style="padding:6px 0;font-weight:600;color:#38bdf8;">${technicianName}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#94a3b8;">Status Note:</td>
                    <td style="padding:6px 0;color:#cbd5e1;">${statusNote}</td>
                  </tr>
                </table>
              </div>
              <div style="text-align:center;margin:24px 0 12px;">
                <a href="${ticketUrl}" style="background:#38bdf8;color:#0f172a;text-decoration:none;padding:11px 26px;border-radius:8px;font-size:13px;font-weight:700;display:inline-block;">
                  View Live Progress &rarr;
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background:#0f172a;padding:14px 28px;border-top:1px solid #334155;font-size:11px;color:#64748b;text-align:center;">
              Need to add more information? Reply directly on the ticket page.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function generateTicketResolvedHtml({ ticketId = 'INC-RESOLVED', recipientName = 'User', ticketTitle = 'Resolved Issue', technicianName = 'IT Specialist', resolutionNotes = 'Hardware unit replaced and service tests passed.', rootCause = 'Component degradation from power fluctuation.', ticketUrl = 'https://bphc-it-helpdesk.web.app/?app=console&tab=incidents' }) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Ticket Resolved - BPHC IT HelpDesk</title>
</head>
<body style="margin:0;padding:24px;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f8fafc;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="580" border="0" cellspacing="0" cellpadding="0" style="background:#1e293b;border-radius:12px;overflow:hidden;border:1px solid #334155;">
          <tr>
            <td style="background:linear-gradient(135deg, #065f46 0%, #059669 100%);padding:22px 28px;color:#ffffff;">
              <table width="100%">
                <tr>
                  <td>
                    <h1 style="margin:0;font-size:18px;font-weight:800;letter-spacing:-0.5px;">BPHC I-ITSM</h1>
                    <p style="margin:3px 0 0;font-size:12px;color:#a7f3d0;">Issue Resolved & Verified</p>
                  </td>
                  <td align="right">
                    <span style="background:#047857;color:#ffffff;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:700;text-transform:uppercase;">RESOLVED</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <h2 style="margin:0 0 8px;font-size:16px;color:#f8fafc;">Ticket <span style="color:#10b981;">#${ticketId}</span> Has Been Resolved</h2>
              <p style="margin:0 0 18px;font-size:13px;color:#94a3b8;line-height:1.5;">
                Hello <strong>${recipientName}</strong>, the assigned technician has marked your ticket as resolved. Please review the resolution details below:
              </p>
              <div style="background:#0f172a;border-radius:8px;padding:16px;margin-bottom:20px;border:1px solid #334155;">
                <table width="100%" style="font-size:13px;color:#cbd5e1;border-collapse:collapse;">
                  <tr style="border-bottom:1px solid #1e293b;">
                    <td style="padding:7px 0;color:#94a3b8;width:35%;">Issue:</td>
                    <td style="padding:7px 0;font-weight:600;color:#f8fafc;">${ticketTitle}</td>
                  </tr>
                  <tr style="border-bottom:1px solid #1e293b;">
                    <td style="padding:7px 0;color:#94a3b8;">Technician:</td>
                    <td style="padding:7px 0;font-weight:600;color:#38bdf8;">${technicianName}</td>
                  </tr>
                  <tr style="border-bottom:1px solid #1e293b;">
                    <td style="padding:7px 0;color:#94a3b8;">Resolution Notes:</td>
                    <td style="padding:7px 0;color:#e2e8f0;">${resolutionNotes}</td>
                  </tr>
                  <tr>
                    <td style="padding:7px 0;color:#94a3b8;">Root Cause:</td>
                    <td style="padding:7px 0;color:#94a3b8;">${rootCause}</td>
                  </tr>
                </table>
              </div>
              <div style="text-align:center;margin:24px 0 12px;">
                <a href="${ticketUrl}" style="background:#10b981;color:#ffffff;text-decoration:none;padding:11px 26px;border-radius:8px;font-size:13px;font-weight:700;display:inline-block;">
                  Confirm Fix & Close Ticket &rarr;
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background:#0f172a;padding:14px 28px;border-top:1px solid #334155;font-size:11px;color:#64748b;text-align:center;">
              If your issue persists, you can reopen this ticket directly from the portal within 48 hours.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function generateSlaBreachHtml({ ticketId = 'INC-SLA', ticketTitle = 'Priority Incident', priority = 'HIGH', deadline = 'Within 30 mins', escalationStatus = 'ESCALATED_TIER_2', slaType = 'Resolution', ticketUrl = 'https://bphc-it-helpdesk.web.app/?app=console&tab=incidents' }) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>SLA Alert - BPHC IT HelpDesk</title>
</head>
<body style="margin:0;padding:24px;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f8fafc;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="580" border="0" cellspacing="0" cellpadding="0" style="background:#1e293b;border-radius:12px;overflow:hidden;border:1px solid #334155;">
          <tr>
            <td style="background:linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%);padding:22px 28px;color:#ffffff;">
              <table width="100%">
                <tr>
                  <td>
                    <h1 style="margin:0;font-size:18px;font-weight:800;letter-spacing:-0.5px;">BPHC I-ITSM</h1>
                    <p style="margin:3px 0 0;font-size:12px;color:#fecaca;">Service Level Agreement (SLA) Escalation</p>
                  </td>
                  <td align="right">
                    <span style="background:#991b1b;color:#fef2f2;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:700;text-transform:uppercase;">${slaType} BREACH</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <h2 style="margin:0 0 8px;font-size:16px;color:#f8fafc;">SLA Target Breached on Ticket <span style="color:#ef4444;">#${ticketId}</span></h2>
              <p style="margin:0 0 18px;font-size:13px;color:#94a3b8;line-height:1.5;">
                An automated service alert has triggered because the service commitment target for this request was exceeded.
              </p>
              <div style="background:#0f172a;border-radius:8px;padding:16px;margin-bottom:20px;border:1px solid #334155;">
                <table width="100%" style="font-size:13px;color:#cbd5e1;border-collapse:collapse;">
                  <tr style="border-bottom:1px solid #1e293b;">
                    <td style="padding:7px 0;color:#94a3b8;width:35%;">Ticket Subject:</td>
                    <td style="padding:7px 0;font-weight:600;color:#f8fafc;">${ticketTitle}</td>
                  </tr>
                  <tr style="border-bottom:1px solid #1e293b;">
                    <td style="padding:7px 0;color:#94a3b8;">Priority Tier:</td>
                    <td style="padding:7px 0;font-weight:700;color:#f59e0b;">${priority}</td>
                  </tr>
                  <tr style="border-bottom:1px solid #1e293b;">
                    <td style="padding:7px 0;color:#94a3b8;">Target Deadline:</td>
                    <td style="padding:7px 0;font-weight:600;color:#f87171;">${deadline}</td>
                  </tr>
                  <tr>
                    <td style="padding:7px 0;color:#94a3b8;">Escalation Status:</td>
                    <td style="padding:7px 0;font-weight:600;color:#ef4444;">${escalationStatus}</td>
                  </tr>
                </table>
              </div>
              <div style="text-align:center;margin:24px 0 12px;">
                <a href="${ticketUrl}" style="background:#ef4444;color:#ffffff;text-decoration:none;padding:11px 26px;border-radius:8px;font-size:13px;font-weight:700;display:inline-block;">
                  View & Expedite Ticket &rarr;
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background:#0f172a;padding:14px 28px;border-top:1px solid #334155;font-size:11px;color:#64748b;text-align:center;">
              BITS Pilani Hyderabad Campus • Internal IT Support Operations
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function generatePasswordResetRequestHtml({ recipientName = 'User', resetLink = 'https://bphc-it-helpdesk.web.app', validMinutes = 15 }) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset Your Password - BPHC IT HelpDesk</title>
</head>
<body style="margin:0;padding:24px;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f8fafc;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="580" border="0" cellspacing="0" cellpadding="0" style="background:#1e293b;border-radius:12px;overflow:hidden;border:1px solid #334155;">
          <tr>
            <td style="background:linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);padding:22px 28px;color:#ffffff;">
              <h1 style="margin:0;font-size:18px;font-weight:800;letter-spacing:-0.5px;">BPHC I-ITSM</h1>
              <p style="margin:3px 0 0;font-size:12px;color:#bfdbfe;">Campus IT Security & Authentication</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <h2 style="margin:0 0 8px;font-size:16px;color:#f8fafc;">Password Reset Request</h2>
              <p style="margin:0 0 16px;font-size:13px;color:#cbd5e1;line-height:1.6;">
                Hello <strong>${recipientName}</strong>, we received a request to reset your password. Click the secure link below to proceed:
              </p>
              <div style="text-align:center;margin:24px 0;">
                <a href="${resetLink}" style="background:#38bdf8;color:#0f172a;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:700;display:inline-block;">
                  Reset Password Now &rarr;
                </a>
              </div>
              <p style="margin:0 0 8px;font-size:12px;color:#94a3b8;line-height:1.5;">
                This link is valid for <strong>${validMinutes} minutes</strong> and can only be used once. If you did not request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#0f172a;padding:14px 28px;border-top:1px solid #334155;font-size:11px;color:#64748b;text-align:center;">
              Computer Centre (CC) Lab 1 • BITS Pilani Hyderabad Campus
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function generatePasswordUpdatedHtml({ recipientName = 'User', userEmail = '', changeTime = new Date().toLocaleString() }) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Password Updated - BPHC IT HelpDesk</title>
</head>
<body style="margin:0;padding:24px;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f8fafc;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table width="580" border="0" cellspacing="0" cellpadding="0" style="background:#1e293b;border-radius:12px;overflow:hidden;border:1px solid #334155;">
          <tr>
            <td style="background:linear-gradient(135deg, #065f46 0%, #059669 100%);padding:22px 28px;color:#ffffff;">
              <h1 style="margin:0;font-size:18px;font-weight:800;letter-spacing:-0.5px;">BPHC I-ITSM</h1>
              <p style="margin:3px 0 0;font-size:12px;color:#a7f3d0;">Security Alert: Credential Modification</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <h2 style="margin:0 0 8px;font-size:16px;color:#f8fafc;">Your Password Was Updated</h2>
              <p style="margin:0 0 16px;font-size:13px;color:#cbd5e1;line-height:1.6;">
                Hello <strong>${recipientName}</strong>, the password for your account (<strong>${userEmail}</strong>) was successfully changed on <strong>${changeTime}</strong>.
              </p>
              <div style="background:#0f172a;border-radius:8px;padding:14px;margin-bottom:18px;border:1px solid #334155;font-size:13px;color:#cbd5e1;">
                Your account is now secured with your new password. You can now use it to sign in across all devices.
              </div>
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5;">
                If you did not perform this action, please contact the campus Computer Centre (CC) immediately.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#0f172a;padding:14px 28px;border-top:1px solid #334155;font-size:11px;color:#64748b;text-align:center;">
              Computer Centre (CC) Lab 1 • BITS Pilani Hyderabad Campus
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
