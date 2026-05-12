import Link from "next/link";
import { notFound } from "next/navigation";

interface Technique {
  slug: string;
  title: string;
  description: string;
  stats?: { label: string; value: string }[];
  materials?: string[];
  steps?: string[][];
  tips?: string[];
  note?: string;
  extraSections?: { title: string; content: string }[];
}

const techniques: Technique[] = [
  {
    slug: "filtre-kahve",
    title: "Filtre Kahve",
    description:
      "Filtre Kahve Makineleri tüm ofislerin ve mutfakların vazgeçilmezidir. Bu küçük ve pratik makine ile kolayca filtre kahve demleyebilirsiniz. Filtre kahve, yaklaşık altı dakikada bir litre kahveyi demleme kapasitesine sahip, her an günlük filtrenizi hazırlamanın son derece tutarlı ve inanılmaz derecede kolay bir yoludur.",
    stats: [
      { label: "Doz", value: "60 g" },
      { label: "Su Miktarı", value: "1000 g" },
      { label: "Su Sıcaklığı", value: "Oda Sıcaklığı" },
      { label: "Demlenme Süresi", value: "5:30-6:00 DK" },
    ],
    materials: [
      "Filtre Kahve Makinesi",
      "Tartı",
      "Kronometre",
      "Filtre Kağıdı",
      "Değirmen",
      "Termos",
    ],
    steps: [
      [
        "60 g kahveyi tartarak hazırla ve orta kalınlıkta öğüt.",
        "Filtre kağıdını cihaza yerleştir ve su haznesine 150-200 g su ekleyerek cihazı boş olarak çalıştır. Bu işlem, ekipmanı da ısıtmış olacaksın.",
      ],
      [
        "Demleme öncesi karaf içerisindeki suyu boşaltmayı unutma. Bu suyu dökmek yerine daha sonra ekipmanını temizlemek için kullanabilirsin.",
        "Öğüttüğün kahveyi sepete ekle ve düz bir kahve yatağı elde etmek için sepeti hafifçe salla.",
      ],
      [
        "Tartarak hazırladığın 1000 g suyu, cihazın su haznesine ekle. Su akışı başladığında kronometreni başlatmayı unutma.",
        "Demleme sonunda toplam süreyi not etmeyi unutma! Bir sonraki demlemede yol gösterici olacaktır.",
      ],
      [
        "Cihazın ısıtıcı plakası var ise karafta bekleyecek kahve hızla acılaşacaktır. Kahveyi bir termosa aktararak tazeliğini 1 saate kadar korumasını sağlayabilirsin.",
      ],
    ],
  },
  {
    slug: "espresso",
    title: "Espresso",
    description:
      "Espresso, metal bir filtre sepetine sıkıştırılmış ince öğütülmüş kahvenin üzerine 9 bar basınçla sıcak su gönderilerek hazırlanan yoğun ve konsantre bir kahve içeceğidir. Üzerinde oluşan altın sarısı krema tabakası, iyi bir espressonun en önemli göstergesidir. Tek başına tüketilebileceği gibi sütlü kahvelerin de temelini oluşturur.",
    stats: [
      { label: "Doz", value: "18 g" },
      { label: "Su Miktarı", value: "36 g" },
      { label: "Su Sıcaklığı", value: "92°C" },
      { label: "Demlenme Süresi", value: "25-30 SN" },
    ],
    materials: [
      "Espresso Makinesi",
      "Tartı",
      "Kronometre",
      "Tamper",
      "Değirmen",
      "Espresso Fincanı",
    ],
    steps: [
      [
        "18 g kahveyi ince ayarda (espresso inceliğinde) öğüt.",
        "Portafiltreyi çıkar, iyice kurula ve öğüttüğün kahveyi sepete boşalt.",
      ],
      [
        "Kahveyi parmaklarınla hafifçe yay ve tamper ile 15-20 kg basınç uygulayarak sıkıştır.",
        "Portafiltrenin kenarlarında kalan kahve kalıntılarını temizle.",
      ],
      [
        "Grup başlığından 1-2 saniye su akıtarak sıcaklık stabilizasyonu yap.",
        "Portafiltreyi makineye tak ve hemen çekime başla. Kronometreni aynı anda çalıştır.",
      ],
      [
        "25-30 saniye içerisinde 36 g espresso çekimi tamamlandığında akışı durdur.",
        "Oluşan kremanın rengini ve dokusunu gözlemle. Altın sarısı, kadifemsi bir krema ideal espressonun işaretidir.",
      ],
    ],
    tips: [
      "Espresso çekim süresi çok kısaysa öğütümü inceltin, çok uzunsa kabalaştırın.",
      "Fincanları önceden ısıtmak espressonun sıcaklığını korumasına yardımcı olur.",
    ],
  },
  {
    slug: "french-press",
    title: "French Press",
    description:
      "1800'lü yıllarda Fransızlar tarafından icat edilen French Press, kahve demlemenin en basit ve en eski yöntemlerinden biridir. Kalın öğütülmüş kahve çekirdeklerinin sıcak suda belirli bir süre beklemesi ve ardından metal filtre ile preslenmesi prensibine dayanır. Metal filtre sayesinde kahvenin doğal yağları korunur ve dolgun gövdeli, zengin bir fincan elde edilir.",
    stats: [
      { label: "Doz", value: "30 g" },
      { label: "Su Miktarı", value: "500 g" },
      { label: "Su Sıcaklığı", value: "94°C" },
      { label: "Demlenme Süresi", value: "4:00 DK" },
    ],
    materials: [
      "French Press",
      "Tartı",
      "Kronometre",
      "Tahta Kaşık",
      "Değirmen",
      "Fincan",
    ],
    steps: [
      [
        "30 g kahveyi kalın (french press) ayarda öğüt.",
        "French Press'in haznesini sıcak suyla ısıt ve ardından suyu boşalt.",
      ],
      [
        "Öğüttüğün kahveyi hazneye boşalt ve hazneyi hafifçe sallayarak kahve yatağını düzle.",
        "500 g sıcak suyu (94°C) kahvenin üzerine yavaşça dök. Tüm kahvenin suyla temas ettiğinden emin ol.",
      ],
      [
        "Tahta kaşıkla hafifçe karıştır, üstte biriken köpüğü ve kabuğu kırmak için.",
        "Kapağını kapat ama pistonu çekme. 4 dakika boyunca bekle.",
      ],
      [
        "4 dakika sonunda pistonu yavaşça aşağıya doğru it.",
        "Kahveyi hemen fincana aktar. French Press'te bekleyen kahve acılaşmaya devam eder.",
      ],
    ],
  },
  {
    slug: "moka-pot",
    title: "Moka Pot",
    description:
      "Espresso, filtre kahve gibi yoğun bir deneyim sunan Moka Pot, ocak üstünde kullanılan İtalyan usulü bir kahve makinesidir. Üç odacıklı yapısı sayesinde buhar basıncı ile suyu kahveden geçirerek güçlü ve aromatik bir kahve hazırlar. İtalyan evlerinin vazgeçilmez bir parçasıdır ve geleneksel yöntemlerle kahve keyfi arayanlar için idealdir.",
    stats: [
      { label: "Doz", value: "17 g" },
      { label: "Su Miktarı", value: "200 g" },
      { label: "Su Sıcaklığı", value: "Oda Sıcaklığı" },
      { label: "Demlenme Süresi", value: "3:00-4:00 DK" },
    ],
    materials: [
      "Moka Pot",
      "Tartı",
      "Kronometre",
      "Değirmen",
      "Ocak",
      "Fincan",
    ],
    steps: [
      [
        "Alt haznene oda sıcaklığında suyu dolum çizgisine kadar doldur.",
        "Filtre sepetine 17 g kahveyi orta-ince ayarda öğüt ve sepeti doldur (üstüne bastırma).",
      ],
      [
        "Sepeti alt hazneye yerleştir ve üst hazneyi sıkıca vidala.",
        "Ocağı orta-düşük ateşe ayarla ve Moka Pot'u ocağa yerleştir.",
      ],
      [
        "Birkaç dakika içinde kahve üst hazneye çıkmaya başlayacak. Fokurdama sesi duyulduğunda ocağı kapat.",
        "Soğuk su dolu bir kaba Moka Pot'un altını hafifçe dokundurarak çekimi durdurabilirsin.",
      ],
      [
        "Kahveyi fincana aktar ve birkaç saniye karıştır. Sıcak veya sütlü olarak servis edebilirsin.",
      ],
    ],
    note: "Moka Pot ile yapılan kahve yoğun ve konsantredir. Espresso gibi düşünüp üzerine sıcak süt ekleyerek Americano veya latte benzeri içecekler hazırlayabilirsiniz.",
  },
  {
    slug: "hario-v60",
    title: "Hario V60",
    description:
      "Evde sabah kahvenizi hazırlamanın en keyifli yollarından biri olan Hario V60, Japonya'dan dünyaya yayılmış bir elle demleme yöntemidir. 60 derecelik V şeklindeki yapısı ve spiral kaburgaları sayesinde suyun kahveyle optimum sürede temas etmesini sağlar. Kağıt filtre kullanımı sayesinde temiz ve berrak, hafif gövdeli, aromatik bir fincan sunar.",
    stats: [
      { label: "Doz", value: "15 g" },
      { label: "Su Miktarı", value: "250 g" },
      { label: "Su Sıcaklığı", value: "94°C" },
      { label: "Demlenme Süresi", value: "2:30-3:00 DK" },
    ],
    materials: [
      "Hario V60",
      "V60 Kağıt Filtre",
      "Tartı",
      "Kronometre",
      "Kettle (İnce Uçlu)",
      "Değirmen",
      "Fincan veya Karaf",
    ],
    steps: [
      [
        "15 g kahveyi orta-ince (şeker tanesi) ayarda öğüt.",
        "Filtre kağıdını V60'a yerleştir ve sıcak suyla ıslatarak kağıt tadını gider, aynı zamanda V60'ı ve altındaki kabı ısıt.",
      ],
      [
        "Kullandığın suyu boşalt ve öğüttüğün kahveyi filtreye dök. Hafifçe sallayarak yüzeyi düzle.",
        "Kronometreyi başlat ve 50 g suyu (94°C) dairesel hareketlerle kahvenin üzerine dök. 30 saniye bekle (blooming).",
      ],
      [
        "30. saniyede 100 g suya ulaşana kadar yavaşça dairesel hareketlerle su ekleme yap.",
        "1:15 civarında 200 g toplam suya ulaşana kadar aynı şekilde su eklemeye devam et.",
      ],
      [
        "2:00-2:30 arasında 250 g toplam suya ulaşana kadar kalan suyu ekle.",
        "Tüm su filtreden geçtikten sonra (toplam ~3:00) V60'ı çıkar ve kahveni servis et.",
      ],
    ],
    tips: [
      "Su dökme hızınız ve deseniniz tutarlı olmalıdır. Çok hızlı dökmek under-extraction'a, çok yavaş ise over-extraction'a yol açar.",
      "Kettle'ın su sıcaklığını her aşamada kontrol edin. İdeal aralık 92-96°C arasıdır.",
    ],
  },
  {
    slug: "aeropress",
    title: "Aeropress",
    description:
      "Taşınabilir ve hafif yapısıyla seyahat severlerin favorisi olan Aeropress, hava basıncı prensibiyle çalışan modern bir demleme aracıdır. Kısa sürede (yaklaşık 1-2 dakika) temiz ve tortusuz bir kahve hazırlamanızı sağlar. Farklı demleme parametreleriyle denemelere açık yapısı sayesinde, her seferinde yeni tatlar keşfetmenize olanak tanır.",
    stats: [
      { label: "Doz", value: "14 g" },
      { label: "Su Miktarı", value: "220 g" },
      { label: "Su Sıcaklığı", value: "90°C" },
      { label: "Demlenme Süresi", value: "1:30 DK" },
    ],
    materials: [
      "Aeropress",
      "Aeropress Filtre Kağıdı",
      "Tartı",
      "Kronometre",
      "Karıştırma Çubuğu",
      "Değirmen",
      "Fincan",
    ],
    steps: [
      [
        "14 g kahveyi orta-ince ayarda öğüt.",
        "Filtre kağıdını filtre kapağına yerleştir ve sıcak suyla ıslat.",
      ],
      [
        "Aeropress'i ters çevir (inverted method) veya standart yöntemi kullan. Bu tarif için standart yöntem anlatılmıştır.",
        "Kahveyi Aeropress haznesine dök ve 220 g suyu (90°C) kahvenin üzerine dök.",
      ],
      [
        "Karıştırma çubuğu ile 10 saniye boyunca yavaşça karıştır.",
        "1:00 dakika boyunca bekle.",
      ],
      [
        "1:00 dolduğunda filtre kapağını tak ve Aeropress'i ters çevirerek fincanın üzerine yerleştir.",
        "15-20 saniye boyunca yavaşça bastırarak kahveyi fincana aktar. Tıslama sesi duyulduğunda dur.",
      ],
    ],
    tips: [
      "Standart yöntemde kahve damlamaya başlamadan önce basınç uygulamayın.",
      "Aeropress ile denemeler yapın: kahve miktarını, su sıcaklığını ve demleme süresini değiştirerek kendi favori reçetenizi oluşturabilirsiniz.",
    ],
  },
  {
    slug: "turk-kahvesi",
    title: "Türk Kahvesi",
    description:
      "Türk Kahvesi, Espresso gibi yoğun ve köpüklü ancak kendine özgü pişirme yöntemiyle dünya kahve kültüründe ayrı bir yere sahiptir. İnce öğütülmüş kahvenin cezvede su ve isteğe bağlı şekerle birlikte kısık ateşte pişirilmesiyle hazırlanır. Telvesiyle birlikte sunulan bu kadim lezzet, yanında bir bardak su ve lokumla ikram edilir.",
    stats: [
      { label: "Doz", value: "7 g" },
      { label: "Su Miktarı", value: "70 ml" },
      { label: "Su Sıcaklığı", value: "60°C" },
      { label: "Demlenme Süresi", value: "2:00 DK" },
    ],
    materials: [
      "Cezve",
      "Tartı",
      "Kronometre",
      "Değirmen",
      "Tahta Kaşık",
    ],
    steps: [
      [
        "Reçeten doğrultusunda gerekli miktarı tart ve ince ayarda çek.",
        "Cezveni tartıya yerleştir, darasını al. Reçetenin gerektirdiği miktarda 60°C'ye ısıttığın suyu cezveye ekle.",
      ],
      [
        "Kahveni ekle ve tahta bir kaşık ile karıştır. Cezvenin iç yüzeyine zarar vermemek için tahta kaşık kullanman önemli!",
        "Cezveyi ocağa yerleştir ve kronometreni başlat.",
      ],
      [
        "Demlemenin ilk aşamasında yüksek sonrasında ise kademeli olarak azalan ısıya ihtiyacın var. Bunu ocağın gaz ayarı ile sağlıyor olacaksın. Bu aşamaları belirlemek için cezveyi gözlemlemen yeterli.",
        "Başlangıçta cezve içerisinde koyu renkli olan karışım, kenarlardan itibaren açık sarı renkli krema ile kaplanmaya başlayacaktır. Bu nokta ocağı kısman gereken zaman. Yaklaşık olarak 40-60 saniyede bu noktaya gelmelisin.",
      ],
      [
        "Yüzey tamamen krema ile kaplanmış ve kahve cezve içerisinde yavaş yavaş yükseliyor olmalı. Cezvenin üst kenarına yaklaşırken ocağı kapat. Bu aşama ise yaklaşık olarak 30-60 saniye arasında olmalı.",
        "Kahveni hızlıca fincana aktar. Keyfini çıkarmadan önce 2 dakika beklemeni öneririz.",
      ],
    ],
  },
];

export default async function DemlemeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const technique = techniques.find((t) => t.slug === slug);
  if (!technique) notFound();

  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      <Link
        href="/demleme"
        className="inline-flex items-center gap-1 text-sm text-[#C4724B] hover:text-[#B0603A] transition mb-8"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Demleme Teknikleri
      </Link>

      <div className="flex flex-col md:flex-row gap-10 mb-12">
        <div className="flex-1">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#1a1a1a] mb-6">{technique.title}</h1>
          <p className="text-[#4a4a4a] leading-relaxed">{technique.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {technique.stats?.map((stat) => (
          <div key={stat.label} className="bg-[#f8f6f3] p-4 text-center rounded">
            <span className="text-[10px] tracking-[0.2em] uppercase text-[#8c8c8c] font-medium block mb-1">
              {stat.label}
            </span>
            <span className="text-lg font-bold text-[#1a1a1a]">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="mb-12">
        <h2 className="text-sm tracking-[0.2em] uppercase text-[#C4724B] font-medium mb-4">Malzemeler</h2>
        <div className="flex flex-wrap gap-2">
          {technique.materials?.map((material) => (
            <span
              key={material}
              className="px-3 py-1.5 bg-[#f8f6f3] text-sm text-[#4a4a4a] rounded"
            >
              {material}
            </span>
          ))}
        </div>
      </div>

      {technique.extraSections?.map((section) => (
        <div key={section.title} className="mb-8">
          <h2 className="text-xl font-bold text-[#1a1a1a] mb-3">{section.title}</h2>
          <p className="text-[#4a4a4a] leading-relaxed">{section.content}</p>
        </div>
      ))}

      {technique.tips && (
        <div className="mb-12">
          <h2 className="text-sm tracking-[0.2em] uppercase text-[#C4724B] font-medium mb-4">Bunlara Dikkat!</h2>
          <ul className="space-y-2">
            {technique.tips.map((tip, i) => (
              <li key={i} className="flex gap-2 text-sm text-[#4a4a4a] leading-relaxed">
                <span className="text-[#C4724B] shrink-0 mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {technique.steps && (
        <div>
          <h2 className="text-sm tracking-[0.2em] uppercase text-[#C4724B] font-medium mb-6">Adımlar</h2>
        <div className="space-y-6">
          {technique.steps.map((stepGroup, i) => (
            <div key={i} className="flex gap-6">
              <span className="text-lg font-bold text-[#C4724B] shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-[#f8f6f3]">
                {i + 1}
              </span>
              <div className="space-y-3 flex-1">
                {stepGroup.map((step, j) => (
                  <p key={j} className="text-sm text-[#4a4a4a] leading-relaxed">{step}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      {technique.note && (
        <div className="mt-8 p-4 bg-[#f8f6f3] rounded text-sm text-[#4a4a4a] leading-relaxed">
          <span className="font-medium text-[#1a1a1a]">Not: </span>
          {technique.note}
        </div>
      )}
    </div>
  );
}
