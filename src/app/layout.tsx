import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Slide JSON Studio",
  description:
    "Visual JSON slide renderer and editor for rapidly building, inspecting, and exporting production-ready slide structures.",
  keywords: [
    "slide json",
    "json renderer",
    "slide editor",
    "canva to json",
    "presentation builder",
  ],
  openGraph: {
    title: "Slide JSON Studio",
    description:
      "Render, inspect, and edit slide JSON with real-time visual preview and structure-aware controls.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Slide JSON Studio",
    description:
      "Render, inspect, and edit slide JSON with real-time visual preview and structure-aware controls.",
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
