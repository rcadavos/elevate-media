import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Geist_Mono, Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** Host Grotesk variable (OFL) — Latin + Latin Extended; see `app/fonts/OFL.txt`. */
const hostGrotesk = localFont({
  src: [
    {
      path: "./fonts/host-grotesk-latin-wght-normal.woff2",
      weight: "300 800",
      style: "normal",
    },
    {
      path: "./fonts/host-grotesk-latin-ext-wght-normal.woff2",
      weight: "300 800",
      style: "normal",
    },
  ],
  variable: "--font-host-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  applicationName: "elev8temedia",
  title: {
    default: "elev8temedia — Growth workspace",
    template: "%s · elev8temedia",
  },
  description:
    "elev8temedia helps e-commerce teams run Meta, SMS, and site optimization in one calm workspace — clients, pipeline, finance, and operations aligned.",
  appleWebApp: {
    capable: true,
    title: "elev8temedia",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#02090a" },
  ],
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geistMono.variable} ${hostGrotesk.variable} flex min-h-full flex-col antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
