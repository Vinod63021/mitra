
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SectionTitle } from '@/components/SectionTitle';
import { Brain, Loader2, FileText, CalendarDays, Palette, MessageSquare, Mic, NotebookText, Apple, Lightbulb, Sprout, StopCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSuggestionAction } from './actions';
import type { GetSuggestionOutput } from '@/ai/flows/get-suggestion-flow';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { z } from 'zod';

// Combined schema for this page
const suggestionPageSchema = z.object({
  mood: z.string().min(1, "Mood is required"),
  skin: z.string().min(1, "Skin condition is required"),
  pain: z.string().min(1, "Pain level/description is required"),
  period: z.string().min(1, "Period details are required (e.g., 'Day 3, light flow', 'No period')"),
  discharge: z.string().min(1, "Discharge details are required"),
  hairGrowth: z.string().min(1, "Hair growth observation is required"),
  logDate: z.string().refine((date) => !isNaN(new Date(date).getTime()), { message: "Invalid date format" }),
  journalText: z.string().min(10, "Journal entry must be at least 10 characters long."),
});
type SuggestionPageFormData = z.infer<typeof suggestionPageSchema>;


// TypeScript interfaces for SpeechRecognition events
declare global {
  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
  }
  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }
  interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
  }
  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }
  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
  }
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}


const TwinGlowColors: Record<string, string> = {
  Blue: 'bg-blue-500', // Sad
  Red: 'bg-red-500',   // Stressed
  Green: 'bg-green-500', // Calm
  Default: 'bg-gray-300', // Neutral or default
};

export default function GetSuggestionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestionOutput, setSuggestionOutput] = useState<GetSuggestionOutput | null>(null);
  const { toast } = useToast();

  const [isListening, setIsListening] = useState(false);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const currentTranscriptRef = useRef<string>("");

  const form = useForm<SuggestionPageFormData>({
    resolver: zodResolver(suggestionPageSchema),
    defaultValues: {
      mood: '',
      skin: '',
      pain: '',
      period: '',
      discharge: '',
      hairGrowth: '',
      logDate: new Date().toISOString().split('T')[0],
      journalText: '',
    },
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      console.warn("Speech Recognition not supported by this browser.");
      return;
    }
    
    const recognition = new SpeechRecognitionAPI();
    speechRecognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      let existingText = form.getValues('journalText') || "";
      if (existingText && !existingText.endsWith(" ") && !existingText.endsWith("\n")) {
        existingText += " ";
      }
      currentTranscriptRef.current = existingText; 
      form.setValue('journalText', currentTranscriptRef.current, { shouldValidate: true });
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscriptSegment = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcriptPart = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptSegment += transcriptPart;
        } else {
          interimTranscript += transcriptPart;
        }
      }
      
      form.setValue('journalText', currentTranscriptRef.current + finalTranscriptSegment + interimTranscript, { shouldValidate: true });
      
      if (finalTranscriptSegment) {
        currentTranscriptRef.current += finalTranscriptSegment + " ";
        form.setValue('journalText', currentTranscriptRef.current, { shouldValidate: true });
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error', event.error);
      let errorMessage = 'An error occurred during speech recognition.';
      if (event.error === 'no-speech') {
        errorMessage = 'No speech was detected. Please try again.';
      } else if (event.error === 'audio-capture') {
        errorMessage = 'Microphone problem. Ensure it is connected and enabled.';
      } else if (event.error === 'not-allowed') {
        errorMessage = 'Microphone access denied. Please enable it in browser settings.';
      }
      toast({ title: "Voice Input Error", description: errorMessage, variant: "destructive" });
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
    };
  }, [form, toast]);


  async function onSubmit(data: SuggestionPageFormData) {
    setIsLoading(true);
    setSuggestionOutput(null);

    const result = await getSuggestionAction(data);
    setIsLoading(false);

    if (result.success && result.data) {
      setSuggestionOutput(result.data);
      toast({
        title: "Suggestion Generated!",
        description: "Check your personalized AI insights below.",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Could not generate suggestion.",
        variant: "destructive",
      });
    }
  }

  const handleRecordButtonClick = async () => {
    const recognition = speechRecognitionRef.current;
    if (!recognition) {
      toast({ title: "Voice Input Not Ready", description: "Speech recognition is not available or not supported.", variant: "destructive" });
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      try {
        currentTranscriptRef.current = form.getValues('journalText') || "";
        if (currentTranscriptRef.current && !currentTranscriptRef.current.endsWith(" ") && !currentTranscriptRef.current.endsWith("\n")) {
            currentTranscriptRef.current += " ";
        }
        recognition.start();
      } catch (error) {
        console.error("Error starting speech recognition:", error);
        toast({ title: "Voice Input Error", description: "Could not start voice input. Please try again.", variant: "destructive" });
      }
    }
  };
  
  const twinGlowColorClass = suggestionOutput?.emotionalReflection?.twinColor 
    ? TwinGlowColors[suggestionOutput.emotionalReflection.twinColor] || TwinGlowColors.Default 
    : TwinGlowColors.Default;

  return (
    <div className="container mx-auto py-8">
      <SectionTitle
        title="Get Personalized Suggestions"
        description="Log your daily symptoms and journal your thoughts. Mitra will provide holistic insights and advice."
        icon={Brain}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-headline">Your Daily Log & Journal</CardTitle>
            <CardDescription>Fill in your observations and feelings for today.</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2 text-primary">Symptom Log</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="logDate" render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Log Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                              >
                                {field.value ? format(new Date(field.value), "PPP") : <span>Pick a date</span>}
                                <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar 
                              mode="single" 
                              selected={field.value ? new Date(field.value) : undefined} 
                              onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")} 
                              disabled={(date) => date > new Date() || date < new Date("1900-01-01")} 
                              initialFocus 
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="mood" render={({ field }) => ( <FormItem> <FormLabel>Mood</FormLabel> <FormControl><Input placeholder="e.g., Energetic, a bit irritable" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="skin" render={({ field }) => ( <FormItem> <FormLabel>Skin</FormLabel> <FormControl><Input placeholder="e.g., Oily, one new pimple on chin" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="pain" render={({ field }) => ( <FormItem> <FormLabel>Pain</FormLabel> <FormControl><Input placeholder="e.g., Mild pelvic cramps, no headache" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="period" render={({ field }) => ( <FormItem className="md:col-span-2"> <FormLabel>Period</FormLabel> <FormControl><Textarea placeholder="e.g., Day 2, moderate flow; Spotting; No period" {...field} rows={2} /></FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="discharge" render={({ field }) => ( <FormItem> <FormLabel>Discharge</FormLabel> <FormControl><Input placeholder="e.g., Clear, sticky; White, thick" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="hairGrowth" render={({ field }) => ( <FormItem> <FormLabel>Hair Growth</FormLabel> <FormControl><Input placeholder="e.g., Noticed a few new hairs on upper lip" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2 text-primary">Journal Entry</h3>
                   <FormField control={form.control} name="journalText" render={({ field }) => (
                    <FormItem>
                      <FormLabel>How are you feeling today?</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Pour out your thoughts and feelings here... or record your voice." {...field} rows={6} className="resize-none"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full mt-2" 
                    onClick={handleRecordButtonClick}
                    disabled={isLoading}
                  >
                    {isListening ? <StopCircle className="mr-2 h-4 w-4 text-red-500" /> : <Mic className="mr-2 h-4 w-4" />}
                    {isListening ? 'Stop Listening' : 'Record Voice Journal (Live)'}
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" size="lg" disabled={isLoading || isListening} className="w-full">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                  Get My Suggestion
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <Card className="sticky top-8 lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Brain className="text-primary h-6 w-6"/>Mitra's Insights</CardTitle>
            <CardDescription>Based on your log and journal, here's what Mitra suggests.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {suggestionOutput ? (
              <>
                <div className="p-4 bg-accent/10 rounded-lg shadow">
                  <h4 className="font-semibold flex items-center gap-2 text-primary mb-2"><Palette className="h-5 w-5"/>Emotional Reflection:</h4>
                  <div className="flex flex-col items-center space-y-1 my-3">
                    <Label className="text-xs text-muted-foreground">Emotional Twin Glow</Label>
                    <div className={cn("w-16 h-16 rounded-full shadow-md transition-all duration-500 ease-in-out", twinGlowColorClass)}></div>
                    {suggestionOutput.emotionalReflection?.sentiment && <p className="font-medium text-md mt-1">{suggestionOutput.emotionalReflection.sentiment.charAt(0).toUpperCase() + suggestionOutput.emotionalReflection.sentiment.slice(1)}</p>}
                  </div>
                  <p className="text-sm"><strong className="font-medium">Suggestion:</strong> {suggestionOutput.emotionalReflection.moodBasedSuggestion}</p>
                </div>

                <div className="p-4 bg-primary/10 rounded-lg shadow">
                  <h4 className="font-semibold flex items-center gap-2 text-primary mb-2"><CalendarDays className="h-5 w-5"/>Symptom Analysis:</h4>
                  <ul className="space-y-1 text-sm">
                    <li><strong className="font-medium">Next Expected Period:</strong> {suggestionOutput.symptomAnalysis.nextExpectedPeriod}</li>
                    <li><strong className="font-medium">Cycle Irregularity Risk:</strong> {suggestionOutput.symptomAnalysis.cycleIrregularityRisk}</li>
                    <li><strong className="font-medium">Alerts:</strong> {suggestionOutput.symptomAnalysis.diabetesInfertilityAlerts}</li>
                  </ul>
                </div>
                
                {suggestionOutput.detailedRemedies && suggestionOutput.detailedRemedies.length > 0 && (
                  <div className="p-4 bg-accent/10 rounded-lg shadow">
                    <h4 className="font-semibold flex items-center gap-2 text-primary mb-2"><NotebookText className="h-5 w-5"/>Detailed Remedies:</h4>
                    <Accordion type="single" collapsible className="w-full">
                      {suggestionOutput.detailedRemedies.map((remedy, index) => (
                        <AccordionItem value={`remedy-${index}`} key={index} className="border-accent/30">
                          <AccordionTrigger className="text-sm font-medium hover:no-underline py-3 text-left">{remedy.name}</AccordionTrigger>
                          <AccordionContent className="text-xs space-y-2 pt-1 pb-3">
                            <p className="text-muted-foreground">{remedy.description}</p>
                            {remedy.instructions && <p><strong className="font-medium text-primary/90">Instructions:</strong> {remedy.instructions}</p>}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                )}

                {suggestionOutput.foodRecommendations && suggestionOutput.foodRecommendations.length > 0 && (
                  <div className="p-4 bg-primary/10 rounded-lg shadow">
                    <h4 className="font-semibold flex items-center gap-2 text-primary mb-3"><Apple className="h-5 w-5"/>Food Recommendations:</h4>
                    <div className="space-y-4">
                      {suggestionOutput.foodRecommendations.map((food, index) => (
                        <div key={index} className="flex items-start gap-4 p-3 border border-primary/20 rounded-lg bg-background/50 shadow-sm">
                          <Image
                            src={`https://placehold.co/80x60.png`} 
                            alt={food.name}
                            width={60} 
                            height={45} 
                            className="rounded-md object-cover mt-1 flex-shrink-0"
                            data-ai-hint={food.imageUrlHint || 'healthy food'}
                          />
                          <div className="flex-grow">
                            <p className="font-medium text-sm">{food.name}</p>
                            <p className="text-xs text-muted-foreground">{food.benefits}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {suggestionOutput.actionableTips && suggestionOutput.actionableTips.length > 0 && (
                  <div className="p-4 bg-accent/10 rounded-lg shadow">
                    <h4 className="font-semibold flex items-center gap-2 text-primary mb-2"><Lightbulb className="h-5 w-5"/>Actionable Tips:</h4>
                    <ul className="list-disc list-inside text-sm space-y-1 pl-4 text-muted-foreground">
                      {suggestionOutput.actionableTips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="p-4 bg-primary/5 rounded-lg shadow-md mt-4 border border-primary/20">
                  <h4 className="font-semibold flex items-center gap-2 text-primary mb-2"><MessageSquare className="h-5 w-5"/>Holistic Summary:</h4>
                  <p className="text-sm text-foreground/90">{suggestionOutput.holisticSummary}</p>
                </div>

                <div className="mt-6 p-4 bg-green-50 border border-green-300 text-green-700 rounded-lg shadow-sm">
                    <h4 className="font-semibold text-md flex items-center gap-2 mb-1"><Sprout className="h-5 w-5 text-green-600"/>Motivational Nudge:</h4>
                    <p className="text-sm">You’re taking great steps in understanding your body. Keep up the amazing work! Every small step counts towards your well-being.</p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-center py-10">
                {isLoading ? "Generating your insights..." : "Submit your log and journal to see AI suggestions here."}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
