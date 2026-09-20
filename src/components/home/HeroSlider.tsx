"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface HeroSlide {
  id: number | string;
  title: string;
  image: string;
  url: string;
  alt: string;
}

const defaultSlides: HeroSlide[] = [
  {
    id: 1,
    title: 'Skintastic Specials',
    image: 'https://bk.shajgoj.com/storage/2026/08/skintastic-2-web.png',
    url: '/shop?category=skin',
    alt: 'Skintastic Deals'
  },
  {
    id: 2,
    title: 'Ponds Miracle Care',
    image: 'https://bk.shajgoj.com/storage/2026/08/prime-banner-ponds-miracle-me-web.png',
    url: '/shop?brand=ponds',
    alt: 'Ponds Miracle'
  },
  {
    id: 3,
    title: 'July Jaw Droppers',
    image: 'https://bk.shajgoj.com/storage/2026/07/july-jaw-droppers-app.png',
    url: '/shop?offer=jaw-droppers',
    alt: 'Jaw Droppers Offers'
  }
];

export default function HeroSlider({ slides = defaultSlides }: { slides?: HeroSlide[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative w-full overflow-hidden bg-gray-100">
      {/* Desktop Aspect Ratio (1920 / 490) */}
      <div className="hidden md:block relative w-full hero-aspect-web">
        {slides.map((slide, idx) => (
          <Link
            key={slide.id}
            href={slide.url}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === current ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.alt || slide.title}
              fill
              priority={idx === 0}
              className="object-cover"
            />
          </Link>
        ))}
      </div>

      {/* Mobile Aspect Ratio (640 / 420) */}
      <div className="block md:hidden relative w-full hero-aspect-mobile">
        {slides.map((slide, idx) => (
          <Link
            key={slide.id}
            href={slide.url}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === current ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.alt || slide.title}
              fill
              priority={idx === 0}
              className="object-cover"
            />
          </Link>
        ))}
      </div>

      {/* Slider Indicators */}
      <div className="absolute bottom-3 left-0 right-0 z-20 flex justify-center gap-1.5">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrent(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === current ? 'w-6 bg-sg-pink' : 'w-2 bg-white/70 hover:bg-white'
            }`}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        type="button"
        onClick={() => setCurrent((current - 1 + slides.length) % slides.length)}
        className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 hover:bg-black/60 text-white items-center justify-center transition-colors"
        aria-label="Previous slide"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={() => setCurrent((current + 1) % slides.length)}
        className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/30 hover:bg-black/60 text-white items-center justify-center transition-colors"
        aria-label="Next slide"
      >
        ›
      </button>
    </div>
  );
}
