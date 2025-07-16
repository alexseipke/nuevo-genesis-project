import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface MapboxTokenInputProps {
  onTokenSet: (token: string) => void;
}

export function MapboxTokenInput({ onTokenSet }: MapboxTokenInputProps) {
  const [token, setToken] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token.trim()) {
      setError('Por favor ingresa tu token de Mapbox');
      return;
    }
    
    if (!token.startsWith('pk.')) {
      setError('El token debe ser un token público que empiece con "pk."');
      return;
    }
    
    setError('');
    onTokenSet(token);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/95 backdrop-blur-sm z-50">
      <div className="max-w-md w-full mx-4 p-6 bg-card rounded-lg shadow-lg border">
        <div className="text-center mb-6">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Configuración de Mapbox requerida
          </h3>
          <p className="text-sm text-muted-foreground">
            Ingresa temporalmente tu token público de Mapbox para usar el mapa
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="mapbox-token" className="block text-sm font-medium mb-2">
              Token Público de Mapbox
            </label>
            <Input
              id="mapbox-token"
              type="text"
              placeholder="pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjb..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Obtén tu token en{' '}
              <a 
                href="https://account.mapbox.com/access-tokens/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                account.mapbox.com
              </a>
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full">
            Usar Token
          </Button>
        </form>

        <div className="mt-4 p-3 bg-muted rounded text-xs text-muted-foreground">
          <strong>Nota:</strong> Este token se guardará temporalmente en tu navegador. 
          Para mayor seguridad, configura el token en Supabase Edge Function Secrets.
        </div>
      </div>
    </div>
  );
}