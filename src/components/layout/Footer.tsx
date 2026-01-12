import { Car, Phone, Mail, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="gov-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <Car className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-lg">NHMS</h3>
                <p className="text-xs text-primary-foreground/70">Ministry of Road Transport</p>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/70">
              Ensuring safer highways and efficient travel across the nation.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Route Planner</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Toll Calculator</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Traffic Updates</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Safety Guidelines</a></li>
            </ul>
          </div>

          {/* Emergency */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Emergency</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Highway Helpline: 1033
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Ambulance: 108
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Police: 100
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                support@nhms.gov.in
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Transport Bhawan, New Delhi
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/60">
          <p>© 2024 National Highway Management System. Government of India. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
