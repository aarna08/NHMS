import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import {
  MapPin,
  IndianRupee,
  AlertTriangle,
  ChevronRight,
  Gauge,
  Cloud,
  MessageCircle,
  Phone,
} from 'lucide-react';

const features = [
  {
    icon: MapPin,
    title: 'Route Planning',
    description: 'Multiple route options with time, distance, and cost comparison',
  },
  {
    icon: IndianRupee,
    title: 'Toll Calculator',
    description: 'Accurate toll estimates based on vehicle type and route',
  },
  {
    icon: Cloud,
    title: 'Live Updates',
    description: 'Real-time traffic and weather conditions along your route',
  },
  {
    icon: Gauge,
    title: 'Speed Monitoring',
    description: 'Automatic speed limit alerts and overspeeding warnings',
  },
  {
    icon: AlertTriangle,
    title: 'Emergency Assistance',
    description: 'Quick access to hospitals, police, and helpline 1033',
  },
  {
    icon: MessageCircle,
    title: 'Virtual Assistant',
    description: '24/7 chatbot support for all your highway queries',
  },
];

const stats = [
  { label: 'National Highways', value: '150,000+ km' },
  { label: 'Toll Plazas', value: '800+' },
  { label: 'Emergency Centers', value: '2,500+' },
  { label: 'Daily Travelers', value: '50 Lakh+' },
];

export default function Index() {
  return (
    <Layout showChatbot={false}>
      {/* Hero Section */}
  <section
  className="relative min-h-screen overflow-hidden bg-cover bg-center bg-no-repeat"
  style={{ backgroundImage: "url('/background.jpeg')" }}
>

        <div className="absolute inset-0 bg-black/20" />


        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 bg-accent rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-40 w-48 h-48 bg-white rounded-full blur-2xl" />
        </div>

        <div className="gov-container relative z-10 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
                National Highway<br />
                <span className="text-accent">Management System</span>
              </h1>
              <p className="text-xl text-primary-foreground/80 mb-8 max-w-lg">
                Your complete travel companion for safer, efficient, and hassle-free highway journeys across India.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild variant="hero" size="xl">
                  <Link to="/register">
                    Get Started
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild variant="govOutline" size="xl" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  <Link to="/login">
                    Sign In
                  </Link>
                </Button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-secondary py-12">
        <div className="gov-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
              <div key={stat.label} className="text-center animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                <p className="text-3xl lg:text-4xl font-bold text-primary mb-1">{stat.value}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="gov-container">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Everything You Need for Safe Travel
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive features designed to make your highway journey safer and more convenient
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="gov-card group hover:border-accent transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent group-hover:shadow-glow transition-all">
                    <Icon className="w-7 h-7 text-accent group-hover:text-accent-foreground transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/50">
        <div className="gov-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Simple steps to start your journey with NHMS
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Register', desc: 'Create your account with vehicle details' },
              { step: '2', title: 'Plan Route', desc: 'Enter source and destination to see options' },
              { step: '3', title: 'Travel Safe', desc: 'Get real-time updates and emergency support' },
            ].map((item, idx) => (
              <div key={item.step} className="text-center animate-fade-in" style={{ animationDelay: `${idx * 150}ms` }}>
                <div className="w-16 h-16 rounded-full bg-accent text-accent-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-4 shadow-glow">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="gov-container text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join millions of travelers using NHMS for safer and more efficient highway travel.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="hero" size="xl">
              <Link to="/register">
                Create Free Account
                <ChevronRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="xl" className="text-primary-foreground border border-primary-foreground/30 hover:bg-primary-foreground/10">
              <a href="tel:1033">
                <Phone className="w-5 h-5 mr-2" />
                Call Helpline 1033
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
