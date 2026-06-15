const RESEND_KEY = process.env.RESEND_API_KEY;

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!RESEND_KEY) {
    console.log(`[EMAIL] To: ${to}, Subject: ${subject}`);
    return { success: true, mock: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: "Rostello <noreply@rostello.com>", to, subject, html }),
  });
  return res.json();
}

export async function subscriptionConfirmEmail(to: string, planName: string) {
  const url = process.env.NEXT_PUBLIC_URL || "https://rostello.com";
  return sendEmail({
    to,
    subject: "Aboneliğiniz Başladı - Rostello",
    html: `
      <div style="font-family:Arial;max-width:600px;margin:0 auto">
        <h2 style="color:#C4724B;">Hoş Geldiniz! 🎉</h2>
        <p>Kahve planınız başarıyla oluşturuldu.</p>
        <p style="background:#f5f2ed;padding:12px;border-radius:8px;">
          <strong>Plan:</strong> ${planName}<br>
        </p>
        <p>İlk teslimatınız en kısa sürede hazırlanıyor. Planınızı <a href="${url}/abonelik/yonetim" style="color:#C4724B;">hesabınızdan</a> yönetebilir, erteleyebilir veya dondurabilirsiniz.</p>
        <p style="color:#999;font-size:12px;">Rostello ekibinizden sevgilerle ☕</p>
      </div>`,
  });
}

export async function orderConfirmEmail(to: string, orderId: string) {
  return sendEmail({
    to,
    subject: `Siparişiniz Alındı #${orderId.slice(0, 8)} - Rostello`,
    html: `
      <div style="font-family:Arial;max-width:600px;margin:0 auto">
        <h2 style="color:#C4724B;">Siparişiniz Alındı! 🎉</h2>
        <p>Siparişiniz başarıyla oluşturuldu.</p>
        <p style="background:#f5f2ed;padding:12px;border-radius:8px;">
          <strong>Sipariş No:</strong> #${orderId.slice(0, 8)}<br>
          <strong>Durum:</strong> Onay Bekliyor
        </p>
        <p>Siparişinizin durumunu <a href="${process.env.NEXT_PUBLIC_URL || "https://rostello.com"}/hesabim?tab=orders">hesabınızdan</a> takip edebilirsiniz.</p>
      </div>`,
  });
}

export async function orderShippedEmail(to: string, orderId: string, trackingNumber?: string) {
  return sendEmail({
    to,
    subject: `Siparişiniz Kargoda #${orderId.slice(0, 8)} - Rostello`,
    html: `
      <div style="font-family:Arial;max-width:600px;margin:0 auto">
        <h2 style="color:#C4724B;">Siparişiniz Kargoda! 🚚</h2>
        <p>Siparişiniz kargoya verildi.</p>
        <p style="background:#f5f2ed;padding:12px;border-radius:8px;">
          <strong>Sipariş No:</strong> #${orderId.slice(0, 8)}<br>
          ${trackingNumber ? `<strong>Takip No:</strong> ${trackingNumber}<br>` : ""}
          <strong>Durum:</strong> Kargoda
        </p>
        <p>Siparişinizi <a href="${process.env.NEXT_PUBLIC_URL || "https://rostello.com"}/hesabim?tab=orders">hesabınızdan</a> takip edebilirsiniz.</p>
      </div>`,
  });
}

export async function orderDeliveredEmail(to: string, orderId: string) {
  return sendEmail({
    to,
    subject: `Siparişiniz Teslim Edildi #${orderId.slice(0, 8)} - Rostello`,
    html: `
      <div style="font-family:Arial;max-width:600px;margin:0 auto">
        <h2 style="color:#C4724B;">Siparişiniz Teslim Edildi! ✅</h2>
        <p>Siparişiniz başarıyla teslim edildi.</p>
        <p style="background:#f5f2ed;padding:12px;border-radius:8px;">
          <strong>Sipariş No:</strong> #${orderId.slice(0, 8)}<br>
          <strong>Durum:</strong> Teslim Edildi
        </p>
        <p>Ürünlerimizi beğendiyseniz <a href="${process.env.NEXT_PUBLIC_URL || "https://rostello.com"}/urunler">yeni sipariş</a> verebilirsiniz.</p>
      </div>`,
  });
}

import { prisma } from "@/lib/prisma";

export async function adminSubscriptionNotification({
  type,
  userName,
  userEmail,
  planName,
  details,
}: {
  type: "yeni" | "duraklatma" | "iptal" | "erteleme" | "hizlandirma";
  userName: string;
  userEmail: string;
  planName: string;
  details?: string;
}) {
  const titles: Record<string, string> = {
    yeni: "Yeni Abonelik",
    duraklatma: "Abonelik Duraklatıldı",
    iptal: "Abonelik İptal Edildi",
    erteleme: "Abonelik Ertelendi",
    hizlandirma: "Abonelik Hızlandırıldı",
  };
  const icons: Record<string, string> = {
    yeni: "🎉",
    duraklatma: "⏸️",
    iptal: "❌",
    erteleme: "↻",
    hizlandirma: "⚡",
  };
  try {
    await prisma.adminNotification.create({
      data: {
        type,
        title: `${icons[type]} ${titles[type]} — ${userName}`,
        message: `${userName} (${userEmail}) · ${planName}${details ? ` · ${details}` : ""}`,
      },
    });
  } catch (e) {
    console.error("Bildirim kaydedilemedi:", e);
  }
}

export async function adminOrderNotification({
  type,
  userName,
  userEmail,
  orderTotal,
  orderId,
}: {
  type: "siparis" | "siparis_iptal";
  userName: string;
  userEmail: string;
  orderTotal: number;
  orderId: string;
}) {
  const titles: Record<string, string> = {
    siparis: "🛒 Yeni Sipariş",
    siparis_iptal: "❌ Sipariş İptal Edildi",
  };
  try {
    await prisma.adminNotification.create({
      data: {
        type,
        title: `${titles[type]} — ${userName}`,
        message: `${userName} (${userEmail}) · ${orderTotal.toFixed(2)} TL · #${orderId.slice(0, 8)}`,
      },
    });
  } catch (e) {
    console.error("Bildirim kaydedilemedi:", e);
  }
}

export async function deliveryShippedEmail(to: string, deliveryId: string) {
  return sendEmail({
    to,
    subject: `Teslimatınız Kargoda #${deliveryId.slice(0, 8)} - Rostello`,
    html: `<p>Teslimatınız kargoya verildi.</p><p>Takip için hesabınızı ziyaret edin.</p>`,
  });
}

export async function stockNotificationEmail(to: string, productName: string, productSlug: string) {
  const url = process.env.NEXT_PUBLIC_URL || "https://rostello.com";
  return sendEmail({
    to,
    subject: `${productName} Stoklara Geri Döndü! - Rostello`,
    html: `
      <div style="font-family:Arial;max-width:600px;margin:0 auto">
        <h2 style="color:#C4724B;">Stoklara Geri Döndü! 🎉</h2>
        <p>Merhaba,</p>
        <p><strong>${productName}</strong> tekrar stoklarımızda! Siz de bu kahveyi kaçırmayın.</p>
        <p style="text-align:center;margin:24px 0;">
          <a href="${url}/urunler/${productSlug}" style="display:inline-block;background:#C4724B;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">
            Hemen İncele
          </a>
        </p>
        <p style="color:#999;font-size:12px;">Rostello ekibinizden sevgilerle ☕</p>
      </div>`,
  });
}

export async function peakReachedEmail(to: string, productName: string, productSlug: string) {
  const url = process.env.NEXT_PUBLIC_URL || "https://rostello.com";
  return sendEmail({
    to,
    subject: `✨ ${productName} Zirve Döneminde! - Rostello`,
    html: `
      <div style="font-family:Arial;max-width:600px;margin:0 auto">
        <h2 style="color:#10B981;">Zirve Dönemine Hoş Geldiniz! ✨</h2>
        <p>Merhaba,</p>
        <p><strong>${productName}</strong> en iyi içim zamanına ulaştı! Tüm aroma notaları, asidite ve gövde kusursuz uyum içinde.</p>
        <p>Bu kahvenin en dengeli ve canlı halini deneyimlemek için harika bir zaman.</p>
        <p style="text-align:center;margin:24px 0;">
          <a href="${url}/urunler/${productSlug}" style="display:inline-block;background:#10B981;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">
            Hemen İncele
          </a>
        </p>
        <p style="color:#999;font-size:12px;">Rostello ekibinizden sevgilerle ☕</p>
      </div>`,
  });
}

export async function maturityReachedEmail(to: string, productName: string, productSlug: string) {
  const url = process.env.NEXT_PUBLIC_URL || "https://rostello.com";
  return sendEmail({
    to,
    subject: `🍂 ${productName} Olgunluk Döneminde - Rostello`,
    html: `
      <div style="font-family:Arial;max-width:600px;margin:0 auto">
        <h2 style="color:#F59E0B;">Olgunluk Dönemi 🍂</h2>
        <p>Merhaba,</p>
        <p><strong>${productName}</strong> olgunluk evresine girdi. Canlı aromalar yerini daha yumuşak, tatlı ve dengeli bir karaktere bırakıyor.</p>
        <p>Zirve geride kaldı ama kahve hâlâ keyifli — farklı bir profil keşfetmek için güzel bir fırsat.</p>
        <p style="text-align:center;margin:24px 0;">
          <a href="${url}/urunler/${productSlug}" style="display:inline-block;background:#F59E0B;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">
            Hemen İncele
          </a>
        </p>
        <p style="color:#999;font-size:12px;">Rostello ekibinizden sevgilerle ☕</p>
      </div>`,
  });
}

export async function freshnessEndedEmail(to: string, productName: string) {
  const url = process.env.NEXT_PUBLIC_URL || "https://rostello.com";
  return sendEmail({
    to,
    subject: `${productName} Tazelik Döngüsü Tamamlandı - Rostello`,
    html: `
      <div style="font-family:Arial;max-width:600px;margin:0 auto">
        <h2 style="color:#9CA3AF;">Tazelik Döngüsü Tamamlandı</h2>
        <p>Merhaba,</p>
        <p><strong>${productName}</strong> tazelik döngüsünü tamamladı. Bu kahvenin en iyi içim dönemi artık geride kaldı.</p>
        <p>Yeni kavrumları ve güncel tazelik durumlarını görmek için sitemizi ziyaret edebilirsiniz.</p>
        <p style="text-align:center;margin:24px 0;">
          <a href="${url}/urunler" style="display:inline-block;background:#C4724B;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">
            Yeni Kahveleri Keşfet
          </a>
        </p>
        <p style="color:#999;font-size:12px;">Rostello ekibinizden sevgilerle ☕</p>
      </div>`,
  });
}
