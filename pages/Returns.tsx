import { Link } from 'react-router'
import { RotateCcw, Check, Clock, X } from 'lucide-react'

const steps = [
  { icon: Check, title: 'Eligibility', desc: 'Items must be unworn, unwashed, with all original tags attached. Initiate within 30 days of delivery.' },
  { icon: RotateCcw, title: 'Initiate Return', desc: 'Log into your account, go to Orders, and select the item(s) you wish to return. Print the prepaid label.' },
  { icon: Clock, title: 'Ship It Back', desc: 'Pack the items securely and attach the prepaid label. Drop off at any authorized shipping center.' },
  { icon: Check, title: 'Refund', desc: 'Once received and inspected, your refund will be processed within 7-10 business days to your original payment method.' },
]

const exclusions = [
  'Items worn, washed, or altered',
  'Items without original tags',
  'Final sale items (marked as non-returnable)',
  'Gift cards',
]

export default function Returns() {
  return (
    <div className="min-h-screen pt-[72px] bg-white">
      <div className="px-4 sm:px-6 lg:px-10 py-8 border-b border-black">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-[clamp(28px,4vw,48px)] font-light tracking-[-0.02em]">Returns & Refunds</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h2 className="text-[20px] font-light tracking-[-0.01em] mb-8">How to Return</h2>
            <div className="space-y-6">
              {steps.map((step, i) => (
                <div key={step.title} className="flex gap-4">
                  <div className="w-10 h-10 border border-black flex items-center justify-center shrink-0">
                    <step.icon size={18} />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium mb-1">{i + 1}. {step.title}</p>
                    <p className="text-[13px] text-black/60 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-[20px] font-light tracking-[-0.01em] mb-8">Return Policy</h2>
            <div className="space-y-6">
              <div className="border border-black p-6">
                <h3 className="text-[14px] font-medium mb-3">30-Day Returns</h3>
                <p className="text-[13px] text-black/60 leading-relaxed">
                  We accept returns within 30 days of delivery. All items must be in original condition with tags attached. Refunds are processed to the original payment method.
                </p>
              </div>
              <div className="border border-black p-6">
                <h3 className="text-[14px] font-medium mb-3">Free Return Shipping</h3>
                <p className="text-[13px] text-black/60 leading-relaxed">
                  We provide prepaid return labels for all domestic orders. Simply initiate the return from your account and print the label.
                </p>
              </div>
              <div className="border border-black p-6">
                <h3 className="text-[14px] font-medium mb-3 flex items-center gap-2">
                  <X size={14} /> Non-Returnable Items
                </h3>
                <ul className="space-y-1.5">
                  {exclusions.map((item) => (
                    <li key={item} className="text-[13px] text-black/60 flex items-center gap-2">
                      <span className="w-1 h-1 bg-black/40" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center border-t border-black pt-12">
          <h2 className="text-[20px] font-light tracking-[-0.01em] mb-4">Need help with a return?</h2>
          <p className="text-[13px] text-black/60 mb-6">
            Our support team is here to assist you with any return-related questions.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white text-[12px] font-medium tracking-[0.14em] hover:bg-black/90 transition-colors"
          >
            CONTACT SUPPORT
          </Link>
        </div>
      </div>
    </div>
  )
}
