
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  symptomLogSchema,
  type SymptomLogFormData,
} from '@/schemas/symptomTrackerSchema';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SectionTitle } from '@/components/SectionTitle';
import {
  ClipboardList,
  Loader2,
  FileText,
  CalendarDays,
  AlertTriangle,
  Leaf,
  Brain,
  ShieldAlert,
  Lightbulb,
  PlusCircle,
  History,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSymptomForecastAction } from './actions';
import type { SymptomTrackerOutput } from '@/ai/flows/symptom-tracker-forecast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function SymptomTrackerPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [forecastOutput, setForecastOutput] =
    useState<SymptomTrackerOutput | null>(null);
  const [savedLogs, setSavedLogs] = useState<SymptomLogFormData[]>([]);
  const { toast } = useToast();

  const form = useForm<SymptomLogFormData>({
    resolver: zodResolver(symptomLogSchema),
    defaultValues: {
      mood: '',
      skin: '',
      pain: '',
      period: '',
      discharge: '',
      hairGrowth: '',
      logDate: new Date(),
    },
  });

  // Load logs from localStorage on initial render
  useEffect(() => {
    try {
      const storedLogs = localStorage.getItem('symptomLogs');
      if (storedLogs) {
        const parsedLogs = JSON.parse(storedLogs).map((log: any) => ({
          ...log,
          logDate: new Date(log.logDate), // Convert date string back to Date object
        }));
        setSavedLogs(parsedLogs);
      }
    } catch (error) {
      console.error("Failed to parse symptom logs from localStorage", error);
    }
  }, []);

  // Save logs to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('symptomLogs', JSON.stringify(savedLogs));
    } catch (error) {
       console.error("Failed to save symptom logs to localStorage", error);
    }
  }, [savedLogs]);


  const handleSaveLog = (data: SymptomLogFormData) => {
    setSavedLogs((prevLogs) =>
      [...prevLogs, data].sort((a, b) => b.logDate.getTime() - a.logDate.getTime())
    );
    toast({
      title: 'Log Saved',
      description: `Symptom log for ${format(data.logDate, 'PPP')} has been saved.`,
    });
    form.reset({
      ...form.getValues(), // Keep some values if needed, or clear completely
      mood: '',
      skin: '',
      pain: '',
      discharge: '',
      hairGrowth: '',
      // Smartly increments the date for the next log
      logDate: new Date(data.logDate.setDate(data.logDate.getDate() + 1)),
    });
  };

  async function handleGetForecast() {
    if (savedLogs.length === 0) {
      toast({
        title: 'No Logs to Analyze',
        description: 'Please save at least one symptom log before getting a forecast.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setForecastOutput(null);

    // Prepare logs for the AI: Convert Date objects to string dates
    const logsForAI = savedLogs.map(log => ({
        ...log,
        logDate: format(log.logDate, 'yyyy-MM-dd'),
    }));

    const result = await getSymptomForecastAction({ logs: logsForAI });
    setIsLoading(false);

    if (result.success && result.data) {
      setForecastOutput(result.data);
      toast({
        title: 'Forecast Generated!',
        description:
          'Check your personalized AI predictions and suggestions below.',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Could not generate forecast.',
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="container mx-auto py-8">
      <SectionTitle
        title="Symptom Tracker & AI Forecast"
        description="Log your daily symptoms to help Mitra understand your patterns. Save multiple logs and then generate a forecast based on your history."
        icon={ClipboardList}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Daily Symptom Log</CardTitle>
              <CardDescription>
                Fill in your observations for a specific day and click "Save Log".
              </CardDescription>
            </CardHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSaveLog)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="logDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Log Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarDays className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date('1900-01-01')
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mood"
                    render={({ field }) => (
                      <FormItem>
                        {' '}
                        <FormLabel>Mood</FormLabel>{' '}
                        <FormControl>
                          <Input
                            placeholder="e.g., Energetic, a bit irritable"
                            {...field}
                          />
                        </FormControl>{' '}
                        <FormMessage />{' '}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="skin"
                    render={({ field }) => (
                      <FormItem>
                        {' '}
                        <FormLabel>Skin</FormLabel>{' '}
                        <FormControl>
                          <Input
                            placeholder="e.g., Oily, one new pimple on chin"
                            {...field}
                          />
                        </FormControl>{' '}
                        <FormMessage />{' '}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="pain"
                    render={({ field }) => (
                      <FormItem>
                        {' '}
                        <FormLabel>Pain</FormLabel>{' '}
                        <FormControl>
                          <Input
                            placeholder="e.g., Mild pelvic cramps, no headache"
                            {...field}
                          />
                        </FormControl>{' '}
                        <FormMessage />{' '}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="period"
                    render={({ field }) => (
                      <FormItem>
                        {' '}
                        <FormLabel>Period</FormLabel>{' '}
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Day 2, moderate flow; Spotting; No period"
                            {...field}
                          />
                        </FormControl>{' '}
                        <FormMessage />{' '}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="discharge"
                    render={({ field }) => (
                      <FormItem>
                        {' '}
                        <FormLabel>Discharge</FormLabel>{' '}
                        <FormControl>
                          <Input
                            placeholder="e.g., Clear, sticky; White, thick"
                            {...field}
                          />
                        </FormControl>{' '}
                        <FormMessage />{' '}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hairGrowth"
                    render={({ field }) => (
                      <FormItem>
                        {' '}
                        <FormLabel>Hair Growth</FormLabel>{' '}
                        <FormControl>
                          <Input
                            placeholder="e.g., Noticed a few new hairs on upper lip"
                            {...field}
                          />
                        </FormControl>{' '}
                        <FormMessage />{' '}
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" size="lg" className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Save Log
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
          <Card>
             <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><History className="text-primary"/>Saved Logs</CardTitle>
                <CardDescription>
                  Your saved logs for this session. Generate a forecast based on this data.
                </CardDescription>
             </CardHeader>
             <CardContent>
                <ScrollArea className="h-48 w-full">
                  {savedLogs.length > 0 ? (
                    <div className="space-y-2 pr-4">
                      {savedLogs.map((log, index) => (
                        <div key={index} className="text-sm p-2 border rounded-md bg-muted/50">
                           <span className="font-semibold text-primary">{format(log.logDate, 'PPP')}:</span> Mood: {log.mood}, Skin: {log.skin}, Pain: {log.pain}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-10">No logs saved yet.</p>
                  )}
                </ScrollArea>
             </CardContent>
             <CardFooter className="flex-col items-center gap-2 pt-4">
               <Button variant="outline" className="w-full" size="lg" onClick={handleGetForecast} disabled={isLoading || savedLogs.length === 0}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                  Generate Forecast from Saved Logs
                </Button>
            </CardFooter>
          </Card>
        </div>

        <Card className="sticky top-8 lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Brain className="text-primary h-6 w-6" />
              AI Insights & Forecast
            </CardTitle>
            <CardDescription>
              Based on your logs, here's what Mitra suggests.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
            {forecastOutput ? (
              <>
                <div className="p-3 bg-primary/10 rounded-md">
                  <h4 className="font-semibold flex items-center gap-1.5 text-primary mb-1">
                    <CalendarDays className="h-4 w-4" />
                    Cycle Forecast
                  </h4>
                  <p className="text-sm"><strong className="font-medium">Next Expected Period:</strong> {forecastOutput.nextExpectedPeriod}</p>
                   <p className="text-sm"><strong className="font-medium">Irregularity Risk:</strong> {forecastOutput.cycleIrregularityRisk}</p>
                </div>

                <Alert
                  variant="destructive"
                  className="bg-destructive/10 border-destructive/30"
                >
                  <ShieldAlert className="h-5 w-5 text-destructive" />
                  <AlertTitle className="font-semibold text-destructive">
                    PCOS/PCOD Risk Assessment
                  </AlertTitle>
                  <AlertDescription className="text-destructive/80 text-sm">
                    {forecastOutput.pcosRiskAssessment}
                  </AlertDescription>
                </Alert>

                {forecastOutput.naturalRemedySuggestions &&
                  forecastOutput.naturalRemedySuggestions.length > 0 && (
                    <div className="p-3 bg-accent/10 rounded-md">
                      <h4 className="font-semibold flex items-center gap-1.5 text-accent-foreground/90 mb-1">
                        <Leaf className="h-4 w-4" />
                        Natural Remedy Suggestions
                      </h4>
                      <ul className="list-disc list-inside text-sm space-y-1 pl-1">
                        {forecastOutput.naturalRemedySuggestions.map(
                          (remedy, index) => (
                            <li key={index}>{remedy}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {forecastOutput.preventativeTips &&
                  forecastOutput.preventativeTips.length > 0 && (
                    <div className="p-3 bg-primary/10 rounded-md">
                      <h4 className="font-semibold flex items-center gap-1.5 text-primary mb-1">
                        <Lightbulb className="h-4 w-4" />
                        Preventative Tips
                      </h4>
                      <ul className="list-disc list-inside text-sm space-y-1 pl-1">
                        {forecastOutput.preventativeTips.map((tip, index) => (
                          <li key={index}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                <div className="p-4 bg-primary/5 rounded-md border border-primary/20">
                  <h4 className="font-semibold text-primary mb-1">
                    Personalized Summary
                  </h4>
                  <p className="text-sm text-foreground/80">
                    {forecastOutput.personalizedInsights}
                  </p>
                </div>

                <div className="mt-4 p-3 bg-green-100 border border-green-300 text-green-800 rounded-lg shadow-sm">
                  <h4 className="font-semibold text-base mb-1">
                    🌿 Motivational Nudge
                  </h4>
                  <p className="text-sm">
                    You’re taking positive steps for your health! Keep logging to
                    gain more insights.
                  </p>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-center py-10">
                {isLoading
                  ? 'Generating your forecast...'
                  : 'Save some logs, then click "Generate Forecast" to see AI predictions here.'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
