import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the Mapbox API key from Supabase secrets
    let mapboxToken = Deno.env.get('MAPBOX_PUBLIC_TOKEN');
    
    // If not found, try alternative names
    if (!mapboxToken) {
      mapboxToken = Deno.env.get('MAPBOX_TOKEN');
    }
    if (!mapboxToken) {
      mapboxToken = Deno.env.get('MAPBOX_API_KEY');
    }
    
    // Debug logging
    const allEnvKeys = Object.keys(Deno.env.toObject());
    console.log('Detailed environment check:', {
      hasToken: !!mapboxToken,
      tokenLength: mapboxToken ? mapboxToken.length : 0,
      tokenPrefix: mapboxToken ? mapboxToken.substring(0, 10) + '...' : 'none',
      allEnvKeys: allEnvKeys,
      mapboxKeys: allEnvKeys.filter(key => key.toLowerCase().includes('mapbox')),
      totalEnvVars: allEnvKeys.length
    });
    
    if (!mapboxToken || mapboxToken.trim() === '') {
      console.error('MAPBOX_PUBLIC_TOKEN is empty or not found');
      console.log('All environment variables:', allEnvKeys);
      return new Response(
        JSON.stringify({ 
          error: 'Mapbox token not configured. Please ensure MAPBOX_PUBLIC_TOKEN is set in Supabase Edge Function Secrets.',
          debug: {
            availableKeys: allEnvKeys.filter(key => key.toLowerCase().includes('mapbox')),
            totalKeys: allEnvKeys.length
          }
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Successfully retrieved Mapbox token with length:', mapboxToken.length);
    
    return new Response(
      JSON.stringify({ token: mapboxToken }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    console.error('Error in get-mapbox-token function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});