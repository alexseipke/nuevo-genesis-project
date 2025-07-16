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