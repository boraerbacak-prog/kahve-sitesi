"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import ProductLightbox from "@/components/ProductLightbox";
import ProductDetailModal from "@/components/ProductDetailModal";
import type { ProductDetail } from "@/components/ProductDetailModal";

const items = [
  {
    image: "tshirt-logolu.png",
    title: "Rostello Logolu Tişört",
    price: "650,00",
    salePrice: null,
    desc: "Rostello özel tasarım logolu pamuklu tişört. Rahat ve şık kullanım için kaliteli baskı.",
    cat: "Giyim",
  },
  {
    image: "termos2.png",
    title: "Rostello Termos",
    price: "750,00",
    salePrice: null,
    desc: "Rostello logolu çelik termos. Sıcak ve soğuk içeceklerinizi ideal sıcaklıkta saklar.",
    cat: "Aksesuar",
  },
  {
    image: "rostello-siyah-termos.png",
    title: "Rostello Siyah Termos",
    price: "850,00",
    salePrice: null,
    desc: "Siyah mat kaplamalı Rostello termos. Şık tasarımıyla gün boyu yanınızda.",
    cat: "Aksesuar",
  },
  {
    image: "anahtarlik-1.png",
    title: "Rostello Anahtarlık (Kırmızı)",
    price: "150,00",
    salePrice: null,
    desc: "Rostello logolu deri anahtarlık. Kırmızı renk, şık ve dayanıklı tasarım.",
    cat: "Aksesuar",
  },
  {
    image: "anahtarlik-2.png",
    title: "Rostello Anahtarlık (Mavi)",
    price: "150,00",
    salePrice: null,
    desc: "Rostello logolu deri anahtarlık. Mavi renk, şık ve dayanıklı tasarım.",
    cat: "Aksesuar",
  },
  {
    image: "anahtarlik-3.png",
    title: "Rostello Anahtarlık (Gri)",
    price: "150,00",
    salePrice: null,
    desc: "Rostello logolu deri anahtarlık. Gri renk, şık ve dayanıklı tasarım.",
    cat: "Aksesuar",
  },
  {
    image: "wood-portafiltre-sapi-e61.jpg",
    title: "Portafiltre Sapı Doğal Ahşap (E61)",
    price: "1.500,00",
    salePrice: "1.305,00",
    desc: "E61 grup başlıklarına uyumlu doğal ahşap portafiltre sapı. El işçiliği ile üretilmiştir.",
    cat: "Wood Art",
  },
  {
    image: "wood-lelit-kit.jpg",
    title: "Lelit Ahşap Kit",
    price: "4.500,00",
    salePrice: "3.960,00",
    desc: "Lelit espresso makineleri için özel ahşap kit. Portafiltre sapı ve buhar düğmesi dahil.",
    cat: "Wood Art",
  },
  {
    image: "wood-profitec-go-buhar.jpg",
    title: "Profitec Go Ahşap Buhar Düğmesi",
    price: "2.000,00",
    salePrice: "1.900,00",
    desc: "Profitec Go espresso makinesi için doğal ahşap buhar düğmesi. El yapımı.",
    cat: "Wood Art",
  },
  {
    image: "wood-gaggia-buhar.jpg",
    title: "Gaggia Classic Buhar Düğmesi",
    price: "2.000,00",
    salePrice: "1.900,00",
    desc: "Gaggia Classic espresso makinesi için doğal ahşap buhar düğmesi.",
    cat: "Wood Art",
  },
  {
    image: "wood-lelit-mara-x-kit.jpg",
    title: "Lelit Mara X v2 Ahşap Kit",
    price: "4.500,00",
    salePrice: "3.960,00",
    desc: "Lelit Mara X v2 için özel ahşap kit. Portafiltre sapı ve buhar düğmesi seti.",
    cat: "Wood Art",
  },
  {
    image: "wood-portafiltre-sapi-2.jpg",
    title: "Portafiltre Sapı Doğal Ahşap",
    price: "2.500,00",
    salePrice: "2.350,00",
    desc: "Standart portafiltrelere uyumlu doğal ahşap sap. Özenle işlenmiş ve cilalanmıştır.",
    cat: "Wood Art",
  },
  {
    image: "wood-mazzer-philos-kapak.jpg",
    title: "Öğütücü Kapağı Mazzer Philos",
    price: "2.000,00",
    salePrice: "1.860,00",
    desc: "Mazzer Philos öğütücü için doğal ahşap kapak. Makineye özel tasarlanmıştır.",
    cat: "Wood Art",
  },
  {
    image: "wood-ahşap-stand.jpg",
    title: "Ahşap Stand",
    price: "3.000,00",
    salePrice: "2.850,00",
    desc: "Doğal ahşap stand. İhtiyacınıza uygun ölçülerde ve şekillerde el yapımı.",
    cat: "Wood Art",
  },
];

export default function ImzaUrunlerPage() {
  const { addItem } = useCart();
  const [lightbox, setLightbox] = useState<{ image: string; title: string } | null>(null);
  const [detail, setDetail] = useState<ProductDetail | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <span className="text-xs tracking-[0.2em] uppercase text-[#C4724B] font-medium">Seçki</span>
        <h1 className="text-4xl sm:text-5xl font-bold text-[#1a1a1a] mt-3 mb-4">İmza Ürünler</h1>
        <p className="text-[#4a4a4a] max-w-lg mx-auto">
          Rostello imza ürünleri ve el yapımı ahşap aksesuarlar.
        </p>
      </div>

      <div className="flex justify-center gap-3 mb-12">
        <Link href="/urunler" className="px-5 py-2.5 text-xs font-medium tracking-wider uppercase transition bg-[#1a1a1a] text-white hover:bg-[#2a2a2a] hover:-translate-y-0.5">
          Tüm Kahveler
        </Link>
        <Link href="/ekipmanlar" className="px-5 py-2.5 text-xs font-medium tracking-wider uppercase transition border border-[#C4724B] text-[#C4724B] hover:bg-[#C4724B] hover:text-white hover:-translate-y-0.5">
          Ekipmanlar
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#e5e0d8]">
        {items.map((item) => (
          <div key={item.title} className="bg-white p-8 flex flex-col">
            <button
              className="aspect-[4/3] bg-[#f8f6f3] mb-6 flex items-center justify-center border border-[#e5e0d8] overflow-hidden w-full cursor-zoom-in group"
              onClick={() => setLightbox({ image: `/imza-urunler/${item.image}`, title: item.title })}
            >
              <Image
                src={`/imza-urunler/${item.image}`}
                alt={item.title}
                width={400}
                height={300}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </button>
            <span className="text-xs tracking-[0.2em] uppercase text-[#C4724B] font-medium mb-1">{item.cat}</span>
            <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">{item.title}</h3>
            <p className="text-sm text-[#4a4a4a] leading-relaxed flex-1 line-clamp-2">{item.desc}</p>
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#e5e0d8]">
              <div>
                {item.salePrice ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-[#1a1a1a]">{item.salePrice} ₺</span>
                    <span className="text-sm text-[#8c8c8c] line-through">{item.price} ₺</span>
                  </div>
                ) : (
                  <span className="text-lg font-bold text-[#1a1a1a]">{item.price} ₺</span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => addItem({ id: `imza-${item.title}`, name: item.title, price: parseFloat(item.price.replace(/\./g, "").replace(",", ".")), image: `/imza-urunler/${item.image}` })}
                  className="text-xs font-medium bg-[#C4724B] hover:bg-[#B0603A] text-white px-3 py-2 transition uppercase tracking-wider"
                >
                  Sepete Ekle
                </button>
                <button
                  onClick={() => setDetail({
                    id: `imza-${item.title}`,
                    image: `/imza-urunler/${item.image}`,
                    title: item.title,
                    price: item.price,
                    salePrice: item.salePrice,
                    desc: item.desc,
                    cat: item.cat,
                  })}
                  className="text-xs font-medium border border-[#e5e0d8] hover:border-[#C4724B] text-[#1a1a1a] px-3 py-2 transition uppercase tracking-wider"
                >
                  Detay
                </button>
              </div>
            </div>
          </div>
        ))}
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
