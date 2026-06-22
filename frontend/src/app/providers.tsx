"use client";

import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {/* Toast notifications (added UX layer). Styled to the brand. */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: "'DM Sans', sans-serif",
            borderRadius: "12px",
            border: "1px solid var(--border)",
          },
        }}
      />
    </>
  );
}
