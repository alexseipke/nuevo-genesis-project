import { useState, useEffect } from 'react';

export function useMapboxToken() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTokenInput, setShowTokenInput] = useState(false);

  useEffect(() => {
    // Token público de Mapbox válido
    const mapboxToken = 'pk.eyJ1IjoidHJhY2tzeW0iLCJhIjoiY2tldGZrcnJzMzQzZzJ3bnRlZmNiNzA1cyJ9.3IwgZxZ5RqfZGNOH7RTGfQ';
    
    console.log('Setting Mapbox token:', mapboxToken.substring(0, 20) + '...');
    
    
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