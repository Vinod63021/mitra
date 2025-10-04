
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, Rocket } from 'lucide-react';
import Image from 'next/image';

export default function WelcomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-primary/10 p-6 text-center">
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/20 rounded-full filter blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-accent/20 rounded-full filter blur-3xl opacity-50 animate-pulse animation-delay-2000"></div>
      </div>

      <main className="z-10 flex flex-col items-center max-w-2xl">
        <Sparkles className="w-20 h-20 text-primary mb-6 animate-bounce" />
        <h1 className="text-5xl md:text-6xl font-headline font-bold text-foreground mb-6">
          Meet Mitra
        </h1>
        <p className="text-xl md:text-2xl text-foreground/80 mb-8 max-w-xl">
          Your PCOS digital twin guide. Together, well manage PCOS naturally, step by step.
        </p>
        <Image
            src="/images/welcome.png"
            alt="Illustration of a friendly digital guide and health concept"
            width={600}
            height={400}
            className="rounded-lg shadow-xl mb-10 object-cover"
            data-ai-hint="health guide illustration"
          />
        <Link href="/onboarding" passHref>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transform hover:scale-105 transition-transform duration-300">
            Ready to Begin Your Journey?
            <Rocket className="ml-2 h-5 w-5" />
          </Button>
        </Link>
        <p className="mt-10 text-sm text-foreground/60">
          Empowering you to understand and balance your body.
        </p>
      </main>
    </div>
  );
}
