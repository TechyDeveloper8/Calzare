import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Collection } from '../models/Collection.js';
import { User } from '../models/User.js';

dotenv.config();

const BASE_URL = 'http://localhost:5000/api/v1';

test('Collection Hero CMS Full Lifecycle Test (Women, Men, Kids)', async (t) => {
  let adminToken = '';
  let womenCol = null;
  let kidsCol = null;
  let menCol = null;

  await t.test('1. Admin logs in to obtain JWT', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@calzare.com',
        password: 'Admin@123456',
      }),
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(data.token);
    adminToken = data.token;
  });

  await t.test('2. Admin gets all collections taxonomy', async () => {
    const res = await fetch(`${BASE_URL}/catalog/collections/admin/all`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.collections));

    womenCol = data.collections.find((c) => c.slug === 'women');
    kidsCol = data.collections.find((c) => c.slug === 'kids');
    menCol = data.collections.find((c) => c.slug === 'men');

    assert.ok(womenCol, "Women's collection must exist in database");
    assert.ok(kidsCol, "Kids' collection must exist in database");
    assert.ok(menCol, "Men's collection must exist in database");
  });

  await t.test('3. Admin customizes and updates Women collection hero banner', async () => {
    const heroPayload = {
      hero: {
        label: "THE WOMEN'S EDIT",
        heading: 'EFFORTLESS REBOUND.',
        supportingText: 'No laces, no rush — comfort that clocks off exactly when you do.',
        desktopBannerUrl: '/images/split/women-collection-image.jpg',
        mobileBannerUrl: '',
        imagePosition: 'center center',
        background: 'editorial_minimal',
        ctaText: 'EXPLORE DROP',
        ctaLink: '#collection-grid',
        isVisible: true,
      },
    };

    const res = await fetch(`${BASE_URL}/catalog/collections/${womenCol._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(heroPayload),
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.collection.hero.label, "THE WOMEN'S EDIT");
    assert.equal(data.collection.hero.heading, 'EFFORTLESS REBOUND.');
    assert.equal(data.collection.hero.desktopBannerUrl, '/images/split/women-collection-image.jpg');
    assert.equal(data.collection.slug, 'women', 'Slug must not be mutated on update');
  });

  await t.test('4. Admin customizes and updates Kids collection hero banner', async () => {
    const heroPayload = {
      hero: {
        label: "THE KIDS' EDIT",
        heading: 'BUILT FOR PLAY.',
        supportingText: 'Featherlight, washable, and ultra-durable comfort for little explorers everywhere.',
        desktopBannerUrl: '/images/split/kids-collection-image.jpg',
        mobileBannerUrl: '',
        imagePosition: 'center center',
        background: 'editorial_minimal',
        ctaText: 'EXPLORE DROP',
        ctaLink: '#collection-grid',
        isVisible: true,
      },
    };

    const res = await fetch(`${BASE_URL}/catalog/collections/${kidsCol._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(heroPayload),
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.collection.hero.label, "THE KIDS' EDIT");
    assert.equal(data.collection.hero.heading, 'BUILT FOR PLAY.');
    assert.equal(data.collection.hero.desktopBannerUrl, '/images/split/kids-collection-image.jpg');
    assert.equal(data.collection.slug, 'kids', 'Slug must not be mutated on update');
  });

  await t.test('5. Public visitor retrieves Women collection and sees updated hero metadata', async () => {
    const res = await fetch(`${BASE_URL}/catalog/collections/women`);
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(data.collection);
    assert.equal(data.collection.hero.label, "THE WOMEN'S EDIT");
    assert.equal(data.collection.hero.heading, 'EFFORTLESS REBOUND.');
    assert.equal(
      data.collection.hero.supportingText,
      'No laces, no rush — comfort that clocks off exactly when you do.'
    );
    assert.equal(data.collection.hero.desktopBannerUrl, '/images/split/women-collection-image.jpg');
    assert.equal(data.collection.hero.ctaText, 'EXPLORE DROP');
    assert.equal(data.collection.hero.ctaLink, '#collection-grid');
  });

  await t.test('6. Public visitor retrieves Kids collection and sees updated hero metadata', async () => {
    const res = await fetch(`${BASE_URL}/catalog/collections/kids`);
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
    assert.ok(data.collection);
    assert.equal(data.collection.hero.label, "THE KIDS' EDIT");
    assert.equal(data.collection.hero.heading, 'BUILT FOR PLAY.');
    assert.equal(data.collection.hero.desktopBannerUrl, '/images/split/kids-collection-image.jpg');
  });
});
