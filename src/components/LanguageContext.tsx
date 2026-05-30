// src/components/LanguageContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Translation } from '../types';

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (translation: Translation | undefined, fallback?: string) => string;
  l: (key: keyof typeof DICTIONARY) => string;
}

const DICTIONARY = {
  // Navigation
  home: { en: "Home", bn: "প্রচ্ছদ" },
  storefront: { en: "Storefront", bn: "স্টোরফ্রন্ট" },
  catalog: { en: "Product Catalog", bn: "পণ্য গ্যালারি" },
  adminPanel: { en: "Admin Dashboard", bn: "নিয়ন্ত্রণ কক্ষ" },
  blog: { en: "Stories & Blogs", bn: "ব্লগ ও কন্টেন্ট" },
  faq: { en: "FAQ Help", bn: "প্রশ্নোত্তর" },
  cart: { en: "Shopping Cart", bn: "শপিং কার্ট" },
  checkout: { en: "Proceed Checkout", bn: "চেকআউট করুন" },
  tracking: { en: "Track Order", bn: "অর্ডার ট্র্যাকিং" },
  
  // Home Sections
  flashSale: { en: "Flash Sale Limit", bn: "ফ্ল্যাশ ডিল" },
  exclusiveOffers: { en: "Exclusive BDT Deals", bn: "সেরা অফার" },
  newArrivals: { en: "New Arrivals", bn: "নতুন কালেকশন" },
  bestSellers: { en: "Best Sellers", bn: "সেরা বিক্রিত পণ্য" },
  exploreAll: { en: "View All Items", bn: "সবগুলো দেখুন" },
  testimonialTitle: { en: "Our Customers Say", bn: "ক্রেতাদের মতামত" },
  newsletterTitle: { en: "Subscribe to Newsletter", bn: "নিউজলেটার সাবস্ক্রাইব" },
  newsletterSub: { en: "Get latest product updates and special campaign promo codes.", bn: "নতুন প্রোডাক্ট এবং স্পেশাল ক্যাম্পেইন প্রোমো কোড পেতে সাবস্ক্রাইব করুন।" },
  subscribe: { en: "Subscribe", bn: "সাবস্ক্রাইব" },
  searchPlaceholder: { en: "Search products, brands, or SKU...", bn: "পণ্য, ব্র্যান্ড বা এসকেইউ খুঁজুন..." },

  // Filters
  filterHeading: { en: "Filter Settings", bn: "ফিল্টার সমূহ" },
  allCategories: { en: "Categories Showcase", bn: "সকল ক্যাটাগরি" },
  priceRange: { en: "Price Range (BDT)", bn: "দাম নির্ধারণ (৳)" },
  ratingLabel: { en: "Minimum Rating", bn: "ন্যূনতম রেটিং" },
  sortingLabel: { en: "Sort By", bn: "সাজানো" },
  sortDefault: { en: "Default Sorting", bn: "সাধারণ ক্রমানুসারে" },
  sortPriceAsc: { en: "Price: Low to High", bn: "দাম: কম থেকে বেশি" },
  sortPriceDesc: { en: "Price: High to Low", bn: "দাম: বেশি থেকে কম" },
  sortRating: { en: "Top Rated", bn: "শীর্ষ রেটিং অনুসারে" },
  clearFilters: { en: "Clear Filters", bn: "ফিল্টার মুছুন" },
  inStockOnly: { en: "Available Stock Only", bn: "শুধুমাত্র স্টকে আছে" },

  // Detail Page
  specifications: { en: "Specifications", bn: "বৈশিষ্ট্য ও বিবরণ" },
  reviews: { en: "Customer Reviews", bn: "ক্রেতাদের রিভিউ" },
  noReviews: { en: "No reviews for this product yet.", bn: "এই পণ্যে এখনও কোনো রিভিউ দেওয়া হয়নি।" },
  addReview: { en: "Submit Review", bn: "রিভিউ দিন" },
  relatedProducts: { en: "Related Products", bn: "সম্পর্কিত অন্যান্য পণ্য" },
  frequentlyBought: { en: "Frequently Bought Together", bn: "একসাথে বেশি কেনা হয়" },
  addToCart: { en: "Add to Cart", bn: "কার্টে যোগ করুন" },
  buyNow: { en: "Buy Now", bn: "সরাসরি কিনুন" },
  inStock: { en: "In Stock", bn: "স্টকে আছে" },
  outOfStock: { en: "Out of Stock", bn: "স্টক শেষ" },
  sku: { en: "SKU Code", bn: "এসকেইউ কোড" },
  brand: { en: "Brand Name", bn: "ব্র্যান্ড" },

  // Cart & Checkout
  cartTitle: { en: "Shopping Cart List", bn: "শপিং কার্ট ব্যাগ" },
  emptyCart: { en: "Your shopping cart is empty.", bn: "আপনার কার্ট ব্যাগটি খালি।" },
  couponPrompt: { en: "Apply Coupon Promo Code", bn: "কুপন কোড ব্যবহার করুন" },
  couponSuccess: { en: "Coupon applied successfully!", bn: "প্রোমো কোড সফলভাবে যুক্ত হয়েছে!" },
  apply: { en: "Check", bn: "ব্যবহার করুন" },
  subtotal: { en: "Subtotal Amount", bn: "সাবটোটাল মূল্য" },
  deliveryCharge: { en: "Delivery Charge", bn: "ডেলিভারি চার্জ" },
  discount: { en: "Coupon Discount", bn: "কুপন ডিসকাউন্ট" },
  total: { en: "Total Payable", bn: "সর্বমোট দেয়" },
  checkoutTitle: { en: "Order Delivery Checkout", bn: "ডেলিভারি ও চেকআউট" },
  customerInfo: { en: "Customer Informations", bn: "ক্রেতার তথ্য" },
  fullName: { en: "Full Name", bn: "আপনার নাম" },
  phone: { en: "Phone Number (11 digits)", bn: "মোবাইল নম্বর (১১ ডিজিট)" },
  email: { en: "Email Address (Optional)", bn: "ইমেইল এড্রেস (ঐচ্ছিক)" },
  address: { en: "Detailed Shipping Address", bn: "পূর্ণাঙ্গ ঠিকানা" },
  district: { en: "District / City", bn: "জেলা" },
  selectDistrict: { en: "Select District", bn: "জেলা নির্বাচন করুন" },
  upazila: { en: "Upazila / Area", bn: "উপজেলা" },
  selectUpazila: { en: "Select Upazila / Sub-district", bn: "উপজেলা নির্বাচন করুন" },
  instructions: { en: "Delivery Instructions (Optional)", bn: "ডেলিভারি নির্দেশনাবলী (ঐচ্ছিক)" },
  paymentSelection: { en: "Select Payment Channel", bn: "পেমেন্ট মাধ্যম বেছে নিন" },
  cod: { en: "Cash On Delivery (COD)", bn: "ক্যাশ অন ডেলিভারি (COD)" },
  bankTransfer: { en: "Prepaid Bank Transfer", bn: "ব্যাংক ট্রান্সফার" },
  bkashRocketNagad: { en: "Mobile Money (bKash/Nagad/Rocket)", bn: "মোবাইল ব্যাংকিং (বিকাশ/নগদ/রকেট)" },
  payAmountPrompt: { en: "Please complete payment of BDT", bn: "অনুগ্রহ করে সর্বমোট" },
  sendMoneyMerchant: { en: "to our Merchant Personal Account and register the TXN ID.", bn: "টাকা আমাদের বিকাশ/নগদ/রকেট নম্বরে ক্যাশআউট/সেন্ডমানি সম্পন্ন করে ট্রানজেকশন আইডি দিন।" },
  merchantNumbers: { en: "bKash / Nagad / Rocket Personal Number: 01711234567", bn: "বিকাশ / নগদ / রকেট পার্সোনাল নম্বর: ০১৭১১-২৩৪৫৬৭" },
  txIdLabel: { en: "Gateway Transaction ID (8-10 digits)", bn: "ট্রানজেকশন আইডি (TxnID)" },
  verifyPayment: { en: "Verify Gateway Code", bn: "পেমেন্ট ও অর্ডার সম্পন্ন করুন" },
  bankInfoTitle: { en: "Our Bank Account Details", bn: "ব্যাংক একাউন্ট বিবরণী" },
  bankInfoDetails: { en: "Bank: Dhaka Bank PLC, Acc: 102-393220-41, Branch: Dhanmondi, Name: Amar Dukaan BD", bn: "ব্যাংক: ঢাকা ব্যাংক পিএলসি, হিসাব নম্বর: ১০২-৩৯৩২২০-৪১, শাখা: ধানমণ্ডি, নাম: আমার দোকান বিডি" },
  trackYourOrder: { en: "Track Your Order Process", bn: "অর্ডার ট্র্যাক করতে চান?" },
  enterOrderId: { en: "Enter Order Reference ID (e.g., ORD-20260530-101)", bn: "অর্ডার আইডি দিন (যেমন: ORD-20260530-101)" },
  searchOrder: { en: "Track Order Status", bn: "অর্ডার খুঁজুন" },

  // Admin Dashboard
  totalSales: { en: "Total Sales Revenue", bn: "মোট বিক্রয়মূল্য" },
  totalOrders: { en: "Registered Orders", bn: "মোট অর্ডারসমূহ" },
  totalCustomers: { en: "Active Customer Pool", bn: "সক্রিয় ক্রেতা" },
  totalProducts: { en: "Catalog Inventory", bn: "মজুদ পণ্য তালিকা" },
  lowStockAlerts: { en: "Low Stock Warning Signs", bn: "কম স্টক সতর্কবার্তা" },
  pendingOrdersSec: { en: "Awaiting Confirmation", bn: "অপেক্ষমান অর্ডার" },
  monthlyRevenueCurve: { en: "Monthly Revenue Curve", bn: "মাসিক আয় বৃদ্ধির গ্রাফ" },
  managementHub: { en: "Admin Control Console", bn: "ম্যানেজমেন্ট ড্যাশবোর্ড" },
  addProducts: { en: "New Product Creator", bn: "নতুন পণ্য যোগ করুন" },
  exportReport: { en: "Data Exports (PDF/CSV)", bn: "রিপোর্ট এক্সপোর্ট করুন" },
  themeSettings: { en: "Aesthetic Settings", bn: "থিম ও হেডার সেটিংস" },
  homepageBuilder: { en: "Banner & Sliders Builder", bn: "হোমপেজ স্লাইডার বিল্ডার" },
  auditLog: { en: "Security Audit Trails", bn: "নিরাপত্তা অডিট লগ" },
  couponLimits: { en: "Discount Coupon Generator", bn: "ডিসকাউন্ট কুপন তৈরি" },
  shippingRatesSetting: { en: "Area Rates Adjustment", bn: "ডেলিভারি চার্জ চার্জ সেটিংস" }
};

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  // Multi-language helper
  const t = (translation: Translation | undefined, fallback = ""): string => {
    if (!translation) return fallback;
    return translation[language] || translation['en'] || fallback;
  };

  // Static strings helper
  const l = (key: keyof typeof DICTIONARY): string => {
    const entry = DICTIONARY[key];
    if (!entry) return String(key);
    return entry[language] || entry['en'];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, l }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
