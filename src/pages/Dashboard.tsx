import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { User, FileText, Download, CreditCard } from 'lucide-react';

const Dashboard = () => {
  const { profile, usage, user } = useAuth();

  if (!user || !profile || !usage) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto pt-20 px-4">
          <div className="text-center">
            <p className="text-muted-foreground">Cargando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const freeProjectsRemaining = Math.max(0, 25 - usage.free_projects_used);
  const freeProgressPercentage = (usage.free_projects_used / 25) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto pt-20 px-4 space-y-6">
        {/* Welcome Section */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            ¡Bienvenido, {profile.full_name || profile.email}!
          </h1>
          <p className="text-muted-foreground">
            Gestiona tus proyectos y exportaciones desde tu dashboard personal
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Perfil</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile.role}</div>
              <p className="text-xs text-muted-foreground">
                {profile.role === 'admin' ? 'Administrador' : 'Usuario'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Proyectos Gratuitos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{freeProjectsRemaining}</div>
              <p className="text-xs text-muted-foreground">
                Restantes de 25
              </p>
              <Progress value={freeProgressPercentage} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Exportaciones</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usage.total_exports}</div>
              <p className="text-xs text-muted-foreground">
                Total realizadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Pendiente</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${usage.pending_charge_amount}</div>
              <p className="text-xs text-muted-foreground">
                Cobro automático a $2.50
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Account Status */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de tu Cuenta</CardTitle>
            <CardDescription>
              Información detallada sobre tu plan y uso actual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Plan actual:</span>
              <Badge variant={freeProjectsRemaining > 0 ? "default" : "secondary"}>
                {freeProjectsRemaining > 0 ? "Gratuito" : "De pago"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Proyectos utilizados:</span>
              <span className="text-sm">{usage.free_projects_used} / 25</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Exportaciones pagadas:</span>
              <span className="text-sm">{usage.paid_exports}</span>
            </div>
            
            {usage.last_export_at && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Última exportación:</span>
                <span className="text-sm">
                  {new Date(usage.last_export_at).toLocaleDateString('es-ES')}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button className="w-full" onClick={() => window.location.href = '/'}>
                Crear Nueva Misión
              </Button>
              <Button variant="outline" className="w-full">
                Ver Mis Proyectos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;