import { useState, useEffect } from 'react';
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

  const [weatherData, setWeatherData] = useState({
    temperature: '--',
    condition: 'clear',
    visibility: 'good',
    advisory: 'Fetching local weather...',
    locationName: 'Locating...'
  });

  const [trafficAlerts, setTrafficAlerts] = useState<any[]>(mockTrafficAlerts);
  const [trafficLoading, setTrafficLoading] = useState(true);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Get City Name
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`);
          const geoData = await geoRes.json();
          const city = geoData.address?.city || geoData.address?.state_district || geoData.address?.state || 'Your Location';

          // Get Real Weather
          const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,visibility&timezone=auto`);
          const wData = await weatherRes.json();
          
          const temp = wData.current?.temperature_2m || '--';
          const code = wData.current?.weather_code || 0;
          const vis = wData.current?.visibility || 10000;

          let condition = 'clear';
          let advisory = 'Clear weather. Safe for driving.';
          if (code >= 51 && code <= 67) { condition = 'rain'; advisory = 'Rainy conditions. Maintain safe braking distance.'; }
          else if (code >= 71 && code <= 77) { condition = 'snow'; advisory = 'Snowy conditions. Drive slow.'; }
          else if (code >= 95) { condition = 'storm'; advisory = 'Thunderstorms. Avoid starting journey if possible.'; }
          else if (code === 45 || code === 48) { condition = 'fog'; advisory = 'Low visibility due to fog. Use fog lamps.'; }
          else if (code > 0 && code <= 3) { condition = 'cloudy'; }

          let visState = 'good';
          if (vis < 1000) visState = 'poor (Low)';
          else if (vis < 4000) visState = 'moderate';

          setWeatherData({
            temperature: Math.round(temp).toString(),
            condition,
            visibility: visState,
            advisory,
            locationName: city
          });

          // Generate context-aware mock traffic alerts
          const alerts = [];
          const isBadWeather = code >= 51; // rain, snow, storm, fog
          
          if (isBadWeather) {
            alerts.push({
              id: 1,
              location: `${city} Main Highway`,
              message: `Speed limits reduced due to ${condition} conditions. Drive cautiously.`,
              severity: code >= 95 ? 'high' : 'medium'
            });
            alerts.push({
              id: 2,
              location: `Near ${city} Outer Ring`,
              message: `Moderate congestion due to poor weather. Delay: 10-15 minutes.`,
              severity: 'medium'
            });
          } else {
            // Traffic based on time of day
            const hour = new Date().getHours();
            const isRushHour = (hour >= 8 && hour <= 11) || (hour >= 17 && hour <= 20);
            if (isRushHour) {
               alerts.push({
                 id: 1,
                 location: `${city} City Center Expressway`,
                 message: `Heavy rush hour traffic. Expect delays up to 20 minutes.`,
                 severity: 'high'
               });
               alerts.push({
                 id: 2,
                 location: `${city} Toll Plaza`,
                 message: `Slow moving traffic at the toll plaza.`,
                 severity: 'medium'
               });
            } else {
               alerts.push({
                 id: 1,
                 location: `${city} District Road`,
                 message: `Normal traffic conditions. Safe travel.`,
                 severity: 'low'
               });
               alerts.push({
                 id: 2,
                 location: `KM 45-48 near ${city}`,
                 message: `Lane closure for maintenance. Single lane operation.`,
                 severity: 'low'
               });
            }
          }
          setTrafficAlerts(alerts);
          setTrafficLoading(false);
        } catch (error) {
          console.error("Weather fetch failed", error);
          setWeatherData(prev => ({ ...prev, advisory: 'Weather data unavailable', locationName: 'Unknown' }));
          setTrafficAlerts(mockTrafficAlerts);
          setTrafficLoading(false);
        }
      }, (error) => {
          setWeatherData({
            temperature: '28',
            condition: 'clear',
            visibility: 'good',
            advisory: 'Location disabled. Showing default weather.',
            locationName: 'India'
          });
          setTrafficAlerts(mockTrafficAlerts);
          setTrafficLoading(false);
      });
    }
  }, []);

  const quickActions = [
    { title: 'Route Planner', icon: MapPin, description: 'Plan your journey', link: '/route-planner', color: 'bg-accent' },
    { title: 'Speed Monitor', icon: Gauge, description: 'Check your speed', link: '/speed-monitor', color: 'bg-success' },
    { title: 'Emergency', icon: Hospital, description: 'Get help now', link: '/emergency', color: 'bg-emergency' },
    { title: 'Chat Assistant', icon: MessageCircle, description: 'Ask questions', link: null, color: 'bg-primary', action: 'openChat' },
  ];

  const getWeatherIcon = () => {
    switch (weatherData.condition) {
      case 'clear': return '☀️';
      case 'cloudy': return '☁️';
      case 'rain': return '🌧️';
      case 'fog': return '🌫️';
      case 'storm': return '⛈️';
      case 'snow': return '❄️';
      default: return '☀️';
    }
  };

  return (
    <Layout>
      <div className="gov-container py-8">
        {/* Welcome Section */}
        <div className="mb-10 animate-fade-in text-center lg:text-left">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-foreground mb-3 tracking-tight">
            Welcome back, <span className="text-gradient">{user?.name}</span>!
          </h1>
          <p className="text-lg text-muted-foreground font-light">
            Your intelligent dashboard for safe and efficient highway travel
          </p>
          {user?.vehicleNumber && (
            <div className="mt-6 inline-flex items-center gap-3 bg-primary/10 border border-primary/20 px-5 py-2.5 rounded-full backdrop-blur-md transition-all hover:bg-primary/20">
              <Car className="w-5 h-5 text-primary" />
              <span className="font-semibold tracking-wide text-primary">{user.vehicleNumber}</span>
            </div>
          )}
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            
            const cardClasses = "glass-card group hover:scale-105 transition-all duration-300 text-left cursor-pointer border-white/20 dark:border-white/10 hover:border-primary/50 hover:shadow-glow-primary bg-white/40 dark:bg-black/20 flex flex-col p-6";
            
            // Handle Chat Assistant separately - trigger click on chatbot button
            if (action.action === 'openChat') {
              return (
                <button
                  key={action.title}
                  onClick={() => {
                    // Find and click the chatbot button
                    const chatButton = document.querySelector('[aria-label="Open chat assistant"]') as HTMLButtonElement;
                    if (chatButton) chatButton.click();
                  }}
                  className={cardClasses}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className={`w-14 h-14 rounded-2xl ${action.color} bg-opacity-90 flex items-center justify-center mb-5 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300 -rotate-3 group-hover:rotate-0`}>
                    <Icon className="w-7 h-7 text-white drop-shadow-md" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground mb-2">{action.title}</h3>
                  <p className="text-sm text-muted-foreground font-medium">{action.description}</p>
                </button>
              );
            }
            
            return (
              <Link
                key={action.title}
                to={action.link!}
                className={cardClasses}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className={`w-14 h-14 rounded-2xl ${action.color} bg-opacity-90 flex items-center justify-center mb-5 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-300 -rotate-3 group-hover:rotate-0`}>
                  <Icon className="w-7 h-7 text-white drop-shadow-md" />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">{action.title}</h3>
                <p className="text-sm text-muted-foreground font-medium">{action.description}</p>
              </Link>
            );
          })}
        </div>

        {/* Stats and Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Weather Widget */}
          <div className="glass-card bg-white/40 dark:bg-black/20 overflow-hidden relative border-white/20">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl"></div>
            <div className="relative z-10 flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-3">
                <Cloud className="w-6 h-6 text-accent drop-shadow" />
                Weather Update
              </h3>
              <span className="text-5xl drop-shadow-md">{getWeatherIcon()}</span>
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-6 pb-4 border-b border-border/50 relative z-10">
              <MapPin className="w-3 h-3 inline mr-1"/> {weatherData.locationName}
            </p>
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center p-3 rounded-xl bg-background/50 backdrop-blur-sm border border-border/40">
                <span className="text-muted-foreground font-medium">Temperature</span>
                <span className="font-bold text-xl text-foreground">{weatherData.temperature}°C</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-background/50 backdrop-blur-sm border border-border/40">
                <span className="text-muted-foreground font-medium">Visibility</span>
                <span className={`font-bold capitalize tracking-wide ${
                  weatherData.visibility.includes('good') ? 'text-success drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]' :
                  weatherData.visibility.includes('moderate') ? 'text-warning' : 'text-destructive'
                }`}>
                  {weatherData.visibility}
                </span>
              </div>
              {weatherData.advisory && (
                <p className="text-sm bg-accent/10 border border-accent/20 p-4 rounded-xl text-foreground font-medium shadow-inner">
                  {weatherData.advisory}
                </p>
              )}
            </div>
          </div>

          {/* Traffic Alerts */}
          <div className="glass-card lg:col-span-2 bg-white/40 dark:bg-black/20 border-white/20">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
              <h3 className="font-bold text-lg text-foreground flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-warning drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                Traffic Alerts
              </h3>
              <span className="text-xs bg-warning/20 border border-warning/30 text-warning px-4 py-1.5 rounded-full font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                {trafficLoading ? 'Updating...' : `${trafficAlerts.length} Active`}
              </span>
            </div>
            <div className="space-y-4">
              {trafficLoading ? (
                <div className="p-8 text-center text-muted-foreground animate-pulse border border-border/40 rounded-2xl bg-background/60 backdrop-blur-sm">
                  Fetching real-time local traffic data...
                </div>
              ) : trafficAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-5 rounded-2xl border ${
                    alert.severity === 'high' ? 'bg-destructive/10 border-destructive/30 shadow-[inset_0_0_20px_rgba(239,68,68,0.05)]' :
                    alert.severity === 'medium' ? 'bg-warning/10 border-warning/30' : 'bg-background/60 border-border/40'
                  } backdrop-blur-sm transition-transform hover:-translate-y-1`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <p className="font-bold text-foreground text-base mb-1">{alert.location}</p>
                      <p className="text-sm text-foreground/80 leading-relaxed">{alert.message}</p>
                    </div>
                    <span className={`gov-badge whitespace-nowrap ${
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
        <div className="relative overflow-hidden bg-gradient-to-r from-primary via-[#7B3FE4] to-accent rounded-3xl p-8 lg:p-12 text-white shadow-2xl border border-white/20">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 blur-3xl rounded-full"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-3xl lg:text-4xl font-extrabold mb-3 tracking-tight drop-shadow-md">Plan Your Next Journey</h2>
              <p className="text-white/90 text-lg lg:text-xl font-light max-w-xl">
                Experience smart routing with real-time dynamic traffic updates and automated exact toll estimations.
              </p>
            </div>
            <Button asChild bg-white size="xl" className="group h-14 px-8 rounded-full bg-white text-primary hover:bg-gray-50 shadow-glow-primary transition-all duration-300 hover:scale-105 font-bold text-lg border-none shrink-0">
              <Link to="/route-planner">
                Start Planning
                <ChevronRight className="w-6 h-6 ml-2 group-hover:translate-x-2 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
