export type MarketplaceCategory = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
};

export type MarketplaceProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  categoryId: string | null;
  category?: MarketplaceCategory | null;
  createdAt: string;
};

export type MarketplaceOrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'SHIPPED'
  | 'PICKUP_READY'
  | 'COMPLETED'
  | 'CANCELLED';

export type MarketplacePaymentMethod = 'CASH' | 'TRANSFER';

export type MarketplacePaymentStatus =
  | 'PENDING'
  | 'WAITING_CONFIRMATION'
  | 'CONFIRMED'
  | 'REJECTED';

export type MarketplaceOrderItem = {
  productId: string;
  quantity: number;
  price: number;
  productName: string;
  imageUrl: string | null;
};

export type MarketplaceOrderUser = {
  id: string;
  fullName: string;
  email: string;
};

export type MarketplaceLinkedStudent = {
  id: string;
  user?: MarketplaceOrderUser | null;
};

export type MarketplaceOrder = {
  id: string;
  status: MarketplaceOrderStatus;
  paymentMethod: MarketplacePaymentMethod;
  paymentStatus: MarketplacePaymentStatus;
  totalAmount: number;
  items: MarketplaceOrderItem[];
  pickupCode: string | null;
  paymentProofUrl: string | null;
  paymentSubmittedAt: string | null;
  verifiedAt: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt?: string;
  user?: MarketplaceOrderUser | null;
  linkedStudent?: MarketplaceLinkedStudent | null;
  verifiedBy?: MarketplaceOrderUser | null;
};
