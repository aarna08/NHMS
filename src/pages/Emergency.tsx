import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Phone,
  Hospital,
  Shield,
  Flame,
  Mic,
  MicOff,
  AlertTriangle,
  ChevronRight,
  Heart,
  Bandage,
  Activity,
  Thermometer,
} from 'lucide-react';
import { emergencyCenters, firstAidInstructions } from '@/data/mockData';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const emergencyNumbers = [
  { name: 'Highway Helpline', number: '1033', icon: Phone, description: 'Highway emergency assistance' },
  { name: 'Ambulance', number: '108', icon: Hospital, description: 'Medical emergency' },
  { name: 'Police', number: '100', icon: Shield, description: 'Law enforcement' },
  { name: 'Fire', number: '101', icon: Flame, description: 'Fire emergency' },
];

const firstAidIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Bleeding Control': Bandage,
  'CPR (Cardiopulmonary Resuscitation)': Heart,
  'Fracture Management': Activity,
  'Shock Treatment': Thermometer,
};

export default function Emergency() {
  const { isAuthenticated } = useAuth();
  const [micActive, setMicActive] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const emergencyIcons = {
    hospital: Hospital,
    police: Shield,
    ambulance: Phone,
    fire: Flame,
  };

  return (
    <Layout>
      <div className="gov-container py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">Emergency Assistance</h1>
          <p className="text-muted-foreground">
            Quick access to emergency services and first aid instructions
          </p>
        </div>

        {/* Emergency SOS Banner */}
        <div className="bg-emergency text-emergency-foreground rounded-2xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center animate-pulse-ring">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Emergency SOS</h2>
                <p className="text-emergency-foreground/80">Press for immediate assistance</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Microphone Button */}
              <button
                onClick={() => setMicActive(!micActive)}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                  micActive 
                    ? 'bg-white text-emergency animate-pulse' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                aria-label={micActive ? 'Deactivate microphone' : 'Activate microphone'}
              >
                {micActive ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
              </button>
              <Button variant="ghost" className="bg-white text-emergency hover:bg-white/90 font-bold text-lg px-8 py-6">
                <Phone className="w-5 h-5 mr-2" />
                Call 1033
              </Button>
            </div>
          </div>
          {micActive && (
            <div className="mt-4 p-3 bg-white/20 rounded-lg text-sm flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
              Microphone active - Voice assistance enabled for emergency support
            </div>
          )}
        </div>

        {/* Emergency Numbers Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {emergencyNumbers.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.number}
                href={`tel:${item.number}`}
                className="gov-card group hover:border-emergency transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-emergency/10 flex items-center justify-center group-hover:bg-emergency group-hover:text-emergency-foreground transition-colors">
                    <Icon className="w-6 h-6 text-emergency group-hover:text-emergency-foreground" />
                  </div>
                </div>
                <h3 className="font-semibold text-foreground mb-1">{item.name}</h3>
                <p className="text-2xl font-bold text-emergency">{item.number}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
              </a>
            );
          })}
        </div>

        <Tabs defaultValue="centers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="centers">Nearby Centers</TabsTrigger>
            <TabsTrigger value="firstaid">First Aid</TabsTrigger>
          </TabsList>

          {/* Nearby Emergency Centers */}
          <TabsContent value="centers" className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Emergency Centers Near Your Route</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {emergencyCenters.map((center) => {
                const Icon = emergencyIcons[center.type];
                return (
                  <div key={center.id} className="gov-card hover:shadow-lg transition-all">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        center.type === 'hospital' ? 'bg-emergency/10 text-emergency' :
                        center.type === 'police' ? 'bg-primary/10 text-primary' :
                        center.type === 'ambulance' ? 'bg-warning/10 text-warning' :
                        'bg-destructive/10 text-destructive'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">{center.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{center.address}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-accent font-medium">
                            {center.distance} km away
                          </span>
                          <a
                            href={`tel:${center.phone}`}
                            className="flex items-center gap-1 text-sm text-accent hover:underline"
                          >
                            <Phone className="w-4 h-4" />
                            {center.phone}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* First Aid Instructions */}
          <TabsContent value="firstaid" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">First Aid Instructions</h3>
              <span className="text-sm text-muted-foreground">
                Step-by-step emergency guidance
              </span>
            </div>
            <Accordion type="single" collapsible className="space-y-3">
              {firstAidInstructions.map((item) => {
                const Icon = firstAidIcons[item.title] || Heart;
                return (
                  <AccordionItem key={item.id} value={item.id} className="gov-card border-none">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emergency/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-emergency" />
                        </div>
                        <span className="font-semibold text-foreground">{item.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-0 pb-4">
                      <div className="pl-13 space-y-3">
                        {item.steps.map((step, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                            <span className="w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-medium flex-shrink-0">
                              {index + 1}
                            </span>
                            <p className="text-sm text-foreground">{step}</p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
