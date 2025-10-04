
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { digitalTwinSchema, type DigitalTwinFormData } from '@/schemas/digitalTwinSchema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Slider } from "@/components/ui/slider";
import { SectionTitle } from '@/components/SectionTitle';
import { UsersRound, Loader2, Wand2, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { createDigitalTwinAction } from './actions';
import type { DigitalTwinOutput } from '@/ai/flows/digital-twin-generation';
import { useRouter } from 'next/navigation';

const moodEmojis = ["😊", "😟", "😠", "😢", "😌", "🤩"]; // Example emojis
const sleepEmojis = ["😴", "😩", "👍", "👎"]; // Example sleep quality emojis

export default function CreateDigitalTwinPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [twinOutput, setTwinOutput] = useState<DigitalTwinOutput | null>(null);
  const [bmi, setBmi] = useState<number | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<DigitalTwinFormData>({
    resolver: zodResolver(digitalTwinSchema),
    defaultValues: {
      age: 25,
      height: 160,
      weight: 60,
      menstrualCyclePattern: 'Irregular, 35-45 days',
      acne: 'mild',
      hairGrowth: 'mild_excess',
      skinType: 'oily',
      moodLog: '😊',
      stressLevel: 5,
      sleepQuality: '👍',
      dietPattern: 'Balanced, occasional fast food',
      activityLevel: 'Moderate, 3-4 times a week',
      currentRemedies: '',
    },
  });

  const heightValue = form.watch('height');
  const weightValue = form.watch('weight');

  useEffect(() => {
    if (heightValue && weightValue) {
      const heightInMeters = heightValue / 100;
      const calculatedBmi = weightValue / (heightInMeters * heightInMeters);
      setBmi(parseFloat(calculatedBmi.toFixed(2)));
    } else {
      setBmi(null);
    }
  }, [heightValue, weightValue]);

  async function onSubmit(data: DigitalTwinFormData) {
    setIsLoading(true);
    setTwinOutput(null);

    const inputForAI = {
        ...data,
        bmi: bmi || 0, // Pass calculated BMI
        acne: data.acne !== 'none', // Convert enum to boolean for AI
    };

    const result = await createDigitalTwinAction(inputForAI);
    setIsLoading(false);

    if (result.success && result.data) {
      setTwinOutput(result.data);
      toast({
        title: "Digital Twin Generated!",
        description: "Mitra is ready to visualize your health.",
      });
      // Optional: redirect after successful generation
      // router.push('/dashboard');
    } else {
      toast({
        title: "Error",
        description: result.error || "Could not generate digital twin.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="container mx-auto py-8">
      <SectionTitle
        title="Build Your Digital Twin"
        description="Let’s create Mitra, your personalized health companion! Provide your details below. You can update this information anytime."
        icon={UsersRound}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="age" render={({ field }) => ( <FormItem> <FormLabel>Age</FormLabel> <FormControl><Input type="number" placeholder="Your age" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="height" render={({ field }) => ( <FormItem> <FormLabel>Height (cm)</FormLabel> <FormControl><Input type="number" placeholder="Your height in cm" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="weight" render={({ field }) => ( <FormItem> <FormLabel>Weight (kg)</FormLabel> <FormControl><Input type="number" placeholder="Your weight in kg" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormItem>
                  <FormLabel>BMI (Body Mass Index)</FormLabel>
                  <Input type="text" value={bmi !== null ? bmi : "Enter height and weight"} readOnly className="bg-muted" />
                  <FormDescription>This is calculated automatically.</FormDescription>
                </FormItem>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>PCOS Specifics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="menstrualCyclePattern" render={({ field }) => ( <FormItem> <FormLabel>Menstrual Cycle Pattern</FormLabel> <FormControl><Textarea placeholder="e.g., Regular, 28-30 days; Irregular, 35-60 days" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="acne" render={({ field }) => ( <FormItem> <FormLabel>Acne</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select acne severity" /></SelectTrigger></FormControl> <SelectContent> <SelectItem value="none">None</SelectItem> <SelectItem value="mild">Mild</SelectItem> <SelectItem value="moderate">Moderate</SelectItem> <SelectItem value="severe">Severe</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="hairGrowth" render={({ field }) => ( <FormItem> <FormLabel>Hair Growth (Hirsutism)</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select hair growth pattern" /></SelectTrigger></FormControl> <SelectContent> <SelectItem value="normal">Normal</SelectItem> <SelectItem value="mild_excess">Mild Excess</SelectItem> <SelectItem value="moderate_excess">Moderate Excess</SelectItem> <SelectItem value="severe_excess">Severe Excess</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="skinType" render={({ field }) => ( <FormItem> <FormLabel>Skin Type</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select skin type" /></SelectTrigger></FormControl> <SelectContent> <SelectItem value="normal">Normal</SelectItem> <SelectItem value="oily">Oily</SelectItem> <SelectItem value="dry">Dry</SelectItem> <SelectItem value="combination">Combination</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Well-being</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="moodLog" render={({ field }) => ( <FormItem> <FormLabel>Current Mood (Emoji)</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select your mood" /></SelectTrigger></FormControl> <SelectContent> {moodEmojis.map(emoji => <SelectItem key={emoji} value={emoji}>{emoji}</SelectItem>)} </SelectContent> </Select> <FormDescription>How are you feeling today?</FormDescription><FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="stressLevel" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stress Level (1-10)</FormLabel>
                    <FormControl>
                      <div>
                        <Slider
                          defaultValue={[field.value]}
                          min={1} max={10} step={1}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                        <div className="text-center mt-1 text-sm text-muted-foreground">
                          {field.value}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="sleepQuality" render={({ field }) => ( <FormItem> <FormLabel>Sleep Quality (Emoji)</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl><SelectTrigger><SelectValue placeholder="Select sleep quality" /></SelectTrigger></FormControl> <SelectContent> {sleepEmojis.map(emoji => <SelectItem key={emoji} value={emoji}>{emoji}</SelectItem>)} </SelectContent> </Select> <FormDescription>How was your sleep last night?</FormDescription> <FormMessage /> </FormItem> )} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lifestyle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="dietPattern" render={({ field }) => ( <FormItem> <FormLabel>Diet Pattern</FormLabel> <FormControl><Textarea placeholder="e.g., Vegetarian, high protein, low carb" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="activityLevel" render={({ field }) => ( <FormItem> <FormLabel>Activity Level</FormLabel> <FormControl><Textarea placeholder="e.g., Daily 30-min walk, yoga twice a week" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                <FormField control={form.control} name="currentRemedies" render={({ field }) => ( <FormItem> <FormLabel>Current Remedies or Medicines (Optional)</FormLabel> <FormControl><Textarea placeholder="e.g., Metformin, spearmint tea" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              </CardContent>
            </Card>
          </div>

          <CardFooter className="flex justify-center pt-8">
            <Button type="submit" size="lg" disabled={isLoading} className="w-full max-w-xs">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Generate My Digital Twin
            </Button>
          </CardFooter>
        </form>
      </Form>

      {twinOutput && (
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="text-3xl font-headline flex items-center gap-2"><Sparkles className="text-primary h-7 w-7" /> Mitra - Your Digital Twin</CardTitle>
            <CardDescription>Here's a representation of your current health status based on your inputs.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6 items-center">
            <div>
              <Image
                src="https://placehold.co/300x450.png"
                alt="Digital Twin Avatar Placeholder"
                width={300}
                height={450}
                className="rounded-lg shadow-xl mx-auto"
                data-ai-hint="digital avatar health"
              />
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold font-headline">Visual Cues &amp; Insights:</h3>
              <p><strong className="text-primary">Avatar Description:</strong> {twinOutput.avatarDescription}</p>
              <p><strong className="text-primary">Skin Appearance:</strong> {twinOutput.skinAppearance}</p>
              <p><strong className="text-primary">Bloating Visual:</strong> {twinOutput.bloatingVisual ? 'Visible' : 'Not prominent'}</p>
              <p><strong className="text-primary">Cycle Animation:</strong> {twinOutput.cycleAnimation}</p>
              <p><strong className="text-primary">Stress Indicators:</strong> {twinOutput.stressIndicators}</p>
            </div>
          </CardContent>
           <CardFooter className="justify-center">
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
