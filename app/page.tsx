import { Navbar } from '@/components/navbar'
import { Hero } from '@/components/hero'
import { Logos } from '@/components/logos'
import { Features } from '@/components/features'
import { DashboardPreview } from '@/components/dashboard-preview'
import { AiInsights } from '@/components/ai-insights'
import { Pricing } from '@/components/pricing'
import { Testimonials } from '@/components/testimonials'
import { Faq } from '@/components/faq'
import { Footer } from '@/components/footer'

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Logos />
      <Features />
      <DashboardPreview />
      <AiInsights />
      <Pricing />
      <Testimonials />
      <Faq />
      <Footer />
    </main>
  )
}
