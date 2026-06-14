"use client";
import { useEffect, useState } from "react";

const CSS_MAP: Record<string, string> = {
  primary_color: "--color-primary",
  accent_color: "--color-primary-light",
  bg_color: "--color-bg",
  text_color: "--color-heading",
  text_muted: "--color-muted",
  border_color: "--color-border",
  header_bg: "header-bg", // custom inline
};

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(r => r.json())
      .then(d => {
        if (!d.settings) { setReady(true); return; }
        const s = d.settings;
        const root = document.documentElement;
        if (s.primary_color) root.style.setProperty("--color-primary", s.primary_color);
        if (s.accent_color) root.style.setProperty("--color-primary-light", s.accent_color);
        if (s.bg_color) root.style.setProperty("--color-page", s.bg_color);
        if (s.text_color) root.style.setProperty("--color-heading", s.text_color);
        if (s.text_muted) root.style.setProperty("--color-muted", s.text_muted);
        if (s.border_color) root.style.setProperty("--color-border", s.border_color);
        setReady(true);
      })
      .catch(() => setReady(true));
  }, []);

  // Render children immediately but suppress flash by defaulting to CSS variables
  return <>{children}</>;
}
