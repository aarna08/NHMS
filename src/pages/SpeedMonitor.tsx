import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import {
  Gauge,
  AlertTriangle,
  Phone,
  Car,
  MapPin,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Navigation,
  Satellite,
  ArrowLeft,
} from 'lucide-react';
import { SpeedData } from '@/types';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useLiveLocation } from '@/hooks/useLiveLocation';
import { LiveLocationMap } from '@/components/features/LiveLocationMap';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const roadSections = [
  { name: 'Expressway - Normal', type: 'expressway', limit: 100 },
  { name: 'Ghat Section - Khandala', type: 'ghat', limit: 40 },
  { name: 'Tunnel - Lonavala', type: 'tunnel', limit: 60 },
  { name: 'Highway - Pune Approach', type: 'highway', limit: 80 },
];

export default function SpeedMonitor() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [speedData, setSpeedData] = useState<SpeedData>({
    currentSpeed: 0,
    speedLimit: 100,
    isOverspeeding: false,
    warningCount: 0,
    location: 'Expressway - Normal',
  });
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [alertSent, setAlertSent] = useState(false);
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [useRealLocation, setUseRealLocation] = useState(true);

  const { 
    location: liveLocation, 
    error: locationError, 
    isTracking,
    startTracking, 
    stopTracking,
    locationHistory 
  } = useLiveLocation();

  // Move auth check AFTER all hooks
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const currentSection = roadSections[currentSectionIndex];

  // Get speed from GPS or simulation
  const displaySpeed = useRealLocation && liveLocation && liveLocation.speed !== null 
    ? Math.round(liveLocation.speed * 3.6) // Convert m/s to km/h
    : speedData.currentSpeed;

  // Simulate speed changes (fallback when not using real location)
  useEffect(() => {
    if (!isMonitoring || (useRealLocation && isTracking)) return;

    const interval = setInterval(() => {
      setSpeedData((prev) => {
        const fluctuation = Math.random() * 30 - 10;
        let newSpeed = Math.max(0, Math.min(160, prev.currentSpeed + fluctuation));

        if (Math.random() > 0.7) {
          newSpeed = currentSection.limit + Math.random() * 50;
        }

        const isOverspeeding = newSpeed > currentSection.limit;
        const newWarningCount = isOverspeeding ? prev.warningCount + 1 : prev.warningCount;

        return {
          ...prev,
          currentSpeed: Math.round(newSpeed),
          speedLimit: currentSection.limit,
          isOverspeeding,
          warningCount: newWarningCount,
          location: currentSection.name,
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isMonitoring, currentSection, useRealLocation, isTracking]);

  // Update speed data from real GPS
  useEffect(() => {
    if (!useRealLocation || !liveLocation || !isMonitoring) return;
    
    const gpsSpeed = liveLocation.speed !== null ? Math.round(liveLocation.speed * 3.6) : 0;
    const isOverspeeding = gpsSpeed > currentSection.limit;
    
    setSpeedData(prev => ({
      ...prev,
      currentSpeed: gpsSpeed,
      isOverspeeding,
      warningCount: isOverspeeding ? prev.warningCount + 1 : prev.warningCount,
    }));
  }, [liveLocation, useRealLocation, isMonitoring, currentSection.limit]);

  // Change road section periodically
  useEffect(() => {
    if (!isMonitoring) return;

    const sectionInterval = setInterval(() => {
      setCurrentSectionIndex((prev) => (prev + 1) % roadSections.length);
    }, 15000);

    return () => clearInterval(sectionInterval);
  }, [isMonitoring]);

  // Check for emergency alert trigger
  useEffect(() => {
    if (speedData.warningCount >= 3 && !alertSent && speedData.isOverspeeding) {
      setShowEmergencyDialog(true);
      setAlertSent(true);
    }
  }, [speedData.warningCount, speedData.isOverspeeding, alertSent]);

  const getSpeedColor = () => {
    if (!isMonitoring) return 'text-muted-foreground';
    if (speedData.isOverspeeding) return 'text-destructive';
    if (displaySpeed >= speedData.speedLimit * 0.9) return 'text-warning';
    return 'text-success';
  };

  const getProgressColor = () => {
    const ratio = displaySpeed / speedData.speedLimit;
    if (ratio >= 1) return 'bg-destructive';
    if (ratio >= 0.9) return 'bg-warning';
    return 'bg-success';
  };

  const handleStartMonitoring = () => {
    setIsMonitoring(true);
    if (useRealLocation) {
      startTracking();
    }
  };

  const handleStopMonitoring = () => {
    setIsMonitoring(false);
    stopTracking();
  };

  const handleReset = () => {
    setSpeedData({
      currentSpeed: 0,
      speedLimit: 100,
      isOverspeeding: false,
      warningCount: 0,
      location: 'Expressway - Normal',
    });
    setCurrentSectionIndex(0);
    setAlertSent(false);
    setIsMonitoring(false);
    stopTracking();
  };

  return (
    <Layout>
      <div className="gov-container py-8">
        <div className="mb-8 animate-fade-in">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Speed Monitor</h1>
              <p className="text-muted-foreground">
                Real-time speed monitoring with live GPS tracking
              </p>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Satellite className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="use-gps" className="text-sm cursor-pointer">Use GPS</Label>
              <Switch
                id="use-gps"
                checked={useRealLocation}
                onCheckedChange={setUseRealLocation}
              />
            </div>
          </div>
          {locationError && (
            <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg text-sm text-warning">
              {locationError}
            </div>
          )}
        </div>

        <Tabs defaultValue="speedometer" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="speedometer" className="gap-2">
              <Gauge className="w-4 h-4" />
              Speedometer
            </TabsTrigger>
            <TabsTrigger value="map" className="gap-2">
              <Navigation className="w-4 h-4" />
              Live Map
            </TabsTrigger>
          </TabsList>

          <TabsContent value="speedometer">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Speedometer Panel */}
              <div className="gov-card text-center">
                <div className="relative w-64 h-64 mx-auto mb-8">
                  {/* Outer Ring */}
                  <div className={`absolute inset-0 rounded-full border-8 ${
                    speedData.isOverspeeding ? 'border-destructive animate-pulse-ring' : 'border-muted'
                  }`} />
                  
                  {/* Speed Display */}
                  <div className="absolute inset-4 rounded-full bg-card shadow-lg flex flex-col items-center justify-center">
                    <span className={`text-6xl font-bold ${getSpeedColor()}`}>
                      {displaySpeed}
                    </span>
                    <span className="text-xl text-muted-foreground">km/h</span>
                    
                    {speedData.isOverspeeding && (
                      <div className="absolute -bottom-2 flex items-center gap-1 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-medium animate-pulse">
                        <AlertTriangle className="w-3 h-3" />
                        OVERSPEEDING
                      </div>
                    )}
                  </div>
                </div>

                {/* Speed Limit Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Current Speed</span>
                    <span className="font-medium">Limit: {speedData.speedLimit} km/h</span>
                  </div>
                  <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`absolute left-0 top-0 h-full transition-all duration-500 ${getProgressColor()}`}
                      style={{ width: `${Math.min((displaySpeed / speedData.speedLimit) * 100, 100)}%` }}
                    />
                    <div
                      className="absolute top-0 h-full w-0.5 bg-foreground"
                      style={{ left: '100%', transform: 'translateX(-50%)' }}
                    />
                  </div>
                </div>

                {/* Location Info */}
                <div className="flex items-center justify-center gap-2 text-muted-foreground mb-6">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {useRealLocation && liveLocation 
                      ? `${liveLocation.latitude.toFixed(4)}, ${liveLocation.longitude.toFixed(4)}`
                      : speedData.location
                    }
                  </span>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    onClick={isMonitoring ? handleStopMonitoring : handleStartMonitoring}
                    variant={isMonitoring ? 'destructive' : 'success'}
                    size="lg"
                    className="gap-2"
                  >
                    {isMonitoring ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
                  </Button>
                  <Button onClick={handleReset} variant="outline" size="lg">
                    <RotateCcw className="w-5 h-5" />
                  </Button>
                  <Button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    variant="ghost"
                    size="icon"
                  >
                    {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </Button>
                </div>
              </div>

              {/* Info Panel */}
              <div className="space-y-6">
                {/* Vehicle Info */}
                <div className="gov-card">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Car className="w-5 h-5 text-accent" />
                    Vehicle Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vehicle Number</span>
                      <span className="font-medium">{user?.vehicleNumber || 'Not Set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Driver</span>
                      <span className="font-medium">{user?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monitoring Status</span>
                      <span className={`font-medium ${isMonitoring ? 'text-success' : 'text-muted-foreground'}`}>
                        {isMonitoring ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">GPS Status</span>
                      <span className={`font-medium ${isTracking ? 'text-success' : 'text-muted-foreground'}`}>
                        {isTracking ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Warning Statistics */}
                <div className="gov-card">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                    Warning Statistics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <span className="text-muted-foreground">Warnings Issued</span>
                      <span className={`text-2xl font-bold ${
                        speedData.warningCount >= 3 ? 'text-destructive' :
                        speedData.warningCount > 0 ? 'text-warning' : 'text-success'
                      }`}>
                        {speedData.warningCount}
                      </span>
                    </div>
                    {speedData.warningCount >= 2 && (
                      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-sm text-destructive font-medium">
                          ⚠️ Warning: {3 - speedData.warningCount} more warning(s) will trigger an emergency alert to authorities.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Speed Limits Reference */}
                <div className="gov-card">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-accent" />
                    Speed Limits Reference
                  </h3>
                  <div className="space-y-2">
                    {roadSections.map((section, idx) => (
                      <div
                        key={section.type}
                        className={`flex justify-between p-3 rounded-lg transition-colors ${
                          idx === currentSectionIndex ? 'bg-accent/10 border border-accent' : 'bg-muted/50'
                        }`}
                      >
                        <span className={idx === currentSectionIndex ? 'text-accent font-medium' : 'text-muted-foreground'}>
                          {section.name}
                        </span>
                        <span className={`font-medium ${idx === currentSectionIndex ? 'text-accent' : ''}`}>
                          {section.limit} km/h
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="map">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <LiveLocationMap
                  location={liveLocation}
                  locationHistory={locationHistory}
                  isTracking={isTracking}
                  className="h-[500px]"
                />
              </div>
              <div className="space-y-4">
                <div className="gov-card">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-accent" />
                    Live Location Data
                  </h3>
                  {liveLocation ? (
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Latitude</span>
                        <span className="font-mono">{liveLocation.latitude.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Longitude</span>
                        <span className="font-mono">{liveLocation.longitude.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Accuracy</span>
                        <span className="font-mono">{liveLocation.accuracy.toFixed(0)} m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Speed</span>
                        <span className="font-mono">
                          {liveLocation.speed !== null 
                            ? `${(liveLocation.speed * 3.6).toFixed(1)} km/h` 
                            : 'N/A'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Heading</span>
                        <span className="font-mono">
                          {liveLocation.heading !== null 
                            ? `${liveLocation.heading.toFixed(0)}°` 
                            : 'N/A'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Points Recorded</span>
                        <span className="font-mono">{locationHistory.length}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      {isTracking ? 'Acquiring GPS signal...' : 'Start monitoring to see live location data.'}
                    </p>
                  )}
                </div>
                <div className="gov-card">
                  <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button
                      onClick={isMonitoring ? handleStopMonitoring : handleStartMonitoring}
                      variant={isMonitoring ? 'destructive' : 'success'}
                      className="w-full gap-2"
                    >
                      {isMonitoring ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      {isMonitoring ? 'Stop Tracking' : 'Start Tracking'}
                    </Button>
                    <Button onClick={handleReset} variant="outline" className="w-full gap-2">
                      <RotateCcw className="w-4 h-4" />
                      Reset Session
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Emergency Alert Dialog */}
      <Dialog open={showEmergencyDialog} onOpenChange={setShowEmergencyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-6 h-6" />
              Emergency Alert Sent
            </DialogTitle>
            <DialogDescription>
              Due to repeated overspeeding violations, an emergency alert has been sent to the authorities.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
              <h4 className="font-semibold text-foreground mb-2">Alert Details</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Vehicle: {user?.vehicleNumber || 'Unknown'}</li>
                <li>• Location: {liveLocation 
                  ? `${liveLocation.latitude.toFixed(4)}, ${liveLocation.longitude.toFixed(4)}`
                  : speedData.location
                }</li>
                <li>• Speed: {displaySpeed} km/h (Limit: {speedData.speedLimit} km/h)</li>
                <li>• Warnings: {speedData.warningCount}</li>
              </ul>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Phone className="w-5 h-5 text-emergency" />
              <span className="text-sm">
                Highway Helpline <strong>1033</strong> and nearby authorities have been notified.
              </span>
            </div>
            <Button onClick={() => setShowEmergencyDialog(false)} className="w-full">
              Understood
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
