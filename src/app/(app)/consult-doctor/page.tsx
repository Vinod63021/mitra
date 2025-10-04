
'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { SectionTitle } from '@/components/SectionTitle';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Stethoscope, MapPin, Phone, Star, Search, Filter, Map, Info, Hospital } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

type Specialty = 'Gynaecologist (PCOS Focus)' | 'Endocrinologist' | 'Nutritionist' | 'General Hospital' | 'Fertility Specialist';

interface ConsultantInfo {
  id: string;
  name: string;
  specialty: Specialty;
  address: string;
  rating: number; // 1-5
  phone: string;
  imageUrl: string;
  dataAiHint: string;
}

const mockConsultants: ConsultantInfo[] = [
  {
    id: '1',
    name: 'Dr. Priya Sharma',
    specialty: 'Gynaecologist (PCOS Focus)',
    address: '123 Wellness Ave, Cityville, ST 12345',
    rating: 4.8,
    phone: '(555) 123-4567',
    imageUrl: 'https://placehold.co/80x80.png',
    dataAiHint: 'doctor portrait woman',
  },
  {
    id: '2',
    name: 'City General Hospital - Women\'s Clinic',
    specialty: 'General Hospital',
    address: '456 Health Rd, Cityville, ST 12345',
    rating: 4.5,
    phone: '(555) 987-6543',
    imageUrl: 'https://placehold.co/80x80.png',
    dataAiHint: 'hospital building modern',
  },
  {
    id: '3',
    name: 'Dr. Arjun Mehta',
    specialty: 'Endocrinologist',
    address: '789 Hormone Ln, Townsburg, ST 67890',
    rating: 4.9,
    phone: '(555) 234-5678',
    imageUrl: 'https://placehold.co/80x80.png',
    dataAiHint: 'doctor portrait man',
  },
  {
    id: '4',
    name: 'Nourish & Flourish Nutrition',
    specialty: 'Nutritionist',
    address: '101 Dietician Dr, Cityville, ST 12345',
    rating: 4.6,
    phone: '(555) 345-6789',
    imageUrl: 'https://placehold.co/80x80.png',
    dataAiHint: 'nutrition clinic',
  },
   {
    id: '5',
    name: 'Hope Fertility Center',
    specialty: 'Fertility Specialist',
    address: '202 Hope St, Metro City, ST 54321',
    rating: 4.7,
    phone: '(555) 555-0000',
    imageUrl: 'https://placehold.co/80x80.png',
    dataAiHint: 'fertility clinic building',
  },
];

const specialties: Specialty[] = ['Gynaecologist (PCOS Focus)', 'Endocrinologist', 'Nutritionist', 'General Hospital', 'Fertility Specialist'];

export default function ConsultDoctorPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | 'All'>('All');

  const filteredConsultants = useMemo(() => {
    return mockConsultants.filter(consultant => {
      const matchesSearch = consultant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            consultant.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecialty = selectedSpecialty === 'All' || consultant.specialty === selectedSpecialty;
      return matchesSearch && matchesSpecialty;
    });
  }, [searchTerm, selectedSpecialty]);

  return (
    <div className="container mx-auto py-8">
      <SectionTitle
        title="Consult a Doctor"
        description="Find healthcare professionals specializing in PCOS and related conditions. (This is a demo feature and requires API integration for live data)."
        icon={Stethoscope}
      />

      <Alert variant="default" className="mb-8 bg-primary/10 border-primary/30">
        <Info className="h-5 w-5 text-primary" />
        <AlertTitle className="font-semibold text-primary">Developer Note</AlertTitle>
        <AlertDescription className="text-primary/80">
          This "Consult a Doctor" page is a conceptual demonstration. For full functionality, integration with mapping services (e.g., Google Maps API) and a database of healthcare providers is required. The current data is for mock purposes only.
        </AlertDescription>
      </Alert>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2"><Search className="h-5 w-5"/> Find a Specialist</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Search by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="md:col-span-2"
          />
          <Select value={selectedSpecialty} onValueChange={(value) => setSelectedSpecialty(value as Specialty | 'All')}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by specialty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Specialties</SelectItem>
              {specialties.map(spec => (
                <SelectItem key={spec} value={spec}>{spec}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <ScrollArea className="lg:col-span-1 h-[600px] pr-4">
          <div className="space-y-4">
            {filteredConsultants.length > 0 ? (
              filteredConsultants.map(consultant => (
                <Card key={consultant.id} className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center gap-3 pb-3">
                     <Image
                        src={consultant.imageUrl}
                        alt={consultant.name}
                        width={60}
                        height={60}
                        className="rounded-full object-cover border-2 border-primary/20"
                        data-ai-hint={consultant.dataAiHint}
                      />
                    <div className="flex-1">
                      <CardTitle className="text-lg font-headline">{consultant.name}</CardTitle>
                      <CardDescription className="text-xs">{consultant.specialty}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-1.5 text-sm">
                    <p className="text-muted-foreground flex items-center gap-1.5">
                      <MapPin size={14} className="text-primary shrink-0" /> {consultant.address}
                    </p>
                    <p className="text-muted-foreground flex items-center gap-1.5">
                      <Phone size={14} className="text-primary shrink-0" /> {consultant.phone}
                    </p>
                    <div className="flex items-center gap-1 pt-1">
                      {Array(5).fill(0).map((_, i) => (
                        <Star key={i} size={16} className={i < Math.floor(consultant.rating) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"} />
                      ))}
                      <span className="text-xs text-muted-foreground ml-1">({consultant.rating.toFixed(1)})</span>
                    </div>
                  </CardContent>
                  <CardFooter className="gap-2 pt-3">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => alert(`Mock: View ${consultant.name} on map.`)}>
                      View on Map
                    </Button>
                    <Button size="sm" className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => alert(`Mock: Book appointment with ${consultant.name}.`)}>
                      Book Appointment
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-10">No specialists found matching your criteria.</p>
            )}
          </div>
        </ScrollArea>

        <Card className="lg:col-span-2 h-[600px] flex flex-col items-center justify-center bg-muted/50 shadow-inner sticky top-8">
          <Map className="w-24 h-24 text-primary/40 mb-6" />
          <h3 className="text-2xl font-semibold text-muted-foreground font-headline">Interactive Map Placeholder</h3>
          <p className="text-muted-foreground mt-2">Nearby doctors and hospitals will be displayed here.</p>
          <p className="text-xs text-muted-foreground/70 mt-4">(Requires API integration with a mapping service)</p>
        </Card>
      </div>
    </div>
  );
}
