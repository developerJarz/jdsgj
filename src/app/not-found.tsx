import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
      <p className="text-xs font-bold uppercase tracking-widest text-sg-pink">404</p>
      <h1 className="section-title md:text-3xl">We couldn&apos;t find that page</h1>
      <p className="text-sm text-gray-500">
        The product may have been removed or the link is incorrect. Try searching, or keep browsing our bestsellers.
      </p>
      <div className="flex justify-center gap-3 pt-2">
        <Link href="/" className="px-5 py-2.5 rounded-full bg-sg-pink hover:bg-sg-pink-hover text-white text-xs font-bold">
          Back to home
        </Link>
        <Link href="/shop" className="px-5 py-2.5 rounded-full border border-gray-200 text-xs font-bold text-sg-black hover:border-sg-pink hover:text-sg-pink">
          Shop all products
        </Link>
      </div>
    </div>
  );
}
