-- =============================================
-- NHMS - National Highway Management System
-- Complete Backend Database Schema
-- =============================================

-- 1. User Roles Enum and Table (for authority access)
CREATE TYPE public.user_role AS ENUM ('traveller', 'traffic_authority', 'emergency_authority', 'admin');

-- 2. User Profiles Table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  vehicle_number TEXT,
  vehicle_type TEXT DEFAULT 'car',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 3. User Roles Table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL DEFAULT 'traveller',
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- 4. Routes Table
CREATE TABLE public.routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  source TEXT NOT NULL,
  destination TEXT NOT NULL,
  distance_km DECIMAL(10,2) NOT NULL,
  estimated_time_mins INTEGER NOT NULL,
  traffic_level TEXT DEFAULT 'low' CHECK (traffic_level IN ('low', 'medium', 'high')),
  route_coordinates JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 5. Toll Plazas Table
CREATE TABLE public.toll_plazas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  coordinates JSONB,
  cost_car INTEGER NOT NULL DEFAULT 0,
  cost_motorcycle INTEGER NOT NULL DEFAULT 0,
  cost_truck INTEGER NOT NULL DEFAULT 0,
  cost_bus INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 6. Route Toll Plaza Junction (many-to-many)
CREATE TABLE public.route_toll_plazas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE NOT NULL,
  toll_plaza_id UUID REFERENCES public.toll_plazas(id) ON DELETE CASCADE NOT NULL,
  sequence_order INTEGER NOT NULL DEFAULT 1,
  UNIQUE (route_id, toll_plaza_id)
);

-- 7. Emergency Centers Table
CREATE TABLE public.emergency_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('hospital', 'police', 'ambulance', 'fire')),
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  coordinates JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 8. Route Emergency Centers Junction (many-to-many)
CREATE TABLE public.route_emergency_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE NOT NULL,
  emergency_center_id UUID REFERENCES public.emergency_centers(id) ON DELETE CASCADE NOT NULL,
  distance_km DECIMAL(5,2) NOT NULL DEFAULT 0,
  UNIQUE (route_id, emergency_center_id)
);

-- 9. Traffic Data Table (real-time simulated)
CREATE TABLE public.traffic_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  traffic_level TEXT NOT NULL CHECK (traffic_level IN ('low', 'medium', 'high')),
  delay_minutes INTEGER DEFAULT 0,
  message TEXT,
  alert_type TEXT CHECK (alert_type IN ('congestion', 'accident', 'construction', 'event')),
  severity TEXT DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- 10. Weather Data Table (real-time simulated)
CREATE TABLE public.weather_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('sunny', 'cloudy', 'rainy', 'foggy', 'stormy')),
  temperature INTEGER,
  visibility TEXT CHECK (visibility IN ('good', 'moderate', 'poor')),
  advisory TEXT,
  is_current BOOLEAN DEFAULT true,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 11. Speed Monitoring Logs Table
CREATE TABLE public.speed_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vehicle_number TEXT NOT NULL,
  current_speed INTEGER NOT NULL,
  speed_limit INTEGER NOT NULL,
  road_type TEXT NOT NULL CHECK (road_type IN ('expressway', 'highway', 'city', 'ghat', 'tunnel')),
  location TEXT NOT NULL,
  coordinates JSONB,
  is_overspeeding BOOLEAN DEFAULT false,
  warning_issued BOOLEAN DEFAULT false,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 12. Emergency Alerts Table
CREATE TABLE public.emergency_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_number TEXT NOT NULL,
  driver_name TEXT NOT NULL,
  location TEXT NOT NULL,
  coordinates JSONB,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('overspeeding', 'breakdown', 'accident', 'medical', 'fire')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'responding', 'resolved', 'cancelled')),
  speed_data JSONB,
  warning_count INTEGER DEFAULT 0,
  helpline_notified BOOLEAN DEFAULT false,
  authority_notified BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id)
);

-- 13. Chatbot Messages Table
CREATE TABLE public.chatbot_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 14. User Sessions Table
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =============================================
-- Enable Row Level Security on all tables
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.toll_plazas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_toll_plazas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_emergency_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.traffic_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speed_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Security Definer Function for Role Checking
-- =============================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- =============================================
-- RLS Policies
-- =============================================

-- Profiles: Users can read/update own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Roles: Users can view own roles, authorities can view all
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authorities can view all roles" ON public.user_roles FOR SELECT USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'traffic_authority') OR 
  public.has_role(auth.uid(), 'emergency_authority')
);

-- Routes: Public read access for all authenticated users
CREATE POLICY "Routes are viewable by authenticated users" ON public.routes FOR SELECT TO authenticated USING (true);

-- Toll Plazas: Public read access
CREATE POLICY "Toll plazas are viewable by authenticated users" ON public.toll_plazas FOR SELECT TO authenticated USING (true);

-- Route Toll Plazas: Public read access
CREATE POLICY "Route toll plazas are viewable by authenticated users" ON public.route_toll_plazas FOR SELECT TO authenticated USING (true);

-- Emergency Centers: Public read access
CREATE POLICY "Emergency centers are viewable by authenticated users" ON public.emergency_centers FOR SELECT TO authenticated USING (true);

-- Route Emergency Centers: Public read access
CREATE POLICY "Route emergency centers are viewable by authenticated users" ON public.route_emergency_centers FOR SELECT TO authenticated USING (true);

-- Traffic Data: Public read access
CREATE POLICY "Traffic data is viewable by authenticated users" ON public.traffic_data FOR SELECT TO authenticated USING (true);

-- Weather Data: Public read access
CREATE POLICY "Weather data is viewable by authenticated users" ON public.weather_data FOR SELECT TO authenticated USING (true);

-- Speed Logs: Users can view/insert own logs, authorities can view all
CREATE POLICY "Users can view own speed logs" ON public.speed_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own speed logs" ON public.speed_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authorities can view all speed logs" ON public.speed_logs FOR SELECT USING (
  public.has_role(auth.uid(), 'traffic_authority') OR 
  public.has_role(auth.uid(), 'admin')
);

-- Emergency Alerts: Users can view/insert own, authorities can view/update all
CREATE POLICY "Users can view own emergency alerts" ON public.emergency_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create emergency alerts" ON public.emergency_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authorities can view all emergency alerts" ON public.emergency_alerts FOR SELECT USING (
  public.has_role(auth.uid(), 'traffic_authority') OR 
  public.has_role(auth.uid(), 'emergency_authority') OR 
  public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Authorities can update emergency alerts" ON public.emergency_alerts FOR UPDATE USING (
  public.has_role(auth.uid(), 'traffic_authority') OR 
  public.has_role(auth.uid(), 'emergency_authority') OR 
  public.has_role(auth.uid(), 'admin')
);

-- Chatbot Messages: Users can view/insert own messages
CREATE POLICY "Users can view own chatbot messages" ON public.chatbot_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chatbot messages" ON public.chatbot_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Sessions: Users can manage own sessions
CREATE POLICY "Users can view own sessions" ON public.user_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.user_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON public.user_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON public.user_sessions FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- Triggers and Functions
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_routes_updated_at
  BEFORE UPDATE ON public.routes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );
  
  -- Assign default role as traveller
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'traveller');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.traffic_data;
ALTER PUBLICATION supabase_realtime ADD TABLE public.weather_data;
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.speed_logs;