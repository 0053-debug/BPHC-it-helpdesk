# BPHC I-ITSM Email Templates

This directory contains production-ready, beautifully styled HTML email templates for all key events across the BPHC IT HelpDesk platform.

---

## Template Catalog

| File | Event | Key Variables |
|---|---|---|
| [`ticket-created.html`](./ticket-created.html) | When a student or staff logs an incident/ticket | `{{ticket_id}}`, `{{ticket_title}}`, `{{ticket_priority}}`, `{{assigned_technician}}`, `{{recipient_name}}`, `{{ticket_url}}` |
| [`ticket-progress.html`](./ticket-progress.html) | When a technician updates status (Investigating, In Progress, etc.) | `{{ticket_id}}`, `{{ticket_title}}`, `{{previous_status}}`, `{{current_status}}`, `{{status_note}}`, `{{technician_name}}`, `{{recipient_name}}`, `{{ticket_url}}` |
| [`ticket-resolved.html`](./ticket-resolved.html) | When a technician resolves a ticket with root cause notes | `{{ticket_id}}`, `{{ticket_title}}`, `{{resolution_notes}}`, `{{root_cause}}`, `{{technician_name}}`, `{{recipient_name}}`, `{{ticket_url}}` |
| [`sla-breach.html`](./sla-breach.html) | When response or resolution SLA is in warning or breached | `{{ticket_id}}`, `{{ticket_title}}`, `{{sla_type}}`, `{{priority}}`, `{{deadline}}`, `{{escalation_status}}`, `{{ticket_url}}` |
| [`password-reset-request.html`](./password-reset-request.html) | When a user requests a password recovery link | `{{recipient_name}}`, `{{reset_link}}`, `{{expiry_minutes}}` |
| [`password-updated.html`](./password-updated.html) | Security alert confirming password has been changed | `{{recipient_name}}`, `{{change_time}}`, `{{support_contact}}` |
| [`welcome.html`](./welcome.html) | When a new user registers on the campus helpdesk | `{{recipient_name}}`, `{{user_email}}`, `{{user_role}}`, `{{portal_url}}` |

---

## How to Use with EmailJS

1. Open your **[EmailJS Dashboard](https://dashboard.emailjs.com/)** &rarr; **Email Templates**.
2. Click **Create New Template**.
3. Under the **Settings** tab:
   * **To Email**: `{{to_email}}` *(or `{{email}}`)*
   * **Subject**: `{{subject}}` *(or customize)*
4. Under the **Content** tab, switch to the code view (`<>`) and paste the contents of any template file above.
5. Click **Save** and note the generated **Template ID**.
