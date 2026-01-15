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
    <header className="sticky top-0 z-50 bg-primary shadow-lg">
      <div className="gov-container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-accent flex items-center justify-center shadow-glow">
              <Car className="w-5 h-5 md:w-6 md:h-6 text-accent-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-primary-foreground font-bold text-lg md:text-xl leading-tight">
                NHMS
              </h1>
              <p className="text-primary-foreground/70 text-xs md:text-sm">
                National Highway Management System
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link 
                  to={getDashboardLink()} 
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors font-medium"
                >
                  Dashboard
                </Link>
                {user?.role === 'traveller' && (
                  <>
                    <Link 
                      to="/route-planner" 
                      className="text-primary-foreground/80 hover:text-primary-foreground transition-colors font-medium"
                    >
                      Route Planner
                    </Link>
                    <Link 
                      to="/emergency" 
                      className="text-primary-foreground/80 hover:text-primary-foreground transition-colors font-medium"
                    >
                      Emergency
                    </Link>
                  </>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-primary-foreground gap-2">
                      <User className="w-4 h-4" />
                      {user?.name}
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem className="gap-2">
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
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-colors font-medium"
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
          <div className="hidden lg:flex items-center gap-2 bg-emergency/90 px-4 py-2 rounded-lg">
            <Phone className="w-4 h-4 text-emergency-foreground animate-pulse" />
            <span className="text-emergency-foreground font-semibold text-sm">
              Emergency: 1033
            </span>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-primary-foreground p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-primary-foreground/20 animate-fade-in">
            <nav className="flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <Link 
                    to={getDashboardLink()} 
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {user?.role === 'traveller' && (
                    <>
                      <Link 
                        to="/route-planner" 
                        className="text-primary-foreground/80 hover:text-primary-foreground transition-colors font-medium py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Route Planner
                      </Link>
                      <Link 
                        to="/emergency" 
                        className="text-primary-foreground/80 hover:text-primary-foreground transition-colors font-medium py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Emergency
                      </Link>
                    </>
                  )}
                  <div className="flex items-center gap-2 py-2 text-primary-foreground/70">
                    <User className="w-4 h-4" />
                    {user?.name}
                  </div>
                  <Button variant="ghost" onClick={handleLogout} className="justify-start text-primary-foreground/80">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
              <div className="flex items-center gap-2 bg-emergency/90 px-4 py-2 rounded-lg mt-2">
                <Phone className="w-4 h-4 text-emergency-foreground animate-pulse" />
                <span className="text-emergency-foreground font-semibold text-sm">
                  Emergency: 1033
                </span>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
