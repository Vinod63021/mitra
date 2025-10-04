
'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SectionTitle } from '@/components/SectionTitle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  UsersRound,
  Brain,
  Trophy,
  BookOpen,
  LayoutDashboard,
  ShoppingBasket,
  Stethoscope,
  ClipboardList,
  CalendarDays,
  HeartPulse,
  Droplets,
  CheckCircle,
  ArrowRight,
  Upload,
} from 'lucide-react';
import { FeatureCard } from '@/components/FeatureCard';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';


// Mock data for the dynamic dashboard. In a real app, this would be fetched.
const userFirstName = "Alex";
const digitalTwinStatus = "Feeling Calm";
const cycleDay = 12;
const nextPeriodInDays = 16;
const dailyTasks = [
  { id: 'water', description: 'Drink 8 glasses of water', completed: true },
  { id: 'walk', description: '30-minute walk', completed: false },
  { id: 'log_symptoms', description: 'Log daily symptoms', completed: false },
];

const features = [
  {
    title: 'Build Your Digital Twin',
    description: 'Create and personalize your unique health avatar, Mitra.',
    href: '/digital-twin/create',
    icon: UsersRound,
    ctaText: 'View Twin',
  },
  {
    title: 'Symptom Tracker',
    description: 'Log daily symptoms for AI insights & general forecasts.',
    href: '/symptom-tracker',
    icon: ClipboardList,
    ctaText: 'Track Symptoms',
  },
  {
    title: 'Period Tracker',
    description: 'Mark period days on a calendar for cycle analysis & AI insights.',
    href: '/period-tracker',
    icon: CalendarDays,
    ctaText: 'Track Periods',
  },
  {
    title: 'Holistic Suggestions',
    description: 'Log symptoms & journal for comprehensive AI advice.',
    href: '/get-suggestion',
    icon: Brain,
    ctaText: 'Get Suggestions',
  },
  {
    title: 'Lifestyle & Goals',
    description: 'Follow a daily plan and simulate future lifestyle changes.',
    href: '/lifestyle-goals',
    icon: Trophy,
    ctaText: 'Plan & Track',
  },
  {
    title: 'Natural Remedy Hub',
    description: 'Discover personalized natural remedies and wellness tips.',
    href: '/remedy-hub',
    icon: BookOpen,
    ctaText: 'Find Remedies',
  },
  {
    title: 'Consult a Doctor',
    description: 'Find PCOS specialists and hospitals near you.',
    href: '/consult-doctor',
    icon: Stethoscope,
    ctaText: 'Find Doctors',
  },
  {
    title: 'Affordable Products',
    description: 'Browse organic pads and other PCOS-friendly products.',
    href: '/products',
    icon: ShoppingBasket,
    ctaText: 'Shop Now',
  },
];


export default function DashboardPage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: "Image too large",
          description: "Please select an image smaller than 2MB.",
          variant: "destructive",
        });
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select a valid image file (e.g., JPG, PNG, GIF).",
          variant: "destructive",
        });
        return;
      }
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="container mx-auto py-8">
      <SectionTitle
        title={`Welcome Back, ${userFirstName}!`}
        description="Here is your personalized 'My Day' health summary."
        icon={LayoutDashboard}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg bg-gradient-to-br from-primary/20 to-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline text-2xl"><HeartPulse className="text-primary"/>Your Mitra Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-[150px] h-[200px] flex-shrink-0">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                    accept="image/*"
                />
                {uploadedImage ? (
                    <Image
                      src={uploadedImage}
                      alt="Uploaded Digital Twin Avatar"
                      width={150}
                      height={200}
                      className="rounded-lg shadow-xl object-cover w-full h-full cursor-pointer"
                      onClick={handleUploadClick}
                    />
                ) : (
                  <button
                    onClick={handleUploadClick}
                    className="w-full h-full rounded-lg shadow-xl border-2 border-dashed border-primary/40 bg-primary/10 flex flex-col items-center justify-center text-primary/80 hover:bg-primary/20 transition-colors"
                  >
                    <Upload className="h-10 w-10 mb-2"/>
                    <span className="text-sm font-medium">Upload Image</span>
                  </button>
                )}
              </div>
              <div className="space-y-4">
                <p className="text-lg">
                  <strong className="font-semibold text-primary">Current Status:</strong> {digitalTwinStatus}
                </p>
                <p className="text-muted-foreground">Your digital twin reflects a state of calm today. Keep up the great work with your wellness habits!</p>
                <Link href="/digital-twin/create">
                  <Button variant="outline">View My Twin Details <ArrowRight className="ml-2 h-4 w-4"/></Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Droplets className="text-accent"/>Cycle Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-center">
                 <p className="text-4xl font-bold text-primary">{cycleDay}</p>
                 <p className="text-sm text-muted-foreground">Cycle Day</p>
              </div>
              <p className="text-center text-sm">Your next period is predicted in ~{nextPeriodInDays} days.</p>
               <Link href="/period-tracker" className="!mt-4 block">
                  <Button variant="outline" className="w-full">Go to Period Tracker</Button>
                </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Trophy className="text-accent"/>Daily Health Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dailyTasks.map(task => (
                <div key={task.id} className="flex items-center gap-2 text-sm">
                  <CheckCircle className={task.completed ? 'text-green-500' : 'text-muted-foreground/30'}/>
                  <span className={task.completed ? 'line-through text-muted-foreground' : ''}>{task.description}</span>
                </div>
              ))}
              <Link href="/lifestyle-goals" className="!mt-4 block">
                <Button variant="outline" className="w-full">View All Goals</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-headline text-foreground mb-4">Explore All Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              href={feature.href}
              icon={feature.icon}
              ctaText={feature.ctaText}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
