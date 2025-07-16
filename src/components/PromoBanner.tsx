import { Plane } from 'lucide-react';

interface PromoBannerProps {}

export function PromoBanner({}: PromoBannerProps) {
  return (
    <div className="bg-card border-b border-border shadow-card">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-primary">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Planner-Viizor</h1>
          </div>
          
          {/* Texto promocional */}
          <div className="flex-1 px-6">
            <p className="text-sm text-foreground text-center">
              <span className="font-semibold">¡Aprovecha al máximo Planner-Viizor!</span> Descarga{" "}
              <a 
                href="https://forum.flylitchi.com/t/open-beta-litchi-pilot/10621" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 font-semibold underline"
              >
                Litchi Pilot
              </a>{" "}
              - compatible con Mini 4 Pro, Mini 3 & Mini 3 Pro, Matrice 4 (4E, 4T, 4D, 4TD), Mavic 3 Enterprise (3E, 3T, 3M), Matrice 30, Matrice 300 & 350 RTK
            </p>
          </div>
          
          {/* Botones de acción - se pueden agregar desde ControlPanel si es necesario */}
          <div className="flex items-center gap-3">
            {/* Los botones de exportar se moverán al ControlPanel */}
          </div>
        </div>
      </div>
    </div>
  );
}