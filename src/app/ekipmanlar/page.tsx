"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import ProductLightbox from "@/components/ProductLightbox";
import ProductDetailModal from "@/components/ProductDetailModal";
import type { ProductDetail } from "@/components/ProductDetailModal";

function parsePrice(s: string): number {
  return parseFloat(s.replace(/\./g, "").replace(",", "."));
}

const equipment = [
  {
    image: "aywens-tamper.jpg",
    title: "Aywens Kalibrasyonlu Kahve Tamper",
    price: "4.700,00",
    salePrice: "4.230,00",
    desc: "Kalibrasyonlu tamper. Espresso hazırlığında öğütülmüş kahveyi eşit basınçla ve düzgün yüzeyli olarak sıkıştırmak için hassas kalibrasyon mekanizmasına sahiptir.",
  },
  {
    image: "mini-kettle-600.jpg",
    title: "Mini Kettle 600 ML",
    price: "—",
    salePrice: null,
    desc: "Kompakt tasarımlı mini kettle. Seyahat ve küçük mutfaklar için ideal. 600 ml kapasite.",
    soldOut: true,
  },
  {
    image: "mini-kettle-350-celik.jpg",
    title: "Mini Kettle 350 ML Çelik",
    price: "—",
    salePrice: null,
    desc: "Paslanmaz çelik mini kettle. 350 ml kapasite. Pratik ve şık tasarım.",
    soldOut: true,
  },
  {
    image: "sut-potu-350.jpg",
    title: "Süt Potu 350 ML",
    price: "—",
    salePrice: null,
    desc: "350 ml kapasiteli süt potu. Süt ısıtma ve köpürtme işlemleri için özel tasarım.",
    soldOut: true,
  },
  {
    image: "tamper-mati.jpg",
    title: "Tamper Matı",
    price: "400,00",
    salePrice: null,
    desc: "Barista çalışma alanı için tamper matı. Tezgah koruma ve tamper yerleştirme için ideal aksesuar.",
  },
  {
    image: "hassas-kahve-tartisi.jpg",
    title: "Hassas Kahve Tartısı",
    price: "1.000,00",
    salePrice: "950,00",
    desc: "Tartı, kahve çekirdeklerinin ağırlığını, sıcak suyun miktarını ve demleme süresini eşzamanlı olarak ölçer. Hassas kahve demleme için vazgeçilmez ekipman.",
  },
  {
    image: "cam-kahve-demleme-400.jpg",
    title: "Cam Kahve Demleme 400 ML",
    price: "700,00",
    salePrice: "630,00",
    desc: "400 ml kapasiteli cam kahve demleme aparatı. Filtre kahve hazırlamak için şık ve dayanıklı cam tasarım.",
  },
  {
    image: "seramik-demleme-kirmizi.jpg",
    title: "Seramik Demleme Kırmızı",
    price: "425,00",
    salePrice: "361,25",
    desc: "Kırmızı seramik kahve demleme aparatı. Bulaşık makinesinde yıkanabilir. No:2 kağıt filtreye uygundur.",
  },
  {
    image: "seramik-demleme-beyaz.jpg",
    title: "Seramik Demleme Beyaz",
    price: "425,00",
    salePrice: "361,25",
    desc: "Beyaz seramik kahve demleme aparatı. Bulaşık makinesinde yıkanabilir. No:2 kağıt filtreye uygundur.",
  },
  {
    image: "french-press.jpg",
    title: "French Press",
    price: "450,00",
    salePrice: "382,50",
    desc: "350 ml kapasiteli French Press. Dolgun gövdeli kahve sevenler için klasik demleme yöntemi.",
  },
  {
    image: "tamper.jpg",
    title: "Tamper",
    price: "1.100,00",
    salePrice: "990,00",
    desc: "58 mm taban yüzeyli tamper. Öğütülmüş kahvenin filtre içine eşit basınçla ve düzgün yüzeyli olarak sıkıştırılması için kullanılır.",
  },
  {
    image: "moka-pot.jpg",
    title: "Moka Pot",
    price: "—",
    salePrice: null,
    desc: "Geleneksel Moka Pot. Ocak üstünde kullanılır, yoğun ve aromatik kahve demler.",
    soldOut: true,
  },
  {
    image: "kahve-tartisi.jpg",
    title: "Kahve Tartısı",
    price: "1.100,00",
    salePrice: "1.045,00",
    desc: "Ergonomik tasarım, yüksek dayanıklılık, hassas ölçüm. Kapasite: 3000g, asgari ağırlık: 0.3g. Zamanlayıcılı, 4 dijital LED ekran, dokunmatik tuşlar.",
  },
  {
    image: "konchero-mostro-degirmen.jpg",
    title: "Konchero Mostro Kahve Değirmeni",
    price: "—",
    salePrice: null,
    desc: "Profesyonel kahve değirmeni. İstediğiniz incelikte öğütme için ideal.",
    soldOut: true,
  },
  {
    image: "mocca-master-filtre-4.jpg",
    title: "Mocca Master Filtre Kağıdı No:4",
    price: "300,00",
    salePrice: "264,00",
    desc: "Mocca Master uyumlu No:4 filtre kağıdı. Temiz ve tortusuz kahve demleme için özel üretim.",
  },
  {
    image: "mocca-master-select.jpg",
    title: "Mocca Master Select",
    price: "—",
    salePrice: null,
    desc: "Mocca Master Select model kahve makinesi. Profesyonel kahve demleme için tasarlanmıştır.",
    soldOut: true,
  },
  {
    image: "makaron.jpg",
    title: "Makaron (Düzleyici)",
    price: "—",
    salePrice: null,
    desc: "Kahve düzleyici (makaron). Filtrede kahvenin eşit dağılmasını sağlayarak homojen ekstraksiyon için kullanılır.",
    soldOut: true,
  },
];

export default function EkipmanlarPage() {
  const { addItem } = useCart();
  const [lightbox, setLightbox] = useState<{ image: string; title: string } | null>(null);
  const [detail, setDetail] = useState<ProductDetail | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#e5e0d8]">
        {equipment.map((item) => {
          const displayPrice = item.salePrice || item.price;
          const numericPrice = displayPrice !== "—" ? parsePrice(displayPrice) : 0;

          return (
            <div key={item.title} className="bg-white p-8 flex flex-col relative">
              {item.soldOut && (
                <span className="absolute top-4 right-4 text-xs bg-[#1a1a1a] text-white px-3 py-1 uppercase tracking-wider font-medium z-10">
                  Tükendi
                </span>
              )}
              <button
                className="aspect-square bg-[#f8f6f3] mb-6 flex items-center justify-center border border-[#e5e0d8] overflow-hidden w-full cursor-zoom-in group"
                onClick={() => setLightbox({ image: `/ekipman/${item.image}`, title: item.title })}
              >
                <Image
                  src={`/ekipman/${item.image}`}
                  alt={item.title}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </button>
              <h3 className="text-lg font-bold text-[#1a1a1a] mb-1">{item.title}</h3>
              <p className="text-sm text-[#4a4a4a] leading-relaxed flex-1 line-clamp-2">{item.desc}</p>
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#e5e0d8]">
                <div>
                  {item.salePrice ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-[#1a1a1a]">{item.salePrice} ₺</span>
                      <span className="text-sm text-[#8c8c8c] line-through">{item.price} ₺</span>
                    </div>
                  ) : (
                    <span className="text-lg font-bold text-[#1a1a1a]">
                      {item.soldOut ? "—" : `${item.price} ₺`}
                    </span>
                  )}
                </div>
                {!item.soldOut && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => addItem({ id: `ekipman-${item.title}`, name: item.title, price: numericPrice, image: `/ekipman/${item.image}` })}
                      className="text-xs font-medium bg-[#C4724B] hover:bg-[#B0603A] text-white px-3 py-2 transition uppercase tracking-wider"
                    >
                      Sepete Ekle
                    </button>
                    <button
                      onClick={() => setDetail({
                        id: `ekipman-${item.title}`,
                        image: `/ekipman/${item.image}`,
                        title: item.title,
                        price: item.price,
                        salePrice: item.salePrice,
                        desc: item.desc,
                      })}
                      className="text-xs font-medium border border-[#e5e0d8] hover:border-[#C4724B] text-[#1a1a1a] px-3 py-2 transition uppercase tracking-wider"
                    >
                      Detay
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {lightbox && (
        <ProductLightbox image={lightbox.image} title={lightbox.title} onClose={() => setLightbox(null)} />
      )}

      {detail && (
        <ProductDetailModal product={detail} onClose={() => setDetail(null)} />
      )}
    </div>
  );
}
