import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TollPlaza {
  id: string
  name: string
  location: string
  cost: {
    car: number
    motorcycle: number
    truck: number
    bus: number
  }
}

interface EmergencyCenter {
  id: string
  name: string
  type: 'hospital' | 'police' | 'ambulance' | 'fire'
  distance: number
  phone: string
  address: string
}

interface Route {
  id: string
  name: string
  distance: number
  estimatedTime: number
  tollCost: number
  trafficLevel: 'low' | 'medium' | 'high'
  tollPlazas: TollPlaza[]
  emergencyCenters: EmergencyCenter[]
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized', data: null }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    // Verify JWT
    const token = authHeader.replace('Bearer ', '')
    const { data: claims, error: authError } = await supabase.auth.getClaims(token)
    if (authError || !claims?.claims) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized', data: null }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = new URL(req.url)
    const source = url.searchParams.get('source')
    const destination = url.searchParams.get('destination')
    const routeId = url.searchParams.get('routeId')
    const vehicleType = url.searchParams.get('vehicleType') || 'car'

    // Fetch routes based on query params
    let routesQuery = supabase
      .from('routes')
      .select('*')
      .eq('is_active', true)

    if (routeId) {
      routesQuery = routesQuery.eq('id', routeId)
    } else if (source && destination) {
      routesQuery = routesQuery
        .ilike('source', `%${source}%`)
        .ilike('destination', `%${destination}%`)
    }

    const { data: routesData, error: routesError } = await routesQuery

    if (routesError) {
      return new Response(
        JSON.stringify({ success: false, error: routesError.message, data: null }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Transform routes with toll plazas and emergency centers
    const routes: Route[] = await Promise.all(
      (routesData || []).map(async (route) => {
        // Fetch toll plazas for this route
        const { data: tollPlazasData } = await supabase
          .from('route_toll_plazas')
          .select(`
            sequence_order,
            toll_plazas (
              id,
              name,
              location,
              cost_car,
              cost_motorcycle,
              cost_truck,
              cost_bus
            )
          `)
          .eq('route_id', route.id)
          .order('sequence_order')

        // Fetch emergency centers for this route
        const { data: emergencyCentersData } = await supabase
          .from('route_emergency_centers')
          .select(`
            distance_km,
            emergency_centers (
              id,
              name,
              type,
              phone,
              address
            )
          `)
          .eq('route_id', route.id)

        // Transform toll plazas
        const tollPlazas: TollPlaza[] = (tollPlazasData || []).map((item: any) => ({
          id: item.toll_plazas.id,
          name: item.toll_plazas.name,
          location: item.toll_plazas.location,
          cost: {
            car: item.toll_plazas.cost_car,
            motorcycle: item.toll_plazas.cost_motorcycle,
            truck: item.toll_plazas.cost_truck,
            bus: item.toll_plazas.cost_bus,
          },
        }))

        // Transform emergency centers
        const emergencyCenters: EmergencyCenter[] = (emergencyCentersData || []).map((item: any) => ({
          id: item.emergency_centers.id,
          name: item.emergency_centers.name,
          type: item.emergency_centers.type,
          distance: Number(item.distance_km),
          phone: item.emergency_centers.phone,
          address: item.emergency_centers.address,
        }))

        // Calculate total toll cost based on vehicle type
        const tollCostKey = `cost_${vehicleType}` as keyof typeof tollPlazas[0]['cost']
        const totalTollCost = tollPlazas.reduce(
          (sum, plaza) => sum + (plaza.cost[vehicleType as keyof typeof plaza.cost] || 0),
          0
        )

        return {
          id: route.id,
          name: route.name,
          distance: Number(route.distance_km),
          estimatedTime: route.estimated_time_mins,
          tollCost: totalTollCost,
          trafficLevel: route.traffic_level as 'low' | 'medium' | 'high',
          tollPlazas,
          emergencyCenters,
        }
      })
    )

    return new Response(
      JSON.stringify({
        success: true,
        data: routes,
        error: null,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: null,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
