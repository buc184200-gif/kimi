import { Link } from 'react-router'
import { Check } from 'lucide-react'

const values = [
  { title: 'No Compromise', desc: 'We source only the finest organic cotton and manufacture in facilities that meet the highest standards of ethical production.' },
  { title: 'Timeless Design', desc: 'No logos, no seasonal collections, no trend-chasing. Just garments designed to look better with every wash and every year.' },
  { title: 'Radical Transparency', desc: 'We publish our full supply chain, our cost breakdowns, and our environmental impact. You deserve to know what you are wearing.' },
]

export default function About() {
  return (
    <div className="min-h-screen pt-[72px] bg-white">
      {/* Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-2 border-b border-black">
        <div className="flex items-center px-6 sm:px-10 lg:px-16 py-20 lg:py-0">
          <div>
            <p className="text-[11px] tracking-[0.28em] text-black/50 uppercase mb-6">About NOIR THREADS</p>
            <h1 className="text-[clamp(32px,5vw,56px)] font-light tracking-[-0.03em] leading-tight mb-6">
              We make clothes<br />that outlast trends.
            </h1>
            <p className="text-[15px] text-black/60 leading-relaxed max-w-md">
              Founded in 2024, NOIR THREADS was born from a simple frustration: the endless cycle of disposable fashion. We set out to create the perfect basics — garments so well-made, so precisely engineered, that they render everything else in your drawer obsolete.
            </p>
          </div>
        </div>
        <div className="aspect-[4/3] lg:aspect-auto overflow-hidden">
          <img src="/images/about-editorial.jpg" alt="NOIR THREADS" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Values */}
      <div className="px-4 sm:px-6 lg:px-10 py-20 sm:py-28">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-[clamp(24px,3vw,36px)] font-light tracking-[-0.02em] mb-12 border-b border-black pb-4">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((v) => (
              <div key={v.title} className="border border-black p-6">
                <h3 className="text-[16px] font-medium mb-3">{v.title}</h3>
                <p className="text-[13px] text-black/60 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fabric section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 border-t border-black">
        <div className="aspect-[16/9] lg:aspect-auto overflow-hidden">
          <img src="/images/detail-fabric.jpg" alt="Fabric detail" className="w-full h-full object-cover" />
        </div>
        <div className="flex items-center px-6 sm:px-10 lg:px-16 py-20 lg:py-0">
          <div>
            <h2 className="text-[clamp(24px,3vw,36px)] font-light tracking-[-0.02em] mb-6">
              The Fabric
            </h2>
            <p className="text-[15px] text-black/60 leading-relaxed max-w-md mb-6">
              Our heavyweight cotton ranges from 240gsm to 400gsm, making each garment substantial, durable, and impossibly comfortable. The fabric is pre-shrunk, garment-washed, and tested for colorfastness.
            </p>
            <div className="space-y-2">
              {['100% Organic Cotton', 'OEKO-TEX Certified', 'Pre-shrunk', 'Garment-dyed'].map((item) => (
                <div key={item} className="flex items-center gap-2 text-[13px]">
                  <Check size={14} />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 sm:px-6 lg:px-10 py-20 sm:py-28 bg-[#f5f5f5]">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-[clamp(24px,3vw,36px)] font-light tracking-[-0.02em] mb-6">
            Experience the difference.
          </h2>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white text-[12px] font-medium tracking-[0.14em] hover:bg-black/90 transition-colors"
          >
            SHOP THE COLLECTION
          </Link>
        </div>
      </div>
    </div>
  )
}
