// src/components/HomeView.tsx
import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { Product, Category, SiteConfig } from '../types';
import { Sparkles, ArrowRight, Star, ShoppingCart, Percent } from 'lucide-react';

interface HomeViewProps {
  products: Product[];
  categories: Category[];
  config: SiteConfig;
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product, quantity?: number, options?: { size?: string; color?: string }) => void;
  onNavigateToCatalog: (filters?: { categoryId?: string; flashSale?: boolean }) => void;
}

export default function HomeView({
  products,
  categories,
  config,
  onViewProduct,
  onAddToCart,
  onNavigateToCatalog,
}: HomeViewProps) {
  const { t, l } = useLanguage();
  const [activeSlide, setActiveSlide] = useState(0);

  const heroSliders = config.homepage?.heroSliders || [];
  const promoText = config.homepage?.promoText;

  // Auto-slide hero headers
  useEffect(() => {
    if (heroSliders.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSliders.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroSliders]);

  // Filters for display lists
  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 4);
  const flashSaleProducts = products.filter(p => p.isFlashSale).slice(0, 4);
  const newArrivals = products.filter(p => p.isNewArrival).slice(0, 4);
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 4);

  return (
    <div className="space-y-12">
      {/* Campaign Bar Banner if applicable */}
      {promoText && (
        <div className="bg-amber-500 text-amber-950 font-semibold px-4 py-2 text-center text-xs sm:text-sm shadow-inner flex items-center justify-center gap-2 animate-pulse rounded-lg">
          <Percent className="w-4 h-4" />
          <span>{t(promoText)}</span>
        </div>
      )}

      {/* Hero Sliders banner section */}
      {heroSliders.length > 0 && (
        <div className="relative h-[250px] sm:h-[450px] overflow-hidden rounded-2xl shadow-xl bg-slate-900 group">
          <div
            className="flex h-full transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${activeSlide * 100}%)` }}
          >
            {heroSliders.map((slide, idx) => (
              <div key={slide.id || idx} className="relative w-full h-full flex-shrink-0">
                <img
                  src={slide.imageUrl}
                  alt={t(slide.title)}
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 to-transparent flex flex-col justify-center p-6 sm:p-12 space-y-2 sm:space-y-4">
                  <span className="text-emerald-400 font-bold uppercase tracking-wider text-xs sm:text-sm">
                    {t(slide.subtitle)}
                  </span>
                  <h1 className="text-xl sm:text-4xl md:text-5xl font-black text-white max-w-xl leading-tight">
                    {t(slide.title)}
                  </h1>
                  <div>
                    <button
                      onClick={() => onNavigateToCatalog()}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg transition-all flex items-center gap-2 mt-2"
                    >
                      <span>{l('exploreAll')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dots Indicator */}
          {heroSliders.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {heroSliders.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === activeSlide ? 'bg-emerald-400 w-6' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Showcase Categories Banner Icons */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <h2 className="text-lg sm:text-2xl font-black text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            {l('allCategories')}
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onNavigateToCatalog({ categoryId: cat.id })}
              className="group cursor-pointer bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all text-center space-y-3"
            >
              <div className="w-16 h-16 mx-auto rounded-full overflow-hidden bg-slate-50 flex items-center justify-center group-hover:scale-105 transition-transform">
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=200'}
                  alt={t(cat.name)}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-bold text-slate-700 group-hover:text-emerald-600 transition-colors text-sm sm:text-base">
                {t(cat.name)}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* Flash Sale Banner section with limited stock and countdown */}
      {flashSaleProducts.length > 0 && (
        <section className="bg-rose-50 border border-rose-200/60 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-rose-600 font-bold uppercase tracking-widest text-xs">
                {l('flashSale')}
              </span>
              <h2 className="text-xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
                <span className="text-rose-500">⚡</span>
                {t({ en: "Midnight Flash Deals BDT ৳", bn: "মাঝরাত স্পেশাল ধামাকা অফার" })}
              </h2>
            </div>
            <button
              onClick={() => onNavigateToCatalog({ flashSale: true })}
              className="text-rose-600 hover:text-rose-700 font-bold text-sm flex items-center gap-1 group"
            >
              <span>{l('exploreAll')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {flashSaleProducts.map((p) => {
              const discountedPrice = p.price * (1 - (p.flashSaleDiscount || 0) / 100);
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all border border-rose-100 flex flex-col justify-between"
                >
                  <div className="relative group cursor-pointer" onClick={() => onViewProduct(p)}>
                    <img
                      src={p.images[0]}
                      alt={t(p.name)}
                      className="w-full h-40 object-cover rounded-xl mb-3"
                    />
                    <span className="absolute top-2 left-2 bg-rose-600 text-white font-black text-xs px-2 py-1 rounded-md">
                      -{p.flashSaleDiscount}%
                    </span>
                  </div>
                  <div>
                    <h3
                      onClick={() => onViewProduct(p)}
                      className="font-bold text-slate-800 text-sm hover:text-emerald-600 cursor-pointer line-clamp-1"
                    >
                      {t(p.name)}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-rose-600 font-extrabold text-base">৳ {discountedPrice.toLocaleString()}</span>
                      <span className="text-slate-400 line-through text-xs">৳ {p.price.toLocaleString()}</span>
                    </div>
                    {/* Stock status indicator line */}
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                        <span>{p.stock} Hanger Left</span>
                        <span>Full Capacity</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-500"
                          style={{ width: `${Math.min(100, (p.stock / 15) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onAddToCart(p, 1)}
                    className="mt-4 bg-slate-900 text-white hover:bg-emerald-600 font-extrabold text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <ShoppingCart className="w-4.5 h-4.5" />
                    <span>{l('addToCart')}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Featured Products Layout */}
      {featuredProducts.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h2 className="text-lg sm:text-2xl font-black text-slate-800 flex items-center gap-2">
              <Star className="w-5 h-5 text-emerald-500 fill-emerald-500" />
              {l('bestSellers')}
            </h2>
            <button
              onClick={() => onNavigateToCatalog()}
              className="text-emerald-600 hover:text-emerald-700 font-bold text-sm flex items-center gap-1 group"
            >
              <span>{l('exploreAll')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((p) => {
              const hasDiscount = p.isFlashSale && p.flashSaleDiscount;
              const finalPrice = hasDiscount ? p.price * (1 - p.flashSaleDiscount! / 100) : p.price;
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div className="relative group cursor-pointer" onClick={() => onViewProduct(p)}>
                    <img
                      src={p.images[0]}
                      alt={t(p.name)}
                      className="w-full h-44 object-cover rounded-xl mb-3"
                    />
                    {hasDiscount && (
                      <span className="absolute top-2 left-2 bg-rose-600 text-white font-black text-[10px] px-2 py-1 rounded">
                        -{p.flashSaleDiscount}%
                      </span>
                    )}
                  </div>
                  <div>
                    <h3
                      onClick={() => onViewProduct(p)}
                      className="font-bold text-slate-800 text-sm hover:text-emerald-600 cursor-pointer line-clamp-1"
                    >
                      {t(p.name)}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-slate-900 font-extrabold">৳ {finalPrice.toLocaleString()}</span>
                      {hasDiscount ? (
                        <span className="text-slate-400 line-through text-xs">৳ {p.price.toLocaleString()}</span>
                      ) : (
                        p.compareAtPrice && p.compareAtPrice > p.price && (
                          <span className="text-slate-400 line-through text-xs">৳ {p.compareAtPrice.toLocaleString()}</span>
                        )
                      )}
                    </div>
                    {/* Rating display */}
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-amber-500 text-sm">★</span>
                      <span className="text-xs text-slate-600 font-semibold">{p.rating}</span>
                      <span className="text-[10px] text-slate-400">({p.reviews?.length || 0})</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onAddToCart(p, 1)}
                    className="mt-4 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-extrabold text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-2 shadow-inner"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>{l('addToCart')}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Two Promotional Static Banners Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative overflow-hidden rounded-2xl h-[180px] sm:h-[220px] shadow bg-emerald-950 text-white p-6 sm:p-8 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-emerald-300 font-extrabold tracking-wider text-xs uppercase">Walton Home Appliance Partner</span>
            <h3 className="text-lg sm:text-2xl font-black max-w-sm">Smart Electronic Gadgets in Local Pricing!</h3>
          </div>
          <div>
            <button
              onClick={() => onNavigateToCatalog({ categoryId: 'electronics' })}
              className="bg-white hover:bg-slate-100 text-emerald-950 font-bold text-xs px-4 py-2 rounded-full shadow"
            >
              Order Online BDT
            </button>
          </div>
          <div className="absolute right-0 bottom-0 top-0 opacity-20 w-1/3">
            <img src="https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=200" alt="" className="object-cover w-full h-full" />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl h-[180px] sm:h-[220px] shadow bg-indigo-950 text-white p-6 sm:p-8 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-indigo-300 font-extrabold tracking-wider text-xs uppercase">Sundarban Honey & Organics</span>
            <h3 className="text-lg sm:text-2xl font-black max-w-sm">100% Laboratory Sourced Genuine Forest Foods</h3>
          </div>
          <div>
            <button
              onClick={() => onNavigateToCatalog({ categoryId: 'groceries' })}
              className="bg-white hover:bg-slate-150 text-indigo-950 font-bold text-xs px-4 py-2 rounded-full shadow"
            >
              Verify Purity Lab
            </button>
          </div>
          <div className="absolute right-0 bottom-0 top-0 opacity-20 w-1/3">
            <img src="https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=200" alt="" className="object-cover w-full h-full" />
          </div>
        </div>
      </section>

      {/* New Arrivals Panel section */}
      {newArrivals.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h2 className="text-lg sm:text-2xl font-black text-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              {l('newArrivals')}
            </h2>
            <button
              onClick={() => onNavigateToCatalog()}
              className="text-emerald-600 hover:text-emerald-700 font-bold text-sm flex items-center gap-1 group"
            >
              <span>{l('exploreAll')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((p) => {
              const price = p.isFlashSale && p.flashSaleDiscount ? p.price * (1 - p.flashSaleDiscount! / 100) : p.price;
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div className="relative group cursor-pointer" onClick={() => onViewProduct(p)}>
                    <img
                      src={p.images[0]}
                      alt={t(p.name)}
                      className="w-full h-44 object-cover rounded-xl mb-3"
                    />
                    <span className="absolute top-2 left-2 bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-1 rounded">
                      NEW
                    </span>
                  </div>
                  <div>
                    <h3
                      onClick={() => onViewProduct(p)}
                      className="font-bold text-slate-800 text-sm hover:text-emerald-600 cursor-pointer line-clamp-1"
                    >
                      {t(p.name)}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{p.brand}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-slate-900 font-extrabold">৳ {price.toLocaleString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onAddToCart(p, 1)}
                    className="mt-4 bg-slate-900 text-white hover:bg-emerald-600 font-extrabold text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-2 shadow"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>{l('addToCart')}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Customer Testimonial Panel */}
      <section className="bg-slate-100/50 border border-slate-200/50 rounded-3xl p-6 sm:p-10 space-y-6">
        <h3 className="text-center font-black text-slate-800 text-lg sm:text-2xl">
          {l('testimonialTitle')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-3">
            <div className="flex gap-1 text-amber-400">★★★★★</div>
            <p className="text-slate-600 text-xs sm:text-sm italic">
              "Buying Walton and Miyako from Brainchild BD AI Shop was a breeze. Delivered safely in Tangail in 2 days. Best BDT customer support!"
            </p>
            <div className="font-bold text-slate-800 text-xs sm:text-sm">— Kazi Mukbul, Tangail</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-3">
            <div className="flex gap-1 text-amber-400">★★★★★</div>
            <p className="text-slate-600 text-xs sm:text-sm italic">
              "The Dhakai Jamdani is 100% authentic handloom. Checked thread count. High standard and visually magnificent packaging. Thanks to Brainchild BD AI Shop!"
            </p>
            <div className="font-bold text-slate-800 text-xs sm:text-sm">— Riffat Ara, Dhanmondi</div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-3">
            <div className="flex gap-1 text-amber-400">★★★★★</div>
            <p className="text-slate-600 text-xs sm:text-sm italic">
              "bKash auto automatic payments cleared. Zero transaction confirmation delays. Best full stack eCommerce platform in Bangladesh."
            </p>
            <div className="font-bold text-slate-800 text-xs sm:text-sm">— Shafiul Alom, Sylhet</div>
          </div>
        </div>
      </section>

      {/* Newsletter signup section with simple alert */}
      <section className="relative overflow-hidden rounded-3xl bg-emerald-900 text-white p-6 sm:p-12 text-center space-y-4">
        <div className="max-w-xl mx-auto space-y-2">
          <h3 className="text-xl sm:text-3xl font-black">{l('newsletterTitle')}</h3>
          <p className="text-slate-200 text-xs sm:text-sm">{l('newsletterSub')}</p>
        </div>
        <div className="max-w-md mx-auto flex gap-2">
          <input
            type="email"
            placeholder="name@email.com.bd"
            className="flex-1 bg-white/15 border border-white/20 text-white placeholder-white/60 text-xs sm:text-sm rounded-xl px-4 py-2 sm:py-3 focus:outline-none focus:border-emerald-400"
          />
          <button
            onClick={() => alert("Successfully joined newsletter! Coupon code HELLO100 sent to your email inbox.")}
            className="bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-colors shadow"
          >
            {l('subscribe')}
          </button>
        </div>
      </section>
    </div>
  );
}
