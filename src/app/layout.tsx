import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/context/AuthContext";
import AppShell from "@/components/common/AppShell";
import { getNavData } from "@/lib/serverData";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shajgoj.bd – Buy Authentic Cosmetic and Beauty Products Online in Bangladesh",
  description: "Shop 100% authentic beauty products online in Bangladesh at Shajgoj.bd: makeup, skincare, and haircare from 450+ brands, at the best BDT prices with fast nationwide delivery.",
  verification: {
    google: "6fNarvxXmaAW-Ap10egDw5GKUtx47E-BkGulYvx4kUk",
  },
  icons: {
    icon: [
      { url: "/favicon.png" },
      { url: "/New Faviconshajgoj.bd final.png" },
    ],
    apple: "/favicon.png",
    shortcut: "/favicon.png",
  },
  openGraph: {
    title: "Shajgoj.bd – Buy Authentic Cosmetic and Beauty Products Online in Bangladesh",
    description: "Shop 100% authentic beauty products online in Bangladesh at Shajgoj.bd: makeup, skincare and haircare from 450+ brands.",
    siteName: "Shajgoj.bd",
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Cached + tag-invalidated, so this adds no DB round-trip per request.
  const navData = await getNavData();

  return (
    <html lang="en" className={`${jakarta.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="6fNarvxXmaAW-Ap10egDw5GKUtx47E-BkGulYvx4kUk" />

        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-S3RC6D7N01" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-S3RC6D7N01');
            `,
          }}
        />

        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-PTLQTNFV');
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="antialiased min-h-screen flex flex-col bg-white text-sg-black font-sans"
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PTLQTNFV"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <AppShell navData={navData}>{children}</AppShell>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
