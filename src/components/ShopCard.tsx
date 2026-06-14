"use client";

import RevealOnScroll from "./RevealOnScroll";

export default function ShopCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return <RevealOnScroll delay={delay}>{children}</RevealOnScroll>;
}
