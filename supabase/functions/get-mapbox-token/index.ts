import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
  'Access-Control-Max-Age': '86400',
}

Deno.serve(async (req) => {
  console.log(`Request method: ${req.method}, URL: ${req.url}`);
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response('OK', { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    // Get the Mapbox API key from Supabase secrets
    const mapboxToken = Deno.env.get('MAPBOX_PUBLIC_TOKEN');
    
    console.log('Environment check:', {
      hasToken: !!mapboxToken,
      tokenStart: mapboxToken ? mapboxToken.substring(0, 10) + '...' : 'none'
    });
    
    if (!mapboxToken) {
      console.error('MAPBOX_PUBLIC_TOKEN not found in environment variables');
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