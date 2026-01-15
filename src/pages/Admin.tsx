import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  Car,
  MapPin,
  Clock,
  CheckCircle,
  Gauge,
  Phone,
  User,
  RefreshCw,
  Shield,
  Activity,
} from 'lucide-react';
import { mockEmergencyAlerts } from '@/data/mockData';
import { EmergencyAlert } from '@/types';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function Admin() {
  const { isAuthenticated, user } = useAuth();
  const [alerts, setAlerts] = useState<EmergencyAlert[]>(mockEmergencyAlerts);
  const [filter, setFilter] = useState<'all' | 'active' | 'responding' | 'resolved'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!isAuthenticated || user?.role !== 'admin') {
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
      driverName: 'New Alert Driver',
      location: `KM ${Math.floor(Math.random() * 100)}, Mumbai-Pune Expressway`,
      type: 'overspeeding',
      timestamp: new Date(),
      status: 'active',
      speedData: {
        currentSpeed: 100 + Math.floor(Math.random() * 50),
        speedLimit: 100,
        isOverspeeding: true,
        warningCount: 3,
        location: 'Mumbai-Pune Expressway',
      },
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

  const getTypeColor = (type: EmergencyAlert['type']) => {
    switch (type) {
      case 'overspeeding': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'accident': return 'bg-emergency/10 text-emergency border-emergency/20';
      case 'breakdown': return 'bg-warning/10 text-warning border-warning/20';
      case 'medical': return 'bg-accent/10 text-accent border-accent/20';
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
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Manage highway alerts and system operations
              </p>
            </div>
          </div>
          <Button onClick={handleRefresh} disabled={isRefreshing} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Alerts
          </Button>
        </div>

        <Tabs defaultValue="alerts" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="alerts" className="gap-2">
              <AlertTriangle className="w-4 h-4" />
              Emergency Alerts
            </TabsTrigger>
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="w-4 h-4" />
              System Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="gov-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-sm">Total Alerts</span>
                  <AlertTriangle className="w-5 h-5 text-primary" />
                </div>
                <span className="text-3xl font-bold text-foreground">{stats.total}</span>
              </div>
              <div className="gov-card border-l-4 border-destructive">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-sm">Active</span>
                  <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
                </div>
                <span className="text-3xl font-bold text-destructive">{stats.active}</span>
              </div>
              <div className="gov-card border-l-4 border-warning">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-muted-foreground text-sm">Responding</span>
                  <Clock className="w-5 h-5 text-warning" />
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

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
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

            {/* Alerts List */}
            <div className="space-y-4">
              {filteredAlerts.length === 0 ? (
                <div className="gov-card text-center py-12">
                  <CheckCircle className="w-16 h-16 text-success/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No alerts</h3>
                  <p className="text-muted-foreground">All clear! No {filter} alerts at the moment.</p>
                </div>
              ) : (
                filteredAlerts.map((alert, idx) => (
                  <div
                    key={alert.id}
                    className={`gov-card animate-fade-in ${
                      alert.status === 'active' ? 'border-l-4 border-destructive shadow-glow-emergency' : ''
                    }`}
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className={getStatusColor(alert.status)}>
                            {alert.status.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className={getTypeColor(alert.type)}>
                            {alert.type.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatTime(alert.timestamp)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                              <p className="text-xs text-muted-foreground">Driver</p>
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
                          {alert.speedData && (
                            <div className="flex items-center gap-2">
                              <Gauge className="w-5 h-5 text-destructive" />
                              <div>
                                <p className="text-xs text-muted-foreground">Speed</p>
                                <p className="font-semibold text-destructive">
                                  {alert.speedData.currentSpeed} km/h (Limit: {alert.speedData.speedLimit})
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        {alert.status === 'active' && (
                          <>
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => handleStatusChange(alert.id, 'responding')}
                            >
                              Respond
                            </Button>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleStatusChange(alert.id, 'resolved')}
                            >
                              Resolve
                            </Button>
                          </>
                        )}
                        {alert.status === 'responding' && (
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleStatusChange(alert.id, 'resolved')}
                          >
                            Mark Resolved
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
                          Contact
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="overview">
            <div className="gov-card">
              <h3 className="text-lg font-semibold text-foreground mb-4">System Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <p className="text-4xl font-bold text-primary mb-2">4</p>
                  <p className="text-muted-foreground">Active Routes</p>
                </div>
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <p className="text-4xl font-bold text-primary mb-2">7</p>
                  <p className="text-muted-foreground">Toll Plazas</p>
                </div>
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <p className="text-4xl font-bold text-primary mb-2">8</p>
                  <p className="text-muted-foreground">Emergency Centers</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}