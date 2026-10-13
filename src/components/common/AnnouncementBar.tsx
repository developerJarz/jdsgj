import React from 'react';
import Link from 'next/link';
import type { SiteContent } from '@/lib/siteContent';

/** Thin message bar above the header, edited in Admin → Page Layout Sections. */
export default function AnnouncementBar({ announcement, compact = false }: { announcement: SiteContent['announcement']; compact?: boolean }) {
  if (!announcement.enabled || !announcement.text || (compact && !announcement.showOnMobile)) return null;
  const className = `block text-center font-medium tracking-wide ${compact ? 'text-[10px] px-3 py-1 leading-snug' : 'text-[11px] py-1.5'}`;
  const style = { backgroundColor: announcement.background, color: announcement.color };
  const external = /^https?:\/\//i.test(announcement.link);

  if (!announcement.link) return <div className={className} style={style}><span>{announcement.text}</span></div>;
  return external
    ? <a href={announcement.link} target="_blank" rel="noopener noreferrer" className={`${className} hover:underline`} style={style}>{announcement.text}</a>
    : <Link href={announcement.link} className={`${className} hover:underline`} style={style}>{announcement.text}</Link>;
}
