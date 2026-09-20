"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheckIcon, TruckIcon, MapPinIcon, MailIcon } from './Icons';

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white pt-12 pb-20 lg:pb-12 border-t border-gray-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Features Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-10 border-b border-gray-800 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-sg-pink/10 border border-sg-pink/30 flex items-center justify-center text-sg-pink flex-shrink-0">
              <ShieldCheckIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wide">100% Authentic</h4>
              <p className="text-gray-400 text-[11px] mt-0.5">Sourced directly from certified brand principals.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-sg-pink/10 border border-sg-pink/30 flex items-center justify-center text-sg-pink flex-shrink-0">
              <TruckIcon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wide">Fast Delivery</h4>
              <p className="text-gray-400 text-[11px] mt-0.5">Nationwide delivery within 24-72 hours across BD.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-sg-pink/10 border border-sg-pink/30 flex items-center justify-center text-sg-pink flex-shrink-0">
              <span className="text-base font-bold text-sg-pink">৳</span>
            </div>
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wide">Best Price Online</h4>
              <p className="text-gray-400 text-[11px] mt-0.5">Top offers, BOGO deals & reward points on every order.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-sg-pink/10 border border-sg-pink/30 flex items-center justify-center text-sg-pink flex-shrink-0">
              <span className="text-sm font-bold text-sg-pink">24/7</span>
            </div>
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-wide">Customer Support</h4>
              <p className="text-gray-400 text-[11px] mt-0.5">Hotline: 09613-222333 • 9 AM - 10 PM daily.</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-10">
          {/* Brand & Mission */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/assets/logov2.png"
                alt="Shajgoj.bd"
                width={150}
                height={26}
                className="h-7 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-gray-400 text-[11px] leading-relaxed">
              Shajgoj.bd is Bangladesh&apos;s leading omnichannel beauty destination offering 100% authentic makeup, skincare, and haircare from over 450+ renowned international and local brands.
            </p>
            <div className="text-[11px] text-gray-300 space-y-1.5">
              <p className="flex items-center gap-1.5">
                <MapPinIcon className="w-3.5 h-3.5 text-sg-pink flex-shrink-0" />
                <span>House # 12, Road # 10, Dhanmondi, Dhaka-1205</span>
              </p>
              <p className="flex items-center gap-1.5">
                <MailIcon className="w-3.5 h-3.5 text-sg-pink flex-shrink-0" />
                <span>support@shajgoj.bd</span>
              </p>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">
              Popular Categories
            </h4>
            <ul className="space-y-2 text-gray-400 text-[11px]">
              <li><Link href="/shop?category=skin" className="hover:text-sg-pink transition-colors">Skin Care & Serums</Link></li>
              <li><Link href="/shop?category=hair" className="hover:text-sg-pink transition-colors">Hair Care & Shampoos</Link></li>
              <li><Link href="/shop?category=makeup" className="hover:text-sg-pink transition-colors">Makeup & Foundation</Link></li>
              <li><Link href="/shop?category=k-beauty" className="hover:text-sg-pink transition-colors">Korean Beauty (K-Beauty)</Link></li>
              <li><Link href="/shop?category=fragrance" className="hover:text-sg-pink transition-colors">Fragrance & Perfumes</Link></li>
              <li><Link href="/shop?category=mom-and-baby" className="hover:text-sg-pink transition-colors">Mom & Baby Care</Link></li>
            </ul>
          </div>

          {/* Customer Care & Policies */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">
              Help & Policies
            </h4>
            <ul className="space-y-2 text-gray-400 text-[11px]">
              <li><Link href="/about-us" className="hover:text-sg-pink transition-colors">About Shajgoj.bd</Link></li>
              <li><Link href="/authenticity" className="hover:text-sg-pink transition-colors">100% Authenticity Guarantee</Link></li>
              <li><Link href="/faqs" className="hover:text-sg-pink transition-colors">Frequently Asked Questions</Link></li>
              <li><Link href="/refund-and-return-policy" className="hover:text-sg-pink transition-colors">Refund & Return Policy</Link></li>
              <li><Link href="/shipping-delivery" className="hover:text-sg-pink transition-colors">Shipping & Delivery Info</Link></li>
              <li><Link href="/terms-conditions" className="hover:text-sg-pink transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-sg-pink transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Newsletter & Payment Methods */}
          <div className="space-y-4">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2 border-b border-gray-800 pb-2">
              Stay in the Glow
            </h4>
            <p className="text-gray-400 text-[11px]">
              Subscribe to get special discounts, beauty secrets, and flash sale notifications.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-gray-800 text-white placeholder-gray-500 px-3 py-2 text-xs rounded-full border border-gray-700 flex-1 focus:outline-none focus:border-sg-pink"
              />
              <button
                type="submit"
                className="bg-sg-pink hover:bg-sg-pink-hover text-white text-xs font-bold px-4 py-2 rounded-full transition-colors"
              >
                Join
              </button>
            </form>

            <div className="pt-2">
              <p className="text-[11px] font-bold text-gray-400 uppercase mb-2">Payment Methods</p>
              <div className="flex flex-wrap gap-2 text-[10px] text-gray-300">
                <span className="px-2 py-1 bg-gray-800 rounded font-bold border border-gray-700">bKash</span>
                <span className="px-2 py-1 bg-gray-800 rounded font-bold border border-gray-700">Nagad</span>
                <span className="px-2 py-1 bg-gray-800 rounded font-bold border border-gray-700">Rocket</span>
                <span className="px-2 py-1 bg-gray-800 rounded font-bold border border-gray-700">Visa / MC</span>
                <span className="px-2 py-1 bg-gray-800 rounded font-bold border border-gray-700">COD</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-gray-800 text-center text-gray-500 text-[11px] flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Shajgoj.bd Limited. All Rights Reserved.</p>
          <p>Designed &amp; Developed by <a href="https://jarzdigital.com" target="_blank" rel="noopener noreferrer" className="text-sg-pink hover:text-white transition-colors font-semibold">JarzDigital.com</a></p>
        </div>
      </div>
    </footer>
  );
}
