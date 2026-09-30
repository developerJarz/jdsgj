export default function ProductGridSkeleton({ withSidebar = false, count = 10 }: { withSidebar?: boolean; count?: number }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" aria-busy="true" aria-label="Loading products">
      <div className="h-7 w-56 bg-gray-100 rounded-lg mb-6 animate-pulse" />
      <div className="flex gap-8">
        {withSidebar && (
          <div className="hidden lg:block w-64 shrink-0 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-40 bg-gray-50 border border-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        )}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-100 overflow-hidden">
              <div className="aspect-square bg-gray-100 animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-2.5 w-1/3 bg-gray-100 rounded animate-pulse" />
                <div className="h-3 w-5/6 bg-gray-100 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
