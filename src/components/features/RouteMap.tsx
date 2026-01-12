import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Route, TollPlaza, EmergencyCenter } from '@/types';

// Fix for default marker icons in React-Leaflet
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

function MapBoundsHandler({ coordinates }: { coordinates: [number, number][] }) {
  const map = useMap();
  
  useEffect(() => {
    if (coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates.map(([lat, lng]) => [lat, lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [coordinates, map]);

  return null;
}

export function RouteMap({
  selectedRoute,
  showAllRoutes = false,
  routes = [],
  className = '',
}: RouteMapProps) {
  const center: [number, number] = [18.8, 73.35]; // Center between Mumbai and Pune
  
  const getRouteColor = (routeId: string, isSelected: boolean) => {
    if (isSelected) return '#f97316'; // Orange for selected
    const colors = ['#3b82f6', '#22c55e', '#8b5cf6'];
    const index = routes.findIndex(r => r.id === routeId);
    return colors[index % colors.length];
  };

  const displayRoutes = showAllRoutes ? routes : (selectedRoute ? [selectedRoute] : []);

  return (
    <div className={`relative rounded-xl overflow-hidden border border-border ${className}`}>
      <MapContainer
        center={center}
        zoom={9}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render route polylines */}
        {displayRoutes.map((route) => {
          const coords = routeCoordinates[route.id] || routeCoordinates.route1;
          const isSelected = selectedRoute?.id === route.id;
          return (
            <Polyline
              key={route.id}
              positions={coords}
              pathOptions={{
                color: getRouteColor(route.id, isSelected),
                weight: isSelected ? 5 : 3,
                opacity: isSelected ? 1 : 0.6,
              }}
            />
          );
        })}

        {/* Start and End markers */}
        {(selectedRoute || routes.length > 0) && (
          <>
            <Marker position={[19.076, 72.8777]} icon={startIcon}>
              <Popup>
                <div className="font-semibold">Mumbai (Start)</div>
              </Popup>
            </Marker>
            <Marker position={[18.52, 73.8567]} icon={endIcon}>
              <Popup>
                <div className="font-semibold">Pune (Destination)</div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Toll Plaza markers */}
        {selectedRoute?.tollPlazas.map((plaza) => {
          const coords = tollCoordinates[plaza.id];
          if (!coords) return null;
          return (
            <Marker key={plaza.id} position={coords} icon={tollIcon}>
              <Popup>
                <div className="p-1">
                  <div className="font-semibold text-sm">{plaza.name}</div>
                  <div className="text-xs text-gray-600">{plaza.location}</div>
                  <div className="text-xs mt-1">
                    <span className="font-medium">Toll: </span>
                    Car ₹{plaza.cost.car} | Bike ₹{plaza.cost.motorcycle}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Emergency Center markers */}
        {selectedRoute?.emergencyCenters.map((center) => {
          const coords = emergencyCoordinates[center.id];
          if (!coords) return null;
          return (
            <Marker 
              key={center.id} 
              position={coords} 
              icon={emergencyIcons[center.type]}
            >
              <Popup>
                <div className="p-1">
                  <div className="font-semibold text-sm">{center.name}</div>
                  <div className="text-xs text-gray-600">{center.address}</div>
                  <div className="text-xs mt-1">
                    <span className="font-medium">Phone: </span>
                    <a href={`tel:${center.phone}`} className="text-blue-600 hover:underline">
                      {center.phone}
                    </a>
                  </div>
                  <div className="text-xs">
                    <span className="font-medium">Distance: </span>
                    {center.distance} km
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Fit bounds to selected route */}
        {selectedRoute && routeCoordinates[selectedRoute.id] && (
          <MapBoundsHandler coordinates={routeCoordinates[selectedRoute.id]} />
        )}
      </MapContainer>

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
