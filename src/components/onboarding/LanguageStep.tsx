
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Languages } from 'lucide-react';

interface LanguageStepProps {
  onNext: () => void;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onLanguageSelect: (language: string) => void; // Mocked for now
}

export function LanguageStep({ onNext, onLanguageSelect }: LanguageStepProps) {
  const languages = ['English', 'Telugu', 'Hindi'];
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const handleNext = () => {
    onLanguageSelect(selectedLanguage);
    onNext();
  };

  return (
    <div className="flex flex-col items-center space-y-8 p-4 md:p-8">
      <Languages className="w-16 h-16 text-primary mb-4" />
      <h2 className="text-3xl font-headline text-center text-foreground">Choose Your Language</h2>
      <p className="text-muted-foreground text-center max-w-md">
        Select your preferred language to personalize your experience with Mitra.
      </p>
      <RadioGroup defaultValue="English" className="space-y-4 w-full max-w-xs" onValueChange={setSelectedLanguage}>
        {languages.map((lang) => (
          <div key={lang} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer has-[:checked]:bg-accent has-[:checked]:text-accent-foreground">
            <RadioGroupItem value={lang} id={lang} />
            <Label htmlFor={lang} className="text-lg cursor-pointer flex-grow">{lang}</Label>
          </div>
        ))}
      </RadioGroup>
      <Button onClick={handleNext} size="lg" className="w-full max-w-xs shadow-md">
        Next
      </Button>
    </div>
  );
}
