import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router'
import { trpc } from '@/providers/trpc'
import { Star, SlidersHorizontal, X, ChevronDown, Grid3X3, LayoutList } from 'lucide-react'
import gsap from 'gsap'

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
]

const sizeOptions = ['S', 'M', 'L', 'XL']

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>({})
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const productsRef = useRef<HTMLDivElement>(null)

  const { data, isLoading } = trpc.product.list.useQuery({
    category: selectedCategory || undefined,
    search: search || undefined,
    minPrice: priceRange.min,
    maxPrice: priceRange.max,
    sizes: selectedSizes.length > 0 ? selectedSizes : undefined,
    sortBy: sortBy as any,
    page,
    limit: 12,
  })

  const { data: categories = [] } = trpc.product.getCategories.useQuery()

  // Sync URL params
  useEffect(() => {
    const params: Record<string, string> = {}
    if (selectedCategory) params.category = selectedCategory
    if (sortBy !== 'newest') params.sort = sortBy
    if (search) params.search = search
    setSearchParams(params, { replace: true })
    setPage(1)
  }, [selectedCategory, sortBy, search])

  useEffect(() => {
    if (productsRef.current && data?.products) {
      gsap.from('.product-card', {
        y: 30,
        opacity: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: 'power3.out',
      })
    }
  }, [data?.products])

  const activeFiltersCount = [
    selectedCategory,
    ...selectedSizes,
    priceRange.min,
    priceRange.max,
  ].filter(Boolean).length

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    )
    setPage(1)
  }

  const clearFilters = () => {
    setSelectedCategory('')
    setSelectedSizes([])
    setPriceRange({})
    setSearch('')
    setPage(1)
  }

  return (
    <div className="min-h-screen pt-[72px] bg-white">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-10 py-8 border-b border-black">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-[clamp(28px,4vw,48px)] font-light tracking-[-0.02em] mb-2">
            {search ? `Search: "${search}"` : selectedCategory ? categories.find(c => c.slug === selectedCategory)?.name || 'Shop' : 'All Products'}
          </h1>
          <p className="text-[13px] text-black/50">
            {data?.total || 0} products
          </p>
        </div>
      </div>

      {/* Controls bar */}
      <div className="px-4 sm:px-6 lg:px-10 py-4 border-b border-black sticky top-[56px] z-30 bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-[11px] font-medium tracking-[0.08em] hover:opacity-60 transition-opacity"
          >
            <SlidersHorizontal size={14} />
            FILTERS
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 bg-black text-white text-[10px] flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-4">
            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
                className="flex items-center gap-2 text-[11px] font-medium tracking-[0.08em] hover:opacity-60 transition-opacity"
              >
                SORT: {sortOptions.find(s => s.value === sortBy)?.label}
                <ChevronDown size={12} />
              </button>
              {openDropdown === 'sort' && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-black shadow-lg z-40 min-w-[180px]">
                  {sortOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortBy(opt.value); setOpenDropdown(null) }}
                      className={`block w-full text-left px-4 py-2.5 text-[12px] hover:bg-black/5 transition-colors ${sortBy === opt.value ? 'font-medium' : ''}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-1">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 ${viewMode === 'grid' ? 'opacity-100' : 'opacity-30'}`}>
                <Grid3X3 size={16} />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 ${viewMode === 'list' ? 'opacity-100' : 'opacity-30'}`}>
                <LayoutList size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters sidebar */}
      {showFilters && (
        <div className="border-b border-black bg-[#fafafa]">
          <div className="px-4 sm:px-6 lg:px-10 py-6 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {/* Categories */}
              <div>
                <h4 className="text-[11px] font-medium tracking-[0.1em] mb-3">CATEGORY</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`block text-[13px] ${!selectedCategory ? 'font-medium' : 'text-black/50'} hover:text-black transition-colors`}
                  >
                    All Products
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`block text-[13px] ${selectedCategory === cat.slug ? 'font-medium' : 'text-black/50'} hover:text-black transition-colors`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h4 className="text-[11px] font-medium tracking-[0.1em] mb-3">SIZE</h4>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map(size => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`w-10 h-10 border text-[12px] font-medium transition-colors ${
                        selectedSizes.includes(size)
                          ? 'bg-black text-white border-black'
                          : 'border-black/30 hover:border-black'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <h4 className="text-[11px] font-medium tracking-[0.1em] mb-3">PRICE RANGE</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min || ''}
                    onChange={e => setPriceRange(p => ({ ...p, min: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-20 border border-black/30 px-2 py-1.5 text-[12px] outline-none focus:border-black"
                  />
                  <span className="text-black/30">—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max || ''}
                    onChange={e => setPriceRange(p => ({ ...p, max: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-20 border border-black/30 px-2 py-1.5 text-[12px] outline-none focus:border-black"
                  />
                </div>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 flex items-center gap-1 text-[11px] tracking-[0.08em] text-black/50 hover:text-black transition-colors"
                  >
                    <X size={12} /> CLEAR ALL
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product grid */}
      <div className="px-4 sm:px-6 lg:px-10 py-8" ref={productsRef}>
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className={`grid gap-[1px] bg-black ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white">
                  <div className="aspect-square bg-[#f5f5f5] animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 w-20 bg-[#f5f5f5] animate-pulse" />
                    <div className="h-4 w-32 bg-[#f5f5f5] animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : data?.products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[18px] text-black/50">No products found</p>
              <button onClick={clearFilters} className="mt-4 text-[12px] font-medium tracking-[0.08em] underline">
                CLEAR FILTERS
              </button>
            </div>
          ) : (
            <>
              <div className={`grid gap-[1px] bg-black ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {data?.products.map((product) => {
                  const images = product.images ? JSON.parse(product.images as string) : []
                  const colors = product.colors ? JSON.parse(product.colors as string) : []
                  return (
                    <Link
                      key={product.id}
                      to={`/products/${product.slug}`}
                      className="product-card group bg-white block"
                    >
                      <div className={`relative overflow-hidden bg-[#f5f5f5] ${viewMode === 'list' ? 'aspect-[16/9] sm:aspect-[21/9]' : 'aspect-square'}`}>
                        <img
                          src={images[0] || '/images/tee-black.jpg'}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {product.isNew && (
                          <span className="absolute top-3 left-3 text-[10px] font-medium tracking-[0.1em] bg-black text-white px-2 py-1">
                            NEW
                          </span>
                        )}
                      </div>
                      <div className="p-4 border-t border-black">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[10px] tracking-[0.15em] text-black/50 uppercase mb-1">
                              {product.weight}
                            </p>
                            <h3 className="text-[14px] font-medium">{product.name}</h3>
                            <div className="flex items-center gap-1 mt-1.5">
                              <Star size={10} className="fill-black" />
                              <span className="text-[11px] text-black/50">{product.rating} ({product.reviewCount})</span>
                            </div>
                          </div>
                          <span className="text-[14px] font-medium whitespace-nowrap">${product.price}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-3">
                          {colors.map((c: { hex: string }) => (
                            <span key={c.hex} className="w-3 h-3 border border-black/20" style={{ backgroundColor: c.hex }} />
                          ))}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>

              {/* Pagination */}
              {data && data.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-black text-[11px] font-medium tracking-[0.08em] disabled:opacity-30 hover:bg-black hover:text-white transition-colors"
                  >
                    PREV
                  </button>
                  <span className="text-[12px] text-black/50 px-4">
                    Page {page} of {data.totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                    disabled={page === data.totalPages}
                    className="px-4 py-2 border border-black text-[11px] font-medium tracking-[0.08em] disabled:opacity-30 hover:bg-black hover:text-white transition-colors"
                  >
                    NEXT
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
