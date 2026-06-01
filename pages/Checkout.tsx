import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useCart } from '@/hooks/useCart'
import { trpc } from '@/providers/trpc'
import { toast } from 'sonner'
import { ArrowLeft, Tag, CreditCard, Truck } from 'lucide-react'

export default function Checkout() {
  const { items, count, clearCart } = useCart()
  const navigate = useNavigate()

  const [step, setStep] = useState<'shipping' | 'payment'>('shipping')
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ valid: boolean; discount: number; message: string } | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  })

  const subtotal = items.reduce((sum, item) => {
    const price = item.product ? Number(item.product.price) : 0
    return sum + price * item.quantity
  }, 0)

  const utils = trpc.useUtils()

  const createOrder = trpc.order.create.useMutation({
    onSuccess: (data) => {
      clearCart()
      toast.success('Order placed successfully!')
      navigate(`/order-confirmation/${data.orderNumber}`)
    },
    onError: (err) => {
      toast.error(err.message)
      setIsSubmitting(false)
    },
  })

  const shipping = subtotal > 100 ? 0 : 10
  const discount = appliedCoupon?.valid ? appliedCoupon.discount : 0
  const total = subtotal + shipping - discount

  if (count === 0) {
    return (
      <div className="min-h-screen pt-[72px] flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-[24px] font-light tracking-[-0.02em] mb-2">Your bag is empty</h2>
          <button
            onClick={() => navigate('/products')}
            className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-black text-white text-[12px] font-medium tracking-[0.1em]"
          >
            <ArrowLeft size={14} /> CONTINUE SHOPPING
          </button>
        </div>
      </div>
    )
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    try {
      const result = await utils.coupon.validate.fetch({ code: couponCode, orderTotal: subtotal })
      setAppliedCoupon(result)
      if (result.valid) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error('Invalid coupon')
    }
  }

  const handlePlaceOrder = async () => {
    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.addressLine1 || !shippingAddress.city) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    createOrder.mutate({
      items: items.map(item => ({
        productId: item.productId,
        productName: item.product?.name || '',
        productImage: item.product?.images ? JSON.parse(item.product.images as string)[0] : '',
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.product ? Number(item.product.price) : 0,
      })),
      shippingAddress,
      paymentMethod,
      couponCode: appliedCoupon?.valid ? couponCode : undefined,
      subtotal,
      shipping,
      discount,
      total,
    })
  }

  const inputClass = "w-full border border-black/30 px-3 py-2.5 text-[13px] outline-none focus:border-black transition-colors"
  const labelClass = "text-[11px] font-medium tracking-[0.08em] mb-1.5 block"

  return (
    <div className="min-h-screen pt-[72px] bg-white">
      <div className="px-4 sm:px-6 lg:px-10 py-8 border-b border-black">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2 text-[11px] font-medium tracking-[0.08em] text-black/50 hover:text-black transition-colors mb-4"
          >
            <ArrowLeft size={14} /> BACK TO BAG
          </button>
          <h1 className="text-[clamp(24px,3vw,36px)] font-light tracking-[-0.02em]">
            Checkout
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
        {/* Progress */}
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => setStep('shipping')}
            className={`flex items-center gap-2 text-[12px] font-medium tracking-[0.08em] ${step === 'shipping' ? 'text-black' : 'text-black/40'}`}
          >
            <Truck size={14} /> SHIPPING
          </button>
          <span className="text-black/20">&mdash;</span>
          <button
            onClick={() => { if (shippingAddress.fullName) setStep('payment') }}
            className={`flex items-center gap-2 text-[12px] font-medium tracking-[0.08em] ${step === 'payment' ? 'text-black' : 'text-black/40'}`}
          >
            <CreditCard size={14} /> PAYMENT
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Form */}
          <div className="lg:col-span-2">
            {step === 'shipping' ? (
              <div className="space-y-6">
                <h2 className="text-[16px] font-medium tracking-[0.02em]">Shipping Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>FULL NAME *</label>
                    <input type="text" value={shippingAddress.fullName} onChange={e => setShippingAddress(a => ({ ...a, fullName: e.target.value }))} className={inputClass} placeholder="John Doe" />
                  </div>
                  <div>
                    <label className={labelClass}>PHONE *</label>
                    <input type="tel" value={shippingAddress.phone} onChange={e => setShippingAddress(a => ({ ...a, phone: e.target.value }))} className={inputClass} placeholder="+91 98765 43210" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>ADDRESS LINE 1 *</label>
                    <input type="text" value={shippingAddress.addressLine1} onChange={e => setShippingAddress(a => ({ ...a, addressLine1: e.target.value }))} className={inputClass} placeholder="123 Main Street" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>ADDRESS LINE 2</label>
                    <input type="text" value={shippingAddress.addressLine2} onChange={e => setShippingAddress(a => ({ ...a, addressLine2: e.target.value }))} className={inputClass} placeholder="Apartment, suite, etc. (optional)" />
                  </div>
                  <div>
                    <label className={labelClass}>CITY *</label>
                    <input type="text" value={shippingAddress.city} onChange={e => setShippingAddress(a => ({ ...a, city: e.target.value }))} className={inputClass} placeholder="Mumbai" />
                  </div>
                  <div>
                    <label className={labelClass}>STATE *</label>
                    <input type="text" value={shippingAddress.state} onChange={e => setShippingAddress(a => ({ ...a, state: e.target.value }))} className={inputClass} placeholder="Maharashtra" />
                  </div>
                  <div>
                    <label className={labelClass}>POSTAL CODE *</label>
                    <input type="text" value={shippingAddress.postalCode} onChange={e => setShippingAddress(a => ({ ...a, postalCode: e.target.value }))} className={inputClass} placeholder="400001" />
                  </div>
                  <div>
                    <label className={labelClass}>COUNTRY</label>
                    <input type="text" value={shippingAddress.country} disabled className={`${inputClass} bg-black/5`} />
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.addressLine1 || !shippingAddress.city) {
                      toast.error('Please fill in all required fields')
                      return
                    }
                    setStep('payment')
                  }}
                  className="w-full sm:w-auto px-8 py-3 bg-black text-white text-[12px] font-medium tracking-[0.1em] hover:bg-black/90 transition-colors"
                >
                  CONTINUE TO PAYMENT
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-[16px] font-medium tracking-[0.02em]">Payment Method</h2>
                <div className="space-y-3">
                  <button onClick={() => setPaymentMethod('cod')} className={`w-full flex items-center gap-4 p-4 border transition-colors ${paymentMethod === 'cod' ? 'border-black bg-black/5' : 'border-black/20 hover:border-black/40'}`}>
                    <Truck size={20} />
                    <div className="text-left">
                      <p className="text-[13px] font-medium">Cash on Delivery</p>
                      <p className="text-[11px] text-black/50">Pay when you receive your order</p>
                    </div>
                  </button>
                  <button onClick={() => setPaymentMethod('online')} className={`w-full flex items-center gap-4 p-4 border transition-colors ${paymentMethod === 'online' ? 'border-black bg-black/5' : 'border-black/20 hover:border-black/40'}`}>
                    <CreditCard size={20} />
                    <div className="text-left">
                      <p className="text-[13px] font-medium">Online Payment</p>
                      <p className="text-[11px] text-black/50">Pay securely with card/UPI</p>
                    </div>
                  </button>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setStep('shipping')} className="px-6 py-3 border border-black text-[12px] font-medium tracking-[0.1em] hover:bg-black/5 transition-colors">
                    BACK
                  </button>
                  <button onClick={handlePlaceOrder} disabled={isSubmitting} className="flex-1 py-3 bg-black text-white text-[12px] font-medium tracking-[0.1em] hover:bg-black/90 transition-colors disabled:opacity-50">
                    {isSubmitting ? 'PROCESSING...' : `PLACE ORDER — $${total.toFixed(2)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="lg:sticky lg:top-[80px] lg:self-start">
            <div className="border border-black p-6">
              <h2 className="text-[14px] font-medium tracking-[0.1em] mb-6">ORDER SUMMARY</h2>

              <div className="space-y-3 mb-6 pb-6 border-b border-black/10 max-h-[300px] overflow-y-auto">
                {items.map((item) => {
                  const images = item.product?.images ? JSON.parse(item.product.images as string) : []
                  const price = item.product ? Number(item.product.price) : 0
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-14 h-14 bg-[#f5f5f5] shrink-0 overflow-hidden">
                        <img src={images[0] || ''} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-medium truncate">{item.product?.name}</p>
                        <p className="text-[11px] text-black/50">{item.size} / {item.color} &times; {item.quantity}</p>
                        <p className="text-[12px]">${(price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mb-6 pb-6 border-b border-black/10">
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 flex-1 border border-black/30 px-3">
                    <Tag size={14} className="text-black/30" />
                    <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder="COUPON CODE" className="flex-1 text-[12px] outline-none py-2 bg-transparent" />
                  </div>
                  <button onClick={handleApplyCoupon} className="px-4 py-2 border border-black text-[11px] font-medium tracking-[0.08em] hover:bg-black hover:text-white transition-colors">
                    APPLY
                  </button>
                </div>
                {appliedCoupon?.valid && (
                  <p className="text-[11px] text-green-700 mt-2">Coupon applied: -${appliedCoupon.discount.toFixed(2)}</p>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-[13px]"><span className="text-black/60">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-[13px]"><span className="text-black/60">Shipping</span><span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span></div>
                {discount > 0 && <div className="flex justify-between text-[13px]"><span className="text-black/60">Discount</span><span className="text-green-700">-${discount.toFixed(2)}</span></div>}
              </div>
              <div className="flex justify-between text-[16px] font-medium pt-4 border-t border-black">
                <span>Total</span><span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
