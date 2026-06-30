import { test, expect } from '@playwright/test';
import { registerAndLogin, createStudentAndLogin } from './helpers';

test.describe('Marketplace API Controller Tests', () => {
  let adminHeaders: Record<string, string>;
  let studentHeaders: Record<string, string>;
  let categoryId: string;
  let productId: string;
  let orderId: string;

  test.beforeAll(async ({ request }) => {
    const admin = await registerAndLogin(request, 'ADMIN');
    adminHeaders = admin.headers;

    const student = await createStudentAndLogin(request, admin.headers);
    studentHeaders = student.headers;
  });

  test('should create, list, and update categories', async ({ request }) => {
    // 1. Create category
    const createRes = await request.post('/marketplace/categories', {
      headers: adminHeaders,
      data: {
        name: `Jersey-${Date.now()}`,
        description: 'Baju jersey club basketball',
      },
    });
    expect(createRes.status()).toBe(201);
    const category = await createRes.json();
    expect(category.id).toBeDefined();
    categoryId = category.id;

    // 2. Fetch categories
    const listRes = await request.get('/marketplace/categories', {
      headers: studentHeaders,
    });
    expect(listRes.status()).toBe(200);
    const categories = await listRes.json();
    expect(Array.isArray(categories)).toBe(true);
    expect(categories.some((c) => c.id === categoryId)).toBe(true);

    // 3. Update category
    const updateRes = await request.patch(`/marketplace/categories/${categoryId}`, {
      headers: adminHeaders,
      data: {
        name: `Jersey-New-${Date.now()}`,
      },
    });
    expect(updateRes.status()).toBe(200);
  });

  test('should create, list, and update products', async ({ request }) => {
    // 1. Create product
    const createRes = await request.post('/marketplace/products', {
      headers: adminHeaders,
      data: {
        name: `Wira Bhakti Jersey-${Date.now()}`,
        description: 'Jersey official team size L',
        price: 150000,
        stock: 50,
        imageUrl: 'http://example.com/jersey.png',
        categoryId,
      },
    });
    expect(createRes.status()).toBe(201);
    const product = await createRes.json();
    expect(product.id).toBeDefined();
    productId = product.id;

    // 2. Fetch products
    const listRes = await request.get('/marketplace/products', {
      headers: studentHeaders,
    });
    expect(listRes.status()).toBe(200);
    const products = await listRes.json();
    expect(Array.isArray(products)).toBe(true);
    expect(products.some((p) => p.id === productId)).toBe(true);

    // 3. Update product
    const updateRes = await request.patch(`/marketplace/products/${productId}`, {
      headers: adminHeaders,
      data: {
        price: 160000,
        stock: 45,
      },
    });
    expect(updateRes.status()).toBe(200);
    const updatedProduct = await updateRes.json();
    expect(Number(updatedProduct.price)).toBe(160000);
  });

  test('should place an order, view order history, and handle admin confirmation', async ({ request }) => {
    // 1. Place order
    const createOrderRes = await request.post('/marketplace/orders', {
      headers: studentHeaders,
      data: {
        items: [
          {
            productId,
            quantity: 2,
          },
        ],
        paymentMethod: 'CASH',
      },
    });
    expect(createOrderRes.status()).toBe(201);
    const order = await createOrderRes.json();
    expect(order.id).toBeDefined();
    expect(Number(order.totalAmount)).toBe(320000); // 160000 * 2
    orderId = order.id;

    // 2. Fetch student\'s orders history
    const historyRes = await request.get('/marketplace/my-orders', {
      headers: studentHeaders,
    });
    expect(historyRes.status()).toBe(200);
    const history = await historyRes.json();
    expect(Array.isArray(history)).toBe(true);
    expect(history.some((o) => o.id === orderId)).toBe(true);

    // 3. Confirm payment as Admin
    const confirmRes = await request.patch(`/marketplace/orders/${orderId}/confirm-payment`, {
      headers: adminHeaders,
      data: {
        adminNotes: 'Payment received in cash',
      },
    });
    expect(confirmRes.status()).toBe(200);
    const confirmedOrder = await confirmRes.json();
    expect(confirmedOrder.paymentStatus).toBe('CONFIRMED');
  });

  test('should delete product and category', async ({ request }) => {
    // 1. Delete order
    const deleteOrderRes = await request.delete(`/marketplace/orders/${orderId}`, {
      headers: adminHeaders,
    });
    expect(deleteOrderRes.status()).toBe(200);

    // 2. Delete product
    const deleteProductRes = await request.delete(`/marketplace/products/${productId}`, {
      headers: adminHeaders,
    });
    expect(deleteProductRes.status()).toBe(200);

    // 3. Delete category
    const deleteCategoryRes = await request.delete(`/marketplace/categories/${categoryId}`, {
      headers: adminHeaders,
    });
    expect(deleteCategoryRes.status()).toBe(200);
  });
});
