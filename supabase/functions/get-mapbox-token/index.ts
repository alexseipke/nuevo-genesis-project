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
    
    console.log('Environment check:', {
      hasToken: !!mapboxToken,
      tokenLength: mapboxToken ? mapboxToken.length : 0,
      allEnvKeys: Object.keys(Deno.env.toObject()).filter(key => key.toLowerCase().includes('mapbox'))
    });
    
    if (!mapboxToken) {
      console.error('MAPBOX_PUBLIC_TOKEN not found in environment variables');
      console.log('Available environment variables:', Object.keys(Deno.env.toObject()));
      return new Response(
        JSON.stringify({ error: 'Mapbox token not configured. Please check if MAPBOX_PUBLIC_TOKEN is set in Supabase Edge Function Secrets.' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Successfully retrieved Mapbox token');
    
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