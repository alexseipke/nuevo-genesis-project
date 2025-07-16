import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Plane, 
  MapPin, 
  Layers, 
  Camera, 
  Target,
  RotateCw, 
  Ruler,
  AlertTriangle,
  CheckCircle,
  Info,
  Clock,
  Battery,
  Settings,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { MissionParameters, ValidationResult } from '@/types/mission';
import { DRONE_MODELS } from '@/data/drones';

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
}

const missionCategories: MissionCategory[] = [
  {
    id: 'inspecciones-verticales',
    title: 'Inspecciones Verticales',
    icon: inspeccionesVerticalesIcon,
    missions: [
      { id: 'orbita-inteligente', title: 'Órbita Inteligente', available: true },
      { id: 'fachadas-pro', title: 'Fachadas Pro', available: false }
    ]
  },
  {
    id: 'vias-caminos',
    title: 'Vías y Caminos',
    icon: viasCaminosIcon,
    missions: [
      { id: 'corredor-inteligente', title: 'Corredor Inteligente', available: true },
      { id: 'puntos-interes', title: 'Puntos de Interés', available: false }
    ]
  },
  {
    id: 'grandes-areas',
    title: 'Grandes Áreas',
    icon: grandesAreasIcon,
    missions: [
      { id: 'ortomosaico-agil', title: 'Ortomosaico Ágil', available: false },
      { id: 'nubes-detalladas-3d', title: 'Nubes detalladas y Modelos 3D', available: false }
    ]
  }
];

interface ControlPanelProps {
  parameters: MissionParameters;
  onParametersChange: (params: Partial<MissionParameters>) => void;
  validation: ValidationResult;
  selectedMissionType: string | null;
  onMissionTypeSelect: (missionType: string) => void;
  waypoints: any[]; // Agregar waypoints para mostrar el estado
}

export function ControlPanel({ parameters, onParametersChange, validation, selectedMissionType, onMissionTypeSelect, waypoints }: ControlPanelProps) {
  const selectedDrone = DRONE_MODELS.find(d => d.id === parameters.selectedDrone);
  const [openCategories, setOpenCategories] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleMissionSelect = (mission: MissionType) => {
    if (mission.available) {
      onMissionTypeSelect(mission.id);
    }
  };

  // Si no hay misión seleccionada, mostrar selector
  if (!selectedMissionType) {
    return (
      <div className="w-80 h-full bg-background border-r border-border overflow-y-auto">
        <div className="p-4 space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-foreground mb-1">
              Selecciona tu Misión
            </h2>
            <p className="text-sm text-muted-foreground">
              Elige el tipo de inspección que necesitas realizar
            </p>
          </div>

          {missionCategories.map((category) => (
            <Card key={category.id} className="mission-card overflow-hidden">
              <Collapsible 
                open={openCategories.includes(category.id)}
                onOpenChange={() => toggleCategory(category.id)}
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center flex-1 gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <img 
                          src={category.icon} 
                          alt={category.title}
                          className="w-8 h-8 opacity-70"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-foreground">
                          {category.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {category.missions.length} misiones
                        </p>
                      </div>
                    </div>
                    <div className="text-muted-foreground">
                      {openCategories.includes(category.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0 pb-4">
                    <div className="space-y-2">
                      {category.missions.map((mission) => (
                        <Button
                          key={mission.id}
                          variant={mission.available ? "default" : "ghost"}
                          className={`w-full justify-start h-auto p-3 text-left ${
                            mission.available 
                              ? "bg-primary/5 hover:bg-primary/10 border border-primary/20" 
                              : "opacity-50 cursor-not-allowed"
                          }`}
                          onClick={() => handleMissionSelect(mission)}
                          disabled={!mission.available}
                        >
                          <div>
                            <div className="text-sm font-medium">
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
    );
  }

  // Renderizar panel específico según la misión seleccionada
  if (selectedMissionType === 'corredor-inteligente') {
    return (
      <div className="w-80 h-full bg-background border-r border-border overflow-y-auto">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Corredor Inteligente</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onMissionTypeSelect('')}
            >
              Cambiar
            </Button>
          </div>

          {/* Selección de Drone */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Plane className="w-4 h-4" />
                Selección de Drone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="drone-select" className="text-xs">Modelo de Drone</Label>
                <Select
                  value={parameters.selectedDrone}
                  onValueChange={(value) => onParametersChange({ selectedDrone: value })}
                >
                  <SelectTrigger id="drone-select">
                    <SelectValue placeholder="Seleccionar drone..." />
                  </SelectTrigger>
                  <SelectContent>
                    {DRONE_MODELS.map(drone => (
                      <SelectItem key={drone.id} value={drone.id}>
                        {drone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedDrone && (
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>Batería: {selectedDrone.batteryLife} min</div>
                  <div>Peso: {selectedDrone.weight}g</div>
                  <div>Vel. máx: {selectedDrone.maxSpeed} m/s</div>
                  <div>Max waypoints: {selectedDrone.maxWaypoints}</div>
                  <div>Max distancia: {selectedDrone.maxDistance/1000}km</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Definición de Puntos del Corredor */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4" />
                Puntos del Corredor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs text-muted-foreground">
                Define al menos 2 puntos para crear el corredor de vuelo. 
                Haz clic en el mapa para añadir puntos.
              </div>
              
              {parameters.corridorPoints.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium">Puntos definidos: {parameters.corridorPoints.length}</div>
                  <div className="max-h-20 overflow-y-auto space-y-1">
                    {parameters.corridorPoints.map((point, index) => (
                      <div key={index} className="text-xs bg-muted p-2 rounded flex justify-between items-center">
                        <span>P{index + 1}: {point.lat.toFixed(6)}, {point.lng.toFixed(6)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1"
                          onClick={() => {
                            const newPoints = parameters.corridorPoints.filter((_, i) => i !== index);
                            onParametersChange({ corridorPoints: newPoints });
                          }}
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => onParametersChange({ corridorPoints: [] })}
                  >
                    Limpiar puntos
                  </Button>
                </div>
              )}

              {parameters.corridorPoints.length === 0 && (
                <div className="text-center py-4 border-2 border-dashed border-muted rounded-lg">
                  <MapPin className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">
                    Haz clic en el mapa para añadir puntos del corredor
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Parámetros del Corredor - Habilitados después de definir puntos */}
          {parameters.corridorPoints.length >= 2 && (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Ruler className="w-4 h-4" />
                    Ancho del Corredor
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs">Ancho (m): {parameters.corridorWidth}</Label>
                    <Slider
                      value={[parameters.corridorWidth || 50]}
                      onValueChange={([value]) => onParametersChange({ corridorWidth: value })}
                      min={10}
                      max={500}
                      step={5}
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Layers className="w-4 h-4" />
                    Solapamiento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs">Solapamiento Frontal: {parameters.frontOverlap}%</Label>
                    <Slider
                      value={[parameters.frontOverlap || 80]}
                      onValueChange={([value]) => onParametersChange({ frontOverlap: value })}
                      min={60}
                      max={90}
                      step={5}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-xs">Solapamiento Lateral: {parameters.sideOverlap}%</Label>
                    <Slider
                      value={[parameters.sideOverlap || 60]}
                      onValueChange={([value]) => onParametersChange({ sideOverlap: value })}
                      min={50}
                      max={80}
                      step={5}
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Target className="w-4 h-4" />
                    Altura de Vuelo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs">Altura (m)</Label>
                    <Input
                      type="number"
                      value={parameters.corridorAltitude}
                      onChange={(e) => onParametersChange({ corridorAltitude: Number(e.target.value) })}
                      min={10}
                      max={120}
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Velocidad de Vuelo - Siempre disponible */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Settings className="w-4 h-4" />
                Velocidad de Vuelo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Velocidad: {parameters.flightSpeed} m/s</Label>
                <Slider
                  value={[parameters.flightSpeed]}
                  onValueChange={([value]) => onParametersChange({ flightSpeed: value })}
                  min={1}
                  max={selectedDrone ? selectedDrone.maxSpeed : 25}
                  step={1}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Estado de la Misión */}
          {waypoints.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Info className="w-4 h-4" />
                  Estado de la Misión
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-muted-foreground">Waypoints</div>
                    <div className="font-medium">{validation.waypointCount}/{selectedDrone?.maxWaypoints || 99}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Distancia</div>
                    <div className="font-medium">{((validation.totalDistance || 0) / 1000).toFixed(1)}km</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Duración
                    </div>
                    <div className="font-medium">{(validation.estimatedDuration || 0).toFixed(1)} min</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground flex items-center gap-1">
                      <Battery className="w-3 h-3" />
                      Baterías
                    </div>
                    <div className="font-medium">{(validation.batteriesRequired || 0).toFixed(1)}</div>
                  </div>
                </div>

                {/* Validation Messages */}
                {validation.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      {validation.errors[0]}
                    </AlertDescription>
                  </Alert>
                )}

                {validation.warnings.length > 0 && validation.errors.length === 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      {validation.warnings[0]}
                    </AlertDescription>
                  </Alert>
                )}

                {validation.isValid && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Misión válida y lista para exportar
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }
  // Panel de Órbita Inteligente (original)
  return (
    <div className="w-80 h-full bg-background border-r border-border overflow-y-auto">
      <div className="p-4 space-y-4">
        
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Órbita Inteligente</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onMissionTypeSelect('')}
          >
            Cambiar
          </Button>
        </div>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Plane className="w-4 h-4" />
              Selección de Drone
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="drone-select" className="text-xs">Modelo de Drone</Label>
              <Select
                value={parameters.selectedDrone}
                onValueChange={(value) => onParametersChange({ selectedDrone: value })}
              >
                <SelectTrigger id="drone-select">
                  <SelectValue placeholder="Seleccionar drone..." />
                </SelectTrigger>
                <SelectContent>
                  {DRONE_MODELS.map(drone => (
                    <SelectItem key={drone.id} value={drone.id}>
                      {drone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedDrone && (
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Batería: {selectedDrone.batteryLife} min</div>
                <div>Peso: {selectedDrone.weight}g</div>
                <div>Vel. máx: {selectedDrone.maxSpeed} m/s</div>
                <div>Max waypoints: {selectedDrone.maxWaypoints}</div>
                <div>Max distancia: {selectedDrone.maxDistance/1000}km</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Orbit Parameters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <RotateCw className="w-4 h-4" />
              Parámetros de Órbita
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Radio Inicial (m)</Label>
                <Input
                  type="number"
                  value={parameters.initialRadius}
                  onChange={(e) => onParametersChange({ initialRadius: Number(e.target.value) })}
                  min={1}
                  max={2000}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Radio Final (m)</Label>
                <Input
                  type="number"
                  value={parameters.finalRadius}
                  onChange={(e) => onParametersChange({ finalRadius: Number(e.target.value) })}
                  min={1}
                  max={2000}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Altura Inicial (m)</Label>
                <Input
                  type="number"
                  value={parameters.initialAltitude}
                  onChange={(e) => onParametersChange({ initialAltitude: Number(e.target.value) })}
                  min={-200}
                  max={500}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Altura Final (m)</Label>
                <Input
                  type="number"
                  value={parameters.finalAltitude}
                  onChange={(e) => onParametersChange({ finalAltitude: Number(e.target.value) })}
                  min={-200}
                  max={500}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Rotaciones: {parameters.rotations}</Label>
              <Slider
                value={[parameters.rotations]}
                onValueChange={([value]) => onParametersChange({ rotations: value })}
                min={0.1}
                max={10}
                step={0.1}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">Punto de Inicio: {parameters.startAngle || 0}°</Label>
              <Slider
                value={[parameters.startAngle || 0]}
                onValueChange={([value]) => onParametersChange({ startAngle: value })}
                min={0}
                max={359}
                step={1}
                className="mt-1"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Label className="text-xs">Dist. waypoints (m)</Label>
                <Input
                  type="number"
                  value={parameters.waypointDistance}
                  onChange={(e) => onParametersChange({ waypointDistance: Number(e.target.value) })}
                  min={1}
                  max={1000}
                  className="mt-1 w-full"
                />
              </div>
              <div className="text-xs text-muted-foreground">
                <div>Recomendado</div>
                <div>superior a:</div>
                <div className="text-lg font-semibold text-foreground">{selectedDrone?.minWaypointDistance || 5}m</div>
              </div>
            </div>

            <div>
              <Label className="text-xs">Velocidad de vuelo: {parameters.flightSpeed} m/s</Label>
              <Slider
                value={[parameters.flightSpeed]}
                onValueChange={([value]) => onParametersChange({ flightSpeed: value })}
                min={1}
                max={selectedDrone ? selectedDrone.maxSpeed : 25}
                step={1}
                className="mt-1"
              />
            </div>


          </CardContent>
        </Card>


        {/* Camera & Target */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Camera className="w-4 h-4" />
              Altura de Objetivo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Altura del Objetivo (m)</Label>
              <Input
                type="number"
                value={parameters.targetAltitude || ''}
                onChange={(e) => onParametersChange({ targetAltitude: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="Sin definir (cámara horizontal)"
                min={-200}
                max={500}
                className="mt-1"
              />
              <div className="text-xs text-muted-foreground mt-1">
                Si se define, la cámara apuntará automáticamente a esta altura
              </div>
            </div>
            
            {parameters.targetAltitude !== undefined && (
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Ángulo gimbal automático: {(validation.automaticGimbalAngle || 0).toFixed(1)}°</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mission Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Info className="w-4 h-4" />
              Estado de la Misión
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-muted-foreground">Waypoints</div>
                <div className="font-medium">{validation.waypointCount}/{selectedDrone?.maxWaypoints || 99}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Distancia</div>
                <div className="font-medium">{((validation.totalDistance || 0) / 1000).toFixed(1)}km</div>
              </div>
              <div>
                <div className="text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Duración
                </div>
                <div className="font-medium">{(validation.estimatedDuration || 0).toFixed(1)} min</div>
              </div>
              <div>
                <div className="text-muted-foreground flex items-center gap-1">
                  <Battery className="w-3 h-3" />
                  Baterías
                </div>
                <div className="font-medium">{(validation.batteriesRequired || 0).toFixed(1)}</div>
              </div>
            </div>

            {/* Validation Messages */}
            {validation.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  {validation.errors[0]}
                </AlertDescription>
              </Alert>
            )}

            {validation.warnings.length > 0 && validation.errors.length === 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  {validation.warnings[0]}
                </AlertDescription>
              </Alert>
            )}

            {validation.isValid && validation.warnings.length === 0 && validation.waypointCount > 0 && (
              <Alert className="border-mission-green">
                <CheckCircle className="h-4 w-4 text-mission-green" />
                <AlertDescription className="text-xs">
                  Misión válida y lista para exportar
                </AlertDescription>
              </Alert>
            )}

          </CardContent>
        </Card>

      </div>
    </div>
  );
}