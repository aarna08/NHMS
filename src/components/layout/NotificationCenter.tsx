import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Info, AlertTriangle, AlertCircle, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { API_URL } from '@/lib/api-config';

interface Broadcast {
  _id: string;
  message: string;
  type: string;
  timestamp: number;
  date: string;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Broadcast[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [lastChecked, setLastChecked] = useState<number>(() => {
    const saved = localStorage.getItem('nhms_notifications_last_checked');
    return saved ? parseInt(saved, 10) : Date.now();
  });

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/broadcasts`);
      if (response.data.success) {
        const data = response.data.broadcasts;
        setNotifications(data);
        
        // Calculate unread count based on timestamp
        const unread = data.filter((n: Broadcast) => n.timestamp > lastChecked).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [lastChecked]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Mark all as read when opening
      const now = Date.now();
      setLastChecked(now);
      setUnreadCount(0);
      localStorage.setItem('nhms_notifications_last_checked', now.toString());
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      default:
        return <Info className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-muted/50 transition-colors"
          aria-label="Notifications"
        >
          <Bell className={cn("w-5 h-5", unreadCount > 0 && "animate-tada")} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white shadow-sm animate-in fade-in zoom-in">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden shadow-2xl border-border/40 backdrop-blur-xl bg-background/95">
        <div className="flex items-center justify-between p-4 border-b border-border/40 bg-muted/30">
          <DropdownMenuLabel className="p-0 font-bold text-base flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase tracking-wider">
                New
              </span>
            )}
          </DropdownMenuLabel>
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                clearNotifications();
              }}
              className="h-8 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all font-medium text-xs gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Clear all
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[350px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[350px] p-8 text-center animate-in fade-in duration-500">
              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-4 text-muted-foreground/40">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-foreground/80">No recent notifications</p>
              <p className="text-xs text-muted-foreground mt-1">
                When admins broadcast messages, they'll appear here.
              </p>
            </div>
          ) : (
            <div className="py-1">
              {notifications.map((notification, index) => (
                <React.Fragment key={notification._id}>
                  <DropdownMenuItem 
                    className={cn(
                      "flex flex-col items-start gap-1 p-4 cursor-default focus:bg-muted/50 transition-colors",
                      notification.timestamp > lastChecked && "bg-primary/5 border-l-2 border-primary"
                    )}
                  >
                    <div className="flex items-center justify-between w-full gap-2">
                      <div className="flex items-center gap-2">
                        {getIcon(notification.type)}
                        <span className="text-xs font-bold uppercase tracking-widest text-foreground/60">
                          {notification.type}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed font-medium mt-1">
                      {notification.message}
                    </p>
                    <span className="text-[10px] text-muted-foreground/60 mt-1">
                      {notification.date}
                    </span>
                  </DropdownMenuItem>
                  {index < notifications.length - 1 && (
                    <DropdownMenuSeparator className="bg-border/20 mx-2" />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 0 && (
          <div className="p-2 border-t border-border/40 bg-muted/20">
            <Button variant="ghost" className="w-full h-8 text-xs font-medium text-muted-foreground hover:text-primary transition-colors cursor-default pointer-events-none">
              End of notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
