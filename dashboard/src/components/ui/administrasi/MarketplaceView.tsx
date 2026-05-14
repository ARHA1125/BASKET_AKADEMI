import { useEffect, useMemo, useState } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'sonner';
import { Card, TabList, Text, Title } from '@/components/ui/notifications/Common';
import { ClipboardCheck, ClipboardList, Package, Tag, XCircle } from 'lucide-react';
import type {
  MarketplaceCategory,
  MarketplaceOrder,
  MarketplacePaymentStatus,
  MarketplaceProduct,
} from '@/types/marketplace';

type TabId = 'products' | 'categories' | 'orders';

type ProductFormState = {
  name: string;
  description: string;
  price: string;
  stock: string;
  imageUrl: string;
  categoryId: string;
};

type CategoryFormState = {
  name: string;
  description: string;
};

const emptyProductForm: ProductFormState = {
  name: '',
  description: '',
  price: '',
  stock: '',
  imageUrl: '',
  categoryId: '',
};

const emptyCategoryForm: CategoryFormState = {
  name: '',
  description: '',
};

const paymentStatusLabels: Record<MarketplacePaymentStatus, string> = {
  PENDING: 'Pending',
  WAITING_CONFIRMATION: 'Waiting confirmation',
  CONFIRMED: 'Confirmed',
  REJECTED: 'Rejected',
};

export default function MarketplaceView() {
  const [activeTab, setActiveTab] = useState<TabId>('products');

  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [productForm, setProductForm] = useState<ProductFormState>(emptyProductForm);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [submittingProduct, setSubmittingProduct] = useState(false);

  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(emptyCategoryForm);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [submittingCategory, setSubmittingCategory] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderActionLoadingId, setOrderActionLoadingId] = useState<string | null>(null);
  const [confirmDialogOrderId, setConfirmDialogOrderId] = useState<string | null>(null);
  const [rejectDialogOrderId, setRejectDialogOrderId] = useState<string | null>(null);
  const [deleteDialogOrderId, setDeleteDialogOrderId] = useState<string | null>(null);
  const [adminNotesInput, setAdminNotesInput] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

  const token = useMemo(() => Cookies.get('auth_token') || null, []);

  const tabs = useMemo(
    () => [
      { id: 'products', label: 'Products', icon: <Package size={16} /> },
      { id: 'categories', label: 'Categories', icon: <Tag size={16} /> },
      { id: 'orders', label: 'Orders', icon: <ClipboardList size={16} /> },
    ],
    [],
  );

  const authHeaders: HeadersInit = useMemo(() => {
    if (!token) return new Headers();
    return new Headers({
      Authorization: `Bearer ${token}`,
    });
  }, [token]);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch(`${apiUrl}/marketplace/products`, { headers: authHeaders });
      if (!res.ok) {
        toast.error('Failed to fetch products');
        return;
      }
      const data = (await res.json()) as MarketplaceProduct[];
      setProducts(data);
    } catch (e) {
      console.error(e);
      toast.error('Error fetching products');
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const res = await fetch(`${apiUrl}/marketplace/categories`, { headers: authHeaders });
      if (!res.ok) {
        toast.error('Failed to fetch categories');
        return;
      }
      const data = (await res.json()) as MarketplaceCategory[];
      setCategories(data);
    } catch (e) {
      console.error(e);
      toast.error('Error fetching categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await fetch(`${apiUrl}/marketplace/orders`, { headers: authHeaders });
      if (!res.ok) {
        toast.error('Failed to fetch orders');
        return;
      }
      const data = (await res.json()) as MarketplaceOrder[];
      setOrders(data);
    } catch (e) {
      console.error(e);
      toast.error('Error fetching orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  const confirmOrderPayment = async (orderId: string, adminNotes?: string) => {
    try {
      setOrderActionLoadingId(orderId);
      const res = await fetch(`${apiUrl}/marketplace/orders/${orderId}/confirm-payment`, {
        method: 'PATCH',
        headers: (() => {
          const headers = new Headers(authHeaders);
          headers.set('Content-Type', 'application/json');
          return headers;
        })(),
        body: JSON.stringify({ adminNotes: adminNotes || undefined }),
      });

      if (!res.ok) {
        toast.error('Failed to confirm payment');
        return;
      }

      toast.success('Payment confirmed');
      setConfirmDialogOrderId(null);
      setAdminNotesInput('');
      fetchOrders();
    } catch (e) {
      console.error(e);
      toast.error('Error confirming payment');
    } finally {
      setOrderActionLoadingId(null);
    }
  };

  const rejectOrderPayment = async (orderId: string, adminNotes?: string) => {
    try {
      setOrderActionLoadingId(orderId);
      const res = await fetch(`${apiUrl}/marketplace/orders/${orderId}/reject-payment`, {
        method: 'PATCH',
        headers: (() => {
          const headers = new Headers(authHeaders);
          headers.set('Content-Type', 'application/json');
          return headers;
        })(),
        body: JSON.stringify({ adminNotes: adminNotes || undefined }),
      });

      if (!res.ok) {
        toast.error('Failed to reject payment');
        return;
      }

      toast.success('Payment rejected');
      setRejectDialogOrderId(null);
      setAdminNotesInput('');
      fetchOrders();
    } catch (e) {
      console.error(e);
      toast.error('Error rejecting payment');
    } finally {
      setOrderActionLoadingId(null);
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      setOrderActionLoadingId(orderId);
      const res = await fetch(`${apiUrl}/marketplace/orders/${orderId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });

      if (!res.ok) {
        toast.error('Failed to delete order');
        return;
      }

      toast.success('Order deleted');
      setDeleteDialogOrderId(null);
      fetchOrders();
    } catch (e) {
      console.error(e);
      toast.error('Error deleting order');
    } finally {
      setOrderActionLoadingId(null);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetProductForm = () => {
    setProductForm(emptyProductForm);
    setEditingProductId(null);
  };

  const resetCategoryForm = () => {
    setCategoryForm(emptyCategoryForm);
    setEditingCategoryId(null);
  };

  const submitProduct = async () => {
    const payload = {
      name: productForm.name.trim(),
      description: productForm.description.trim(),
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      imageUrl: productForm.imageUrl.trim() ? productForm.imageUrl.trim() : undefined,
      categoryId: productForm.categoryId || undefined,
    };

    if (!payload.name || !payload.description || Number.isNaN(payload.price) || Number.isNaN(payload.stock)) {
      toast.error('Fill required product fields');
      return;
    }

    try {
      setSubmittingProduct(true);
      const isEdit = Boolean(editingProductId);
       const res = await fetch(
         `${apiUrl}/marketplace/products${isEdit ? `/${editingProductId}` : ''}`,
         {
           method: isEdit ? 'PATCH' : 'POST',
           headers: (() => {
             const headers = new Headers(authHeaders);
             headers.set('Content-Type', 'application/json');
             return headers;
           })(),
           body: JSON.stringify(payload),
         },
       );

      if (!res.ok) {
        toast.error(isEdit ? 'Failed to update product' : 'Failed to create product');
        return;
      }

      toast.success(isEdit ? 'Product updated' : 'Product created');
      resetProductForm();
      fetchProducts();
    } catch (e) {
      console.error(e);
      toast.error('Error submitting product');
    } finally {
      setSubmittingProduct(false);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const res = await fetch(`${apiUrl}/marketplace/products/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (!res.ok) {
        toast.error('Failed to delete product');
        return;
      }
      toast.success('Product deleted');
      fetchProducts();
    } catch (e) {
      console.error(e);
      toast.error('Error deleting product');
    }
  };

  const submitCategory = async () => {
    const payload = {
      name: categoryForm.name.trim(),
      description: categoryForm.description.trim() ? categoryForm.description.trim() : undefined,
    };

    if (!payload.name) {
      toast.error('Category name required');
      return;
    }

    try {
      setSubmittingCategory(true);
      const isEdit = Boolean(editingCategoryId);
       const res = await fetch(
         `${apiUrl}/marketplace/categories${isEdit ? `/${editingCategoryId}` : ''}`,
         {
           method: isEdit ? 'PATCH' : 'POST',
           headers: (() => {
             const headers = new Headers(authHeaders);
             headers.set('Content-Type', 'application/json');
             return headers;
           })(),
           body: JSON.stringify(payload),
         },
       );

      if (!res.ok) {
        toast.error(isEdit ? 'Failed to update category' : 'Failed to create category');
        return;
      }

      toast.success(isEdit ? 'Category updated' : 'Category created');
      resetCategoryForm();
      fetchCategories();
    } catch (e) {
      console.error(e);
      toast.error('Error submitting category');
    } finally {
      setSubmittingCategory(false);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const res = await fetch(`${apiUrl}/marketplace/categories/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (!res.ok) {
        toast.error('Failed to delete category');
        return;
      }
      toast.success('Category deleted');
      fetchCategories();
    } catch (e) {
      console.error(e);
      toast.error('Error deleting category');
    }
  };

  const filteredOrders = useMemo(() => {
    const keyword = orderSearch.trim().toLowerCase();
    if (!keyword) return orders;

    return orders.filter((order) => {
      const target = [
        order.id,
        order.pickupCode,
        order.user?.fullName,
        order.user?.email,
        order.linkedStudent?.user?.fullName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return target.includes(keyword);
    });
  }, [orderSearch, orders]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Title className="text-xl font-bold text-slate-900 dark:text-white">Marketplace</Title>
          <Text className="text-slate-500 dark:text-slate-400 mt-1">Manage products, categories, and orders.</Text>
        </div>
        <TabList tabs={tabs as any} activeTab={activeTab} onChange={setActiveTab as any} />
      </div>

      {activeTab === 'products' && (
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <Title className="text-lg font-semibold">Products</Title>
              <Text className="text-slate-500 dark:text-slate-400">Create and manage marketplace products.</Text>
            </div>
            <button
              type="button"
              onClick={resetProductForm}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700"
            >
              New product
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <input
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                  placeholder="Name"
                  value={productForm.name}
                  onChange={(e) => setProductForm((s) => ({ ...s, name: e.target.value }))}
                />
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent min-h-[100px]"
                  placeholder="Description"
                  value={productForm.description}
                  onChange={(e) => setProductForm((s) => ({ ...s, description: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                    placeholder="Price"
                    value={productForm.price}
                    onChange={(e) => setProductForm((s) => ({ ...s, price: e.target.value }))}
                  />
                  <input
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                    placeholder="Stock"
                    value={productForm.stock}
                    onChange={(e) => setProductForm((s) => ({ ...s, stock: e.target.value }))}
                  />
                </div>
                 <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const formData = new FormData();
                        formData.append('image', file);
                        const res = await fetch(`${apiUrl}/marketplace/products/upload-image`, {
                          method: 'POST',
                          headers: authHeaders,
                          body: formData,
                        });
                        if (!res.ok) {
                          toast.error('Failed to upload image');
                          return;
                        }
                        const data = (await res.json()) as { url: string };
                        setProductForm((s) => ({ ...s, imageUrl: data.url }));
                        toast.success('Image uploaded');
                      } catch (err) {
                        console.error(err);
                        toast.error('Error uploading image');
                      } finally {
                        e.target.value = '';
                      }
                    }}
                  />
                  <input
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                    placeholder="Image URL (optional)"
                    value={productForm.imageUrl}
                    onChange={(e) => setProductForm((s) => ({ ...s, imageUrl: e.target.value }))}
                  />
                </div>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                  value={productForm.categoryId}
                  onChange={(e) => setProductForm((s) => ({ ...s, categoryId: e.target.value }))}
                >
                  <option value="">No category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={submitProduct}
                  disabled={submittingProduct}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 disabled:opacity-60"
                >
                  {editingProductId ? 'Update' : 'Create'}
                </button>
                {editingProductId && (
                  <button
                    type="button"
                    onClick={resetProductForm}
                    className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Title className="text-lg font-semibold">All products</Title>
              {loadingProducts ? (
                <Text className="text-slate-500">Loading...</Text>
              ) : products.length === 0 ? (
                <Text className="text-slate-500">No products yet.</Text>
              ) : (
                <div className="space-y-2">
                  {products.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="font-medium truncate">{p.name}</div>
                        <div className="text-sm text-slate-500 truncate">{p.category?.name || 'No category'}</div>
                        <div className="text-sm text-slate-500">Price: {p.price} | Stock: {p.stock}</div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProductId(p.id);
                            setProductForm({
                              name: p.name,
                              description: p.description,
                              price: String(p.price),
                              stock: String(p.stock),
                              imageUrl: p.imageUrl || '',
                              categoryId: p.categoryId || '',
                            });
                          }}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteProduct(p.id)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'categories' && (
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <Title className="text-lg font-semibold">Categories</Title>
              <Text className="text-slate-500 dark:text-slate-400">Manage product categories.</Text>
            </div>
            <button
              type="button"
              onClick={resetCategoryForm}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700"
            >
              New category
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="space-y-3">
              <input
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent"
                placeholder="Name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm((s) => ({ ...s, name: e.target.value }))}
              />
              <textarea
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent min-h-[100px]"
                placeholder="Description (optional)"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm((s) => ({ ...s, description: e.target.value }))}
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={submitCategory}
                  disabled={submittingCategory}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 disabled:opacity-60"
                >
                  {editingCategoryId ? 'Update' : 'Create'}
                </button>
                {editingCategoryId && (
                  <button
                    type="button"
                    onClick={resetCategoryForm}
                    className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Title className="text-lg font-semibold">All categories</Title>
              {loadingCategories ? (
                <Text className="text-slate-500">Loading...</Text>
              ) : categories.length === 0 ? (
                <Text className="text-slate-500">No categories yet.</Text>
              ) : (
                <div className="space-y-2">
                  {categories.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="font-medium truncate">{c.name}</div>
                        <div className="text-sm text-slate-500 truncate">{c.description || ''}</div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategoryId(c.id);
                            setCategoryForm({ name: c.name, description: c.description || '' });
                          }}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteCategory(c.id)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'orders' && (
        <Card className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <Title className="text-lg font-semibold">Orders</Title>
              <Text className="text-slate-500 dark:text-slate-400">Review payments, search by code, and confirm marketplace orders.</Text>
            </div>
            <div className="flex gap-2 flex-wrap">
              <input
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent min-w-[240px]"
                placeholder="Search by order, code, buyer, student"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
              />
              <button
                type="button"
                onClick={fetchOrders}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="mt-6">
            {loadingOrders ? (
              <Text className="text-slate-500">Loading...</Text>
            ) : filteredOrders.length === 0 ? (
              <Text className="text-slate-500">No matching orders.</Text>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((o) => (
                  <div key={o.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="min-w-0 space-y-1">
                        <div className="font-semibold text-slate-900 dark:text-white">Order #{o.id.slice(0, 8)}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Buyer: {o.user?.fullName || '-'} {o.user?.email ? `(${o.user.email})` : ''}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Student: {o.linkedStudent?.user?.fullName || '-'}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">Created: {new Date(o.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 space-y-1 text-right">
                        <div>Code: <span className="font-semibold text-slate-900 dark:text-white">{o.pickupCode || '-'}</span></div>
                        <div>Payment: {o.paymentMethod}</div>
                        <div>Status: {paymentStatusLabels[o.paymentStatus] || o.paymentStatus}</div>
                        <div>Order: {o.status}</div>
                        <div>Total: {o.totalAmount}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {o.items.map((item, index) => (
                        <div
                          key={`${o.id}-${item.productId}-${index}`}
                          className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 dark:border-slate-800 p-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                              <img
                                src={item.imageUrl ? `${apiUrl}${item.imageUrl}` : 'https://placehold.co/200x200?text=No+Image'}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium truncate">{item.productName}</div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">Qty {item.quantity}</div>
                            </div>
                          </div>
                          <div className="text-sm font-medium">{item.price}</div>
                        </div>
                      ))}
                    </div>

                    {o.paymentMethod === 'TRANSFER' && (
                      <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                          <ClipboardCheck size={16} />
                          {o.paymentProofUrl ? 'Payment proof uploaded' : 'Payment proof not uploaded yet'}
                        </div>
                        {o.paymentProofUrl ? (
                          <a
                            href={`${apiUrl}${o.paymentProofUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm underline text-slate-700 dark:text-slate-200"
                          >
                            View payment proof
                          </a>
                        ) : null}
                      </div>
                    )}

                    {o.adminNotes ? (
                      <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-200">
                        Admin notes: {o.adminNotes}
                      </div>
                    ) : null}

                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmDialogOrderId(o.id);
                          setAdminNotesInput('');
                        }}
                        disabled={orderActionLoadingId === o.id || o.paymentStatus === 'CONFIRMED'}
                        className="px-3 py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-60"
                      >
                        Confirm payment
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRejectDialogOrderId(o.id);
                          setAdminNotesInput('');
                        }}
                        disabled={orderActionLoadingId === o.id || o.paymentStatus === 'REJECTED'}
                        className="px-3 py-2 rounded-lg border border-red-200 dark:border-red-900 text-red-600 disabled:opacity-60"
                      >
                        <span className="inline-flex items-center gap-2">
                          <XCircle size={16} />
                          Reject payment
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteDialogOrderId(o.id)}
                        disabled={orderActionLoadingId === o.id}
                        className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
       )}

      {confirmDialogOrderId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 space-y-4">
            <Title className="text-lg font-semibold">Confirm Payment</Title>
            <Text className="text-slate-600 dark:text-slate-400">
              Add optional notes for this confirmation.
            </Text>
            <textarea
              value={adminNotesInput}
              onChange={(e) => setAdminNotesInput(e.target.value)}
              placeholder="Admin notes (optional)"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent min-h-[100px]"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setConfirmDialogOrderId(null);
                  setAdminNotesInput('');
                }}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => confirmOrderPayment(confirmDialogOrderId, adminNotesInput)}
                disabled={orderActionLoadingId === confirmDialogOrderId}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white disabled:opacity-60"
              >
                {orderActionLoadingId === confirmDialogOrderId ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </Card>
        </div>
      )}

      {rejectDialogOrderId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 space-y-4">
            <Title className="text-lg font-semibold">Reject Payment</Title>
            <Text className="text-slate-600 dark:text-slate-400">
              Add optional notes explaining the rejection.
            </Text>
            <textarea
              value={adminNotesInput}
              onChange={(e) => setAdminNotesInput(e.target.value)}
              placeholder="Admin notes (optional)"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent min-h-[100px]"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setRejectDialogOrderId(null);
                  setAdminNotesInput('');
                }}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => rejectOrderPayment(rejectDialogOrderId, adminNotesInput)}
                disabled={orderActionLoadingId === rejectDialogOrderId}
                className="px-4 py-2 rounded-lg bg-red-600 text-white disabled:opacity-60"
              >
                {orderActionLoadingId === rejectDialogOrderId ? 'Processing...' : 'Reject'}
              </button>
            </div>
          </Card>
        </div>
      )}

      {deleteDialogOrderId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 space-y-4">
            <Title className="text-lg font-semibold">Delete Order</Title>
            <Text className="text-slate-600 dark:text-slate-400">
              Are you sure you want to delete this order? This action cannot be undone.
            </Text>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setDeleteDialogOrderId(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteOrder(deleteDialogOrderId)}
                disabled={orderActionLoadingId === deleteDialogOrderId}
                className="px-4 py-2 rounded-lg bg-red-600 text-white disabled:opacity-60"
              >
                {orderActionLoadingId === deleteDialogOrderId ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
