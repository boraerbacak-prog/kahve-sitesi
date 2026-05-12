export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[EMAIL] Would send to ${options.to}: ${options.subject}`);
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Rostello <noreply@rostello.com>",
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    });
    return res.ok;
  } catch (err) {
    console.error("Email send error:", err);
    return false;
  }
}

export function subscriptionConfirmEmail(name: string, planName: string, price: number): string {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h1 style="color: #C4724B;">Hoş Geldin ${name}! ☕</h1>
      <p><strong>${planName}</strong> aboneliğin başarıyla oluşturuldu.</p>
      <p style="font-size: 24px; color: #1a1a1a;">${price} ₺ / ay</p>
      <p>İlk teslimatın 24 saat içinde kavrulup kargoya verilecek. Taze kahveni 2-4 iş günü içinde kapında bulacaksın.</p>
      <hr style="border: none; border-top: 1px solid #e5e0d8;" />
      <p style="color: #8c8c8c; font-size: 12px;">
        Aboneliğini yönet: <a href="http://localhost:3000/abonelik/yonetim">http://localhost:3000/abonelik/yonetim</a>
      </p>
    </div>
  `;
}

export function deliveryReminderEmail(name: string, daysUntilDelivery: number): string {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #C4724B;">Yeni Teslimat Yaklaşıyor ☕</h2>
      <p>Merhaba ${name},</p>
      <p>Bir sonraki kahve teslimatına <strong>${daysUntilDelivery} gün</strong> kaldı.</p>
      <p>Kahven sipariş üzerine kavrulacak, böylece en taze halinde eline ulaşacak.</p>
      <p style="color: #8c8c8c; font-size: 12px;">
        Teslimatı ertelemek veya değiştirmek için: <a href="http://localhost:3000/abonelik/yonetim">Aboneliğimi Yönet</a>
      </p>
    </div>
  `;
}

export function deliveryShippedEmail(name: string, planName: string, trackingUrl?: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #C4724B;">Kargon Yolda! 🚚</h2>
      <p>Merhaba ${name},</p>
      <p><strong>${planName}</strong> paketin kargoya verildi! Taze kavrulmuş kahven seni bekliyor.</p>
      ${trackingUrl ? `<p>Takip et: <a href="${trackingUrl}">${trackingUrl}</a></p>` : ""}
      <p>Paket eline ulaştığında AI Barista'ya değerlendirme yapmayı unutma. ☕</p>
    </div>
  `;
}
