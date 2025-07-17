import { useState, useEffect } from 'react';

export function useMapboxToken() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTokenInput, setShowTokenInput] = useState(false);

  useEffect(() => {
    // Verificar si hay un token guardado en localStorage
    const savedToken = localStorage.getItem('mapbox_token');
    
    if (savedToken) {
      console.log('Using saved token from localStorage');
      setToken(savedToken);
      setLoading(false);
    } else {
      console.log('No token found, showing input form');
      setShowTokenInput(true);
      setLoading(false);
    }
  }, []);

  const setManualToken = (newToken: string) => {
    localStorage.setItem('mapbox_token', newToken);
    setToken(newToken);
    setShowTokenInput(false);
    setError(null);
  };

  return { token, loading, error, showTokenInput, setManualToken };
}