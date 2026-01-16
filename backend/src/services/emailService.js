import transporter, { emailConfig } from '../config/email.js';
import { format } from 'date-fns';

/**
 * Format date for email display
 */
const formatDateTime = (date, timezone) => {
  const d = new Date(date);
  return {
    date: format(d, 'EEEE, MMMM d, yyyy'),
    time: format(d, 'h:mm a'),
    timezone: timezone,
  };
};

/**
 * Generate email HTML template
 */
const generateEmailTemplate = (title, content, actionButton = null) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #f4f4f5;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">📅 Cal Clone</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px; color: #18181b; font-size: 20px; font-weight: 600;">${title}</h2>
              ${content}
              ${actionButton ? `
              <div style="margin-top: 30px; text-align: center;">
                <a href="${actionButton.url}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600;">${actionButton.text}</a>
              </div>
              ` : ''}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f4f4f5; padding: 20px 30px; text-align: center;">
              <p style="margin: 0; color: #71717a; font-size: 14px;">
                This email was sent by Cal Clone scheduling system.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

/**
 * Send booking confirmation email
 */
export const sendBookingConfirmation = async (booking) => {
  const { date, time, timezone } = formatDateTime(booking.startTime, booking.timezone);
  
  const content = `
    <p style="margin: 0 0 20px; color: #3f3f46; line-height: 1.6;">
      Your booking has been confirmed! Here are the details:
    </p>
    <div style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <table style="width: 100%;">
        <tr>
          <td style="padding: 8px 0; color: #71717a; width: 120px;">Event:</td>
          <td style="padding: 8px 0; color: #18181b; font-weight: 500;">${booking.eventType.title}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #71717a;">Date:</td>
          <td style="padding: 8px 0; color: #18181b; font-weight: 500;">${date}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #71717a;">Time:</td>
          <td style="padding: 8px 0; color: #18181b; font-weight: 500;">${time}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #71717a;">Duration:</td>
          <td style="padding: 8px 0; color: #18181b; font-weight: 500;">${booking.eventType.duration} minutes</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #71717a;">Timezone:</td>
          <td style="padding: 8px 0; color: #18181b; font-weight: 500;">${timezone}</td>
        </tr>
      </table>
    </div>
    <p style="margin: 20px 0 0; color: #3f3f46; line-height: 1.6;">
      Need to make changes? Contact us to reschedule or cancel.
    </p>
  `;

  const html = generateEmailTemplate('Booking Confirmed! ✅', content);

  await transporter.sendMail({
    from: emailConfig.from,
    to: booking.bookerEmail,
    subject: `Booking Confirmed: ${booking.eventType.title}`,
    html,
  });
};

/**
 * Send booking cancellation email
 */
export const sendBookingCancellation = async (booking) => {
  const { date, time, timezone } = formatDateTime(booking.startTime, booking.timezone);
  
  const content = `
    <p style="margin: 0 0 20px; color: #3f3f46; line-height: 1.6;">
      Your booking has been cancelled. Here were the details:
    </p>
    <div style="background-color: #fef2f2; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #ef4444;">
      <table style="width: 100%;">
        <tr>
          <td style="padding: 8px 0; color: #71717a; width: 120px;">Event:</td>
          <td style="padding: 8px 0; color: #18181b; font-weight: 500; text-decoration: line-through;">${booking.eventType.title}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #71717a;">Date:</td>
          <td style="padding: 8px 0; color: #18181b; font-weight: 500; text-decoration: line-through;">${date}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #71717a;">Time:</td>
          <td style="padding: 8px 0; color: #18181b; font-weight: 500; text-decoration: line-through;">${time}</td>
        </tr>
      </table>
    </div>
    ${booking.cancellationReason ? `
    <p style="margin: 20px 0 0; color: #3f3f46; line-height: 1.6;">
      <strong>Reason:</strong> ${booking.cancellationReason}
    </p>
    ` : ''}
    <p style="margin: 20px 0 0; color: #3f3f46; line-height: 1.6;">
      You can book a new appointment anytime.
    </p>
  `;

  const html = generateEmailTemplate('Booking Cancelled ❌', content, {
    text: 'Book New Appointment',
    url: `${emailConfig.frontendUrl}/book/${booking.eventType.slug}`,
  });

  await transporter.sendMail({
    from: emailConfig.from,
    to: booking.bookerEmail,
    subject: `Booking Cancelled: ${booking.eventType.title}`,
    html,
  });
};

/**
 * Send booking reschedule email
 */
export const sendBookingReschedule = async (newBooking, oldBooking) => {
  const oldDateTime = formatDateTime(oldBooking.startTime, oldBooking.timezone);
  const newDateTime = formatDateTime(newBooking.startTime, newBooking.timezone);
  
  const content = `
    <p style="margin: 0 0 20px; color: #3f3f46; line-height: 1.6;">
      Your booking has been rescheduled. Here are the updated details:
    </p>
    <div style="background-color: #fef3c7; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b;">
      <p style="margin: 0 0 10px; color: #92400e; font-weight: 600;">Previous Time (Cancelled)</p>
      <p style="margin: 0; color: #78716c; text-decoration: line-through;">
        ${oldDateTime.date} at ${oldDateTime.time}
      </p>
    </div>
    <div style="background-color: #d1fae5; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #10b981;">
      <p style="margin: 0 0 10px; color: #065f46; font-weight: 600;">New Time (Confirmed)</p>
      <table style="width: 100%;">
        <tr>
          <td style="padding: 8px 0; color: #71717a; width: 120px;">Event:</td>
          <td style="padding: 8px 0; color: #18181b; font-weight: 500;">${newBooking.eventType.title}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #71717a;">Date:</td>
          <td style="padding: 8px 0; color: #18181b; font-weight: 500;">${newDateTime.date}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #71717a;">Time:</td>
          <td style="padding: 8px 0; color: #18181b; font-weight: 500;">${newDateTime.time}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #71717a;">Timezone:</td>
          <td style="padding: 8px 0; color: #18181b; font-weight: 500;">${newDateTime.timezone}</td>
        </tr>
      </table>
    </div>
  `;

  const html = generateEmailTemplate('Booking Rescheduled 🔄', content);

  await transporter.sendMail({
    from: emailConfig.from,
    to: newBooking.bookerEmail,
    subject: `Booking Rescheduled: ${newBooking.eventType.title}`,
    html,
  });
};

export default { sendBookingConfirmation, sendBookingCancellation, sendBookingReschedule };
