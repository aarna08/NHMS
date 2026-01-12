import { useState, useEffect, useCallback } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
} from 'lucide-react';
import { speedLimits } from '@/data/mockData';
import { SpeedData } from '@/types';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const roadSections = [
  { name: 'Expressway - Normal', type: 'expressway', limit: 100 },
  { name: 'Ghat Section - Khandala', type: 'ghat', limit: 40 },
  { name: 'Tunnel - Lonavala', type: 'tunnel', limit: 60 },
  { name: 'Highway - Pune Approach', type: 'highway', limit: 80 },
];

export default function SpeedMonitor() {
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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const currentSection = roadSections[currentSectionIndex];

  // Simulate speed changes
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      setSpeedData((prev) => {
        // Random speed fluctuation
        const fluctuation = Math.random() * 30 - 10;
        let newSpeed = Math.max(0, Math.min(160, prev.currentSpeed + fluctuation));

        // Simulate occasional speeding
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
  }, [isMonitoring, currentSection]);

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
    if (speedData.currentSpeed >= speedData.speedLimit * 0.9) return 'text-warning';
    return 'text-success';
  };

  const getProgressColor = () => {
    const ratio = speedData.currentSpeed / speedData.speedLimit;
    if (ratio >= 1) return 'bg-destructive';
    if (ratio >= 0.9) return 'bg-warning';
    return 'bg-success';
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
  };

  return (
    <Layout>
      <div className="gov-container py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">Speed Monitor</h1>
          <p className="text-muted-foreground">
            Real-time speed monitoring with automatic overspeeding alerts
          </p>
        </div>

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
                  {speedData.currentSpeed}
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
                  style={{ width: `${Math.min((speedData.currentSpeed / speedData.speedLimit) * 100, 100)}%` }}
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
              <span>{speedData.location}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={() => setIsMonitoring(!isMonitoring)}
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
                <li>• Location: {speedData.location}</li>
                <li>• Speed: {speedData.currentSpeed} km/h (Limit: {speedData.speedLimit} km/h)</li>
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
