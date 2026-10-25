import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { verifyRazorpaySignature } from '../utils/razorpayHelper.js';

const BASE_URL = process.env.TEST_API_URL || 'http://127.0.0.1:5000/api/v1';

test('1. Razorpay Cryptographic HMAC-SHA256 Signature Verification', async (t) => {
  const secret = process.env.RAZORPAY_KEY_SECRET || 'calzareRazorpaySecretTest98765';
  const orderId = 'order_987654321';
  const paymentId = 'pay_123456789';

  const body = `${orderId}|${paymentId}`;
  const validSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');

  // Valid signature check
  const isValid = verifyRazorpaySignature(orderId, paymentId, validSignature);
  assert.equal(isValid, true, 'Valid signature should be accepted');

  // Tampered signature check
  const tamperedSignature = validSignature.substring(0, validSignature.length - 4) + '0000';
  const isInvalid = verifyRazorpaySignature(orderId, paymentId, tamperedSignature);
  assert.equal(isInvalid, false, 'Tampered signature must be rejected');
});

test('2. Public Products Catalog & Variant Isolation Structure', async () => {
  const res = await fetch(`${BASE_URL}/products`);
  assert.equal(res.status, 200);
  const data = await res.json();

  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.products), 'Products should be an array');
  assert.ok(data.products.length >= 6, 'Seed should provide at least 6 products');

  const firstProduct = data.products[0];
  assert.ok(firstProduct.name, 'Product must have a name');
  assert.ok(firstProduct.slug, 'Product must have a URL slug');
  assert.ok(firstProduct.variants && firstProduct.variants.length > 0, 'Product must have variants populated');

  const firstVariant = firstProduct.variants[0];
  assert.ok(firstVariant.colorName, 'Variant must have a colorName');
  assert.ok(firstVariant.colorHex, 'Variant must have a colorHex');
  assert.ok(Array.isArray(firstVariant.sizes), 'Variant must have a sizes array');
  assert.ok(firstVariant.sizes.length > 0, 'Variant sizes array must not be empty');

  const firstSize = firstVariant.sizes[0];
  assert.ok(firstSize.size.startsWith('UK'), 'Size must follow UK standard (e.g., UK 7)');
  assert.ok(typeof firstSize.stock === 'number', 'Stock must be a number');
});

test('3. Promotional Coupon Validation Engine', async () => {
  // Test valid coupon WELCOME10 (10% off)
  const res = await fetch(`${BASE_URL}/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'WELCOME10', cartSubtotal: 2000 }),
  });
  const data = await res.json();

  assert.equal(res.status, 200);
  assert.equal(data.success, true);
  assert.equal(data.coupon.code, 'WELCOME10');
  assert.equal(data.coupon.calculatedDiscount, 200, '10% of 2000 should be 200');

  // Test invalid coupon
  const invalidRes = await fetch(`${BASE_URL}/coupons/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'FAKECOUPON99', cartSubtotal: 2000 }),
  });
  assert.equal(invalidRes.status, 400);
});

test('4. Role-Based Access Control (RBAC) Security on Admin Endpoints', async () => {
  // Unauthenticated request should be rejected (401)
  const unauthRes = await fetch(`${BASE_URL}/orders/admin/all`);
  assert.equal(unauthRes.status, 401, 'Unauthenticated access to admin orders must be 401');

  // Customer login
  const customerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'anurag@calzare.com', password: 'Customer@123' }),
  });
  const customerData = await customerLoginRes.json();
  assert.equal(customerLoginRes.status, 200);
  assert.ok(customerData.token, 'Customer should receive JWT');

  // Customer accessing admin endpoint should be forbidden (403)
  const forbiddenRes = await fetch(`${BASE_URL}/orders/admin/all`, {
    headers: { Authorization: `Bearer ${customerData.token}` },
  });
  assert.equal(forbiddenRes.status, 403, 'Customer role must receive 403 Forbidden on admin orders');

  // Admin login
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@calzare.com', password: 'Admin@123456' }),
  });
  const adminData = await adminLoginRes.json();
  assert.equal(adminLoginRes.status, 200);
  assert.ok(adminData.token, 'Admin should receive JWT');

  // Admin accessing admin endpoint should succeed (200)
  const authorizedRes = await fetch(`${BASE_URL}/orders/admin/all`, {
    headers: { Authorization: `Bearer ${adminData.token}` },
  });
  assert.equal(authorizedRes.status, 200, 'Admin role must receive 200 OK');
});

test('5. Inventory Overview & Size Matrix for Warehouse', async () => {
  // Admin login
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@calzare.com', password: 'Admin@123456' }),
  });
  const adminData = await adminLoginRes.json();

  const invRes = await fetch(`${BASE_URL}/inventory/overview`, {
    headers: { Authorization: `Bearer ${adminData.token}` },
  });
  assert.equal(invRes.status, 200);
  const invData = await invRes.json();

  assert.equal(invData.success, true);
  assert.ok(invData.stats.totalSkus > 0, 'Warehouse should track total SKUs');
  assert.ok(invData.stats.totalStockUnits > 0, 'Warehouse should track stock units');
  assert.ok(Array.isArray(invData.inventory), 'Inventory matrix should be an array');
});

test('6. Dynamic Homepage CMS Configuration Pipeline', async () => {
  const res = await fetch(`${BASE_URL}/homepage`);
  assert.equal(res.status, 200);
  const data = await res.json();

  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.sections), 'Homepage must return sections array');
  assert.ok(data.sections.length >= 8, 'Homepage should return full suite of CMS sections');

  const sectionTypes = data.sections.map((s) => s.sectionType);
  assert.ok(sectionTypes.includes('hero'), 'Homepage must include hero');
  assert.ok(sectionTypes.includes('ticker'), 'Homepage must include ticker');
  assert.ok(sectionTypes.includes('bestsellers'), 'Homepage must include bestsellers');
  assert.ok(sectionTypes.includes('affordable_store'), 'Homepage must include affordable_store');
});

test('7. End-to-End Real Order Checkout & Inventory Decrement', async () => {
  // 1. Fetch products to get a real variant and size
  const prodRes = await fetch(`${BASE_URL}/products`);
  const prodData = await prodRes.json();
  const product = prodData.products[0];
  const variant = product.variants[0];
  const sizeObj = variant.sizes[0];
  const initialStock = sizeObj.stock;

  // 2. Customer login
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'anurag@calzare.com', password: 'Customer@123' }),
  });
  const customer = await loginRes.json();

  // 3. Place real order
  const checkoutPayload = {
    customerName: 'Anurag Raj',
    customerPhone: '+91 98765 43210',
    guestEmail: 'anurag@calzare.com',
    shippingAddress: {
      fullName: 'Anurag Raj',
      phone: '+91 98765 43210',
      street: '12th Main Road, HAL 2nd Stage',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
      country: 'India',
    },
    items: [
      {
        productId: product._id,
        variantId: variant._id,
        size: sizeObj.size,
        quantity: 1,
      },
    ],
    couponCode: 'WELCOME10',
    paymentMethod: 'cod',
    notes: 'Testing end-to-end automated commerce lifecycle',
  };

  const orderRes = await fetch(`${BASE_URL}/orders/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${customer.token}`,
    },
    body: JSON.stringify(checkoutPayload),
  });

  assert.equal(orderRes.status, 201);
  const orderData = await orderRes.json();
  assert.equal(orderData.success, true);
  assert.ok(orderData.order.orderNumber.startsWith('CALZ-'), 'Order number must be generated');
  assert.equal(orderData.order.orderStatus, 'confirmed');
  assert.equal(orderData.order.paymentMethod, 'cod');

  // 4. Verify inventory was decremented in database
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@calzare.com', password: 'Admin@123456' }),
  });
  const adminData = await adminLoginRes.json();

  const invRes = await fetch(`${BASE_URL}/inventory/overview`, {
    headers: { Authorization: `Bearer ${adminData.token}` },
  });
  const invData = await invRes.json();

  const updatedItem = invData.inventory.find(
    (i) => i.variantId === variant._id && i.size === sizeObj.size
  );
  assert.ok(updatedItem, 'Inventory entry must exist');
  assert.equal(
    updatedItem.stock,
    initialStock - 1,
    'Stock must be exactly decremented by ordered quantity (1)'
  );

  // 5. Test Admin Order Fulfillment (Mark as Shipped)
  const shipRes = await fetch(`${BASE_URL}/orders/admin/${orderData.order._id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminData.token}`,
    },
    body: JSON.stringify({
      orderStatus: 'shipped',
      trackingInfo: {
        carrier: 'BlueDart Express',
        trackingNumber: 'BLD9876543210',
      },
      note: 'Handed over to courier partner',
    }),
  });

  assert.equal(shipRes.status, 200);
  const shipData = await shipRes.json();
  assert.equal(shipData.order.orderStatus, 'shipped');
  assert.equal(shipData.order.trackingInfo.carrier, 'BlueDart Express');
  assert.equal(shipData.order.trackingInfo.trackingNumber, 'BLD9876543210');

  // 6. Test Admin Order Cancellation & Stock Restoration
  const cancelRes = await fetch(`${BASE_URL}/orders/admin/${orderData.order._id}/cancel`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminData.token}`,
    },
    body: JSON.stringify({
      cancellationReason: 'Customer requested size change before dispatch',
    }),
  });

  assert.equal(cancelRes.status, 200);
  const cancelData = await cancelRes.json();
  assert.equal(cancelData.order.orderStatus, 'cancelled');

  // Verify stock was restored to initial value
  const restoredInvRes = await fetch(`${BASE_URL}/inventory/overview`, {
    headers: { Authorization: `Bearer ${adminData.token}` },
  });
  const restoredInvData = await restoredInvRes.json();
  const restoredItem = restoredInvData.inventory.find(
    (i) => i.variantId === variant._id && i.size === sizeObj.size
  );
  assert.equal(
    restoredItem.stock,
    initialStock,
    'Stock must be restored to initial value upon cancellation'
  );
});

test('8. Razorpay Webhook Cryptographic Security & Asynchronous Event Processing', async () => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || 'calzareRazorpaySecretTest98765';

  const webhookBody = {
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: 'pay_test_hook_12345',
          order_id: 'order_nonexistent_hook',
          status: 'captured',
          amount: 159900,
        },
      },
    },
  };

  const validSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(webhookBody))
    .digest('hex');

  // 1. Valid webhook call
  const validRes = await fetch(`${BASE_URL}/orders/webhook/razorpay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-razorpay-signature': validSignature,
    },
    body: JSON.stringify(webhookBody),
  });

  assert.equal(validRes.status, 200);
  const validData = await validRes.json();
  assert.equal(validData.status, 'ok');

  // 2. Tampered signature call
  const tamperedRes = await fetch(`${BASE_URL}/orders/webhook/razorpay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-razorpay-signature': 'invalid_forged_signature_hex_12345',
    },
    body: JSON.stringify(webhookBody),
  });

  assert.equal(tamperedRes.status, 400, 'Tampered webhook signature must be rejected with 400');
});

test('9. Public Order Tracking Verification Endpoint & Timeline', async () => {
  // Try tracking with missing fields -> expect 400
  const invalidRes = await fetch(`${BASE_URL}/orders/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderNumber: '' }),
  });
  assert.equal(invalidRes.status, 400);

  // Try tracking with non-existent credentials -> expect 404
  const notFoundRes = await fetch(`${BASE_URL}/orders/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderNumber: 'CALZ-9999-99999', emailOrPhone: 'nobody@example.com' }),
  });
  assert.equal(notFoundRes.status, 404);
});

test('10. Customer Support Inquiry Submission & Journal Editorial APIs', async () => {
  // Test contact inquiry submission
  const contactRes = await fetch(`${BASE_URL}/cms/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Rohan Sharma',
      email: 'rohan.sharma@example.com',
      phone: '+91 98765 11223',
      category: 'sizing_fit',
      message: 'Need advice on whether UK 8 or UK 9 is better for wide feet with socks.',
    }),
  });
  assert.equal(contactRes.status, 201);
  const contactData = await contactRes.json();
  assert.equal(contactData.success, true);
  assert.ok(contactData.inquiryId, 'Inquiry ID must be returned');

  // Test journal article listing
  const journalRes = await fetch(`${BASE_URL}/cms/journal`);
  assert.equal(journalRes.status, 200);
  const journalData = await journalRes.json();
  assert.equal(journalData.success, true);
  assert.ok(Array.isArray(journalData.articles));
  assert.ok(journalData.articles.length >= 1, 'Should return seeded journal articles');
});

