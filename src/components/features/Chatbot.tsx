import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { ChatMessage } from '@/types';

const CHATBOT_RESPONSES: Record<string, string> = {
  // Greetings
  'hello': 'Hello! Welcome to NHMS Virtual Assistant. How can I help you today? You can ask about routes, tolls, traffic, emergencies, or safety guidelines.',
  'hi': 'Hi there! I\'m your NHMS virtual assistant. How may I assist you with your highway journey today?',
  'hey': 'Hey! Welcome to NHMS. Ask me anything about routes, tolls, or highway safety.',
  'good morning': 'Good morning! I\'m here to help with your travel queries. What would you like to know?',
  'good afternoon': 'Good afternoon! How can I assist you with your highway journey today?',
  'good evening': 'Good evening! I\'m ready to help with route planning, toll info, or any highway queries.',
  
  // Route Planning
  'route': 'To plan a route, go to the Route Planner section from your dashboard. Enter your source, destination, and vehicle type to see available routes with time and cost estimates.',
  'plan': 'You can plan your journey using our Route Planner. It shows multiple routes, estimated time, distance, and toll costs for your trip.',
  'direction': 'For directions, use the Route Planner feature. Enter your starting point and destination to get detailed route options.',
  'how to plan': 'Planning a trip is easy! 1) Go to Route Planner, 2) Enter source and destination, 3) Select vehicle type, 4) Compare routes and choose the best one.',
  
  // Toll Information
  'toll': 'Toll costs vary by route and vehicle type. Our system calculates total toll for your journey. Cars typically pay ₹85-125 per plaza, trucks ₹185-275.',
  'cost': 'Journey costs include toll charges based on your vehicle type. Use our Route Planner to get exact toll estimates for your trip.',
  'price': 'Toll prices depend on the route and vehicle. Two-wheelers have the lowest rates, followed by cars, buses, and trucks.',
  'payment': 'Tolls can be paid via FASTag (electronic), cash, or cards at toll plazas. FASTag is recommended for faster passage.',
  
  // Traffic
  'traffic': 'We provide real-time traffic updates on your dashboard. Current conditions are monitored and displayed with color-coded severity levels.',
  'congestion': 'Traffic congestion alerts are shown in real-time. We recommend checking your dashboard before starting your journey.',
  'jam': 'Traffic jam information is updated continuously. You can view alternate routes if congestion is detected on your path.',
  
  // Weather
  'weather': 'Weather conditions along highways are monitored. Check the Weather widget on your dashboard for current conditions and visibility advisories.',
  'fog': 'During foggy conditions, reduce speed and maintain safe distance. Our system issues visibility alerts when fog is detected on highways.',
  'rain': 'Rainy weather advisories are displayed on your dashboard. We recommend reducing speed and being extra cautious on wet roads.',
  
  // Emergency
  'emergency': 'For emergencies, dial 1033 (Highway Helpline) or 108 (Ambulance). Our system shows nearby hospitals and emergency centers on your route.',
  'hospital': 'Nearby hospitals are displayed in the Emergency section. You can view contact numbers and distance from your current location.',
  'accident': 'In case of accident: 1) Move to safety if possible, 2) Call 1033 or 108, 3) Check our First Aid section for immediate guidance.',
  'help': 'Need help? For emergencies call 1033. For route planning, toll info, or other queries, I\'m here to assist!',
  'ambulance': 'Dial 108 for ambulance services. Our system shows the nearest ambulance stations along your route.',
  'police': 'Highway Police can be reached at 100. Traffic Police stations are marked on your route map in the Emergency section.',
  
  // Safety
  'speed': 'Speed limits vary: Expressways (100 km/h), Highways (80 km/h), Ghat sections (40 km/h). Our system monitors compliance for your safety.',
  'speed limit': 'Speed limits are: Expressway - 100 km/h, Regular Highway - 80 km/h, Ghat/Hilly areas - 40 km/h, Tunnels - 60 km/h.',
  'safe': 'Safety tips: 1) Follow speed limits, 2) Use seatbelts, 3) Don\'t use phone while driving, 4) Take breaks every 2 hours, 5) Keep emergency numbers handy.',
  'first aid': 'First aid instructions are available in the Emergency section. It covers bleeding control, CPR, fracture management, and shock treatment.',
  
  // General
  'thank': 'You\'re welcome! Drive safely and have a pleasant journey. Feel free to ask if you need anything else.',
  'thanks': 'Happy to help! Wishing you a safe journey. Let me know if you have more questions.',
  'bye': 'Goodbye! Have a safe journey. Remember, dial 1033 for any highway assistance.',
  'features': 'NHMS features include: Route Planning, Toll Calculator, Real-time Traffic Updates, Emergency Assistance, Speed Monitoring, and this Virtual Assistant.',
};

const DEFAULT_RESPONSE = "I'm not sure I understand. You can ask me about:\n• Route planning\n• Toll costs\n• Traffic conditions\n• Weather updates\n• Emergency assistance\n• Safety guidelines\n\nOr dial 1033 for direct highway helpline support.";

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('nhms_chat_history');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    }
    return [
      {
        id: '1',
        role: 'assistant',
        content: 'Hello! I\'m your NHMS Virtual Assistant. How can I help you today? Ask me about routes, tolls, traffic, or emergencies.',
        timestamp: new Date(),
      },
    ];
  });
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('nhms_chat_history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const findResponse = useCallback((userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    for (const [keyword, response] of Object.entries(CHATBOT_RESPONSES)) {
      if (lowerMessage.includes(keyword)) {
        return response;
      }
    }
    
    return DEFAULT_RESPONSE;
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: findResponse(input),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botResponse]);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-accent text-accent-foreground rounded-full shadow-lg hover:shadow-glow transition-all duration-300 flex items-center justify-center z-50 animate-bounce-subtle"
        aria-label="Open chat assistant"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div 
      className={`fixed bottom-6 right-6 bg-card rounded-2xl shadow-2xl border border-border z-50 transition-all duration-300 ${
        isMinimized ? 'w-80 h-14' : 'w-80 sm:w-96 h-[500px]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-primary rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
            <Bot className="w-4 h-4 text-accent-foreground" />
          </div>
          <div>
            <h3 className="text-primary-foreground font-semibold text-sm">NHMS Assistant</h3>
            <p className="text-primary-foreground/70 text-xs">Online</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="h-[380px] p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                      message.role === 'user'
                        ? 'bg-accent text-accent-foreground rounded-br-none'
                        : 'bg-muted text-foreground rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <span className="text-[10px] opacity-60 mt-1 block">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-secondary-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-3 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 text-sm"
              />
              <Button onClick={handleSend} size="icon" variant="accent">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
