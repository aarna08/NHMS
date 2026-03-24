import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  MapPin,
  Navigation,
  Clock,
  IndianRupee,
  Route as RouteIcon,
  Car,
  Bike,
  Truck,
  Bus,
  AlertCircle,
  Hospital,
  Shield,
  Phone,
  Flame,
  CheckCircle,
  Map,
  Loader2,
  ArrowLeft,
  Target,
} from 'lucide-react';
import { mockRoutes } from '@/data/mockData';
import { Route, VehicleType, EmergencyCenter } from '@/types';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { RouteMap } from '@/components/features/RouteMap';
import { useSearchRoutes, calculateTollCost } from '@/hooks/useRoutes';
import { useAutocomplete } from '@/hooks/useAutocomplete';

const vehicleIcons: Record<VehicleType, React.ComponentType<{ className?: string }>> = {
  car: Car,
  motorcycle: Bike,
  truck: Truck,
  bus: Bus,
};

const vehicleLabels: Record<VehicleType, string> = {
  car: 'Car',
  motorcycle: 'Motorcycle',
  truck: 'Truck',
  bus: 'Bus',
};

const emergencyIcons: Record<EmergencyCenter['type'], React.ComponentType<{ className?: string }>> = {
  hospital: Hospital,
  police: Shield,
  ambulance: Phone,
  fire: Flame,
};

export default function RoutePlanner() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('car');
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [shouldSearch, setShouldSearch] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [showSourceSuggestions, setShowSourceSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  
  // Store exact coordinates if selected from autocomplete to avoid re-geocoding errors
  const [sourceCoords, setSourceCoords] = useState<{lat: number, lon: number} | null>(null);
  const [destCoords, setDestCoords] = useState<{lat: number, lon: number} | null>(null);

  // Autocomplete hooks
  const { suggestions: sourceSuggestions, isLoading: sourceAutoLoading, clearSuggestions: clearSourceSuggestions } = useAutocomplete(source, showSourceSuggestions);
  const { suggestions: destSuggestions, isLoading: destAutoLoading, clearSuggestions: clearDestSuggestions } = useAutocomplete(destination, showDestSuggestions);

  // Fetch current location
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch(`http://localhost:3000/api/geocode/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
          const data = await res.json();
          if (data.success && data.exactAddress) {
            setSource(data.exactAddress);
            setSourceCoords({ lat: position.coords.latitude, lon: position.coords.longitude });
            setShouldSearch(false);
          } else {
            setSource('Current Location');
          }
        } catch (e) {
          console.error('Reverse Geocode error:', e);
          setSource('Current Location');
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsLocating(false);
        alert('Could not access your location. Please check your browser permissions.');
      }
    );
  };

  // Use the API hook for fetching routes
  const { 
    data: apiRoutes, 
    isLoading: isApiLoading, 
    error: apiError,
    isFetched: isApiFetched
  } = useSearchRoutes(source, destination, vehicleType, shouldSearch, sourceCoords, destCoords);

  // Fallback to mock data if API returns empty but NO error occurred
  const routes: Route[] = (() => {
    if (apiError) return [];
    if (apiRoutes && apiRoutes.length > 0) {
      return apiRoutes;
    }
    if (shouldSearch && isApiFetched && (!apiRoutes || apiRoutes.length === 0)) {
      // Fallback to mock data with calculated toll costs
      return mockRoutes.map((route) => ({
        ...route,
        tollCost: calculateTollCost(route, vehicleType),
      }));
    }
    return [];
  })();

  const isSearching = isApiLoading;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleSearch = () => {
    if (!source || !destination) return;
    setShouldSearch(true);
  };

  // Reset search when inputs change
  const handleSourceChange = (value: string) => {
    setSource(value);
    setSourceCoords(null); // Reset coords if user manually edits
    setShouldSearch(false);
    setShowSourceSuggestions(true);
  };

  const handleDestinationChange = (value: string) => {
    setDestination(value);
    setDestCoords(null); // Reset coords if user manually edits
    setShouldSearch(false);
    setShowDestSuggestions(true);
  };

  const handleSourceSelect = (displayName: string, lat: number, lon: number) => {
    setSource(displayName);
    setSourceCoords({ lat, lon });
    setShowSourceSuggestions(false);
    clearSourceSuggestions();
  };

  const handleDestSelect = (displayName: string, lat: number, lon: number) => {
    setDestination(displayName);
    setDestCoords({ lat, lon });
    setShowDestSuggestions(false);
    clearDestSuggestions();
  };

  const handleVehicleTypeChange = (value: VehicleType) => {
    setVehicleType(value);
    if (shouldSearch) {
      // Re-trigger search with new vehicle type
      setShouldSearch(false);
      setTimeout(() => setShouldSearch(true), 0);
    }
  };

  const getTrafficColor = (level: Route['trafficLevel']) => {
    switch (level) {
      case 'low': return 'text-success';
      case 'medium': return 'text-warning';
      case 'high': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const VehicleIcon = vehicleIcons[vehicleType];

  return (
    <Layout>
      <div className="gov-container py-8">
        <div className="mb-10 animate-fade-in text-center lg:text-left">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mb-6 gap-2 text-muted-foreground hover:text-foreground bg-background/50 hover:bg-background/80 backdrop-blur-sm transition-all rounded-full px-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-foreground mb-4 tracking-tight">Route <span className="text-gradient">Planner</span></h1>
          <p className="text-lg text-muted-foreground font-light">
            Plan your intelligent journey with precise real-time traffic, dynamic toll cost calculation, and more.
          </p>
        </div>

        {/* Map Section */}
        <div className="mb-12 animate-fade-in relative z-10">
          <div className="glass-card p-0 overflow-hidden shadow-2xl border border-white/20 dark:border-white/10">
            <div className="px-6 py-4 bg-background/40 backdrop-blur-md border-b border-white/20 dark:border-white/10 flex items-center gap-3">
              <Map className="w-6 h-6 text-primary" />
              <h3 className="font-bold text-lg text-foreground tracking-wide">Interactive Route Map</h3>
              {selectedRoute && (
                <span className="ml-auto text-sm font-medium text-primary px-3 py-1 bg-primary/10 rounded-full">
                  Showing: {selectedRoute.name}
                </span>
              )}
            </div>
            <RouteMap 
              selectedRoute={selectedRoute}
              showAllRoutes={routes.length > 0 && !selectedRoute}
              routes={routes}
              className="h-[400px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Panel */}
          <div className="lg:col-span-1">
            <div className="glass-card sticky top-28 p-6 lg:p-8 animate-slide-up bg-white/40 dark:bg-black/20 shadow-xl border border-white/30 dark:border-white/10">
              <h3 className="font-bold text-xl text-foreground mb-8 flex items-center gap-3 border-b border-border/50 pb-4">
                <RouteIcon className="w-6 h-6 text-primary" />
                Plan Your Journey
              </h3>

              <div className="space-y-5">
                {/* Source */}
                <div className="space-y-2">
                  <Label htmlFor="source">Starting Point</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-success z-10" />
                      <Input
                        id="source"
                        value={source}
                        onChange={(e) => handleSourceChange(e.target.value)}
                        onFocus={() => setShowSourceSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSourceSuggestions(false), 200)}
                        placeholder="e.g. Taj Mahal, Agra"
                        className="pl-10 gov-input"
                        autoComplete="off"
                      />
                      {/* Source Autocomplete Dropdown */}
                      {showSourceSuggestions && sourceSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto animate-fade-in">
                          {sourceSuggestions.map((s, idx) => (
                            <button
                              key={idx}
                              type="button"
                              className="w-full text-left px-4 py-3 text-sm hover:bg-primary/10 transition-colors border-b border-border/30 last:border-b-0 flex items-start gap-3"
                              onMouseDown={() => handleSourceSelect(s.display_name, s.lat, s.lon)}
                            >
                              <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                              <span className="text-foreground/90 leading-snug line-clamp-2">{s.display_name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      {showSourceSuggestions && sourceAutoLoading && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-50 p-4 text-center text-sm text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
                          Searching locations...
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={handleCurrentLocation}
                      disabled={isLocating}
                      title="Use Current Location"
                      className="shrink-0 h-[46px] w-[46px]"
                    >
                      {isLocating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Target className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>

                {/* Destination */}
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination</Label>
                  <div className="relative">
                    <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-destructive z-10" />
                    <Input
                      id="destination"
                      value={destination}
                      onChange={(e) => handleDestinationChange(e.target.value)}
                      onFocus={() => setShowDestSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowDestSuggestions(false), 200)}
                      placeholder="e.g. India Gate, New Delhi"
                      className="pl-10 gov-input"
                      autoComplete="off"
                    />
                    {/* Destination Autocomplete Dropdown */}
                    {showDestSuggestions && destSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto animate-fade-in">
                        {destSuggestions.map((s, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className="w-full text-left px-4 py-3 text-sm hover:bg-primary/10 transition-colors border-b border-border/30 last:border-b-0 flex items-start gap-3"
                            onMouseDown={() => handleDestSelect(s.display_name, s.lat, s.lon)}
                          >
                            <Navigation className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                            <span className="text-foreground/90 leading-snug line-clamp-2">{s.display_name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {showDestSuggestions && destAutoLoading && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-50 p-4 text-center text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
                        Searching locations...
                      </div>
                    )}
                  </div>
                </div>

                {/* Vehicle Type */}
                <div className="space-y-3">
                  <Label>Vehicle Type</Label>
                  <RadioGroup
                    value={vehicleType}
                    onValueChange={(value) => handleVehicleTypeChange(value as VehicleType)}
                    className="grid grid-cols-2 gap-3"
                  >
                    {Object.entries(vehicleLabels).map(([value, label]) => {
                      const Icon = vehicleIcons[value as VehicleType];
                      return (
                        <div key={value}>
                          <RadioGroupItem value={value} id={value} className="peer sr-only" />
                          <Label
                            htmlFor={value}
                            className="flex items-center gap-2 p-3 border-2 border-muted rounded-lg cursor-pointer transition-all hover:border-accent peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/5"
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-sm">{label}</span>
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </div>

                {/* Search Button */}
                <Button
                  onClick={handleSearch}
                  className="w-full h-14 text-lg rounded-xl shadow-glow-primary hover:scale-[1.02] transition-transform duration-300 font-semibold mt-4"
                  size="lg"
                  disabled={!source || !destination || isSearching}
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    'Find Routes'
                  )}
                </Button>

                {/* API Error Notice */}
                {apiError && (
                  <p className="text-sm text-destructive font-medium text-center mt-2 animate-fade-in">
                    {apiError instanceof Error ? apiError.message : 'Could not find routes for these locations'}
                  </p>
                )}

                {/* Quick Select */}
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-2">Quick Select:</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setSource('Mumbai, Maharashtra');
                      setSourceCoords({ lat: 19.0760, lon: 72.8777 });
                      setDestination('Pune, Maharashtra');
                      setDestCoords({ lat: 18.5204, lon: 73.8567 });
                    }}
                  >
                    Mumbai → Pune
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
            {routes.length === 0 ? (
              <div className="glass-card text-center py-20 bg-white/30 dark:bg-black/20 border border-white/20">
                <RouteIcon className="w-20 h-20 text-muted-foreground/30 mx-auto mb-6 animate-pulse" />
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  No Routes Yet
                </h3>
                <p className="text-muted-foreground text-lg">
                  Enter your source and destination to find available routes
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">
                    Available Routes ({routes.length})
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <VehicleIcon className="w-4 h-4" />
                    {vehicleLabels[vehicleType]}
                  </div>
                </div>

                {routes.map((route, idx) => (
                  <div
                    key={route.id}
                    className={`glass-card cursor-pointer transition-all duration-300 transform ${
                      selectedRoute?.id === route.id
                        ? 'ring-2 ring-primary shadow-glow-primary scale-[1.02] bg-white/70 dark:bg-primary/5'
                        : 'hover:shadow-xl hover:-translate-y-1 bg-white/40 dark:bg-black/30'
                    }`}
                    style={{ animationDelay: `${idx * 100}ms` }}
                    onClick={() => setSelectedRoute(route)}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                      <div>
                        <h4 className="font-semibold text-foreground text-lg mb-1">
                          {route.name}
                        </h4>
                        {(route.exactSource || route.exactDest) && (
                          <div className="text-xs text-muted-foreground mb-3 leading-relaxed">
                            <span className="font-medium">From:</span> {route.exactSource} <br/>
                            <span className="font-medium">To:</span> {route.exactDest}
                          </div>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {route.distance} km
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatTime(route.estimatedTime)}
                          </span>
                          <span className={`flex items-center gap-1 ${getTrafficColor(route.trafficLevel)}`}>
                            <AlertCircle className="w-4 h-4" />
                            {route.trafficLevel} traffic
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Toll Cost</p>
                          <p className="text-2xl font-bold text-accent flex items-center">
                            <IndianRupee className="w-5 h-5" />
                            {route.tollCost}
                          </p>
                        </div>
                        {selectedRoute?.id === route.id && (
                          <CheckCircle className="w-6 h-6 text-success" />
                        )}
                      </div>
                    </div>

                    {selectedRoute?.id === route.id && (
                      <div className="pt-4 border-t border-border space-y-4 animate-fade-in">
                        {/* Toll Plazas */}
                        <div>
                          <h5 className="text-sm font-medium text-foreground mb-2">Toll Plazas</h5>
                          <div className="flex flex-wrap gap-2">
                            {route.tollPlazas.map((plaza) => (
                              <span
                                key={plaza.id}
                                className="text-xs bg-muted px-3 py-1.5 rounded-full"
                              >
                                {plaza.name} - ₹{plaza.cost[vehicleType]}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Emergency Centers */}
                        <div>
                          <h5 className="text-sm font-medium text-foreground mb-2">
                            Nearby Emergency Centers
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {route.emergencyCenters.map((center) => {
                              const Icon = emergencyIcons[center.type];
                              return (
                                <div
                                  key={center.id}
                                  className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                                >
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    center.type === 'hospital' ? 'bg-emergency/10 text-emergency' :
                                    center.type === 'police' ? 'bg-primary/10 text-primary' :
                                    center.type === 'ambulance' ? 'bg-warning/10 text-warning' :
                                    'bg-destructive/10 text-destructive'
                                  }`}>
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                      {center.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {center.distance} km away
                                    </p>
                                    <a
                                      href={`tel:${center.phone}`}
                                      className="text-xs text-accent hover:underline"
                                    >
                                      {center.phone}
                                    </a>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <Button className="w-full" variant="accent">
                          Start Navigation
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
