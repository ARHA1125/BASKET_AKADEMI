import { test, expect } from '@playwright/test';
import { registerAndLogin } from './helpers';

test.describe('Administration Module API Tests', () => {
  let adminHeaders: Record<string, string>;
  let sponsorId: string;
  let galleryId: string;
  let newsId: string;

  const gallerySlug = `gallery-slug-${Date.now()}`;
  const newsSlug = `news-slug-${Date.now()}`;

  test.beforeAll(async ({ request }) => {
    const admin = await registerAndLogin(request, 'ADMIN');
    adminHeaders = admin.headers;
  });

  // --- SPONSORS TESTS ---
  test.describe('Sponsors APIs', () => {
    test('should create, list, view, update, and delete sponsors', async ({ request }) => {
      // 1. Create Sponsor
      const createRes = await request.post('/administration/sponsors', {
        headers: {
          ...adminHeaders,
          'Content-Type': undefined,
          'content-type': undefined,
        },
        multipart: {
          name: `Sponsor-${Date.now()}`,
          logo: {
            name: 'logo.png',
            mimeType: 'image/png',
            buffer: Buffer.from('fake-logo-data'),
          },
          agreementDoc: {
            name: 'doc.pdf',
            mimeType: 'application/pdf',
            buffer: Buffer.from('fake-agreement-data'),
          },
        },
      });
      if (createRes.status() !== 201) {
        console.error("FAILED CREATE SPONSOR:", await createRes.text());
      }
      expect(createRes.status()).toBe(201);
      const sponsor = await createRes.json();
      expect(sponsor.id).toBeDefined();
      sponsorId = sponsor.id;

      // 2. Find All Sponsors (Admin/Protected)
      const listRes = await request.get('/administration/sponsors', {
        headers: adminHeaders,
      });
      expect(listRes.status()).toBe(200);
      const list = await listRes.json();
      expect(Array.isArray(list)).toBe(true);

      // 3. Find All Sponsors (Public)
      const listPublicRes = await request.get('/administration/sponsors/public');
      expect(listPublicRes.status()).toBe(200);

      // 4. View Sponsor Detail
      const findOneRes = await request.get(`/administration/sponsors/${sponsorId}`, {
        headers: adminHeaders,
      });
      expect(findOneRes.status()).toBe(200);

      // 5. Update Sponsor
      const updateRes = await request.patch(`/administration/sponsors/${sponsorId}`, {
        headers: {
          ...adminHeaders,
          'Content-Type': undefined,
          'content-type': undefined,
        },
        multipart: {
          name: `Sponsor-Updated-${Date.now()}`,
        },
      });
      if (updateRes.status() !== 200) {
        console.error("FAILED UPDATE SPONSOR:", await updateRes.text());
      }
      expect(updateRes.status()).toBe(200);

      // 6. Remove Sponsor
      const removeRes = await request.delete(`/administration/sponsors/${sponsorId}`, {
        headers: adminHeaders,
      });
      expect(removeRes.status()).toBe(200);
    });
  });

  // --- GALLERY TESTS ---
  test.describe('Gallery APIs', () => {
    test('should create, list, view, update, and delete gallery albums', async ({ request }) => {
      // 1. Create Gallery Album
      const createRes = await request.post('/administration/gallery', {
        headers: adminHeaders,
        data: {
          slug: gallerySlug,
          title: 'Wira Bhakti Cup 2026',
          category: 'Event',
          date: '2026-06-20',
          cover: '/img/gallery/cover.png',
          description: 'Documentation of cup 2026 matches',
          photos: JSON.stringify([{ url: '/img/gallery/photo1.png', caption: 'Match 1' }]),
          status: 'published',
        },
      });
      expect(createRes.status()).toBe(201);
      const album = await createRes.json();
      expect(album.id).toBeDefined();
      galleryId = album.id;

      // 2. Find All Albums (Admin)
      const listRes = await request.get('/administration/gallery', {
        headers: adminHeaders,
      });
      expect(listRes.status()).toBe(200);

      // 3. Find Published Albums (Public)
      const listPubRes = await request.get('/administration/gallery/published');
      expect(listPubRes.status()).toBe(200);

      // 4. Find Album By Slug (Public)
      const findSlugRes = await request.get(`/administration/gallery/slug/${gallerySlug}`);
      expect(findSlugRes.status()).toBe(200);

      // 5. Update Album
      const updateRes = await request.patch(`/administration/gallery/${galleryId}`, {
        headers: adminHeaders,
        data: {
          title: 'Wira Bhakti Cup 2026 Grand Final',
        },
      });
      expect(updateRes.status()).toBe(200);

      // 6. Delete Album
      const removeRes = await request.delete(`/administration/gallery/${galleryId}`, {
        headers: adminHeaders,
      });
      expect(removeRes.status()).toBe(200);
    });
  });

  // --- NEWS TESTS ---
  test.describe('News APIs', () => {
    test('should create, list, view, update, and delete news articles', async ({ request }) => {
      // 1. Create News Article
      const createRes = await request.post('/administration/news', {
        headers: adminHeaders,
        data: {
          slug: newsSlug,
          title: 'Wira Bhakti Team wins Cup',
          category: 'Achievement',
          date: '2026-06-22',
          image: '/img/news/victory.png',
          excerpt: 'We won the grand final championship match',
          author: 'Admin Team',
          readTime: '3 min read',
          content: JSON.stringify([{ type: 'paragraph', value: 'It was a tight game but we won.' }]),
          status: 'published',
        },
      });
      expect(createRes.status()).toBe(201);
      const news = await createRes.json();
      expect(news.id).toBeDefined();
      newsId = news.id;

      // 2. Find All News (Admin)
      const listRes = await request.get('/administration/news', {
        headers: adminHeaders,
      });
      expect(listRes.status()).toBe(200);

      // 3. Find Published News (Public)
      const listPubRes = await request.get('/administration/news/published');
      expect(listPubRes.status()).toBe(200);

      // 4. Find News By Slug (Public)
      const findSlugRes = await request.get(`/administration/news/slug/${newsSlug}`);
      expect(findSlugRes.status()).toBe(200);

      // 5. Update News Article
      const updateRes = await request.patch(`/administration/news/${newsId}`, {
        headers: adminHeaders,
        data: {
          title: 'Wira Bhakti Team Wins Cup Gold Medal',
        },
      });
      expect(updateRes.status()).toBe(200);

      // 6. Delete News Article
      const removeRes = await request.delete(`/administration/news/${newsId}`, {
        headers: adminHeaders,
      });
      expect(removeRes.status()).toBe(200);
    });
  });
});
