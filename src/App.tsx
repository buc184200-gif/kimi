import { Routes, Route } from 'react-router'
import { Toaster } from '@/components/ui/sonner'
import { CartProvider } from '@/hooks/useCart'
import { Suspense, lazy } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

// Layout
import Layout from '@/components/Layout'

// Pages - eager loaded for performance
import Home from '@/pages/Home'
import Products from '@/pages/Products'
import ProductDetail from '@/pages/ProductDetail'
import Cart from '@/pages/Cart'
import Checkout from '@/pages/Checkout'
import OrderConfirmation from '@/pages/OrderConfirmation'
import Login from '@/pages/Login'
import About from '@/pages/About'
import Contact from '@/pages/Contact'
import FAQ from '@/pages/FAQ'
import Privacy from '@/pages/Privacy'
import Terms from '@/pages/Terms'
import Returns from '@/pages/Returns'

// Lazy loaded pages
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'))

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="space-y-4 w-64">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  )
}

function App() {
  return (
    <CartProvider>
      <Toaster position="bottom-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmation />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/dashboard" element={<Suspense fallback={<LoadingFallback />}><Dashboard /></Suspense>} />
          <Route path="/admin" element={<Suspense fallback={<LoadingFallback />}><AdminDashboard /></Suspense>} />
        </Route>
      </Routes>
    </CartProvider>
  )
}

export default App
