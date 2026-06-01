import { Link, useNavigate } from 'react-router'
import { useCart } from '@/hooks/useCart'
import { Minus, Plus, X, ShoppingBag, ArrowRight } from 'lucide-react'

export default function Cart() {
  const { items, count, isLoading, removeItem, updateQuantity, clearCart } = useCart()
  const navigate = useNavigate()

  const subtotal = items.reduce((sum, item) => {
    const price = item.product ? Number(item.product.price) : 0
    return sum + price * item.quantity
  }, 0)

  const shipping = subtotal > 100 ? 0 : 10
  const total = subtotal + shipping

  if (isLoading) {
    return (
      <div className="min-h-screen pt-[72px] flex items-center justify-center">
        <div className="animate-pulse text-[13px] tracking-[0.08em]">LOADING BAG...</div>
      </div>
    )
  }

  if (count === 0) {
    return (
      <div className="min-h-screen pt-[72px] flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBag size={48} className="mx-auto mb-4 text-black/20" />
          <h2 className="text-[24px] font-light tracking-[-0.02em] mb-2">Your bag is empty</h2>
          <p className="text-[13px] text-black/50 mb-6">Discover our essentials and add something timeless.</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-[12px] font-medium tracking-[0.1em]"
          >
            START SHOPPING <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-[72px] bg-white">
      <div className="px-4 sm:px-6 lg:px-10 py-8 border-b border-black">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-[clamp(24px,3vw,36px)] font-light tracking-[-0.02em]">
            Shopping Bag ({count})
          </h1>
          <button
            onClick={clearCart}
            className="text-[11px] font-medium tracking-[0.08em] text-black/50 hover:text-black transition-colors"
          >
            CLEAR ALL
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-[1px] bg-black">
            {items.map((item) => {
              const images = item.product?.images ? JSON.parse(item.product.images as string) : []
              const price = item.product ? Number(item.product.price) : 0
              return (
                <div key={item.id} className="bg-white p-4 sm:p-6 flex gap-4 sm:gap-6">
                  <Link
                    to={`/products/${item.product?.slug}`}
                    className="w-24 h-24 sm:w-32 sm:h-32 bg-[#f5f5f5] shrink-0 overflow-hidden"
                  >
                    <img
                      src={images[0] || '/images/tee-black.jpg'}
                      alt={item.product?.name || ''}
                      className="w-full h-full object-cover"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link to={`/products/${item.product?.slug}`} className="text-[14px] font-medium hover:opacity-60 transition-opacity">
                          {item.product?.name}
                        </Link>
                        <p className="text-[12px] text-black/50 mt-1">
                          Size: {item.size} &middot; Color: {item.color}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-black/30 hover:text-black transition-colors shrink-0"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-black/20">
                        <button
                          onClick={() => item.quantity > 1 && updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-black/5 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 h-8 flex items-center justify-center text-[12px] font-medium border-x border-black/20">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-black/5 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="text-[14px] font-medium">
                        ${(price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Order summary */}
          <div className="lg:sticky lg:top-[80px] lg:self-start">
            <div className="border border-black p-6">
              <h2 className="text-[14px] font-medium tracking-[0.1em] mb-6">ORDER SUMMARY</h2>
              <div className="space-y-3 mb-6 pb-6 border-b border-black/10">
                <div className="flex justify-between text-[13px]">
                  <span className="text-black/60">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-black/60">Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-[11px] text-black/40">
                    Free shipping on orders over $100
                  </p>
                )}
              </div>
              <div className="flex justify-between text-[16px] font-medium mb-6">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 bg-black text-white text-[12px] font-medium tracking-[0.14em] hover:bg-black/90 transition-colors"
              >
                PROCEED TO CHECKOUT
              </button>
              <Link
                to="/products"
                className="block text-center mt-4 text-[11px] font-medium tracking-[0.08em] text-black/50 hover:text-black transition-colors"
              >
                CONTINUE SHOPPING
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
