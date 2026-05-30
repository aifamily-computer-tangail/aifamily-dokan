// src/components/CustomerPortal.tsx
import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import { Order, OrderStatus } from '../types';
import { Search, MapPin, Truck, ChevronDown, CheckCircle2, Circle, Clock, Printer } from 'lucide-react';

interface CustomerPortalProps {
  initialOrderId?: string;
}

const STATUS_MILESTONES: { status: OrderStatus; labelEn: string; labelBn: string }[] = [
  { status: 'Pending', labelEn: "Pending", labelBn: "অপেক্ষমান" },
  { status: 'Confirmed', labelEn: "Confirmed", labelBn: "নিশ্চিতকৃত" },
  { status: 'Processing', labelEn: "Processing", labelBn: "প্রক্রিয়াধীন" },
  { status: 'Packed', labelEn: "Packed", labelBn: "প্যাকেজিং সম্পন্ন" },
  { status: 'Shipped', labelEn: "Shipped", labelBn: "কুরিয়ারে প্রেরিত" },
  { status: 'Out For Delivery', labelEn: "Out For Delivery", labelBn: "ডেলিভারি চলছে" },
  { status: 'Delivered', labelEn: "Delivered", labelBn: "ডেলিভারি সম্পন্ন" }
];

export default function CustomerPortal({ initialOrderId }: CustomerPortalProps) {
  const { t, l } = useLanguage();
  const [trackId, setTrackId] = useState(initialOrderId || '');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [trackError, setTrackError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Trigger search on mount if initialOrderId is passed down
  useEffect(() => {
    if (initialOrderId) {
      setTrackId(initialOrderId);
      handleSearchOrder(initialOrderId);
    }
  }, [initialOrderId]);

  const handleSearchOrder = async (idToSearch: string) => {
    const rawId = idToSearch.trim();
    if (!rawId) return;
    setIsSearching(true);
    setTrackError('');
    setFoundOrder(null);

    // 1. Try checking local simulated orders in localStorage first
    try {
      const localOrdersStr = localStorage.getItem('amardukaan_local_orders');
      if (localOrdersStr) {
        const localOrders = JSON.parse(localOrdersStr);
        if (Array.isArray(localOrders)) {
          const matched = localOrders.find((o) => o.id.toUpperCase() === rawId.toUpperCase());
          if (matched) {
            setFoundOrder(matched);
            setIsSearching(false);
            return;
          }
        }
      }
    } catch (e) {
      console.warn("Failed checking local storage orders", e);
    }

    // 2. Fetch from backend API
    try {
      const res = await fetch(`/api/orders/${rawId}`);
      if (!res.ok) {
        setTrackError(t({
          en: "Invoice reference code not found. Please double check the ID format (e.g. ORD-20260530-101).",
          bn: "অর্ডার আইডিটি খুঁজে পাওয়া যায়নি। দয়া করে সঠিক আইডি দিয়ে পুনরায় চেষ্টা করুন।"
        }));
      } else {
        const order = await res.json();
        setFoundOrder(order);
      }
    } catch (err) {
      setTrackError(t({
        en: "Invoice reference code not found or Server connection offline. Check your ID format.",
        bn: "অর্ডার আইডিটি খুঁজে পাওয়া যায়নি অথবা সার্ভার অফলাইন রয়েছে।"
      }));
    } finally {
      setIsSearching(false);
    }
  };

  const getMilestoneIndex = (status: OrderStatus) => {
    return STATUS_MILESTONES.findIndex((m) => m.status === status);
  };

  const activeMilestoneIndex = foundOrder ? getMilestoneIndex(foundOrder.status) : -1;

  // Invoice dynamic print
  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="space-y-8 print:bg-white print:p-0">
      {/* Search Order Form segment */}
      <section className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4 max-w-xl mx-auto print:hidden">
        <div className="space-y-1">
          <h2 className="text-lg sm:text-2xl font-black text-slate-800">{l('trackYourOrder')}</h2>
          <p className="text-xs text-slate-400">{l('enterOrderId')}</p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={trackId}
            onChange={(e) => setTrackId(e.target.value)}
            placeholder="ORD-20260530-01"
            className="flex-1 border border-slate-200 rounded-xl px-4 py-2 sm:py-3 text-xs sm:text-sm font-extrabold text-slate-800 focus:outline-none focus:border-emerald-500 uppercase"
          />
          <button
            onClick={() => handleSearchOrder(trackId)}
            disabled={isSearching}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-colors shadow flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </div>

        {trackError && <p className="text-xs font-bold text-rose-500">{trackError}</p>}
      </section>

      {foundOrder && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          {/* Tracking milestones dashboard */}
          <div className="lg:col-span-2 bg-white border border-slate-150 p-6 rounded-2xl shadow-sm space-y-6 print:hidden">
            <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-500" />
              <span>Real-Time Logistics Status Timeline</span>
            </h3>

            {/* Steps line representation */}
            <div className="space-y-6 pt-4 PL-3">
              {STATUS_MILESTONES.map((milestone, idx) => {
                const isPassed = idx <= activeMilestoneIndex;
                const isCurrent = milestone.status === foundOrder.status;

                return (
                  <div key={milestone.status} className="relative flex gap-4 items-start">
                    {/* Visual Vertical linking lines */}
                    {idx < STATUS_MILESTONES.length - 1 && (
                      <div
                        className={`absolute left-3 top-6 w-0.5 h-12 -translate-x-[1px] ${
                          idx < activeMilestoneIndex ? 'bg-emerald-500' : 'bg-slate-100'
                        }`}
                      />
                    )}

                    <div className="relative z-10">
                      {isCurrent ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500 border-4 border-emerald-100 flex items-center justify-center animate-ping absolute" />
                      ) : null}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          isPassed ? 'bg-emerald-500 text-white' : 'bg-slate-50 border-2 border-slate-200 text-slate-300'
                        }`}
                      >
                        {isPassed ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Circle className="w-2.5 h-2.5 fill-current" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <p
                        className={`font-black text-xs sm:text-sm ${
                          isCurrent ? 'text-emerald-600' : isPassed ? 'text-slate-800' : 'text-slate-400'
                        }`}
                      >
                        {l('language') === 'bn' ? milestone.labelBn : milestone.labelEn}
                      </p>
                      {isCurrent && (
                        <p className="text-[11px] text-slate-500 font-medium">
                          Your package is actively in the {milestone.status.toLowerCase()} process queue.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Courier assign tracking code panel block */}
            {foundOrder.courierName && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mt-6 flex items-center gap-4">
                <span className="text-xl">📦</span>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-xs">Courier assigned</h4>
                  <p className="text-[11px] text-slate-500 font-bold">
                    {foundOrder.courierName} — Tracking code ID:{' '}
                    <span className="font-black text-emerald-600 select-all">{foundOrder.trackingNumber || 'Awaiting'}</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Customer clean Printable Invoice layout container */}
          <div className="lg:col-span-1 bg-white border border-slate-250 p-6 rounded-2xl shadow-md space-y-6 print:col-span-3 print:border-none print:shadow-none">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide">Invoice PDF Slip</h3>
              <button
                onClick={handlePrintInvoice}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors print:hidden"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print PDF</span>
              </button>
            </div>

            {/* Invoice fields details info */}
            <div className="space-y-4 text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-slate-500">Order ID:</span>
                <span className="text-slate-800 font-extrabold uppercase select-all">{foundOrder.id}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-500">Sales Date:</span>
                <span className="text-slate-800 font-semibold">{new Date(foundOrder.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-500">Customer:</span>
                <span className="text-slate-800 font-bold">{foundOrder.customerName}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-500">Phone:</span>
                <span className="text-slate-800 font-bold">{foundOrder.customerPhone}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-500">Shipping:</span>
                <span className="text-slate-800 text-right font-medium max-w-[180px] truncate-3-lines">
                  {foundOrder.shippingAddress} (Area: {foundOrder.upazilaId})
                </span>
              </div>

              {/* Items tabular billing list */}
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <p className="font-black text-slate-800 text-[10px] uppercase tracking-wider">Ordered Items</p>
                {foundOrder.items.map((it, i) => (
                  <div key={i} className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-600 font-medium">
                      {t(it.name)} <strong className="text-slate-900 font-extrabold">x{it.quantity}</strong>
                    </span>
                    <span className="text-slate-800 font-extrabold">৳ {(it.price * it.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Subtotal totals billing lists info */}
              <div className="border-t border-slate-100 pt-3 space-y-2 font-bold leading-relaxed text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="text-slate-800">৳ {foundOrder.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Cost:</span>
                  <span className="text-slate-800">৳ {foundOrder.deliveryCharge.toLocaleString()}</span>
                </div>
                {foundOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-extrabold">
                    <span>Discount:</span>
                    <span>- ৳ {foundOrder.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-slate-900 border-t border-slate-100 pt-2">
                  <span>Total Bill:</span>
                  <span>৳ {foundOrder.total.toLocaleString()}</span>
                </div>
              </div>

              {/* invoice footer payments validation confirmation */}
              <div className="p-3 bg-slate-50 rounded-xl text-center text-[10px] space-y-1">
                <p className="font-extrabold uppercase text-slate-700">Payment Status: {foundOrder.paymentStatus}</p>
                <p className="text-slate-400 font-semibold uppercase leading-tight">Paid via {foundOrder.paymentMethod}</p>
                {foundOrder.transactionId && (
                  <p className="text-slate-500 font-extrabold text-[9px] uppercase tracking-wider">TXN: {foundOrder.transactionId}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
