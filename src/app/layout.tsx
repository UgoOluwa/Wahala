import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Calculator",
  description: "A simple calculator.",
  // The tab title, the icon and the install name all stay innocuous. Anyone
  // scrolling the phone's recent-apps list should see arithmetic.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#07090a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-ink text-fg antialiased">{children}</body>
    </html>
  );
}
