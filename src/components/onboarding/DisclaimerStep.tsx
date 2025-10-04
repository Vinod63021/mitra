'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ShieldCheck } from 'lucide-react';
import React from 'react';

interface DisclaimerStepProps {
  onNext: () => void;
}

export function DisclaimerStep({ onNext }: DisclaimerStepProps) {
  const [agreed, setAgreed] = React.useState(false);

  return (
    <div className="flex flex-col items-center space-y-8 p-4 md:p-8">
      <ShieldCheck className="w-16 h-16 text-primary mb-4" />
      <h2 className="text-3xl font-headline text-center text-foreground">Important Health Disclaimer</h2>
      <div className="text-muted-foreground text-left max-w-md space-y-3 text-sm border p-4 rounded-lg bg-card">
        <p>
          Mitra, your PCOS Digital Twin, is designed for informational and educational purposes only. It does not provide medical advice, diagnosis, or treatment.
        </p>
        <p>
          Always consult with a qualified healthcare professional for any health concerns or before making any decisions related to your health or treatment.
        </p>
        <p>
          By using this app, you consent to AI personalization to help tailor your experience. Your data is handled responsibly.
        </p>
      </div>
      <div className="flex items-center space-x-2 pt-4">
        <Checkbox id="terms" checked={agreed} onCheckedChange={(checked) => setAgreed(Boolean(checked))} />
        <Label htmlFor="terms" className="text-sm text-muted-foreground">
          I have read and agree to the health disclaimer and consent to AI personalization.
        </Label>
      </div>
      <Button onClick={onNext} disabled={!agreed} size="lg" className="w-full max-w-xs shadow-md">
        Next
      </Button>
    </div>
  );
}
