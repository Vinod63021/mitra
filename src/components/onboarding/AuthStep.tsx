
'use client';

import { Button } from '@/components/ui/button';
import { UserPlus, LogIn } from 'lucide-react';

interface AuthStepProps {
  onComplete: () => void;
}

export function AuthStep({ onComplete }: AuthStepProps) {
  // Mocked authentication: just proceed
  const handleContinue = () => {
    onComplete();
  };

  return (
    <div className="flex flex-col items-center space-y-8 p-4 md:p-8">
      <UserPlus className="w-16 h-16 text-primary mb-4" />
      <h2 className="text-3xl font-headline text-center text-foreground">Almost There!</h2>
      <p className="text-muted-foreground text-center max-w-md">
        You can choose to sign in to save your progress across devices, or continue anonymously for now. Your data will be stored locally if you choose anonymous mode.
      </p>
      <div className="space-y-4 w-full max-w-xs">
        <Button onClick={handleContinue} size="lg" className="w-full shadow-md">
          <LogIn className="mr-2 h-5 w-5" /> Continue &amp; Create Twin
        </Button>
        <Button variant="outline" onClick={handleContinue} size="lg" className="w-full shadow-sm">
          Use Anonymously
        </Button>
      </div>
      <p className="text-xs text-muted-foreground text-center max-w-md pt-4">
        Signing in is recommended for the best experience and data backup. For now, both options will proceed to twin creation.
      </p>
    </div>
  );
}
