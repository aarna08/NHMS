import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Car,
  MapPin,
  Clock,
  CheckCircle,
  Phone,
  User,
  RefreshCw,
  Ambulance,
  Activity,
  Heart,
} from 'lucide-react';
import { mockEmergencyAlerts } from '@/data/mockData';
import { EmergencyAlert } from '@/types';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function EmergencyAuthority() {
  const { isAuthenticated, user } = useAuth();
  const [alerts, setAlerts] = useState<EmergencyAlert[]>(
    mockEmergencyAlerts.filter(a => a.type === 'medical' || a.type === 'accident')
  );
  const [filter, setFilter] = useState<'all' | 'active' | 'responding' | 'resolved'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isAuthenticated || user?.role !== 'emergency_services') {
    return <Navigate to="/login" replace />;
  }

  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(a => a.status === filter);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newAlert: EmergencyAlert = {
      id: `ea${Date.now()}`,
      vehicleNumber: `MH-${Math.floor(Math.random() * 50)}-XX-${Math.floor(Math.random() * 9999)}`,
      driverName: 'Emergency Case',
      location: `KM ${Math.floor(Math.random() * 100)}, Mumbai-Pune Expressway`,
      type: Math.random() > 0.5 ? 'medical' : 'accident',
      timestamp: new Date(),
      status: 'active',
    };
    setAlerts(prev => [newAlert, ...prev]);
    setIsRefreshing(false);
  };

  const handleStatusChange = (alertId: string, newStatus: EmergencyAlert['status']) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, status: newStatus } : alert
      )
    );
  };

  const getStatusColor = (status: EmergencyAlert['status']) => {
    switch (status) {
      case 'active': return 'bg-destructive text-destructive-foreground';
      case 'responding': return 'bg-warning text-warning-foreground';
      case 'resolved': return 'bg-success text-success-foreground';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ${diff % 60}m ago`;
  };

  const stats = {
    total: alerts.length,
    active: alerts.filter(a => a.status === 'active').length,
    responding: alerts.filter(a => a.status === 'responding').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
  };

  return (
    <Layout showChatbot={false}>
      <div className="gov-container py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Emergency Services Dashboard</h1>
            <p className="text-muted-foreground">
              Medical and accident emergency response coordination
            </p>
          </div>
          <Button onClick={handleRefresh} disabled={isRefreshing} variant="emergency" className="gap-2">
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Check New Alerts
          </Button>
        </div>

        {/* Emergency Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="gov-card bg-gradient-to-br from-emergency/5 to-emergency/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-sm">Total Emergencies</span>
              <Heart className="w-5 h-5 text-emergency" />
            </div>
            <span className="text-3xl font-bold text-emergency">{stats.total}</span>
          </div>
          <div className="gov-card border-l-4 border-destructive">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-sm">Critical</span>
              <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
            </div>
            <span className="text-3xl font-bold text-destructive">{stats.active}</span>
          </div>
          <div className="gov-card border-l-4 border-warning">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-sm">Dispatched</span>
              <Ambulance className="w-5 h-5 text-warning" />
            </div>
            <span className="text-3xl font-bold text-warning">{stats.responding}</span>
          </div>
          <div className="gov-card border-l-4 border-success">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-sm">Resolved</span>
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <span className="text-3xl font-bold text-success">{stats.resolved}</span>
          </div>
        </div>

        {/* Quick Action Banner */}
        <div className="bg-emergency text-emergency-foreground rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Activity className="w-12 h-12" />
              <div>
                <h2 className="text-xl font-bold">Emergency Response Protocol</h2>
                <p className="text-emergency-foreground/80">
                  All active emergencies require immediate attention
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" className="bg-white/20 text-white hover:bg-white/30">
                <Phone className="w-4 h-4 mr-2" />
                Contact 108
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(['all', 'active', 'responding', 'resolved'] as const).map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
              className="capitalize"
            >
              {status}
              {status !== 'all' && (
                <span className="ml-1 text-xs">({stats[status]})</span>
              )}
            </Button>
          ))}
        </div>

        {/* Emergency Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="gov-card text-center py-12">
              <CheckCircle className="w-16 h-16 text-success/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No emergencies</h3>
              <p className="text-muted-foreground">No {filter} emergencies at the moment.</p>
            </div>
          ) : (
            filteredAlerts.map((alert, idx) => (
              <div
                key={alert.id}
                className={`gov-card animate-fade-in ${
                  alert.status === 'active' ? 'border-l-4 border-emergency shadow-glow-emergency' : ''
                }`}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className={getStatusColor(alert.status)}>
                        {alert.status.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className={
                        alert.type === 'medical' 
                          ? 'bg-emergency/10 text-emergency border-emergency/20'
                          : 'bg-destructive/10 text-destructive border-destructive/20'
                      }>
                        {alert.type === 'medical' ? '🏥 MEDICAL' : '🚗 ACCIDENT'}
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatTime(alert.timestamp)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Car className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Vehicle</p>
                          <p className="font-semibold">{alert.vehicleNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Patient/Driver</p>
                          <p className="font-semibold">{alert.driverName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Location</p>
                          <p className="font-semibold">{alert.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    {alert.status === 'active' && (
                      <Button
                        variant="emergency"
                        size="sm"
                        onClick={() => handleStatusChange(alert.id, 'responding')}
                        className="gap-1"
                      >
                        <Ambulance className="w-4 h-4" />
                        Dispatch
                      </Button>
                    )}
                    {alert.status === 'responding' && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleStatusChange(alert.id, 'resolved')}
                      >
                        Patient Secured
                      </Button>
                    )}
                    {alert.status === 'resolved' && (
                      <Button variant="outline" size="sm" disabled>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Resolved
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="gap-1">
                      <Phone className="w-4 h-4" />
                      Call
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
