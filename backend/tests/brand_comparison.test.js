import test from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = process.env.TEST_API_URL || 'http://127.0.0.1:5000/api/v1';

test('Brand Comparison ("See the Difference") Full Lifecycle & Hierarchy Test', async (t) => {
  // 1. Fetch products list to identify test products
  const productsRes = await fetch(`${BASE_URL}/products?limit=5`);
  assert.equal(productsRes.status, 200);
  const productsData = await productsRes.json();
  assert.ok(productsData.products && productsData.products.length >= 2, 'Must have at least 2 products');
  const prodA = productsData.products[0];
  const prodB = productsData.products[1];

  // 2. Admin login
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@calzare.com', password: 'Admin@123456' }),
  });
  assert.equal(loginRes.status, 200, 'Admin login should succeed');
  const loginData = await loginRes.json();
  const token = loginData.token;
  assert.ok(token, 'Must receive auth token');

  // 3. Test initial state or configure global Brand Comparison in Store Settings
  const initialSettingsRes = await fetch(`${BASE_URL}/settings/admin`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(initialSettingsRes.status, 200);
  const initialSettingsData = await initialSettingsRes.json();
  const originalBrandComparison = initialSettingsData.settings?.brandComparisonDefault || {};

  // 4. Reset Product A to 'inherit' mode and update global settings with SolaWorld reference graphic
  await fetch(`${BASE_URL}/products/${prodA._id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      brandComparison: {
        mode: 'inherit',
      },
    }),
  });

  const updateSettingsRes = await fetch(`${BASE_URL}/settings/admin`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      brandComparisonDefault: {
        isEnabled: true,
        isPublished: true,
        heading: 'SEE THE DIFFERENCE',
        subheading: 'How CALZARE closed-cell foam compares to standard footwear',
        desktopMediaUrl: 'https://solaworld.in/cdn/shop/files/Battlecard-Web.png?v=1789572716&width=2000',
        mobileMediaUrl: '',
        altText: 'Brand comparison',
        displayOrder: 0,
        scope: 'all',
        selectedProductIds: [],
        selectedCollectionIds: [],
      },
    }),
  });
  assert.equal(updateSettingsRes.status, 200, 'Should update settings with brand comparison');

  // 5. Verify Storefront anonymous PDP receives global comparison
  const anonPdpRes = await fetch(`${BASE_URL}/products/${prodA.slug}`);
  assert.equal(anonPdpRes.status, 200);
  const anonPdpData = await anonPdpRes.json();
  if (!anonPdpData.brandComparison) {
    console.log('DEBUG anonPdpData:', JSON.stringify({
      brandComparison: anonPdpData.brandComparison,
      brandComparisonDefault: anonPdpData.brandComparisonDefault,
      productBC: anonPdpData.product?.brandComparison
    }, null, 2));
  }
  assert.ok(anonPdpData.brandComparison, 'Anonymous visitor should receive published brand comparison');
  assert.equal(anonPdpData.brandComparison.heading, 'SEE THE DIFFERENCE');
  assert.equal(anonPdpData.brandComparison.altText, 'Brand comparison');
  assert.equal(
    anonPdpData.brandComparison.desktopMediaUrl,
    'https://solaworld.in/cdn/shop/files/Battlecard-Web.png?v=1789572716&width=2000'
  );

  // 6. Test Product-level Override: mode = 'disabled'
  const disableProdRes = await fetch(`${BASE_URL}/products/${prodA._id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      brandComparison: {
        mode: 'disabled',
      },
    }),
  });
  assert.equal(disableProdRes.status, 200);

  // Verify Product A now returns NO brand comparison
  const pdpADisabledRes = await fetch(`${BASE_URL}/products/${prodA.slug}`);
  const pdpADisabledData = await pdpADisabledRes.json();
  assert.equal(pdpADisabledData.brandComparison, null, 'Disabled product must return null brandComparison');

  // Verify Product B STILL returns global brand comparison
  const pdpBRes = await fetch(`${BASE_URL}/products/${prodB.slug}`);
  const pdpBData = await pdpBRes.json();
  assert.ok(pdpBData.brandComparison, 'Product B should still inherit global brand comparison');
  assert.equal(pdpBData.brandComparison.heading, 'SEE THE DIFFERENCE');

  // 7. Test Product-level Override: mode = 'custom'
  const customProdRes = await fetch(`${BASE_URL}/products/${prodA._id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      brandComparison: {
        mode: 'custom',
        isEnabled: true,
        isPublished: true,
        heading: 'PROD-A EXCLUSIVE COMPARISON',
        subheading: 'Custom engineered closed-cell specs for this silhouette',
        desktopMediaUrl: 'https://solaworld.in/cdn/shop/files/Battlecard-Web.png?v=1789572716&width=2000',
        altText: 'Custom brand comparison',
        displayOrder: 1,
      },
    }),
  });
  assert.equal(customProdRes.status, 200);

  // Verify Product A now returns custom comparison
  const pdpACustomRes = await fetch(`${BASE_URL}/products/${prodA.slug}`);
  const pdpACustomData = await pdpACustomRes.json();
  assert.ok(pdpACustomData.brandComparison, 'Custom override product must return brandComparison');
  assert.equal(pdpACustomData.brandComparison.heading, 'PROD-A EXCLUSIVE COMPARISON');
  assert.equal(pdpACustomData.brandComparison.altText, 'Custom brand comparison');

  // 8. Test Draft state: When custom comparison isDraft (isPublished = false)
  const draftProdRes = await fetch(`${BASE_URL}/products/${prodA._id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      brandComparison: {
        mode: 'custom',
        isEnabled: true,
        isPublished: false, // DRAFT
        heading: 'DRAFT COMPARISON',
        desktopMediaUrl: 'https://solaworld.in/cdn/shop/files/Battlecard-Web.png?v=1789572716&width=2000',
      },
    }),
  });
  assert.equal(draftProdRes.status, 200);

  // Anonymous request should receive NULL because it is draft
  const pdpADraftAnonRes = await fetch(`${BASE_URL}/products/${prodA.slug}`);
  const pdpADraftAnonData = await pdpADraftAnonRes.json();
  assert.equal(pdpADraftAnonData.brandComparison, null, 'Draft comparison must be hidden from anonymous visitors');

  // Authenticated Admin request SHOULD receive the draft for preview!
  const pdpADraftAdminRes = await fetch(`${BASE_URL}/products/${prodA.slug}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const pdpADraftAdminData = await pdpADraftAdminRes.json();
  assert.ok(pdpADraftAdminData.brandComparison, 'Admin should receive draft comparison for preview');
  assert.equal(pdpADraftAdminData.brandComparison.isDraft, true, 'isDraft must be true for admin preview');
  assert.equal(pdpADraftAdminData.brandComparison.heading, 'DRAFT COMPARISON');

  // 9. Reset Product A back to 'inherit' mode
  await fetch(`${BASE_URL}/products/${prodA._id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      brandComparison: {
        mode: 'inherit',
      },
    }),
  });

  // Verify Product A is back to inheriting global comparison
  const pdpAResetRes = await fetch(`${BASE_URL}/products/${prodA.slug}`);
  const pdpAResetData = await pdpAResetRes.json();
  assert.ok(pdpAResetData.brandComparison);
  assert.equal(pdpAResetData.brandComparison.heading, 'SEE THE DIFFERENCE');
});
