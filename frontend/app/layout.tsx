import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ToastProvider } from "./contexts/ToastContext";
import ToastContainer from "./components/Toast";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Coral Copilot | Universal Developer Agent",
    template: "%s | Coral Copilot"
  },
  description: "Talk to your entire dev stack. No tabs. No dashboards. Just your voice. Coral Copilot queries 90+ SaaS APIs with federated SQL.",
  keywords: ["AI Developer Agent", "Voice UI", "Coral SQL", "Federated SQL", "Developer Tools", "DataFusion", "Next.js"],
  authors: [{ name: "Coral Team" }],
  creator: "Coral Team",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://coralcopilot.dev",
    title: "Coral Copilot | Universal Developer Agent",
    description: "Talk to your entire dev stack. No tabs. No dashboards. Just your voice. Coral Copilot queries 90+ SaaS APIs with federated SQL.",
    siteName: "Coral Copilot",
    images: [{
      url: "https://coralcopilot.dev/og-image.jpg",
      width: 1200,
      height: 630,
      alt: "Coral Copilot Interface",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Coral Copilot | Universal Developer Agent",
    description: "Talk to your entire dev stack. No tabs. No dashboards. Just your voice.",
    images: ["https://coralcopilot.dev/og-image.jpg"],
    creator: "@withcoral",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <ToastProvider>
          {children}
          <ToastContainer />
        </ToastProvider>
      </body>
    </html>
  );
}
