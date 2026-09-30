export default function ProductLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" aria-busy="true" aria-label="Loading product">
      <div className="h-3 w-48 bg-gray-100 rounded mb-6 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-square rounded-2xl bg-gray-100 animate-pulse" />
        <div className="space-y-4">
          <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
          <div className="h-8 w-5/6 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-4 w-1/3 bg-gray-100 rounded animate-pulse" />
          <div className="h-10 w-40 bg-gray-100 rounded-lg animate-pulse" />
          <div className="space-y-2 pt-4">
            <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
            <div className="h-3 w-11/12 bg-gray-100 rounded animate-pulse" />
            <div className="h-3 w-4/5 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="flex gap-3 pt-4">
            <div className="h-11 flex-1 bg-gray-100 rounded-full animate-pulse" />
            <div className="h-11 flex-1 bg-gray-100 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
