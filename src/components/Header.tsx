import { Plane, Settings, Download, Bot, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onExportKMZ: () => void;
  onExportLitchi: () => void;
  canExport: boolean;
  missionType?: string;
}

export function Header({ onExportKMZ, onExportLitchi, canExport, missionType }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border shadow-card">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-primary">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">viizor</h1>
            <p className="text-sm text-muted-foreground">
              {missionType ? missionType : "Mission Planning Pro"}
            </p>
          </div>
        </div>
        
        {/* Texto promocional de Litchi Pilot */}
        <div className="flex-1 px-6">
          <div className="bg-gradient-primary/10 border border-primary/20 rounded-lg px-4 py-2">
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
              ya que es compatible con Mini 4 Pro, Mini 3 & Mini 3 Pro, Matrice 4 (4E, 4T, 4D, 4TD), Mavic 3 Enterprise (3E, 3T, 3M), Matrice 30, Matrice 300 & 350 RTK
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                disabled={!canExport}
                className="bg-gradient-primary hover:opacity-90 transition-opacity"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={onExportKMZ}>
                Exportar KMZ (Google Earth)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportLitchi}>
                Exportar CSV Litchi
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}