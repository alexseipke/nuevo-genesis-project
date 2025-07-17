import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useMapboxToken() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTokenInput, setShowTokenInput] = useState(false);

  useEffect(() => {
    async function fetchToken() {
      console.log('🔍 useMapboxToken: Starting token fetch process');
      try {
        // Check if there's a cached token in localStorage first
        const cachedToken = localStorage.getItem('mapbox_token');
        console.log('🔍 useMapboxToken: Cached token check:', { 
          hasCachedToken: !!cachedToken, 
          tokenPrefix: cachedToken ? cachedToken.substring(0, 10) + '...' : 'none' 
        });
        
        if (cachedToken && cachedToken.startsWith('pk.')) {
          console.log('✅ useMapboxToken: Using cached token');
          setToken(cachedToken);
          setLoading(false);
          return;
        }

        console.log('🔍 useMapboxToken: Calling edge function get-mapbox-token');
        // Try to get token from edge function
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        console.log('🔍 useMapboxToken: Edge function response:', { data, error });
        
        if (error) {
          console.error('❌ useMapboxToken: Error fetching Mapbox token:', error);
          setShowTokenInput(true);
          setError('Token de Mapbox no configurado en el servidor');
          setLoading(false);
          return;
        }
        
        if (data?.token) {
          console.log('✅ useMapboxToken: Token received from server:', data.token.substring(0, 10) + '...');
          setToken(data.token);
          setLoading(false);
        } else {
          console.log('❌ useMapboxToken: No token in server response');
          setShowTokenInput(true);
          setError('Token de Mapbox no disponible');
          setLoading(false);
        }
      } catch (err) {
        console.error('❌ useMapboxToken: Exception calling get-mapbox-token function:', err);
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