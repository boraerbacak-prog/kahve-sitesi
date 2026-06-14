"use client";
import { useState } from "react";

const faqs = [
  {
    q: "Siparişimi ne zaman alırım?",
    a: "Siparişleriniz 1-3 iş günü içinde kargoya verilir. Teslimat süresi bulunduğunuz bölgeye göre 1-4 iş günüdür.",
  },
  {
    q: "Kargo ücreti ne kadar?",
    a: "1.000 ₺ ve üzeri tüm siparişlerde kargo ücretsizdir. Altındaki siparişlerde kargo ücreti 49.90 ₺'dir.",
  },
  {
    q: "Hangi ödeme yöntemlerini kullanabilirim?",
    a: "Cüzdan (Celsus hesabınıza yükleyip harcarsınız) ve kredi kartı (Stripe) ile ödeme yapabilirsiniz.",
  },
  {
    q: "Kahveler taze kavrulmuş mu?",
    a: "Evet, tüm kahvelerimiz sipariş üzerine kavrulur ve maksimum tazelikte gönderilir.",
  },
  {
    q: "Abonelik paketlerini nasıl yönetebilirim?",
    a: "Hesabım sayfasından aboneliklerinizi görüntüleyebilir, duraklatabilir veya iptal edebilirsiniz.",
  },
  {
    q: "İade ve değişim politikanız nedir?",
    a: "Paket açılmamış ürünlerde 14 gün içinde iade yapabilirsiniz. İade süreci için bizimle iletişime geçin.",
  },
  {
    q: "Çekirdek Kredi nedir?",
    a: "Her kahve alışverişinde ödediğin tutarın %5'i Çekirdek Kredi olarak hesabına yatırılır. Biriktirdiğin kredileri sonraki kahve alışverişlerinde kullanabilirsin. Son kullanma tarihi yoktur, yalnızca kahve ürünlerinde geçerlidir. Detaylı kurallar için Çekirdek Kredi sayfamızı ziyaret edebilirsin.",
  },
  {
    q: "Kahve öneri testi nasıl çalışır?",
    a: '"Bana kahve öner" yazarak AI barista ile sohbet başlatın. 4 soruluk testimizle size en uygun kahveyi bulalım.',
  },
  {
    q: "Toplu alımda indirim oluyor mu?",
    a: "Kurumsal ve toplu alımlar için B2B sayfamızdan bizimle iletişime geçebilirsiniz.",
  },
];

export default function SSSPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-heading mb-2">Sıkça Sorulan Sorular</h1>
      <p className="text-body mb-10">Sipariş, teslimat ve kahvelerimiz hakkında merak ettikleriniz.</p>

      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-white border border-border">
            <button onClick={() => setOpen(open === i ? null : i)}
              className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 hover:bg-page-hover transition">
              <span className="text-sm font-medium text-heading">{faq.q}</span>
              <span className={`text-primary text-lg transition-transform ${open === i ? "rotate-180" : ""}`}>▾</span>
            </button>
            {open === i && (
              <div className="px-6 pb-4">
                <p className="text-sm text-body leading-relaxed">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
