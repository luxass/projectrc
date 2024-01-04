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
        <script
          type="module"
          dangerouslySetInnerHTML={{
            __html: /* js */`

  function run() {
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const setting = localStorage.getItem("theme") || "auto";
    if (setting === "dark" || (prefersDark && setting !== "light")) {
      document.documentElement.classList.toggle("dark", true);
    }
  }
  run();
  `,
          }}
        />
      </head>
      <body>
        <Header />
        <main className="prose mt-8 flex h-dvh max-w-none flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
