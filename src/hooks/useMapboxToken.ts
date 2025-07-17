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

        // Show token input for user to enter their Mapbox token
        setShowTokenInput(true);
        setError('Por favor ingresa tu token público de Mapbox');
        setLoading(false);
      } catch (err) {
        console.error('Error in token setup:', err);
        setShowTokenInput(true);
        setError('Por favor ingresa tu token público de Mapbox');
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