"use client";

import { useEffect, useRef } from "react";

export default function SectionAudio({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const interactRef = useRef(false);

  useEffect(() => {
    if (!src) return;

    const audio = audioRef.current;
    const el = sectionRef.current;
    if (!audio || !el) return;

    const playIfVisible = () => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight * 0.8 && rect.bottom > 0;
      if (isVisible) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (interactRef.current || startedRef.current) {
            audio.currentTime = 0;
            audio.play().catch(() => {});
          }
        } else {
          audio.pause();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      audio.pause();
    };
  }, [src]);

  useEffect(() => {
    if (!src || interactRef.current) return;

    const handler = () => {
      interactRef.current = true;
      const audio = audioRef.current;
      const el = sectionRef.current;
      if (audio && el) {
        const rect = el.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight * 0.8 && rect.bottom > 0;
        if (isVisible) {
          startedRef.current = true;
          audio.currentTime = 0;
          audio.play().catch(() => {});
        }
      }
      document.removeEventListener("click", handler);
      document.removeEventListener("scroll", handler);
      document.removeEventListener("touchstart", handler);
      document.removeEventListener("keydown", handler);
    };

    const tryPlay = () => {
      const audio = audioRef.current;
      const el = sectionRef.current;
      if (audio && el) {
        const rect = el.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight * 0.8 && rect.bottom > 0;
        if (isVisible) {
          audio.currentTime = 0;
          audio.play().then(() => {
            startedRef.current = true;
            interactRef.current = true;
          }).catch(() => {
            document.addEventListener("click", handler);
            document.addEventListener("scroll", handler);
            document.addEventListener("touchstart", handler);
            document.addEventListener("keydown", handler);
          });
        }
      }
    };

    tryPlay();

    return () => {
      document.removeEventListener("click", handler);
      document.removeEventListener("scroll", handler);
      document.removeEventListener("touchstart", handler);
      document.removeEventListener("keydown", handler);
    };
  }, [src]);

  if (!src) return null;

  return (
    <div ref={sectionRef}>
      <audio ref={audioRef} src={src} loop />
    </div>
  );
}
