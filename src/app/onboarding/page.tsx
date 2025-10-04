'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Progress } from '@/components/ui/progress';
import { LanguageStep } from '@/components/onboarding/LanguageStep';
import { TwinExplanationStep } from '@/components/onboarding/TwinExplanationStep';
import { DisclaimerStep } from '@/components/onboarding/DisclaimerStep';
import { AuthStep } from '@/components/onboarding/AuthStep';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const router = useRouter();

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.push('/'); // Go back to welcome page if on first step
    }
  };

  const handleComplete = () => {
    // In a real app, save onboarding status
    router.push('/digital-twin/create');
  };

  const progressValue = (currentStep / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-primary/10 p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="relative">
          {currentStep > 0 && ( // Show back button for all steps except a potential step 0
             <Button variant="ghost" size="icon" onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2">
               <ArrowLeft className="h-5 w-5" />
             </Button>
          )}
          <CardTitle className="text-center font-headline text-2xl">
            Welcome to Mitra!
          </CardTitle>
          <Progress value={progressValue} className="w-full mt-2 h-2" />
           <p className="text-center text-sm text-muted-foreground mt-1">Step {currentStep} of {TOTAL_STEPS}</p>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && <LanguageStep onNext={handleNext} onLanguageSelect={setSelectedLanguage} />}
          {currentStep === 2 && <TwinExplanationStep onNext={handleNext} />}
          {currentStep === 3 && <DisclaimerStep onNext={handleNext} />}
          {currentStep === 4 && <AuthStep onComplete={handleComplete} />}
        </CardContent>
      </Card>
    </div>
  );
}
