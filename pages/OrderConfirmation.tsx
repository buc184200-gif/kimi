import { useParams, Link } from 'react-router'
import { trpc } from '@/providers/trpc'
import { CheckCircle, Package, Clock, ArrowRight } from 'lucide-react'

export default function OrderConfirmation() {
  const { orderNumber } = useParams<{ orderNumber: string }>()
  const { data: order, isLoading } = trpc.order.getByNumber.useQuery(
    { orderNumber: orderNumber || '' },
    { enabled: !!orderNumber }
  )

  if (isLoading) {
    return (
      <div className="min-h-screen pt-[72px] flex items-center justify-center">
        <div className="animate-pulse text-[13px] tracking-[0.08em]">LOADING...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-[72px] flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-[24px] font-light tracking-[-0.02em] mb-2">Order not found</h2>
          <Link to="/products" className="text-[12px] font-medium tracking-[0.08em] underline">
            CONTINUE SHOPPING
          </Link>
        </div>
      </div>
    )
  }

  const shippingAddress = order.shippingAddress ? JSON.parse(order.shippingAddress as string) : {}
  const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']
  const currentStep = statusSteps.indexOf(order.status)

  return (
    <div className="min-h-screen pt-[72px] bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Success header */}
        <div className="text-center mb-12">
          <CheckCircle size={48} className="mx-auto mb-4" />
          <h1 className="text-[clamp(24px,4vw,40px)] font-light tracking-[-0.02em] mb-2">
            Order Confirmed
          </h1>
          <p className="text-[14px] text-black/60">
            Thank you for your purchase. Your order has been received.
          </p>
        </div>

        {/* Order number */}
        <div className="border border-black p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-[11px] tracking-[0.1em] text-black/50 mb-1">ORDER NUMBER</p>
              <p className="text-[18px] font-medium tracking-[0.05em]">{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-[11px] tracking-[0.1em] text-black/50 mb-1">ORDER DATE</p>
              <p className="text-[14px]">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-[11px] tracking-[0.1em] text-black/50 mb-1">TOTAL</p>
              <p className="text-[18px] font-medium">${Number(order.total).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Tracking progress */}
        <div className="mb-8">
          <p className="text-[11px] tracking-[0.1em] text-black/50 mb-4">ORDER STATUS</p>
          <div className="flex items-center gap-1">
            {statusSteps.map((step, i) => (
              <div key={step} className="flex-1 flex items-center">
                <div className={`w-8 h-8 flex items-center justify-center border ${
                  i <= currentStep ? 'bg-black text-white border-black' : 'border-black/20 text-black/30'
                }`}>
                  {i < currentStep ? (
                    <CheckCircle size={14} />
                  ) : i === currentStep ? (
                    <Clock size={14} />
                  ) : (
                    <Package size={14} />
                  )}
                </div>
                {i < statusSteps.length - 1 && (
                  <div className={`flex-1 h-[2px] mx-1 ${i < currentStep ? 'bg-black' : 'bg-black/10'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {statusSteps.map((step, i) => (
              <span key={step} className={`text-[9px] tracking-[0.05em] uppercase ${
                i <= currentStep ? 'text-black' : 'text-black/30'
              }`}>
                {step}
              </span>
            ))}
          </div>
        </div>

        {/* Items */}
        <div className="border border-black mb-8">
          <div className="px-4 py-3 border-b border-black bg-[#fafafa]">
            <p className="text-[11px] font-medium tracking-[0.1em]">ITEMS ({order.items?.length || 0})</p>
          </div>
          {order.items?.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 border-b border-black/10 last:border-0">
              <div className="w-16 h-16 bg-[#f5f5f5] shrink-0 overflow-hidden">
                <img src={item.productImage || ''} alt={item.productName} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-medium">{item.productName}</p>
                <p className="text-[11px] text-black/50">
                  Size: {item.size} &middot; Color: {item.color} &times; {item.quantity}
                </p>
                <p className="text-[13px] mt-1">${Number(item.total).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Shipping address */}
        <div className="border border-black p-6 mb-8">
          <p className="text-[11px] tracking-[0.1em] text-black/50 mb-3">SHIPPING ADDRESS</p>
          <p className="text-[14px]">{shippingAddress.fullName}</p>
          <p className="text-[13px] text-black/60">{shippingAddress.phone}</p>
          <p className="text-[13px] text-black/60 mt-1">{shippingAddress.addressLine1}</p>
          {shippingAddress.addressLine2 && <p className="text-[13px] text-black/60">{shippingAddress.addressLine2}</p>}
          <p className="text-[13px] text-black/60">
            {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
          </p>
          <p className="text-[13px] text-black/60">{shippingAddress.country}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/products"
            className="flex-1 text-center py-3 border border-black text-[12px] font-medium tracking-[0.1em] hover:bg-black hover:text-white transition-colors"
          >
            CONTINUE SHOPPING
          </Link>
          <Link
            to="/dashboard"
            className="flex-1 text-center py-3 bg-black text-white text-[12px] font-medium tracking-[0.1em] hover:bg-black/90 transition-colors flex items-center justify-center gap-2"
          >
            VIEW ORDERS <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  )
}
