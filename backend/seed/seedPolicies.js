import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { CMSPage } from '../models/CMSPage.js';
import { StoreSetting } from '../models/StoreSetting.js';
import { NavigationMenu } from '../models/NavigationMenu.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/calzare_ecommerce';

const shippingPolicyHtml = `
<div class="legal-policy-document">
  <div class="policy-header-badge" style="display:inline-block; padding: 4px 12px; background: #e0f2fe; color: #0369a1; border-radius: 9999px; font-weight: 700; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 16px;">
    Official Store Policy
  </div>
  
  <p class="policy-lead" style="font-size: 1.1rem; line-height: 1.7; color: var(--text-primary); margin-bottom: 24px;">
    At <strong>CALZARE™</strong>, operated by <strong>Calzare Heels Private Limited</strong>, we aim to deliver your footwear safely and efficiently across India. Please read our Shipping Policy to understand how orders are processed, dispatched, and delivered.
  </p>

  <hr style="border: none; border-top: 1px solid var(--border-light); margin: 32px 0;" />

  <section class="policy-section" style="margin-bottom: 32px;">
    <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">1. Order Processing Time</h3>
    <ul style="padding-left: 20px; line-height: 1.8;">
      <li>Orders are generally processed within <strong>1–2 business days</strong> after order confirmation and successful payment, where applicable.</li>
      <li>Orders placed on Sundays or public holidays will be processed on the next working day.</li>
      <li>Once your order is dispatched, you will receive shipping confirmation and tracking details via SMS, email, or WhatsApp, where available.</li>
    </ul>
  </section>

  <section class="policy-section" style="margin-bottom: 32px;">
    <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">2. Shipping Time & Delivery</h3>
    <ul style="padding-left: 20px; line-height: 1.8;">
      <li>The estimated delivery time is <strong>3–7 business days after dispatch</strong>, depending on your delivery location and courier service.</li>
      <li>Deliveries to remote locations may take longer.</li>
      <li><strong>Delivery timelines are estimates only and are not guaranteed.</strong></li>
      <li>Delays may occur due to weather conditions, courier disruptions, public holidays, or other circumstances beyond our reasonable control.</li>
    </ul>
  </section>

  <section class="policy-section" style="margin-bottom: 32px;">
    <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">3. Shipping Charges</h3>
    <ul style="padding-left: 20px; line-height: 1.8;">
      <li>Applicable shipping charges, if any, will be displayed at checkout before you place your order.</li>
      <li>Promotional free-shipping offers will be subject to the terms and conditions specified at the time of the offer.</li>
      <li>Any shipping offer may be subject to minimum order values or location-based restrictions, where disclosed.</li>
    </ul>
  </section>

  <section class="policy-section" style="margin-bottom: 32px;">
    <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">4. Shipping Locations</h3>
    <ul style="padding-left: 20px; line-height: 1.8;">
      <li><strong>CALZARE™</strong> currently aims to deliver orders across serviceable locations in India.</li>
      <li>Delivery availability depends on courier serviceability for the PIN code provided at checkout.</li>
      <li>International shipping is not available unless specifically announced on our website.</li>
    </ul>
  </section>

  <section class="policy-section" style="margin-bottom: 32px;">
    <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">5. Order Tracking</h3>
    <p style="line-height: 1.8;">
      Once your order has been dispatched, we will share the tracking details through the contact information provided during checkout, where supported by the courier partner. You can use the tracking number or tracking link to monitor your shipment until delivery.
    </p>
  </section>

  <section class="policy-section" style="margin-bottom: 32px;">
    <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">6. Delayed or Lost Shipments</h3>
    <p style="line-height: 1.8;">
      If your order is significantly delayed or appears to be lost in transit, please contact our customer support team. We will coordinate with the relevant courier partner to investigate the shipment and assist you with the next steps. Delivery delays caused by courier partners or circumstances beyond our reasonable control may be outside our direct control. However, we will make reasonable efforts to help resolve the issue.
    </p>
  </section>

  <section class="policy-section" style="margin-bottom: 32px;">
    <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">7. Incorrect Address or Failed Delivery</h3>
    <ul style="padding-left: 20px; line-height: 1.8;">
      <li>Please ensure that your shipping address, PIN code, phone number, and other delivery details are accurate at checkout.</li>
      <li><strong>CALZARE™</strong> cannot guarantee successful delivery if incorrect or incomplete information is provided.</li>
      <li>If a shipment is returned because of an incorrect address, an unavailable recipient, or repeated unsuccessful delivery attempts, we may contact you to arrange the next steps.</li>
      <li>Any additional shipping charges, where applicable, will be communicated to you before a re-shipment is arranged.</li>
    </ul>
  </section>

  <section class="policy-section" style="margin-bottom: 32px;">
    <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">8. Cash on Delivery (COD)</h3>
    <ul style="padding-left: 20px; line-height: 1.8;">
      <li>Cash on Delivery (COD) is available only for eligible orders and serviceable PIN codes.</li>
      <li>COD availability may depend on the order value, delivery location, courier partner, and verification requirements.</li>
      <li>We may contact customers to confirm COD orders before dispatch.</li>
      <li>We reserve the right to restrict COD for certain orders or locations where permitted by applicable law.</li>
    </ul>
  </section>

  <section class="policy-section" style="margin-bottom: 32px;">
    <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">9. Partial COD and Order Confirmation</h3>
    <p style="line-height: 1.8; margin-bottom: 12px;">
      Where a partial payment or advance payment option is offered at checkout, the applicable amount and remaining balance will be displayed before order confirmation.
    </p>
    <ul style="padding-left: 20px; line-height: 1.8;">
      <li>Any advance payment will be processed according to the terms disclosed at checkout.</li>
      <li>If a customer refuses delivery or an order is returned undelivered, any refund of the advance payment will be handled in accordance with our Refund and Cancellation Policy and applicable law.</li>
      <li>Any applicable deductions must be lawful, reasonable, and disclosed to the customer before purchase.</li>
    </ul>
  </section>

  <section class="policy-section" style="margin-bottom: 32px;">
    <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">10. Damaged Packages During Transit</h3>
    <p style="line-height: 1.8; margin-bottom: 12px;">
      If your package appears visibly damaged at the time of delivery:
    </p>
    <ul style="padding-left: 20px; line-height: 1.8;">
      <li>Where possible, document the damage with photographs or videos before opening the package.</li>
      <li>If the package is severely damaged or appears tampered with, report the issue to the delivery personnel and contact our customer support team promptly.</li>
      <li><strong>Please notify us within 48 hours of delivery</strong>, with your order number and supporting photographs or videos, so we can investigate the issue.</li>
    </ul>
    <p style="line-height: 1.8; font-style: italic; margin-top: 8px;">Please retain the original packaging until the matter has been resolved.</p>
  </section>

  <section class="policy-section" style="background: #f8fafc; padding: 24px; border-radius: var(--radius-lg); border: 1px solid var(--border-light);">
    <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">11. Contact Us</h3>
    <p style="line-height: 1.8; margin-bottom: 16px;">
      For questions about shipping, delivery delays, tracking, or returned shipments, please contact us:
    </p>
    <p style="margin: 0; line-height: 1.7; font-size: 0.95rem;">
      <strong>Brand:</strong> CALZARE™<br />
      <strong>Company:</strong> Calzare Heels Private Limited<br />
      <strong>Website:</strong> <a href="https://calzare.in" target="_blank" rel="noopener noreferrer" style="color: var(--ink-black); text-decoration: underline;">calzare.in</a><br />
      <strong>Email:</strong> <a href="mailto:Admin@calzareheels.com" style="color: var(--ink-black); text-decoration: underline;">Admin@calzareheels.com</a>
    </p>
  </section>

  <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 32px;">
    <em>This policy should be read together with our Terms and Conditions, Cancellation Policy, and Refund and Return Policy.</em>
  </p>
</div>
`;

const returnPolicyHtml = `
<div class="legal-policy-document">
  <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; margin-bottom: 16px;">
    <div class="policy-header-badge" style="display:inline-block; padding: 4px 12px; background: #fef3c7; color: #b45309; border-radius: 9999px; font-weight: 700; font-size: 0.8rem; text-transform: uppercase;">
      Official Customer Policy
    </div>
    <span style="font-size: 0.82rem; color: var(--text-muted); font-weight: 600;">Last Updated: 22 October 2026</span>
  </div>

  <p class="policy-lead" style="font-size: 1.1rem; line-height: 1.7; color: var(--text-primary); margin-bottom: 24px;">
    At <strong>CALZARE™</strong>, operated by <strong>Calzare Heels Private Limited</strong>, we are committed to delivering quality footwear and providing a transparent shopping experience. Please read this policy carefully before placing an order on <a href="https://calzare.in" target="_blank" rel="noopener noreferrer" style="color: var(--ink-black); text-decoration: underline;">Calzare.in</a>.
  </p>

  <hr style="border: none; border-top: 1px solid var(--border-light); margin: 32px 0;" />

  <section class="policy-section" style="margin-bottom: 32px;">
    <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">1. Unboxing Video Requirement</h3>
    <p style="line-height: 1.8; margin-bottom: 12px;">
      We recommend recording a continuous, unedited unboxing video for every order, starting before the package is opened and clearly showing the shipping label, packaging, and product.
    </p>
    <ul style="padding-left: 20px; line-height: 1.8;">
      <li>An unboxing video helps us verify claims involving damaged, defective, missing, or incorrect products.</li>
      <li>Please retain the original packaging until your complaint has been resolved.</li>
      <li>If you do not have an unboxing video, you may submit photographs and other available evidence. The absence of a video will not automatically remove rights available under applicable law.</li>
    </ul>
  </section>

  <section class="policy-section" style="margin-bottom: 32px;">
    <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">2. Returns and Exchanges</h3>
    <p style="line-height: 1.8; margin-bottom: 16px;">
      We accept eligible return or exchange requests in the following circumstances:
    </p>
    
    <div style="background: #f8fafc; padding: 20px; border-radius: var(--radius-md); border-left: 4px solid #ef4444; margin-bottom: 18px;">
      <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--ink-black); margin-bottom: 8px;">Damaged, Defective, or Incorrect Products</h4>
      <ul style="padding-left: 20px; line-height: 1.7; margin: 0;">
        <li>If you receive a damaged, defective, or incorrect product, contact us <strong>within 48 hours of delivery</strong>, preferably with photographs or an unboxing video.</li>
        <li>After verification, we will arrange an appropriate resolution, such as a replacement, exchange, or refund, as applicable.</li>
        <li><strong>No return or replacement shipping fee will be charged</strong> where the issue is attributable to CALZARE™.</li>
      </ul>
    </div>

    <div style="background: #f8fafc; padding: 20px; border-radius: var(--radius-md); border-left: 4px solid var(--accent-lime); margin-bottom: 18px;">
      <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--ink-black); margin-bottom: 8px;">Size or Fit Issues</h4>
      <ul style="padding-left: 20px; line-height: 1.7; margin: 0;">
        <li>Size exchange requests must be submitted <strong>within 3 days of delivery</strong>.</li>
        <li>The product must be unused, unworn outdoors, and returned with its original packaging, tags, and accessories.</li>
        <li>Exchanges are subject to stock availability.</li>
        <li>A disclosed exchange fee of <strong>₹149</strong> may apply to eligible customer-requested size exchanges to help cover shipping and logistics costs.</li>
        <li>The exchange fee will not apply where the exchange is required to correct a defective or incorrect product attributable to CALZARE™.</li>
      </ul>
    </div>

    <div style="background: #f8fafc; padding: 20px; border-radius: var(--radius-md); border-left: 4px solid #64748b;">
      <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--ink-black); margin-bottom: 8px;">Change of Mind</h4>
      <ul style="padding-left: 20px; line-height: 1.7; margin: 0;">
        <li>Returns or exchanges requested solely because of a change of preference may be accepted only where expressly offered for the relevant product.</li>
        <li>Products marked as final sale will be subject to the conditions disclosed on the product page, without limiting any rights available under applicable law.</li>
      </ul>
    </div>
  </section>

  <section class="policy-section" style="margin-bottom: 32px;">
    <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">3. Return Eligibility</h3>
    <p style="line-height: 1.8;">For a standard size exchange or other eligible return:</p>
    <ul style="padding-left: 20px; line-height: 1.8;">
      <li>Submit the request within the applicable return window.</li>
      <li>Keep the footwear unused and in resalable condition.</li>
      <li>Include the original box, tags, accessories, and packaging, where supplied.</li>
      <li>Provide the order number and any requested supporting information.</li>
    </ul>
    <p style="line-height: 1.8; color: var(--text-muted); font-size: 0.92rem;">
      <em>Products showing outdoor wear, customer-caused damage, or alterations may be ineligible for a change-of-mind return or size exchange. This does not limit claims relating to manufacturing defects or other rights under applicable law.</em>
    </p>
  </section>

  <section class="policy-section" style="margin-bottom: 32px;">
    <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">4. How to Request a Return or Exchange</h3>
    <ol style="padding-left: 20px; line-height: 1.8;">
      <li>Contact our customer support team using the details published on our website.</li>
      <li>Provide your order number and registered phone number or email address.</li>
      <li>Explain the reason for your request and provide photographs or an unboxing video where available.</li>
      <li>Our team will review the request and confirm the next steps.</li>
      <li>If approved, we will arrange a pickup or provide return instructions, depending on serviceability.</li>
      <li>Once the returned product is received and inspected, we will notify you of the outcome and applicable resolution.</li>
    </ol>
    <p style="font-weight: 700; color: #dc2626; margin-top: 8px;">Please do not send products to an address that has not been confirmed by our team.</p>
  </section>

  <section class="policy-section" style="margin-bottom: 32px;">
    <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">5. Refund Method and Processing Time</h3>
    <p style="line-height: 1.8;">Where a refund is approved:</p>
    <ul style="padding-left: 20px; line-height: 1.8;">
      <li>Prepaid orders will generally be refunded to the original payment method.</li>
      <li>For COD orders, we may request bank account or other payment details needed to process the refund securely.</li>
      <li>We aim to initiate approved refunds within <strong>7–10 business days</strong> after the refund decision or completion of the required inspection, as applicable.</li>
      <li>The time taken for funds to appear in your account may depend on your bank or payment provider.</li>
      <li>Refunds will be processed in accordance with applicable law and the circumstances of the claim.</li>
    </ul>
    <p style="line-height: 1.8; margin-top: 8px;">Where a replacement or exchange is agreed upon and legally permissible, we will communicate the arrangement before proceeding.</p>
  </section>

  <section class="policy-section" style="margin-bottom: 32px;">
    <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">6. Exchange Fees</h3>
    <p style="line-height: 1.8;">
      For eligible customer-requested size or preference-based exchanges, an exchange fee of <strong>₹149</strong> may apply to help cover shipping and logistics costs.
    </p>
    <ul style="padding-left: 20px; line-height: 1.8;">
      <li>The fee will be disclosed before the customer confirms the exchange.</li>
      <li>The fee will not apply to replacements or exchanges required to correct a damaged, defective, or incorrect product attributable to CALZARE™.</li>
      <li>Any fee charged will be subject to applicable law.</li>
    </ul>
  </section>

  <section class="policy-section" style="margin-bottom: 32px;">
    <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">7. Order Cancellations</h3>
    <ul style="padding-left: 20px; line-height: 1.8;">
      <li>Customers may request cancellation before dispatch by contacting us as soon as possible.</li>
      <li>Once an order has been dispatched, cancellation may no longer be possible through the standard cancellation process. Customers may contact us for available options.</li>
      <li>Approved cancellations of prepaid orders will be refunded to the original payment method, subject to applicable law.</li>
      <li>For partial COD orders, the advance payment will be handled according to the terms disclosed at checkout and applicable law.</li>
      <li>Any cancellation charge must be disclosed before purchase and must be legally permissible. No undisclosed charge will be imposed, and no payment will be retained contrary to applicable law.</li>
    </ul>
  </section>

  <section class="policy-section" style="margin-bottom: 32px;">
    <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">8. Cash on Delivery (COD) and Partial COD</h3>
    <p style="line-height: 1.8; margin-bottom: 12px;">
      COD and Partial COD may be available for eligible orders and serviceable PIN codes. For Partial COD orders, the customer pays an advance amount at checkout, with the remaining balance payable upon delivery.
    </p>
    <div style="background: #fffbeb; padding: 20px; border-radius: var(--radius-md); border: 1px solid #fde68a;">
      <h4 style="font-size: 1.05rem; font-weight: 800; color: #92400e; margin-bottom: 8px;">Partial COD — Refused or Undelivered Orders</h4>
      <ul style="padding-left: 20px; line-height: 1.7; margin: 0; color: #78350f;">
        <li>If a customer refuses to accept the order at the doorstep or fails to accept delivery after the applicable delivery attempts, the shipment may be returned to origin (RTO).</li>
        <li>The partial payment collected at checkout is intended to cover shipping, return-logistics, and order-handling costs. If the customer refuses delivery for reasons attributable to the customer, this advance payment will be non-refundable to the extent permitted by applicable law and the terms disclosed at checkout.</li>
        <li>The advance payment will not be treated as non-refundable where the product is defective, incorrect, the delivery failure is attributable to CALZARE™, or a refund is otherwise required under applicable law.</li>
        <li>If the customer requests re-shipment after an RTO, a re-shipment charge of <strong>₹300</strong> may apply. The applicable charge will be communicated before re-dispatch and must be legally permissible.</li>
      </ul>
    </div>
  </section>

  <section class="policy-section" style="margin-bottom: 32px;">
    <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">9. Return to Origin (RTO), Re-shipment and Cancellation After Dispatch</h3>
    <p style="line-height: 1.8;">
      A shipment may be returned to origin if the customer is unavailable, unreachable, has provided an incorrect or incomplete address, refuses delivery, or cannot receive the package after the applicable delivery attempts.
    </p>
    <ul style="padding-left: 20px; line-height: 1.8;">
      <li><strong>Re-shipment After RTO:</strong> If a customer requests re-shipment after an RTO, a re-shipment charge of <strong>₹300</strong> may apply where the customer is responsible for the failed delivery and the charge is lawful and properly disclosed. No re-shipment charge will apply where the failed delivery is attributable to an error by CALZARE™ or its fulfilment process.</li>
      <li><strong>Fully Prepaid Orders Refused at Doorstep:</strong> If a customer has already paid the full order amount but refuses delivery for reasons attributable to the customer, resulting in an RTO, <strong>₹300 may be deducted</strong> from the refund toward shipping and return-logistics costs, provided the charge was disclosed before purchase and is legally permissible. The ₹300 deduction will not apply where the product is defective or incorrect, or the delivery failure is attributable to CALZARE™.</li>
      <li><strong>Partial COD Orders Returned to Origin:</strong> The advance payment and the ₹300 re-shipment charge are separate matters. CALZARE™ will not automatically apply both an advance-payment forfeiture and an additional deduction without considering the circumstances, disclosed terms, and applicable law.</li>
    </ul>
  </section>

  <section class="policy-section" style="margin-bottom: 32px;">
    <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">10. Final Sale and Clearance Products</h3>
    <ul style="padding-left: 20px; line-height: 1.8;">
      <li>Products clearly marked as final sale or clearance may be ineligible for returns or exchanges based on size or preference.</li>
      <li>Any restrictions will be disclosed on the relevant product page before purchase.</li>
      <li>Final-sale status does not exclude remedies required by applicable law for defective, damaged, incorrect, or misrepresented products.</li>
    </ul>
  </section>

  <section class="policy-section" style="margin-bottom: 32px;">
    <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">11. Gift Cards and Store Credit</h3>
    <p style="line-height: 1.8;">
      If store credit or a gift card is offered as a resolution, we will communicate its value, validity, and redemption conditions before the customer accepts it. Store credit will not replace a refund where a refund is required under applicable law.
    </p>
  </section>

  <section class="policy-section" style="background: #f8fafc; padding: 24px; border-radius: var(--radius-lg); border: 1px solid var(--border-light);">
    <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">12. Contact Us</h3>
    <p style="line-height: 1.8; margin-bottom: 16px;">
      For return, exchange, cancellation, or refund requests, please contact us using our official support details:
    </p>
    <p style="margin: 0; line-height: 1.7; font-size: 0.95rem;">
      <strong>Brand:</strong> CALZARE™<br />
      <strong>Company:</strong> Calzare Heels Private Limited<br />
      <strong>Website:</strong> <a href="https://calzare.in" target="_blank" rel="noopener noreferrer" style="color: var(--ink-black); text-decoration: underline;">calzare.in</a><br />
      <strong>Email:</strong> <a href="mailto:Admin@calzareheels.com" style="color: var(--ink-black); text-decoration: underline;">Admin@calzareheels.com</a>
    </p>
  </section>

  <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 32px;">
    <em>This policy should be read together with our Shipping Policy, Terms and Conditions, and Privacy Policy.</em>
  </p>
</div>
`;

const termsPolicyHtml = `
<div class="legal-policy-document">
  <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; margin-bottom: 16px;">
    <div class="policy-header-badge" style="display:inline-block; padding: 4px 12px; background: #e0f2fe; color: #0369a1; border-radius: 9999px; font-weight: 700; font-size: 0.8rem; text-transform: uppercase;">
      Official Customer Terms
    </div>
    <span style="font-size: 0.82rem; color: var(--text-muted); font-weight: 600;">Last Updated: 25 October 2026</span>
  </div>

  <p class="policy-lead" style="font-size: 1.1rem; line-height: 1.7; color: var(--text-primary); margin-bottom: 24px;">
    Welcome to <strong>CALZARE™</strong>, operated by <strong>Calzare Heels Private Limited</strong>. By accessing or using our website (<a href="https://calzare.in" target="_blank" rel="noopener noreferrer" style="color: var(--ink-black); text-decoration: underline;">calzare.in</a>) and related services, or purchasing products from us, you agree to comply with and be bound by the following Terms and Conditions. Please review them carefully before placing an order.
  </p>

  <hr style="border: none; border-top: 1px solid var(--border-light); margin: 32px 0;" />

  <section class="policy-section" style="margin-bottom: 32px;">
    <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">1. General Agreement & Eligibility</h3>
    <ul style="padding-left: 20px; line-height: 1.8;">
      <li>By using this website, you confirm that you are at least 18 years of age or accessing the platform under the direct supervision of a parent or legal guardian.</li>
      <li>These terms govern all transactions, communications, and interactions between you (the Customer) and Calzare Heels Private Limited.</li>
      <li>We reserve the right to amend, update, or modify these Terms at any time. Continued use of the website following any changes constitutes acceptance of those revisions.</li>
    </ul>
  </section>

  <section class="policy-section" style="margin-bottom: 32px;">
    <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">2. Products, Design & Pricing</h3>
    <ul style="padding-left: 20px; line-height: 1.8;">
      <li>CALZARE specializes in architectural closed-cell EVA foam footwear engineered for waterproof durability, cushioning rebound, and everyday urban and trail wear.</li>
      <li>We strive to depict product hues, silhouettes, and material textures as accurately as possible. Slight variances may occur due to individual screen calibration and studio lighting.</li>
      <li>All prices on the platform are listed in <strong>Indian Rupees (INR)</strong> and are inclusive of applicable Goods and Services Tax (GST) unless explicitly stated otherwise.</li>
      <li>In the event of an unintended technical error resulting in an incorrect price or product specification, we reserve the right to cancel or amend the affected order and issue a prompt refund.</li>
    </ul>
  </section>

  <section class="policy-section" style="margin-bottom: 32px;">
    <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">3. Orders, Verification & Acceptance</h3>
    <ul style="padding-left: 20px; line-height: 1.8;">
      <li>Placing an order constitutes an offer to purchase. An automated order confirmation email or SMS acknowledges receipt but does not constitute legal acceptance until the shipment is dispatched.</li>
      <li>For Cash on Delivery (COD) and Partial COD orders, our verification team may reach out via phone call, SMS, or WhatsApp to verify recipient availability and delivery address before dispatch.</li>
      <li>We reserve the right to decline or cancel orders suspected of fraudulent intent, commercial reselling, or abusive return practices.</li>
    </ul>
  </section>

  <section class="policy-section" style="margin-bottom: 32px;">
    <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">4. Payment & Security</h3>
    <ul style="padding-left: 20px; line-height: 1.8;">
      <li>We support major secure payment methods including UPI (Google Pay, PhonePe, Paytm, BHIM), Net Banking, Credit/Debit Cards (Visa, Mastercard, RuPay, American Express), and Cash on Delivery / Partial COD for serviceable PIN codes.</li>
      <li>All online card transactions are processed through RBI-approved, PCI-DSS Level 1 compliant payment gateways with bank-grade TLS encryption. CALZARE never stores card numbers or CVV details on its servers.</li>
    </ul>
  </section>

  <section class="policy-section" style="margin-bottom: 32px;">
    <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">5. Shipping, Delivery & Inspection</h3>
    <ul style="padding-left: 20px; line-height: 1.8;">
      <li>Order processing typically requires 1–2 business days. Estimated delivery across India ranges between 3–7 business days depending on location and courier serviceability.</li>
      <li>Please refer to our dedicated <a href="/shipping" style="color: var(--ink-black); font-weight: 600; text-decoration: underline;">Shipping Policy</a> for full details on dispatch turnaround, delivery tracking, and logistics protocols.</li>
    </ul>
  </section>

  <section class="policy-section" style="margin-bottom: 32px;">
    <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">6. Exchanges, Returns & Cancellations</h3>
    <ul style="padding-left: 20px; line-height: 1.8;">
      <li>Customer size exchanges must be initiated within <strong>3 days of delivery</strong>. A nominal logistics fee of ₹149 applies to customer-requested size swaps to partially offset courier handling.</li>
      <li>Damaged, defective, or incorrect footwear claims must be reported within <strong>48 hours of delivery</strong> accompanied by photos or an unboxing video. In such cases, replacement or refund is provided at zero fee.</li>
      <li>Detailed eligibility criteria, inspection procedures, and refund timeframes are governed by our <a href="/returns" style="color: var(--ink-black); font-weight: 600; text-decoration: underline;">Refund, Return & Exchange Policy</a>.</li>
    </ul>
  </section>

  <section class="policy-section" style="margin-bottom: 32px;">
    <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">7. Intellectual Property</h3>
    <p style="line-height: 1.8;">
      All content on this website, including but not limited to brand names, logos, trademarks (CALZARE™), footwear designs, 3D renderings, product photographs, text copy, graphic UI, and underlying software code, is the exclusive proprietary property of <strong>Calzare Heels Private Limited</strong> and is protected under applicable Indian and international copyright, trademark, and intellectual property laws. Any unauthorized reproduction, scraping, modification, or commercial exploitation is strictly prohibited.
    </p>
  </section>

  <section class="policy-section" style="margin-bottom: 32px;">
    <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">8. User Conduct & Prohibited Uses</h3>
    <ul style="padding-left: 20px; line-height: 1.8;">
      <li>You agree not to use the website for any unlawful, harassing, or fraudulent purpose.</li>
      <li>You may not attempt to probe, scan, or compromise our infrastructure, upload malicious code, or introduce automated scrapers, spiders, or bots without express written permission.</li>
    </ul>
  </section>

  <section class="policy-section" style="margin-bottom: 32px;">
    <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">9. Limitation of Liability & Governing Law</h3>
    <ul style="padding-left: 20px; line-height: 1.8;">
      <li>To the maximum extent permitted by Indian law, Calzare Heels Private Limited shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use this platform.</li>
      <li>These Terms shall be governed by and construed in accordance with the laws of <strong>India</strong>. Any disputes arising out of or related to these terms shall fall under the exclusive jurisdiction of the competent courts in <strong>Bengaluru, Karnataka, India</strong>.</li>
    </ul>
  </section>

  <section class="policy-section" style="background: #f8fafc; padding: 24px; border-radius: var(--radius-lg); border: 1px solid var(--border-light);">
    <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">10. Customer Support & Grievance Redressal</h3>
    <p style="line-height: 1.8; margin-bottom: 16px;">
      In accordance with the Consumer Protection (E-Commerce) Rules, 2020 and Information Technology Act, please direct questions, grievances, or legal notices to:
    </p>
    <p style="margin: 0; line-height: 1.7; font-size: 0.95rem;">
      <strong>Brand:</strong> CALZARE™<br />
      <strong>Company:</strong> Calzare Heels Private Limited<br />
      <strong>Website:</strong> <a href="https://calzare.in" target="_blank" rel="noopener noreferrer" style="color: var(--ink-black); text-decoration: underline;">calzare.in</a><br />
      <strong>Support Email:</strong> <a href="mailto:Admin@calzareheels.com" style="color: var(--ink-black); text-decoration: underline;">Admin@calzareheels.com</a><br />
      <strong>Concierge Desk:</strong> <a href="/contact" style="color: var(--ink-black); text-decoration: underline;">Visit Contact Concierge</a>
    </p>
  </section>
</div>
`;

const privacyPolicyHtml = `
<div class="legal-policy-document">
  <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; margin-bottom: 16px;">
    <div class="policy-header-badge" style="display:inline-block; padding: 4px 12px; background: #ecfdf5; color: #047857; border-radius: 9999px; font-weight: 700; font-size: 0.8rem; text-transform: uppercase;">
      Official Privacy Policy
    </div>
    <span style="font-size: 0.82rem; color: var(--text-muted); font-weight: 600;">Last Updated: 25 October 2026</span>
  </div>

  <p class="policy-lead" style="font-size: 1.1rem; line-height: 1.7; color: var(--text-primary); margin-bottom: 24px;">
    At <strong>CALZARE™</strong>, operated by <strong>Calzare Heels Private Limited</strong> (<a href="https://calzare.in" target="_blank" rel="noopener noreferrer" style="color: var(--ink-black); text-decoration: underline;">calzare.in</a>), we value your trust and are committed to safeguarding your personal data. This Privacy Policy details how we collect, handle, store, and protect your information when you browse our storefront or purchase our footwear.
  </p>

  <hr style="border: none; border-top: 1px solid var(--border-light); margin: 32px 0;" />

  <section class="policy-section" style="margin-bottom: 32px;">
    <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">1. Information We Collect</h3>
    <p style="line-height: 1.8; margin-bottom: 12px;">We collect information that you voluntarily provide to us when interacting with our store:</p>
    <ul style="padding-left: 20px; line-height: 1.8;">
      <li><strong>Contact & Identity Data:</strong> Full name, email address, mobile phone number, delivery address, and pincode when placing an order or registering an account.</li>
      <li><strong>Order & Transaction Records:</strong> Purchased footwear models, size selections, billing details, payment transaction reference numbers, and order timestamps.</li>
      <li><strong>Customer Service Records:</strong> Communications submitted via our Contact Concierge form, return/exchange claims, unboxing videos, and support inquiries.</li>
      <li><strong>Device & Browsing Data:</strong> IP address, device type, operating system, browser specifications, and cookie preferences collected to ensure storefront speed and cart persistence.</li>
    </ul>
  </section>

  <section class="policy-section" style="margin-bottom: 32px;">
    <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">2. How We Use Your Information</h3>
    <ul style="padding-left: 20px; line-height: 1.8;">
      <li><strong>Order Fulfillment:</strong> Processing transactions, preparing your package, and facilitating doorstep delivery with our logistics network.</li>
      <li><strong>Transactional Updates:</strong> Sending real-time tracking links, dispatch notices, and delivery confirmations via SMS, email, and WhatsApp.</li>
      <li><strong>Support & Returns:</strong> Facilitating our 3-day size exchange process, processing warranty or defect replacements, and addressing customer concierge inquiries.</li>
      <li><strong>Fraud Detection & Security:</strong> Verifying Cash on Delivery (COD) orders, guarding against duplicate payment charges, and preventing unauthorized account access.</li>
      <li><strong>Store Improvements:</strong> Analyzing site navigation flows to enhance mobile load speed and optimize checkout usability.</li>
    </ul>
  </section>

  <section class="policy-section" style="background: #f0fdf4; padding: 24px; border-radius: var(--radius-lg); border: 1px solid #bbf7d0; margin-bottom: 32px;">
    <h3 style="font-size: 1.25rem; font-weight: 800; color: #166534; margin-bottom: 12px;">3. Our Zero Data Sale Commitment</h3>
    <p style="line-height: 1.8; color: #15803d; margin: 0;">
      <strong>We do not sell, rent, monetize, or trade your personal data to any third-party marketing brokers or advertising networks.</strong> Your personal data is used solely to provide and fulfill the footwear and customer support services you request from CALZARE™.
    </p>
  </section>

  <section class="policy-section" style="margin-bottom: 32px;">
    <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">4. Trusted Operational Partners & Disclosures</h3>
    <p style="line-height: 1.8; margin-bottom: 12px;">
      We share required data strictly with trusted service partners operating under confidentiality agreements:
    </p>
    <ul style="padding-left: 20px; line-height: 1.8;">
      <li><strong>Logistics Providers:</strong> Verified express courier partners (e.g. Shiprocket, Bluedart, Delhivery) who receive your name, address, and phone number exclusively to deliver your shoes.</li>
      <li><strong>Payment Gateways:</strong> RBI-authorized payment processors who handle financial authorization through encrypted bank tokens.</li>
      <li><strong>Statutory Authorities:</strong> If compelled by lawful governmental requests, court orders, or regulations under applicable Indian law.</li>
    </ul>
  </section>

  <section class="policy-section" style="margin-bottom: 32px;">
    <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">5. Data Security & Storage</h3>
    <ul style="padding-left: 20px; line-height: 1.8;">
      <li>All data transmissions across <a href="https://calzare.in" target="_blank" rel="noopener noreferrer" style="color: var(--ink-black); text-decoration: underline;">calzare.in</a> are encrypted using industry-standard TLS / HTTPS protocols.</li>
      <li>Our production databases reside within secure cloud hosting environments with strict role-based access control, monitoring, and regular security patching.</li>
      <li>Payment card data is tokenized through PCI-DSS Level 1 compliant partners. CALZARE never stores credit/debit card numbers or CVV codes.</li>
    </ul>
  </section>

  <section class="policy-section" style="margin-bottom: 32px;">
    <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">6. Cookies and Tracking Technologies</h3>
    <p style="line-height: 1.8;">
      We use essential cookies to maintain your active shopping cart, remember your size preferences, and keep you signed in. You may configure your web browser to disable or clear cookies; however, note that essential e-commerce functions like checkout cart persistence may be impaired.
    </p>
  </section>

  <section class="policy-section" style="margin-bottom: 32px;">
    <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">7. Your Rights & Data Choices</h3>
    <p style="line-height: 1.8;">
      You have the right to access, update, or request deletion of the personal information we maintain. To submit a data request, change your contact details, or unsubscribe from promotional emails, simply email us at <a href="mailto:Admin@calzareheels.com" style="color: var(--ink-black); font-weight: 600; text-decoration: underline;">Admin@calzareheels.com</a> with your registered email and order number.
    </p>
  </section>

  <section class="policy-section" style="background: #f8fafc; padding: 24px; border-radius: var(--radius-lg); border: 1px solid var(--border-light);">
    <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">8. Grievance Officer & Official Contact</h3>
    <p style="line-height: 1.8; margin-bottom: 16px;">
      In accordance with the Information Technology Act, 2000 and the Consumer Protection (E-Commerce) Rules, 2020, please direct any privacy or data grievances to:
    </p>
    <p style="margin: 0; line-height: 1.7; font-size: 0.95rem;">
      <strong>Entity:</strong> Calzare Heels Private Limited<br />
      <strong>Brand:</strong> CALZARE™<br />
      <strong>Official Website:</strong> <a href="https://calzare.in" target="_blank" rel="noopener noreferrer" style="color: var(--ink-black); text-decoration: underline;">calzare.in</a><br />
      <strong>Privacy Contact:</strong> <a href="mailto:Admin@calzareheels.com" style="color: var(--ink-black); text-decoration: underline;">Admin@calzareheels.com</a><br />
      <strong>Concierge Support:</strong> <a href="/contact" style="color: var(--ink-black); text-decoration: underline;">Contact Concierge Page</a>
    </p>
  </section>
</div>
`;

const sizeGuideHtml = `
<div class="legal-policy-document">
  <div style="display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; margin-bottom: 16px;">
    <div class="policy-header-badge" style="display:inline-block; padding: 4px 12px; background: #e0f2fe; color: #0369a1; border-radius: 9999px; font-weight: 700; font-size: 0.8rem; text-transform: uppercase;">
      Official Sizing Guide
    </div>
    <span style="font-size: 0.82rem; color: var(--text-muted); font-weight: 600;">Standard UK / India Fitting</span>
  </div>

  <p class="policy-lead" style="font-size: 1.1rem; line-height: 1.7; color: var(--text-primary); margin-bottom: 24px;">
    CALZARE™ closed-cell foam footwear is engineered to anatomical foot proportions. All our models follow standard <strong>UK / Indian Footwear Sizing</strong>. Use this conversion chart and measurement guide to discover your perfect ergonomic fit.
  </p>

  <hr style="border: none; border-top: 1px solid var(--border-light); margin: 32px 0;" />

  <section class="policy-section" style="margin-bottom: 32px;">
    <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--ink-black); margin-bottom: 16px;">Size Conversion Chart</h3>
    <div style="overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse; font-size: 0.95rem; text-align: left; background: #ffffff; border-radius: var(--radius-md); overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
        <thead>
          <tr style="background: var(--ink-black); color: #ffffff;">
            <th style="padding: 14px 16px;">UK / India</th>
            <th style="padding: 14px 16px;">EU Size</th>
            <th style="padding: 14px 16px;">US Men</th>
            <th style="padding: 14px 16px;">US Women</th>
            <th style="padding: 14px 16px;">Foot Length (CM)</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 12px 16px; font-weight: 700;">UK 5</td><td style="padding: 12px 16px;">EU 38</td><td style="padding: 12px 16px;">US 6</td><td style="padding: 12px 16px;">US 7</td><td style="padding: 12px 16px;">24.2 cm</td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0; background: #f8fafc;"><td style="padding: 12px 16px; font-weight: 700;">UK 6</td><td style="padding: 12px 16px;">EU 39</td><td style="padding: 12px 16px;">US 7</td><td style="padding: 12px 16px;">US 8</td><td style="padding: 12px 16px;">25.0 cm</td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 12px 16px; font-weight: 700;">UK 7</td><td style="padding: 12px 16px;">EU 41</td><td style="padding: 12px 16px;">US 8</td><td style="padding: 12px 16px;">US 9</td><td style="padding: 12px 16px;">25.8 cm</td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0; background: #f8fafc;"><td style="padding: 12px 16px; font-weight: 700;">UK 8</td><td style="padding: 12px 16px;">EU 42</td><td style="padding: 12px 16px;">US 9</td><td style="padding: 12px 16px;">US 10</td><td style="padding: 12px 16px;">26.6 cm</td></tr>
          <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 12px 16px; font-weight: 700;">UK 9</td><td style="padding: 12px 16px;">EU 43</td><td style="padding: 12px 16px;">US 10</td><td style="padding: 12px 16px;">US 11</td><td style="padding: 12px 16px;">27.5 cm</td></tr>
          <tr><td style="padding: 12px 16px; font-weight: 700;">UK 10</td><td style="padding: 12px 16px;">EU 45</td><td style="padding: 12px 16px;">US 11</td><td style="padding: 12px 16px;">US 12</td><td style="padding: 12px 16px;">28.3 cm</td></tr>
        </tbody>
      </table>
    </div>
  </section>

  <section class="policy-section" style="margin-bottom: 32px;">
    <h3 style="font-size: 1.4rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">How to Measure Your Feet at Home</h3>
    <ol style="padding-left: 20px; line-height: 1.8;">
      <li>Place a blank sheet of paper flat on a hard floor against a wall.</li>
      <li>Stand upright with your heel resting gently against the wall.</li>
      <li>Use a pencil to mark the outermost point of your longest toe on the paper.</li>
      <li>Measure the distance from the edge of the paper to the marked point in centimeters.</li>
      <li>Compare your measurement with our chart above to determine your size.</li>
    </ol>
    <div style="background: #f8fafc; padding: 18px 22px; border-radius: var(--radius-md); border-left: 4px solid var(--accent-lime); margin-top: 16px;">
      <p style="margin: 0; font-size: 0.95rem; line-height: 1.6;">
        <strong>Fit Recommendation:</strong> If you have broader feet or plan on wearing socks frequently with our clogs and sliders, we recommend ordering one size up for optimum all-day comfort.
      </p>
    </div>
  </section>

  <section class="policy-section" style="background: #f8fafc; padding: 24px; border-radius: var(--radius-lg); border: 1px solid var(--border-light);">
    <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--ink-black); margin-bottom: 12px;">Need Help or Ordered the Wrong Size?</h3>
    <p style="line-height: 1.8; margin-bottom: 12px;">
      Don't worry! We offer a seamless <strong>3-Day Doorstep Size Exchange</strong> service across India.
    </p>
    <p style="margin: 0; line-height: 1.7; font-size: 0.95rem;">
      Connect with our team on our <a href="/contact" style="color: var(--ink-black); font-weight: 600; text-decoration: underline;">Contact Concierge</a> or email <a href="mailto:Admin@calzareheels.com" style="color: var(--ink-black); font-weight: 600; text-decoration: underline;">Admin@calzareheels.com</a> to initiate a size exchange.
    </p>
  </section>
</div>
`;

async function seedPolicies() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[SeedPolicies] Connected to MongoDB');

    // 1. Seed or Update Shipping Policy
    await CMSPage.findOneAndUpdate(
      { slug: 'shipping' },
      {
        title: 'Shipping Policy',
        slug: 'shipping',
        content: shippingPolicyHtml,
        excerpt: 'Official Shipping Policy of CALZARE™ operated by Calzare Heels Private Limited. Processing turnaround 1–2 business days, estimated delivery 3–7 business days across India.',
        category: 'policy',
        isPublished: true,
        metaTitle: 'Shipping Policy | CALZARE™',
        metaDescription: 'Read the official Shipping Policy of CALZARE™ operated by Calzare Heels Private Limited. Processing turnaround 1–2 business days, estimated delivery 3–7 business days across India.',
      },
      { upsert: true, new: true }
    );
    console.log('[SeedPolicies] Shipping Policy created/updated');

    // 2. Seed or Update Returns & Exchange Policy (/returns)
    await CMSPage.findOneAndUpdate(
      { slug: 'returns' },
      {
        title: 'Refund, Return & Exchange Policy',
        slug: 'returns',
        content: returnPolicyHtml,
        excerpt: 'Official Refund, Return & Exchange Policy of CALZARE™ operated by Calzare Heels Private Limited. 3-day size exchange window, ₹149 exchange fee, 48-hour damaged/defective claim notice.',
        category: 'policy',
        isPublished: true,
        metaTitle: 'Refund, Return & Exchange Policy | CALZARE™',
        metaDescription: 'Read the official Refund, Return & Exchange Policy of CALZARE™ operated by Calzare Heels Private Limited. 3-day size exchange window, ₹149 exchange fee, 48-hour damaged/defective claim notice.',
      },
      { upsert: true, new: true }
    );
    console.log('[SeedPolicies] Returns Policy created/updated');

    // 3. Seed or Update Refund Policy (/refund-policy)
    await CMSPage.findOneAndUpdate(
      { slug: 'refund-policy' },
      {
        title: 'Refund, Return & Exchange Policy',
        slug: 'refund-policy',
        content: returnPolicyHtml,
        excerpt: 'Official Refund, Return & Exchange Policy of CALZARE™ operated by Calzare Heels Private Limited. 3-day size exchange window, ₹149 exchange fee, 48-hour damaged/defective claim notice.',
        category: 'policy',
        isPublished: true,
        metaTitle: 'Refund Policy | CALZARE™',
        metaDescription: 'Read the official Refund, Return & Exchange Policy of CALZARE™ operated by Calzare Heels Private Limited. 3-day size exchange window, ₹149 exchange fee, 48-hour damaged/defective claim notice.',
      },
      { upsert: true, new: true }
    );
    console.log('[SeedPolicies] Refund Policy created/updated');

    // 4. Seed or Update Terms & Conditions (/terms and /terms-and-conditions)
    for (const slug of ['terms', 'terms-and-conditions']) {
      await CMSPage.findOneAndUpdate(
        { slug },
        {
          title: 'Terms & Conditions',
          slug,
          content: termsPolicyHtml,
          excerpt: 'Official Terms & Conditions of CALZARE™ operated by Calzare Heels Private Limited. Governing website usage, product purchases, order acceptance, warranties, and consumer rights.',
          category: 'legal',
          isPublished: true,
          metaTitle: 'Terms & Conditions | CALZARE™',
          metaDescription: 'Review the official Terms & Conditions of CALZARE™ operated by Calzare Heels Private Limited. Clear guidelines on purchases, payments, shipping, exchanges, and customer rights.',
        },
        { upsert: true, new: true }
      );
    }
    console.log('[SeedPolicies] Terms & Conditions created/updated');

    // 5. Seed or Update Privacy Policy (/privacy and /privacy-policy)
    for (const slug of ['privacy', 'privacy-policy']) {
      await CMSPage.findOneAndUpdate(
        { slug },
        {
          title: 'Privacy Policy',
          slug,
          content: privacyPolicyHtml,
          excerpt: 'Official Privacy Policy of CALZARE™ operated by Calzare Heels Private Limited. We never sell customer records. Zero data sale commitment with bank-grade encryption.',
          category: 'legal',
          isPublished: true,
          metaTitle: 'Privacy Policy | CALZARE™',
          metaDescription: 'Read how CALZARE™ protects your data. Strict zero data-selling policy, bank-grade encryption, and adherence to Indian IT rules and Consumer Protection policies.',
        },
        { upsert: true, new: true }
      );
    }
    console.log('[SeedPolicies] Privacy Policy created/updated');

    // 6. Seed or Update Size Guide (/size-guide)
    await CMSPage.findOneAndUpdate(
      { slug: 'size-guide' },
      {
        title: 'Official Size Guide & Foot Measurement',
        slug: 'size-guide',
        content: sizeGuideHtml,
        excerpt: 'Find your perfect CALZARE fit with our UK/India size conversion chart and step-by-step home foot measurement instructions.',
        category: 'guide',
        isPublished: true,
        metaTitle: 'Official Size Guide | CALZARE™',
        metaDescription: 'Find your perfect CALZARE fit with our UK/India size conversion chart and step-by-step home foot measurement instructions.',
      },
      { upsert: true, new: true }
    );
    console.log('[SeedPolicies] Size Guide created/updated');

    // 7. Seed or Update Navigation Menus for Footer Care & Support, and Policies
    await NavigationMenu.findOneAndUpdate(
      { menuKey: 'footer_help' },
      {
        menuKey: 'footer_help',
        title: 'Care & Support',
        isActive: true,
        items: [
          { label: 'Contact Us', url: '/contact', isExternal: false, displayOrder: 0 },
          { label: 'Track My Order', url: '/track-order', isExternal: false, displayOrder: 1 },
          { label: 'Official Size Guide', url: '/size-guide', isExternal: false, displayOrder: 2 },
          { label: 'Frequently Asked Questions', url: '/faq', isExternal: false, displayOrder: 3 },
          { label: 'About CALZARE', url: '/about', isExternal: false, displayOrder: 4 },
        ],
      },
      { upsert: true, new: true }
    );
    console.log('[SeedPolicies] Navigation menu footer_help updated');

    await NavigationMenu.findOneAndUpdate(
      { menuKey: 'footer_about' },
      {
        menuKey: 'footer_about',
        title: 'Policies',
        isActive: true,
        items: [
          { label: 'Terms & Conditions', url: '/terms', isExternal: false, displayOrder: 0 },
          { label: 'Privacy Policy', url: '/privacy', isExternal: false, displayOrder: 1 },
          { label: 'Shipping & Delivery Policy', url: '/shipping', isExternal: false, displayOrder: 2 },
          { label: 'Return & Exchange Policy', url: '/returns', isExternal: false, displayOrder: 3 },
          { label: 'Refund Policy', url: '/refund-policy', isExternal: false, displayOrder: 4 },
        ],
      },
      { upsert: true, new: true }
    );
    console.log('[SeedPolicies] Navigation menu footer_about updated');

    // 8. Update StoreSetting with authoritative company and policy copy defaults
    let settings = await StoreSetting.findOne();
    if (!settings) {
      settings = new StoreSetting();
    }
    settings.legalCompanyName = 'Calzare Heels Private Limited';
    settings.storeName = 'CALZARE';
    settings.websiteUrl = 'calzare.in';
    settings.contactEmail = 'Admin@calzareheels.com';
    settings.productPageDefaults = {
      ...(settings.productPageDefaults || {}),
      shippingHeading: 'Shipping & Delivery',
      dispatchInfo: 'Orders are processed within 1–2 business days. Estimated delivery time is 3–7 business days after dispatch across India.',
      deliveryGuidance: 'Tracking link sent via SMS/Email upon dispatch. Real-time courier updates available for serviceable PIN codes.',
      codMessage: 'Cash on Delivery (COD) & Partial COD available for eligible PIN codes across India.',
      returnsHeading: 'Refund, Return & Exchange Policy',
      returnPolicy: 'Size exchange requests must be submitted within 3 days of delivery (disclosed exchange fee of ₹149 applies to help cover shipping & logistics). Damaged or defective items must be reported within 48 hours with photos or an unboxing video. No fee applies when attributable to CALZARE™.',
      trustBadge1: 'Free Express Shipping Across India',
      trustBadge2: '3-Day Doorstep Size Exchange (₹149 Fee)',
      trustBadge3: '100% Genuine CALZARE™ Footwear',
      trustBadge4: 'Cash on Delivery & Partial COD Available',
    };

    await settings.save();
    console.log('[SeedPolicies] StoreSetting updated with authoritative policy defaults');

    await mongoose.disconnect();
    console.log('[SeedPolicies] Completed successfully');
  } catch (err) {
    console.error('[SeedPolicies] Error:', err);
    process.exit(1);
  }
}

seedPolicies();
