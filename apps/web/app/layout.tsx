import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { RegisterSW } from "@/components/pwa/register-sw";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LegalIA — Asistente IA para Abogados Argentinos",
  description:
    "Generador de escritos judiciales y asistente legal con inteligencia artificial. Especializado en derecho argentino.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LegalIA",
    startupImage: "/icons/apple-touch-icon.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${dmSerif.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="theme-color" content="#1e3a5f" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png" />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <RegisterSW />
        <InstallPrompt />
        <Toaster
          position="top-right"
          toastOptions={{
            className: "!rounded-xl !border-slate-200 !shadow-lg",
          }}
        />
      </body>
    </html>
  );
}
