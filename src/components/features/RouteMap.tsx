import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Route, TollPlaza, EmergencyCenter } from '@/types';

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const createIcon = (color: string, emoji: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      font-size: 14px;
    ">${emoji}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const tollIcon = createIcon('#f59e0b', '💰');
const hospitalIcon = createIcon('#ef4444', '🏥');
const policeIcon = createIcon('#3b82f6', '👮');
const ambulanceIcon = createIcon('#22c55e', '🚑');
const fireIcon = createIcon('#dc2626', '🔥');
const startIcon = createIcon('#22c55e', '🚀');
const endIcon = createIcon('#ef4444', '🏁');

const emergencyIcons: Record<EmergencyCenter['type'], L.DivIcon> = {
  hospital: hospitalIcon,
  police: policeIcon,
  ambulance: ambulanceIcon,
  fire: fireIcon,
};

// Simulated coordinates for Mumbai-Pune route
const routeCoordinates: Record<string, [number, number][]> = {
  route1: [
    [19.076, 72.8777], // Mumbai
    [19.033, 73.029],  // Panvel
    [18.752, 73.402],  // Khopoli
    [18.753, 73.407],  // Lonavala
    [18.52, 73.8567],  // Pune
  ],
  route2: [
    [19.076, 72.8777], // Mumbai
    [19.21, 73.09],    // Karjat
    [18.96, 73.26],    // Malavli
    [18.753, 73.407],  // Lonavala
    [18.52, 73.8567],  // Pune
  ],
  route3: [
    [19.076, 72.8777], // Mumbai
    [19.033, 73.029],  // Panvel
    [18.753, 73.407],  // Lonavala
    [18.52, 73.8567],  // Pune
  ],
};

// Toll plaza coordinates
const tollCoordinates: Record<string, [number, number]> = {
  tp1: [19.033, 73.029],
  tp2: [18.52, 73.75],
  tp3: [18.753, 73.407],
  tp4: [18.96, 73.26],
};

// Emergency center coordinates
const emergencyCoordinates: Record<string, [number, number]> = {
  ec1: [19.05, 73.01],
  ec2: [18.752, 73.402],
  ec3: [18.85, 73.20],
  ec4: [18.753, 73.42],
  ec5: [18.53, 73.85],
  ec6: [18.80, 73.32],
};

interface RouteMapProps {
  selectedRoute?: Route | null;
  tollPlazas?: TollPlaza[];
  emergencyCenters?: EmergencyCenter[];
  showAllRoutes?: boolean;
  routes?: Route[];
  className?: string;
}

export function RouteMap({
  selectedRoute,
  showAllRoutes = false,
  routes = [],
  className = '',
}: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylinesRef = useRef<L.Polyline[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);

  const center: [number, number] = [18.8, 73.35];

  const getRouteColor = (routeId: string, isSelected: boolean) => {
    if (isSelected) return '#f97316';
    const colors = ['#3b82f6', '#22c55e', '#8b5cf6'];
    const index = routes.findIndex(r => r.id === routeId);
    return colors[index % colors.length];
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView(center, 9);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapInstanceRef.current = map;
    setIsMapReady(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map content
  useEffect(() => {
    if (!mapInstanceRef.current || !isMapReady) return;

    const map = mapInstanceRef.current;

    // Clear existing markers and polylines
    markersRef.current.forEach(marker => marker.remove());
    polylinesRef.current.forEach(polyline => polyline.remove());
    markersRef.current = [];
    polylinesRef.current = [];

    const displayRoutes = showAllRoutes ? routes : (selectedRoute ? [selectedRoute] : []);

    // Add route polylines
    displayRoutes.forEach((route) => {
      const coords = routeCoordinates[route.id] || routeCoordinates.route1;
      const isSelected = selectedRoute?.id === route.id;
      
      const polyline = L.polyline(coords, {
        color: getRouteColor(route.id, isSelected),
        weight: isSelected ? 5 : 3,
        opacity: isSelected ? 1 : 0.6,
      }).addTo(map);
      
      polylinesRef.current.push(polyline);
    });

    // Add start and end markers
    if (selectedRoute || routes.length > 0) {
      const startMarker = L.marker([19.076, 72.8777], { icon: startIcon })
        .bindPopup('<div class="font-semibold">Mumbai (Start)</div>')
        .addTo(map);
      
      const endMarker = L.marker([18.52, 73.8567], { icon: endIcon })
        .bindPopup('<div class="font-semibold">Pune (Destination)</div>')
        .addTo(map);
      
      markersRef.current.push(startMarker, endMarker);
    }

    // Add toll plaza markers
    if (selectedRoute?.tollPlazas) {
      selectedRoute.tollPlazas.forEach((plaza) => {
        const coords = tollCoordinates[plaza.id];
        if (!coords) return;
        
        const marker = L.marker(coords, { icon: tollIcon })
          .bindPopup(`
            <div class="p-1">
              <div class="font-semibold text-sm">${plaza.name}</div>
              <div class="text-xs text-gray-600">${plaza.location}</div>
              <div class="text-xs mt-1">
                <span class="font-medium">Toll: </span>
                Car ₹${plaza.cost.car} | Bike ₹${plaza.cost.motorcycle}
              </div>
            </div>
          `)
          .addTo(map);
        
        markersRef.current.push(marker);
      });
    }

    // Add emergency center markers
    if (selectedRoute?.emergencyCenters) {
      selectedRoute.emergencyCenters.forEach((center) => {
        const coords = emergencyCoordinates[center.id];
        if (!coords) return;
        
        const marker = L.marker(coords, { icon: emergencyIcons[center.type] })
          .bindPopup(`
            <div class="p-1">
              <div class="font-semibold text-sm">${center.name}</div>
              <div class="text-xs text-gray-600">${center.address}</div>
              <div class="text-xs mt-1">
                <span class="font-medium">Phone: </span>
                <a href="tel:${center.phone}" class="text-blue-600 hover:underline">${center.phone}</a>
              </div>
              <div class="text-xs">
                <span class="font-medium">Distance: </span>${center.distance} km
              </div>
            </div>
          `)
          .addTo(map);
        
        markersRef.current.push(marker);
      });
    }

    // Fit bounds to selected route
    if (selectedRoute && routeCoordinates[selectedRoute.id]) {
      const bounds = L.latLngBounds(routeCoordinates[selectedRoute.id]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (routes.length > 0) {
      // Fit to all routes
      const allCoords: [number, number][] = [];
      routes.forEach(route => {
        const coords = routeCoordinates[route.id];
        if (coords) allCoords.push(...coords);
      });
      if (allCoords.length > 0) {
        const bounds = L.latLngBounds(allCoords);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [selectedRoute, showAllRoutes, routes, isMapReady]);

  return (
    <div className={`relative rounded-xl overflow-hidden border border-border ${className}`}>
      <div 
        ref={mapRef} 
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
      />

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border z-[1000]">
        <div className="text-xs font-semibold mb-2">Legend</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span>Toll Plaza</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span>Hospital</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            <span>Police</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
            <span>Ambulance</span>
          </div>
        </div>
      </div>
    </div>
  );
}
