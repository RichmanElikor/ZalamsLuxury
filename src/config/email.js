/* ================================
   ZALAMS LUXURY — EMAIL CONFIG
   src/config/email.js
================================ */

import nodemailer from 'nodemailer';

// --- Create transporter (reads env at send time) ---
function createTransporter() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}


// --- Send email helper ---
export async function sendEmail(mailOptions) {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent: ${info.messageId}`);
    return { success: true };
  } catch (error) {
    console.error(`❌ Email error: ${error.message}`);
    return { success: false, error: error.message };
  }
}


// ================================
// EMAIL TEMPLATES
// ================================

// --- Order Confirmation (to customer) ---
export function orderConfirmationEmail(order) {
  const itemsList = order.items.map(item => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #222;">
        ${item.name}
      </td>
      <td style="padding:10px;border-bottom:1px solid #222;text-align:center;">
        ${item.quantity}
      </td>
      <td style="padding:10px;border-bottom:1px solid #222;text-align:right;color:#c9a84c;">
        ₦${(item.price * item.quantity).toLocaleString('en-NG')}
      </td>
    </tr>
  `).join('');

  return {
    from: process.env.EMAIL_FROM,
    to: order.email,
    subject: `Order Confirmed — Zalams Luxury #${order._id.toString().slice(-8).toUpperCase()}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
        <div style="max-width:600px;margin:0 auto;background:#111111;">

          <!-- Header -->
          <div style="background:#0a0a0a;padding:32px;text-align:center;
            border-bottom:1px solid #222;">
            <h1 style="font-size:2rem;letter-spacing:0.12em;color:#ffffff;margin:0;">
              ZALAM<span style="color:#c9a84c;">S</span>
            </h1>
          </div>

          <!-- Body -->
          <div style="padding:40px 32px;">
            <h2 style="color:#ffffff;font-size:1.4rem;letter-spacing:0.06em;
              text-transform:uppercase;margin-bottom:8px;">
              Order Confirmed! ✅
            </h2>
            <p style="color:#888;font-size:0.9rem;line-height:1.7;margin-bottom:24px;">
              Hi ${order.customerName}, thank you for your order!
              We have received your payment and your items are being prepared.
            </p>

            <!-- Order ID -->
            <div style="background:#1a1a1a;border:1px solid #222;
              padding:16px;margin-bottom:24px;">
              <p style="color:#888;font-size:0.72rem;letter-spacing:0.15em;
                text-transform:uppercase;margin:0 0 4px;">
                Order ID
              </p>
              <p style="color:#c9a84c;font-size:1rem;font-weight:bold;margin:0;">
                #${order._id.toString().slice(-8).toUpperCase()}
              </p>
            </div>

            <!-- Items -->
            <h3 style="color:#ffffff;font-size:0.85rem;letter-spacing:0.15em;
              text-transform:uppercase;margin-bottom:16px;">
              Your Items
            </h3>
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
              <thead>
                <tr style="background:#1a1a1a;">
                  <th style="padding:10px;text-align:left;color:#888;
                    font-size:0.72rem;letter-spacing:0.1em;text-transform:uppercase;">
                    Product
                  </th>
                  <th style="padding:10px;text-align:center;color:#888;
                    font-size:0.72rem;letter-spacing:0.1em;text-transform:uppercase;">
                    Qty
                  </th>
                  <th style="padding:10px;text-align:right;color:#888;
                    font-size:0.72rem;letter-spacing:0.1em;text-transform:uppercase;">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
            </table>

            <!-- Total -->
            <div style="background:#1a1a1a;border:1px solid #222;padding:16px;
              margin-bottom:32px;">
              <table style="width:100%;">
                <tr>
                  <td>
                    <p style="color:#888;font-size:0.72rem;letter-spacing:0.1em;
                      text-transform:uppercase;margin:0 0 4px;">Delivery</p>
                    <p style="color:#ffffff;margin:0;">
                      ${order.deliveryFee === 0
                        ? 'FREE'
                        : '₦' + order.deliveryFee.toLocaleString('en-NG')}
                    </p>
                  </td>
                  <td style="text-align:right;">
                    <p style="color:#888;font-size:0.72rem;letter-spacing:0.1em;
                      text-transform:uppercase;margin:0 0 4px;">Total Paid</p>
                    <p style="color:#c9a84c;font-size:1.4rem;
                      font-weight:bold;margin:0;">
                      ₦${order.total.toLocaleString('en-NG')}
                    </p>
                  </td>
                </tr>
              </table>
            </div>

            <!-- What's next -->
            <h3 style="color:#ffffff;font-size:0.85rem;letter-spacing:0.15em;
              text-transform:uppercase;margin-bottom:16px;">
              What Happens Next?
            </h3>

            <table style="width:100%;margin-bottom:24px;">
              <tr>
                <td style="width:40px;vertical-align:top;padding-bottom:16px;">
                  <div style="width:28px;height:28px;background:#c9a84c;color:#000;
                    border-radius:50%;text-align:center;line-height:28px;
                    font-weight:bold;font-size:0.8rem;">1</div>
                </td>
                <td style="padding-bottom:16px;padding-left:8px;">
                  <p style="color:#ffffff;margin:0 0 4px;font-size:0.85rem;">
                    Order Processing
                  </p>
                  <p style="color:#888;margin:0;font-size:0.78rem;">
                    We are carefully packaging your items.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="width:40px;vertical-align:top;padding-bottom:16px;">
                  <div style="width:28px;height:28px;background:#c9a84c;color:#000;
                    border-radius:50%;text-align:center;line-height:28px;
                    font-weight:bold;font-size:0.8rem;">2</div>
                </td>
                <td style="padding-bottom:16px;padding-left:8px;">
                  <p style="color:#ffffff;margin:0 0 4px;font-size:0.85rem;">
                    Shipped
                  </p>
                  <p style="color:#888;margin:0;font-size:0.78rem;">
                    You will receive another email when your order ships.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="width:40px;vertical-align:top;">
                  <div style="width:28px;height:28px;background:#c9a84c;color:#000;
                    border-radius:50%;text-align:center;line-height:28px;
                    font-weight:bold;font-size:0.8rem;">3</div>
                </td>
                <td style="padding-left:8px;">
                  <p style="color:#ffffff;margin:0 0 4px;font-size:0.85rem;">
                    Delivered
                  </p>
                  <p style="color:#888;margin:0;font-size:0.78rem;">
                    Enjoy your Zalams piece!
                  </p>
                </td>
              </tr>
            </table>

          </div>

          <!-- Footer -->
          <div style="background:#0a0a0a;padding:24px 32px;text-align:center;
            border-top:1px solid #222;">
            <p style="color:#555;font-size:0.72rem;letter-spacing:0.05em;margin:0;">
              © 2026 Zalams Luxury · hello@zalams.com · +234 000 000 0000
            </p>
            <p style="color:#555;font-size:0.68rem;margin:8px 0 0;">
              If you have any questions reply to this email or visit our contact page.
            </p>
          </div>

        </div>
      </body>
      </html>
    `
  };
}


// --- New Order Alert (to admin) ---
export function newOrderAlertEmail(order) {
  return {
    from: process.env.EMAIL_FROM,
    to: process.env.ADMIN_EMAIL,
    subject: `🛍️ New Order — ₦${order.total.toLocaleString('en-NG')} from ${order.customerName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;
        margin:0 auto;background:#111;color:#fff;padding:32px;">

        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="font-size:2rem;letter-spacing:0.12em;
            color:#fff;margin:0;">
            ZALAM<span style="color:#c9a84c;">S</span>
          </h1>
        </div>

        <h2 style="color:#c9a84c;text-transform:uppercase;
          letter-spacing:0.08em;margin-bottom:8px;">
          New Order Received!
        </h2>
        <p style="color:#888;margin-bottom:24px;">
          A new order has been placed on Zalams Luxury.
        </p>

        <!-- Customer Info -->
        <div style="background:#1a1a1a;border:1px solid #333;
          padding:20px;margin-bottom:16px;">
          <p style="color:#c9a84c;font-size:0.72rem;
            letter-spacing:0.15em;text-transform:uppercase;
            margin:0 0 12px;">
            Customer Information
          </p>
          <table style="width:100%;">
            <tr>
              <td style="color:#888;padding:6px 0;font-size:0.82rem;">
                Name
              </td>
              <td style="color:#fff;padding:6px 0;font-size:0.82rem;
                text-align:right;font-weight:bold;">
                ${order.customerName}
              </td>
            </tr>
            <tr>
              <td style="color:#888;padding:6px 0;font-size:0.82rem;">
                Email
              </td>
              <td style="color:#c9a84c;padding:6px 0;font-size:0.82rem;
                text-align:right;">
                ${order.email}
              </td>
            </tr>
            <tr>
              <td style="color:#888;padding:6px 0;font-size:0.82rem;">
                Phone
              </td>
              <td style="color:#fff;padding:6px 0;font-size:0.82rem;
                text-align:right;">
                ${order.phone}
              </td>
            </tr>
            <tr>
              <td style="color:#888;padding:6px 0;font-size:0.82rem;">
                Delivery Address
              </td>
              <td style="color:#fff;padding:6px 0;font-size:0.82rem;
                text-align:right;">
                ${order.address?.street || 'TBD'},
                ${order.address?.city || ''},
                ${order.address?.state || ''}
              </td>
            </tr>
          </table>
        </div>

        <!-- Order Info -->
        <div style="background:#1a1a1a;border:1px solid #333;
          padding:20px;margin-bottom:16px;">
          <p style="color:#c9a84c;font-size:0.72rem;
            letter-spacing:0.15em;text-transform:uppercase;
            margin:0 0 12px;">
            Order Details
          </p>
          <table style="width:100%;">
            <tr>
              <td style="color:#888;padding:6px 0;font-size:0.82rem;">
                Order ID
              </td>
              <td style="color:#c9a84c;padding:6px 0;
                font-size:0.82rem;text-align:right;font-weight:bold;">
                #${order._id.toString().slice(-8).toUpperCase()}
              </td>
            </tr>
            <tr>
              <td style="color:#888;padding:6px 0;font-size:0.82rem;">
                Total
              </td>
              <td style="color:#c9a84c;padding:6px 0;
                font-size:1.1rem;text-align:right;font-weight:bold;">
                ₦${order.total.toLocaleString('en-NG')}
              </td>
            </tr>
            <tr>
              <td style="color:#888;padding:6px 0;font-size:0.82rem;">
                Payment
              </td>
              <td style="color:#fff;padding:6px 0;
                font-size:0.82rem;text-align:right;">
                ${order.paymentMethod} —
                <span style="color:${order.paymentStatus === 'paid'
                  ? '#4caf50' : 'orange'}">
                  ${order.paymentStatus.toUpperCase()}
                </span>
              </td>
            </tr>
          </table>
        </div>

        <!-- Items -->
        <div style="background:#1a1a1a;border:1px solid #333;
          padding:20px;margin-bottom:24px;">
          <p style="color:#c9a84c;font-size:0.72rem;
            letter-spacing:0.15em;text-transform:uppercase;
            margin:0 0 12px;">
            Items Ordered
          </p>
          ${order.items.map(item => `
            <div style="border-bottom:1px solid #222;padding:10px 0;
              display:flex;justify-content:space-between;">
              <div>
                <p style="color:#fff;margin:0;font-size:0.85rem;">
                  ${item.name}
                </p>
                <p style="color:#888;margin:4px 0 0;font-size:0.75rem;">
                  Qty: ${item.quantity}
                  ${item.size ? `· Size: ${item.size}` : ''}
                </p>
              </div>
              <p style="color:#c9a84c;margin:0;font-size:0.85rem;
                font-weight:bold;">
                ₦${(item.price * item.quantity).toLocaleString('en-NG')}
              </p>
            </div>
          `).join('')}
        </div>

        <a href="${process.env.FRONTEND_URL}/admin.html"
          style="display:inline-block;padding:12px 28px;
          background:#c9a84c;color:#000;font-weight:bold;
          text-decoration:none;text-transform:uppercase;
          letter-spacing:0.1em;font-size:0.82rem;">
          View in Admin Panel →
        </a>

      </div>
    `
  };
}


// --- Order Shipped (to customer) ---
export function orderShippedEmail(order) {
  return {
    from: process.env.EMAIL_FROM,
    to: order.email,
    subject: `Your Order Has Been Shipped — Zalams Luxury`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;
        background:#111;color:#fff;padding:32px;">

        <div style="text-align:center;margin-bottom:32px;">
          <h1 style="font-size:2rem;letter-spacing:0.12em;color:#fff;margin:0;">
            ZALAM<span style="color:#c9a84c;">S</span>
          </h1>
        </div>

        <h2 style="color:#ffffff;text-transform:uppercase;
          letter-spacing:0.06em;margin-bottom:8px;">
          Your Order Is On Its Way!
        </h2>
        <p style="color:#888;line-height:1.7;margin-bottom:24px;">
          Hi ${order.customerName}, great news! Your order
          #${order._id.toString().slice(-8).toUpperCase()}
          has been shipped and is on its way to you.
        </p>

        <div style="background:#1a1a1a;border:1px solid #222;
          padding:20px;margin-bottom:24px;">
          <p style="color:#888;font-size:0.72rem;letter-spacing:0.15em;
            text-transform:uppercase;margin:0 0 8px;">
            Estimated Delivery
          </p>
          <p style="color:#c9a84c;font-size:1rem;font-weight:bold;margin:0;">
            3 — 5 Business Days
          </p>
        </div>

        <p style="color:#888;font-size:0.85rem;line-height:1.7;">
          If you have any questions about your delivery please
          contact us at hello@zalams.com
        </p>

        <div style="margin-top:32px;padding-top:24px;
          border-top:1px solid #222;text-align:center;">
          <p style="color:#555;font-size:0.72rem;margin:0;">
            © 2026 Zalams Luxury
          </p>
        </div>

      </div>
    `
  };
}

export function orderDeliveredEmail(order) {
  return {
    from: process.env.EMAIL_FROM,
    to: order.email,
    subject: `Your Order Has Been Delivered — Zalams Luxury 🎉`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;
        margin:0 auto;background:#111;color:#fff;padding:32px;">

        <div style="text-align:center;margin-bottom:32px;">
          <h1 style="font-size:2rem;letter-spacing:0.12em;
            color:#fff;margin:0;">
            ZALAM<span style="color:#c9a84c;">S</span>
          </h1>
        </div>

        <h2 style="color:#4caf50;text-transform:uppercase;
          letter-spacing:0.06em;margin-bottom:8px;">
          Your Order Has Arrived! 🎉
        </h2>

        <p style="color:#888;line-height:1.8;margin-bottom:24px;">
          Hi ${order.customerName}, your order
          <strong style="color:#c9a84c;">
            #${order._id.toString().slice(-8).toUpperCase()}
          </strong>
          has been delivered successfully.
          We hope you love your Zalams piece!
        </p>

        <div style="background:#1a1a1a;border:1px solid #222;
          padding:24px;margin-bottom:24px;text-align:center;">
          <p style="color:#c9a84c;font-size:2rem;margin:0 0 8px;">
            🙏
          </p>
          <p style="color:#fff;font-size:1rem;font-weight:bold;
            margin:0 0 8px;letter-spacing:0.05em;">
            Thank You for Shopping with Us
          </p>
          <p style="color:#888;font-size:0.85rem;margin:0;
            line-height:1.7;">
            Your support means everything to us.
            We put our heart into every piece and we hope
            it shows every time you wear it.
          </p>
        </div>

        <div style="background:#1a1a1a;border:1px solid #222;
          padding:20px;margin-bottom:24px;">
          <p style="color:#888;font-size:0.72rem;letter-spacing:0.15em;
            text-transform:uppercase;margin:0 0 12px;">
            Your Order
          </p>
          ${order.items.map(item => `
            <div style="border-bottom:1px solid #222;padding:8px 0;">
              <p style="color:#fff;margin:0;font-size:0.85rem;">
                ${item.name}
                ${item.size
                  ? `<span style="color:#c9a84c;">· ${item.size}</span>`
                  : ''}
              </p>
              <p style="color:#888;margin:4px 0 0;font-size:0.75rem;">
                Qty: ${item.quantity}
              </p>
            </div>
          `).join('')}
        </div>

        <p style="color:#888;font-size:0.85rem;line-height:1.8;
          margin-bottom:24px;">
          If you have any issues with your order please don't
          hesitate to reach out to us at
          <a href="mailto:hello@zalams.com"
            style="color:#c9a84c;">hello@zalams.com</a>
        </p>

        <div style="text-align:center;">
          <a href="${process.env.FRONTEND_URL}/shop.html"
            style="display:inline-block;padding:14px 32px;
            background:#c9a84c;color:#000;font-weight:bold;
            text-decoration:none;text-transform:uppercase;
            letter-spacing:0.1em;font-size:0.85rem;">
            Shop Again →
          </a>
        </div>

        <div style="margin-top:32px;padding-top:24px;
          border-top:1px solid #222;text-align:center;">
          <p style="color:#555;font-size:0.72rem;margin:0;">
            © 2026 Zalams Luxury · hello@zalams.com
          </p>
        </div>
      </div>
    `
  };
}

// --- Contact Form Notification (to admin) ---
export function contactFormEmail(message) {
  return {
    from: process.env.EMAIL_FROM,
    to: process.env.ADMIN_EMAIL,
    subject: `New Message from ${message.firstName} — Zalams`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;
        background:#111;color:#fff;padding:32px;">

        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="font-size:2rem;letter-spacing:0.12em;color:#fff;margin:0;">
            ZALAM<span style="color:#c9a84c;">S</span>
          </h1>
        </div>

        <h2 style="color:#c9a84c;text-transform:uppercase;
          letter-spacing:0.08em;margin-bottom:8px;">
          New Contact Message
        </h2>

        <div style="background:#1a1a1a;border:1px solid #222;
          padding:20px;margin:20px 0;">
          <table style="width:100%;">
            <tr>
              <td style="color:#888;padding:6px 0;font-size:0.82rem;">From</td>
              <td style="color:#fff;padding:6px 0;font-size:0.82rem;
                text-align:right;">
                ${message.firstName} ${message.lastName || ''}
              </td>
            </tr>
            <tr>
              <td style="color:#888;padding:6px 0;font-size:0.82rem;">Email</td>
              <td style="color:#c9a84c;padding:6px 0;font-size:0.82rem;
                text-align:right;">
                ${message.email}
              </td>
            </tr>
            <tr>
              <td style="color:#888;padding:6px 0;font-size:0.82rem;">Subject</td>
              <td style="color:#fff;padding:6px 0;font-size:0.82rem;
                text-align:right;">
                ${message.subject || 'General'}
              </td>
            </tr>
          </table>
        </div>

        <div style="background:#1a1a1a;border:1px solid #222;padding:20px;">
          <p style="color:#888;font-size:0.72rem;letter-spacing:0.15em;
            text-transform:uppercase;margin:0 0 12px;">
            Message
          </p>
          <p style="color:#fff;line-height:1.8;margin:0;">
            ${message.message}
          </p>
        </div>

        <div style="margin-top:24px;">
          <a href="mailto:${message.email}"
            style="display:inline-block;padding:12px 28px;background:#c9a84c;
            color:#000;font-weight:bold;text-decoration:none;
            text-transform:uppercase;letter-spacing:0.1em;font-size:0.82rem;">
            Reply to ${message.firstName} →
          </a>
        </div>

      </div>
    `
  };
}

