import type { Metadata } from "next";
import { Quicksand, Rubik } from "next/font/google";
import "./globals.css";
import { resolveLang } from "@/lib/lang";
import { t } from "@/lib/i18n";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const lang = await resolveLang();
  const title = t(lang, "site_title");
  const description = t(lang, "site_description");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: lang === "tr" ? "tr_TR" : "en_US",
      siteName: "App Kutusu",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const lang = await resolveLang();
  return (
    <html
      lang={lang}
      className={`${quicksand.variable} ${rubik.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
      </head>
      <body className="bg-surface text-on-surface min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
