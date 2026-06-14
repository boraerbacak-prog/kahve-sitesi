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

## Ana Sayfa Arkaplan
- Tüm sectionlar: `bg-[#f5f2ed]` (tek tip arkaplan)
- Görsel: `/celsus/demleme/demleme2.png` — `opacity-15` ile hafif doku olarak
- Overlay: `from-[#f5f2ed]/80 via-[#f5f2ed]/50 to-[#f5f2ed]/80`
- Kartlar: `bg-white border border-[#e5e0d8]` (beyaz kartlar)

## Genel Kural
- Bir önceki oturumda calisan ayarlar, yeni bir özellik eklenirken ASLA bozulmayacak
- Header, homepage demleme, logo gibi kullanici tarafindan onaylanmis alanlara dokunulmayacak (yeni bir özellik eklenirken bile)
- `git diff --stat HEAD` ile degisiklik öncesi kontrol yapilacak
<!-- END:project-crucial-states -->

<!-- BEGIN:build-command -->
# Build
- `npx next build` in project root — run after any change to ensure no type/build errors
<!-- END:build-command -->

<!-- BEGIN:tailwind-v4-rules -->
# Tailwind v4 @theme Kuralları

## `@theme inline` ZATEN CSS Değişkeni Üretir
- `@theme inline { --color-primary: #C4724B; }` hem Tailwind utility class'ı (`bg-primary`) HEM DE CSS değişkeni (`var(--color-primary)`) oluşturur.
- `:root` içinde ayrıca tanımlama YAPILMAYACAK — gereksiz ve cyclic dependency'e yol açar.
- `@theme inline` içinde `var()` kullanarak kendine referans vermek (`--color-primary: var(--color-primary)`) CSS'de cyclic dependency yaratır, değişken değerini kaybeder.

## ZORUNLU: @theme inline ÖNCE, :root SONRA

Tailwind v4 `@theme inline` her zaman `var()` self-reference üretir (`--color-primary: var(--color-primary)`). Bu yüzden:

```css
/* 1. ÖNCE: @theme inline (Tailwind utility class'ları için bridge) */
@theme inline {
  --color-primary: var(--color-primary);
  --color-primary-hover: var(--color-primary-hover);
}

/* 2. SONRA: :root (gerçek değerler, @theme'in self-reference'ını ezer) */
:root {
  --color-primary: #C4724B;
  --color-primary-hover: #B0603A;
}
```

Sıra ÖNEMLİ: `:root` MUTLAKA `@theme inline`'dan SONRA gelmeli. Aksi halde değişkenler boş kalır.

## Geçersiz Kullanım
```css
:root { --color-primary: #C4724B; }  /* önce gelirse ezilir */
@theme inline { --color-primary: var(--color-primary); }  /* sonra gelip üstüne yazar → cyclic! */
```

VEYA:
```css
@theme inline { --color-primary: #C4724B; }  /* Tailwind hex'i var()'a çevirir! */
```

Tailwind v4 `--color-primary: #C4724B` yazsan bile derlenmiş CSS'de `--color-primary: var(--color-primary)` olur. Bu yüzden `:root` bloğu ŞART.
```
<!-- END:tailwind-v4-rules -->

<!-- BEGIN:kahveni-bul-system -->
# KAHVENI BUL SISTEMI

## Karar
"Bana kahve öner" AI'a gitmez — fallback sistemi üzerinden çalışır. AI (`llama-3.1-8b-instant`) ADIM 3B'yi güvenilir şekilde takip edemediği için "bana kahve öner" isteği route.ts'deki POST fonksiyonunda tespit edilir ve AI provider'lar atlanarak doğrudan `getFallbackReply`'e yönlendirilir.

## Akış
- `route.ts:877-879`: `isKahveBulRequest` ve `hasKahveState` kontrolleri
- `route.ts:881`: AI sadece `!isKahveBulRequest && !hasKahveState` ise çalışır
- `getFallbackReply`: ilk mesajda state başlatır (`kahveStateMap`), sonraki mesajlarda state'i bulup soruları sırayla gönderir
- 4 soru: ekipman → sütlü/sade → lezzet profili → günde kaç fincan
- Son sorudan sonra `generateKahveRecommendation()` katalogdan filtreleme + öğütme + demleme ipucu üretir

## State Yönetimi
- `kahveStateMap = new Map<string | null, KahveState>()` (in-memory, server restart'ta sıfırlanır)
- Anonim kullanıcı: key=null (tüm anonimler aynı key'i paylaşır — sorun değil, tek seferlik test)
- Giriş yapmış kullanıcı: key=null başlar, thread oluşturulunca `kahveStateMap`'de null → gerçek threadId'ye migrate edilir (route.ts:909-913)
- Test bitince state silinir, sonraki mesaj AI'a gider

## Provider Zinciri
- Groq → OpenRouter (key varsa) → Gemini → OpenAI
- Groq timeout: 30000ms (eskiden 8000ms'ti, sürekli timeout yiyordu)
- OpenRouter model: `google/gemini-2.0-flash-lite-1k`

## matchQuestion () — Bilinen Sorulara Anlık Cevap
- `matchQuestion(msg, products)` questions array'ini tarar, eşleşme varsa direkt cevabı döner (AI'a gitmez)
- POST fonksiyonunda AI provider zincirinden ÖNCE çalıştırılır (`route.ts:990-1024`)
- Eşleşen sorular: V60, sütlü, meyvemsi, ekipman, abonelik, b2b, kargo, blog, teşekkür, veda, genel kahve soruları (aralarında hangi/fark/neden/ne demek)
- `getFallbackReply`'deki raw loop da `matchQuestion()` çağrısı ile değiştirildi — kod tekrarı yok

## /damak-testi Sayfası
- `src/app/damak-testi/page.tsx`: `redirect("/ai-barista")` yapar
- Tüm `[Kahveni Bul]({url}/damak-testi)` linkleri kod tabanından kaldırıldı
- Kullanıcılar "**Bana kahve öner**" yazarak testi sohbet içinde çözer
<!-- END:kahveni-bul-system -->
