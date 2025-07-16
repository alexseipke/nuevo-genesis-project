import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// Import the generated icons
import inspeccionesVerticalesIcon from '@/assets/inspecciones-verticales.png';
import viasCaminosIcon from '@/assets/vias-caminos.png';
import grandesAreasIcon from '@/assets/grandes-areas.png';

interface MissionCategory {
  id: string;
  title: string;
  icon: string;
  missions: MissionType[];
}

interface MissionType {
  id: string;
  title: string;
  available: boolean;
  route?: string;
}

const missionCategories: MissionCategory[] = [
  {
    id: 'inspecciones-verticales',
    title: 'Inspecciones Verticales',
    icon: inspeccionesVerticalesIcon,
    missions: [
      { id: 'orbita-inteligente', title: 'Órbita Inteligente', available: true, route: '/orbita-inteligente' },
      { id: 'fachadas', title: 'Fachadas', available: false }
    ]
  },
  {
    id: 'vias-caminos',
    title: 'Vías y Caminos',
    icon: viasCaminosIcon,
    missions: [
      { id: 'corredor-inteligente', title: 'Corredor Inteligente', available: true, route: '/corredor-inteligente' },
      { id: 'puntos-interes', title: 'Puntos de Interés', available: false }
    ]
  },
  {
    id: 'grandes-areas',
    title: 'Grandes Áreas',
    icon: grandesAreasIcon,
    missions: [
      { id: 'ortomosaicos-agiles', title: 'Ortomosaicos Ágiles', available: false },
      { id: 'ortomosaicos-detallados', title: 'Ortomosaicos y Nubes Detalladas', available: false }
    ]
  }
];

const MissionSelector: React.FC = () => {
  const navigate = useNavigate();
  const [openCategories, setOpenCategories] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleMissionSelect = (mission: MissionType) => {
    if (mission.available && mission.route) {
      navigate(mission.route);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-sky p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Selecciona tu Misión
          </h1>
          <p className="text-muted-foreground text-lg">
            Elige el tipo de inspección que necesitas realizar
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1 max-w-2xl mx-auto">
          {missionCategories.map((category) => (
            <Card key={category.id} className="mission-card overflow-hidden">
              <Collapsible 
                open={openCategories.includes(category.id)}
                onOpenChange={() => toggleCategory(category.id)}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center p-6 hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center flex-1 gap-4">
                      <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                        <img 
                          src={category.icon} 
                          alt={category.title}
                          className="w-10 h-10 opacity-70"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground">
                          {category.title}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {category.missions.length} misiones disponibles
                        </p>
                      </div>
                    </div>
                    <div className="text-muted-foreground">
                      {openCategories.includes(category.id) ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0 pb-6">
                    <div className="space-y-3">
                      {category.missions.map((mission) => (
                        <Button
                          key={mission.id}
                          variant={mission.available ? "default" : "ghost"}
                          className={`w-full justify-start h-auto p-4 ${
                            mission.available 
                              ? "bg-primary/5 hover:bg-primary/10 border border-primary/20" 
                              : "opacity-50 cursor-not-allowed"
                          }`}
                          onClick={() => handleMissionSelect(mission)}
                          disabled={!mission.available}
                        >
                          <div className="text-left">
                            <div className="font-medium">
                              {mission.title}
                              {!mission.available && (
                                <span className="ml-2 text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                                  Próximamente
                                </span>
                              )}
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MissionSelector;