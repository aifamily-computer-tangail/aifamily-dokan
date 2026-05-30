// src/App.tsx
import React, { useState, useEffect } from 'react';
import { useLanguage } from './components/LanguageContext';
import { Product, Category, SiteConfig, Coupon, Order } from './types';
import HomeView from './components/HomeView';
import CatalogView from './components/CatalogView';
import CartCheckoutView from './components/CartCheckoutView';
import CustomerPortal from './components/CustomerPortal';
import BlogFAQView from './components/BlogFAQView';
import AdminView from './components/AdminView';
import { 
  ShoppingBag, Search, HelpCircle, Truck, Layers, 
  Settings, Menu, X, Star, Sparkles, Heart
} from 'lucide-react';
import dbFallback from '../db.json';

export default function App() {
  const { t, l, setLanguage, language } = useLanguage();

  // Core navigation state
  const [activeView, setActiveView] = useState<'home' | 'catalog' | 'cart-checkout' | 'track' | 'stories' | 'admin'>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Selected parameters passed down to specific views
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState<string | undefined>(undefined);
  const [selectedCatalogFlashSale, setSelectedCatalogFlashSale] = useState<boolean | undefined>(undefined);
  const [trackingOrderId, setTrackingOrderId] = useState<string | undefined>(undefined);

  // Cart state stored locally
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>(() => {
    try {
      const saved = localStorage.getItem('amardukaan_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist state stored locally
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('amardukaan_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Server state pool
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [config, setConfig] = useState<SiteConfig>({
    logoText: 'Brainchild BD AI Shop',
    themeColor: '#10B981',
    homepage: {
      heroSliders: [],
      promoText: { en: "EID festival Super Dhamaka Offer! Save flat 10% on your entire basket using code GIFT100 BDT ৳", bn: "ঈদ উৎসবের সুপার ধামাকা অফার! GIFT100 কোড ব্যবহার করে সারা বাস্কেটে পেয়ে যান ১০% ফ্ল্যাট ছাড় BDT ৳" }
    }
  });

  // Details Modal product state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [detailQty, setDetailQty] = useState(1);
  const [detailTab, setDetailTab] = useState<'spec' | 'reviews'>('spec');

  // Fetch initial master lists from Express backend
  const fetchMasterData = async () => {
    const fetchOrFallback = async <T,>(url: string, fallback: T): Promise<T> => {
      try {
        const res = await fetch(url);
        if (!res.ok) return fallback;
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) return fallback;
        return await res.json() as T;
      } catch (err) {
        console.warn(`Fetch to ${url} failed, using local fallback assets`, err);
        return fallback;
      }
    };

    try {
      const productsData = await fetchOrFallback<Product[]>('/api/products', dbFallback.products as Product[]);
      const categoriesData = await fetchOrFallback<Category[]>('/api/categories', dbFallback.categories as Category[]);
      const configData = await fetchOrFallback<SiteConfig>('/api/config', dbFallback.config as SiteConfig);
      const ordersData = await fetchOrFallback<Order[]>('/api/orders', dbFallback.orders as Order[]);
      const couponsData = await fetchOrFallback<Coupon[]>('/api/coupons', dbFallback.coupons as Coupon[]);

      setProducts(productsData);
      setCategories(categoriesData);
      setConfig(configData);
      setOrders(ordersData);
      setCoupons(couponsData);
    } catch (e) {
      console.error("Master catalog fetch error:", e);
      // Absolute raw boundary safety fallback
      setProducts(dbFallback.products as Product[]);
      setCategories(dbFallback.categories as Category[]);
      setConfig(dbFallback.config as SiteConfig);
      setOrders(dbFallback.orders as Order[]);
      setCoupons(dbFallback.coupons as Coupon[]);
    }
  };

  useEffect(() => {
    fetchMasterData();
  }, []);

  // Save cart back to localState when update triggers
  useEffect(() => {
    localStorage.setItem('amardukaan_cart', JSON.stringify(cart));
  }, [cart]);

  // Save wishlist state
  useEffect(() => {
    localStorage.setItem('amardukaan_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Handler functions
  const handleAddToCart = (product: Product, quantity = 1, options?: { size?: string; color?: string }) => {
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.product.id === product.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          quantity: Math.min(product.stock, next[idx].quantity + quantity)
        };
        return next;
      }
      return [...prev, { product, quantity }];
    });

    // Elegant alert
    alert(`${t(product.name)} successfully added to your shopping cart! 🛒`);
  };

  const handleUpdateCartQty = (productId: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const isSaved = prev.includes(productId);
      if (isSaved) {
        alert("Removed from wishlist.");
        return prev.filter((id) => id !== productId);
      } else {
        alert("Added to wishlist! ❤️");
        return [...prev, productId];
      }
    });
  };

  // Navigators helpers
  const handleNavigateToCatalog = (filters?: { categoryId?: string; flashSale?: boolean }) => {
    setSelectedCatalogCategory(filters?.categoryId);
    setSelectedCatalogFlashSale(filters?.flashSale);
    setActiveView('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (orderId: string) => {
    setTrackingOrderId(orderId);
    setActiveView('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDetailsBuyNow = (product: Product) => {
    handleAddToCart(product, detailQty, { size: selectedSize, color: selectedColor });
    setSelectedProduct(null);
    setActiveView('cart-checkout');
  };

  const activeCategoryObject = categories.find((c) => c.id === selectedCatalogCategory);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans transition-all duration-300">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          
          {/* Brand Logo and Text config */}
          <div 
            onClick={() => {
              setActiveView('home');
              setMobileMenuOpen(false);
            }} 
            className="flex items-center gap-2 cursor-pointer group"
          >
            <span className="text-xl sm:text-2xl bg-emerald-500 text-slate-950 font-black p-2 rounded-xl shadow-lg shadow-emerald-500/10">
              🛒
            </span>
            <span className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight group-hover:text-emerald-600 transition-colors">
              {config.logoText || 'Brainchild BD AI Shop'}
            </span>
          </div>

          {/* Desktop Nav Selection Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs sm:text-sm font-bold text-slate-600">
            <button 
              onClick={() => handleNavigateToCatalog()} 
              className={`hover:text-emerald-600 transition-colors flex items-center gap-1.5 ${activeView === 'catalog' ? 'text-emerald-600 font-black' : ''}`}
            >
              <Layers className="w-4 h-4" />
              <span>{l('catalog')}</span>
            </button>
            <button 
              onClick={() => {
                setActiveView('track');
                setTrackingOrderId(undefined);
              }} 
              className={`hover:text-emerald-600 transition-colors flex items-center gap-1.5 ${activeView === 'track' ? 'text-emerald-600 font-black' : ''}`}
            >
              <Truck className="w-4 h-4" />
              <span>{l('trackOrder')}</span>
            </button>
            <button 
              onClick={() => setActiveView('stories')} 
              className={`hover:text-emerald-600 transition-colors flex items-center gap-1.5 ${activeView === 'stories' ? 'text-emerald-600 font-black' : ''}`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>{t({ en: "Traditional Heritage", bn: "আমাদের গল্প ও ঐতিহ্য" })}</span>
            </button>
            <button 
              onClick={() => setActiveView('admin')} 
              className={`hover:text-emerald-600 transition-colors flex items-center gap-1.5 ${activeView === 'admin' ? 'text-emerald-600 font-black' : ''}`}
            >
              <Settings className="w-4 h-4" />
              <span>{l('adminDashboard')}</span>
            </button>
          </nav>

          {/* Language toggle + Cart Button */}
          <div className="flex items-center gap-3">
            {/* Wishlist Indicators */}
            <button 
              onClick={() => handleNavigateToCatalog()}
              className="p-2 sm:p-2.5 rounded-full hover:bg-slate-100 text-slate-600 transition-all relative"
            >
              <Heart className="w-5 h-5 flex-shrink-0" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white font-extrabold text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Language Switch */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs px-3 py-2 rounded-xl transition-all"
            >
              {language === 'en' ? 'বাংলা' : 'English'}
            </button>

            {/* Cart Icon Drawer toggle */}
            <button
              onClick={() => setActiveView('cart-checkout')}
              className="bg-slate-900 group hover:bg-emerald-500 text-white hover:text-slate-950 font-black text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 relative"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">৳ {cart.reduce((acc, c) => acc + (c.product.price * c.quantity), 0).toLocaleString()}</span>
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-400 group-hover:bg-slate-900 text-slate-950 group-hover:text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {cart.length}
                </span>
              )}
            </button>

            {/* Mobile Expand Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown view */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100 px-4 py-3 divide-y divide-slate-50 text-xs sm:text-sm font-bold text-slate-600 animate-slide-down">
            <button 
              onClick={() => {
                handleNavigateToCatalog();
                setMobileMenuOpen(false);
              }} 
              className="w-full text-left py-2.5 hover:text-emerald-600 flex items-center gap-2"
            >
              <Layers className="w-4 h-4 text-slate-400" />
              <span>{l('catalog')}</span>
            </button>
            <button 
              onClick={() => {
                setActiveView('track');
                setTrackingOrderId(undefined);
                setMobileMenuOpen(false);
              }} 
              className="w-full text-left py-2.5 hover:text-emerald-600 flex items-center gap-2"
            >
              <Truck className="w-4 h-4 text-slate-400" />
              <span>{l('trackOrder')}</span>
            </button>
            <button 
              onClick={() => {
                setActiveView('stories');
                setMobileMenuOpen(false);
              }} 
              className="w-full text-left py-2.5 hover:text-emerald-600 flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Stories & Heritage</span>
            </button>
            <button 
              onClick={() => {
                setActiveView('admin');
                setMobileMenuOpen(false);
              }} 
              className="w-full text-left py-2.5 hover:text-emerald-600 flex items-center gap-2"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>{l('adminDashboard')}</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Core View Area render routing panels */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeView === 'home' && (
          <HomeView
            products={products}
            categories={categories}
            config={config}
            onViewProduct={(p) => {
              setSelectedProduct(p);
              setSelectedSize(p.variations?.sizes?.[0] || 'M');
              setSelectedColor(p.variations?.colors?.[0] || 'Navy');
              setDetailQty(1);
            }}
            onAddToCart={handleAddToCart}
            onNavigateToCatalog={handleNavigateToCatalog}
          />
        )}

        {activeView === 'catalog' && (
          <CatalogView
            products={products}
            categories={categories}
            initialCategory={selectedCatalogCategory}
            initialFlashSale={selectedCatalogFlashSale}
            onViewProduct={(p) => {
              setSelectedProduct(p);
              setSelectedSize(p.variations?.sizes?.[0] || 'M');
              setSelectedColor(p.variations?.colors?.[0] || 'Navy');
              setDetailQty(1);
            }}
            onAddToCart={handleAddToCart}
          />
        )}

        {activeView === 'cart-checkout' && (
          <CartCheckoutView
            cartItems={cart}
            onUpdateCartQty={handleUpdateCartQty}
            onRemoveCartItem={handleRemoveCartItem}
            onClearCart={() => setCart([])}
            onNavigateHome={() => handleNavigateToCatalog()}
            onOrderSuccess={handleOrderSuccess}
          />
        )}

        {activeView === 'track' && (
          <CustomerPortal initialOrderId={trackingOrderId} />
        )}

        {activeView === 'stories' && (
          <BlogFAQView />
        )}

        {activeView === 'admin' && (
          <AdminView
            products={products}
            categories={categories}
            orders={orders}
            coupons={coupons}
            config={config}
            onRefreshAll={fetchMasterData}
          />
        )}
      </main>

      {/* Elegant Footer Details markup */}
      <footer className="bg-slate-900 text-slate-400 py-12 pt-16 border-t border-slate-800 print:hidden mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs sm:text-sm leading-relaxed">
          <div className="space-y-4">
            <h4 className="text-white font-black text-base">{config.logoText || 'Brainchild BD AI Shop'}</h4>
            <p className="max-w-xs">
              Bangladesh leading authentic multi-category ecommerce partner supplying traditional loom crafts, genuine forest honey, and state electronics in local BDT pricing.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-black text-sm uppercase tracking-wider">{l('allCategories')}</h4>
            <div className="flex flex-col gap-2">
              {categories.slice(0, 4).map((c) => (
                <button 
                  key={c.id} 
                  onClick={() => handleNavigateToCatalog({ categoryId: c.id })}
                  className="text-left hover:text-emerald-400 transition-colors font-semibold"
                >
                  {t(c.name)}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-black text-sm uppercase tracking-wider">Shopping Services</h4>
            <div className="flex flex-col gap-2">
              <button onClick={() => setActiveView('track')} className="text-left hover:text-emerald-400 transition-colors font-semibold">
                Instant delivery Tracking
              </button>
              <button onClick={() => setActiveView('stories')} className="text-left hover:text-emerald-400 transition-colors font-semibold">
                Customer FAQs & Support
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-black text-sm uppercase tracking-wider">Contact Gateway Desks</h4>
            <p>
              📍 Level 8, Concord Tower, Kazi Nazrul Islam Avenue, Dhaka-1215<br />
              📞 Hotline: +880 9612-445566 (Auto-Routing)<br />
              ✉️ support@brainchildbd.ai
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 border-t border-slate-800/80 pt-6 mt-12 text-center text-[11px] font-bold">
          <p>© {new Date().getFullYear()} {config.logoText || 'Brainchild BD AI Shop'} Platform. Multi-category Storefront. Steadfast Logistics Partner.</p>
        </div>
      </footer>

      {/* PRODUCT DETAILS DETAIL VIEW QUICK-MODAL (Fully animated & visually responsive) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl relative animate-fade-in text-xs sm:text-sm">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold w-8 h-8 rounded-full flex items-center justify-center transition-colors z-10"
            >
              ✕
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8">
              {/* Product Visual zoom component */}
              <div className="space-y-3">
                <div className="h-[250px] sm:h-[350px] rounded-2xl overflow-hidden border">
                  <img
                    src={selectedProduct.images[0]}
                    alt={t(selectedProduct.name)}
                    className="w-full h-full object-cover select-none"
                  />
                </div>
                {/* Visual badge tags */}
                <div className="flex gap-2">
                  {selectedProduct.isFlashSale && (
                    <span className="bg-rose-50 text-rose-600 font-black text-[10px] px-2.5 py-1 border border-rose-200 rounded-md">
                      ⚡ FLASH SALE
                    </span>
                  )}
                  {selectedProduct.stock > 0 ? (
                    <span className="bg-emerald-50 text-emerald-600 font-black text-[10px] px-2.5 py-1 border border-emerald-200 rounded-md">
                      ✓ IN STOCK ({selectedProduct.stock})
                    </span>
                  ) : (
                    <span className="bg-rose-50 text-rose-600 font-black text-[10px] px-2.5 py-1 border border-rose-200 rounded-md">
                      ✗ OUT OF STOCK
                    </span>
                  )}
                </div>
              </div>

              {/* Informational details description panel */}
              <div className="space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-emerald-600 font-black uppercase text-[10px] tracking-widest">
                    {selectedProduct.brand}
                  </span>
                  <h3 className="text-lg sm:text-2xl font-black text-slate-800 leading-tight">
                    {t(selectedProduct.name)}
                  </h3>
                  
                  {/* Rating block */}
                  <div className="flex items-center gap-1">
                    <span className="text-amber-400">★</span>
                    <span className="font-extrabold text-slate-700">{selectedProduct.rating}</span>
                    <span className="text-slate-400 font-semibold text-xs">({selectedProduct.ratingCount} Customer verifications)</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-slate-900 font-black text-base sm:text-xl">
                      ৳ {(selectedProduct.isFlashSale && selectedProduct.flashSaleDiscount
                        ? selectedProduct.price * (1 - selectedProduct.flashSaleDiscount / 100)
                        : selectedProduct.price).toLocaleString()}
                    </span>
                    {selectedProduct.isFlashSale && (
                      <span className="text-slate-400 line-through text-xs sm:text-sm">
                        ৳ {selectedProduct.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Sub Tab toggle options list properties */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex gap-2 border-b border-slate-100 pb-2">
                    <button
                      onClick={() => setDetailTab('spec')}
                      className={`font-black text-xs pb-1 transition-all ${
                        detailTab === 'spec' ? 'text-slate-800 border-b-2 border-emerald-500' : 'text-slate-400'
                      }`}
                    >
                      Specifications
                    </button>
                    <button
                      onClick={() => setDetailTab('reviews')}
                      className={`font-black text-xs pb-1 transition-all ${
                        detailTab === 'reviews' ? 'text-slate-800 border-b-2 border-emerald-500' : 'text-slate-400'
                      }`}
                    >
                      Consumer Reviews
                    </button>
                  </div>

                  {detailTab === 'spec' && (
                    <div className="space-y-1.5 text-xs text-slate-600 pt-1 font-semibold">
                      <p>{t(selectedProduct.description)}</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-[11px] bg-slate-50 p-2.5 rounded-lg border">
                        <div><span className="text-slate-400">Brand:</span> {selectedProduct.brand}</div>
                        <div><span className="text-slate-400">SKU:</span> {selectedProduct.sku}</div>
                        <div><span className="text-slate-400">Warranty:</span> 1 Year General</div>
                        <div><span className="text-slate-400">Care:</span> Handloom dry clean</div>
                      </div>
                    </div>
                  )}

                  {detailTab === 'reviews' && (
                    <div className="space-y-2 pt-1 max-h-[120px] overflow-y-auto pr-1">
                      {selectedProduct.reviews?.map((rev, index) => (
                        <div key={rev.id || index} className="p-2 bg-slate-55 rounded-lg border border-slate-100 text-[11px] leading-relaxed">
                          <div className="flex justify-between font-bold text-slate-700">
                            <span>{rev.user} — {rev.rating}★</span>
                            <span className="text-[10px] text-slate-400">{rev.date}</span>
                          </div>
                          <p className="text-slate-500 font-medium">{rev.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Variations Selectors details UI fields if appropriate */}
                {selectedProduct.variations?.sizes?.length && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Select Size</label>
                    <div className="flex gap-2">
                      {selectedProduct.variations.sizes.map((sz) => (
                        <button
                          key={sz}
                          onClick={() => setSelectedSize(sz)}
                          className={`px-3 py-1 text-xs border rounded-lg transition-all font-bold ${
                            selectedSize === sz
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                              : 'border-slate-250 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Buy buttons row controls */}
                <div className="flex items-center gap-3 pt-3 border-t border-slate-100 mt-2">
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                    <button
                      onClick={() => setDetailQty(Math.max(1, detailQty - 1))}
                      className="px-3 py-1.5 font-bold text-slate-500 hover:bg-slate-100 text-xs sm:text-sm"
                    >
                      -
                    </button>
                    <span className="px-2 font-black text-slate-800 text-xs sm:text-sm">{detailQty}</span>
                    <button
                      onClick={() => setDetailQty(Math.min(selectedProduct.stock, detailQty + 1))}
                      className="px-3 py-1.5 font-bold text-slate-500 hover:bg-slate-100 text-xs sm:text-sm"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      handleAddToCart(selectedProduct, detailQty, { size: selectedSize, color: selectedColor });
                      setSelectedProduct(null);
                    }}
                    className="flex-1 bg-slate-900 border border-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm py-2.5 rounded-xl transition-all"
                  >
                    Add Bag
                  </button>
                  <button
                    onClick={() => handleDetailsBuyNow(selectedProduct)}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm py-2.5 rounded-xl transition-all shadow-sm"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
