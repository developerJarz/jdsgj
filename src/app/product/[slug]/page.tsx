"use client";

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/services/apiClient';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { StarIcon, HeartIcon, ShajgojBagIcon, ShieldCheckIcon, TruckIcon, CheckIcon, GiftIcon } from '@/components/common/Icons';
import ProductGrid from '@/components/product/ProductGrid';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'how_to_use' | 'ingredients' | 'faq'>('description');
  const [isAdded, setIsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      setIsLoading(true);
      const item = await apiClient.getProductBySlug(slug);
      if (item) {
        setProduct(item);
        setSelectedImage(item.thumbnail || item.images[0] || '');
        const all = await apiClient.getProducts();
        const related = all.filter(p => p.category_slug === item.category_slug && p.id !== item.id).slice(0, 5);
        setRelatedProducts(related);
      }
      setIsLoading(false);
    }
    loadProduct();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-sm text-gray-500">
        Loading authentic product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-3">
        <h2 className="text-xl font-bold text-sg-black">Product Not Found</h2>
        <p className="text-xs text-gray-500">We couldn&apos;t locate this beauty item.</p>
        <Link href="/shop" className="inline-block px-5 py-2 bg-sg-pink text-white rounded-full text-xs font-bold">
          Back to Shop
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);

  const handleAdd = () => {
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    router.push('/cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-gray-500">
        <Link href="/" className="hover:text-sg-pink">Home</Link>
        <span>/</span>
        <Link href={`/shop?category=${product.category_slug}`} className="hover:text-sg-pink">
          {product.category}
        </Link>
        <span>/</span>
        <Link href={`/shop?brand=${product.brand_slug}`} className="hover:text-sg-pink">
          {product.brand}
        </Link>
        <span>/</span>
        <span className="text-sg-black font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-xs">
        {/* Left: Gallery */}
        <div className="space-y-4">
          {/* Main Hero Image */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
            {product.discount_percentage > 0 && (
              <span className="absolute top-4 left-4 z-10 bg-sg-pink text-white text-xs font-black px-3 py-1 rounded-full shadow-md">
                {product.discount_percentage}% OFF
              </span>
            )}
            <Image
              src={selectedImage || product.thumbnail || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80'}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-6"
              onError={() => setSelectedImage('https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80')}
            />
          </div>

          {/* Thumbnails list */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto custom-scroll pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border-2 transition-all ${
                    selectedImage === img ? 'border-sg-pink ring-2 ring-sg-pink-light' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    fill
                    className="object-contain p-1"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details */}
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <Link
                href={`/shop?brand=${product.brand_slug}`}
                className="text-xs font-extrabold text-sg-pink uppercase tracking-widest hover:underline"
              >
                {product.brand}
              </Link>
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`p-2 rounded-full border transition-colors ${
                  isFavorited 
                    ? 'border-sg-pink text-sg-pink bg-sg-pink-light' 
                    : 'border-gray-200 text-gray-400 hover:text-sg-pink hover:border-sg-pink'
                }`}
                title="Toggle Wishlist"
              >
                <HeartIcon className="w-5 h-5" filled={isFavorited} />
              </button>
            </div>

            <h1 className="text-lg md:text-2xl font-black text-sg-black mt-1 leading-snug">
              {product.name}
            </h1>

            {/* Ratings & SKU */}
            <div className="flex items-center gap-3 mt-2 text-xs">
              <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                <StarIcon className="w-3.5 h-3.5 text-amber-500" filled />
                <span className="font-bold text-amber-900">{product.rating}</span>
              </div>
              <span className="text-gray-400">({product.reviews_count || 24} Verified Reviews)</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">SKU: <strong>{product.sku || `SG-${product.id}`}</strong></span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-xl bg-sg-pink-light/30 border border-sg-pink-border/40 flex items-baseline justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-sg-pink">৳{product.sale_price}</span>
                {product.regular_price > product.sale_price && (
                  <span className="text-sm text-gray-400 line-through">৳{product.regular_price}</span>
                )}
              </div>
              <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                <span className="flex items-center gap-1"><GiftIcon className="w-3.5 h-3.5 text-emerald-600" /> Earn <strong>{product.reward_points}</strong> Shajgoj.bd Reward Points with this order</span>
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                <span className="flex items-center gap-1"><CheckIcon className="w-3.5 h-3.5" /> In Stock ({product.stock})</span>
              </span>
            </div>
          </div>

          {/* Short Description */}
          {product.short_description && (
            <p className="text-xs text-gray-600 leading-relaxed">
              {product.short_description}
            </p>
          )}

          {/* Quantity and Actions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-700 uppercase">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-full overflow-hidden bg-gray-50">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center text-sm font-bold text-gray-600 hover:bg-gray-200"
                >
                  -
                </button>
                <span className="w-10 text-center text-xs font-bold text-sg-black">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center text-sm font-bold text-gray-600 hover:bg-gray-200"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleAdd}
                className={`py-3 px-6 rounded-full font-bold text-xs uppercase transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 shadow-md ${
                  isAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-sg-pink hover:bg-sg-pink-hover text-white'
                }`}
              >
                {isAdded ? (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    <span>Added to Bag!</span>
                  </>
                ) : (
                  <>
                    <ShajgojBagIcon className="w-4 h-4" color="#ffffff" />
                    <span>Add to Bag</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="py-3 px-6 rounded-full font-bold text-xs uppercase bg-sg-black hover:bg-sg-black/90 text-white transition-all shadow-md active:scale-95"
              >
                Buy Now
              </button>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="border-t border-gray-100 pt-4 grid grid-cols-2 gap-3 text-[11px] text-gray-600">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="w-4 h-4 text-sg-pink" />
              <span>100% Genuine & Authentic</span>
            </div>
            <div className="flex items-center gap-2">
              <TruckIcon className="w-4 h-4 text-sg-pink" />
              <span>Fast 24-72h Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sg-pink font-bold text-sm">৳</span>
              <span>Cash on Delivery Available</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sg-pink font-bold text-sm">↻</span>
              <span>7 Days Easy Return Policy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Information Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
        <div className="flex border-b border-gray-100 gap-6 text-xs font-bold uppercase tracking-wider overflow-x-auto custom-scroll">
          <button
            onClick={() => setActiveTab('description')}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'description' ? 'border-sg-pink text-sg-pink' : 'border-transparent text-gray-500 hover:text-sg-black'
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab('how_to_use')}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'how_to_use' ? 'border-sg-pink text-sg-pink' : 'border-transparent text-gray-500 hover:text-sg-black'
            }`}
          >
            How to Use
          </button>
          <button
            onClick={() => setActiveTab('ingredients')}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'ingredients' ? 'border-sg-pink text-sg-pink' : 'border-transparent text-gray-500 hover:text-sg-black'
            }`}
          >
            Ingredients
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'faq' ? 'border-sg-pink text-sg-pink' : 'border-transparent text-gray-500 hover:text-sg-black'
            }`}
          >
            FAQs
          </button>
        </div>

        <div className="pt-6 text-xs text-gray-700 leading-relaxed">
          {activeTab === 'description' && (
            <div className="space-y-3">
              <p>{product.description || 'Pamper your skin with authentic beauty care. Formulated to provide optimal nourishment, hydration, and visible rejuvenation for all skin types.'}</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>Suitable for daily skincare routine</li>
                <li>Dermatologically tested and non-comedogenic</li>
                <li>Preserves natural moisture barrier</li>
              </ul>
            </div>
          )}

          {activeTab === 'how_to_use' && (
            <div className="space-y-2">
              <p className="font-semibold text-sg-black">Recommended Application:</p>
              <ol className="list-decimal pl-5 space-y-1.5 text-gray-600">
                <li>Cleanse your face thoroughly with warm water.</li>
                <li>Dispense a dime-sized amount onto clean fingertips.</li>
                <li>Gently massage onto target areas in upward circular motions until absorbed.</li>
                <li>Follow with sunscreen during the day or moisturizer at night.</li>
              </ol>
            </div>
          )}

          {activeTab === 'ingredients' && (
            <div className="space-y-2">
              <p className="font-semibold text-sg-black">Key Ingredients:</p>
              <p className="text-gray-600">
                {product.ingredients || 'Aqua (Water), Glycerin, Niacinamide, Hyaluronic Acid, Centella Asiatica Extract, Tocopheryl Acetate (Vitamin E), Allantoin, Phenoxyethanol, Ethylhexylglycerin.'}
              </p>
            </div>
          )}

          {activeTab === 'faq' && (
            <div className="space-y-3">
              <div className="border border-gray-100 p-3 rounded-lg bg-gray-50">
                <p className="font-bold text-sg-black">Is this product 100% original?</p>
                <p className="text-gray-600 mt-1">Yes! Shajgoj.bd guarantees 100% authenticity on all products sourced straight from authorized distributors.</p>
              </div>
              <div className="border border-gray-100 p-3 rounded-lg bg-gray-50">
                <p className="font-bold text-sg-black">When will I receive my order?</p>
                <p className="text-gray-600 mt-1">Inside Dhaka deliveries typically arrive within 24-48 hours. Outside Dhaka orders arrive within 48-72 hours.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <ProductGrid
          title="SIMILAR BEAUTY FAVORITES"
          subtitle="Customers who viewed this item also bought"
          products={relatedProducts}
          viewAllHref={`/shop?category=${product.category_slug}`}
        />
      )}
    </div>
  );
}
