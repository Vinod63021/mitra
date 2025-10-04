
'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { UsersRound } from 'lucide-react';

interface TwinExplanationStepProps {
  onNext: () => void;
}

export function TwinExplanationStep({ onNext }: TwinExplanationStepProps) {
  return (
    <div className="flex flex-col items-center space-y-8 p-4 md:p-8">
      <UsersRound className="w-16 h-16 text-primary mb-4" />
      <h2 className="text-3xl font-headline text-center text-foreground">What is a Digital Twin?</h2>
      <p className="text-muted-foreground text-center max-w-md">
        Your Digital Twin, Mitra, is a personalized virtual version of you. It helps visualize how PCOS affects your body and how lifestyle changes can make a difference. It's like having a health companion that learns and grows with you!
      </p>
      <div className="w-full max-w-md rounded-lg overflow-hidden shadow-xl my-4">
        <Image
          src="/images/twins.png"
          alt="Illustration of digital twin concept"
          width={400}
          height={250}
          className="object-cover"
          data-ai-hint="digital twin concept"
        />
      </div>
      <p className="text-sm text-muted-foreground text-center max-w-md">
        This short animation shows how Mitra reflects your health journey.
      </p>
      <Button onClick={onNext} size="lg" className="w-full max-w-xs shadow-md">
        Next
      </Button>
    </div>
  );
}
