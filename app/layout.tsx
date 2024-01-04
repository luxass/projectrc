import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { Header } from "~/components/Header";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body>
        <Header />
        <main className="prose mt-8 flex h-dvh max-w-none flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
