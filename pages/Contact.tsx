import { useState } from 'react'
import { trpc } from '@/providers/trpc'
import { toast } from 'sonner'
import { Mail, MapPin, Phone, Send } from 'lucide-react'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const submitContact = trpc.contact.submit.useMutation({
    onSuccess: () => {
      toast.success('Message sent successfully')
      setForm({ name: '', email: '', subject: '', message: '' })
    },
    onError: (err) => toast.error(err.message),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitContact.mutate(form)
  }

  const inputClass = "w-full border border-black/30 px-4 py-3 text-[13px] outline-none focus:border-black transition-colors bg-transparent"
  const labelClass = "text-[11px] font-medium tracking-[0.08em] mb-2 block"

  return (
    <div className="min-h-screen pt-[72px] bg-white">
      <div className="px-4 sm:px-6 lg:px-10 py-8 border-b border-black">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-[clamp(28px,4vw,48px)] font-light tracking-[-0.02em]">Contact</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-[16px] font-medium mb-4">Get in Touch</h2>
              <p className="text-[13px] text-black/60 leading-relaxed">
                Have a question about sizing, an order, or just want to say hello? We would love to hear from you.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail size={16} className="mt-0.5 text-black/40" />
                <div>
                  <p className="text-[11px] tracking-[0.1em] text-black/50 mb-1">EMAIL</p>
                  <p className="text-[13px]">support@noirthreads.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={16} className="mt-0.5 text-black/40" />
                <div>
                  <p className="text-[11px] tracking-[0.1em] text-black/50 mb-1">PHONE</p>
                  <p className="text-[13px]">+91 98765 43210</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 text-black/40" />
                <div>
                  <p className="text-[11px] tracking-[0.1em] text-black/50 mb-1">STUDIO</p>
                  <p className="text-[13px] text-black/60">
                    42 Design District<br />
                    Mumbai, Maharashtra 400001<br />
                    India
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>NAME *</label>
                  <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputClass} placeholder="Your name" />
                </div>
                <div>
                  <label className={labelClass}>EMAIL *</label>
                  <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputClass} placeholder="your@email.com" />
                </div>
              </div>
              <div>
                <label className={labelClass}>SUBJECT</label>
                <input type="text" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className={inputClass} placeholder="What is this about?" />
              </div>
              <div>
                <label className={labelClass}>MESSAGE *</label>
                <textarea required value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className={`${inputClass} min-h-[150px] resize-none`} placeholder="Your message..." />
              </div>
              <button
                type="submit"
                disabled={submitContact.isPending}
                className="flex items-center gap-2 px-8 py-4 bg-black text-white text-[12px] font-medium tracking-[0.1em] hover:bg-black/90 transition-colors disabled:opacity-50"
              >
                <Send size={14} />
                {submitContact.isPending ? 'SENDING...' : 'SEND MESSAGE'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
