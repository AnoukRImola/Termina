import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CasperProvider } from "@/lib/casper";
import { Navbar } from "@/components/docs/Navbar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Términa Escrow - Trustless B2B Payments on Casper",
  description: "A decentralized escrow infrastructure for secure B2B payments on the Casper blockchain. Create trustless invoices with automated payment holds and dispute resolution.",
  keywords: ["casper", "blockchain", "escrow", "b2b", "payments", "smart contract"],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <CasperProvider>
          <Navbar />
          <main className="pt-16">
            {children}
          </main>
        </CasperProvider>
      </body>
    </html>
  );
}
