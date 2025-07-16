import { Plane, Settings, Download, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onExport: () => void;
  canExport: boolean;
}

export function Header({ onExport, canExport }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border shadow-card">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-primary">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Viizor - UAV Mission Planner</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={onExport}
            disabled={!canExport}
            className="bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar KMZ
          </Button>
          
          <Button variant="outline" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}