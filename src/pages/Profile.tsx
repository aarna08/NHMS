import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Car, Phone, Mail, Shield, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    vehicleNumber: user?.vehicleNumber || '',
  });

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleSave = () => {
    // In a real app, this would save to the database
    toast.success('Profile updated successfully!');
    setIsEditing(false);
  };

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case 'admin':
        return 'bg-primary text-primary-foreground';
      case 'traveller':
        return 'bg-accent text-accent-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Layout>
      <div className="gov-container py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
          <p className="text-muted-foreground">
            View and manage your account information
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <User className="w-12 h-12 text-primary" />
              </div>
              <CardTitle>{user?.name}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mt-2 ${getRoleBadgeColor()}`}>
                <Shield className="w-3 h-3" />
                {user?.role?.charAt(0).toUpperCase()}{user?.role?.slice(1)}
              </div>
            </CardHeader>
            <CardContent>
              {user?.vehicleNumber && (
                <div className="flex items-center justify-center gap-2 p-3 bg-muted rounded-lg">
                  <Car className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">{user.vehicleNumber}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Account Details</CardTitle>
                  <CardDescription>Your personal information</CardDescription>
                </div>
                <Button 
                  variant={isEditing ? "outline" : "default"}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  ) : (
                    <p className="text-foreground font-medium py-2">{user?.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  ) : (
                    <p className="text-foreground font-medium py-2">{user?.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  ) : (
                    <p className="text-foreground font-medium py-2">{formData.phone || 'Not provided'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicle" className="flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    Vehicle Number
                  </Label>
                  {isEditing ? (
                    <Input
                      id="vehicle"
                      value={formData.vehicleNumber}
                      onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                    />
                  ) : (
                    <p className="text-foreground font-medium py-2">{user?.vehicleNumber || 'Not provided'}</p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={handleSave} className="gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
