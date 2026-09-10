import nodemailer, { type Transporter } from 'nodemailer'

interface MailOptions {
  to: string
  subject: string
  html: string
}

let transporter: Transporter | null = null

function getTransporter() {
  if (!transporter) {
    const host = process.env.SMTP_HOST
    const port = Number(process.env.SMTP_PORT) || 587
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS

    if (host && user && pass) {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      })
    } else {
      // Development mock transport that logs emails
      transporter = nodemailer.createTransport({
        jsonTransport: true,
      })
    }
  }
  return transporter
}

function getEmailWrapper(title: string, content: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body { margin: 0; padding: 0; background-color: #f7f4ee; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1c1c1a; }
        .container { max-width: 580px; margin: 30px auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e8e2d8; }
        .header { background-color: #94442a; padding: 24px 32px; text-align: center; }
        .header-logo { color: #fbf8f3; font-size: 20px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; margin: 0; }
        .header-sub { color: #e8a38a; font-size: 10px; font-weight: 600; letter-spacing: 0.25em; text-transform: uppercase; margin-top: 4px; }
        .content { padding: 36px 32px; line-height: 1.6; font-size: 14px; }
        .footer { padding: 24px 32px; text-align: center; font-size: 11px; color: #88847c; border-top: 1px solid #f0eae1; background-color: #fbf9f4; }
        .otp-box { background-color: #f6eee3; border: 1px dashed #c47c5d; border-radius: 14px; padding: 18px; text-align: center; margin: 24px 0; font-family: 'Courier New', monospace; font-size: 32px; font-weight: 700; letter-spacing: 0.3em; color: #94442a; }
        .btn { display: inline-block; background-color: #1d2720; color: #ffffff !important; padding: 12px 28px; border-radius: 9999px; text-decoration: none; font-size: 13px; font-weight: 600; margin-top: 16px; }
        .card { background-color: #fbf9f4; border: 1px solid #ede5d8; border-radius: 12px; padding: 16px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <p class="header-logo">🌿 SHOPIZZ</p>
          <p class="header-sub">Editorial Marketplace</p>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p style="margin: 0;">Shopizz Marketplace • Curated Independent Studios & Conscious Goods</p>
          <p style="margin: 4px 0 0 0;">If you did not request this email, you can safely disregard it.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export async function sendEmail({ to, subject, html }: MailOptions) {
  const from = process.env.SMTP_FROM || '"Shopizz Marketplace" <no-reply@shopizz.market>'
  const transport = getTransporter()

  try {
    const info = await transport.sendMail({
      from,
      to,
      subject,
      html,
    })

    console.log(`[Mailer] Sent email to: ${to} | Subject: ${subject}`)
    return { success: true, info }
  } catch (err: any) {
    console.error(`[Mailer Error] Failed to send email to ${to}:`, err)
    return { success: false, error: err.message }
  }
}

// 1. Send 6-Digit OTP Email for Signup Verification
export async function sendOtpEmail(to: string, name: string, otp: string) {
  const subject = `${otp} is your Shopizz verification code`
  const content = `
    <h2 style="font-size: 20px; font-weight: 600; color: #1c1c1a; margin-top: 0;">Verify your email address</h2>
    <p>Hi ${name || 'there'},</p>
    <p>Thank you for creating an account on <strong>Shopizz</strong>. Please enter the 6-digit verification code below to confirm your email and complete your registration:</p>
    
    <div class="otp-box">${otp}</div>
    
    <p style="font-size: 12px; color: #767267;">This code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
  `
  return await sendEmail({ to, subject, html: getEmailWrapper('Email Verification', content) })
}

// 2. Send Welcome Email
export async function sendWelcomeEmail(to: string, name: string) {
  const subject = `Welcome to Shopizz, ${name}!`
  const content = `
    <h2 style="font-size: 20px; font-weight: 600; color: #1c1c1a; margin-top: 0;">Welcome to the collective</h2>
    <p>Hi ${name},</p>
    <p>Your account is now verified and active. You can now discover distinctive pieces from independent shops, save curated favorites, and enjoy conscious commerce.</p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="http://localhost:3000/shop" class="btn">Explore Collection →</a>
    </div>
  `
  return await sendEmail({ to, subject, html: getEmailWrapper('Welcome to Shopizz', content) })
}

// 3. Send Owner Application Received Email (to Buyer)
export async function sendOwnerApplicationReceivedEmail(to: string, name: string, shopName: string) {
  const subject = `Application Received: ${shopName} on Shopizz`
  const content = `
    <h2 style="font-size: 20px; font-weight: 600; color: #1c1c1a; margin-top: 0;">Maker Application Under Review</h2>
    <p>Hi ${name},</p>
    <p>We've received your application to open <strong>${shopName}</strong> on Shopizz. Our curation team is reviewing your studio details.</p>
    
    <div class="card">
      <p style="margin: 0; font-size: 12px; color: #767267; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 600;">Submitted Studio</p>
      <p style="margin: 4px 0 0 0; font-size: 15px; font-weight: 600; color: #1c1c1a;">${shopName}</p>
      <p style="margin: 8px 0 0 0; font-size: 12px; color: #94442a; font-weight: 600;">Status: Pending Curation Review</p>
    </div>

    <p>You will receive an email as soon as our team has reviewed your application. Thank you for your patience!</p>
  `
  return await sendEmail({ to, subject, html: getEmailWrapper('Application Received', content) })
}

// 4. Send Alert Email to Admin on New Application
export async function sendAdminNewApplicationEmail(adminEmail: string, shopName: string, applicantName: string) {
  const subject = `[Action Required] New Maker Application: ${shopName}`
  const content = `
    <h2 style="font-size: 20px; font-weight: 600; color: #1c1c1a; margin-top: 0;">New Owner Application Submitted</h2>
    <p>A new shop owner application has been submitted by <strong>${applicantName}</strong> for studio <strong>${shopName}</strong>.</p>
    
    <div class="card">
      <p style="margin: 0; font-weight: 600;">Studio: ${shopName}</p>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #767267;">Applicant: ${applicantName}</p>
    </div>

    <div style="text-align: center; margin: 24px 0;">
      <a href="http://localhost:3000/admin/requests" class="btn">Review Application in Admin →</a>
    </div>
  `
  return await sendEmail({ to: adminEmail, subject, html: getEmailWrapper('New Application Alert', content) })
}

// 5. Send Owner Approved Email
export async function sendOwnerApprovedEmail(to: string, name: string, shopName: string) {
  const subject = `Congratulations! ${shopName} is approved on Shopizz`
  const content = `
    <h2 style="font-size: 20px; font-weight: 600; color: #1c1c1a; margin-top: 0;">Your shop is approved! 🎉</h2>
    <p>Hi ${name},</p>
    <p>We are delighted to welcome <strong>${shopName}</strong> to the Shopizz maker collective. Your seller workspace is now active.</p>
    
    <div class="card">
      <p style="margin: 0; font-size: 13px; color: #2e6644; font-weight: 600;">✓ Application Approved</p>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #767267;">You can now list handcrafted pieces, track orders, and curate your studio narrative.</p>
    </div>

    <div style="text-align: center; margin: 24px 0;">
      <a href="http://localhost:3000/owner" class="btn">Open Owner Workspace →</a>
    </div>
  `
  return await sendEmail({ to, subject, html: getEmailWrapper('Application Approved', content) })
}

// 6. Send Owner Rejected Email
export async function sendOwnerRejectedEmail(to: string, name: string, shopName: string, reason: string) {
  const subject = `Update on your Shopizz application for ${shopName}`
  const content = `
    <h2 style="font-size: 20px; font-weight: 600; color: #1c1c1a; margin-top: 0;">Application Status Update</h2>
    <p>Hi ${name},</p>
    <p>Thank you for your interest in joining Shopizz with <strong>${shopName}</strong>. After careful review, our curation team cannot approve your application at this time.</p>
    
    <div class="card">
      <p style="margin: 0; font-size: 12px; color: #767267; text-transform: uppercase; font-weight: 600;">Feedback from Curators</p>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #1c1c1a; font-style: italic;">"${reason}"</p>
    </div>

    <p>You may update your studio portfolio and re-apply in the future. We wish you continued success with your craft.</p>
  `
  return await sendEmail({ to, subject, html: getEmailWrapper('Application Status Update', content) })
}

// 7. Send Product Published Notification Email
export async function sendProductPublishedEmail(to: string, name: string, productName: string, shopName: string) {
  const subject = `Piece Published: ${productName} is live`
  const content = `
    <h2 style="font-size: 20px; font-weight: 600; color: #1c1c1a; margin-top: 0;">Your piece is live on the marketplace</h2>
    <p>Hi ${name},</p>
    <p><strong>${productName}</strong> has been successfully published from <strong>${shopName}</strong> and is now discoverable by conscious shoppers worldwide.</p>
    
    <div style="text-align: center; margin: 24px 0;">
      <a href="http://localhost:3000/owner/products" class="btn">Manage Inventory →</a>
    </div>
  `
  return await sendEmail({ to, subject, html: getEmailWrapper('Product Published', content) })
}

// 8. Send Return Requested Email
export async function sendReturnRequestedEmail(
  to: string,
  name: string,
  returnNumber: string,
  orderNumber: string,
  reason: string,
  refundAmountRupees: number
) {
  const subject = `Return Request Received: #${returnNumber} (Order #${orderNumber})`
  const content = `
    <h2 style="font-size: 20px; font-weight: 600; color: #1c1c1a; margin-top: 0;">Return Request Received</h2>
    <p>Hi ${name},</p>
    <p>We have received your return request for <strong>Order #${orderNumber}</strong>. Our studio curation team is reviewing the details.</p>
    
    <div class="card">
      <p style="margin: 0; font-size: 11px; color: #767267; text-transform: uppercase; font-weight: 700; letter-spacing: 0.1em;">Return Summary</p>
      <p style="margin: 6px 0 0 0; font-size: 14px; color: #1c1c1a;"><strong>Return ID:</strong> ${returnNumber}</p>
      <p style="margin: 4px 0 0 0; font-size: 13px; color: #1c1c1a;"><strong>Reason:</strong> ${reason}</p>
      <p style="margin: 4px 0 0 0; font-size: 13px; color: #94442a; font-weight: 600;"><strong>Est. Refund Amount:</strong> ₹${refundAmountRupees.toLocaleString('en-IN')}</p>
    </div>

    <p style="font-size: 12px; color: #767267;">You will receive an update once the studio maker approves the return and pickup instructions.</p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="http://localhost:3000/account/orders" class="btn">Track Return Status →</a>
    </div>
  `
  return await sendEmail({ to, subject, html: getEmailWrapper('Return Request Received', content) })
}

// 9. Send Return Approved Email
export async function sendReturnApprovedEmail(
  to: string,
  name: string,
  returnNumber: string,
  orderNumber: string,
  pickupNotes?: string
) {
  const subject = `Return Approved: #${returnNumber} — Pickup Instructions`
  const content = `
    <h2 style="font-size: 20px; font-weight: 600; color: #1c1c1a; margin-top: 0;">Your Return Has Been Approved</h2>
    <p>Hi ${name},</p>
    <p>The maker studio has approved your return request <strong>#${returnNumber}</strong> for Order #${orderNumber}.</p>
    
    <div class="card" style="border-left: 4px solid #2e6644;">
      <p style="margin: 0; font-size: 12px; color: #2e6644; font-weight: 600;">✓ Return Instructions & Next Steps</p>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #1c1c1a;">${pickupNotes || 'Please package the piece in its original studio packaging. Our courier partner will contact you within 24–48 hours for doorstep pickup.'}</p>
    </div>

    <div style="text-align: center; margin: 24px 0;">
      <a href="http://localhost:3000/account/orders" class="btn">View Return Progress →</a>
    </div>
  `
  return await sendEmail({ to, subject, html: getEmailWrapper('Return Approved', content) })
}

// 10. Send Refund Processed Email
export async function sendRefundProcessedEmail(
  to: string,
  name: string,
  returnNumber: string,
  orderNumber: string,
  refundAmountRupees: number,
  transactionId?: string
) {
  const subject = `Refund Processed: ₹${refundAmountRupees.toLocaleString('en-IN')} for Return #${returnNumber}`
  const content = `
    <h2 style="font-size: 20px; font-weight: 600; color: #1c1c1a; margin-top: 0;">Refund Successfully Initiated</h2>
    <p>Hi ${name},</p>
    <p>The studio maker has inspected the returned piece and approved the full refund.</p>
    
    <div class="card" style="background-color: #ebf3ee; border-color: #c7dfd0;">
      <p style="margin: 0; font-size: 11px; color: #2e6644; text-transform: uppercase; font-weight: 700; letter-spacing: 0.1em;">Refund Receipt</p>
      <p style="margin: 8px 0 0 0; font-size: 24px; color: #1c1c1a; font-weight: 700;">₹${refundAmountRupees.toLocaleString('en-IN')}</p>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #4a453e;">Reference ID: <strong>${transactionId || 'REF-' + Date.now().toString().slice(-6)}</strong></p>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #4a453e;">Order: <strong>#${orderNumber}</strong> | Return: <strong>#${returnNumber}</strong></p>
    </div>

    <p style="font-size: 12px; color: #767267;">The amount should reflect in your bank account / original payment source within 3–5 business days.</p>
  `
  return await sendEmail({ to, subject, html: getEmailWrapper('Refund Processed', content) })
}

// 11. Send Return Rejected Email
export async function sendReturnRejectedEmail(
  to: string,
  name: string,
  returnNumber: string,
  orderNumber: string,
  rejectionReason: string
) {
  const subject = `Update on Return Request #${returnNumber}`
  const content = `
    <h2 style="font-size: 20px; font-weight: 600; color: #1c1c1a; margin-top: 0;">Return Request Update</h2>
    <p>Hi ${name},</p>
    <p>Regarding your return request <strong>#${returnNumber}</strong> for Order #${orderNumber}, the studio maker was unable to accept the return.</p>
    
    <div class="card">
      <p style="margin: 0; font-size: 12px; color: #767267; text-transform: uppercase; font-weight: 600;">Reason for Non-Approval</p>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #1c1c1a; font-style: italic;">"${rejectionReason || 'Item does not meet the 7-day return condition.'}"</p>
    </div>

    <p style="font-size: 12px; color: #767267;">If you believe this is in error, please reply to this email or reach out to our concierge support team.</p>
  `
  return await sendEmail({ to, subject, html: getEmailWrapper('Return Request Update', content) })
}

// 12. Send Order Confirmed & Paid Email
export async function sendOrderConfirmedEmail(
  to: string,
  name: string,
  orderNumber: string,
  totalAmountRupees: number,
  itemCount: number,
  shippingCity: string
) {
  const subject = `Order Confirmed: #${orderNumber} — Thank you for supporting independent craft`
  const content = `
    <h2 style="font-size: 20px; font-weight: 600; color: #1c1c1a; margin-top: 0;">Your Order is Confirmed 🎉</h2>
    <p>Hi ${name},</p>
    <p>Thank you for your purchase. We have received your payment via <strong>Razorpay Secure Checkout</strong> and notified the artisan studios to begin preparing your pieces.</p>
    
    <div class="card" style="border-left: 4px solid #94442a;">
      <p style="margin: 0; font-size: 11px; color: #767267; text-transform: uppercase; font-weight: 700; letter-spacing: 0.1em;">Order Receipt</p>
      <p style="margin: 6px 0 0 0; font-size: 15px; color: #1c1c1a;"><strong>Order ID:</strong> #${orderNumber}</p>
      <p style="margin: 4px 0 0 0; font-size: 13px; color: #1c1c1a;"><strong>Items:</strong> ${itemCount} piece(s)</p>
      <p style="margin: 4px 0 0 0; font-size: 13px; color: #1c1c1a;"><strong>Delivery to:</strong> ${shippingCity}</p>
      <p style="margin: 8px 0 0 0; font-size: 18px; color: #94442a; font-weight: 700;">₹${totalAmountRupees.toLocaleString('en-IN')}</p>
    </div>

    <p style="font-size: 12px; color: #767267;">You can track shipping updates, courier tracking numbers, and studio fulfillment progress from your account dashboard.</p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="http://localhost:3000/account/orders" class="btn">View Order Details →</a>
    </div>
  `
  return await sendEmail({ to, subject, html: getEmailWrapper('Order Confirmed', content) })
}


