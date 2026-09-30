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
      <body
        suppressHydrationWarning
        className="antialiased min-h-screen flex flex-col bg-white text-sg-black font-sans"
      >
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
