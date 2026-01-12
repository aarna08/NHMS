import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Link, Navigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  IndianRupee,
  AlertTriangle,
  Cloud,
  Gauge,
  Hospital,
  MessageCircle,
  ChevronRight,
  Car,
} from 'lucide-react';
import { mockWeatherData, mockTrafficAlerts } from '@/data/mockData';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const quickActions = [
    { title: 'Route Planner', icon: MapPin, description: 'Plan your journey', link: '/route-planner', color: 'bg-accent' },
    { title: 'Speed Monitor', icon: Gauge, description: 'Check your speed', link: '/speed-monitor', color: 'bg-success' },
    { title: 'Emergency', icon: Hospital, description: 'Get help now', link: '/emergency', color: 'bg-emergency' },
    { title: 'Chat Assistant', icon: MessageCircle, description: 'Ask questions', link: '#', color: 'bg-primary' },
  ];

  const getWeatherIcon = () => {
    switch (mockWeatherData.condition) {
      case 'clear': return '☀️';
      case 'cloudy': return '☁️';
      case 'rain': return '🌧️';
      case 'fog': return '🌫️';
      case 'storm': return '⛈️';
      default: return '☀️';
    }
  };

  return (
    <Layout>
      <div className="gov-container py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-muted-foreground">
            Your dashboard for safe and efficient highway travel
          </p>
          {user?.vehicleNumber && (
            <div className="mt-4 inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg">
              <Car className="w-5 h-5 text-primary" />
              <span className="font-medium text-primary">{user.vehicleNumber}</span>
            </div>
          )}
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                to={action.link}
                className="gov-card group hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-4 group-hover:shadow-glow transition-shadow`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{action.title}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </Link>
            );
          })}
        </div>

        {/* Stats and Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Weather Widget */}
          <div className="gov-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Cloud className="w-5 h-5 text-accent" />
                Weather Update
              </h3>
              <span className="text-4xl">{getWeatherIcon()}</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Temperature</span>
                <span className="font-semibold text-foreground">{mockWeatherData.temperature}°C</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Visibility</span>
                <span className={`font-semibold capitalize ${
                  mockWeatherData.visibility === 'good' ? 'text-success' :
                  mockWeatherData.visibility === 'moderate' ? 'text-warning' : 'text-destructive'
                }`}>
                  {mockWeatherData.visibility}
                </span>
              </div>
              {mockWeatherData.advisory && (
                <p className="text-sm bg-muted p-3 rounded-lg text-muted-foreground">
                  {mockWeatherData.advisory}
                </p>
              )}
            </div>
          </div>

          {/* Traffic Alerts */}
          <div className="gov-card lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Traffic Alerts
              </h3>
              <span className="text-xs bg-warning/10 text-warning px-2 py-1 rounded-full">
                {mockTrafficAlerts.length} Active
              </span>
            </div>
            <div className="space-y-3">
              {mockTrafficAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-3 rounded-lg border-l-4 ${
                    alert.severity === 'high' ? 'bg-destructive/5 border-destructive' :
                    alert.severity === 'medium' ? 'bg-warning/5 border-warning' : 'bg-muted border-muted-foreground'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-foreground text-sm">{alert.location}</p>
                      <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                    </div>
                    <span className={`gov-badge ${
                      alert.severity === 'high' ? 'gov-badge-danger' :
                      alert.severity === 'medium' ? 'gov-badge-warning' : 'gov-badge-success'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Journey / CTA */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 text-primary-foreground">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Plan Your Next Journey</h2>
              <p className="text-primary-foreground/80">
                Get the best routes with real-time traffic updates and toll estimates
              </p>
            </div>
            <Button asChild variant="accent" size="xl" className="group">
              <Link to="/route-planner">
                Start Planning
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
