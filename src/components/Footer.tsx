import { Link } from 'react-router'
import { trpc } from '@/providers/trpc'
import { useState } from 'react'
import { toast } from 'sonner'
import { Instagram, Twitter, ArrowRight } from 'lucide-react'

const footerLinks = {
  shop: [
    { label: 'All Products', href: '/products' },
    { label: 'T-Shirts', href: '/products?category=t-shirts' },
    { label: 'Hoodies', href: '/products?category=hoodies' },
    { label: 'Sweatshirts', href: '/products?category=sweatshirts' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Returns & Refunds', href: '/returns' },
  ],
}

export default function Footer() {
  const [email, setEmail] = useState('')
  const subscribe = trpc.newsletter.subscribe.useMutation({
    onSuccess: (data) => {
      toast.success(data.message)
      setEmail('')
    },
    onError: (err) => toast.error(err.message),
  })

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      subscribe.mutate({ email: email.trim() })
    }
  }

  return (
    <footer className="border-t border-black bg-white">
      {/* Newsletter */}
      <div className="px-4 sm:px-6 lg:px-10 py-16 sm:py-20 border-b border-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-[clamp(28px,4vw,48px)] font-light tracking-[-0.02em] leading-tight mb-4">
                Join the collective.
              </h3>
              <p className="text-[14px] text-black/60 leading-relaxed max-w-md">
                Subscribe for early access to new drops, exclusive offers, and stories from the studio.
              </p>
            </div>
            <div className="flex items-end">
              <form onSubmit={handleSubscribe} className="w-full flex border-b border-black">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="EMAIL ADDRESS"
                  className="flex-1 bg-transparent text-[14px] tracking-[0.05em] py-4 outline-none placeholder:text-black/30"
                  required
                />
                <button
                  type="submit"
                  disabled={subscribe.isPending}
                  className="px-4 py-4 flex items-center gap-2 text-[11px] font-medium tracking-[0.08em] hover:opacity-40 transition-opacity disabled:opacity-20"
                >
                  SUBSCRIBE <ArrowRight size={14} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div className="col-span-2 sm:col-span-1">
            <Link to="/" className="text-[14px] font-semibold tracking-[0.22em] mb-6 block">
              NOIR THREADS
            </Link>
            <p className="text-[12px] text-black/50 leading-relaxed max-w-xs">
              Engineered essentials. Fabric, cut, and durability tested to outlast trends.
            </p>
          </div>

          <div>
            <h4 className="text-[11px] font-medium tracking-[0.1em] mb-4">SHOP</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-[13px] text-black/60 hover:text-black transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-medium tracking-[0.1em] mb-4">COMPANY</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-[13px] text-black/60 hover:text-black transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-medium tracking-[0.1em] mb-4">LEGAL</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-[13px] text-black/60 hover:text-black transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="px-4 sm:px-6 lg:px-10 py-6 border-t border-black">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-black/40 tracking-[0.05em]">
            &copy; {new Date().getFullYear()} NOIR THREADS. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-black/40 hover:text-black transition-colors">
              <Instagram size={16} />
            </a>
            <a href="#" className="text-black/40 hover:text-black transition-colors">
              <Twitter size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
