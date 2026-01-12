import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Car, Shield, Stethoscope, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { User } from '@/types';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<User['role']>('traveller');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password, role);
      if (success) {
        if (role === 'traffic_police') {
          navigate('/authority/traffic');
        } else if (role === 'emergency_services') {
          navigate('/authority/emergency');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    { value: 'traveller', label: 'Traveller', icon: Car, description: 'Highway users' },
    { value: 'traffic_police', label: 'Traffic Police', icon: Shield, description: 'Law enforcement' },
    { value: 'emergency_services', label: 'Emergency Services', icon: Stethoscope, description: 'Medical/Fire' },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent/20" />
        <div className="relative z-10 flex flex-col justify-center p-12 text-primary-foreground">
          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-8 shadow-glow">
            <Car className="w-8 h-8 text-accent-foreground" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Welcome to NHMS</h1>
          <p className="text-xl text-primary-foreground/80 mb-8">
            National Highway Management System
          </p>
          <ul className="space-y-4 text-primary-foreground/70">
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-accent" />
              Plan your route with real-time updates
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-accent" />
              Calculate toll costs before your journey
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-accent" />
              Access emergency services instantly
            </li>
            <li className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-accent" />
              Stay safe with speed monitoring
            </li>
          </ul>
        </div>
        {/* Decorative Elements */}
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/10 rounded-full -mr-32 -mb-32" />
        <div className="absolute top-20 right-20 w-32 h-32 bg-accent/5 rounded-full" />
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="lg:hidden w-14 h-14 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
              <Car className="w-7 h-7 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Sign in to your account</h2>
            <p className="text-muted-foreground mt-2">Access highway services securely</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Login as</Label>
              <RadioGroup
                value={role}
                onValueChange={(value) => setRole(value as User['role'])}
                className="grid grid-cols-3 gap-3"
              >
                {roleOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <div key={option.value}>
                      <RadioGroupItem
                        value={option.value}
                        id={option.value}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={option.value}
                        className="flex flex-col items-center justify-center p-4 border-2 border-muted rounded-lg cursor-pointer transition-all hover:border-accent peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/5"
                      >
                        <Icon className="w-6 h-6 mb-2 text-muted-foreground peer-data-[state=checked]:text-accent" />
                        <span className="text-xs font-medium text-center">{option.label}</span>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="gov-input"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="gov-input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

            {/* Demo Credentials */}
            <div className="text-center text-sm text-muted-foreground bg-muted p-4 rounded-lg">
              <p className="font-medium mb-1">Demo Credentials</p>
              <p>Email: traveller@nhms.gov / Password: password123</p>
            </div>

            {/* Register Link */}
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-accent font-medium hover:underline">
                Register here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
