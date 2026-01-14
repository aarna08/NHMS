import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Route, VehicleType } from '@/types';

interface RoutesApiResponse {
  success: boolean;
  data: Route[] | null;
  error: string | null;
  timestamp?: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

async function fetchRoutes(
  source?: string,
  destination?: string,
  vehicleType: VehicleType = 'car'
): Promise<Route[]> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;

  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  const params = new URLSearchParams();
  if (source) params.append('source', source);
  if (destination) params.append('destination', destination);
  params.append('vehicleType', vehicleType);

  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/routes-api?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch routes: ${response.statusText}`);
  }

  const result: RoutesApiResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch routes');
  }

  return result.data || [];
}

async function fetchRouteById(
  routeId: string,
  vehicleType: VehicleType = 'car'
): Promise<Route | null> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token;

  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  const params = new URLSearchParams();
  params.append('routeId', routeId);
  params.append('vehicleType', vehicleType);

  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/routes-api?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch route: ${response.statusText}`);
  }

  const result: RoutesApiResponse = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch route');
  }

  return result.data?.[0] || null;
}

/**
 * Hook to fetch all routes or filter by source/destination
 */
export function useRoutes(
  source?: string,
  destination?: string,
  vehicleType: VehicleType = 'car',
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['routes', { source, destination, vehicleType }],
    queryFn: () => fetchRoutes(source, destination, vehicleType),
    enabled: enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to fetch routes when search is triggered
 */
export function useSearchRoutes(
  source: string,
  destination: string,
  vehicleType: VehicleType,
  shouldSearch: boolean
) {
  return useQuery({
    queryKey: ['routes', 'search', { source, destination, vehicleType }],
    queryFn: () => fetchRoutes(source, destination, vehicleType),
    enabled: shouldSearch && !!source && !!destination,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch a single route by ID
 */
export function useRoute(routeId: string | null, vehicleType: VehicleType = 'car') {
  return useQuery({
    queryKey: ['route', routeId, vehicleType],
    queryFn: () => fetchRouteById(routeId!, vehicleType),
    enabled: !!routeId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Utility function to calculate toll cost for a route with a specific vehicle type
 */
export function calculateTollCost(route: Route, vehicleType: VehicleType): number {
  return route.tollPlazas.reduce(
    (sum, plaza) => sum + (plaza.cost[vehicleType] || 0),
    0
  );
}
