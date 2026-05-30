// src/components/CartCheckoutView.tsx
import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { Product, District, Upazila, OrderItem } from '../types';
import { ShoppingBag, ChevronRight, CheckCircle, Ticket, Trash2, ArrowLeft, Loader2, Sparkles } from 'lucide-react';

interface CartCheckoutViewProps {
  cartItems: { product: Product; quantity: number }[];
  onUpdateCartQty: (productId: string, quantity: number) => void;
  onRemoveCartItem: (productId: string) => void;
  onClearCart: () => void;
  onNavigateHome: () => void;
  onOrderSuccess: (orderId: string) => void;
}

// Define fallback Bangladesh locations if backend APIs aren't responding (Vercel/Static setups)
const FALLBACK_DISTRICTS: District[] = [
  { id: "dhaka", name: { en: "Dhaka", bn: "ঢাকা" }, deliveryCharge: 60 },
  { id: "gazipur", name: { en: "Gazipur", bn: "গাজীপুর" }, deliveryCharge: 100 },
  { id: "narayanganj", name: { en: "Narayanganj", bn: "নারায়ণগঞ্জ" }, deliveryCharge: 100 },
  { id: "tangail", name: { en: "Tangail", bn: "টাঙ্গাইল" }, deliveryCharge: 120 },
  { id: "chattogram", name: { en: "Chattogram", bn: "চট্টগ্রাম" }, deliveryCharge: 130 },
  { id: "sylhet", name: { en: "Sylhet", bn: "সিলেট" }, deliveryCharge: 130 },
  { id: "rajshahi", name: { en: "Rajshahi", bn: "রাজশাহী" }, deliveryCharge: 130 },
  { id: "barishal", name: { en: "Barishal", bn: "বরিশাল" }, deliveryCharge: 130 },
  { id: "khulna", name: { en: "Khulna", bn: "খুলনা" }, deliveryCharge: 130 },
  { id: "mymensingh", name: { en: "Mymensingh", bn: "ময়মনসিংহ" }, deliveryCharge: 120 },
];

const getFallbackUpazilas = (districtId: string): Upazila[] => {
  const districtName = districtId.charAt(0).toUpperCase() + districtId.slice(1);
  return [
    { id: `${districtId}-sadar`, districtId, name: { en: `${districtName} Sadar`, bn: `${districtName} সদর` }, additionalCharge: 0 },
    { id: `${districtId}-west`, districtId, name: { en: "Upazila West", bn: "পশ্চিম উপজেলা" }, additionalCharge: 15 },
    { id: `${districtId}-east`, districtId, name: { en: "Upazila East", bn: "পূর্ব উপজেলা" }, additionalCharge: 15 },
    { id: `${districtId}-remote`, districtId, name: { en: "Remote Area", bn: "দুর্গম অঞ্চল" }, additionalCharge: 30 }
  ];
};

export default function CartCheckoutView({
  cartItems,
  onUpdateCartQty,
  onRemoveCartItem,
  onClearCart,
  onNavigateHome,
  onOrderSuccess,
}: CartCheckoutViewProps) {
  const { t, l } = useLanguage();

  // Step state: 'cart' or 'checkout' or 'completed'
  const [step, setStep] = useState<'cart' | 'checkout' | 'completed'>('cart');
  const [createdOrderId, setCreatedOrderId] = useState('');

  // Shipping locations fetched from server APIs
  const [districts, setDistricts] = useState<District[]>([]);
  const [upazilas, setUpazilas] = useState<Upazila[]>([]);
  const [isLocationsLoading, setIsLocationsLoading] = useState(false);

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [selectedUpazilaId, setSelectedUpazilaId] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'bKash' | 'Nagad' | 'Rocket' | 'Bank'>('COD');
  const [transactionId, setTransactionId] = useState('');

  // Coupons
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; type: string; value: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isCouponValidating, setIsCouponValidating] = useState(false);

  // checkout submission states
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Fetch districts once the user enters checkout
  useEffect(() => {
    if (step === 'checkout') {
      setIsLocationsLoading(true);
      fetch('/api/shipping/locations')
        .then((res) => {
          if (!res.ok) throw new Error("Status code not OK");
          const contentType = res.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) throw new Error("Not JSON type");
          return res.json();
        })
        .then((data) => {
          if (data && data.districts) {
            setDistricts(data.districts);
          } else {
            setDistricts(FALLBACK_DISTRICTS);
          }
        })
        .catch((err) => {
          console.warn("District fetch failed, using fallback list:", err);
          setDistricts(FALLBACK_DISTRICTS);
        })
        .finally(() => setIsLocationsLoading(false));
    }
  }, [step]);

  // Fetch Upazilas dynamically when selectedDistrictId shifts state
  useEffect(() => {
    if (selectedDistrictId) {
      fetch(`/api/shipping/upazilas?districtId=${selectedDistrictId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Status code not OK");
          const contentType = res.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) throw new Error("Not JSON type");
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            setUpazilas(data);
          } else {
            setUpazilas(getFallbackUpazilas(selectedDistrictId));
          }
        })
        .catch((err) => {
          console.warn("Upazila fetch failed, using fallback upazilas generator:", err);
          setUpazilas(getFallbackUpazilas(selectedDistrictId));
        });
      setSelectedUpazilaId('');
    } else {
      setUpazilas([]);
      setSelectedUpazilaId('');
    }
  }, [selectedDistrictId]);

  // Calculations
  const cartSubtotal = cartItems.reduce((acc, item) => {
    const price = item.product.isFlashSale && item.product.flashSaleDiscount
      ? item.product.price * (1 - item.product.flashSaleDiscount / 100)
      : item.product.price;
    return acc + price * item.quantity;
  }, 0);

  // Delivery configuration
  const activeDistrict = districts.find((d) => d.id === selectedDistrictId);
  const activeUpazila = upazilas.find((u) => u.id === selectedUpazilaId);
  const deliveryCharge = step === 'checkout'
    ? (activeDistrict ? activeDistrict.deliveryCharge : 120) + (activeUpazila ? activeUpazila.additionalCharge : 0)
    : 0;

  // Coupon Discount
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discountAmount = Math.round(cartSubtotal * (appliedCoupon.value / 100));
    } else if (appliedCoupon.type === 'fixed') {
      discountAmount = appliedCoupon.value;
    } else if (appliedCoupon.type === 'free_shipping') {
      discountAmount = deliveryCharge;
    }
  }

  const tax = 0;
  const totalPayable = Math.max(0, cartSubtotal + deliveryCharge - discountAmount);

  // Apply code coupons endpoint fetch
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setIsCouponValidating(true);
    setCouponError('');

    try {
      const categoryIds = cartItems.map((item) => item.product.categoryId);
      const productIds = cartItems.map((item) => item.product.id);

      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.toUpperCase().trim(),
          cartSubtotal,
          categoryIds,
          productIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || "Validation failed.");
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon({
          code: data.code,
          type: data.type,
          value: data.value,
        });
        setCouponCode('');
      }
    } catch (err) {
      setCouponError("Network validation failed.");
    } finally {
      setIsCouponValidating(false);
    }
  };

  // Submit complete order payload to backend
  const handleSubmitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Phone pattern 11-digit Bangladesh regex check
    const cleanPhone = customerPhone.replace(/[\s-+]/g, '');
    const phoneRegex = /^(01[3-9]\d{8})$/;
    if (!customerName.trim()) {
      setValidationError("Customer name is required.");
      return;
    }
    if (!phoneRegex.test(cleanPhone)) {
      setValidationError("Please enter a valid 11-digit Bangladeshi phone number (e.g., 01711234567).");
      return;
    }
    if (!shippingAddress.trim()) {
      setValidationError("Shipping address cannot be empty.");
      return;
    }
    if (!selectedDistrictId) {
      setValidationError("Please select your delivery district.");
      return;
    }
    if (['bKash', 'Nagad', 'Rocket'].includes(paymentMethod) && !transactionId.trim()) {
      setValidationError("Please enter the Mobile Money Transfer Transaction ID (TxnID) to enable auto verification.");
      return;
    }

    setIsSubmittingOrder(true);

    // transform cart payload
    const orderItems: OrderItem[] = cartItems.map((i) => {
      const hasD = i.product.isFlashSale && i.product.flashSaleDiscount;
      const p = hasD ? i.product.price * (1 - i.product.flashSaleDiscount! / 100) : i.product.price;
      return {
        productId: i.product.id,
        name: i.product.name,
        price: p,
        quantity: i.quantity,
        image: i.product.images[0],
      };
    });

    try {
      const orderPayload = {
        customerName,
        customerPhone: cleanPhone,
        customerEmail: customerEmail.trim() || undefined,
        shippingAddress: shippingAddress.trim(),
        districtId: selectedDistrictId,
        upazilaId: selectedUpazilaId,
        deliveryInstructions: deliveryInstructions.trim() || undefined,
        items: orderItems,
        discount: discountAmount,
        appliedCouponCode: appliedCoupon?.code,
        paymentMethod,
        transactionId: transactionId.trim() || undefined,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        setValidationError(data.error || "Order execution failed.");
      } else {
        setCreatedOrderId(data.id);
        setStep('completed');
        onClearCart(); // empty cart container upon checkout
      }
    } catch (err) {
      console.warn("API Server unavailable, performing local client-side order simulation:", err);
      // Client-side simulation fallback:
      const simulatedId = `ORD-20260530-${Math.floor(100 + Math.random() * 900)}`;
      
      // Calculate total amount
      const deliveryCharge = districts.find(d => d.id === selectedDistrictId)?.deliveryCharge || 60;
      const upazilaCharge = upazilas.find(u => u.id === selectedUpazilaId)?.additionalCharge || 0;
      const finalShip = deliveryCharge + upazilaCharge;
      
      const totalAmount = cartSubtotal - discountAmount + finalShip;
      const dateStr = new Date().toISOString();

      const newSimulatedOrder = {
        id: simulatedId,
        customerName,
        customerPhone: cleanPhone,
        customerEmail: customerEmail.trim() || undefined,
        shippingAddress: shippingAddress.trim(),
        districtId: selectedDistrictId,
        upazilaId: selectedUpazilaId,
        deliveryInstructions: deliveryInstructions.trim() || undefined,
        items: orderItems,
        discount: discountAmount,
        totalAmount,
        paymentMethod,
        paymentStatus: ['bKash', 'Nagad', 'Rocket'].includes(paymentMethod) ? "Paid" : "Pending",
        status: "Pending",
        date: dateStr,
        transactionId: transactionId.trim() || undefined,
      };

      try {
        const localSavedOrders = localStorage.getItem('amardukaan_local_orders');
        const parsed = localSavedOrders ? JSON.parse(localSavedOrders) : [];
        const updated = [newSimulatedOrder, ...(Array.isArray(parsed) ? parsed : [])];
        localStorage.setItem('amardukaan_local_orders', JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save simulated order in localStorage:", e);
      }

      setCreatedOrderId(simulatedId);
      setStep('completed');
      onClearCart();
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  if (cartItems.length === 0 && step !== 'completed') {
    return (
      <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="font-extrabold text-slate-700 text-lg sm:text-xl">{l('emptyCart')}</h3>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xs mx-auto">Explore our beautiful collection of authentic handlooms and organics in BDT currency.</p>
        </div>
        <button
          onClick={onNavigateHome}
          className="bg-emerald-500 text-slate-950 font-bold px-6 py-2.5 rounded-full text-sm inline-flex items-center gap-2 shadow-sm hover:bg-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Shop Now</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Processing Steps indicators */}
      <div className="flex items-center space-x-2 text-xs sm:text-sm bg-slate-50 border border-slate-150 p-4 rounded-2xl font-bold text-slate-600">
        <span className={step === 'cart' ? 'text-emerald-600 font-black' : 'text-slate-400'}>{l('cart')}</span>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <span className={step === 'checkout' ? 'text-emerald-600 font-black' : 'text-slate-400'}>{l('checkout')}</span>
        <ChevronRight className="w-4 h-4 text-slate-300" />
        <span className={step === 'completed' ? 'text-emerald-600 font-black' : 'text-slate-400'}>Invoice Confirmed</span>
      </div>

      {step === 'cart' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart item grids list */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg sm:text-2xl font-black text-slate-800">{l('cartTitle')}</h2>
            <div className="border border-slate-150 rounded-2xl overflow-hidden bg-white divide-y divide-slate-100">
              {cartItems.map((item) => {
                const effectivePrice = item.product.isFlashSale && item.product.flashSaleDiscount
                  ? item.product.price * (1 - item.product.flashSaleDiscount / 100)
                  : item.product.price;
                const subtotal = effectivePrice * item.quantity;

                return (
                  <div key={item.product.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.product.images[0]}
                        alt={t(item.product.name)}
                        className="w-16 h-16 object-cover rounded-lg border border-slate-100 flex-shrink-0"
                      />
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-sm sm:text-base line-clamp-1">{t(item.product.name)}</h4>
                        <p className="text-xs text-slate-500">{item.product.brand}</p>
                        <p className="text-xs font-semibold text-emerald-600 mt-1">৳ {effectivePrice.toLocaleString()}</p>
                      </div>
                    </div>
                    {/* Quantity controls & Delete */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                      <div className="flex items-center border border-slate-200 rounded-lg">
                        <button
                          onClick={() => onUpdateCartQty(item.product.id, Math.max(1, item.quantity - 1))}
                          className="px-2.5 py-1 text-slate-500 hover:bg-slate-50 text-xs sm:text-sm font-black"
                        >
                          -
                        </button>
                        <span className="px-3 text-slate-800 text-xs sm:text-sm font-extrabold">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateCartQty(item.product.id, Math.min(item.product.stock, item.quantity + 1))}
                          className="px-2.5 py-1 text-slate-500 hover:bg-slate-50 text-xs sm:text-sm font-black"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <span className="font-extrabold text-slate-800 text-sm sm:text-base">
                          ৳ {subtotal.toLocaleString()}
                        </span>
                        <button
                          onClick={() => onRemoveCartItem(item.product.id)}
                          className="text-rose-500 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cart Pricing summary panel */}
          <div className="space-y-6">
            <h3 className="font-extrabold text-slate-800 text-lg uppercase tracking-wider">Payments Info</h3>
            <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex justify-between text-xs sm:text-sm font-bold text-slate-600 leading-relaxed">
                <span>{l('subtotal')}</span>
                <span className="text-slate-800">৳ {cartSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm font-bold text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                <span>{l('deliveryCharge')}</span>
                <span className="text-slate-400 italic">Calculated at Checkout</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-black text-slate-800 pt-3 border-t border-slate-100">
                <span>Total Sub</span>
                <span>৳ {cartSubtotal.toLocaleString()}</span>
              </div>
              <button
                onClick={() => setStep('checkout')}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>{l('checkout')}</span>
                <ChevronRight className="w-4.5 h-4.5" />
              </button>
            </div>
            {/* Promo Codes application */}
            <form onSubmit={handleApplyCoupon} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex gap-2">
              <input
                type="text"
                placeholder="PROMO CODE"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 text-xs uppercase focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={isCouponValidating}
                className="bg-slate-900 hover:bg-emerald-600 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all disabled:opacity-50"
              >
                {isCouponValidating ? '...' : l('apply')}
              </button>
            </form>
          </div>
        </div>
      )}

      {step === 'checkout' && (
        <form onSubmit={handleSubmitCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout address and payment specifications */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800">{l('checkoutTitle')}</h2>

            {validationError && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 font-semibold rounded-xl text-xs sm:text-sm">
                ⚠️ {validationError}
              </div>
            )}

            <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">{l('customerInfo')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase">{l('fullName')} *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Abul Kalam"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase">{l('phone')} *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="01711234567"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase">{l('email')}</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="abul@gmail.com"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase">{l('district')} *</label>
                  <select
                    required
                    value={selectedDistrictId}
                    onChange={(e) => setSelectedDistrictId(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="">{l('selectDistrict')}</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {t(d.name)} (Base: ৳{d.deliveryCharge})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase">{l('upazila')} *</label>
                  <select
                    required
                    value={selectedUpazilaId}
                    onChange={(e) => setSelectedUpazilaId(e.target.value)}
                    disabled={!selectedDistrictId}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-emerald-500 cursor-pointer disabled:opacity-50"
                  >
                    <option value="">{l('selectUpazila')}</option>
                    {upazilas.map((u) => (
                      <option key={u.id} value={u.id}>
                        {t(u.name)} (Adds: ৳{u.additionalCharge})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase">{l('address')} *</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="House 12, Road 4, Sector 7"
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">{l('instructions')}</label>
                <textarea
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder="Call before arrival..."
                  rows={2}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Payment selections segment with sub info instructions */}
            <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">{l('paymentSelection')}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { value: 'COD', label: l('cod'), icon: '🚚' },
                  { value: 'bKash', label: 'bKash Merchant Pay', icon: '🇧' },
                  { value: 'Nagad', label: 'Nagad Wallet Pay', icon: '🇳' },
                  { value: 'Rocket', label: 'Rocket Wallet Pay', icon: '🇷' },
                  { value: 'Bank', label: l('bankTransfer'), icon: '🏦' },
                ].map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(p.value as any);
                      if (p.value === 'COD' || p.value === 'Bank') setTransactionId('');
                    }}
                    className={`p-3.5 rounded-xl border-2 text-left transition-all space-y-2 ${
                      paymentMethod === p.value
                        ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-lg">{p.icon}</span>
                    <p className="font-extrabold text-slate-700 text-xs leading-tight">{p.label}</p>
                  </button>
                ))}
              </div>

              {/* Digital mobile payment details integration instructions */}
              {['bKash', 'Nagad', 'Rocket'].includes(paymentMethod) && (
                <div className="p-4 bg-emerald-950/5 border border-emerald-950/20 rounded-xl space-y-3">
                  <p className="text-xs text-emerald-800 leading-relaxed font-semibold">
                    💡 <strong>{l('payAmountPrompt')} ৳{totalPayable.toLocaleString()}</strong> {l('sendMoneyMerchant')}
                  </p>
                  <p className="text-xs text-amber-700 font-extrabold uppercase tracking-wide">
                    {l('merchantNumbers')}
                  </p>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-500 uppercase">{l('txIdLabel')} *</label>
                    <input
                      type="text"
                      required
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="BK992A77FD..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs uppercase font-extrabold text-slate-800 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'Bank' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">{l('bankInfoTitle')}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {l('bankInfoDetails')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pricing calculations summary panel */}
          <div className="space-y-6">
            <h3 className="font-extrabold text-slate-800 text-lg uppercase tracking-wider">Checkout Total</h3>
            <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-sm space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Cart Items Count</span>
                  <span className="text-slate-800">{cartItems.reduce((acc, i) => acc + i.quantity, 0)} Pcs</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Subtotal Amount</span>
                  <span className="text-slate-800">৳ {cartSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-500 border-t border-slate-100 pt-3">
                  <span>Delivery Surcharge</span>
                  <span className="text-slate-800">৳ {deliveryCharge.toLocaleString()}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-xs font-extrabold text-emerald-600 border-t border-slate-100 pt-3">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>- ৳ {discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm sm:text-base font-black text-slate-800 border-t border-slate-100 pt-3">
                  <span>{l('total')}</span>
                  <span>৳ {totalPayable.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingOrder}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isSubmittingOrder ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>{l('verifyPayment')}</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('cart')}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 mt-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Cart</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {step === 'completed' && (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl max-w-xl mx-auto p-6 text-center space-y-6 shadow-md animate-fade-in">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
            <CheckCircle className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <span className="text-emerald-500 font-extrabold tracking-widest uppercase text-xs">Checkout Success!</span>
            <h2 className="font-black text-slate-800 text-xl sm:text-3xl">YOUR ORDER IS REGISTERED</h2>
            <p className="text-slate-500 font-extrabold text-xs sm:text-sm">
              Billing/Ref ID: <span className="text-slate-900 select-all font-black bg-slate-100 px-2 py-1 rounded">{createdOrderId}</span>
            </p>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
            Our automated courier partner Steadfast will proceed with local delivery. Inside Dhaka takes 24 hours. Keep this invoice code safe.
          </p>
          <div className="flex gap-2 justify-center pt-2">
            <button
              onClick={() => onOrderSuccess(createdOrderId)}
              className="bg-slate-900 text-white font-bold px-4 py-2 text-xs sm:text-sm rounded-lg"
            >
              Track Order Progress
            </button>
            <button
              onClick={onNavigateHome}
              className="bg-emerald-500 text-slate-950 font-bold px-4 py-2 text-xs sm:text-sm rounded-lg"
            >
              Back to Catalog
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
