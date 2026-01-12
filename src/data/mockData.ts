import { Route, EmergencyCenter, TollPlaza, TrafficAlert, WeatherData, EmergencyAlert } from '@/types';

export const tollPlazas: TollPlaza[] = [
  {
    id: 'tp1',
    name: 'Mumbai Entry Toll',
    location: 'NH48 KM 15',
    cost: { car: 85, motorcycle: 40, truck: 185, bus: 145 },
  },
  {
    id: 'tp2',
    name: 'Pune Expressway Toll',
    location: 'NH48 KM 95',
    cost: { car: 125, motorcycle: 60, truck: 275, bus: 225 },
  },
  {
    id: 'tp3',
    name: 'Lonavala Toll Plaza',
    location: 'NH48 KM 65',
    cost: { car: 55, motorcycle: 25, truck: 115, bus: 95 },
  },
  {
    id: 'tp4',
    name: 'Khandala Point Toll',
    location: 'Alternate Route KM 45',
    cost: { car: 45, motorcycle: 20, truck: 95, bus: 75 },
  },
];

export const emergencyCenters: EmergencyCenter[] = [
  {
    id: 'ec1',
    name: 'Apollo Hospital - Navi Mumbai',
    type: 'hospital',
    distance: 2.5,
    phone: '022-2768-1000',
    address: 'Plot 13, Sector 23, Navi Mumbai',
  },
  {
    id: 'ec2',
    name: 'Highway Patrol Station - Khopoli',
    type: 'police',
    distance: 1.2,
    phone: '02192-262-100',
    address: 'Mumbai-Pune Expressway, Khopoli',
  },
  {
    id: 'ec3',
    name: '108 Ambulance Service',
    type: 'ambulance',
    distance: 0.5,
    phone: '108',
    address: 'On-call Emergency Service',
  },
  {
    id: 'ec4',
    name: 'Lonavala Civil Hospital',
    type: 'hospital',
    distance: 3.8,
    phone: '02114-273-456',
    address: 'Old Mumbai Road, Lonavala',
  },
  {
    id: 'ec5',
    name: 'Pune Traffic Police HQ',
    type: 'police',
    distance: 5.2,
    phone: '020-2612-3456',
    address: 'Shivajinagar, Pune',
  },
  {
    id: 'ec6',
    name: 'Fire Station - Expressway',
    type: 'fire',
    distance: 4.1,
    phone: '101',
    address: 'Near Kamshet Exit, Expressway',
  },
];

export const mockRoutes: Route[] = [
  {
    id: 'route1',
    name: 'Mumbai-Pune Expressway (Fastest)',
    distance: 94,
    estimatedTime: 95,
    tollCost: 265,
    trafficLevel: 'low',
    tollPlazas: [tollPlazas[0], tollPlazas[1]],
    emergencyCenters: [emergencyCenters[0], emergencyCenters[2], emergencyCenters[3]],
  },
  {
    id: 'route2',
    name: 'Old Mumbai-Pune Highway (Scenic)',
    distance: 150,
    estimatedTime: 180,
    tollCost: 100,
    trafficLevel: 'medium',
    tollPlazas: [tollPlazas[2], tollPlazas[3]],
    emergencyCenters: [emergencyCenters[1], emergencyCenters[3], emergencyCenters[5]],
  },
  {
    id: 'route3',
    name: 'NH48 via Lonavala (Balanced)',
    distance: 118,
    estimatedTime: 135,
    tollCost: 180,
    trafficLevel: 'medium',
    tollPlazas: [tollPlazas[0], tollPlazas[2]],
    emergencyCenters: [emergencyCenters[0], emergencyCenters[1], emergencyCenters[4]],
  },
];

export const mockTrafficAlerts: TrafficAlert[] = [
  {
    id: 'ta1',
    type: 'congestion',
    severity: 'medium',
    location: 'Near Khopoli Exit',
    message: 'Moderate traffic congestion expected. Delay: 15-20 minutes.',
    timestamp: new Date(),
  },
  {
    id: 'ta2',
    type: 'construction',
    severity: 'low',
    location: 'KM 45-48 Expressway',
    message: 'Lane closure for maintenance. Single lane operation.',
    timestamp: new Date(),
  },
  {
    id: 'ta3',
    type: 'weather',
    severity: 'high',
    location: 'Khandala Ghat Section',
    message: 'Heavy fog reported. Visibility below 100m. Drive cautiously.',
    timestamp: new Date(),
  },
];

export const mockWeatherData: WeatherData = {
  condition: 'cloudy',
  temperature: 28,
  visibility: 'good',
  advisory: 'Mild weather conditions. Safe for travel.',
};

export const mockEmergencyAlerts: EmergencyAlert[] = [
  {
    id: 'ea1',
    vehicleNumber: 'MH-12-CD-5678',
    driverName: 'Amit Patel',
    location: 'KM 67, Mumbai-Pune Expressway',
    type: 'overspeeding',
    timestamp: new Date(Date.now() - 5 * 60000),
    status: 'active',
    speedData: {
      currentSpeed: 142,
      speedLimit: 100,
      isOverspeeding: true,
      warningCount: 3,
      location: 'KM 67, Mumbai-Pune Expressway',
    },
  },
  {
    id: 'ea2',
    vehicleNumber: 'MH-01-EF-9012',
    driverName: 'Sneha Reddy',
    location: 'Near Lonavala Tunnel',
    type: 'breakdown',
    timestamp: new Date(Date.now() - 15 * 60000),
    status: 'responding',
  },
  {
    id: 'ea3',
    vehicleNumber: 'MH-04-GH-3456',
    driverName: 'Vikram Singh',
    location: 'Khopoli Junction',
    type: 'medical',
    timestamp: new Date(Date.now() - 25 * 60000),
    status: 'active',
  },
];

export const speedLimits: Record<string, number> = {
  'expressway': 100,
  'highway': 80,
  'city': 50,
  'ghat': 40,
  'tunnel': 60,
};

export const firstAidInstructions = [
  {
    id: 'fa1',
    title: 'Bleeding Control',
    steps: [
      'Apply direct pressure to the wound using a clean cloth',
      'Keep the injured area elevated above heart level if possible',
      'Do not remove any embedded objects',
      'Apply additional layers if blood soaks through',
      'Seek immediate medical attention for severe bleeding',
    ],
  },
  {
    id: 'fa2',
    title: 'CPR (Cardiopulmonary Resuscitation)',
    steps: [
      'Check if the person is responsive - tap and shout',
      'Call emergency services (108) immediately',
      'Place heel of hand on center of chest',
      'Push hard and fast - 100-120 compressions per minute',
      'Allow chest to fully rise between compressions',
      'Continue until help arrives or person recovers',
    ],
  },
  {
    id: 'fa3',
    title: 'Fracture Management',
    steps: [
      'Do not move the person unless absolutely necessary',
      'Immobilize the injured area using available materials',
      'Apply ice wrapped in cloth to reduce swelling',
      'Do not try to realign the bone',
      'Keep the person calm and still',
      'Wait for medical professionals to arrive',
    ],
  },
  {
    id: 'fa4',
    title: 'Shock Treatment',
    steps: [
      'Lay the person down with legs elevated (if no spinal injury suspected)',
      'Keep them warm with blankets or clothing',
      'Do not give food or water',
      'Loosen tight clothing',
      'Monitor breathing and consciousness',
      'Reassure and keep them calm until help arrives',
    ],
  },
];
