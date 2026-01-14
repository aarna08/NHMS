import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationData } from '@/hooks/useLiveLocation';

interface LiveLocationMapProps {
  location: LocationData | null;
  locationHistory: LocationData[];
  isTracking: boolean;
  className?: string;
}

// Create custom marker icon for current location
const createCurrentLocationIcon = () => {
  return L.divIcon({
    className: 'custom-live-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 10px rgba(59, 130, 246, 0.5);
        position: relative;
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
        "></div>
      </div>
      <div style="
        position: absolute;
        top: -8px;
        left: -8px;
        width: 40px;
        height: 40px;
        background: rgba(59, 130, 246, 0.2);
        border-radius: 50%;
        animation: pulse-ring 2s ease-out infinite;
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Accuracy circle style
const accuracyStyle = {
  color: '#3b82f6',
  fillColor: '#3b82f6',
  fillOpacity: 0.1,
  weight: 1,
};

// Path style
const pathStyle = {
  color: '#3b82f6',
  weight: 3,
  opacity: 0.7,
};

export function LiveLocationMap({ location, locationHistory, isTracking, className = '' }: LiveLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const pathLineRef = useRef<L.Polyline | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Default to Mumbai if no location
    const defaultCenter: [number, number] = [19.0760, 72.8777];
    
    mapInstanceRef.current = L.map(mapRef.current).setView(defaultCenter, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapInstanceRef.current);

    // Add custom CSS for pulse animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse-ring {
        0% { transform: scale(0.5); opacity: 1; }
        100% { transform: scale(1.5); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker position when location changes
  useEffect(() => {
    if (!mapInstanceRef.current || !location) return;

    const map = mapInstanceRef.current;
    const position: [number, number] = [location.latitude, location.longitude];

    // Update or create marker
    if (markerRef.current) {
      markerRef.current.setLatLng(position);
    } else {
      markerRef.current = L.marker(position, { icon: createCurrentLocationIcon() }).addTo(map);
    }

    // Update or create accuracy circle
    if (accuracyCircleRef.current) {
      accuracyCircleRef.current.setLatLng(position);
      accuracyCircleRef.current.setRadius(location.accuracy);
    } else {
      accuracyCircleRef.current = L.circle(position, {
        ...accuracyStyle,
        radius: location.accuracy,
      }).addTo(map);
    }

    // Center map on location
    map.setView(position, map.getZoom());
  }, [location]);

  // Update path line when history changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    const pathCoords: [number, number][] = locationHistory.map(loc => [loc.latitude, loc.longitude]);

    if (pathCoords.length < 2) return;

    if (pathLineRef.current) {
      pathLineRef.current.setLatLngs(pathCoords);
    } else {
      pathLineRef.current = L.polyline(pathCoords, pathStyle).addTo(map);
    }
  }, [locationHistory]);

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`}>
      <div ref={mapRef} className="w-full h-full min-h-[300px]" />
      
      {/* Status overlay */}
      <div className="absolute top-3 left-3 z-[1000]">
        <div className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 ${
          isTracking 
            ? 'bg-success/90 text-success-foreground' 
            : 'bg-muted/90 text-muted-foreground'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isTracking ? 'bg-white animate-pulse' : 'bg-muted-foreground'}`} />
          {isTracking ? 'Live Tracking' : 'Not Tracking'}
        </div>
      </div>

      {/* Location info overlay */}
      {location && (
        <div className="absolute bottom-3 left-3 right-3 z-[1000]">
          <div className="bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Lat:</span>
                <span className="ml-1 font-mono">{location.latitude.toFixed(6)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Lng:</span>
                <span className="ml-1 font-mono">{location.longitude.toFixed(6)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Accuracy:</span>
                <span className="ml-1 font-mono">{location.accuracy.toFixed(0)}m</span>
              </div>
              <div>
                <span className="text-muted-foreground">Speed:</span>
                <span className="ml-1 font-mono">
                  {location.speed !== null ? `${(location.speed * 3.6).toFixed(0)} km/h` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No location message */}
      {!location && isTracking && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-[1000]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Acquiring location...</p>
          </div>
        </div>
      )}
    </div>
  );
}
