
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionTitle } from '@/components/SectionTitle';
import { Trophy, PlayCircle, Loader2, Lightbulb, Sparkles, Sprout, CheckCircle, Bed, Utensils, Dumbbell, PlaySquare, Sun, Moon, Clock, PlusCircle, Trash2, CalendarCheck2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { simulateLifestyleChangesAction, generateTimePlanAction } from './actions';
import type { LifestyleSimulatorOutput } from '@/ai/flows/lifestyle-simulator';
import type { TimeManagementOutput } from '@/ai/flows/time-management-flow';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Schema for Lifestyle Simulator
const lifestyleHealthDataSchema = z.object({
  age: z.coerce.number().min(12).max(100),
  height: z.coerce.number().min(100).max(250),
  weight: z.coerce.number().min(30).max(200),
  menstrualCyclePattern: z.string().min(1, "Required"),
  acne: z.string().min(1, "Required"),
  hairGrowth: z.string().min(1, "Required"),
  skinType: z.string().min(1, "Required"),
  moodLog: z.string().min(1, "Required"),
  stressLevel: z.coerce.number().min(1).max(10),
  sleepQuality: z.string().min(1, "Required"),
  dietPattern: z.string().min(1, "Required"),
  activityLevel: z.string().min(1, "Required"),
  currentRemediesOrMedicines: z.string().optional(),
});
type LifestyleHealthData = z.infer<typeof lifestyleHealthDataSchema>;

const lifestyleChangesOptions = [
  { id: 'spearmint_tea', label: 'Add spearmint tea' },
  { id: 'avoid_white_carbs', label: 'Avoid white rice/bread' },
  { id: 'daily_walk_yoga', label: 'Walk or do yoga daily' },
  { id: 'improve_sleep', label: 'Improve sleep' },
  { id: 'natural_herbs', label: 'Use natural herbs (fenugreek, turmeric)' },
  { id: 'reduce_sugar', label: 'Reduce sugar intake' },
  { id: 'increase_water', label: 'Increase water intake' },
];

const mockCurrentHealthData: LifestyleHealthData = {
  age: 28,
  height: 165,
  weight: 70,
  menstrualCyclePattern: 'Irregular, heavy flow',
  acne: 'Moderate, cystic on chin',
  hairGrowth: 'Excessive on face and body',
  skinType: 'Oily',
  moodLog: '😟 Stressed',
  stressLevel: 8,
  sleepQuality: 'Poor, wakes up frequently',
  dietPattern: 'High in processed foods, sugary drinks',
  activityLevel: 'Sedentary, less than 3000 steps/day',
  currentRemediesOrMedicines: 'None',
};


// Gamification / Daily Plan data
interface Task {
  id: string;
  description: string;
  points: number;
  icon: React.ElementType;
  youtubeVideoId?: string;
}

const morningTasks: Task[] = [
  { id: 'sleep_log', description: 'Log last night\'s sleep', points: 10, icon: Bed },
  { id: 'morning_exercise', description: '10-Min Morning Yoga', points: 20, icon: Dumbbell, youtubeVideoId: '4C-gxOE0j7s' },
];

const dailyTasks: Task[] = [
  { id: 'water', description: 'Drink 8 glasses of water', points: 10, icon: Sprout },
  { id: 'log_meals', description: 'Log all meals for the day', points: 15, icon: Utensils },
  { id: 'log_symptoms', description: 'Log daily symptoms', points: 10, icon: Sprout },
];

const eveningTasks: Task[] = [
    { id: 'journal_entry', description: 'Make an emotional journal entry', points: 15, icon: Sprout },
];

const allTasks = [...morningTasks, ...dailyTasks, ...eveningTasks];

// Schema for AI Time Plan
const timePlanSchema = z.object({
    wakeUpTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]\s(AM|PM)$/i, "Enter a valid time (e.g., 7:00 AM)"),
    bedTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]\s(AM|PM)$/i, "Enter a valid time (e.g., 10:30 PM)"),
    mainGoals: z.array(z.object({ value: z.string().min(1, "Goal cannot be empty") })).min(1, "Please add at least one goal."),
    workOrStudyHours: z.string().optional(),
    currentEnergyLevel: z.enum(['Low', 'Medium', 'High']),
});
type TimePlanFormData = z.infer<typeof timePlanSchema>;


const categoryIcons: Record<string, React.ElementType> = {
  'Morning Routine': Sun,
  'Work/Study': Sprout,
  'Nutrition': Utensils,
  'Exercise': Dumbbell,
  'Relaxation': Sprout,
  'Evening Routine': Moon,
  'Personal Time': Sprout,
  'Default': Sprout,
};


// Combined Page Component
export default function LifestyleGoalsPage() {
  const { toast } = useToast();
  
  // State for Daily Plan tab
  const [herbalPoints, setHerbalPoints] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [dailyProgress, setDailyProgress] = useState(0);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);

  // State for Lifestyle Simulator tab
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationOutput, setSimulationOutput] = useState<LifestyleSimulatorOutput | null>(null);
  const [selectedChanges, setSelectedChanges] = useState<string[]>([]);
  const [bmi, setBmi] = useState<number | null>(null);

  // State for AI Time Plan tab
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [timePlanOutput, setTimePlanOutput] = useState<TimeManagementOutput | null>(null);

  const simulatorForm = useForm<LifestyleHealthData>({
    resolver: zodResolver(lifestyleHealthDataSchema),
    defaultValues: mockCurrentHealthData,
  });
  
  const timePlanForm = useForm<TimePlanFormData>({
    resolver: zodResolver(timePlanSchema),
    defaultValues: {
        wakeUpTime: "7:00 AM",
        bedTime: "10:30 PM",
        mainGoals: [{value: '30-minute walk'}, {value: 'Read a book for 20 minutes'}],
        workOrStudyHours: "9:00 AM - 5:00 PM",
        currentEnergyLevel: "Medium",
    },
  });
  const { fields, append, remove } = useFieldArray({ control: timePlanForm.control, name: "mainGoals" });


  // Daily Plan Logic
  useEffect(() => {
    const storedPoints = localStorage.getItem('herbalPoints');
    if (storedPoints) setHerbalPoints(parseInt(storedPoints, 10));
    const storedTasks = localStorage.getItem('completedTasks');
    if (storedTasks) setCompletedTasks(JSON.parse(storedTasks));
  }, []);

  useEffect(() => {
    localStorage.setItem('herbalPoints', herbalPoints.toString());
    localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
    const progress = allTasks.length > 0 ? (completedTasks.length / allTasks.length) * 100 : 0;
    setDailyProgress(progress);
  }, [herbalPoints, completedTasks]);

  const handleCompleteTask = (task: Task) => {
    if (!completedTasks.includes(task.id)) {
      setHerbalPoints(prevPoints => prevPoints + task.points);
      setCompletedTasks(prevTasks => [...prevTasks, task.id]);
    }
  };

  const handleLogMeal = (meal: 'Breakfast' | 'Lunch' | 'Dinner') => {
    const currentHour = new Date().getHours();
    let message = `Great! You've logged your ${meal}.`;
    let isOffTime = false;
    if (meal === 'Breakfast' && (currentHour < 6 || currentHour > 10)) { message = `Eating breakfast between 7-9 AM is ideal. You're a bit off, but it's okay!`; isOffTime = true; }
    if (meal === 'Lunch' && (currentHour < 12 || currentHour > 15)) { message = `Having lunch between 12-2 PM helps maintain energy. Try to stick to it!`; isOffTime = true; }
    if (meal === 'Dinner' && (currentHour < 18 || currentHour > 21)) { message = `Aim for dinner between 6-8 PM for better digestion. Consistency is key!`; isOffTime = true; }
    toast({ title: isOffTime ? "Meal Time Tip" : "Meal Logged!", description: message });
  };

  const handlePlayVideo = (videoId: string) => { setPlayingVideoId(videoId); setIsVideoDialogOpen(true); };
  const handleVideoDialogClose = () => { setIsVideoDialogOpen(false); setPlayingVideoId(null); }

  const renderTask = (task: Task) => (
     <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-shadow bg-background">
        <div className="flex items-center gap-3">
          <task.icon className="h-6 w-6 text-primary" />
          <div><p className="font-medium">{task.description}</p><p className="text-xs text-muted-foreground">+{task.points} points</p></div>
        </div>
        {task.youtubeVideoId ? (
            <div className="flex items-center gap-2">
                 <Button size="sm" variant="outline" onClick={() => handlePlayVideo(task.youtubeVideoId!)}><PlaySquare className="h-4 w-4 mr-1"/> Watch</Button>
                <Button size="sm" variant={completedTasks.includes(task.id) ? "ghost" : "default"} onClick={() => handleCompleteTask(task)} disabled={completedTasks.includes(task.id)} className={completedTasks.includes(task.id) ? "text-green-600 cursor-default" : ""}>
                  {completedTasks.includes(task.id) ? <CheckCircle className="h-5 w-5" /> : "Complete"}
                </Button>
            </div>
        ) : (
            <Button size="sm" variant={completedTasks.includes(task.id) ? "ghost" : "outline"} onClick={() => handleCompleteTask(task)} disabled={completedTasks.includes(task.id)} className={completedTasks.includes(task.id) ? "text-green-600 cursor-default" : ""}>
              {completedTasks.includes(task.id) ? <CheckCircle className="h-5 w-5" /> : "Complete"}
            </Button>
        )}
      </div>
  );

  // Lifestyle Simulator Logic
  const heightValue = simulatorForm.watch('height');
  const weightValue = simulatorForm.watch('weight');

  useEffect(() => {
    if (heightValue && weightValue) {
      const heightInMeters = heightValue / 100;
      const calculatedBmi = weightValue / (heightInMeters * heightInMeters);
      setBmi(parseFloat(calculatedBmi.toFixed(2)));
    } else {
      setBmi(null);
    }
  }, [heightValue, weightValue]);

  const handleCheckboxChange = (changeId: string) => {
    setSelectedChanges((prev) => prev.includes(changeId) ? prev.filter((id) => id !== changeId) : [...prev, changeId]);
  };

  async function onSimulate(currentHealthData: LifestyleHealthData) {
    if (selectedChanges.length === 0) {
      toast({ title: "No Changes Selected", description: "Please select at least one lifestyle change to simulate.", variant: "destructive" });
      return;
    }
    setIsSimulating(true);
    setSimulationOutput(null);
    const inputForAI = { ...currentHealthData, bmi: bmi || 0, lifestyleChanges: selectedChanges.map(id => lifestyleChangesOptions.find(opt => opt.id === id)?.label || '') };
    const result = await simulateLifestyleChangesAction(inputForAI);
    setIsSimulating(false);
    if (result.success && result.data) {
      setSimulationOutput(result.data);
      toast({ title: "Simulation Complete!", description: "Check out the predicted impact of your selected changes." });
    } else {
      toast({ title: "Error", description: result.error || "Could not run simulation.", variant: "destructive" });
    }
  }

  // AI Time Plan Logic
  async function onGeneratePlan(data: TimePlanFormData) {
    setIsGeneratingPlan(true);
    setTimePlanOutput(null);
    const inputForAI = { ...data, mainGoals: data.mainGoals.map(g => g.value) };
    const result = await generateTimePlanAction(inputForAI);
    setIsGeneratingPlan(false);
    if (result.success && result.data) {
        setTimePlanOutput(result.data);
        toast({ title: "AI Time Plan Generated!", description: "Your personalized schedule is ready." });
    } else {
        toast({ title: "Error Generating Plan", description: result.error || "Could not generate the time plan.", variant: "destructive" });
    }
  }


  return (
    <div className="container mx-auto py-8">
      <SectionTitle
        title="Lifestyle & Goals"
        description="Plan your health journey. Use the Daily Plan for today's actions, the AI Time Plan for scheduling, and the Simulator for long-term goals."
        icon={Trophy}
      />
      <Tabs defaultValue="daily-plan" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily-plan">My Daily Plan</TabsTrigger>
          <TabsTrigger value="time-plan">AI Time Plan</TabsTrigger>
          <TabsTrigger value="simulator">Lifestyle Simulator</TabsTrigger>
        </TabsList>
        <TabsContent value="daily-plan" className="mt-6">
          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl font-headline"><Sprout className="text-primary h-7 w-7" /> Your Herbal Points</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold text-primary text-center">{herbalPoints}</p>
              <Progress value={dailyProgress} className="mt-4 h-3" />
              <p className="text-sm text-muted-foreground text-center mt-1">{completedTasks.length} of {allTasks.length} daily tasks completed</p>
            </CardContent>
          </Card>
          <div className="space-y-8">
            <Card className="bg-primary/5">
                <CardHeader><CardTitle className="font-headline flex items-center gap-2"><Sun className="text-yellow-500"/>Morning Routine</CardTitle></CardHeader>
                <CardContent className="space-y-3">{morningTasks.map(renderTask)}</CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="font-headline flex items-center gap-2"><Utensils className="text-primary"/>Daily Nutrition & Habits</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Button variant="outline" size="lg" onClick={() => handleLogMeal('Breakfast')}>Log Breakfast</Button>
                    <Button variant="outline" size="lg" onClick={() => handleLogMeal('Lunch')}>Log Lunch</Button>
                    <Button variant="outline" size="lg" onClick={() => handleLogMeal('Dinner')}>Log Dinner</Button>
                 </div>
                 <Separator className="my-4"/>
                 {dailyTasks.map(renderTask)}
              </CardContent>
            </Card>
            <Card className="bg-primary/5">
                <CardHeader><CardTitle className="font-headline flex items-center gap-2"><Moon className="text-indigo-400"/>Evening Wind-down</CardTitle></CardHeader>
                <CardContent className="space-y-3">{eveningTasks.map(renderTask)}</CardContent>
            </Card>
          </div>
           {playingVideoId && (
            <Dialog open={isVideoDialogOpen} onOpenChange={handleVideoDialogClose}>
              <DialogContent className="max-w-3xl p-0 aspect-video">
                <DialogHeader className="sr-only"><DialogTitle>Yoga Video</DialogTitle></DialogHeader>
                <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${playingVideoId}?autoplay=1`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen className="rounded-lg"></iframe>
              </DialogContent>
            </Dialog>
          )}
        </TabsContent>
        <TabsContent value="time-plan" className="mt-6">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle className="font-headline">Your Day's Parameters</CardTitle>
                    <CardDescription>Provide your details for today so the AI can craft your schedule.</CardDescription>
                </CardHeader>
                <Form {...timePlanForm}>
                    <form onSubmit={timePlanForm.handleSubmit(onGeneratePlan)}>
                        <CardContent className="space-y-4">
                             <FormField control={timePlanForm.control} name="wakeUpTime" render={({ field }) => (<FormItem><FormLabel>Wake Up Time</FormLabel><FormControl><Input placeholder="e.g., 7:00 AM" {...field} /></FormControl><FormMessage /></FormItem>)} />
                             <FormField control={timePlanForm.control} name="bedTime" render={({ field }) => (<FormItem><FormLabel>Bedtime</FormLabel><FormControl><Input placeholder="e.g., 10:30 PM" {...field} /></FormControl><FormMessage /></FormItem>)} />
                             <FormField control={timePlanForm.control} name="currentEnergyLevel" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Today's Energy Level</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select energy level" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="Low">Low</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                            <SelectItem value="High">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                             )}/>
                             <FormField control={timePlanForm.control} name="workOrStudyHours" render={({ field }) => (<FormItem><FormLabel>Work/Study Hours (Optional)</FormLabel><FormControl><Input placeholder="e.g., 9:00 AM - 5:00 PM" {...field} /></FormControl><FormMessage /></FormItem>)} />
                             
                             <div>
                                <Label>Main Goals for Today</Label>
                                <div className="space-y-2 mt-1">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="flex items-center gap-2">
                                            <FormField control={timePlanForm.control} name={`mainGoals.${index}.value`} render={({ field }) => (
                                                <FormItem className="flex-grow"><FormControl><Input {...field} placeholder={`Goal #${index + 1}`} /></FormControl><FormMessage /></FormItem>
                                            )} />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                        </div>
                                    ))}
                                </div>
                                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ value: "" })}><PlusCircle className="mr-2 h-4 w-4"/>Add Goal</Button>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" size="lg" disabled={isGeneratingPlan} className="w-full">
                                {isGeneratingPlan ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Clock className="mr-2 h-4 w-4" />}
                                Generate My AI Plan
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
             </Card>
             <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">AI-Generated Daily Schedule</CardTitle>
                        <CardDescription>Here's your personalized plan. Adjust as needed!</CardDescription>
                    </CardHeader>
                    <CardContent>
                       {isGeneratingPlan && <div className="flex items-center justify-center p-10 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin mr-2" />Generating...</div>}
                       {!isGeneratingPlan && !timePlanOutput && <div className="text-center p-10 text-muted-foreground">Your schedule will appear here.</div>}
                       {timePlanOutput && (
                           <div className="space-y-4">
                             <Alert className="bg-primary/10 border-primary/20">
                               <CalendarCheck2 className="h-5 w-5 text-primary" />
                               <AlertTitle className="font-semibold text-primary">Plan Summary</AlertTitle>
                               <AlertDescription className="text-primary/80">{timePlanOutput.summary}</AlertDescription>
                             </Alert>
                             <div className="border-l-2 border-primary/30 pl-4 space-y-6">
                                {timePlanOutput.schedule.map((item, index) => {
                                    const Icon = categoryIcons[item.category] || categoryIcons['Default'];
                                    return (
                                        <div key={index} className="relative">
                                            <div className="absolute -left-[23px] top-1 h-4 w-4 rounded-full bg-primary border-2 border-background"></div>
                                            <p className="font-bold text-primary">{item.timeRange}</p>
                                            <h4 className="font-semibold text-lg flex items-center gap-2"><Icon className="h-5 w-5 text-muted-foreground"/>{item.activity}</h4>
                                            <p className="text-sm text-muted-foreground">{item.details}</p>
                                        </div>
                                    )
                                })}
                             </div>
                           </div>
                       )}
                    </CardContent>
                </Card>
             </div>
           </div>
        </TabsContent>
        <TabsContent value="simulator" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1">
              <CardHeader><CardTitle className="font-headline">1. Choose Changes</CardTitle><CardDescription>Select changes to simulate.</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                {lifestyleChangesOptions.map((change) => (
                  <div key={change.id} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-accent/50 transition-colors">
                    <Checkbox id={change.id} checked={selectedChanges.includes(change.id)} onCheckedChange={() => handleCheckboxChange(change.id)} />
                    <Label htmlFor={change.id} className="text-sm cursor-pointer flex-grow">{change.label}</Label>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Form {...simulatorForm}>
              <form onSubmit={simulatorForm.handleSubmit(onSimulate)} className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader><CardTitle className="font-headline">2. Your Health Snapshot</CardTitle><CardDescription>This data is used for the simulation.</CardDescription></CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={simulatorForm.control} name="age" render={({ field }) => (<FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={simulatorForm.control} name="height" render={({ field }) => (<FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={simulatorForm.control} name="weight" render={({ field }) => (<FormItem><FormLabel>Weight (kg)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                     <FormItem><FormLabel>BMI</FormLabel><Input type="text" value={bmi !== null ? bmi : "N/A"} readOnly className="bg-muted" /></FormItem>
                    <FormField control={simulatorForm.control} name="menstrualCyclePattern" render={({ field }) => (<FormItem><FormLabel>Menstrual Cycle</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={simulatorForm.control} name="stressLevel" render={({ field }) => (<FormItem><FormLabel>Stress Level ({field.value}/10)</FormLabel><FormControl><Slider defaultValue={[field.value]} min={1} max={10} step={1} onValueChange={(val) => field.onChange(val[0])} /></FormControl><FormMessage /></FormItem>)} />
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" size="lg" disabled={isSimulating || selectedChanges.length === 0} className="w-full">
                      {isSimulating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
                      Simulate Changes
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </Form>
          </div>
          {simulationOutput && (
            <Card className="mt-12">
              <CardHeader><CardTitle className="text-3xl font-headline flex items-center gap-2"><Sparkles className="text-primary h-7 w-7" /> Simulation Results</CardTitle><CardDescription>Here's what Mitra predicts based on your selected lifestyle changes:</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-primary/10 rounded-md"><strong>Predicted Weight Change:</strong> {simulationOutput.predictedWeightChange}</div>
                <div className="p-3 bg-accent/10 rounded-md"><strong>Cycle Improvement:</strong> {simulationOutput.cycleImprovement}</div>
                <div className="p-3 bg-primary/10 rounded-md"><strong>Acne Fading:</strong> {simulationOutput.acneFading}</div>
                <div className="p-3 bg-accent/10 rounded-md"><strong>Mood Color Stabilizing:</strong> {simulationOutput.moodColorStabilizing}</div>
                <div className="p-3 bg-primary/10 rounded-md"><strong>Energy Meter Rising:</strong> {simulationOutput.energyMeterRising}</div>
              </CardContent>
              <CardFooter className="flex flex-col items-center gap-4">
                <Button variant="outline" onClick={() => { alert("Goal plan saved!"); }}>Save as Goal Plan</Button>
                <p className="text-sm text-muted-foreground">Remember, these are predictions. Consistent effort is key!</p>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
