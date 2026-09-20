import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/context/AuthContext";
import AppShell from "@/components/common/AppShell";

export const metadata: Metadata = {
  title: "Shajgoj.bd – Buy Authentic Cosmetic and Beauty Products Online in Bangladesh",
  description: "Shop 100% authentic beauty products online in Bangladesh at Shajgoj.bd: makeup, skincare, and haircare from 450+ brands, at the best BDT prices with fast nationwide delivery.",
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "Shajgoj.bd – Buy Authentic Cosmetic and Beauty Products Online in Bangladesh",
    description: "Shop 100% authentic beauty products online in Bangladesh at Shajgoj.bd: makeup, skincare and haircare from 450+ brands.",
    siteName: "Shajgoj.bd",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="antialiased min-h-screen flex flex-col bg-white text-sg-black font-sans"
      >
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <AppShell>{children}</AppShell>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
