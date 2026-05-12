<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:project-crucial-states -->
# KESINLIKLE BOZULMAMASI GEREKEN AYARLAR

## Header (src/components/Header.tsx)
- Header yüksekligi: `h-28 lg:h-36` (112px / 144px)
- Logo: `width={1380} height={752} className="w-28 lg:w-52 h-auto"` (asil en-boy orani korunur, rounded-full YOK)
- `rounded-full` asla logo'ya eklenmeyecek (logo 1380x752 dikdörtgen, kare degil)

## Ana Sayfa Demleme Bolumu (src/app/page.tsx)
- Arkaplan: `bg-[#ebe7e0]` (açik bej)
- Görsel: `/celsus/demleme/demleme2.png` — `opacity-15` ile hafif doku olarak
- Overlay: `from-[#ebe7e0]/80 via-[#ebe7e0]/50 to-[#ebe7e0]/80` (açik, kahverengi degil)
- Kartlar: `bg-white border border-[#e5e0d8]` (beyaz kartlar)

## Genel Kural
- Bir önceki oturumda calisan ayarlar, yeni bir özellik eklenirken ASLA bozulmayacak
- Header, homepage demleme, logo gibi kullanici tarafindan onaylanmis alanlara dokunulmayacak (yeni bir özellik eklenirken bile)
- `git diff --stat HEAD` ile degisiklik öncesi kontrol yapilacak
<!-- END:project-crucial-states -->
