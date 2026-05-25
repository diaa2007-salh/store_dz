// types/index.ts

export type Locale = "ar" | "fr" | "en";
export type ShippingType = "home" | "desk";
export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "returned";
export type UserRole = "admin" | "customer";

export interface LocalizedString {
  ar: string;
  fr: string;
  en: string;
}

export interface Wilaya {
  id: string;
  code: number;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  homeDeliveryPrice: number;
  deskDeliveryPrice: number;
  isActive: boolean;
  communes?: Commune[];
}

export interface Commune {
  id: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  wilayaId: string;
}

export interface Category {
  id: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  titleAr: string;
  titleFr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionFr: string;
  descriptionEn: string;
  price: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  sku?: string | null;
  stockCount: number;
  lowStockAlert: number;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  soldCount: number;
  categoryId?: string | null;
  category?: Category | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  productId: string;
  titleAr: string;
  titleFr: string;
  titleEn: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  stockCount: number;
}

export interface ShippingAddress {
  wilayaCode: number;
  wilayaNameAr: string;
  wilayaNameFr: string;
  commune: string;
  communeId?: string;
  shippingType: ShippingType;
  fullAddress?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  titleAr: string;
  titleFr: string;
  titleEn: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  wilayaId: string;
  wilaya?: Wilaya;
  communeId?: string | null;
  commune?: Commune | null;
  shippingType: ShippingType;
  addressDetails?: string | null;
  subtotal: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
  trackingCode?: string | null;
  yalidineId?: string | null;
  notes?: string | null;
  shippingAddress: ShippingAddress;
  items?: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Settings {
  id: string;
  storeNameAr: string;
  storeNameFr: string;
  storeNameEn: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  whatsapp?: string | null;
  logoUrl?: string | null;
  currency: string;
  defaultLocale: string;
}

// Yalidine API types
export interface YalidineParcelPayload {
  firstname: string;
  familyname: string;
  contact_phone: string;
  address: string;
  from_wilaya_name: string;
  to_wilaya_id: number;
  to_commune_name: string;
  product_list: string;
  price: number;
  do_insurance: number;
  declared_value: number;
  length: number;
  width: number;
  height: number;
  weight: number;
  freeshipping: number;
  is_stopdesk: number;
  stopdesk_id?: number;
  has_exchange: number;
  exchange_product?: string;
}

export interface YalidineParcelResponse {
  success: boolean;
  tracking: string;
  order_id: string;
  label_url?: string;
  message?: string;
}

// Dashboard stats
export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  totalProducts: number;
  recentOrders: Order[];
  revenueByDay: { date: string; revenue: number }[];
}

// API Response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
