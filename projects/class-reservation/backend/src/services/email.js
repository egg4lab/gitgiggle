import { SendEmailCommand } from '@aws-sdk/client-ses';

const FROM_EMAIL = process.env.SES_FROM_EMAIL || 'coach@example.com';

export async function sendCancellationEmail(sesClient, session) {
  const params = {
    Source: FROM_EMAIL,
    Destination: {
      ToAddresses: [session.studentEmail],
    },
    Message: {
      Subject: {
        Data: 'Session Cancellation Notice',
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: generateCancellationEmailHtml(session),
          Charset: 'UTF-8',
        },
        Text: {
          Data: generateCancellationEmailText(session),
          Charset: 'UTF-8',
        },
      },
    },
  };

  try {
    const command = new SendEmailCommand(params);
    await sesClient.send(command);
    console.log('Cancellation email sent to:', session.studentEmail);
  } catch (error) {
    console.error('Error sending cancellation email:', error);
    throw error;
  }
}

export async function sendBookingConfirmationEmail(sesClient, session) {
  const params = {
    Source: FROM_EMAIL,
    Destination: {
      ToAddresses: [session.studentEmail],
    },
    Message: {
      Subject: {
        Data: 'Session Booking Confirmation',
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: generateConfirmationEmailHtml(session),
          Charset: 'UTF-8',
        },
        Text: {
          Data: generateConfirmationEmailText(session),
          Charset: 'UTF-8',
        },
      },
    },
  };

  try {
    const command = new SendEmailCommand(params);
    await sesClient.send(command);
    console.log('Confirmation email sent to:', session.studentEmail);
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    // Don't throw - booking should succeed even if email fails
  }
}

function generateCancellationEmailHtml(session) {
  const startTime = new Date(session.startTime).toLocaleString('zh-TW', {
    timeZone: 'Asia/Taipei',
    dateStyle: 'full',
    timeStyle: 'short',
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e74c3c; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 課程取消通知</h1>
          <p>Session Cancellation Notice</p>
        </div>
        <div class="content">
          <p>親愛的 ${session.studentName}，</p>
          <p>您的教練課程已被取消。</p>
          
          <div class="info-box">
            <h3>課程資訊 Session Details</h3>
            <p><strong>時間 Time:</strong> ${startTime}</p>
            <p><strong>地點 Location:</strong> ${session.location}</p>
            <p><strong>時長 Duration:</strong> 100 分鐘 / 100 minutes</p>
          </div>
          
          <p>如有任何問題，請隨時與我們聯繫。</p>
          <p>If you have any questions, please feel free to contact us.</p>
        </div>
        <div class="footer">
          <p>此為系統自動發送郵件，請勿直接回覆</p>
          <p>This is an automated email, please do not reply</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateCancellationEmailText(session) {
  const startTime = new Date(session.startTime).toLocaleString('zh-TW', {
    timeZone: 'Asia/Taipei',
  });

  return `
課程取消通知 / Session Cancellation Notice

親愛的 ${session.studentName}，

您的教練課程已被取消。

課程資訊 Session Details:
時間 Time: ${startTime}
地點 Location: ${session.location}
時長 Duration: 100 分鐘 / 100 minutes

如有任何問題，請隨時與我們聯繫。
If you have any questions, please feel free to contact us.

---
此為系統自動發送郵件，請勿直接回覆
This is an automated email, please do not reply
  `;
}

function generateConfirmationEmailHtml(session) {
  const startTime = new Date(session.startTime).toLocaleString('zh-TW', {
    timeZone: 'Asia/Taipei',
    dateStyle: 'full',
    timeStyle: 'short',
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #27ae60; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ 預約確認</h1>
          <p>Booking Confirmation</p>
        </div>
        <div class="content">
          <p>親愛的 ${session.studentName}，</p>
          <p>您的課程預約已確認！</p>
          
          <div class="info-box">
            <h3>課程資訊 Session Details</h3>
            <p><strong>時間 Time:</strong> ${startTime}</p>
            <p><strong>地點 Location:</strong> ${session.location}</p>
            <p><strong>時長 Duration:</strong> 100 分鐘 / 100 minutes</p>
          </div>
          
          <p><strong>提醒 Reminder:</strong></p>
          <ul>
            <li>如需取消，請至少提前 2 小時通知</li>
            <li>Cancellations require 2-hour advance notice</li>
          </ul>
        </div>
        <div class="footer">
          <p>期待見到您！Looking forward to seeing you!</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateConfirmationEmailText(session) {
  const startTime = new Date(session.startTime).toLocaleString('zh-TW', {
    timeZone: 'Asia/Taipei',
  });

  return `
預約確認 / Booking Confirmation

親愛的 ${session.studentName}，

您的課程預約已確認！

課程資訊 Session Details:
時間 Time: ${startTime}
地點 Location: ${session.location}
時長 Duration: 100 分鐘 / 100 minutes

提醒 Reminder:
- 如需取消，請至少提前 2 小時通知
- Cancellations require 2-hour advance notice

期待見到您！Looking forward to seeing you!
  `;
}
