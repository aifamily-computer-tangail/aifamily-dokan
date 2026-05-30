// src/components/CatalogView.tsx
import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { Product, Category } from '../types';
import { Filter, Star, Search, RefreshCw, ShoppingCart, Eye } from 'lucide-react';

interface CatalogViewProps {
  products: Product[];
  categories: Category[];
  initialCategory?: string;
  initialFlashSale?: boolean;
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product, quantity?: number) => void;
}

export default function CatalogView({
  products,
  categories,
  initialCategory,
  initialFlashSale,
  onViewProduct,
  onAddToCart,
}: CatalogViewProps) {
  const { t, l } = useLanguage();

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || '');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [priceMax, setPriceMax] = useState(25000); // initial default max limit for slider range
  const [minRating, setMinRating] = useState(0);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [flashSaleOnly, setFlashSaleOnly] = useState(initialFlashSale || false);

  // Sync initial parameters on trigger from home dashboard selection
  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    if (initialFlashSale) {
      setFlashSaleOnly(initialFlashSale);
    }
  }, [initialFlashSale]);

  const uniqueBrands = Array.from(new Set(products.map((p) => p.brand)));

  // Filter application pipeline
  const filteredProducts = products.filter((p) => {
    // Search matching Title, description, SKU or Brand
    if (search) {
      const q = search.toLowerCase();
      const matchName = t(p.name).toLowerCase().includes(q);
      const matchBrand = p.brand.toLowerCase().includes(q);
      const matchSku = p.sku.toLowerCase().includes(q);
      if (!matchName && !matchBrand && !matchSku) return false;
    }

    // Category restriction
    if (selectedCategory && p.categoryId !== selectedCategory) return false;

    // Subcategory restriction if set
    if (selectedSubCategory && p.subCategoryId !== selectedSubCategory) return false;

    // Price Max Slider Match
    const effectivePrice = p.isFlashSale && p.flashSaleDiscount ? p.price * (1 - p.flashSaleDiscount / 100) : p.price;
    if (effectivePrice > priceMax) return false;

    // Minimum Rating
    if (minRating > 0 && p.rating < minRating) return false;

    // Brand matching
    if (selectedBrand && p.brand !== selectedBrand) return false;

    // Stock level logic
    if (inStockOnly && p.stock <= 0) return false;

    // Flash Sale constraint
    if (flashSaleOnly && !p.isFlashSale) return false;

    return true;
  });

  // Sort application pipeline
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.isFlashSale && a.flashSaleDiscount ? a.price * (1 - a.flashSaleDiscount / 100) : a.price;
    const priceB = b.isFlashSale && b.flashSaleDiscount ? b.price * (1 - b.flashSaleDiscount / 100) : b.price;

    if (sortBy === 'price-asc') return priceA - priceB;
    if (sortBy === 'price-desc') return priceB - priceA;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0; // default (order of addition or seed list index)
  });

  const resetAllFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedSubCategory('');
    setPriceMax(25000);
    setMinRating(0);
    setSelectedBrand('');
    setInStockOnly(false);
    setSortBy('default');
    setFlashSaleOnly(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Search Sidebar filter segment */}
      <aside className="lg:col-span-1 bg-white border border-slate-200 p-6 rounded-2xl h-fit space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="font-black text-slate-800 text-lg flex items-center gap-2">
            <Filter className="w-5 h-5 text-emerald-500" />
            {l('filterHeading')}
          </h2>
          <button
            onClick={resetAllFilters}
            className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{l('clearFilters')}</span>
          </button>
        </div>

        {/* Input Text query search */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Search</label>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={l('searchPlaceholder')}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* Category filtering display lists */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{l('allCategories')}</label>
          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => setSelectedCategory('')}
              className={`text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                selectedCategory === ''
                  ? 'bg-emerald-50 text-emerald-700 font-extrabold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              🌌 {t({ en: "All Categories", bn: "সকল ক্যাটাগরি" })}
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCategory(c.id);
                  setSelectedSubCategory('');
                }}
                className={`text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-between ${
                  selectedCategory === c.id
                    ? 'bg-emerald-50 text-emerald-700 font-extrabold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{t(c.name)}</span>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-bold">
                  {products.filter((p) => p.categoryId === c.id).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Price Maximum range slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{l('priceRange')}</label>
            <span className="text-xs font-extrabold text-emerald-600">৳ {priceMax.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min="100"
            max="30000"
            step="500"
            value={priceMax}
            onChange={(e) => setPriceMax(Number(e.target.value))}
            className="w-full accent-emerald-500 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
            <span>৳ 100</span>
            <span>৳ 30,000+</span>
          </div>
        </div>

        {/* Minimum rating selectors */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{l('ratingLabel')}</label>
          <div className="flex gap-1.5">
            {[4, 3, 2, 0].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setMinRating(star)}
                className={`flex-1 py-1 rounded-lg border text-center transition-all ${
                  minRating === star
                    ? 'border-amber-400 bg-amber-50 text-amber-700 font-bold'
                    : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {star === 0 ? 'All' : `${star}★+`}
              </button>
            ))}
          </div>
        </div>

        {/* Brands selectors dropdown */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{l('brand')}</label>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="">{t({ en: "All Brands", bn: "সকল ব্র্যান্ডস" })}</option>
            {uniqueBrands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Campaign Filters (checkboxes) */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={flashSaleOnly}
              onChange={(e) => setFlashSaleOnly(e.target.checked)}
              className="w-4.5 h-4.5 rounded text-rose-500 focus:ring-rose-500 border-slate-300 accent-rose-500"
            />
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">⚡ {l('flashSale')} Only</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-4.5 h-4.5 rounded text-emerald-500 focus:ring-emerald-500 border-slate-300 accent-emerald-500"
            />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{l('inStockOnly')}</span>
          </label>
        </div>
      </aside>

      {/* Main product catalogue view area */}
      <main className="lg:col-span-3 space-y-6">
        {/* catalog header / sorting selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 border border-slate-150 p-4 rounded-2xl">
          <p className="text-xs font-extrabold text-slate-600">
            {t({
              en: `Showing ${sortedProducts.length} Premium items that fit constraints`,
              bn: `${sortedProducts.length}-টি প্রিমিয়াম পণ্য পাওয়ায় গিয়েছে`
            })}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-slate-500 flex-shrink-0">{l('sortingLabel')}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="default">{l('sortDefault')}</option>
              <option value="price-asc">৳ {l('sortPriceAsc')}</option>
              <option value="price-desc">৳ {l('sortPriceDesc')}</option>
              <option value="rating">{l('sortRating')}</option>
            </select>
          </div>
        </div>

        {sortedProducts.length === 0 ? (
          <div className="text-center py-24 bg-white border border-slate-100 rounded-3xl space-y-4">
            <span className="text-5xl">🔭</span>
            <h3 className="font-black text-slate-700 text-lg sm:text-xl">
              {t({ en: "No matching products found", bn: "দুঃখিত, কোনো পণ্যে খুঁজে পাওয়া যায়নি" })}
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm max-w-sm mx-auto">
              {t({
                en: "Please adjust your rating slider, clear sorting tags or search query filters to browse more products.",
                bn: "অনুগ্রহ করে আপনার খোঁজা ফিল্টার পরিবর্তন করুন এবং পুনরায় চেষ্টা করুন।"
              })}
            </p>
            <button
              onClick={resetAllFilters}
              className="bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-fade-in">
            {sortedProducts.map((p) => {
              const hasDiscount = p.isFlashSale && p.flashSaleDiscount;
              const finalPrice = hasDiscount ? p.price * (1 - p.flashSaleDiscount! / 100) : p.price;
              const isOutOfStock = p.stock <= 0;

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-slate-150 hover:shadow-lg hover:border-emerald-200 transition-all flex flex-col justify-between group relative"
                >
                  <div className="relative overflow-hidden rounded-xl mb-3 cursor-pointer" onClick={() => onViewProduct(p)}>
                    <img
                      src={p.images[0]}
                      alt={t(p.name)}
                      className="w-full h-44 object-cover transform group-hover:scale-102 transition-transform duration-500"
                    />
                    {hasDiscount && (
                      <span className="absolute top-2 left-2 bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 rounded shadow">
                        -{p.flashSaleDiscount}% OFF
                      </span>
                    )}
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
                        <span className="bg-rose-600 text-white font-extrabold text-xs px-3 py-1.5 rounded-full shadow-lg">
                          {l('outOfStock')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] text-emerald-600 font-extrabold tracking-widest uppercase">{p.brand}</p>
                    <h3
                      onClick={() => onViewProduct(p)}
                      className="font-bold text-slate-800 text-sm hover:text-emerald-600 cursor-pointer line-clamp-1"
                    >
                      {t(p.name)}
                    </h3>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-900 font-black text-sm">৳ {finalPrice.toLocaleString()}</span>
                      {hasDiscount && (
                        <span className="text-slate-400 line-through text-[11px]">৳ {p.price.toLocaleString()}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1">
                        <span className="text-amber-400 text-xs text-sm">★</span>
                        <span className="text-xs text-slate-600 font-bold">{p.rating}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">SKU: {p.sku}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={() => onViewProduct(p)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                    {!isOutOfStock && (
                      <button
                        onClick={() => onAddToCart(p, 1)}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>{t({ en: "Buy", bn: "কিনুন" })}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
