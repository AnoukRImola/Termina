import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CasperProvider } from "@/lib/casper";
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
  title: "Termina - Invoice Management with Guaranteed Payments",
  description: "Stop chasing payments. Termina ensures your invoices get paid on time with conditional payment holds and automated release workflows.",
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
        <CasperProvider>
          {children}
        </CasperProvider>
      </body>
    </html>
  );
}
