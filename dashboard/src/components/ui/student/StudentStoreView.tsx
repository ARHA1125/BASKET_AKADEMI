'use client';

import { useEffect, useMemo, useState } from 'react';
import { getToken } from '@/lib/auth';
import type {
  MarketplaceCategory,
  MarketplaceOrder,
  MarketplacePaymentMethod,
  MarketplaceProduct,
} from '@/types/marketplace';
import type { User } from '@/types/user-profile';

type CartItem = {
  product: MarketplaceProduct;
  quantity: number;
};

type ParentChild = {
  studentId: string;
  studentName: string;
};

type StoreCatalogProps = {
  title?: string;
  subtitle?: string;
  basePath?: string;
};

type ParentChildrenResponse = {
  children?: Array<{
    studentId?: string;
    studentName?: string;
    id?: string;
    student?: {
      id?: string;
      fullName?: string;
      user?: { fullName?: string };
    };
    user?: { fullName?: string };
    fullName?: string;
    name?: string;
  }>;
};

const paymentMethodLabels: Record<MarketplacePaymentMethod, string> = {
  CASH: 'Cash',
  TRANSFER: 'Transfer',
};

export default function StudentStoreView({
  title = 'Store',
  subtitle = 'Browse academy products.',
}: StoreCatalogProps) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [uploadingProofId, setUploadingProofId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkoutSuccessMessage, setCheckoutSuccessMessage] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<MarketplacePaymentMethod>('CASH');
  const [user, setUser] = useState<User | null>(null);
  const [parentChildren, setParentChildren] = useState<ParentChild[]>([]);
  const [linkedStudentId, setLinkedStudentId] = useState('');

  const token = useMemo(() => getToken(), []);

  const authHeaders = useMemo(() => {
    const headers = new Headers();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }, [token]);

  const getImageUrl = (imageUrl: string | null) =>
    imageUrl ? `${apiUrl}${imageUrl}` : 'https://placehold.co/600x400?text=No+Image';

  const fetchProfile = async () => {
    const res = await fetch(`${apiUrl}/auth/me`, { headers: authHeaders });
    if (!res.ok) throw new Error('Failed to load profile');
    return (await res.json()) as User;
  };

  const fetchParentChildren = async () => {
    const res = await fetch(`${apiUrl}/academic/me/children/performance`, { headers: authHeaders });
    if (!res.ok) {
      return [] as ParentChild[];
    }

    const data = (await res.json()) as ParentChildrenResponse;
    return (data.children || [])
      .map((child) => {
        const studentId = child.studentId || child.student?.id || child.id;
        const studentName =
          child.studentName ||
          child.student?.fullName ||
          child.student?.user?.fullName ||
          child.user?.fullName ||
          child.fullName ||
          child.name;

        if (!studentId || !studentName) return null;
        return { studentId, studentName };
      })
      .filter((child): child is ParentChild => Boolean(child));
  };

  const fetchCatalog = async () => {
    const [productsRes, categoriesRes] = await Promise.all([
      fetch(`${apiUrl}/marketplace/products`, { headers: authHeaders }),
      fetch(`${apiUrl}/marketplace/categories`, { headers: authHeaders }),
    ]);

    if (!productsRes.ok || !categoriesRes.ok) {
      throw new Error('Failed to load marketplace catalog');
    }

    const [productsData, categoriesData] = await Promise.all([
      productsRes.json() as Promise<MarketplaceProduct[]>,
      categoriesRes.json() as Promise<MarketplaceCategory[]>,
    ]);

    setProducts(productsData);
    setCategories(categoriesData);
  };

  const fetchOrders = async () => {
    const res = await fetch(`${apiUrl}/marketplace/my-orders`, { headers: authHeaders });
    if (!res.ok) throw new Error('Failed to load your orders');
    const data = (await res.json()) as MarketplaceOrder[];
    setOrders(data);
  };

  const loadData = async () => {
    if (!token) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const profile = await fetchProfile();
      setUser(profile);

      if (profile.role === 'PARENT') {
        const children = await fetchParentChildren();
        setParentChildren(children);
        if (children.length > 0) {
          setLinkedStudentId(children[0].studentId);
        }
      } else if (profile.role === 'STUDENT' && profile.studentProfile?.id) {
        setLinkedStudentId(profile.studentProfile.id);
      }

      await Promise.all([fetchCatalog(), fetchOrders()]);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to load marketplace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category?.id === selectedCategory)
    : products;

  const addToCart = (product: MarketplaceProduct) => {
    if (product.stock <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id !== productId) return item;
        const nextQuantity = Math.max(1, item.quantity + delta);
        if (nextQuantity > item.product.stock) return item;
        return { ...item, quantity: nextQuantity };
      }),
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const checkout = async () => {
    if (!token || cart.length === 0) return;

    if (user?.role === 'PARENT' && !linkedStudentId) {
      setError('Please select a student before checkout.');
      return;
    }

    try {
      setCheckoutLoading(true);
      setError(null);
      setCheckoutSuccessMessage(null);

      const payload: {
        items: Array<{ productId: string; quantity: number }>;
        paymentMethod: MarketplacePaymentMethod;
        linkedStudentId?: string;
      } = {
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        paymentMethod,
      };

      if (linkedStudentId) {
        payload.linkedStudentId = linkedStudentId;
      }

      const headers = new Headers(authHeaders);
      headers.set('Content-Type', 'application/json');

      const res = await fetch(`${apiUrl}/marketplace/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const responseText = await res.text();
        throw new Error(responseText || 'Failed to create order');
      }

      const order = (await res.json()) as MarketplaceOrder;
      setCheckoutSuccessMessage(
        `Order created. Your code is ${order.pickupCode || '-'} and payment method is ${paymentMethodLabels[order.paymentMethod]}.`,
      );
      setCart([]);
      setShowCart(false);
      await Promise.all([fetchCatalog(), fetchOrders()]);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const uploadPaymentProof = async (orderId: string, file?: File | null) => {
    if (!file || !token) return;

    try {
      setUploadingProofId(orderId);
      setError(null);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${apiUrl}/marketplace/my-orders/${orderId}/upload-proof`, {
        method: 'POST',
        headers: authHeaders,
        body: formData,
      });

      if (!res.ok) {
        const responseText = await res.text();
        throw new Error(responseText || 'Failed to upload payment proof');
      }

      await fetchOrders();
      setCheckoutSuccessMessage('Payment proof uploaded successfully. Waiting for admin confirmation.');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to upload payment proof');
    } finally {
      setUploadingProofId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-slate-500 dark:text-slate-400">Loading marketplace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">{title}</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">{subtitle}</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-4 text-red-700 dark:text-red-200 text-sm">
          {error}
        </div>
      )}

      {checkoutSuccessMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-lg p-4">
          <h3 className="text-emerald-800 dark:text-emerald-200 font-medium">Marketplace update</h3>
          <p className="text-emerald-700 dark:text-emerald-300 mt-1">{checkoutSuccessMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)] gap-6 items-start">
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm dark:shadow-lg p-5 space-y-4 border border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Categories
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as MarketplacePaymentMethod)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="CASH">Cash</option>
                <option value="TRANSFER">Transfer</option>
              </select>
            </div>

            {user?.role === 'PARENT' && parentChildren.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  Student
                </label>
                <select
                  value={linkedStudentId}
                  onChange={(e) => setLinkedStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {parentChildren.map((child) => (
                    <option key={child.studentId} value={child.studentId}>
                      {child.studentName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => setShowCart((prev) => !prev)}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
            >
              <span>Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})</span>
            </button>
          </div>

          {showCart && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm dark:shadow-lg p-5 space-y-4 border border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">Shopping Cart</h2>

              {cart.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.product.id} className="pb-4 border-b border-slate-200 dark:border-slate-700 last:border-0 last:pb-0">
                        <div className="flex gap-3 mb-3">
                          <img
                            src={getImageUrl(item.product.imageUrl)}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-slate-900 dark:text-slate-100 line-clamp-2">
                              {item.product.name}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 whitespace-nowrap">
                              Rp {item.product.price.toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                            <button
                              onClick={() => updateQuantity(item.product.id, -1)}
                              className="w-6 h-6 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-900 dark:text-slate-100 font-medium text-sm"
                            >
                              −
                            </button>
                            <span className="w-6 text-center text-slate-900 dark:text-slate-100 font-medium text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, 1)}
                              className="w-6 h-6 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-900 dark:text-slate-100 font-medium text-sm"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-xs font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {paymentMethod === 'TRANSFER'
                        ? 'After checkout, upload your transfer proof from the order history below.'
                        : 'You can pay cash directly to admin using the generated order code.'}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Total</span>
                        <span className="text-xl font-bold text-slate-900 dark:text-slate-50">
                          Rp {cartTotal.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <button
                        onClick={checkout}
                        disabled={checkoutLoading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        {checkoutLoading ? 'Processing...' : 'Checkout'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm dark:shadow-lg hover:shadow-md dark:hover:shadow-xl transition-shadow overflow-hidden border border-slate-200 dark:border-slate-700"
              >
                <img
                  src={getImageUrl(product.imageUrl)}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                    {product.name}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 line-clamp-2 min-h-[40px]">
                    {product.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-xl font-bold text-slate-900 dark:text-slate-50">
                      Rp {product.price.toLocaleString('id-ID')}
                    </span>
                    {product.stock === 0 ? (
                      <span className="px-2 py-1 text-xs font-medium text-red-700 dark:text-red-200 bg-red-100 dark:bg-red-950/40 rounded-full">
                        Out of stock
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-950/40 rounded-full">
                        {product.stock} in stock
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    className="mt-3 w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white py-2 rounded-lg font-medium disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm dark:shadow-lg p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50">Order History</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  View codes, payment status, and upload proof for transfer orders.
                </p>
              </div>
              <button
                onClick={fetchOrders}
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium transition-colors"
              >
                Refresh
              </button>
            </div>

            {orders.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400">No orders yet.</p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3 bg-slate-50 dark:bg-slate-700/30"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-50">
                          Order #{order.id.slice(0, 8)}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          Code: <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                            {order.pickupCode || '-'}
                          </span>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          Payment: {paymentMethodLabels[order.paymentMethod]} · {order.paymentStatus}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Status: {order.status}</div>
                        {order.linkedStudent?.user?.fullName && (
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            Student: {order.linkedStudent.user.fullName}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 md:text-right">
                        <div>{new Date(order.createdAt).toLocaleString()}</div>
                        <div className="font-semibold text-slate-900 dark:text-slate-50 mt-1">
                          Rp {Number(order.totalAmount).toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={`${order.id}-${item.productId}`} className="flex items-center gap-3 text-sm">
                          <img
                            src={getImageUrl(item.imageUrl)}
                            alt={item.productName}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                              {item.productName}
                            </div>
                            <div className="text-slate-600 dark:text-slate-400">
                              {item.quantity} x Rp {item.price.toLocaleString('id-ID')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.adminNotes && (
                      <div className="text-sm text-amber-700 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg px-3 py-2">
                        Admin note: {order.adminNotes}
                      </div>
                    )}

                    {order.paymentMethod === 'TRANSFER' && (
                      <div className="space-y-2">
                        {order.paymentProofUrl ? (
                          <a
                            href={`${apiUrl}${order.paymentProofUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                          >
                            View uploaded payment proof
                          </a>
                        ) : (
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            No payment proof uploaded yet.
                          </div>
                        )}

                        {order.paymentStatus !== 'CONFIRMED' && (
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                              Upload transfer proof
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadingProofId === order.id}
                              onChange={(e) => {
                                void uploadPaymentProof(order.id, e.target.files?.[0] || null);
                                e.target.value = '';
                              }}
                              className="block w-full text-sm text-slate-700 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 dark:file:bg-blue-700 dark:hover:file:bg-blue-600"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
