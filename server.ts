// server.ts
import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import {
  Product,
  Category,
  Order,
  Coupon,
  PaymentLog,
  AuditLog,
  SiteConfig,
  Blog,
  FAQ,
  District,
  Upazila,
  OrderStatus
} from "./src/types";

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db.json");

// Define 64 Bangladeshi Districts
const BANGLADESH_DISTRICTS: District[] = [
  { id: "dhaka", name: { en: "Dhaka", bn: "ঢাকা" }, deliveryCharge: 60 },
  { id: "gazipur", name: { en: "Gazipur", bn: "গাজীপুর" }, deliveryCharge: 100 },
  { id: "narayanganj", name: { en: "Narayanganj", bn: "নারায়ণগঞ্জ" }, deliveryCharge: 100 },
  { id: "tangail", name: { en: "Tangail", bn: "টাঙ্গাইল" }, deliveryCharge: 120 },
  { id: "faridpur", name: { en: "Faridpur", bn: "ফরিদপুর" }, deliveryCharge: 120 },
  { id: "gopalganj", name: { en: "Gopalganj", bn: "গোপালগঞ্জ" }, deliveryCharge: 120 },
  { id: "kichoreganj", name: { en: "Kishoreganj", bn: "কিশোরগঞ্জ" }, deliveryCharge: 120 },
  { id: "madaripur", name: { en: "Madaripur", bn: "মাদারীপুর" }, deliveryCharge: 120 },
  { id: "manikganj", name: { en: "Manikganj", bn: "মানিকগঞ্জ" }, deliveryCharge: 120 },
  { id: "munshiganj", name: { en: "Munshiganj", bn: "মুন্সীগঞ্জ" }, deliveryCharge: 120 },
  { id: "narsingdi", name: { en: "Narsingdi", bn: "নরসিংদী" }, deliveryCharge: 120 },
  { id: "rajbari", name: { en: "Rajbari", bn: "রাজবাড়ী" }, deliveryCharge: 120 },
  { id: "shariatpur", name: { en: "Shariatpur", bn: "শরীয়তপুর" }, deliveryCharge: 120 },
  { id: "chattogram", name: { en: "Chattogram", bn: "চট্টগ্রাম" }, deliveryCharge: 130 },
  { id: "coxsbazar", name: { en: "Cox's Bazar", bn: "কক্সবাজার" }, deliveryCharge: 150 },
  { id: "bandarban", name: { en: "Bandarban", bn: "বান্দরবান" }, deliveryCharge: 150 },
  { id: "khagrachhari", name: { en: "Khagrachhari", bn: "খাগড়াছড়ি" }, deliveryCharge: 150 },
  { id: "rangamati", name: { en: "Rangamati", bn: "রাঙ্গামাটি" }, deliveryCharge: 150 },
  { id: "comilla", name: { en: "Comilla", bn: "কুমিল্লা" }, deliveryCharge: 120 },
  { id: "feni", name: { en: "Feni", bn: "ফেনী" }, deliveryCharge: 120 },
  { id: "brahmanbaria", name: { en: "Brahmanbaria", bn: "ব্রাহ্মণবাড়িয়া" }, deliveryCharge: 120 },
  { id: "chandpur", name: { en: "Chandpur", bn: "চাঁদপুর" }, deliveryCharge: 120 },
  { id: "noakhali", name: { en: "Noakhali", bn: "নোয়াখালী" }, deliveryCharge: 130 },
  { id: "lakshmipur", name: { en: "Lakshmipur", bn: "লক্ষ্মীপুর" }, deliveryCharge: 130 },
  { id: "sylhet", name: { en: "Sylhet", bn: "সিলেট" }, deliveryCharge: 130 },
  { id: "moulvibazar", name: { en: "Moulvibazar", bn: "মৌলভীবাজার" }, deliveryCharge: 130 },
  { id: "habiganj", name: { en: "Habiganj", bn: "হবিগঞ্জ" }, deliveryCharge: 130 },
  { id: "sunamganj", name: { en: "Sunamganj", bn: "সুনামগঞ্জ" }, deliveryCharge: 140 },
  { id: "rajshahi", name: { en: "Rajshahi", bn: "রাজশাহী" }, deliveryCharge: 130 },
  { id: "bogura", name: { en: "Bogura", bn: "বগুড়া" }, deliveryCharge: 120 },
  { id: "joypurhat", name: { en: "Joypurhat", bn: "জয়পুরহাট" }, deliveryCharge: 130 },
  { id: "naogaon", name: { en: "Naogaon", bn: "নওগাঁ" }, deliveryCharge: 130 },
  { id: "natore", name: { en: "Natore", bn: "নাটোর" }, deliveryCharge: 130 },
  { id: "chapainawabganj", name: { en: "Chapainawabganj", bn: "চাঁপাইনবাবগঞ্জ" }, deliveryCharge: 130 },
  { id: "pabna", name: { en: "Pabna", bn: "পাবনা" }, deliveryCharge: 130 },
  { id: "sirajganj", name: { en: "Sirajganj", bn: "সিরাজগঞ্জ" }, deliveryCharge: 130 },
  { id: "dinajpur", name: { en: "Dinajpur", bn: "দিনাজপুর" }, deliveryCharge: 130 },
  { id: "gaibandha", name: { en: "Gaibandha", bn: "গাইবান্ধা" }, deliveryCharge: 130 },
  { id: "kurigram", name: { en: "Kurigram", bn: "কুড়িগ্রাম" }, deliveryCharge: 140 },
  { id: "lalmonirhat", name: { en: "Lalmonirhat", bn: "লালমনিরহাট" }, deliveryCharge: 140 },
  { id: "nilphamari", name: { en: "Nilphamari", bn: "নীলফামারী" }, deliveryCharge: 130 },
  { id: "panchagarh", name: { en: "Panchagarh", bn: "পঞ্চগড়" }, deliveryCharge: 155 },
  { id: "rangpur", name: { en: "Rangpur", bn: "রংপুর" }, deliveryCharge: 130 },
  { id: "thakurgaon", name: { en: "Thakurgaon", bn: "ঠাকুরগাঁও" }, deliveryCharge: 140 },
  { id: "khulna", name: { en: "Khulna", bn: "খুলনা" }, deliveryCharge: 130 },
  { id: "bagerhat", name: { en: "Bagerhat", bn: "বাগেরহাট" }, deliveryCharge: 130 },
  { id: "jessore", name: { en: "Jessore", bn: "যশোর" }, deliveryCharge: 130 },
  { id: "jhenaidah", name: { en: "Jhenaidah", bn: "ঝিনাইদহ" }, deliveryCharge: 130 },
  { id: "kushtia", name: { en: "Kushtia", bn: "কুষ্টিয়া" }, deliveryCharge: 130 },
  { id: "magura", name: { en: "Magura", bn: "মাগুরা" }, deliveryCharge: 130 },
  { id: "meherpur", name: { en: "Meherpur", bn: "মেহেরপুর" }, deliveryCharge: 130 },
  { id: "narail", name: { en: "Narail", bn: "নড়াইল" }, deliveryCharge: 130 },
  { id: "satkhira", name: { en: "Satkhira", bn: "সাতক্ষীরা" }, deliveryCharge: 135 },
  { id: "barishal", name: { en: "Barishal", bn: "বরিশাল" }, deliveryCharge: 130 },
  { id: "bhola", name: { en: "Bhola", bn: "ভোলা" }, deliveryCharge: 145 },
  { id: "jhalokati", name: { en: "Jhalokati", bn: "ঝালকাঠি" }, deliveryCharge: 135 },
  { id: "patuakhali", name: { en: "Patuakhali", bn: "পটুয়াখালী" }, deliveryCharge: 140 },
  { id: "pirojpur", name: { en: "Pirojpur", bn: "পিরোজপুর" }, deliveryCharge: 135 },
  { id: "barguna", name: { en: "Barguna", bn: "বরগুনা" }, deliveryCharge: 140 },
  { id: "mymensingh", name: { en: "Mymensingh", bn: "ময়মনসিংহ" }, deliveryCharge: 120 },
  { id: "jamalpur", name: { en: "Jamalpur", bn: "জামালপুর" }, deliveryCharge: 130 },
  { id: "netrokona", name: { en: "Netrokona", bn: "নেত্রকোণা" }, deliveryCharge: 130 },
  { id: "sherpur", name: { en: "Sherpur", bn: "শেরপুর" }, deliveryCharge: 130 }
];

// Helper to generate Upazilas for any district programmatically
const getUpazilasForDistrict = (districtId: string): Upazila[] => {
  const commonUpazilas = [
    { suffixEn: "Sadar", suffixBn: "সদর", charge: 0 },
    { suffixEn: "Upazila West", suffixBn: "পশ্চিম উপজেলা", charge: 15 },
    { suffixEn: "Upazila East", suffixBn: "পূর্ব উপজেলা", charge: 15 },
    { suffixEn: "Remote Area", suffixBn: "দুর্গম অঞ্চল", charge: 30 }
  ];

  // Specific high fidelity upazilas for Tangail
  if (districtId === "tangail") {
    return [
      { id: "tangail-sadar", districtId, name: { en: "Tangail Sadar", bn: "টাঙ্গাইল সদর" }, additionalCharge: 0 },
      { id: "mirzapur", districtId, name: { en: "Mirzapur", bn: "মির্জাপুর" }, additionalCharge: 10 },
      { id: "gopalpur", districtId, name: { en: "Gopalpur", bn: "গোপালপুর" }, additionalCharge: 20 },
      { id: "kalihati", districtId, name: { en: "Kalihati", bn: "কালিহাতী" }, additionalCharge: 10 },
      { id: "madhupur", districtId, name: { en: "Madhupur", bn: "মধুপুর" }, additionalCharge: 20 },
      { id: "sakhipur", districtId, name: { en: "Sakhipur", bn: "সখিপুর" }, additionalCharge: 15 }
    ];
  }

  // Specific high fidelity upazilas for Dhaka
  if (districtId === "dhaka") {
    return [
      { id: "mirpur", districtId, name: { en: "Mirpur", bn: "মিরপুর" }, additionalCharge: 0 },
      { id: "uttara", districtId, name: { en: "Uttara", bn: "উত্তরা" }, additionalCharge: 0 },
      { id: "gulshan", districtId, name: { en: "Gulshan", bn: "গুলশান" }, additionalCharge: 0 },
      { id: "dhanmondi", districtId, name: { en: "Dhanmondi", bn: "ধানমণ্ডি" }, additionalCharge: 0 },
      { id: "s倾向r", districtId, name: { en: "Savar", bn: "সাভার" }, additionalCharge: 20 },
      { id: "keraniganj", districtId, name: { en: "Keraniganj", bn: "কেরানীগঞ্জ" }, additionalCharge: 15 }
    ];
  }

  const dist = BANGLADESH_DISTRICTS.find(d => d.id === districtId);
  const prefixEn = dist ? dist.name.en : "Area";
  const prefixBn = dist ? dist.name.bn : "এলাকা";

  return commonUpazilas.map((u, index) => ({
    id: `${districtId}-upazila-${index}`,
    districtId,
    name: {
      en: `${prefixEn} ${u.suffixEn}`,
      bn: `${prefixBn} ${u.suffixBn}`
    },
    additionalCharge: u.charge
  }));
};

interface Schema {
  config: SiteConfig;
  categories: Category[];
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  paymentLogs: PaymentLog[];
  activityLogs: AuditLog[];
  blogs: Blog[];
  faqs: FAQ[];
}

const DEFAULT_CONFIG: SiteConfig = {
  theme: {
    primaryColor: "emerald",
    secondaryColor: "slate",
    logoText: "AmarDukaan",
    contactEmail: "support@amardukaan.com.bd",
    contactPhone: "+880 1711-234567",
    address: "Level 4, House 12, Road 5, Dhanmondi, Dhaka 1205, Bangladesh",
    facebookUrl: "https://facebook.com/amardukaan",
    youtubeUrl: "https://youtube.com/amardukaan"
  },
  homepage: {
    heroSliders: [
      {
        id: "slide-1",
        title: { en: "Traditional Jamdani Festival", bn: "ঐতিহ্যবাহী জামদানী উৎসব" },
        subtitle: { en: "Up to 30% Off on Authentic Handloom Jamdani Sharees", bn: "খাঁটি তাঁতের জামদানী শাড়িতে ৩০% পর্যন্ত ছাড়" },
        imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200",
        link: "/catalog?category=fashion"
      },
      {
        id: "slide-2",
        title: { en: "Smart Living, Made in Bangladesh", bn: "স্মার্ট জীবনযাত্রা, বাংলাদেশে তৈরি" },
        subtitle: { en: "Explore Walton, Miyako and Top Electronics Brands", bn: "ওয়ালটন, মিয়াকো এবং শীর্ষস্থানীয় ইলেকট্রনিক্স পণ্য এক্সপ্লোর করুন" },
        imageUrl: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=1200",
        link: "/catalog?category=electronics"
      }
    ],
    featuredCategories: ["fashion", "electronics", "groceries", "home-decor"],
    promoBannerUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200",
    promoBannerLink: "/catalog?flashSale=true",
    promoText: { en: "Flash Sale Live! Extra BDT 500 Discount with code FLASH500", bn: "ফ্ল্যাশ সেল লাইভ! FLASH500 কোডে অতিরিক্ত ৫০০ টাকা ছাড়" }
  },
  seo: {
    metaTitle: { en: "AmarDukaan - Best Bangladeshi eCommerce Platform", bn: "আমারদোকান - বাংলাদেশের সেরা ই-কমার্স প্ল্যাটফর্ম" },
    metaDescription: { en: "Buy authentic handloom clothes, organic food, electronics and home decors directly in BDT with home delivery across Bangladesh.", bn: "সরাসরি বিডিটি-তে খাঁটি হ্যান্ডলুম কাপড়, অর্গানিক অর্গানিক খাবার, ইলেকট্রনিক্স এবং হোমর সামগ্রী কিনুন। সারা বাংলাদেশে হোম ডেলিভারি পাবেন।" }
  }
};

const DEFAULT_CATEGORIES: Category[] = [
  { id: "fashion", name: { en: "Fashion & Clothing", bn: "ফ্যাশন ও ক্লথিং" }, slug: "fashion" },
  { id: "electronics", name: { en: "Electronics & Gadgets", bn: "ইলেকট্রনিক্স ও গ্যাজেট" }, slug: "electronics" },
  { id: "groceries", name: { en: "Organic Food & Groceries", bn: "অর্গানিক ফুড ও গ্রোসারি" }, slug: "groceries" },
  { id: "home-decor", name: { en: "Home & Handmade Decor", bn: "হোম ও হ্যান্ডমেড ডেকোর" }, slug: "home-decor" }
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: { en: "Premium Handloom Dhakai Jamdani Sharee", bn: "প্রিমিয়াম তাঁতের ঢাকাই জামদানী শাড়ি" },
    description: {
      en: "Fully hand-woven 80-count cotton Jamdani sharee from Demra, Dhaka. Beautiful leaf-pattern embroidery with gold zari thread work. Lightweight and perfectly fits festive moments like Eid, weddings, and national days.",
      bn: "শতভাগ হাতে বোনা ৮০ কাউন্ট সুতি ঢাকাই জামদানী শাড়ি। ঢাকার ডেমরায় কারিগরদের নিখুঁত বুনন। সোনালী জরি সুতা ও মার্জিত পাতার নকশা সমৃদ্ধ। হাল্কা ও যেকোনো উৎসব বা পারিবারিক অনুষ্ঠানে মার্জিত লুকের জন্য পারফেক্ট।"
    },
    shortDescription: { en: "Authentic 12-Hand Traditional Handloom Jamdani Sharee", bn: "ঐতিহ্যবাহী ১২ হাত খাঁটি তাঁতের সুতির জামদানী শাড়ি" },
    price: 12500,
    compareAtPrice: 15000,
    sku: "JM-DHAKA-102",
    stock: 8,
    rating: 4.8,
    images: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600"
    ],
    categoryId: "fashion",
    brand: "Dhakai Weaves",
    variants: [
      { id: "v1-1", size: "12 Feet (Standard)", color: "Royal Red & Gold", sku: "JM-DHAKA-102-RD", price: 12500, stock: 5 },
      { id: "v1-2", size: "12 Feet (Standard)", color: "Classic Black", sku: "JM-DHAKA-102-BL", price: 12900, stock: 3 }
    ],
    specifications: [
      { key: "Material", value: "80-Count Pure Cotton & Silk zari" },
      { key: "Weave Style", value: "Handloom Traditional Jamdani" },
      { key: "Origin", value: "Demra, Dhaka, Bangladesh" }
    ],
    reviews: [
      { id: "r1", customerName: "Sabrina Kamal", rating: 5, comment: "Absolutely marvelous work. Genuine handloom Jamdani. Will buy again!", date: "2026-05-12" },
      { id: "r2", customerName: "Farhana J.", rating: 4, comment: "Very elegant, very soft. Delivery took 2 days in Dhaka.", date: "2026-05-24" }
    ],
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    isFlashSale: false
  },
  {
    id: "p2",
    name: { en: "Semi-Silk Festive Panjabi for Men", bn: "উৎসবের সেমি-সিল্ক ছেলেদের পাঞ্জাবী" },
    description: {
      en: "Luxurious semi-silk Panjabi designed for festive comfort. Styled with hand-embroided band collar and matching placket buttons. Extremely elegant drape and lightweight summer fabric.",
      bn: "উৎসবের দিনগুলোতে পরম কমফোর্টের জন্য তৈরি লাক্সারিয়াস সেমি-সিল্ক পাঞ্জাবী। মার্জিত এমব্রয়ডারি কলার এবং গর্জিয়াস বোতাম। গরমে আরামদায়ক কাপড়ের মান।"
    },
    shortDescription: { en: "Premium wedding & festive semi-silk Panjabi", bn: "প্রিমিয়াম উৎসব ও বিয়ের সেমি-সিল্ক পাঞ্জাবী" },
    price: 3800,
    compareAtPrice: 4500,
    sku: "PJ-FEST-203",
    stock: 15,
    rating: 4.5,
    images: [
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&q=80&w=600"
    ],
    categoryId: "fashion",
    brand: "Dorji Bari",
    variants: [
      { id: "v2-1", size: "40", color: "Slate Grey", sku: "PJ-FEST-203-40", price: 3800, stock: 5 },
      { id: "v2-2", size: "42", color: "Slate Grey", sku: "PJ-FEST-203-42", price: 3800, stock: 5 },
      { id: "v2-3", size: "44", color: "Royal Blue", sku: "PJ-FEST-203-44-BL", price: 3950, stock: 5 }
    ],
    specifications: [
      { key: "Fabric", value: "Premium Art-Silk Blend" },
      { key: "Care", value: "Dry Clean Recommended" },
      { key: "Fit", value: "Semi-Fit Traditional" }
    ],
    reviews: [
      { id: "r3", customerName: "Mahmudul Hasan", rating: 5, comment: "Fits perfectly. The grey color looks highly professional. Highly recommended.", date: "2026-04-18" }
    ],
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    isFlashSale: true,
    flashSaleDiscount: 15
  },
  {
    id: "p3",
    name: { en: "Premium Sundarban Organic Khalisha Honey", bn: "প্রিমিয়াম সুন্দরবনের খাঁটি খলিশা মধু" },
    description: {
      en: "100% raw, cold-filtered natural Khalisha flower honey sourced directly from Mawali collectors in deep Sundarban forests during spring. Pure honey that never turns sugary.",
      bn: "১০০% কাঁচা, কোল্ড-ফিল্টারড সুন্দরবনের প্রাকৃতিক খলিশা ফুলের মধু। বসন্তকালে সরাসরি মৌয়ালদের থেকে সংগৃহীত। কোনো ভেজাল বা কৃত্রিম চিনি ছাড়াই বোতলজাতকৃত।"
    },
    shortDescription: { en: "Raw Natural Khalisha Single-Origin Honey", bn: "সুন্দরবনের খাঁটি প্রাকৃতিকভাবে সংগৃহীত খলিশা ফুলের মধু" },
    price: 950,
    compareAtPrice: 1100,
    sku: "HN-SUNDAR-500G",
    stock: 50,
    rating: 4.9,
    images: [
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600"
    ],
    categoryId: "groceries",
    brand: "Shoddo",
    variants: [
      { id: "v3-1", size: "500g Glass Jar", sku: "HN-SUNDAR-500G", price: 950, stock: 30 },
      { id: "v3-2", size: "1kg Glass Jar", sku: "HN-SUNDAR-1KG", price: 1800, stock: 20 }
    ],
    specifications: [
      { key: "Purity", value: "100% Laboratory Verified Pure" },
      { key: "Flower Type", value: "Khalisha Flower Single Origin" },
      { key: "Sourced From", value: "Satkhira Range, Sundarbans" }
    ],
    reviews: [
      { id: "r4", customerName: "Ahsan Habib", rating: 5, comment: "I am amazed by the distinct aroma of Khalisha flower. This is the real deal.", date: "2026-05-01" }
    ],
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: true,
    isFlashSale: false
  },
  {
    id: "p4",
    name: { en: "Walton Smart Soundbar WSB-120", bn: "ওয়ালটন স্মার্ট সাউন্ডবার WSB-১২০" },
    description: {
      en: "Rich home theater sound bar proudly engineered by Walton. Features 120W cinematic sound, Bluetooth v5.1, HDMI ARC, Optic input, and a deep bass wireless subwoofer.",
      bn: "ওয়ালটনের তৈরি সমৃদ্ধ ১২০ ওয়াট সিনেমাটিক সাউন্ডের হোম থিয়েটার সাউন্ডবার। ব্লুটুথ ৫.১, এইচডিএমআই এআরসি, অপটিক্যাল ইনপুট এবং দুর্দান্ত ওয়ারলেস সাবউফার সমৃদ্ধ।"
    },
    shortDescription: { en: "120W Bluetooth Soundbar with Subwoofer", bn: "১২০ ওয়াট শক্তিশালী ব্লুটুথ সাউন্ডবার ও সাবউফার" },
    price: 8500,
    compareAtPrice: 9990,
    sku: "WT-SND-120",
    stock: 4, // Low stock to trigger low-stock alerts
    rating: 4.6,
    images: [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=600"
    ],
    categoryId: "electronics",
    brand: "Walton",
    variants: [
      { id: "v4-1", size: "Standard Coaxial", sku: "WT-SND-120-ST", price: 8500, stock: 4 }
    ],
    specifications: [
      { key: "Total Power Output", value: "120W RMS" },
      { key: "Subwoofer Range", value: "6.5 Inch Active Bass" },
      { key: "Connectivity", value: "Bluetooth v5.1, Optical, HDMI ARC, AUX" }
    ],
    reviews: [
      { id: "r5", customerName: "Tanvir Ahmed", rating: 4, comment: "Excellent bass response for Bangladeshi apartments. Build quality is solid.", date: "2026-05-15" }
    ],
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    isFlashSale: true,
    flashSaleDiscount: 10
  },
  {
    id: "p5",
    name: { en: "Handcrafted Clay Terracotta Flower Vase", bn: "হাতে তৈরি মাটির পোড়ামাটির বা টেরাকোটা ফুলদানী" },
    description: {
      en: "Exquisite terracotta flower vase handmade by traditional clay artisans of Bijoypur, Comilla. Crafted from organic alluvial soil, baked in high-temperature wood kilns, and hand-painted.",
      bn: "কুমিল্লার বিজয়পুরের ঐতিহ্যবাহী মৃৎশিল্পীদের তৈরি দৃষ্টিনন্দন টেরাকোটা মাটির ফুলদানি। দোআঁশ মাটিতে হাত দিয়ে গড়ে তোলা ও কাঠের চুল্লিতে পোড়ানো। নান্দনিক রঙের মিশ্রণ।"
    },
    shortDescription: { en: "Traditional Alluvial Clay Hand-Painted Vase", bn: "বিজয়পুরের ঐতিহ্যবাহী পোড়ামাটির হাতে আঁকা চমৎকার ফুলদানী" },
    price: 1200,
    compareAtPrice: 1600,
    sku: "TC-BIJOY-33",
    stock: 12,
    rating: 4.4,
    images: [
      "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&q=80&w=600"
    ],
    categoryId: "home-decor",
    brand: "Bijoypur Artisans",
    variants: [
      { id: "v5-1", size: "12 Inch Height", color: "Earth Brown & Gold", sku: "TC-BIJOY-33-BR", price: 1200, stock: 12 }
    ],
    specifications: [
      { key: "Material", value: "100% Baked Natural Clay (Terracotta)" },
      { key: "Height", value: "12 Inches" },
      { key: "Origin", value: "Bijoypur, Comilla, Bangladesh" }
    ],
    reviews: [],
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
    isFlashSale: false
  },
  {
    id: "p6",
    name: { en: "Authentic Handloom Tangail Cotton Saree", bn: "ঐতিহ্যবাহী তাঁতের টাঙ্গাইল সুতি শাড়ি" },
    description: {
      en: "Woven by the master weavers of Pathrail, Tangail, this 100% pure cotton saree features classic handloom craftsmanship, fine thread embroidery, and contrasting border patterns. Perfect for everyday elegance and cultural festivities.",
      bn: "টাঙ্গাইলের পাথরাইলের দক্ষ কারিগরদের বোনা ১০০% খাঁটি সুতি শাড়ি। ঐতিহ্যবাহী তাঁত ডিজাইন, নিখুঁত সুতার কাজ এবং আকর্ষণীয় পাড় নকশা। সাধারণ আরামদায়ক ব্যবহার এবং যেকোনো উৎসবের জন্য চমৎকার।"
    },
    shortDescription: { en: "Pure Handloom Cotton Saree from Pathrail, Tangail", bn: "টাঙ্গাইলের পাথরাইলের চমৎকার তাঁতের সুতি শাড়ি" },
    price: 2800,
    compareAtPrice: 3500,
    sku: "SR-TNG-101",
    stock: 14,
    rating: 4.7,
    images: [
      "https://images.unsplash.com/photo-1610030470298-40b355e7178c?auto=format&fit=crop&q=80&w=600"
    ],
    categoryId: "fashion",
    brand: "Tangail Tant",
    variants: [
      { id: "v6-1", size: "12 Feet Standard", color: "Mustard Yellow & Red", sku: "SR-TNG-101-YL", price: 2800, stock: 8 },
      { id: "v6-2", size: "12 Feet Standard", color: "Emerald Green", sku: "SR-TNG-101-GR", price: 2800, stock: 6 }
    ],
    specifications: [
      { key: "Material", value: "100% Cotton Handloom" },
      { key: "Weave Origin", value: "Pathrail, Tangail, Bangladesh" },
      { key: "Length", value: "12 cubits (Standard)" }
    ],
    reviews: [
      { id: "r6", customerName: "Tanha Islam", rating: 5, comment: "Authentic Tangail cotton! Very lightweight and comfortable. Love the red border work.", date: "2026-05-18" }
    ],
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    isFlashSale: false
  },
  {
    id: "p7",
    name: { en: "Premium Genuine Bangladesh Leather Slim Wallet", bn: "প্রিমিয়াম খাঁটি চামড়ার স্লিম ওয়ালেট" },
    description: {
      en: "Engineered from top-grain locally sourced Bangladeshi cowhide leather. This slim bi-fold wallet contains 6 card slots, a secure cash compartment, and RFID blocking technology to safeguard your bank cards.",
      bn: "বাংলাদেশের টপ-গ্রেইন প্রিমিয়াম গরুর চামড়া দিয়ে তৈরি স্লিম বাই-ফোল্ড ওয়ালেট। এতে আছে ৬টি কার্ড স্লট, সুরক্ষিত ক্যাশ পকেট এবং তথ্য সুরক্ষার জন্য আরএফআইডি ব্লকিং প্রযুক্তি।"
    },
    shortDescription: { en: "Genuine Bovine Leather Wallet with RFID Blocking", bn: "খাঁটি দেশী চামড়ার তৈরি আরএফআইডি সুরক্ষিত ওয়ালেট" },
    price: 1450,
    compareAtPrice: 1850,
    sku: "LW-BD-501",
    stock: 25,
    rating: 4.6,
    images: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=600"
    ],
    categoryId: "fashion",
    brand: "Apex Leather",
    variants: [
      { id: "v7-1", size: "Standard", color: "Classic Brown", sku: "LW-BD-501-BR", price: 1450, stock: 15 },
      { id: "v7-2", size: "Standard", color: "Matte Black", sku: "LW-BD-501-BL", price: 1450, stock: 10 }
    ],
    specifications: [
      { key: "Material", value: "100% Genuine Bovine Leather" },
      { key: "Features", value: "RFID Blocking, 6 Card Slots, Cash Slot" }
    ],
    reviews: [],
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    isFlashSale: true,
    flashSaleDiscount: 10
  },
  {
    id: "p8",
    name: { en: "Premium Organic ChiniGura Kalojira Rice", bn: "প্রিমিয়াম অর্গানিক চিনিগুঁড়া সুগন্ধি চাল" },
    description: {
      en: "Sourced from the fertile fields of Dinajpur, our premium non-boiled ChiniGura aromatic rice is perfect for mouth-watering Polao, Biryani, and Payesh. Organic, pesticide-free, and thoroughly sorted.",
      bn: "দিনাজপুরের উর্বর পলিময় মাঠে উৎপাদিত প্রিমিয়াম চিনিগুঁড়া বা কালোজিরা সুগন্ধি চাল। বিয়ের পোলাও, বিরিয়ানি ও সুস্বাদু পায়েশের জন্য অনবদ্য। সম্পূর্ণ অর্গানিক এবং ধুলোবালি মুক্ত।"
    },
    shortDescription: { en: "Selected Dinajpur Aromatic ChiniGura Rice (Pesticide-Free)", bn: "দিনাজপুরের ঐতিহ্যবাহী প্রিমিয়াম চিনিগুঁড়া সুগন্ধি পোলার চাল" },
    price: 160,
    compareAtPrice: 180,
    sku: "RC-CHINI-2KG",
    stock: 100,
    rating: 4.9,
    images: [
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600"
    ],
    categoryId: "groceries",
    brand: "Dinajpur Agro",
    variants: [
      { id: "v8-1", size: "2kg Poly Pack", sku: "RC-CHINI-2KG", price: 160, stock: 60 },
      { id: "v8-2", size: "5kg Canvas Pack", sku: "RC-CHINI-5KG", price: 380, stock: 40 }
    ],
    specifications: [
      { key: "Type", value: "ChiniGura / Kalojira Aromatic Scented Rice" },
      { key: "Origin", value: "Dinajpur, Bangladesh" }
    ],
    reviews: [
      { id: "r8", customerName: "Hasan Al Banna", rating: 5, comment: "Outstanding aroma! The rice is small and perfectly whole. Polao turned out amazing.", date: "2026-05-22" }
    ],
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    isFlashSale: false
  },
  {
    id: "p9",
    name: { en: "Pure Cold-Pressed Wood-Ghanni Mustard Oil", bn: "কাঠের ঘানিতে ভাঙা খাঁটি সরিষার তেল" },
    description: {
      en: "Traditionally extracted from selected local mustard seeds using wooden Ghani. Retains natural flavor, nutrition, and heavy pungency. Absolutely zero added preservatives or chemicals. Made for dynamic Bangladeshi kitchen setups.",
      bn: "পরম ঐতিহ্যবাহী কাঠের ঘানিতে ভাঙা বিশুদ্ধ সরিষার তেল। এর তীব্র ঝাজালো ঘ্রাণ ও গুণাগুণ শতভাগ অটুট। কোনো ধরনের ভেজাল বা কৃত্রিম রঙ ছাড়াই বোতলজাত করা।"
    },
    shortDescription: { en: "100% Pure Cold-Pressed Traditional Ghani Mustard Oil", bn: "কাঠের ঘানিতে ভাঙা খাঁটি ঐতিহ্যবাহী ঝাজালো সরিষার তেল" },
    price: 280,
    compareAtPrice: 320,
    sku: "OL-MST-1L",
    stock: 80,
    rating: 4.8,
    images: [
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=600"
    ],
    categoryId: "groceries",
    brand: "Shorisha Ghor",
    variants: [
      { id: "v9-1", size: "1 Litre Bottle", sku: "OL-MST-1L", price: 280, stock: 50 },
      { id: "v9-2", size: "2 Litre Can", sku: "OL-MST-2L", price: 540, stock: 30 }
    ],
    specifications: [
      { key: "Extraction Method", value: "Cold-Pressed Wooden Ghani (ঘানি)" },
      { key: "Ingredients", value: "100% Pure Mustard Seeds" }
    ],
    reviews: [],
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: true,
    isFlashSale: false
  },
  {
    id: "p10",
    name: { en: "Miyako Premium Electric Kettle MJK-100", bn: "মিয়াকো প্রিমিয়াম ইলেকট্রিক কেটলি MJK-১০০" },
    description: {
      en: "High performance 1.5L cordless electric kettle with double-wall cool-touch body. Engineered with fast-boiling 1500W element, automatic dry-boil safety shutoff, and food-grade stainless steel interior.",
      bn: "মিয়াকো ১.৫ লিটার ডাবল-ওয়াল কুল-টাচ ইলেকট্রিক কেটলি। ১৫০০ ওয়াট দ্রুত গরম প্রযুক্তির সেগমেন্টের ডাবল প্রোটেকশন, স্টেইনলেস স্টিল ম্যাটেরিয়াল এবং ড্রাই-বয়েল অটো অফ সুবিধা।"
    },
    shortDescription: { en: "1.5L Cool-Touch Cordless Electric Kettle", bn: "মিয়াকো ১.৫ লিটার বডি-সুরক্ষিত কর্ডলেস ইলেকট্রিক কেটলি" },
    price: 1850,
    compareAtPrice: 2200,
    sku: "EL-MIY-MK100",
    stock: 18,
    rating: 4.5,
    images: [
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=600"
    ],
    categoryId: "electronics",
    brand: "Miyako",
    variants: [
      { id: "v10-1", size: "1.5 Litre Standard", color: "Classic Silver & Black", sku: "EL-MIY-MK100-SL", price: 1850, stock: 18 }
    ],
    specifications: [
      { key: "Power", value: "1500 Watts 220V" },
      { key: "Capacity", value: "1.5 Litres" },
      { key: "Safety", value: "Auto Shutoff, Boil-Dry Protection" }
    ],
    reviews: [],
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    isFlashSale: false
  },
  {
    id: "p11",
    name: { en: "Walton High Speed Rechargeable Desk Fan", bn: "ওয়ালটন হাই স্পিড রিচার্জেবল টেবিল ফ্যান" },
    description: {
      en: "Beat load shedding with Walton rechargeable desk fan. Equipped with a long-lasting Lithium-ion battery providing up to 8 hours of continuous breeze, 3-speed adjustable airflow, and integrated LED nightlight.",
      bn: "লোডশেডিং এর মোক্ষম সমাধান ওয়ালটন রিচার্জেবল ফ্যান। শক্তিশালী লিথিয়াম ব্যাটারির সাহায্যে টানা ৮ ঘণ্টা মৃদু হাওয়া, ৩ স্পিড কন্ট্রোল এবং জরুরি ব্যবহারের জন্য চমৎকার এলইডি নাইট লাইট।"
    },
    shortDescription: { en: "12-Inch Rechargeable Oscillating Fan", bn: "ওয়ালটন ১২-ইঞ্চি চার্জিং টেবিল ফ্যান" },
    price: 4200,
    compareAtPrice: 4800,
    sku: "EL-WT-FAN12",
    stock: 10,
    rating: 4.6,
    images: [
      "https://images.unsplash.com/photo-1618944847023-38aa001235f0?auto=format&fit=crop&q=80&w=600"
    ],
    categoryId: "electronics",
    brand: "Walton",
    variants: [
      { id: "v11-1", size: "12-Inch Blades", color: "Ocean Blue & White", sku: "EL-WT-FAN12-BL", price: 4200, stock: 10 }
    ],
    specifications: [
      { key: "Battery", value: "12V 4.5Ah Rechargeable Lead-Acid" },
      { key: "Backup Time", value: "High: 3 hours, Low: 8 hours" }
    ],
    reviews: [],
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: true,
    isFlashSale: true,
    flashSaleDiscount: 12
  },
  {
    id: "p12",
    name: { en: "Handcrafted Organic Jute Fiber Rug Accent", bn: "হাতে বোনা খাঁটি পাটের গোল টেবিল গালিচা" },
    description: {
      en: "Woven with premium-grade golden jute fiber, the most sustainable organic material in Bangladesh. Features a modern geometric coiled layout with clean margins and elegant edge stitches. Gives a boho, organic feel to your living room.",
      bn: "বাংলাদেশের সোনালী আঁশ পাট দিয়ে তৈরি খাঁটি হাতে বোনা চমৎকার রাউন্ড কার্পেট বা ডেকোরেটিভ গালিচা। চমৎকার বৃত্তাকার বুনন যা বসার ঘরের সৌন্দর্য বহুলাংশে বৃদ্ধি করে।"
    },
    shortDescription: { en: "100% Eco-Friendly Golden Jute Hand-Spun Area Rug", bn: "১০০% পরিবেশবান্ধব সোনালী পাটের চমৎকার বসার ঘরের কার্পেট" },
    price: 2400,
    compareAtPrice: 3200,
    sku: "HD-JUT-RU4",
    stock: 15,
    rating: 4.8,
    images: [
      "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=600"
    ],
    categoryId: "home-decor",
    brand: "Golden Fibers",
    variants: [
      { id: "v12-1", size: "4 Feet Diameter", color: "Natural Jute Gold", sku: "HD-JUT-RU4-4D", price: 2400, stock: 10 },
      { id: "v12-2", size: "6 Feet Diameter", color: "Natural Jute Gold", sku: "HD-JUT-RU4-6D", price: 3900, stock: 5 }
    ],
    specifications: [
      { key: "Material", value: "100% Export Quality Golden Jute Fiber" },
      { key: "Weave Style", value: "Circular Braided Eco-friendly Rug" }
    ],
    reviews: [
      { id: "r12", customerName: "Siddiqur Rahman", rating: 5, comment: "Impressive workmanship. Completely organic vibe, perfect size for my center coffee table.", date: "2026-05-20" }
    ],
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    isFlashSale: false
  },
  {
    id: "p13",
    name: { en: "Classic Hand-woven Premium Sylhet Sital Pati", bn: "সিলেটের ঐতিহ্যবাহী প্রিমিয়াম শীতল পাটি" },
    description: {
      en: "Authentic Sital Pati handcraft woven in Sylhet from Murta plants. Known for its cooling properties and silky texture, it acts as a magical summer bed/floor mat. Keeps body heat down naturally.",
      bn: "মুর্তা গাছ থেকে তৈরি সিলেটের বিশ্বখ্যাত ঐতিহ্যবাহী প্রিমিয়াম শীতল পাটি। দারুণ আরামদায়ক ও ঠান্ডাদায়ক গুণাগুণ সম্পন্ন। বসার বা ঘুমানোর জন্য গরমে অসম্ভব আরাম।"
    },
    shortDescription: { en: "Sylhet's Heritage Organic Cane Cooling Bed Mat", bn: "সিлеটের সম্পূর্ণ প্রাকৃতিকভাবে তৈরি শীতল শীতল পাটি" },
    price: 1950,
    compareAtPrice: 2500,
    sku: "HD-STL-PATI",
    stock: 8,
    rating: 4.9,
    images: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600"
    ],
    categoryId: "home-decor",
    brand: "Sylhet Cane Crafts",
    variants: [
      { id: "v13-1", size: "5ft x 7ft (Standard)", color: "Natural Wood & Ruby Weave", sku: "HD-STL-PATI-S", price: 1950, stock: 8 }
    ],
    specifications: [
      { key: "Raw Material", value: "100% Murta Plant (Schumannianthus dichotomus)" },
      { key: "Origin", value: "Sylhet, Bangladesh" }
    ],
    reviews: [],
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    isFlashSale: false
  }
];

const DEFAULT_COUPONS: Coupon[] = [
  { id: "c1", code: "WINTER20", type: "percentage", value: 20, expiryDate: "2026-12-31", usageLimit: 100, usageCount: 22 },
  { id: "c2", code: "FREESHIP", type: "free_shipping", value: 0, expiryDate: "2026-09-30", usageLimit: 50, usageCount: 15 },
  { id: "c3", code: "AMAR500", type: "fixed", value: 500, expiryDate: "2026-08-15", usageLimit: 200, usageCount: 45, minOrderAmount: 2000 }
];

const DEFAULT_BLOGS: Blog[] = [
  {
    id: "b1",
    title: { en: "The Unfading Loom of Dhakai Jamdani", bn: "ঢাকাই জামদানির অবিনশ্বর বুনন শৈলী" },
    content: {
      en: "Dhakai Jamdani is not just a clothing fabric; it is a live narrative of Bangladeshi high craftsmanship. Recognized by UNESCO as an Intangible Cultural Heritage of Humanity, Jamdani's unique geographic origin relies heavily on the moist air of the Shitalakshya River...",
      bn: "ঢাকাই জামদানী কেবল এক টুকরো কাপড় নয়; এটি বাংলার এক প্রাচীন ও সমৃদ্ধ ঐতিহ্যের ধারক। ইউনেস্কো কর্তৃক 'ইনট্যানজিবল কালচারাল হেরিটেজ' হিসেবে ঘোষিত জামদানির সূক্ষ্মতা নির্ভর করে শীতলক্ষ্যা নদীর আবহাওয়া এবং এ অঞ্চলের কারিগরদের বংশপরম্পরায় লাভ করা নৈপুণ্যের ওপর..."
    },
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600",
    author: "Zubaida Rahman",
    createdAt: "2026-04-10T11:00:00Z"
  }
];

const DEFAULT_FAQS: FAQ[] = [
  {
    question: { en: "How long does home delivery take?", bn: "হোম ডেলিভারি পেতে কতদিন সময় লাগবে?" },
    answer: { en: "Inside Dhaka takes 24 to 48 hours. Outside Dhaka takes 2 to 4 working days via top courier partners like RedX, Steadfast, and Pathao.", bn: "ঢাকা সিটির ভেতরে ২৪ থেকে ৪৮ ঘণ্টা। ঢাকার বাইরে যেকোনো জেলা শহরে রেডএক্স বা পাঠাও ফাস্ট কুরিয়ার সার্ভিসের মাধ্যমে ২ থেকে ৪ কার্যদিবসের মধ্যে ডেলিভারি পাবেন।" }
  },
  {
    question: { en: "What mobile payment systems do you accept?", bn: "আপনারা কি কি মোবাইল পেমেন্ট গ্রহণ করেন?" },
    answer: { en: "We integrate fully secure bKash, Rocket, and Nagad. Once you cash-out/merchant-pay or send-money, provide the Transaction ID inside our payment validation system for auto confirmation.", bn: "আমরা সম্পূর্ণ সুরক্ষার সাথে বিকাশ, রকেট এবং নগদ পেমেন্ট গ্রহণ করি। ক্যাশআউট বা সেন্ডমানি সম্পন্ন করে ট্রানজেকশন আইডি প্রদান করলেই স্বয়ংক্রিয়ভাবে পেমেন্ট ভেরিফাই হয়ে যাবে।" }
  }
];

const DEFAULT_ORDERS: Order[] = [
  {
    id: "ORD-20260530-01",
    customerName: "Imran Khan",
    customerPhone: "01789123456",
    customerEmail: "imran@gmail.com",
    shippingAddress: "Block E, House 42, Mirzapur, Tangail",
    districtId: "tangail",
    upazilaId: "mirzapur",
    items: [
      {
        productId: "p2",
        variantId: "v2-2",
        name: { en: "Semi-Silk Festive Panjabi for Men", bn: "উৎসবের সেমি-সিল্ক ছেলেদের পাঞ্জাবী" },
        price: 3800,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=150",
        selectedSize: "42",
        selectedColor: "Slate Grey"
      }
    ],
    subtotal: 3800,
    deliveryCharge: 130, // 120 base for Tangail + 10 for Mirzapur
    discount: 500, // AMAR500 coupon
    tax: 0,
    total: 3430,
    paymentMethod: "bKash",
    paymentStatus: "Paid",
    transactionId: "BK992A77FD",
    status: "Confirmed",
    createdAt: "2026-05-29T10:15:00Z",
    history: [
      { status: "Pending", note: "Order placed, awaiting transaction confirmation", timestamp: "2026-05-29T10:15:00Z" },
      { status: "Confirmed", note: "bKash Verified Automatically. TXN ID: BK992A77FD", timestamp: "2026-05-29T10:20:00Z" }
    ],
    courierName: "Steadfast Courier",
    trackingNumber: "ST-881902-BD"
  }
];

const DEFAULT_PAYMENT_LOGS: PaymentLog[] = [
  {
    id: "pay-1",
    orderId: "ORD-20260530-01",
    amount: 3430,
    paymentMethod: "bKash",
    transactionId: "BK992A77FD",
    status: "Verified",
    timestamp: "2026-05-29T10:20:00Z",
    customerPhone: "01789123456"
  }
];

const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  {
    id: "audit-1",
    adminName: "Admin Chief",
    action: "System Bootstrapped",
    details: "In-memory JSON database initialized with local seed data and Bangladesh region rates.",
    timestamp: "2026-05-30T09:30:00Z"
  }
];

// Read DB or Initialize
function getDb(): Schema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialDb: Schema = {
        config: DEFAULT_CONFIG,
        categories: DEFAULT_CATEGORIES,
        products: DEFAULT_PRODUCTS,
        orders: DEFAULT_ORDERS,
        coupons: DEFAULT_COUPONS,
        paymentLogs: DEFAULT_PAYMENT_LOGS,
        activityLogs: DEFAULT_AUDIT_LOGS,
        blogs: DEFAULT_BLOGS,
        faqs: DEFAULT_FAQS
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), "utf-8");
      return initialDb;
    }
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Database reading warning (using default):", err);
    return {
      config: DEFAULT_CONFIG,
      categories: DEFAULT_CATEGORIES,
      products: DEFAULT_PRODUCTS,
      orders: DEFAULT_ORDERS,
      coupons: DEFAULT_COUPONS,
      paymentLogs: DEFAULT_PAYMENT_LOGS,
      activityLogs: DEFAULT_AUDIT_LOGS,
      blogs: DEFAULT_BLOGS,
      faqs: DEFAULT_FAQS
    };
  }
}

function writeDb(data: Schema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Database writing error: ", err);
  }
}

// Log admin action helper
function addAuditLog(action: string, details: string) {
  const db = getDb();
  const log: AuditLog = {
    id: "audit-" + Date.now().toString(36),
    adminName: "Admin Desk",
    action,
    details,
    timestamp: new Date().toISOString()
  };
  db.activityLogs.unshift(log);
  if (db.activityLogs.length > 200) {
    db.activityLogs.pop();
  }
  writeDb(db);
}

// REST Middlewares
app.use(express.json({ limit: "5mb" }));

// Rate Limiter Mock
const requestCountMap = new Map<string, { count: number; expires: number }>();
app.use((req, res, next) => {
  const ip = req.ip || "127.0.0.1";
  const now = Date.now();
  const record = requestCountMap.get(ip);

  if (record && record.expires > now) {
    if (record.count > 120) { // Limit to 120 requests per minute
      return res.status(429).json({ error: "Too many requests. Cloud rate limiter triggered." });
    }
    record.count++;
  } else {
    requestCountMap.set(ip, { count: 1, expires: now + 60000 });
  }
  next();
});

// APIs Group

// 1. Districts & Upazilas Location system
app.get("/api/shipping/locations", (req, res) => {
  res.json({
    districts: BANGLADESH_DISTRICTS,
    getUpazilasUrl: "/api/shipping/upazilas?districtId="
  });
});

app.get("/api/shipping/upazilas", (req, res) => {
  const districtId = req.query.districtId as string;
  if (!districtId) {
    return res.status(400).json({ error: "districtId is required" });
  }
  const upazilas = getUpazilasForDistrict(districtId);
  res.json(upazilas);
});

// 2. Config & Custom theme manager
app.get("/api/config", (req: Request, res: Response) => {
  const db = getDb();
  res.json(db.config);
});

app.post("/api/config", (req, res) => {
  const db = getDb();
  db.config = { ...db.config, ...req.body };
  writeDb(db);
  addAuditLog("Theme Page Settings Updated", "Changed homepage banners, colors or SEO meta settings from dashboard");
  res.json({ success: true, config: db.config });
});

// 3. Products Endpoints
app.get("/api/products", (req, res) => {
  const db = getDb();
  let result = [...db.products];

  // Quick Ajax Search
  const search = req.query.search as string;
  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      p =>
        p.name.en.toLowerCase().includes(q) ||
        p.name.bn.includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
    );
  }

  // Filter Categories
  const category = req.query.category as string;
  if (category) {
    result = result.filter(p => p.categoryId === category);
  }

  // Flash Sale Status Filter
  const flashSale = req.query.flashSale as string;
  if (flashSale === "true") {
    result = result.filter(p => p.isFlashSale);
  }

  // New arrivals
  const isNew = req.query.isNew as string;
  if (isNew === "true") {
    result = result.filter(p => p.isNewArrival);
  }

  // Best Sellers
  const bestSeller = req.query.bestSeller as string;
  if (bestSeller === "true") {
    result = result.filter(p => p.isBestSeller);
  }

  res.json(result);
});

app.get("/api/products/:id", (req, res) => {
  const db = getDb();
  const product = db.products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.json(product);
});

app.post("/api/products", (req, res) => {
  const db = getDb();
  const rawProduct = req.body;
  
  if (!rawProduct.name || !rawProduct.name.en || !rawProduct.price) {
    return res.status(400).json({ error: "Product name and price are required." });
  }

  const newProduct: Product = {
    id: "p-" + Date.now().toString(36),
    name: rawProduct.name,
    description: rawProduct.description || { en: "", bn: "" },
    shortDescription: rawProduct.shortDescription || { en: "", bn: "" },
    price: Number(rawProduct.price),
    compareAtPrice: rawProduct.compareAtPrice ? Number(rawProduct.compareAtPrice) : undefined,
    sku: rawProduct.sku || ("SKU-" + Date.now().toString().slice(-6)),
    stock: Number(rawProduct.stock || 0),
    rating: rawProduct.rating ? Number(rawProduct.rating) : 5.0,
    images: Array.isArray(rawProduct.images) && rawProduct.images.length > 0 ? rawProduct.images : ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=300"],
    categoryId: rawProduct.categoryId || "fashion",
    brand: rawProduct.brand || "Local Craft",
    variants: rawProduct.variants || [],
    specifications: rawProduct.specifications || [],
    reviews: rawProduct.reviews || [],
    isFeatured: !!rawProduct.isFeatured,
    isNewArrival: !!rawProduct.isNewArrival,
    isBestSeller: !!rawProduct.isBestSeller,
    isFlashSale: !!rawProduct.isFlashSale,
    flashSaleDiscount: rawProduct.flashSaleDiscount ? Number(rawProduct.flashSaleDiscount) : undefined
  };

  db.products.unshift(newProduct);
  writeDb(db);
  addAuditLog("Add Product", `Created product SKU: ${newProduct.sku} - ${newProduct.name.en}`);
  res.status(201).json(newProduct);
});

app.put("/api/products/:id", (req, res) => {
  const db = getDb();
  const index = db.products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  const originalProduct = db.products[index];
  const updatedProduct = {
    ...originalProduct,
    ...req.body,
    // ensure casting
    price: Number(req.body.price ?? originalProduct.price),
    compareAtPrice: req.body.compareAtPrice ? Number(req.body.compareAtPrice) : originalProduct.compareAtPrice,
    stock: Number(req.body.stock ?? originalProduct.stock),
  };

  db.products[index] = updatedProduct;
  writeDb(db);
  addAuditLog("Modify Product", `Updated product SKU: ${updatedProduct.sku}`);
  res.json(updatedProduct);
});

app.delete("/api/products/:id", (req, res) => {
  const db = getDb();
  const product = db.products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }
  db.products = db.products.filter(p => p.id !== req.params.id);
  writeDb(db);
  addAuditLog("Deleted Product", `Removed product: ${product.name.en} (SKU: ${product.sku})`);
  res.json({ success: true });
});

// Bulk Import/Export Products
app.post("/api/products/bulk-import", (req, res) => {
  const db = getDb();
  const importedProducts = req.body;
  if (!Array.isArray(importedProducts)) {
    return res.status(400).json({ error: "Import payload must be an array of products" });
  }

  let count = 0;
  importedProducts.forEach(p => {
    if (p.name && p.price) {
      db.products.push({
        id: "p-" + Math.random().toString(36).slice(2, 9),
        name: p.name,
        description: p.description || { en: "", bn: "" },
        price: Number(p.price),
        sku: p.sku || "SKU-" + Math.random().toString(36).slice(2, 7).toUpperCase(),
        stock: Number(p.stock || 10),
        rating: 4.5,
        images: p.images || ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=300"],
        categoryId: p.categoryId || "fashion",
        brand: p.brand || "Imported Brand",
        variants: p.variants || [],
        specifications: p.specifications || [],
        reviews: [],
        isFeatured: !!p.isFeatured,
        isNewArrival: !!p.isNewArrival,
        isBestSeller: !!p.isBestSeller,
        isFlashSale: !!p.isFlashSale
      });
      count++;
    }
  });

  writeDb(db);
  addAuditLog("Bulk Import Products", `Imported ${count} products via bulk custom data loader`);
  res.json({ success: true, count });
});

// 4. Categories Endpoints
app.get("/api/categories", (req, res) => {
  const db = getDb();
  res.json(db.categories);
});

app.post("/api/categories", (req, res) => {
  const db = getDb();
  const { name, slug, image, parentId } = req.body;
  if (!name || !slug) {
    return res.status(400).json({ error: "Name and Slug are required." });
  }
  const newCat: Category = {
    id: slug,
    name,
    slug,
    image: image || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=200",
    parentId
  };
  db.categories.push(newCat);
  writeDb(db);
  addAuditLog("Create Category", `Added categories path: ${newCat.name.en}`);
  res.status(201).json(newCat);
});

// 5. Coupon System
app.get("/api/coupons", (req, res) => {
  const db = getDb();
  res.json(db.coupons);
});

app.post("/api/coupons", (req, res) => {
  const db = getDb();
  const newCoupon: Coupon = {
    id: "c-" + Date.now().toString(36),
    code: req.body.code.trim().toUpperCase(),
    type: req.body.type || "percentage",
    value: Number(req.body.value),
    expiryDate: req.body.expiryDate || "2026-12-31",
    usageLimit: Number(req.body.usageLimit || 100),
    usageCount: 0,
    minOrderAmount: req.body.minOrderAmount ? Number(req.body.minOrderAmount) : undefined,
    categoryRestriction: req.body.categoryRestriction,
    productRestriction: req.body.productRestriction
  };

  db.coupons.push(newCoupon);
  writeDb(db);
  addAuditLog("Create Coupon", `Added promotional discount coupon: ${newCoupon.code}`);
  res.status(201).json(newCoupon);
});

app.post("/api/coupons/validate", (req, res) => {
  const { code, cartSubtotal, categoryIds, productIds } = req.body;
  if (!code) {
    return res.status(400).json({ error: "Coupon code is required" });
  }

  const db = getDb();
  const coupon = db.coupons.find(c => c.code === code.trim().toUpperCase());

  if (!coupon) {
    return res.status(404).json({ error: "Invalid coupon code" });
  }

  // Check Expiry Date
  const expires = new Date(coupon.expiryDate);
  const today = new Date();
  if (expires < today) {
    return res.status(400).json({ error: "Coupon has expired." });
  }

  // Limit Code Runs
  if (coupon.usageCount >= coupon.usageLimit) {
    return res.status(400).json({ error: "This coupon's usage limit has been exceeded." });
  }

  // Check Min Order Limit
  if (coupon.minOrderAmount && Number(cartSubtotal) < coupon.minOrderAmount) {
    return res.status(400).json({
      error: `Minimum order amount of BDT ${coupon.minOrderAmount} is required to apply, your subtotal matches BDT ${cartSubtotal}`
    });
  }

  // Validate Specific Categories Restrictions
  if (coupon.categoryRestriction && Array.isArray(categoryIds)) {
    if (!categoryIds.includes(coupon.categoryRestriction)) {
      return res.status(400).json({ error: "This coupon is not valid for products in your cart." });
    }
  }

  // Validate Specific Product Restriction
  if (coupon.productRestriction && Array.isArray(productIds)) {
    if (!productIds.includes(coupon.productRestriction)) {
      return res.status(400).json({ error: "This coupon is restricted to a specific product that is of premium rank." });
    }
  }

  res.json({
    success: true,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value
  });
});

// 6. Checkout & Order Processing Flow
app.get("/api/orders", (req, res) => {
  const db = getDb();
  res.json(db.orders);
});

app.get("/api/orders/:id", (req, res) => {
  const db = getDb();
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: "Order log files not found" });
  }
  res.json(order);
});

app.post("/api/orders", (req, res) => {
  const db = getDb();
  const fields = req.body;

  if (!fields.customerName || !fields.customerPhone || !fields.shippingAddress || !fields.districtId || !fields.items || fields.items.length === 0) {
    return res.status(400).json({ error: "Customer details, shipping district and cart items are mandatory." });
  }

  // Compute actual delivery cost
  const district = BANGLADESH_DISTRICTS.find(d => d.id === fields.districtId);
  const upazilas = getUpazilasForDistrict(fields.districtId);
  const upazila = upazilas.find(u => u.id === fields.upazilaId);

  const baseDeliveryCharge = district ? district.deliveryCharge : 120;
  const upazilaDeliveryChargeSum = upazila ? upazila.additionalCharge : 0;
  const deliveryCharge = baseDeliveryCharge + upazilaDeliveryChargeSum;

  const subtotal = fields.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
  const discount = Number(fields.discount || 0);
  const total = subtotal + deliveryCharge - discount;

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const orderSequence = Math.floor(100 + Math.random() * 900);
  const orderId = `ORD-${dateStr}-${orderSequence}`;

  // Decrement Inventory Stock safely & Check stock levels
  fields.items.forEach((item: any) => {
    const dbProduct = db.products.find(p => p.id === item.productId);
    if (dbProduct) {
      dbProduct.stock = Math.max(0, dbProduct.stock - item.quantity);
      if (item.variantId) {
        const v = dbProduct.variants.find(vItem => vItem.id === item.variantId);
        if (v) v.stock = Math.max(0, v.stock - item.quantity);
      }
    }
  });

  // Handle Incremental Coupon limit count validation
  if (fields.appliedCouponCode) {
    const appliedCop = db.coupons.find(c => c.code === fields.appliedCouponCode.toUpperCase());
    if (appliedCop) {
      appliedCop.usageCount++;
    }
  }

  // Handle Automated verified bKash check
  let paymentStatus: "Pending" | "Paid" | "Failed" = "Pending";
  if (["bKash", "Nagad", "Rocket"].includes(fields.paymentMethod) && fields.transactionId) {
    paymentStatus = "Paid"; // simulated instant verification success
  }

  const newOrder: Order = {
    id: orderId,
    customerName: fields.customerName,
    customerPhone: fields.customerPhone,
    customerEmail: fields.customerEmail,
    shippingAddress: fields.shippingAddress,
    districtId: fields.districtId,
    upazilaId: fields.upazilaId,
    deliveryInstructions: fields.deliveryInstructions,
    items: fields.items,
    subtotal,
    deliveryCharge,
    discount,
    tax: 0,
    total,
    paymentMethod: fields.paymentMethod,
    paymentStatus,
    transactionId: fields.transactionId,
    status: "Pending",
    createdAt: new Date().toISOString(),
    history: [
      { status: "Pending", note: "Order successfully submitted via Web checkout engine.", timestamp: new Date().toISOString() }
    ]
  };

  if (paymentStatus === "Paid") {
    newOrder.status = "Confirmed";
    newOrder.history.push({
      status: "Confirmed",
      note: `Payment cleared automatically via mobile banking gateway verify index. TXN ID: ${fields.transactionId}`,
      timestamp: new Date().toISOString()
    });

    // Populate transaction logs
    db.paymentLogs.unshift({
      id: "pay-" + Date.now().toString(36),
      orderId: newOrder.id,
      amount: newOrder.total,
      paymentMethod: fields.paymentMethod as any,
      transactionId: fields.transactionId,
      status: "Verified",
      timestamp: new Date().toISOString(),
      customerPhone: fields.customerPhone
    });
  }

  db.orders.unshift(newOrder);
  writeDb(db);
  addAuditLog("Order Created", `Billed Order ${orderId} total ৳${total} for ${fields.customerName}`);

  res.status(201).json(newOrder);
});

// Update order status/Courier values
app.post("/api/orders/:id/status", (req, res) => {
  const db = getDb();
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  const { status, note, courierName, trackingNumber } = req.body;
  if (!status) {
    return res.status(400).json({ error: "Status code is mandatory" });
  }

  order.status = status as OrderStatus;
  
  if (courierName) order.courierName = courierName;
  if (trackingNumber) order.trackingNumber = trackingNumber;

  order.history.push({
    status: status as OrderStatus,
    note: note || `Order status updated to ${status}. Courier: ${courierName || "Local Delivery"}`,
    timestamp: new Date().toISOString()
  });

  writeDb(db);
  addAuditLog("Order Status Override", `Brings Order: ${order.id} status to ${status}`);
  res.json(order);
});

// Order refund handling
app.post("/api/orders/:id/refund", (req, res) => {
  const db = getDb();
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  order.paymentStatus = "Refunded";
  order.status = "Refunded";
  order.history.push({
    status: "Refunded",
    note: req.body.note || "Refund processed completely to origin gateway node.",
    timestamp: new Date().toISOString()
  });

  writeDb(db);
  addAuditLog("Refund Processed", `Declined or returned financial payment with original charge on order: ${order.id}`);
  res.json(order);
});

// 7. Bangladeshi Mobile Payments Verification System API
app.post("/api/payments/verify", (req, res) => {
  const { transactionId, orderId, method, phone } = req.body;
  if (!transactionId || !method) {
    return res.status(400).json({ error: "Transaction ID and payment method required." });
  }

  const db = getDb();
  const order = db.orders.find(o => o.id === orderId);

  // Auto payment validation matching simulator
  const isValidTxn = transactionId.length >= 6; // simple rule for mock gate
  if (!isValidTxn) {
    return res.status(400).json({ error: "Verification Failed. Transaction ID pattern format invalid." });
  }

  // Register payment record
  const log: PaymentLog = {
    id: "pay-" + Math.random().toString(36).substring(3, 9).toUpperCase(),
    orderId: orderId || "DIRECT-VERIFY",
    amount: order ? order.total : 0,
    paymentMethod: method,
    transactionId: transactionId.toUpperCase(),
    status: "Verified",
    timestamp: new Date().toISOString(),
    customerPhone: phone || "01XXXXXXXXX"
  };

  db.paymentLogs.unshift(log);

  if (order) {
    order.paymentStatus = "Paid";
    order.transactionId = transactionId.toUpperCase();
    if (order.status === "Pending") {
      order.status = "Confirmed";
    }
    order.history.push({
      status: "Confirmed",
      note: `Payment verified from gateway dashboard manually. Method: ${method}, TXN: ${transactionId}`,
      timestamp: new Date().toISOString()
    });
  }

  writeDb(db);
  addAuditLog("Gateway Verification", `Successfully cleared phone payment log ${transactionId} via ${method}`);
  res.json({ success: true, log });
});

// fetch all billing payment records
app.get("/api/payments/logs", (req, res) => {
  const db = getDb();
  res.json(db.paymentLogs);
});

// 8. Analytics, Reports & Audit Logs
app.get("/api/reports/analytics", (req, res) => {
  const db = getDb();
  const orders = db.orders;

  const totalSales = orders.filter(o => o.paymentStatus === 'Paid' || o.status === 'Delivered' || o.status === 'Shipped').reduce((acc, o) => acc + o.total, 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const totalProducts = db.products.length;

  // Monthly revenue trend mock calculation
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const revenueTrend = months.map((m, index) => {
    let amt = index === 4 ? totalSales : (Math.floor(10 + Math.random() * 50) * 1000); // weight May
    return { name: m, amount: amt };
  });

  // Categories graph calculation
  const categorySalesMap: Record<string, number> = {};
  orders.forEach(o => {
    o.items.forEach(it => {
      const dbProduct = db.products.find(p => p.id === it.productId);
      const catId = dbProduct ? dbProduct.categoryId : "fashion";
      categorySalesMap[catId] = (categorySalesMap[catId] || 0) + (it.price * it.quantity);
    });
  });

  const categoryShare = Object.entries(categorySalesMap).map(([catId, sales]) => {
    const cat = db.categories.find(c => c.id === catId);
    return { name: cat ? cat.name.en : catId, value: sales };
  });

  res.json({
    totalSales,
    totalOrders,
    pendingOrders,
    totalProducts,
    revenueTrend,
    categoryShare,
    auditLogs: db.activityLogs.slice(0, 50)
  });
});

app.get("/api/reports/logs/activity", (req, res) => {
  const db = getDb();
  res.json(db.activityLogs);
});

// Blogs & FAQs Content
app.get("/api/blogs", (req, res) => {
  const db = getDb();
  res.json(db.blogs);
});

app.get("/api/faqs", (req, res) => {
  const db = getDb();
  res.json(db.faqs);
});

// Vite server implementation for dev, fallback to dist static for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve HTML
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
