import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router'
import { trpc } from '@/providers/trpc'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { Star, Heart, Truck, RotateCcw, Plus, Minus } from 'lucide-react'
import { toast } from 'sonner'
import gsap from 'gsap'

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data: product, isLoading } = trpc.product.getBySlug.useQuery({ slug: slug || '' })
  const { data: related = [] } = trpc.product.getRelated.useQuery(
    { productId: product?.id || 0 },
    { enabled: !!product }
  )
  const { data: reviews = [] } = trpc.review.list.useQuery(
    { productId: product?.id || 0 },
    { enabled: !!product }
  )
  const { addItem } = useCart()
  const { isAuthenticated } = useAuth({ redirectPath: '/' })
  const utils = trpc.useUtils()
  const { data: wishlistStatus } = trpc.wishlist.check.useQuery(
    { productId: product?.id || 0 },
    { enabled: !!product && isAuthenticated }
  )
  const toggleWishlist = trpc.wishlist.toggle.useMutation({
    onSuccess: () => {
      utils.wishlist.check.invalidate()
      utils.wishlist.list.invalidate()
      toast.success(wishlistStatus?.isInWishlist ? 'Removed from wishlist' : 'Added to wishlist')
    },
  })
  const createReview = trpc.review.create.useMutation({
    onSuccess: () => {
      utils.review.list.invalidate()
      toast.success('Review submitted')
      setReviewForm({ rating: 5, title: '', body: '' })
    },
  })

  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [mainImage, setMainImage] = useState(0)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' })
  const [addingToCart, setAddingToCart] = useState(false)
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (product) {
      setSelectedSize('')
      setSelectedColor('')
      setQuantity(1)
      setMainImage(0)
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [product?.slug])

  useEffect(() => {
    if (pageRef.current) {
      gsap.from('.detail-animate', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
      })
    }
  }, [product])

  if (isLoading) {
    return (
      <div className="min-h-screen pt-[72px] flex items-center justify-center">
        <div className="space-y-4 w-64">
          <div className="h-64 bg-[#f5f5f5] animate-pulse" />
          <div className="h-4 w-3/4 bg-[#f5f5f5] animate-pulse" />
          <div className="h-4 w-1/2 bg-[#f5f5f5] animate-pulse" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-[72px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[18px] text-black/50 mb-4">Product not found</p>
          <Link to="/products" className="text-[12px] font-medium tracking-[0.08em] underline">
            BACK TO SHOP
          </Link>
        </div>
      </div>
    )
  }

  const images = product.images ? JSON.parse(product.images as string) : []
  const sizes = product.sizes ? JSON.parse(product.sizes as string) : []
  const colors = product.colors ? JSON.parse(product.colors as string) : []
  const inventory = product.inventory ? JSON.parse(product.inventory as string) : {}

  const handleAddToCart = () => {
    if (!selectedSize) { toast.error('Please select a size'); return }
    if (!selectedColor) { toast.error('Please select a color'); return }
    setAddingToCart(true)
    addItem(product.id, selectedSize, selectedColor, quantity)
    setTimeout(() => setAddingToCart(false), 1000)
  }

  const handleWishlist = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add to wishlist')
      return
    }
    toggleWishlist.mutate({ productId: product.id })
  }

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) { toast.error('Please sign in to leave a review'); return }
    createReview.mutate({
      productId: product.id,
      rating: reviewForm.rating,
      title: reviewForm.title,
      body: reviewForm.body,
    })
  }

  return (
    <div ref={pageRef} className="min-h-screen pt-[72px] bg-white">
      {/* Breadcrumb */}
      <div className="px-4 sm:px-6 lg:px-10 py-4 border-b border-black">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-[11px] tracking-[0.05em] text-black/50">
          <Link to="/" className="hover:text-black transition-colors">HOME</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-black transition-colors">SHOP</Link>
          <span>/</span>
          <span className="text-black">{product.name.toUpperCase()}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image gallery */}
          <div className="detail-animate">
            <div className="relative aspect-square bg-[#f5f5f5] overflow-hidden mb-[1px]">
              <img
                src={images[mainImage] || '/images/tee-black.jpg'}
                alt={product.name}
                className={`w-full h-full object-cover transition-all duration-500 ${addingToCart ? 'animate-button-flip' : ''}`}
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-[1px]">
                {images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setMainImage(i)}
                    className={`relative flex-1 aspect-square bg-[#f5f5f5] overflow-hidden ${mainImage === i ? 'ring-2 ring-black ring-inset' : ''}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="detail-animate lg:sticky lg:top-[80px] lg:self-start">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-[10px] tracking-[0.2em] text-black/50 uppercase mb-2">
                  {product.weight} &middot; {product.fabricDetails}
                </p>
                <h1 className="text-[clamp(24px,3vw,36px)] font-light tracking-[-0.02em]">
                  {product.name}
                </h1>
              </div>
              <button
                onClick={handleWishlist}
                className="p-2 border border-black/20 hover:border-black transition-colors shrink-0"
              >
                <Heart
                  size={18}
                  className={wishlistStatus?.isInWishlist ? 'fill-black' : ''}
                />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-[24px] font-medium">${product.price}</span>
              {product.comparePrice && (
                <span className="text-[16px] text-black/40 line-through">${product.comparePrice}</span>
              )}
              <div className="flex items-center gap-1 ml-auto">
                <Star size={14} className="fill-black" />
                <span className="text-[13px] font-medium">{product.rating}</span>
                <span className="text-[12px] text-black/50">({product.reviewCount})</span>
              </div>
            </div>

            <p className="text-[14px] text-black/60 leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Color selector */}
            <div className="mb-6">
              <p className="text-[11px] font-medium tracking-[0.1em] mb-3">
                COLOR {selectedColor && `— ${selectedColor}`}
              </p>
              <div className="flex gap-2">
                {colors.map((color: { name: string; hex: string }) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-8 h-8 border-2 transition-all ${
                      selectedColor === color.name ? 'border-black scale-110' : 'border-black/20 hover:border-black/50'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Size selector */}
            <div className="mb-6">
              <p className="text-[11px] font-medium tracking-[0.1em] mb-3">SIZE</p>
              <div className="flex gap-2">
                {sizes.map((size: string) => {
                  const inStock = inventory[size] > 0
                  return (
                    <button
                      key={size}
                      onClick={() => inStock && setSelectedSize(size)}
                      disabled={!inStock}
                      className={`w-12 h-12 border text-[13px] font-medium transition-all ${
                        selectedSize === size
                          ? 'bg-black text-white border-black'
                          : inStock
                            ? 'border-black/30 hover:border-black'
                            : 'border-black/10 text-black/20 cursor-not-allowed line-through'
                      }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
              {selectedSize && inventory[selectedSize] <= 3 && (
                <p className="text-[11px] text-black/50 mt-2">
                  Only {inventory[selectedSize]} left in size {selectedSize}
                </p>
              )}
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <p className="text-[11px] font-medium tracking-[0.1em] mb-3">QUANTITY</p>
              <div className="flex items-center border border-black w-fit">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-black/5 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 h-10 flex items-center justify-center text-[14px] font-medium border-x border-black">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-black/5 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className={`w-full py-4 bg-black text-white text-[12px] font-medium tracking-[0.14em] hover:bg-black/90 transition-all disabled:opacity-50 ${addingToCart ? 'animate-button-flip' : ''}`}
            >
              {addingToCart ? 'ADDED' : 'ADD TO BAG'}
            </button>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-black/10">
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-black/40" />
                <span className="text-[11px] text-black/50">Free shipping over $100</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw size={16} className="text-black/40" />
                <span className="text-[11px] text-black/50">30-day returns</span>
              </div>
            </div>

            {/* Product details tabs */}
            <div className="mt-8 border-t border-black pt-6">
              <div className="space-y-4">
                {product.fitInfo && (
                  <div>
                    <p className="text-[11px] font-medium tracking-[0.1em] mb-1">FIT</p>
                    <p className="text-[13px] text-black/60">{product.fitInfo}</p>
                  </div>
                )}
                {product.careInstructions && (
                  <div>
                    <p className="text-[11px] font-medium tracking-[0.1em] mb-1">CARE</p>
                    <p className="text-[13px] text-black/60">{product.careInstructions}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-20 pt-12 border-t border-black">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[24px] font-light tracking-[-0.02em]">
              Reviews ({reviews.length})
            </h2>
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="text-[11px] font-medium tracking-[0.08em] border border-black px-4 py-2 hover:bg-black hover:text-white transition-colors"
            >
              {showReviewForm ? 'CANCEL' : 'WRITE A REVIEW'}
            </button>
          </div>

          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="mb-10 p-6 border border-black bg-[#fafafa]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-[11px] font-medium tracking-[0.1em] mb-2 block">RATING</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm(f => ({ ...f, rating: star }))}
                        className="p-1"
                      >
                        <Star
                          size={20}
                          className={star <= reviewForm.rating ? 'fill-black' : 'text-black/20'}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-medium tracking-[0.1em] mb-2 block">TITLE</label>
                  <input
                    type="text"
                    value={reviewForm.title}
                    onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full border border-black/30 px-3 py-2 text-[13px] outline-none focus:border-black"
                    placeholder="Short summary"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="text-[11px] font-medium tracking-[0.1em] mb-2 block">REVIEW</label>
                <textarea
                  value={reviewForm.body}
                  onChange={e => setReviewForm(f => ({ ...f, body: e.target.value }))}
                  className="w-full border border-black/30 px-3 py-2 text-[13px] outline-none focus:border-black min-h-[100px] resize-none"
                  placeholder="Share your experience..."
                />
              </div>
              <button
                type="submit"
                disabled={createReview.isPending}
                className="px-6 py-2.5 bg-black text-white text-[11px] font-medium tracking-[0.1em] hover:bg-black/90 transition-colors disabled:opacity-50"
              >
                {createReview.isPending ? 'SUBMITTING...' : 'SUBMIT REVIEW'}
              </button>
            </form>
          )}

          {reviews.length === 0 ? (
            <p className="text-[14px] text-black/50">No reviews yet. Be the first to review.</p>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="pb-6 border-b border-black/10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} size={12} className="fill-black" />
                      ))}
                    </div>
                    {review.verified && (
                      <span className="text-[10px] tracking-[0.08em] text-black/40">VERIFIED</span>
                    )}
                  </div>
                  {review.title && (
                    <h4 className="text-[14px] font-medium mb-1">{review.title}</h4>
                  )}
                  <p className="text-[13px] text-black/60 leading-relaxed mb-2">{review.body}</p>
                  <p className="text-[11px] text-black/40">{review.userName} &middot; {new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-20 pt-12 border-t border-black">
            <h2 className="text-[24px] font-light tracking-[-0.02em] mb-8">You may also like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1px] bg-black">
              {related.map((rp) => {
                const rpImages = rp.images ? JSON.parse(rp.images as string) : []
                return (
                  <Link
                    key={rp.id}
                    to={`/products/${rp.slug}`}
                    className="group bg-white block"
                  >
                    <div className="aspect-square bg-[#f5f5f5] overflow-hidden">
                      <img
                        src={rpImages[0] || '/images/tee-black.jpg'}
                        alt={rp.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-3 border-t border-black">
                      <p className="text-[13px] font-medium">{rp.name}</p>
                      <p className="text-[12px] text-black/50">${rp.price}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
