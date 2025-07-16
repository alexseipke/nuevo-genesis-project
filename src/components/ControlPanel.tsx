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
  Settings
} from 'lucide-react';
import { MissionParameters, ValidationResult } from '@/types/mission';
import { DRONE_MODELS } from '@/data/drones';

interface ControlPanelProps {
  parameters: MissionParameters;
  onParametersChange: (params: Partial<MissionParameters>) => void;
  validation: ValidationResult;
}

export function ControlPanel({ parameters, onParametersChange, validation }: ControlPanelProps) {
  const selectedDrone = DRONE_MODELS.find(d => d.id === parameters.selectedDrone);

  return (
    <div className="w-80 h-full bg-background border-r border-border overflow-y-auto">
      <div className="p-4 space-y-4">
        
        {/* Drone Selection */}
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

            <div>
              <Label className="text-xs">Distancia entre waypoints (m)</Label>
              <Input
                type="number"
                value={parameters.waypointDistance}
                onChange={(e) => onParametersChange({ waypointDistance: Number(e.target.value) })}
                min={1}
                max={1000}
                className="mt-1"
              />
              <div className="text-xs text-muted-foreground mt-1">
                Mínimo recomendado: {validation.suggestions.find(s => s.includes('Aumentar distancia'))?.match(/(\d+)m/)?.[1] || parameters.waypointDistance}m
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

            <div>
              <Label className="text-xs">Cantidad de Imágenes</Label>
              <Input
                type="number"
                value={parameters.imageCount}
                onChange={(e) => onParametersChange({ imageCount: Number(e.target.value) })}
                min={0}
                max={99}
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