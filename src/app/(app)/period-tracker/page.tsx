
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { format, addDays, differenceInDays, startOfDay } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import type { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionTitle } from '@/components/SectionTitle';
import { CalendarDays, Info, Lightbulb, Loader2, AlertTriangle, Activity, ShieldAlert, MessageSquare, Stethoscope, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzePeriodDataAction } from './actions';
import type { PeriodAnalysisOutput, PeriodCycleData } from '@/ai/flows/period-analysis-flow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { additionalSymptomsSchema, type AdditionalSymptomsFormData } from '@/schemas/periodTrackerSchema';
import { Separator } from '@/components/ui/separator';


export default function PeriodTrackerPage() {
  const today = startOfDay(new Date());
  // Show current and previous month by default
  const defaultMonth = startOfDay(new Date(today.getFullYear(), today.getMonth() -1, 1)); 
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(undefined);
  const [recordedPeriods, setRecordedPeriods] = useState<{ from: Date; to: Date }[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState<PeriodAnalysisOutput | null>(null);
  const [showSymptomInput, setShowSymptomInput] = useState(false);

  const { toast } = useToast();

  const symptomsForm = useForm<AdditionalSymptomsFormData>({
    resolver: zodResolver(additionalSymptomsSchema),
    defaultValues: {
      symptomsText: '',
    },
  });

  // Load periods from localStorage on initial render
  useEffect(() => {
    try {
      const storedPeriods = localStorage.getItem('recordedPeriods');
      if (storedPeriods) {
        const parsedPeriods = JSON.parse(storedPeriods).map((p: any) => ({
          from: startOfDay(new Date(p.from)),
          to: startOfDay(new Date(p.to)),
        }));
        setRecordedPeriods(parsedPeriods);
      }
    } catch (error) {
      console.error("Failed to parse recorded periods from localStorage", error);
    }
  }, []);

  // Save periods to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('recordedPeriods', JSON.stringify(recordedPeriods));
    } catch (error) {
      console.error("Failed to save recorded periods to localStorage", error);
    }
  }, [recordedPeriods]);

  const handleAddPeriod = () => {
    if (selectedRange && selectedRange.from && selectedRange.to) {
      const newPeriod = { from: startOfDay(selectedRange.from), to: startOfDay(selectedRange.to) };
      // Check for overlaps before adding
      const isOverlapping = recordedPeriods.some(p => 
        (newPeriod.from >= p.from && newPeriod.from <= p.to) ||
        (newPeriod.to >= p.from && newPeriod.to <= p.to) ||
        (p.from >= newPeriod.from && p.from <= newPeriod.to)
      );
      if (isOverlapping) {
        toast({ title: "Overlap Detected", description: "This period range overlaps with an existing one.", variant: "destructive"});
        return;
      }
      setRecordedPeriods(prev => [...prev, newPeriod].sort((a,b) => a.from.getTime() - b.from.getTime()));
      setSelectedRange(undefined); // Reset range selection
      toast({ title: "Period Added", description: `Added period from ${format(newPeriod.from, 'PPP')} to ${format(newPeriod.to, 'PPP')}.` });
    } else {
      toast({ title: "Incomplete Selection", description: "Please select a valid start and end date for your period.", variant: "destructive" });
    }
  };

  const handleRemovePeriod = (index: number) => {
    setRecordedPeriods(prev => prev.filter((_, i) => i !== index));
    toast({ title: "Period Removed", description: "The selected period has been removed." });
  };

  const calculatedCycleData = useMemo((): PeriodCycleData[] => {
    if (recordedPeriods.length < 2) return [];
    // Ensure periods are sorted by start date
    const sortedPeriods = [...recordedPeriods].sort((a, b) => a.from.getTime() - b.from.getTime());
    
    const cycles: PeriodCycleData[] = [];
    for (let i = 0; i < sortedPeriods.length - 1; i++) {
      const currentPeriodStartDate = sortedPeriods[i].from;
      const nextPeriodStartDate = sortedPeriods[i+1].from;
      const cycleLength = differenceInDays(nextPeriodStartDate, currentPeriodStartDate);
      if (cycleLength > 0) { // Ensure positive cycle length
         cycles.push({ startDate: format(currentPeriodStartDate, 'yyyy-MM-dd'), cycleLength });
      }
    }
    return cycles;
  }, [recordedPeriods]);


  const handleAnalyzeCycles = async (symptoms?: string) => {
    if (calculatedCycleData.length === 0 && recordedPeriods.length < 2) {
      toast({ title: "Insufficient Data", description: "Please record at least two period occurrences to analyze cycles.", variant: "destructive" });
      return;
    }
     if (calculatedCycleData.length === 0 && recordedPeriods.length >=2) {
       toast({ title: "Calculation Error", description: "Could not calculate cycle lengths. Ensure period dates are distinct.", variant: "destructive" });
       return;
    }

    setIsLoading(true);
    setAiOutput(null); // Clear previous output
    setShowSymptomInput(false); // Hide symptom input on new analysis

    const inputForAI = {
      periodCycleData: calculatedCycleData,
      ...(symptoms && { additionalSymptoms: symptoms }),
    };

    const result = await analyzePeriodDataAction(inputForAI);
    setIsLoading(false);

    if (result.success && result.data) {
      setAiOutput(result.data);
      setShowSymptomInput(result.data.promptForMoreInfo && !symptoms); // Only show if prompting and no symptoms yet given
      toast({ title: "Analysis Complete", description: "AI insights generated." });
    } else {
      toast({ title: "Analysis Failed", description: result.error || "Could not analyze period data.", variant: "destructive" });
    }
  };
  
  function onSymptomsSubmit(data: AdditionalSymptomsFormData) {
    handleAnalyzeCycles(data.symptomsText);
    symptomsForm.reset(); // Optionally reset form
  }


  return (
    <div className="container mx-auto py-8">
      <SectionTitle
        title="Menstrual Cycle Tracker & Insights"
        description="Mark your period days on the calendar. Mitra will help you understand your cycle patterns and offer personalized insights."
        icon={CalendarDays}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">1. Mark Your Period Days</CardTitle>
              <CardDescription>Select the start and end dates of your period on the calendar below and click "Add Period to Log".</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0 mx-auto md:mx-0">
                <Calendar
                  mode="range"
                  selected={selectedRange}
                  onSelect={setSelectedRange}
                  defaultMonth={defaultMonth}
                  numberOfMonths={2}
                  toDate={today} // Disable future dates
                  modifiers={{ recorded: recordedPeriods.flatMap(p => {
                      const dates = [];
                      let currentDate = new Date(p.from);
                      while (currentDate <= p.to) {
                          dates.push(new Date(currentDate));
                          currentDate = addDays(currentDate, 1);
                      }
                      return dates;
                  })}}
                  modifiersStyles={{ recorded: { backgroundColor: 'hsl(var(--primary)/0.3)', color: 'hsl(var(--primary-foreground))' } }}
                  className="rounded-md border shadow-sm p-2 bg-card"
                />
                {selectedRange?.from && (
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    Selected: {format(selectedRange.from, 'PPP')}
                    {selectedRange.to && ` - ${format(selectedRange.to, 'PPP')}`}
                  </p>
                )}
              </div>
              <div className="flex-grow w-full md:w-auto">
                <h3 className="font-semibold mb-2 text-lg text-primary">Logged Periods:</h3>
                {recordedPeriods.length === 0 ? (
                  <p className="text-muted-foreground">No periods logged yet. Select a range and add it.</p>
                ) : (
                  <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {recordedPeriods.map((period, index) => (
                      <li key={index} className="flex justify-between items-center p-2 border rounded-md bg-background text-sm">
                        <span>{format(period.from, 'PPP')} - {format(period.to, 'PPP')}</span>
                        <Button variant="ghost" size="sm" onClick={() => handleRemovePeriod(index)} className="text-destructive hover:text-destructive/80">Remove</Button>
                      </li>
                    ))}
                  </ul>
                )}
                 <Button 
                  onClick={handleAddPeriod} 
                  disabled={!selectedRange?.from || !selectedRange?.to}
                  className="w-full mt-4"
                >
                  Add Period to Log
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">2. Get AI Analysis</CardTitle>
              <CardDescription>Once you have logged at least two periods, you can analyze your cycles.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                  onClick={() => handleAnalyzeCycles()} 
                  disabled={isLoading || recordedPeriods.length < 2}
                  className="w-full"
                  variant="outline"
                  size="lg"
                >
                  {isLoading && !symptomsForm.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Activity className="mr-2 h-4 w-4" />}
                  Analyze My Cycles ({calculatedCycleData.length} calculated)
                </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="sticky top-8 lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Info className="text-primary h-6 w-6"/>AI Cycle Insights</CardTitle>
            <CardDescription>Insights based on your logged cycles will appear here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
            {isLoading && !aiOutput && <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <p className="ml-2 text-muted-foreground">Analyzing...</p></div>}
            
            {!isLoading && !aiOutput && !showSymptomInput && (
              <p className="text-muted-foreground text-center py-10">Log at least two periods and click "Analyze My Cycles" to get insights.</p>
            )}

            {aiOutput && (
              <div className="space-y-4">
                <Alert variant={aiOutput.isRegular ? "default" : "destructive"} className={aiOutput.isRegular ? "bg-green-50 border-green-300 text-green-800 dark:bg-green-950 dark:text-green-300" : ""}>
                  {aiOutput.isRegular ? <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400"/> : <AlertTriangle className="h-5 w-5 text-destructive"/>}
                  <AlertTitle className="font-semibold">{aiOutput.isRegular ? "Cycle Appears Regular" : "Potential Cycle Irregularity"}</AlertTitle>
                  <AlertDescription className="text-sm">
                    {aiOutput.regularitySummary}
                  </AlertDescription>
                </Alert>

                <div className="p-3 bg-primary/10 rounded-md">
                  <h4 className="font-semibold flex items-center gap-1.5 text-primary text-base"><CalendarDays className="h-4 w-4"/>Next Expected Period</h4>
                  <p className="text-sm mt-1">{aiOutput.nextExpectedPeriodDate}</p>
                </div>
                
                {aiOutput.pcosRiskIndicator && (
                    <Alert className="bg-amber-50 border-amber-400 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400"/>
                        <AlertTitle className="font-semibold">Health Pattern Indicator</AlertTitle>
                        <AlertDescription className="text-sm">
                            {aiOutput.pcosRiskIndicator}
                        </AlertDescription>
                    </Alert>
                )}

                {aiOutput.potentialIssues && aiOutput.potentialIssues.length > 0 && (
                  <div className="p-3 bg-accent/20 rounded-md">
                    <h4 className="font-semibold flex items-center gap-1.5 text-accent-foreground/80 text-base"><AlertTriangle className="h-4 w-4"/>Potential Factors to Consider</h4>
                    <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                      {aiOutput.potentialIssues.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                     <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1"><Stethoscope size={14} className="shrink-0 mt-0.5"/>This is not a diagnosis. Please consult your doctor for any health concerns.</p>
                  </div>
                )}

                {aiOutput.preventativeTips && aiOutput.preventativeTips.length > 0 && (
                  <div className="p-3 bg-primary/10 rounded-md">
                    <h4 className="font-semibold flex items-center gap-1.5 text-primary text-base"><Lightbulb className="h-4 w-4"/>Wellness Tips</h4>
                    <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                      {aiOutput.preventativeTips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <Separator className="my-4"/>
              </div>
            )}

            {showSymptomInput && !symptomsForm.formState.isSubmitting && (
              <Form {...symptomsForm}>
                <form onSubmit={symptomsForm.handleSubmit(onSymptomsSubmit)} className="space-y-4 p-4 border border-primary/30 rounded-lg bg-background shadow-sm">
                  <FormField
                    control={symptomsForm.control}
                    name="symptomsText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5 text-primary font-semibold"><MessageSquare className="h-4 w-4"/>Describe Additional Symptoms</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Noticed more hair fall, feeling unusually tired, specific pain details..."
                            {...field}
                            rows={4}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Your cycle shows some irregularity. Describing other symptoms can help Mitra provide more tailored insights.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={symptomsForm.formState.isSubmitting} className="w-full">
                    {symptomsForm.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Submit Symptoms for Deeper Analysis
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
