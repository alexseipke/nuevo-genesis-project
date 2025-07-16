import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useMapboxToken() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTokenInput, setShowTokenInput] = useState(false);

  useEffect(() => {
    async function fetchToken() {
      try {
        // Check if there's a cached token in localStorage first
        const cachedToken = localStorage.getItem('mapbox_token');
        if (cachedToken && cachedToken.startsWith('pk.')) {
          setToken(cachedToken);
          setLoading(false);
          return;
        }

        // Try to get token from edge function
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) {
          console.error('Error fetching Mapbox token:', error);
          setShowTokenInput(true);
          setError('Token de Mapbox no configurado en el servidor');
          setLoading(false);
          return;
        }
        
        if (data?.token) {
          setToken(data.token);
          setLoading(false);
        } else {
          setShowTokenInput(true);
          setError('Token de Mapbox no disponible');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error calling get-mapbox-token function:', err);
        setShowTokenInput(true);
        setError('Error al obtener configuración del mapa');
        setLoading(false);
      }
    }

    fetchToken();
  }, []);

  const setManualToken = (newToken: string) => {
    localStorage.setItem('mapbox_token', newToken);
    setToken(newToken);
    setShowTokenInput(false);
    setError(null);
  };

  return { token, loading, error, showTokenInput, setManualToken };
}