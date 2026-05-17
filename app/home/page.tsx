import { Navbar } from '@/components/navbar';
import { Hero } from '@/components/hero';
import { TrustBadges } from '@/components/trust-badges';
import { HowItWorks } from '@/components/how-it-works';
import { TripForm } from '@/components/trip-form';
import { TripPlanCards } from '@/components/trip-plan-cards';
import { Destinations } from '@/components/destinations';
import { Testimonials } from '@/components/testimonials';
import { FAQ } from '@/components/faq';
import { FinalCTA } from '@/components/final-cta';
import { Footer } from '@/components/footer';

export const metadata = {
  title: 'TripNest AI - Plan Your Dream Trip',
  description: 'AI-powered travel planning for personalized Indian itineraries.',
};

export default function HomePage() {
  return (
    <main className="bg-background min-h-screen overflow-hidden">
      <Navbar />
      <Hero />
      <TrustBadges />
      <HowItWorks />
      <TripForm />
      <TripPlanCards />
      <Destinations />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
