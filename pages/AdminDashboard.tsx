import { useState, useEffect } from 'react'
import { trpc } from '@/providers/trpc'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router'
import {
  BarChart3, Package, Users, DollarSign, ShoppingBag,
  MessageSquare, Tag
} from 'lucide-react'
import { toast } from 'sonner'

type AdminTab = 'overview' | 'orders' | 'products' | 'coupons' | 'messages'

export default function AdminDashboard() {
  const { isAdmin, isLoading: authLoading } = useAuth({ redirectPath: '/' })
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [orderStatusFilter, setOrderStatusFilter] = useState('')

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/')
    }
  }, [authLoading, isAdmin, navigate])

  const { data: stats } = trpc.analytics.dashboard.useQuery(undefined, { enabled: isAdmin })
  const { data: ordersData } = trpc.order.listAll.useQuery(
    { status: orderStatusFilter || undefined, page: 1, limit: 20 },
    { enabled: isAdmin && activeTab === 'orders' }
  )
  const { data: productList } = trpc.product.list.useQuery(
    { page: 1, limit: 50 },
    { enabled: isAdmin && (activeTab === 'products' || activeTab === 'overview') }
  )
  const { data: couponList } = trpc.coupon.list.useQuery(undefined, { enabled: isAdmin && activeTab === 'coupons' })
  const { data: messageList } = trpc.contact.list.useQuery(undefined, { enabled: isAdmin && activeTab === 'messages' })
  const { data: topProducts } = trpc.analytics.topProducts.useQuery(undefined, { enabled: isAdmin && activeTab === 'overview' })
  const { data: salesPeriod } = trpc.analytics.salesByPeriod.useQuery(undefined, { enabled: isAdmin && activeTab === 'overview' })

  const utils = trpc.useUtils()

  const updateOrderStatus = trpc.order.updateStatus.useMutation({
    onSuccess: () => {
      utils.order.listAll.invalidate()
      utils.analytics.dashboard.invalidate()
      toast.success('Order status updated')
    },
  })

  const updateMessageStatus = trpc.contact.updateStatus.useMutation({
    onSuccess: () => {
      utils.contact.list.invalidate()
      toast.success('Message status updated')
    },
  })

  const deleteCoupon = trpc.coupon.delete.useMutation({
    onSuccess: () => {
      utils.coupon.list.invalidate()
      toast.success('Coupon deleted')
    },
  })

  if (authLoading) {
    return (
      <div className="min-h-screen pt-[72px] flex items-center justify-center">
        <div className="animate-pulse text-[13px] tracking-[0.08em]">LOADING...</div>
      </div>
    )
  }

  if (!isAdmin) return null

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
  }

  const tabs = [
    { id: 'overview' as AdminTab, label: 'Overview', icon: BarChart3 },
    { id: 'orders' as AdminTab, label: 'Orders', icon: ShoppingBag },
    { id: 'products' as AdminTab, label: 'Products', icon: Package },
    { id: 'coupons' as AdminTab, label: 'Coupons', icon: Tag },
    { id: 'messages' as AdminTab, label: 'Messages', icon: MessageSquare },
  ]

  // Calculate max revenue safely
  const maxRevenue = salesPeriod && salesPeriod.length > 0
    ? Math.max(...salesPeriod.map(d => d.revenue))
    : 0

  return (
    <div className="min-h-screen pt-[72px] bg-[#f5f5f5]">
      <div className="px-4 sm:px-6 lg:px-10 py-6 bg-white border-b border-black">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-[clamp(20px,2.5vw,28px)] font-light tracking-[-0.02em]">
            Admin Dashboard
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-[11px] font-medium tracking-[0.08em] whitespace-nowrap border transition-colors ${
                activeTab === tab.id
                  ? 'bg-black text-white border-black'
                  : 'bg-white border-black/20 hover:border-black'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1px] bg-black">
              {[
                { label: 'Total Revenue', value: `$${(stats?.totalRevenue || 0).toFixed(2)}`, icon: DollarSign },
                { label: 'Total Orders', value: stats?.totalOrders || 0, icon: ShoppingBag },
                { label: 'Customers', value: stats?.totalCustomers || 0, icon: Users },
                { label: 'Products', value: stats?.totalProducts || 0, icon: Package },
              ].map((stat) => (
                <div key={stat.label} className="bg-white p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] tracking-[0.08em] text-black/50">{stat.label.toUpperCase()}</span>
                    <stat.icon size={16} className="text-black/30" />
                  </div>
                  <p className="text-[24px] font-light">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Sales chart */}
            {salesPeriod && salesPeriod.length > 0 && (
              <div className="bg-white border border-black p-6">
                <h3 className="text-[14px] font-medium tracking-[0.05em] mb-6">Last 7 Days Sales</h3>
                <div className="flex items-end gap-2 h-[200px]">
                  {salesPeriod.map((day) => (
                    <div key={day.label} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-black/10 relative"
                        style={{ height: `${Math.max(20, maxRevenue > 0 ? (day.revenue / maxRevenue) * 160 : 20)}px` }}
                      >
                        <div className="absolute bottom-0 left-0 right-0 bg-black transition-all" style={{ height: '100%' }} />
                      </div>
                      <span className="text-[9px] text-black/40">{day.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top products */}
            {topProducts && topProducts.length > 0 && (
              <div className="bg-white border border-black p-6">
                <h3 className="text-[14px] font-medium tracking-[0.05em] mb-4">Top Selling Products</h3>
                <div className="space-y-3">
                  {topProducts.map((p, i) => (
                    <div key={p.name} className="flex items-center gap-4">
                      <span className="text-[11px] text-black/30 w-4">{i + 1}</span>
                      <span className="flex-1 text-[13px]">{p.name}</span>
                      <span className="text-[12px] text-black/50">{p.sold} sold</span>
                      <span className="text-[12px] font-medium">${Number(p.revenue || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Orders */}
        {activeTab === 'orders' && (
          <div>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-[11px] tracking-[0.08em]">FILTER:</span>
              {['', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setOrderStatusFilter(status)}
                  className={`text-[10px] tracking-[0.08em] px-2 py-1 border transition-colors ${
                    orderStatusFilter === status ? 'bg-black text-white border-black' : 'border-black/20 hover:border-black'
                  }`}
                >
                  {status.toUpperCase() || 'ALL'}
                </button>
              ))}
            </div>

            <div className="bg-white border border-black overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-black">
                    <th className="text-left text-[10px] tracking-[0.1em] font-medium px-4 py-3">ORDER</th>
                    <th className="text-left text-[10px] tracking-[0.1em] font-medium px-4 py-3">DATE</th>
                    <th className="text-left text-[10px] tracking-[0.1em] font-medium px-4 py-3">TOTAL</th>
                    <th className="text-left text-[10px] tracking-[0.1em] font-medium px-4 py-3">STATUS</th>
                    <th className="text-left text-[10px] tracking-[0.1em] font-medium px-4 py-3">PAYMENT</th>
                    <th className="text-left text-[10px] tracking-[0.1em] font-medium px-4 py-3">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersData?.orders.map((order) => (
                    <tr key={order.id} className="border-b border-black/10 last:border-0">
                      <td className="px-4 py-3 text-[12px] font-medium">{order.orderNumber}</td>
                      <td className="px-4 py-3 text-[12px] text-black/50">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-[12px]">${Number(order.total).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] tracking-[0.05em] px-2 py-0.5 ${statusColors[order.status] || 'bg-gray-100'}`}>
                          {order.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-black/50 capitalize">{order.paymentMethod} &middot; {order.paymentStatus}</td>
                      <td className="px-4 py-3">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus.mutate({ id: order.id, status: e.target.value as any })}
                          className="text-[11px] border border-black/20 px-2 py-1 outline-none focus:border-black"
                        >
                          {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products */}
        {activeTab === 'products' && (
          <div>
            <div className="bg-white border border-black overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-black">
                    <th className="text-left text-[10px] tracking-[0.1em] font-medium px-4 py-3">PRODUCT</th>
                    <th className="text-left text-[10px] tracking-[0.1em] font-medium px-4 py-3">PRICE</th>
                    <th className="text-left text-[10px] tracking-[0.1em] font-medium px-4 py-3">STOCK</th>
                    <th className="text-left text-[10px] tracking-[0.1em] font-medium px-4 py-3">SOLD</th>
                    <th className="text-left text-[10px] tracking-[0.1em] font-medium px-4 py-3">RATING</th>
                    <th className="text-left text-[10px] tracking-[0.1em] font-medium px-4 py-3">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {productList?.products.map((p) => {
                    const inventory = p.inventory ? JSON.parse(p.inventory as string) as Record<string, number> : {}
                    const totalStock = Object.values(inventory).reduce((a: number, b: number) => a + b, 0)
                    return (
                      <tr key={p.id} className="border-b border-black/10 last:border-0">
                        <td className="px-4 py-3 text-[12px] font-medium">{p.name}</td>
                        <td className="px-4 py-3 text-[12px]">${p.price}</td>
                        <td className="px-4 py-3 text-[12px]">{totalStock}</td>
                        <td className="px-4 py-3 text-[12px]">{p.soldCount}</td>
                        <td className="px-4 py-3 text-[12px]">{p.rating} ({p.reviewCount})</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] tracking-[0.05em] px-2 py-0.5 ${p.featured ? 'bg-black text-white' : 'bg-black/10'}`}>
                            {p.featured ? 'FEATURED' : 'STANDARD'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Coupons */}
        {activeTab === 'coupons' && (
          <div>
            <div className="bg-white border border-black overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-black">
                    <th className="text-left text-[10px] tracking-[0.1em] font-medium px-4 py-3">CODE</th>
                    <th className="text-left text-[10px] tracking-[0.1em] font-medium px-4 py-3">TYPE</th>
                    <th className="text-left text-[10px] tracking-[0.1em] font-medium px-4 py-3">VALUE</th>
                    <th className="text-left text-[10px] tracking-[0.1em] font-medium px-4 py-3">USED</th>
                    <th className="text-left text-[10px] tracking-[0.1em] font-medium px-4 py-3">STATUS</th>
                    <th className="text-left text-[10px] tracking-[0.1em] font-medium px-4 py-3">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {couponList?.map((c) => (
                    <tr key={c.id} className="border-b border-black/10 last:border-0">
                      <td className="px-4 py-3 text-[12px] font-medium tracking-[0.05em]">{c.code}</td>
                      <td className="px-4 py-3 text-[11px] capitalize">{c.discountType}</td>
                      <td className="px-4 py-3 text-[12px]">{c.discountType === 'percentage' ? `${c.discountValue}%` : `$${c.discountValue}`}</td>
                      <td className="px-4 py-3 text-[12px]">{c.usedCount} / {c.maxUses || '∞'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] tracking-[0.05em] px-2 py-0.5 ${c.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {c.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => deleteCoupon.mutate({ id: c.id })}
                          className="text-[10px] tracking-[0.05em] text-red-600 hover:text-red-800 transition-colors"
                        >
                          DELETE
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Messages */}
        {activeTab === 'messages' && (
          <div>
            <div className="bg-white border border-black overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-black">
                    <th className="text-left text-[10px] tracking-[0.1em] font-medium px-4 py-3">NAME</th>
                    <th className="text-left text-[10px] tracking-[0.1em] font-medium px-4 py-3">EMAIL</th>
                    <th className="text-left text-[10px] tracking-[0.1em] font-medium px-4 py-3">SUBJECT</th>
                    <th className="text-left text-[10px] tracking-[0.1em] font-medium px-4 py-3">MESSAGE</th>
                    <th className="text-left text-[10px] tracking-[0.1em] font-medium px-4 py-3">STATUS</th>
                    <th className="text-left text-[10px] tracking-[0.1em] font-medium px-4 py-3">DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {messageList?.map((msg) => (
                    <tr key={msg.id} className="border-b border-black/10 last:border-0">
                      <td className="px-4 py-3 text-[12px] font-medium">{msg.name}</td>
                      <td className="px-4 py-3 text-[11px] text-black/50">{msg.email}</td>
                      <td className="px-4 py-3 text-[12px]">{msg.subject || '-'}</td>
                      <td className="px-4 py-3 text-[12px] text-black/60 max-w-[200px] truncate">{msg.message}</td>
                      <td className="px-4 py-3">
                        <select
                          value={msg.status}
                          onChange={(e) => updateMessageStatus.mutate({ id: msg.id, status: e.target.value as any })}
                          className="text-[10px] border border-black/20 px-2 py-1 outline-none"
                        >
                          <option value="new">NEW</option>
                          <option value="read">READ</option>
                          <option value="replied">REPLIED</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-black/40">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
