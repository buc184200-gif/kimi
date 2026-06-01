import { useState } from 'react'
import { Link } from 'react-router'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'
import { Package, Heart, User, LogOut, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

type Tab = 'orders' | 'wishlist' | 'profile'

export default function Dashboard() {
  const { user, logout } = useAuth({ redirectPath: '/' })
  const [activeTab, setActiveTab] = useState<Tab>('orders')

  const { data: orders = [], isLoading: ordersLoading } = trpc.order.list.useQuery()
  const { data: wishlistItems = [], isLoading: wishlistLoading } = trpc.wishlist.list.useQuery()
  const utils = trpc.useUtils()

  const cancelOrder = trpc.order.cancel.useMutation({
    onSuccess: () => {
      utils.order.list.invalidate()
      toast.success('Order cancelled')
    },
  })

  const removeWishlist = trpc.wishlist.toggle.useMutation({
    onSuccess: () => {
      utils.wishlist.list.invalidate()
      toast.success('Removed from wishlist')
    },
  })

  const tabs = [
    { id: 'orders' as Tab, label: 'Orders', icon: Package },
    { id: 'wishlist' as Tab, label: 'Wishlist', icon: Heart },
    { id: 'profile' as Tab, label: 'Profile', icon: User },
  ]

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
  }

  return (
    <div className="min-h-screen pt-[72px] bg-[#f5f5f5]">
      <div className="px-4 sm:px-6 lg:px-10 py-8 bg-white border-b border-black">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[clamp(24px,3vw,36px)] font-light tracking-[-0.02em]">
              My Account
            </h1>
            <p className="text-[13px] text-black/50 mt-1">
              Welcome back, {user?.name || 'Guest'}
            </p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 border border-black text-[11px] font-medium tracking-[0.08em] hover:bg-black hover:text-white transition-colors"
          >
            <LogOut size={14} /> SIGN OUT
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-black">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-5 py-4 text-left text-[13px] font-medium transition-colors border-b border-black/10 last:border-0 ${
                    activeTab === tab.id ? 'bg-black text-white' : 'hover:bg-black/5'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-[18px] font-light tracking-[-0.01em] mb-6">Order History</h2>
                {ordersLoading ? (
                  <div className="animate-pulse text-[13px] text-black/50">Loading orders...</div>
                ) : orders.length === 0 ? (
                  <div className="bg-white border border-black p-8 text-center">
                    <Package size={32} className="mx-auto mb-3 text-black/20" />
                    <p className="text-[14px] text-black/50">No orders yet</p>
                    <Link to="/products" className="text-[12px] font-medium tracking-[0.08em] underline mt-2 inline-block">
                      START SHOPPING
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const shippingAddress = order.shippingAddress ? JSON.parse(order.shippingAddress as string) : {}
                      return (
                        <div key={order.id} className="bg-white border border-black">
                          <div className="px-5 py-4 border-b border-black/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-4">
                              <span className="text-[13px] font-medium">{order.orderNumber}</span>
                              <span className={`text-[10px] tracking-[0.08em] px-2 py-0.5 ${statusColors[order.status] || 'bg-gray-100'}`}>
                                {order.status.toUpperCase()}
                              </span>
                            </div>
                            <span className="text-[12px] text-black/50">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="px-5 py-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[13px]">Total: <span className="font-medium">${Number(order.total).toFixed(2)}</span></span>
                              <span className="text-[11px] text-black/50 capitalize">{order.paymentMethod} &middot; {order.paymentStatus}</span>
                            </div>
                            <p className="text-[11px] text-black/40 mb-3">
                              {shippingAddress.fullName} &middot; {shippingAddress.city}
                            </p>
                            <div className="flex gap-2">
                              <Link
                                to={`/order-confirmation/${order.orderNumber}`}
                                className="text-[11px] font-medium tracking-[0.08em] flex items-center gap-1 hover:opacity-60 transition-opacity"
                              >
                                VIEW DETAILS <ChevronRight size={12} />
                              </Link>
                              {order.status === 'pending' && (
                                <button
                                  onClick={() => cancelOrder.mutate({ id: order.id })}
                                  className="text-[11px] font-medium tracking-[0.08em] text-red-600 hover:text-red-800 transition-colors"
                                >
                                  CANCEL
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div>
                <h2 className="text-[18px] font-light tracking-[-0.01em] mb-6">My Wishlist</h2>
                {wishlistLoading ? (
                  <div className="animate-pulse text-[13px] text-black/50">Loading...</div>
                ) : wishlistItems.length === 0 ? (
                  <div className="bg-white border border-black p-8 text-center">
                    <Heart size={32} className="mx-auto mb-3 text-black/20" />
                    <p className="text-[14px] text-black/50">Your wishlist is empty</p>
                    <Link to="/products" className="text-[12px] font-medium tracking-[0.08em] underline mt-2 inline-block">
                      EXPLORE PRODUCTS
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-[1px] bg-black">
                    {wishlistItems.map((item) => {
                      const images = item.product?.images ? JSON.parse(item.product.images as string) : []
                      return (
                        <div key={item.id} className="bg-white">
                          <Link to={`/products/${item.product?.slug}`} className="block">
                            <div className="aspect-square bg-[#f5f5f5] overflow-hidden">
                              <img src={images[0] || ''} alt={item.product?.name} className="w-full h-full object-cover" />
                            </div>
                          </Link>
                          <div className="p-4">
                            <Link to={`/products/${item.product?.slug}`} className="text-[14px] font-medium hover:opacity-60 transition-opacity">
                              {item.product?.name}
                            </Link>
                            <p className="text-[13px] text-black/50 mt-1">${item.product?.price}</p>
                            <button
                              onClick={() => item.product && removeWishlist.mutate({ productId: item.product.id })}
                              className="mt-3 text-[11px] font-medium tracking-[0.08em] text-black/50 hover:text-black transition-colors"
                            >
                              REMOVE
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div>
                <h2 className="text-[18px] font-light tracking-[-0.01em] mb-6">Profile</h2>
                <div className="bg-white border border-black p-6 space-y-4">
                  <div>
                    <p className="text-[11px] tracking-[0.1em] text-black/50 mb-1">NAME</p>
                    <p className="text-[14px]">{user?.name || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] tracking-[0.1em] text-black/50 mb-1">EMAIL</p>
                    <p className="text-[14px]">{user?.email || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] tracking-[0.1em] text-black/50 mb-1">ROLE</p>
                    <p className="text-[14px] capitalize">{user?.role || 'User'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] tracking-[0.1em] text-black/50 mb-1">MEMBER SINCE</p>
                    <p className="text-[14px]">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
