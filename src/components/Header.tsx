import { Menu, X, User, LogOut, Settings } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => navigate('/')}
            className="text-xl font-bold text-primary hover:opacity-80 transition-opacity"
          >
            Planner-Viizor
          </button>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          {user && (
            <>
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </button>
              {isAdmin && (
                <button 
                  onClick={() => navigate('/admin')}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Admin
                </button>
              )}
            </>
          )}
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Características
          </a>
          <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Precios
          </a>
          <a href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Contacto
          </a>
        </nav>

        <div className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {profile?.full_name?.charAt(0)?.toUpperCase() || profile?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {profile?.full_name || 'Usuario'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {profile?.email}
                    </p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Admin</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => navigate('/auth')} size="sm">
              Iniciar Sesión
            </Button>
          )}
        </div>

        <button
          className="md:hidden ml-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-background border-b md:hidden">
            <nav className="flex flex-col space-y-4 p-4">
              {user && (
                <>
                  <button 
                    onClick={() => { navigate('/dashboard'); setIsMenuOpen(false); }}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-left"
                  >
                    Dashboard
                  </button>
                  {isAdmin && (
                    <button 
                      onClick={() => { navigate('/admin'); setIsMenuOpen(false); }}
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-left"
                    >
                      Admin
                    </button>
                  )}
                </>
              )}
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Características
              </a>
              <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Precios
              </a>
              <a href="#contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Contacto
              </a>
              {!user && (
                <Button onClick={() => { navigate('/auth'); setIsMenuOpen(false); }} size="sm" className="w-fit">
                  Iniciar Sesión
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};