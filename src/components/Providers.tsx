"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/lib/cart-context";
import { ChatProvider } from "@/lib/chat-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        <ChatProvider>
          {children}
        </ChatProvider>
      </CartProvider>
    </SessionProvider>
  );
}
