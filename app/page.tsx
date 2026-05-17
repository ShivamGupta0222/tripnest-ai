import { IntroScreen } from '@/components/intro-screen';

export const metadata = {
  title: 'TripNest AI - Namaste India',
  description: 'Discover the magic of India with AI-powered personalized journeys.',
};

export default function IntroPage() {
  return (
    <main className="bg-background min-h-screen overflow-hidden">
      <IntroScreen />
    </main>
  );
}
