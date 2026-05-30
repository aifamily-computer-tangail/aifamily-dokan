// src/types.ts

export type Language = 'en' | 'bn';

export interface Translation {
  en: string;
  bn: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_shipping';
  value: number;
  expiryDate: string;
  usageLimit: number;
  usageCount: number;
  minOrderAmount?: number;
  minPurchase?: number; // Tolerant compatibility
  active?: boolean;
  categoryRestriction?: string;
  productRestriction?: string;
}

export interface ProductVariant {
  id: string;
  size?: string;
  color?: string;
  weight?: string;
  capacity?: string;
  sku: string;
  price: number;
  stock: number;
}

export interface Review {
  id: string;
  customerName?: string;
  rating: number;
  comment: string;
  date: string;
  user?: string; // Compatible with mock front reviews
}

export interface Product {
  id: string;
  name: Translation;
  description: Translation;
  shortDescription?: Translation;
  price: number;
  compareAtPrice?: number;
  sku: string;
  stock: number;
  rating: number;
  ratingCount?: number;
  images: string[];
  categoryId: string;
  subCategoryId?: string;
  brand: string;
  variants?: ProductVariant[];
  variations?: { sizes?: string[]; colors?: string[] }; // Tolerant compatibility
  specifications: any; // Flexible specifications mapping
  reviews: Review[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isFlashSale: boolean;
  flashSaleDiscount?: number; // percentage
  weight?: string;
}

export interface Category {
  id: string;
  name: Translation;
  slug: string;
  image?: string; // Optional
  parentId?: string; // For Sub-categories
}

export interface District {
  id: string;
  name: { en: string; bn: string };
  deliveryCharge: number;
}

export interface Upazila {
  id: string;
  districtId: string;
  name: { en: string; bn: string };
  additionalCharge: number;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Out For Delivery'
  | 'Delivered'
  | 'Returned'
  | 'Cancelled'
  | 'Refunded';

export interface OrderItem {
  productId: string;
  variantId?: string;
  name: Translation;
  price: number;
  quantity: number;
  image: string;
  selectedColor?: string;
  selectedSize?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  districtId: string;
  upazilaId: string;
  deliveryInstructions?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'COD' | 'Bank';
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  transactionId?: string;
  status: OrderStatus;
  createdAt: string;
  history: { status: OrderStatus; note: string; timestamp: string }[];
  courierName?: string;
  trackingNumber?: string;
}

export interface PaymentLog {
  id: string;
  orderId: string;
  amount: number;
  paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'Bank';
  transactionId: string;
  status: 'Verified' | 'Unverified' | 'Failed';
  timestamp: string;
  customerPhone: string;
}

export interface AuditLog {
  id: string;
  adminName: string;
  action: string;
  details: string;
  timestamp: string;
}

// Frontend Builders / Customizer
export interface SliderItem {
  id: string;
  title: Translation;
  subtitle: Translation;
  imageUrl: string;
  link: string;
}

export interface ThemeSettings {
  primaryColor: string; // Tailwind tint e.g. "emerald"
  secondaryColor: string; // e.g., "slate"
  logoText: string;
  logoUrl?: string;
  faviconUrl?: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  facebookUrl?: string;
  youtubeUrl?: string;
}

export interface HomepageBuilder {
  heroSliders: SliderItem[];
  featuredCategories: string[]; // Category IDs
  promoBannerUrl?: string;
  promoBannerLink?: string;
  promoText?: Translation;
}

export interface SEOSettings {
  metaTitle: Translation;
  metaDescription: Translation;
  openGraphImage?: string;
}

export interface SiteConfig {
  theme?: ThemeSettings;
  homepage?: HomepageBuilder;
  seo?: SEOSettings;
  logoText?: string; // Direct flat properties access compatible with AdminView
  themeColor?: string;
}

export interface Blog {
  id: string;
  title: Translation;
  content: Translation;
  imageUrl: string;
  author: string;
  createdAt: string;
}

export interface FAQ {
  id?: string; // Tolerant optional
  question: Translation;
  answer: Translation;
}
