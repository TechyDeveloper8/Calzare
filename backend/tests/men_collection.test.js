import test from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = process.env.TEST_API_URL || 'http://127.0.0.1:5000/api/v1';

test('1. Men Collection Catalog Endpoint & CMS Metadata', async () => {
  const res = await fetch(`${BASE_URL}/catalog/collections/men`);
  assert.equal(res.status, 200, 'Men collection endpoint should return 200');

  const data = await res.json();
  assert.equal(data.success, true);
  assert.ok(data.collection, 'Response must have collection object');
  assert.equal(data.collection.slug, 'men');

  // Verify CMS Hero Configuration
  const hero = data.collection.hero;
  assert.ok(hero, 'Collection must have CMS hero configuration');
  assert.equal(hero.isVisible, true, 'Hero should be visible');
  assert.equal(hero.label, "THE MEN'S EDIT");
  assert.equal(hero.heading, 'BUILT TO STAND OUT.');
  assert.ok(hero.supportingText, 'Hero must contain supporting copy');
  assert.ok(hero.desktopBannerUrl, 'Hero must have desktop banner URL');

  // Verify Category Shortcuts
  assert.ok(Array.isArray(data.collection.categoryShortcuts), 'categoryShortcuts should be an array');
  assert.ok(data.collection.categoryShortcuts.length >= 3, 'Must have shortcuts for catalog categories');

  // Verify real products returned
  assert.ok(Array.isArray(data.products), 'Products should be an array');
  assert.ok(data.products.length >= 4, 'Should return real Men/Unisex products from database');
  
  // Verify real categories
  assert.ok(Array.isArray(data.categories), 'Categories should be an array');
  assert.ok(data.categories.length >= 3, 'Should list real catalog categories');
});

test('2. Men Collection Filter & Sorting Engine', async () => {
  // Test Category Filter (Clogs)
  const clogsRes = await fetch(`${BASE_URL}/products?audience=Men&category=clogs`);
  assert.equal(clogsRes.status, 200);
  const clogsData = await clogsRes.json();
  assert.ok(clogsData.products.length > 0, 'Must return clogs for Men');
  for (const p of clogsData.products) {
    assert.equal(p.category.slug, 'clogs');
  }

  // Test Size Filter (UK 8)
  const sizeRes = await fetch(`${BASE_URL}/products?audience=Men&size=UK+8`);
  assert.equal(sizeRes.status, 200);
  const sizeData = await sizeRes.json();
  assert.ok(sizeData.products.length > 0, 'Must return products available in UK 8');
  for (const p of sizeData.products) {
    const hasUK8 = p.variants.some(v => v.sizes.some(s => s.size === 'UK 8' && s.stock > 0));
    assert.ok(hasUK8, `Product ${p.name} must have UK 8 in stock`);
  }

  // Test Price Sorting (Low to High)
  const sortRes = await fetch(`${BASE_URL}/products?audience=Men&sort=price_asc`);
  assert.equal(sortRes.status, 200);
  const sortData = await sortRes.json();
  assert.ok(sortData.products.length >= 2);
  for (let i = 0; i < sortData.products.length - 1; i++) {
    assert.ok(
      sortData.products[i].baseSalePrice <= sortData.products[i + 1].baseSalePrice,
      `Products should be ordered by price ascending: ${sortData.products[i].baseSalePrice} <= ${sortData.products[i + 1].baseSalePrice}`
    );
  }

  // Test In-Stock Availability Filter
  const availRes = await fetch(`${BASE_URL}/products?audience=Men&availability=in_stock`);
  assert.equal(availRes.status, 200);
  const availData = await availRes.json();
  assert.ok(availData.products.length > 0, 'In-stock filter should return available items');
});

test('3. Admin CMS Collection Hero & Editorial Banner Customization Pipeline', async () => {
  // Login as admin
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@calzare.com',
      password: 'Admin@123456',
    }),
  });
  assert.equal(loginRes.status, 200);
  const loginData = await loginRes.json();
  const token = loginData.token;
  assert.ok(token, 'Must obtain admin JWT');

  // Fetch current men collection
  const collRes = await fetch(`${BASE_URL}/catalog/collections/men`);
  const collData = await collRes.json();
  const collectionId = collData.collection._id;

  // Update hero copy via admin API
  const updatedHeadline = 'BUILT TO STAND OUT. (UPDATED CMS)';
  const updateRes = await fetch(`${BASE_URL}/catalog/collections/${collectionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      hero: {
        ...collData.collection.hero,
        heading: updatedHeadline,
      },
    }),
  });
  assert.equal(updateRes.status, 200, 'Admin collection update should succeed');

  // Verify storefront reflects the updated CMS content
  const verifyRes = await fetch(`${BASE_URL}/catalog/collections/men`);
  const verifyData = await verifyRes.json();
  assert.equal(verifyData.collection.hero.heading, updatedHeadline);

  // Restore original headline
  await fetch(`${BASE_URL}/catalog/collections/${collectionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      hero: {
        ...collData.collection.hero,
        heading: 'BUILT TO STAND OUT.',
      },
    }),
  });

  // Verify restored
  const finalRes = await fetch(`${BASE_URL}/catalog/collections/men`);
  const finalData = await finalRes.json();
  assert.equal(finalData.collection.hero.heading, 'BUILT TO STAND OUT.');
});
