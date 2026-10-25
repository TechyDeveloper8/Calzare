import test from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:5000/api/v1';

test('Our Story CMS & Public Workflow', async (t) => {
  let adminToken = '';

  await t.test('1. Admin logs in to obtain auth token', async () => {
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
    assert.ok(data.token);
    adminToken = data.token;
  });

  await t.test('2. Admin gets story page draft data', async () => {
    const res = await fetch(`${BASE_URL}/story/admin`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.ok(data.success);
    assert.ok(data.page);
    assert.equal(data.page.slug, 'about-us');
    assert.ok(Array.isArray(data.catalog.collections));
    assert.ok(Array.isArray(data.catalog.categories));

    // Ensure page starts unpublished for idempotency across test re-runs
    await fetch(`${BASE_URL}/story/admin/unpublish`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
  });

  let createdSectionId = '';

  await t.test('3. Admin adds a hero section', async () => {
    const res = await fetch(`${BASE_URL}/story/admin/sections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        sectionType: 'hero',
        title: 'Story Hero',
        config: {
          eyebrow: 'BUILT ON PASSION',
          heading: '0% COMPROMISE. 100% REVOLUTION.',
          paragraph: 'Testing our dynamic story engine.',
          textAlign: 'center',
          backgroundTheme: 'warm_cream',
        },
      }),
    });
    const data = await res.json();
    assert.equal(res.status, 201);
    assert.ok(data.section?.sectionId);
    createdSectionId = data.section.sectionId;
    assert.equal(data.section.sectionType, 'hero');
  });

  await t.test('4. Admin adds brand statistics section', async () => {
    const res = await fetch(`${BASE_URL}/story/admin/sections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        sectionType: 'stats',
        title: 'Verified Milestones',
        config: {
          items: [
            {
              id: 'stat_1',
              value: '100%',
              label: 'Waterproof Engineering',
              description: 'Zero seam delamination',
              displayOrder: 0,
              isEnabled: true,
            },
          ],
        },
      }),
    });
    const data = await res.json();
    assert.equal(res.status, 201);
    assert.ok(data.section?.sectionId);
  });

  await t.test('5. Admin duplicates the hero section', async () => {
    const res = await fetch(`${BASE_URL}/story/admin/sections/${createdSectionId}/duplicate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.ok(data.success);
    assert.ok(data.page.sections.length >= 3);
  });

  await t.test('6. Public visitor sees nothing before publication', async () => {
    const res = await fetch(`${BASE_URL}/story`);
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.isPublished, false);
    assert.equal(data.page, null);
  });

  await t.test('7. Staff preview can view working draft', async () => {
    const res = await fetch(`${BASE_URL}/story?preview=true`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.isPreview, true);
    assert.ok(data.page?.sections?.length >= 3);
  });

  await t.test('8. Admin publishes the story page', async () => {
    const res = await fetch(`${BASE_URL}/story/admin/publish`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.ok(data.page.isPublished);
    assert.ok(data.page.publishedVersion >= 1);
  });

  await t.test('9. Public visitor sees published content after publication', async () => {
    const res = await fetch(`${BASE_URL}/story`);
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.isPublished, true);
    assert.ok(data.page?.sections?.length >= 3);
  });

  await t.test('10. Admin unpublishes the story page', async () => {
    const res = await fetch(`${BASE_URL}/story/admin/unpublish`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.page.isPublished, false);
  });

  await t.test('11. Cleanup test sections', async () => {
    const res = await fetch(`${BASE_URL}/story/admin`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();
    for (const sec of data.page.sections) {
      await fetch(`${BASE_URL}/story/admin/sections/${sec.sectionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
    }
  });
});
