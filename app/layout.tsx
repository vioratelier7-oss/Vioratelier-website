import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SITE_URL } from "@/lib/env";
import "./globals.css";

// Self-hosted variable fonts (latin subset): no build-time or runtime dependency on Google's servers.
const cormorant = localFont({
  src: [
    { path: "./fonts/CormorantGaramond-normal.woff2", weight: "300 700", style: "normal" },
    { path: "./fonts/CormorantGaramond-italic.woff2", weight: "300 700", style: "italic" },
  ],
  variable: "--font-cormorant",
  display: "swap",
  adjustFontFallback: "Times New Roman",
  fallback: ["Georgia", "serif"],
});
const manrope = localFont({ src: "./fonts/Manrope-normal.woff2", weight: "200 800", variable: "--font-manrope", display: "swap", fallback: ["system-ui", "sans-serif"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "VIOR ATELIER · Crafting Digital Experiences", template: "%s · VIOR ATELIER" },
  applicationName: "VIOR ATELIER",
};

export const viewport: Viewport = { themeColor: "#F6F4EF", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${cormorant.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
