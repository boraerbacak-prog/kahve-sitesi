"use client";

import { useRef, useState, useEffect } from "react";

export default function StickyFilterBar({ children }: { children: React.ReactNode }) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);
  const [barHeight, setBarHeight] = useState(0);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const bar = barRef.current;
    if (!sentinel || !bar) return;

    const ro = new ResizeObserver(() => setBarHeight(bar.offsetHeight));
    ro.observe(bar);

    const observer = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { threshold: 0, rootMargin: "-112px 0px 0px 0px" }
    );
    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      ro.disconnect();
    };
  }, []);

  return (
    <>
      <div ref={sentinelRef} />
      <div
        ref={barRef}
        className={stuck ? "fixed top-28 lg:top-36 left-0 right-0 z-20 bg-page border-b border-border" : ""}
      >
        <div className="max-w-7xl mx-auto px-6 pb-4 pt-24">
          {children}
        </div>
      </div>
      {stuck && <div style={{ height: barHeight }} />}
    </>
  );
}
