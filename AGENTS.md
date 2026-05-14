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
