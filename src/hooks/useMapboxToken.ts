import { useState, useEffect } from 'react';

export function useMapboxToken() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTokenInput, setShowTokenInput] = useState(false);

  useEffect(() => {
    // Token público de Mapbox - es seguro ponerlo aquí
    const mapboxToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
    
    setToken(mapboxToken);
    setLoading(false);
  }, []);

  const setManualToken = (newToken: string) => {
    localStorage.setItem('mapbox_token', newToken);
    setToken(newToken);
    setShowTokenInput(false);
    setError(null);
  };

  return { token, loading, error, showTokenInput, setManualToken };
}