import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Shield, 
  Car,
  Phone,
  ChevronDown
} from 'lucide-react';
import logoImage from '@/assets/logo.jpeg';
import { NotificationCenter } from './NotificationCenter';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    switch (user.role) {
      case 'admin':
        return '/admin';
      default:
        return '/dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-background/80 border-b border-border/40 shadow-sm transition-all duration-300">
      <div className="gov-container">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src={logoImage} 
              alt="NHMS Logo" 
              className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover shadow-glow"
            />
            <h1 className="hidden sm:block text-foreground font-bold text-lg md:text-xl tracking-wide">
              NHMS
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link 
                  to={getDashboardLink()} 
                  className="text-foreground/80 hover:text-primary transition-colors font-medium"
                >
                  Dashboard
                </Link>
                {user?.role === 'traveller' && (
                  <>
                    <Link 
                      to="/route-planner" 
                      className="text-foreground/80 hover:text-primary transition-colors font-medium"
                    >
                      Route Planner
                    </Link>
                    <Link 
                      to="/emergency" 
                      className="text-foreground/80 hover:text-primary transition-colors font-medium"
                    >
                      Emergency
                    </Link>
                  </>
                )}
                <NotificationCenter />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-foreground gap-2 hover:bg-muted/50">
                      <User className="w-4 h-4" />
                      {user?.name}
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="gap-2 cursor-pointer">
                      <User className="w-4 h-4" />
                      Profile
                    </DropdownMenuItem>
                    {user?.vehicleNumber && (
                      <DropdownMenuItem className="gap-2">
                        <Car className="w-4 h-4" />
                        {user.vehicleNumber}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="gap-2 text-destructive">
                      <LogOut className="w-4 h-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-foreground/80 hover:text-primary transition-colors font-medium"
                >
                  Login
                </Link>
                <Button asChild variant="accent" size="sm">
                  <Link to="/register">Register</Link>
                </Button>
              </>
            )}
          </nav>

          {/* Emergency Helpline Badge */}
          <a
            href="tel:1033"
            className="hidden lg:flex items-center gap-2 bg-emergency/90 px-4 py-2 rounded-lg cursor-pointer hover:bg-emergency transition-colors duration-200 hover:scale-105 active:scale-95 transform"
            title="Call Highway Emergency Helpline 1033"
          >
            <Phone className="w-4 h-4 text-emergency-foreground animate-pulse" />
            <span className="text-emergency-foreground font-semibold text-sm">
              Emergency: 1033
            </span>
          </a>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground p-2 hover:bg-muted/50 rounded-md transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Mobile Notification Icon (Visible when authenticated) */}
          {isAuthenticated && (
            <div className="md:hidden mr-2">
              <NotificationCenter />
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/40 animate-fade-in bg-background/95 backdrop-blur-xl absolute top-full left-0 w-full px-4 shadow-lg pb-6">
            <nav className="flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link 
                    to={getDashboardLink()} 
                    className="text-foreground/80 hover:text-primary transition-colors font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {user?.role === 'traveller' && (
                    <>
                      <Link 
                        to="/route-planner" 
                        className="text-foreground/80 hover:text-primary transition-colors font-medium py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Route Planner
                      </Link>
                      <Link 
                        to="/emergency" 
                        className="text-foreground/80 hover:text-primary transition-colors font-medium py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Emergency
                      </Link>
                    </>
                  )}
                  <div className="flex items-center gap-2 py-2 text-foreground/70">
                    <User className="w-4 h-4" />
                    {user?.name}
                  </div>
                  <Button variant="ghost" onClick={handleLogout} className="justify-start text-foreground/80 hover:text-destructive hover:bg-destructive/10">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-foreground/80 hover:text-primary transition-colors font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="text-foreground/80 hover:text-primary transition-colors font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
              <a
                href="tel:1033"
                className="flex items-center gap-2 bg-emergency/90 px-4 py-2 rounded-lg mt-2 cursor-pointer hover:bg-emergency transition-colors duration-200 active:scale-95 transform"
                title="Call Highway Emergency Helpline 1033"
              >
                <Phone className="w-4 h-4 text-emergency-foreground animate-pulse" />
                <span className="text-emergency-foreground font-semibold text-sm">
                  Emergency: 1033
                </span>
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
