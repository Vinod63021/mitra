
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { SectionTitle } from '@/components/SectionTitle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Leaf, PlaySquare, AlertCircle, MapPin, Dumbbell, FileText, Loader2, ListChecks, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getRemedyInstructionsAction } from './actions';
import type { RemedyInstructionOutput } from '@/ai/flows/get-remedy-instructions-flow';
import { useToast } from '@/hooks/use-toast';


interface Remedy {
  id: string;
  name: string;
  category: 'Home Remedies' | 'Foods' | 'Ayurvedic/Nutraceutical' | 'Seasonal Herbs' | 'Yoga & Exercise';
  description: string;
  preparation?: string;
  videoPlaceholderUrl?: string; // For local images on non-yoga
  youtubeVideoId?: string; // For yoga videos
  problemTags?: string[];
  sideEffects?: string;
  regionFocus?: string;
  icon: React.ElementType;
  dataAiHint: string;
}

const remedies: Remedy[] = [
  {
    id: 'methi_water',
    name: 'Methi (Fenugreek) Water',
    category: 'Home Remedies',
    description: 'Soaked fenugreek seeds consumed in the morning can help regulate blood sugar levels and improve insulin sensitivity.',
    preparation: 'Soak 1 tsp of fenugreek seeds in a glass of water overnight. Strain and drink the water in the morning on an empty stomach.',
    videoPlaceholderUrl: '/images/freek.jpeg',
    sideEffects: 'May cause bloating or diarrhea in some individuals. Start with small amounts.',
    icon: Leaf,
    dataAiHint: 'fenugreek seeds water'
  },
  {
    id: 'ginger_tea',
    name: 'Ginger Tea',
    category: 'Home Remedies',
    description: 'Ginger has anti-inflammatory properties and can help with digestion and menstrual pain.',
    preparation: 'Boil 1 inch of fresh ginger (grated or sliced) in water for 5-10 minutes. Strain and add lemon or honey if desired.',
    videoPlaceholderUrl: '/images/ginger.jpeg',
    sideEffects: 'Generally safe, but high doses might cause heartburn.',
    icon: Leaf,
    dataAiHint: 'ginger tea cup'
  },
  {
    id: 'turmeric_milk',
    name: 'Turmeric Milk (Golden Milk)',
    category: 'Home Remedies',
    description: 'Turmeric contains curcumin, a potent anti-inflammatory and antioxidant. Can help reduce inflammation associated with PCOS.',
    preparation: 'Warm a cup of milk (dairy or non-dairy), add 1/2 tsp turmeric powder, a pinch of black pepper (to aid absorption), and optionally ginger or cinnamon. Sweeten with honey if needed.',
    videoPlaceholderUrl: '/images/milk.jpeg',
    sideEffects: 'Generally safe. High doses might cause digestive issues.',
    icon: Leaf,
    dataAiHint: 'golden milk drink'
  },
  {
    id: 'leafy_greens',
    name: 'Leafy Greens (Spinach, Kale)',
    category: 'Foods',
    description: 'Rich in vitamins, minerals, and fiber. They help manage weight and improve overall health.',
    preparation: 'Incorporate into salads, smoothies, or cooked dishes.',
    icon: Leaf,
    videoPlaceholderUrl: '/images/leaf.jpeg',
    dataAiHint: 'leafy greens salad'
  },
  {
    id: 'lean_protein',
    name: 'Lean Proteins (Chicken, Fish, Legumes)',
    category: 'Foods',
    description: 'Help with satiety and blood sugar control. Important for muscle health and metabolism.',
    preparation: 'Grill, bake, or steam. Include a variety of sources.',
    icon: Leaf,
    videoPlaceholderUrl: '/images/lean.jpeg',
    dataAiHint: 'cooked lean protein'
  },
  {
    id: 'ashwagandha',
    name: 'Ashwagandha',
    category: 'Ayurvedic/Nutraceutical',
    description: 'An adaptogenic herb that may help reduce stress and cortisol levels, potentially improving PCOS symptoms.',
    preparation: 'Available as powder or capsules. Follow product instructions or consult an Ayurvedic practitioner.',
    sideEffects: 'Can cause drowsiness or digestive upset in some. Avoid if pregnant.',
    icon: Leaf,
    videoPlaceholderUrl: '/images/aru.jpeg',
    dataAiHint: 'ashwagandha root powder'
  },
  {
    id: 'moringa_summer',
    name: 'Moringa (Summer)',
    category: 'Seasonal Herbs',
    description: 'Rich in nutrients and antioxidants. Good for boosting immunity and energy levels during summer.',
    preparation: 'Moringa leaves can be added to dals, soups, or made into a powder for smoothies.',
    regionFocus: 'Common in tropical regions',
    icon: MapPin,
    videoPlaceholderUrl: '/images/mor.jpeg',
    dataAiHint: 'moringa leaves plant'
  },
  {
    id: 'tulsi_winter',
    name: 'Tulsi (Holy Basil) (Winter)',
    category: 'Seasonal Herbs',
    description: 'Known for its immune-boosting and stress-relieving properties. Beneficial during winter months.',
    preparation: 'Consume as Tulsi tea or chew fresh leaves.',
    regionFocus: 'Widely available in India',
    icon: MapPin,
    videoPlaceholderUrl: '/images/tulasi.jpeg',
    dataAiHint: 'tulsi holy basil'
  },
  {
    id: 'surya_namaskar',
    name: 'Surya Namaskar (Sun Salutation)',
    category: 'Yoga & Exercise',
    description: 'A sequence of 12 powerful yoga poses that provides a good cardiovascular workout and improves flexibility. Suitable for overall well-being.',
    youtubeVideoId: 'T9L20jBg84k',
    problemTags: ['General Wellness', 'Flexibility', 'Energy Boost'],
    icon: Dumbbell,
    dataAiHint: 'yoga sunsalutation'
  },
  {
    id: 'pranayama_breathing',
    name: 'Nadi Shodhana (Alternate Nostril Breathing)',
    category: 'Yoga & Exercise',
    description: 'A calming breathing exercise (pranayama) that helps reduce stress, improve focus, and may aid in hormonal balance.',
    youtubeVideoId: '8VwufJrUhic',
    problemTags: ['Stress Relief', 'Hormonal Balance', 'General Wellness', 'Anxiety Reduction'],
    icon: Dumbbell,
    dataAiHint: 'yoga breathing'
  },
  {
    id: 'butterfly_pose',
    name: 'Baddha Konasana (Butterfly Pose)',
    category: 'Yoga & Exercise',
    description: 'Stimulates abdominal organs, ovaries, and improves circulation in the pelvic region. Beneficial for menstrual discomfort and reproductive health.',
    youtubeVideoId: 'YXOe3ggQ9lM',
    problemTags: ['Menstrual Discomfort', 'Pelvic Health', 'Hip Opening'],
    icon: Dumbbell,
    dataAiHint: 'yoga butterflypose'
  },
  {
    id: 'child_pose',
    name: 'Balasana (Child\'s Pose)',
    category: 'Yoga & Exercise',
    description: 'A gentle resting pose that calms the brain and helps relieve stress and fatigue. It gently stretches the hips, thighs, and ankles.',
    youtubeVideoId: '2MJGg-dUKh0',
    problemTags: ['Stress Relief', 'Relaxation', 'General Wellness'],
    icon: Dumbbell,
    dataAiHint: 'yoga childpose'
  },
  {
    id: 'warrior_pose',
    name: 'Virabhadrasana (Warrior Pose)',
    category: 'Yoga & Exercise',
    description: 'Builds strength and stamina in the legs and core, opens hips and chest. Improves balance and concentration.',
    youtubeVideoId: '4hRgA2f3iik',
    problemTags: ['Strength Building', 'Balance', 'Hip Opening'],
    icon: Dumbbell,
    dataAiHint: 'yoga warriorpose'
  },
  {
    id: 'triangle_pose',
    name: 'Trikonasana (Triangle Pose)',
    category: 'Yoga & Exercise',
    description: 'Stretches hips, groins, hamstrings, and calves; strengthens legs and core. Relieves stress and improves digestion.',
    youtubeVideoId: 'S6gB0QHb8z4',
    problemTags: ['Flexibility', 'Stress Relief', 'Digestion'],
    icon: Dumbbell,
    dataAiHint: 'yoga trianglepose'
  },
  {
    id: 'cobra_pose',
    name: 'Bhujangasana (Cobra Pose)',
    category: 'Yoga & Exercise',
    description: 'Strengthens the spine, chest, and abdomen. Stretches shoulders and chest. Can help alleviate stress and fatigue.',
    youtubeVideoId: 'fOdrW7nf9gw',
    problemTags: ['Back Strength', 'Stress Relief', 'Menstrual Discomfort'],
    icon: Dumbbell,
    dataAiHint: 'yoga cobrapose'
  }
];

const categories: Remedy['category'][] = ['Home Remedies', 'Foods', 'Ayurvedic/Nutraceutical', 'Seasonal Herbs', 'Yoga & Exercise'];

export default function RemedyHubPage() {
  const [selectedProblem, setSelectedProblem] = useState<string>('All');
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);

  const [selectedRemedyForInstructions, setSelectedRemedyForInstructions] = useState<Remedy | null>(null);
  const [isInstructionsDialogOpen, setIsInstructionsDialogOpen] = useState(false);
  const [aiInstructions, setAiInstructions] = useState<RemedyInstructionOutput | null>(null);
  const [isFetchingInstructions, setIsFetchingInstructions] = useState(false);
  const { toast } = useToast();

  const yogaExercises = useMemo(() => remedies.filter(r => r.category === 'Yoga & Exercise'), []);

  const problemOptions = useMemo(() => {
    const allTags = Array.from(new Set(yogaExercises.flatMap(ex => ex.problemTags || [])));
    return ['All', ...allTags.sort()];
  }, [yogaExercises]);

  const filteredYogaExercises = useMemo(() => {
    if (selectedProblem === 'All') {
      return yogaExercises;
    }
    return yogaExercises.filter(ex => ex.problemTags?.includes(selectedProblem));
  }, [yogaExercises, selectedProblem]);

  const handlePlayVideo = (videoId: string) => {
    setPlayingVideoId(videoId);
    setIsVideoDialogOpen(true);
  };

  const handleVideoDialogClose = () => {
    setIsVideoDialogOpen(false);
    setPlayingVideoId(null); 
  }
  
  const handleOpenInstructionsDialog = (remedy: Remedy) => {
    setSelectedRemedyForInstructions(remedy);
    setAiInstructions(null); // Clear previous instructions
    setIsInstructionsDialogOpen(true);
  };

  const handleInstructionsDialogClose = () => {
    setIsInstructionsDialogOpen(false);
    setSelectedRemedyForInstructions(null);
    setAiInstructions(null);
  };

  useEffect(() => {
    if (selectedRemedyForInstructions && isInstructionsDialogOpen) {
      const fetchInstructions = async () => {
        setIsFetchingInstructions(true);
        try {
          const result = await getRemedyInstructionsAction({
            remedyName: selectedRemedyForInstructions.name,
            remedyDescription: selectedRemedyForInstructions.description,
            remedyCategory: selectedRemedyForInstructions.category,
            existingPreparationNotes: selectedRemedyForInstructions.preparation,
          });
          if (result.success && result.data) {
            setAiInstructions(result.data);
          } else {
            toast({
              title: "Error",
              description: result.error || "Could not fetch AI instructions.",
              variant: "destructive",
            });
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "An unexpected error occurred while fetching instructions.",
            variant: "destructive",
          });
          console.error("Fetch instructions error:", error);
        } finally {
          setIsFetchingInstructions(false);
        }
      };
      fetchInstructions();
    }
  }, [selectedRemedyForInstructions, isInstructionsDialogOpen, toast]);


  return (
    <div className="container mx-auto py-8">
      <SectionTitle
        title="Personalized Natural Remedy Hub"
        description="Discover home remedies, beneficial foods, herbal suggestions, and yoga exercises tailored to your PCOS needs."
        icon={BookOpen}
      />

      <Tabs defaultValue="Home Remedies" className="w-full">
        <ScrollArea className="w-full whitespace-nowrap rounded-md">
          <TabsList className="inline-flex h-auto p-1">
            {categories.map(category => (
              <TabsTrigger key={category} value={category} className="text-sm md:text-base px-3 py-1.5 md:px-4 md:py-2">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {categories.map(category => (
          <TabsContent key={category} value={category} className="mt-6">
            {category === 'Yoga & Exercise' && (
              <div className="mb-6 max-w-xs">
                <Label htmlFor="problem-filter" className="text-sm font-medium text-foreground/80">Filter by Health Concern:</Label>
                <Select value={selectedProblem} onValueChange={setSelectedProblem}>
                  <SelectTrigger id="problem-filter" className="mt-1">
                    <SelectValue placeholder="Select a concern" />
                  </SelectTrigger>
                  <SelectContent>
                    {problemOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(category === 'Yoga & Exercise' ? filteredYogaExercises : remedies.filter(r => r.category === category)).map((item) => (
                <Card key={item.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <item.icon className="h-6 w-6 text-primary" />
                      <CardTitle className="font-headline text-xl">{item.name}</CardTitle>
                    </div>
                    {item.regionFocus && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3"/>{item.regionFocus}</p>
                    )}
                    <CardDescription className="text-sm min-h-[3em]">{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-3">
                    {item.preparation && (
                      <div>
                        <h4 className="font-semibold text-sm">Preparation:</h4>
                        <p className="text-xs text-muted-foreground">{item.preparation}</p>
                      </div>
                    )}
                    {item.videoPlaceholderUrl && item.category !== 'Yoga & Exercise' && (
                      <div className="mt-2">
                        <Image
                          src={item.videoPlaceholderUrl}
                          alt={`Visual for ${item.name}`}
                          width={320}
                          height={180}
                          className="rounded-md object-cover w-full"
                          data-ai-hint={item.dataAiHint}
                        />
                         <Button variant="link" size="sm" className="mt-1 p-0 h-auto text-primary hover:text-primary/80" onClick={() => handleOpenInstructionsDialog(item)}>
                           <FileText className="h-4 w-4 mr-1" /> View Details & Instructions
                         </Button>
                      </div>
                    )}
                    {item.category === 'Yoga & Exercise' && item.youtubeVideoId && (
                       <div className="mt-2">
                        <Image
                          src={`https://img.youtube.com/vi/${item.youtubeVideoId}/hqdefault.jpg`}
                          alt={`Thumbnail for ${item.name}`}
                          width={320}
                          height={180}
                          className="rounded-md object-cover w-full cursor-pointer hover:opacity-80 transition-opacity"
                          data-ai-hint={item.dataAiHint}
                          onClick={() => handlePlayVideo(item.youtubeVideoId!)}
                        />
                         <Button variant="link" size="sm" className="mt-1 p-0 h-auto text-primary hover:text-primary/80" onClick={() => handlePlayVideo(item.youtubeVideoId!)}>
                           <PlaySquare className="h-4 w-4 mr-1" /> Play Video
                         </Button>
                      </div>
                    )}
                  </CardContent>
                  {item.sideEffects && (
                    <CardFooter className="pt-3 border-t mt-auto">
                      <div className="text-xs text-destructive/80 flex items-start gap-1">
                        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                        <span><strong className="font-medium">Potential Side Effects:</strong> {item.sideEffects}</span>
                      </div>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
            {category === 'Yoga & Exercise' && filteredYogaExercises.length === 0 && (
              <p className="text-muted-foreground text-center py-10">No exercises found for the selected concern. Try selecting "All".</p>
            )}
            {category !== 'Yoga & Exercise' && remedies.filter(r => r.category === category).length === 0 && (
              <p className="text-muted-foreground text-center py-10">No items found in this category yet. Stay tuned for updates!</p>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Yoga Video Player Dialog */}
      {playingVideoId && (
        <Dialog open={isVideoDialogOpen} onOpenChange={handleVideoDialogClose}>
          <DialogContent className="max-w-3xl p-0 aspect-video">
            <DialogHeader className="sr-only">
              <DialogTitle>{remedies.find(r => r.youtubeVideoId === playingVideoId)?.name || 'Yoga Exercise Video'}</DialogTitle>
            </DialogHeader>
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${playingVideoId}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="rounded-lg"
            ></iframe>
          </DialogContent>
        </Dialog>
      )}

      {/* AI Instructions Dialog */}
      {selectedRemedyForInstructions && (
        <Dialog open={isInstructionsDialogOpen} onOpenChange={handleInstructionsDialogClose}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl flex items-center gap-2">
                <selectedRemedyForInstructions.icon className="h-6 w-6 text-primary" />
                {selectedRemedyForInstructions.name}
              </DialogTitle>
              <DialogDescription>{selectedRemedyForInstructions.description}</DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {selectedRemedyForInstructions.preparation && (
                <div>
                  <h4 className="font-semibold text-primary mb-1">Basic Preparation:</h4>
                  <p className="text-sm text-muted-foreground">{selectedRemedyForInstructions.preparation}</p>
                </div>
              )}
              
              <div>
                <h4 className="font-semibold text-primary mb-2 flex items-center gap-1">
                  <Sparkles className="h-5 w-5 text-accent" /> AI Generated Detailed Instructions:
                </h4>
                {isFetchingInstructions && (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2 text-muted-foreground">Generating instructions...</p>
                  </div>
                )}
                {!isFetchingInstructions && aiInstructions?.detailedInstructions && aiInstructions.detailedInstructions.length > 0 && (
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    {aiInstructions.detailedInstructions.map((step, index) => (
                      <li key={index} className="text-foreground/90">{step}</li>
                    ))}
                  </ol>
                )}
                 {!isFetchingInstructions && aiInstructions?.detailedInstructions?.length === 0 && (
                   <p className="text-sm text-muted-foreground">AI could not generate detailed steps for this remedy at the moment.</p>
                 )}
              </div>

              {!isFetchingInstructions && aiInstructions?.usageTips && aiInstructions.usageTips.length > 0 && (
                <div>
                  <h4 className="font-semibold text-primary mb-2 flex items-center gap-1">
                    <ListChecks className="h-5 w-5 text-accent" /> AI Generated Usage Tips:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {aiInstructions.usageTips.map((tip, index) => (
                      <li key={index} className="text-foreground/90">{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
               {!isFetchingInstructions && !aiInstructions && (
                 <p className="text-sm text-muted-foreground">No AI instructions available for this remedy yet.</p>
               )}
            </div>
            <Button onClick={handleInstructionsDialogClose} variant="outline" className="mt-6 w-full">Close</Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
