export default function Privacy() {
  return (
    <div className="min-h-screen pt-[72px] bg-white">
      <div className="px-4 sm:px-6 lg:px-10 py-8 border-b border-black">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-[clamp(28px,4vw,48px)] font-light tracking-[-0.02em]">Privacy Policy</h1>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-12 text-[14px] leading-relaxed text-black/70 space-y-8">
        <section>
          <h2 className="text-[16px] font-medium text-black mb-3">1. Information We Collect</h2>
          <p>We collect information you provide directly to us, including your name, email address, shipping address, phone number, and payment information when you make a purchase or create an account.</p>
        </section>
        <section>
          <h2 className="text-[16px] font-medium text-black mb-3">2. How We Use Your Information</h2>
          <p>We use the information we collect to process your orders, communicate with you about your purchases, send you marketing communications (with your consent), and improve our services.</p>
        </section>
        <section>
          <h2 className="text-[16px] font-medium text-black mb-3">3. Information Sharing</h2>
          <p>We do not sell or rent your personal information to third parties. We may share your information with service providers who help us operate our business, such as payment processors and shipping carriers.</p>
        </section>
        <section>
          <h2 className="text-[16px] font-medium text-black mb-3">4. Data Security</h2>
          <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
        </section>
        <section>
          <h2 className="text-[16px] font-medium text-black mb-3">5. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal information. You may also opt out of receiving marketing communications at any time.</p>
        </section>
      </div>
    </div>
  )
}
