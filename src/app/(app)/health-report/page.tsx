
'use client';

import React, { useState } from 'react';
import { SectionTitle } from '@/components/SectionTitle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { FileDown, Loader2, BarChart3, HeartPulse, Wind, CalendarClock, Printer, Apple, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { generateHealthReportAction } from './actions';
import type { HealthReportInput, HealthReportOutput } from '@/ai/flows/health-report-flow';
import Image from 'next/image';

/**
 * MOCK DATA FUNCTION
 * In a real application, you would fetch the last 30 days of data from your database (e.g., Firestore).
 * For this prototype, this function generates realistic-looking mock data to pass to the AI.
 */
function getMockDataForReport(): HealthReportInput {
  // This data simulates what you'd query from your database
  const symptomLogs = [
    { date: '2024-06-01', mood: 'Tired', skin: 'Clear', pain: 'None', period: 'Day 5, light flow' },
    { date: '2024-06-05', mood: 'Energetic', skin: 'A bit oily', pain: 'None', period: 'No period' },
    { date: '2024-06-10', mood: 'Okay', skin: 'Oily, one pimple on chin', pain: 'None', period: 'No period', journalText: 'Feeling a bit stressed about work this week.' },
    { date: '2024-06-15', mood: 'Irritable', skin: 'Acne flare-up on jawline', pain: 'Mild pelvic cramps', period: 'No period' },
    { date: '2024-06-18', mood: 'Anxious', skin: 'Acne worsening', pain: 'Moderate cramps', period: 'Spotting', journalText: 'Feeling very bloated and uncomfortable today. The cramps are distracting.' },
    { date: '2024-06-20', mood: 'Moody', skin: 'Severe acne', pain: 'Strong cramps', period: 'Day 1, heavy flow' },
    { date: '2024-06-21', mood: 'A bit better', skin: 'Acne starting to calm down', pain: 'Mild cramps', period: 'Day 2, moderate flow' },
    { date: '2024-06-25', mood: 'Good', skin: 'Clear', pain: 'None', period: 'Day 6, very light' },
    { date: '2024-06-29', mood: 'Happy', skin: 'Clear', pain: 'None', period: 'No period', journalText: 'Finally feeling back to normal. Had a great weekend.' },
  ];

  const cycleData = [
      { startDate: '2024-05-18', cycleLength: 33 },
      { startDate: '2024-06-20', cycleLength: 33 },
      // Add more historical cycles for better analysis in a real app
  ];

  return {
    userName: 'Alex', // This would be the logged-in user's name
    reportDurationDays: 30,
    symptomLogs,
    cycleData,
  };
}


export default function HealthReportPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<HealthReportOutput | null>(null);
  const { toast } = useToast();

  const handleGenerateReport = async () => {
    setIsLoading(true);
    setReportData(null);

    // In a real app, you would fetch actual user data here.
    // For this prototype, we'll use a mock data function.
    const mockData = getMockDataForReport(); 

    const result = await generateHealthReportAction(mockData);

    setIsLoading(false);

    if (result.success && result.data) {
      setReportData(result.data);
      toast({
        title: "Report Generated Successfully",
        description: "Your 30-day health summary is ready.",
      });
    } else {
      toast({
        title: "Error Generating Report",
        description: result.error || "An unknown error occurred.",
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container mx-auto py-8">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .printable-area, .printable-area * {
              visibility: visible;
            }
            .printable-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
              display: none;
            }
          }
        `}
      </style>

      <div className="no-print">
        <SectionTitle
          title="My Health Report"
          description="Generate a summary of your logged health data. This report can be a valuable tool for discussions with your healthcare provider."
          icon={FileDown}
        />
      </div>

      {!reportData && !isLoading && (
        <Card className="text-center">
          <CardHeader>
            <CardTitle>Ready to view your summary?</CardTitle>
            <CardDescription>Click the button below to generate your health report for the last 30 days based on your logged data.</CardDescription>
          </CardHeader>
          <CardContent>
             <Button size="lg" onClick={handleGenerateReport} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate My 30-Day Health Report'
                )}
              </Button>
          </CardContent>
           <CardFooter>
            <p className="text-xs text-muted-foreground mx-auto">Note: Report generation is based on mock data for this prototype.</p>
           </CardFooter>
        </Card>
      )}

      {isLoading && (
         <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-lg text-muted-foreground">Generating your report, please wait...</p>
         </div>
      )}

      {reportData && (
        <div className="printable-area">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-3xl font-headline text-primary">{reportData.reportTitle}</CardTitle>
                    <CardDescription className="text-base">This report is a summary of logged data, not a medical diagnosis. Always consult a healthcare professional.</CardDescription>
                  </div>
                  <Button variant="outline" onClick={handlePrint} className="no-print ml-4">
                    <Printer className="mr-2 h-4 w-4" />
                    Print / Save as PDF
                  </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-headline"><CalendarClock className="text-primary"/>Cycle Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p><strong>Average Cycle Length:</strong> {reportData.cycleAnalysis.averageCycleLength}</p>
                    <p><strong>Cycle Regularity:</strong> {reportData.cycleAnalysis.cycleRegularity}</p>
                    <p><strong>Period Summary:</strong> {reportData.cycleAnalysis.periodSummary}</p>
                  </CardContent>
                </Card>
                 <Card className="bg-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-headline"><Wind className="text-primary"/>Mood & Wellness</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p><strong>Mood Summary:</strong> {reportData.moodAndWellness.moodSummary}</p>
                    <p><strong>Stress Indicators:</strong> {reportData.moodAndWellness.stressIndicators}</p>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl font-headline"><BarChart3 className="text-primary"/>Symptom Trends</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {reportData.symptomTrends.map((symptom, index) => (
                           <div key={index} className="p-3 border rounded-md text-sm">
                             <p className="font-semibold text-primary">{symptom.symptom}</p>
                             <p className="text-muted-foreground">{symptom.trend}</p>
                           </div>
                        ))}
                    </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reportData.foodRecommendations && reportData.foodRecommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl font-headline"><Apple className="text-primary"/>Food Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {reportData.foodRecommendations.map((food, index) => (
                        <div key={index} className="flex items-start gap-4 p-2 border rounded-md">
                          <Image
                            src={`https://placehold.co/80x60.png`} 
                            alt={food.name}
                            width={60} 
                            height={45} 
                            className="rounded-md object-cover mt-1 flex-shrink-0"
                            data-ai-hint={food.imageUrlHint || 'healthy food'}
                          />
                          <div>
                            <p className="font-semibold text-sm">{food.name}</p>
                            <p className="text-xs text-muted-foreground">{food.benefits}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {reportData.actionableTips && reportData.actionableTips.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xl font-headline"><Lightbulb className="text-primary"/>Actionable Tips & Prevention</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside text-sm space-y-2 text-muted-foreground">
                        {reportData.actionableTips.map((tip, index) => (
                          <li key={index}><span className="text-foreground">{tip}</span></li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div>
                <Alert variant="default" className="bg-accent/10 border-accent/30">
                  <HeartPulse className="h-5 w-5 text-accent-foreground" />
                  <AlertTitle className="text-xl font-headline text-accent-foreground">Holistic Summary & AI Analysis</AlertTitle>
                  <AlertDescription className="text-accent-foreground/80 mt-2">
                    {reportData.holisticSummary}
                  </AlertDescription>
                </Alert>
              </div>

            </CardContent>
             <CardFooter className="no-print justify-center">
                 <Button onClick={handleGenerateReport} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Re-generate Report
                </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
