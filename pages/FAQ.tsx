import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

const faqs = [
  { q: 'What is your shipping policy?', a: 'We offer free shipping on all orders over $100. For orders below $100, a flat shipping fee of $10 applies. Orders are typically dispatched within 1-2 business days and delivered within 5-7 business days within India.' },
  { q: 'How do I choose the right size?', a: 'All our products feature an oversized, relaxed fit. We recommend checking the size guide on each product page. Our model is 6\'1 and wears a size L for reference. If you prefer a more fitted look, consider sizing down.' },
  { q: 'What is your return policy?', a: 'We accept returns within 30 days of delivery. Items must be unworn, unwashed, and have all original tags attached. Simply initiate a return from your account dashboard or contact our support team.' },
  { q: 'What materials do you use?', a: 'We use 100% organic cotton ranging from 240gsm to 400gsm depending on the garment. All our fabrics are OEKO-TEX certified, pre-shrunk, and garment-washed for softness and longevity.' },
  { q: 'How should I care for my garments?', a: 'Machine wash cold with like colors. Hang dry for best results. Avoid bleach and harsh detergents. Our garments are pre-shrunk, but proper care will extend their lifespan significantly.' },
  { q: 'Do you offer wholesale or bulk orders?', a: 'Yes, we offer wholesale pricing for retail partners. Please contact us at wholesale@noirthreads.com with your business details and we will get back to you within 48 hours.' },
  { q: 'Can I modify or cancel my order?', a: 'Orders can be modified or cancelled within 2 hours of placement. After that, the order enters our fulfillment process and cannot be changed. Contact support immediately if you need assistance.' },
  { q: 'Do you ship internationally?', a: 'Currently we ship within India only. We are working on expanding to international markets. Sign up for our newsletter to be notified when international shipping becomes available.' },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="min-h-screen pt-[72px] bg-white">
      <div className="px-4 sm:px-6 lg:px-10 py-8 border-b border-black">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-[clamp(28px,4vw,48px)] font-light tracking-[-0.02em]">FAQ</h1>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
        <div className="space-y-[1px] bg-black">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-[#fafafa] transition-colors"
              >
                <span className="text-[14px] font-medium">{faq.q}</span>
                {openIndex === i ? <Minus size={16} /> : <Plus size={16} />}
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5">
                  <p className="text-[13px] text-black/60 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
