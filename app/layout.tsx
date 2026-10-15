import type { Metadata } from "next";
import localFont from "next/font/local";
import { StoreProvider } from "@/components/store";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { siteConfig } from "@/lib/config";
import "./globals.css";
const manrope = localFont({
  src: "../public/fonts/manrope-latin.woff2",
  variable: "--font-manrope",
  display: "swap",
  weight: "200 800",
});
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.origin),
  title: {
    default: "HORISONY — A new perspective on the everyday",
    template: "%s | HORISONY",
  },
  description:
    "Contemporary essentials. Considered details. Explore an original collection of T-shirts and jackets by HORISONY.",
  openGraph: {
    type: "website",
    siteName: "HORISONY",
    title: "HORISONY — The shape of what’s next.",
    description: "Contemporary essentials. Considered details.",
    images: [
      {
        url: "/images/horizon-bomber-jacket-front.webp",
        width: 1200,
        height: 1500,
      },
    ],
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={manrope.variable}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <StoreProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
