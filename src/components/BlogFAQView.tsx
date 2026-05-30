// src/components/BlogFAQView.tsx
import React, { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';
import dbFallback from '../../db.json';

interface Blog {
  id: string;
  title: { en: string; bn: string };
  excerpt?: { en: string; bn: string };
  content: { en: string; bn: string };
  image?: string;
  imageUrl?: string;
  createdAt: string;
  author: string;
}

interface Faq {
  id?: string;
  question: { en: string; bn: string };
  answer: { en: string; bn: string };
}

export default function BlogFAQView() {
  const { t } = useLanguage();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [activeFaq, setActiveFaq] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrFallback = async <T,>(url: string, fallback: T): Promise<T> => {
      try {
        const res = await fetch(url);
        if (!res.ok) return fallback;
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) return fallback;
        return await res.json() as T;
      } catch (err) {
        console.warn(`Fetch to ${url} failed, using local asset fallback`, err);
        return fallback;
      }
    };

    fetchOrFallback<Blog[]>('/api/blogs', dbFallback.blogs as Blog[])
      .then((data) => {
        const normalized = (data || []).map(b => ({
          ...b,
          image: b.image || b.imageUrl || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600"
        }));
        setBlogs(normalized);
      });

    fetchOrFallback<Faq[]>('/api/faqs', dbFallback.faqs as Faq[])
      .then((data) => setFaqs(data || []));
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Blog list catalog cards layout */}
      <section className="lg:col-span-2 space-y-6">
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 border-b border-slate-100 pb-2">
          📖 {t({ en: "Stories & Traditional Fabric Heritage", bn: "ঐতিহ্যবাহী পোশাকের কথকথা ও ব্লগ" })}
        </h2>
        <div className="space-y-6">
          {blogs.map((b) => (
            <article key={b.id} className="bg-white rounded-2xl border border-slate-150 p-5 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="h-[200px] overflow-hidden rounded-xl">
                <img
                  src={b.image}
                  alt={t(b.title)}
                  className="w-full h-full object-cover hover:scale-102 transition-transform duration-500"
                />
              </div>
              <div className="space-y-2">
                <div className="flex gap-4 text-[10px] sm:text-xs font-bold text-slate-400">
                  <span>Author: {b.author}</span>
                  <span>Published: {new Date(b.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-800 hover:text-emerald-600 transition-colors cursor-pointer">
                  {t(b.title)}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  {t(b.content)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions accordion widget list drawer */}
      <section className="lg:col-span-1 space-y-6">
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 border-b border-slate-100 pb-2">
          ❓ FAQs Helper Desk
        </h2>
        <div className="space-y-3 bg-white border border-slate-150 p-4 rounded-2xl">
          {faqs.map((f) => {
            const isOpen = activeFaq === f.id;
            return (
              <div key={f.id} className="border-b border-slate-100 last:border-none pb-2 pt-2">
                <button
                  onClick={() => setActiveFaq(isOpen ? null : f.id)}
                  className="w-full text-left font-extrabold text-xs sm:text-sm text-slate-700 hover:text-emerald-600 transition-colors flex items-center justify-between gap-2"
                >
                  <span>{t(f.question)}</span>
                  <span className="text-xs text-slate-400 font-extrabold">{isOpen ? '▲' : '▼'}</span>
                </button>
                {isOpen && (
                  <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold">
                    {t(f.answer)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
