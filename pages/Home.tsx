import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { trpc } from '@/providers/trpc'
import { Star, ArrowRight, Truck, Shield, RotateCcw } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!contentRef.current) return
    const ctx = gsap.context(() => {
      gsap.from(contentRef.current!.children, {
        y: 40,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: 'power3.out',
        delay: 0.3,
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-[100dvh] flex items-center bg-black overflow-hidden"
    >
      <div className="absolute inset-0">
        <img
          src="/images/hero-model.jpg"
          alt="NOIR THREADS"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      </div>

      <div
        ref={contentRef}
        className="relative z-10 w-full px-4 sm:px-6 lg:px-10 pt-20"
      >
        <span className="inline-block text-[11px] font-medium tracking-[0.28em] text-white/70 uppercase mb-6">
          Premium Essentials &middot; Est. 2024
        </span>

        <h1 className="text-[clamp(40px,7vw,96px)] font-light tracking-[-0.03em] leading-[1.02] text-white max-w-3xl mb-6">
          Where quality
          <br />
          meets silence.
        </h1>

        <p className="text-[clamp(14px,1.2vw,18px)] font-light leading-relaxed text-white/80 max-w-md mb-10">
          Engineered essentials in heavyweight cotton. No logos. No noise. Just fabric that speaks for itself.
        </p>

        <div className="flex flex-wrap gap-4">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black text-[12px] font-medium tracking-[0.14em] hover:bg-white/90 transition-colors"
          >
            SHOP NOW <ArrowRight size={14} />
          </Link>
          <Link
            to="/about"
            className="inline-flex items-center gap-2 px-8 py-4 border border-white text-white text-[12px] font-medium tracking-[0.14em] hover:bg-white/10 transition-colors"
          >
            OUR STORY
          </Link>
        </div>
      </div>
    </section>
  )
}

function FeaturedProducts() {
  const { data: products = [] } = trpc.product.getFeatured.useQuery()
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || products.length === 0) return
    const ctx = gsap.context(() => {
      gsap.from('.featured-item', {
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          once: true,
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [products])

  return (
    <section ref={sectionRef} className="py-20 sm:py-28 px-4 sm:px-6 lg:px-10 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12 border-b border-black pb-4">
          <h2 className="text-[clamp(24px,3vw,36px)] font-light tracking-[-0.02em]">
            Featured
          </h2>
          <Link
            to="/products"
            className="text-[11px] font-medium tracking-[0.1em] hover:opacity-40 transition-opacity flex items-center gap-1"
          >
            VIEW ALL <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-black">
          {products.map((product) => {
            const images = product.images ? JSON.parse(product.images as string) : []
            const colors = product.colors ? JSON.parse(product.colors as string) : []
            return (
              <Link
                key={product.id}
                to={`/products/${product.slug}`}
                className="featured-item group bg-white block"
              >
                <div className="relative aspect-square overflow-hidden bg-[#f5f5f5]">
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
                      <p className="text-[11px] tracking-[0.15em] text-black/50 uppercase mb-1">
                        {product.weight}
                      </p>
                      <h3 className="text-[15px] font-medium tracking-[-0.01em]">
                        {product.name}
                      </h3>
                    </div>
                    <span className="text-[14px] font-medium whitespace-nowrap">
                      ${product.price}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {colors.map((c: { hex: string }) => (
                      <span
                        key={c.hex}
                        className="w-3 h-3 border border-black/20"
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function NewArrivals() {
  const { data: products = [] } = trpc.product.getNewArrivals.useQuery()
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || products.length === 0) return
    const ctx = gsap.context(() => {
      gsap.from('.new-item', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          once: true,
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [products])

  if (products.length === 0) return null

  return (
    <section ref={sectionRef} className="py-20 sm:py-28 px-4 sm:px-6 lg:px-10 bg-[#f5f5f5]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12 border-b border-black pb-4">
          <h2 className="text-[clamp(24px,3vw,36px)] font-light tracking-[-0.02em]">
            New Arrivals
          </h2>
          <Link
            to="/products?sort=newest"
            className="text-[11px] font-medium tracking-[0.1em] hover:opacity-40 transition-opacity flex items-center gap-1"
          >
            VIEW ALL <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-black">
          {products.map((product) => {
            const images = product.images ? JSON.parse(product.images as string) : []
            return (
              <Link
                key={product.id}
                to={`/products/${product.slug}`}
                className="new-item group bg-white block"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-[#f5f5f5]">
                  <img
                    src={images[0] || '/images/tee-black.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-4 border-t border-black">
                  <h3 className="text-[14px] font-medium">{product.name}</h3>
                  <p className="text-[13px] text-black/50 mt-1">${product.price}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function CategoriesSection() {
  const { data: categories = [] } = trpc.product.getCategories.useQuery()
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return
    const ctx = gsap.context(() => {
      gsap.from('.cat-item', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          once: true,
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-20 sm:py-28 px-4 sm:px-6 lg:px-10 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-[clamp(24px,3vw,36px)] font-light tracking-[-0.02em] mb-12 border-b border-black pb-4">
          Shop by Category
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-black">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="cat-item group relative aspect-[16/10] overflow-hidden bg-white block"
            >
              <img
                src={cat.image || '/images/cat-tees.jpg'}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-white text-[20px] font-medium tracking-[0.05em] mb-2">
                    {cat.name}
                  </h3>
                  <span className="text-white/70 text-[11px] tracking-[0.1em] uppercase group-hover:text-white transition-colors">
                    Explore &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return
    const ctx = gsap.context(() => {
      gsap.from('.feature-text', {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          once: true,
        },
      })
      gsap.from('.feature-image', {
        scale: 1.05,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          once: true,
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="grid grid-cols-1 lg:grid-cols-2 border-t border-black">
      <div className="feature-text flex items-center px-6 sm:px-10 lg:px-16 py-20 lg:py-0">
        <div>
          <h2 className="text-[clamp(28px,4vw,48px)] font-light tracking-[-0.02em] leading-tight mb-6">
            We engineer essentials.
          </h2>
          <p className="text-[15px] text-black/60 leading-relaxed max-w-md mb-8">
            Fabric, cut, and durability tested to outlast trends. Every garment is constructed with obsessive attention to detail — from the weight of the cotton to the angle of the shoulder seam.
          </p>
          <div className="flex flex-wrap gap-6">
            {['280-400gsm', 'Pre-shrunk', 'Garment-dyed', 'Reinforced'].map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-medium tracking-[0.15em] uppercase border border-black px-3 py-1.5"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="feature-image aspect-[4/3] lg:aspect-auto overflow-hidden">
        <img
          src="/images/about-editorial.jpg"
          alt="NOIR THREADS Editorial"
          className="w-full h-full object-cover"
        />
      </div>
    </section>
  )
}

function ReviewsSection() {
  const reviews = [
    { name: "Marcus T.", text: "The heavyweight tee is unlike anything I've worn. The fabric has real substance — you can feel the quality immediately.", rating: 5 },
    { name: "Sofia K.", text: "Finally, basics that actually last. Washed mine 20+ times and it still looks brand new. No stretching, no fading.", rating: 5 },
    { name: "James L.", text: "The fit is perfect. Oversized but not sloppy. The dropped shoulder detail makes it feel designed, not just manufactured.", rating: 5 },
  ]
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return
    const ctx = gsap.context(() => {
      gsap.from('.review-card', {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          once: true,
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-20 sm:py-28 px-4 sm:px-6 lg:px-10 bg-[#f5f5f5]">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-[clamp(24px,3vw,36px)] font-light tracking-[-0.02em] mb-12 border-b border-black pb-4">
          What they say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <div key={i} className="review-card bg-white p-6 border border-black">
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: review.rating }).map((_, j) => (
                  <Star key={j} size={12} className="fill-black" />
                ))}
              </div>
              <p className="text-[14px] leading-relaxed text-black/70 mb-4">
                &ldquo;{review.text}&rdquo;
              </p>
              <p className="text-[11px] font-medium tracking-[0.1em] uppercase">
                {review.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TrustBadges() {
  const badges = [
    { icon: Truck, label: "Free Shipping", desc: "On orders over $100" },
    { icon: Shield, label: "Premium Quality", desc: "280-400gsm fabrics" },
    { icon: RotateCcw, label: "Easy Returns", desc: "30-day return policy" },
  ]

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-10 bg-white border-t border-black">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
        {badges.map((badge) => (
          <div key={badge.label} className="flex items-center gap-4">
            <badge.icon size={24} className="text-black/60" />
            <div>
              <p className="text-[13px] font-medium">{badge.label}</p>
              <p className="text-[12px] text-black/50">{badge.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <div>
      <HeroSection />
      <FeaturedProducts />
      <FeatureSection />
      <NewArrivals />
      <CategoriesSection />
      <ReviewsSection />
      <TrustBadges />
    </div>
  )
}
