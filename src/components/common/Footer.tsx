"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheckIcon, TruckIcon, MapPinIcon, MailIcon, PhoneIcon, GiftIcon, StarIcon } from './Icons';
import { formatCopyright, type FooterFeatureIcon, type SiteContent } from '@/lib/siteContent';

function FeatureIcon({ icon }: { icon: FooterFeatureIcon }) {
  switch (icon) {
    case 'truck': return <TruckIcon className="w-5 h-5" />;
    case 'taka': return <span className="text-base font-bold text-sg-pink">৳</span>;
    case 'support': return <span className="text-sm font-bold text-sg-pink">24/7</span>;
    case 'gift': return <GiftIcon className="w-5 h-5" />;
    case 'star': return <StarIcon className="w-5 h-5" filled={false} />;
    default: return <ShieldCheckIcon className="w-5 h-5" />;
  }
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const className = 'hover:text-sg-pink transition-colors';
  return /^https?:\/\//i.test(href)
    ? <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>
    : <Link href={href} className={className}>{children}</Link>;
}

/** Storefront footer; all text is edited in Admin → Page Layout Sections → Footer. */
export default function Footer({ content }: { content: SiteContent['footer'] }) {
  const columnCount = 1 + content.columns.length + (content.newsletter.enabled || content.showPayments ? 1 : 0);
  const gridCols = ['md:grid-cols-1', 'md:grid-cols-2', 'md:grid-cols-3', 'md:grid-cols-4', 'md:grid-cols-5', 'md:grid-cols-6'][columnCount - 1] ?? 'md:grid-cols-4';

  return (
    <footer className="bg-[#1a1a1a] text-white pt-12 pb-20 lg:pb-12 border-t border-gray-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Features Banner */}
        {content.showFeatures && content.features.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-10 border-b border-gray-800 text-center sm:text-left">
            {content.features.map((feature, i) => (
              <div key={i} className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-sg-pink/10 border border-sg-pink/30 flex items-center justify-center text-sg-pink flex-shrink-0">
                  <FeatureIcon icon={feature.icon} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs uppercase tracking-wide">{feature.title}</h4>
                  <p className="text-gray-400 text-[11px] mt-0.5">{feature.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main Footer Links */}
        <div className={`grid grid-cols-1 ${gridCols} gap-8 py-10`}>
          {/* Brand & Mission */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/MainLOGOshajgoj.png"
                alt="Shajgoj.bd"
                width={160}
                height={31}
                className="h-8 w-auto object-contain brightness-0 invert"
              />
            </Link>
            {content.about && <p className="text-gray-400 text-[11px] leading-relaxed">{content.about}</p>}
            <div className="text-[11px] text-gray-300 space-y-1.5">
              {content.address && (
                <p className="flex items-center gap-1.5">
                  <MapPinIcon className="w-3.5 h-3.5 text-sg-pink flex-shrink-0" />
                  <span>{content.address}</span>
                </p>
              )}
              {content.phone && (
                <p className="flex items-center gap-1.5">
                  <PhoneIcon className="w-3.5 h-3.5 text-sg-pink flex-shrink-0" />
                  <a href={`tel:${content.phone.replace(/[^\d+]/g, '')}`} className="hover:text-sg-pink">{content.phone}</a>
                </p>
              )}
              {content.email && (
                <p className="flex items-center gap-1.5">
                  <MailIcon className="w-3.5 h-3.5 text-sg-pink flex-shrink-0" />
                  <a href={`mailto:${content.email}`} className="hover:text-sg-pink">{content.email}</a>
                </p>
              )}
            </div>
          </div>

          {/* Link columns */}
          {content.columns.map((column, i) => (
            <div key={i}>
              {column.title && (
                <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-4 border-b border-gray-800 pb-2">
                  {column.title}
                </h4>
              )}
              <ul className="space-y-2 text-gray-400 text-[11px]">
                {column.links.map((link, j) => (
                  <li key={j}><FooterLink href={link.href}>{link.label}</FooterLink></li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter & Payment Methods */}
          {(content.newsletter.enabled || content.showPayments) && (
            <div className="space-y-4">
              {content.newsletter.enabled && (
                <>
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2 border-b border-gray-800 pb-2">
                    {content.newsletter.title}
                  </h4>
                  <p className="text-gray-400 text-[11px]">{content.newsletter.text}</p>
                  <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      aria-label="Email address"
                      className="bg-gray-800 text-white placeholder-gray-500 px-3 py-2 text-xs rounded-full border border-gray-700 flex-1 focus:outline-none focus:border-sg-pink"
                    />
                    <button
                      type="submit"
                      className="bg-sg-pink hover:bg-sg-pink-hover text-white text-xs font-bold px-4 py-2 rounded-full transition-colors"
                    >
                      Join
                    </button>
                  </form>
                </>
              )}

              {content.showPayments && content.paymentMethods.length > 0 && (
                <div className="pt-2">
                  <p className="text-[11px] font-bold text-gray-400 uppercase mb-2">Payment Methods</p>
                  <div className="flex flex-wrap gap-2 text-[10px] text-gray-300">
                    {content.paymentMethods.map((method) => (
                      <span key={method} className="px-2 py-1 bg-gray-800 rounded font-bold border border-gray-700">{method}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-gray-800 text-center text-gray-500 text-[11px] flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>{formatCopyright(content.copyright)}</p>
          {content.credit.enabled && (
            <p>
              {content.credit.text}{' '}
              {content.credit.url
                ? <a href={content.credit.url} target="_blank" rel="noopener noreferrer" className="text-sg-pink hover:text-white transition-colors font-semibold">{content.credit.label}</a>
                : <span className="text-sg-pink font-semibold">{content.credit.label}</span>}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
