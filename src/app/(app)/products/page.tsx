
'use client';

import React from 'react';
import Image from 'next/image';
import { SectionTitle } from '@/components/SectionTitle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBasket, ArrowRight } from 'lucide-react';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface Product {
  id: string;
  name: string;
  category: 'Organic Hygiene' | 'Wellness Supplements' | 'Comfort & Care';
  description: string;
  price: string;
  imageUrl: string;
  dataAiHint: string;
  ctaText?: string;
}

const mockProducts: Product[] = [
  {
    id: 'organic_pads_regular',
    name: 'Organic Cotton Pads - Regular',
    category: 'Organic Hygiene',
    description: 'Breathable and hypoallergenic regular flow pads made with 100% organic cotton.',
    price: '₹299',
    imageUrl: '/images/pads.jpeg',
    dataAiHint: 'organic pads',
    ctaText: 'View Product',
  },
  {
    id: 'organic_pads_heavy',
    name: 'Organic Cotton Pads - Heavy Flow',
    category: 'Organic Hygiene',
    description: 'Extra absorbent and comfortable for heavy flow days, pure organic cotton.',
    price: '₹349',
    imageUrl: '/images/pad.jpeg',
    dataAiHint: 'heavy flow pads',
    ctaText: 'View Product',
  },
  {
    id: 'menstrual_cup',
    name: 'Reusable Menstrual Cup - Medium',
    category: 'Organic Hygiene',
    description: 'Eco-friendly medical-grade silicone menstrual cup. Comfortable and leak-proof.',
    price: '₹799',
    imageUrl: '/images/met.jpeg',
    dataAiHint: 'menstrual cup',
    ctaText: 'View Product',
  },
  {
    id: 'pcos_herbal_tea',
    name: 'PCOS Support Herbal Tea',
    category: 'Wellness Supplements',
    description: 'A blend of spearmint, cinnamon, and other herbs to support hormonal balance.',
    price: '₹450',
    imageUrl: '/images/pad.jpeg',
    dataAiHint: 'herbal tea',
    ctaText: 'View Product',
  },
  {
    id: 'inositol_supplement',
    name: 'Myo & D-Chiro Inositol Blend',
    category: 'Wellness Supplements',
    description: 'Supports insulin sensitivity and ovarian function. Clinically studied ratio.',
    price: '₹1200',
    imageUrl: '/images/sup.jpeg',
    dataAiHint: 'inositol supplement',
    ctaText: 'View Product',
  },
  {
    id: 'vitamin_d3',
    name: 'Vitamin D3 Supplement',
    category: 'Wellness Supplements',
    description: 'Essential for hormone regulation and immune health, often deficient in PCOS.',
    price: '₹380',
    imageUrl: '/images/vd.jpeg',
    dataAiHint: 'vitamin D3',
    ctaText: 'View Product',
  },
  {
    id: 'heating_pad',
    name: 'Herbal Heating Pad for Cramps',
    category: 'Comfort & Care',
    description: 'Reusable pad filled with natural herbs for soothing menstrual pain relief.',
    price: '₹599',
    imageUrl: '/images/pad.jpeg',
    dataAiHint: 'heating pad',
    ctaText: 'View Product',
  },
  {
    id: 'essential_oil_blend',
    name: 'Calming Essential Oil Roller',
    category: 'Comfort & Care',
    description: 'A blend of lavender and clary sage to help ease stress and mood swings.',
    price: '₹320',
    imageUrl: '/images/ess.jpeg',
    dataAiHint: 'essential oil roller',
    ctaText: 'View Product',
  },
];

const productCategories: Product['category'][] = ['Organic Hygiene', 'Wellness Supplements', 'Comfort & Care'];

export default function ProductsPage() {
  return (
    <div className="container mx-auto py-8">
      <SectionTitle
        title="Affordable & PCOS-Friendly Products"
        description="Discover a curated selection of products to support your PCOS journey, offered at accessible prices."
        icon={ShoppingBasket}
      />

      <Tabs defaultValue={productCategories[0]} className="w-full">
        <ScrollArea className="w-full whitespace-nowrap rounded-md">
          <TabsList className="inline-flex h-auto p-1">
            {productCategories.map(category => (
              <TabsTrigger key={category} value={category} className="text-sm md:text-base px-3 py-1.5 md:px-4 md:py-2">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {productCategories.map(category => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {mockProducts.filter(product => product.category === category).map((product) => (
                <Card key={product.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <div className="relative w-full h-48">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      data-ai-hint={product.dataAiHint}
                    />
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="font-headline text-lg leading-tight">{product.name}</CardTitle>
                    <CardDescription className="text-xs min-h-[2.25em] line-clamp-2">{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow pb-3">
                    <p className="text-xl font-semibold text-primary">{product.price}</p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                      onClick={() => alert(`Viewing product: ${product.name}`)}
                    >
                      {product.ctaText || 'View Product'} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            {mockProducts.filter(product => product.category === category).length === 0 && (
                 <p className="text-muted-foreground text-center py-10">No products found in this category yet. Stay tuned!</p>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
