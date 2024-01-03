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
      <head>
        <Script id="theme-toggle" strategy="afterInteractive">
          {/* js */`
            const button = document.querySelector("#theme-toggle");
            if (button) {
              button.addEventListener("click", () => {
                const isDark = document.documentElement.classList.contains("dark");

                if (isDark) {
                  document.documentElement.classList.remove("dark");
                  localStorage.setItem("theme", "light");
                } else {
                  document.documentElement.classList.add("dark");
                  localStorage.setItem("theme", "dark");
                }
              });
            }
          `}
        </Script>
        <script dangerouslySetInnerHTML={{
          __html: /* js */`!function(){const e=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches,t=localStorage.getItem("theme")||"auto";("dark"===t||e&&"light"!==t)&&document.documentElement.classList.toggle("dark",!0)}();`,
        }}
        />
      </head>
      <body>
        <Header />
        <main className="prose mt-8 flex max-w-none flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
