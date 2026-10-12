import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT, 10) || 587;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  return transporter;
};

export const sendOrderConfirmationEmail = async (order) => {
  try {
    const t = getTransporter();
    const recipient = order.guestEmail || order.customer?.email;
    if (!recipient) return { success: false, message: 'No recipient email found' };

    const subject = `Order Confirmed: ${order.orderNumber} | CALZARE Footwear`;
    const itemsHtml = order.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            <strong>${item.productName}</strong><br />
            <small style="color: #666;">Color: ${item.colorName} | Size: ${item.size}</small>
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">x${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.subtotal?.toLocaleString('en-IN')}</td>
        </tr>`
      )
      .join('');

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
        <div style="background: #0f0f10; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px;">CALZARE</h1>
          <p style="color: #d8ff00; margin: 4px 0 0; font-size: 12px; font-weight: bold; text-transform: uppercase;">0% Boring. 100% Air.</p>
        </div>
        <div style="padding: 30px 20px; background: #fafafa;">
          <h2 style="font-size: 20px; margin-top: 0;">Thanks for your order, ${order.customerName}!</h2>
          <p style="color: #555; line-height: 1.5;">We have received your order <strong>${order.orderNumber}</strong>. Our fulfillment hub is preparing your footwear for dispatch.</p>
          
          <div style="background: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 16px; margin: 24px 0;">
            <h3 style="margin-top: 0; font-size: 16px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <thead>
                <tr style="color: #777; font-size: 12px; text-transform: uppercase;">
                  <th style="text-align: left; padding: 8px 10px;">Item</th>
                  <th style="text-align: center; padding: 8px 10px;">Qty</th>
                  <th style="text-align: right; padding: 8px 10px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 8px 10px; text-align: right; color: #666;">Subtotal:</td>
                  <td style="padding: 8px 10px; text-align: right; font-weight: bold;">₹${order.subtotal?.toLocaleString('en-IN')}</td>
                </tr>
                ${
                  order.discountAmount > 0
                    ? `<tr>
                  <td colspan="2" style="padding: 8px 10px; text-align: right; color: #2e7d32;">Discount (${order.couponApplied?.code || 'Coupon'}):</td>
                  <td style="padding: 8px 10px; text-align: right; color: #2e7d32; font-weight: bold;">-₹${order.discountAmount?.toLocaleString('en-IN')}</td>
                </tr>`
                    : ''
                }
                <tr>
                  <td colspan="2" style="padding: 8px 10px; text-align: right; color: #666;">Shipping:</td>
                  <td style="padding: 8px 10px; text-align: right; font-weight: bold;">${order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</td>
                </tr>
                <tr style="font-size: 16px; font-weight: bold; background: #f9f9f9;">
                  <td colspan="2" style="padding: 12px 10px; text-align: right;">Grand Total:</td>
                  <td style="padding: 12px 10px; text-align: right; color: #000;">₹${order.totalAmount?.toLocaleString('en-IN')}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div style="background: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <h4 style="margin: 0 0 8px; font-size: 14px;">Delivery Address</h4>
            <p style="margin: 0; font-size: 13px; color: #555; line-height: 1.5;">
              ${order.shippingAddress?.fullName}<br />
              ${order.shippingAddress?.addressLine1}, ${order.shippingAddress?.addressLine2 || ''}<br />
              ${order.shippingAddress?.city}, ${order.shippingAddress?.state} - ${order.shippingAddress?.postalCode}<br />
              Phone: ${order.shippingAddress?.phone}
            </p>
          </div>

          <p style="font-size: 13px; color: #777; text-align: center;">Questions? Contact us at support@calzare.com or reply directly to this email.</p>
        </div>
      </div>
    `;

    if (!t) {
      console.log(`[Email Service - Test Mode] Order confirmation simulated for ${recipient} (Order: ${order.orderNumber})`);
      return { success: true, mode: 'test_logged', recipient, subject };
    }

    const info = await t.sendMail({
      from: process.env.FROM_EMAIL || '"CALZARE Footwear" <orders@calzare.com>',
      to: recipient,
      subject,
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('[Email Service Error]', err.message);
    return { success: false, error: err.message };
  }
};

export const sendShippingUpdateEmail = async (order) => {
  try {
    const t = getTransporter();
    const recipient = order.guestEmail || order.customer?.email;
    if (!recipient) return { success: false, message: 'No recipient email found' };

    const subject = `Your Order ${order.orderNumber} Has Shipped! | CALZARE`;
    const carrier = order.trackingInfo?.carrier || 'Express Courier';
    const trackingNumber = order.trackingInfo?.trackingNumber || 'Tracking Pending';
    const trackingUrl = order.trackingInfo?.trackingUrl || '#';

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
        <div style="background: #0f0f10; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px;">CALZARE</h1>
        </div>
        <div style="padding: 30px 20px; background: #fafafa;">
          <h2 style="font-size: 20px; margin-top: 0;">Good news, ${order.customerName}!</h2>
          <p style="color: #555; line-height: 1.5;">Your footwear order <strong>${order.orderNumber}</strong> has been handed over to <strong>${carrier}</strong>.</p>
          
          <div style="background: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
            <div style="font-size: 13px; color: #666; text-transform: uppercase; font-weight: bold;">Tracking Number / AWB</div>
            <div style="font-size: 20px; font-weight: bold; margin: 8px 0; font-family: monospace;">${trackingNumber}</div>
            <div style="font-size: 13px; color: #666;">Courier Partner: <strong>${carrier}</strong></div>
            ${
              trackingUrl !== '#'
                ? `<div style="margin-top: 16px;">
                <a href="${trackingUrl}" style="background: #0f0f10; color: #d8ff00; padding: 10px 20px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">Track Package Live</a>
              </div>`
                : ''
            }
          </div>

          <p style="font-size: 13px; color: #777; text-align: center;">Delivering within 2-4 business days.</p>
        </div>
      </div>
    `;

    if (!t) {
      console.log(`[Email Service - Test Mode] Shipping update simulated for ${recipient} (AWB: ${trackingNumber})`);
      return { success: true, mode: 'test_logged', recipient, trackingNumber };
    }

    const info = await t.sendMail({
      from: process.env.FROM_EMAIL || '"CALZARE Footwear" <orders@calzare.com>',
      to: recipient,
      subject,
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('[Email Service Error]', err.message);
    return { success: false, error: err.message };
  }
};
