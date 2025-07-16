import { Target, Download, ChevronDown, User, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface PromoBannerProps {
  onExportKMZ?: () => void;
  onExportLitchi?: () => void;
  canExport?: boolean;
}

export function PromoBanner({ onExportKMZ, onExportLitchi, canExport = false }: PromoBannerProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 z-50 bg-card border-b border-border shadow-card">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-primary">
              <Target className="w-6 h-6 text-white" />
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
          
          {/* Botones de exportación y usuario */}
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
              <DropdownMenuContent className="z-50 bg-card border border-border shadow-lg">
                <DropdownMenuItem onClick={onExportKMZ} className="hover:bg-muted">
                  Exportar KMZ (Google Earth)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExportLitchi} className="hover:bg-muted">
                  Exportar CSV Litchi
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Menú de usuario */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <User className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="z-50 bg-card border border-border shadow-lg">
                  <DropdownMenuItem onClick={() => navigate('/dashboard')} className="hover:bg-muted">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="hover:bg-muted text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" onClick={() => navigate('/auth')}>
                Iniciar Sesión
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}