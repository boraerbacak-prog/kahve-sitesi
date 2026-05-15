"use client";

import { useFormStatus } from "react-dom";

export function ConfirmDelete({ children = "Sil" }: { children?: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => { if (!confirm("Emin misiniz?")) e.preventDefault(); }}
      className="text-xs text-red-500 hover:underline disabled:opacity-50"
    >
      {pending ? "Siliniyor..." : children}
    </button>
  );
}

export function SubmitButton({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? "Kaydediliyor..." : children}
    </button>
  );
}
