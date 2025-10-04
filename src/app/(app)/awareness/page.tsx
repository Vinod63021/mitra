
'use client';

import React from 'react';
import { SectionTitle } from '@/components/SectionTitle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, AlertTriangle, HeartPulse, Apple, Stethoscope, CheckCircle } from 'lucide-react';

const awarenessTopics = [
    {
        icon: HeartPulse,
        title: "What is PCOS/PCOD?",
        content: "Polycystic Ovary Syndrome (PCOS) is a common hormonal disorder among women of reproductive age. It's characterized by hormonal imbalances, irregular periods, and/or the development of small cysts on one or both ovaries. PCOD (Polycystic Ovary Disease) is a condition where the ovaries produce many immature or partially mature eggs, which can lead to cyst formation."
    },
    {
        icon: CheckCircle,
        title: "Common Symptoms",
        content: "Symptoms can vary widely but often include irregular menstrual cycles, excess androgen (male hormone) levels leading to physical signs like excess facial and body hair (hirsutism), severe acne, and male-pattern baldness. Weight gain, difficulty losing weight, and skin darkening are also common."
    },
    {
        icon: AlertTriangle,
        title: "Understanding the Long-Term Risks",
        content: "If left unmanaged, PCOS can increase the risk of developing serious health problems, including type 2 diabetes, high blood pressure, heart disease, and uterine cancer. It is also one of the most common, but treatable, causes of infertility."
    },
    {
        icon: Apple,
        title: "The Power of Diet & Lifestyle",
        content: "Lifestyle management is the first and most important step in managing PCOS. A balanced diet low in processed foods and high in fiber, lean protein, and anti-inflammatory foods can help regulate blood sugar and hormone levels. Regular exercise, even moderate activity like walking, is crucial for improving insulin sensitivity and managing weight. Stress management and adequate sleep are also key components."
    },
    {
        icon: Stethoscope,
        title: "Why You Must Consult a Doctor",
        content: "Self-diagnosis can be dangerous. A qualified healthcare professional (like a gynaecologist or endocrinologist) can provide an accurate diagnosis through blood tests, ultrasounds, and physical examination. They can create a personalized treatment plan that may include lifestyle changes, medication, or other therapies to manage your specific symptoms and reduce long-term health risks."
    }
];


export default function AwarenessPage() {
  return (
    <div className="container mx-auto py-8">
      <SectionTitle
        title="PCOS Awareness"
        description="Knowledge is the first step towards empowerment. Understand the what, why, and how of managing PCOS."
        icon={Info}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {awarenessTopics.map((topic, index) => (
          <Card key={index} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
               <topic.icon className="h-8 w-8 text-primary" />
               <CardTitle className="font-headline text-xl text-foreground">{topic.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{topic.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
       <Card className="mt-8 bg-primary/10 border-primary/20">
        <CardHeader>
            <CardTitle className="text-center font-headline text-2xl text-primary">Your Health is a Priority</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-center text-muted-foreground">This app is a tool to help you track, understand, and manage your lifestyle. It is not a replacement for professional medical advice. Use the insights you gain here to have more informed conversations with your doctor and take control of your health journey.</p>
        </CardContent>
      </Card>
    </div>
  );
}
