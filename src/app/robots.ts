export default function robots() {
  const base = process.env.NEXT_PUBLIC_URL || "https://rostello.com";
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/hesabim", "/sepet"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
