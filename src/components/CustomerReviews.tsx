"use client";

import { useEffect, useRef, useState } from "react";

const reviews = [
  {
    name: "Ayşe K.",
    location: "İstanbul",
    text: "Sipariş ettiğim kahve tam kıvamında kavrulmuştu. Freshness rozeti sayesinde hangi kahvenin en iyi dönemde olduğunu anında görebiliyorum. Artık başka yere bakmıyorum.",
    rating: 5,
    product: "Ethiopia Sidamo G2",
  },
  {
    name: "Mehmet T.",
    location: "Ankara",
    text: "AI Barista Stello'nun önerdiği kahve tam damak tadıma uydu. Üstelik cüzdanımdaki kredilerle ikinci siparişimde indirim kazandım. Tek kelimeyle mükemmel bir deneyim.",
    rating: 5,
    product: "Colombia Supremo 18 SC",
  },
  {
    name: "Zeynep A.",
    location: "İzmir",
    text: "Taze kavrum takvimini çok seviyorum. Hangi kahvenin ne zaman içilmeye hazır olduğunu gösteriyor. Paket üzerindeki kavrum tarihi sayesinde tam taze yakalıyorum.",
    rating: 5,
    product: "Guatemala SHB 18 SC",
  },
  {
    name: "Can B.",
    location: "Bursa",
    text: "Kahve aboneliği ile her ay kapıma farklı bir dünya kahvesi geliyor. Demleme rehberi sayesinde V60'ı ilk defa bu kadar lezzetli yapabildim. Kesinlikle tavsiye ederim.",
    rating: 5,
    product: "Brasil Mogiana",
  },
  {
    name: "Elif D.",
    location: "Antalya",
    text: "Sipariş yoğunluğu sayesinde kahvemin ne zaman kavrulup gönderileceğini önceden biliyorum. Bu şeffaflık gerçekten fark yaratıyor. Ve tazelik garantisi inanılmaz.",
    rating: 5,
    product: "Ethiopia Lekempt G4",
  },
  {
    name: "Ali R.",
    location: "Kocaeli",
    text: "Bir kahve sever olarak Rostello'daki tazelik takibi beni çok etkiledi. Kahvenin dinlenme sürecini bile bile almak harika bir duygu. Çekirdek kredi sistemi de cabası.",
    rating: 5,
    product: "Kenya AA",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-4 h-4 text-[#C4724B]" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function CustomerReviews() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const cardWidth = el.querySelector("div")?.clientWidth || 1;
      const idx = Math.round(el.scrollLeft / (cardWidth + 16));
      setActiveIndex(Math.min(idx, reviews.length - 1));
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("div")?.clientWidth || 1;
    el.scrollTo({ left: index * (cardWidth + 16), behavior: "smooth" });
  };

  return (
    <section className="section-copper relative bg-[#f5f2ed] py-16 sm:py-20">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f5f2ed]/80 via-[#f5f2ed]/50 to-[#f5f2ed]/80" />
      </div>
      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="eyebrow">Rostello Topluluğu</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-heading mt-3 mb-4">
            Fincandaki <span className="animate-copper">Hikayeler</span>
          </h2>
          <p className="text-body text-base sm:text-lg leading-relaxed">
            Çekirdeğin ideal içim dönemini bizimle birlikte takip eden ve en dengeli anı deneyimleyen Rostello topluluğunun paylaşımları.
          </p>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 -mx-6 px-6"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {reviews.map((review, i) => (
            <div
              key={i}
              className="snap-start shrink-0 w-[85vw] sm:w-[380px] lg:w-[400px] bg-white border border-[#e5e0d8] p-6 sm:p-8 flex flex-col group hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex items-center gap-1 mb-3">
                <Stars count={review.rating} />
              </div>
              <p className="text-sm text-body leading-relaxed mb-5 flex-1 italic">
                &ldquo;{review.text}&rdquo;
              </p>
              <div className="border-t border-[#e5e0d8] pt-4 mt-auto">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-heading">{review.name}</p>
                    <p className="text-xs text-muted">{review.location}</p>
                  </div>
                  <span className="text-[11px] text-primary uppercase tracking-wider font-medium">{review.product}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === activeIndex ? "bg-primary w-6" : "bg-primary/30 hover:bg-primary/50"
              }`}
              aria-label={`Yorum ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
