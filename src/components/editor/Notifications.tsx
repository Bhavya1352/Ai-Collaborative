import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  User,
  GitPullRequest,
  Rocket,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { notifications } from '@/lib/data';

export function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAsRead = (id: string) => {
    
    console.log('Mark as read:', id);
  };

  const markAllAsRead = () => {
    
    console.log('Mark all as read');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'mention':
        return User;
      case 'review':
        return GitPullRequest;
      case 'deploy':
        return Rocket;
      case 'invite':
        return UserPlus;
      default:
        return Bell;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'mention':
        return 'text-sky-400';
      case 'review':
        return 'text-violet-400';
      case 'deploy':
        return 'text-emerald-400';
      case 'invite':
        return 'text-amber-400';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg relative hover:bg-white/5"
        >
          <Bell className="h-4 w-4 text-muted-foreground" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[9px] bg-primary">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[380px] bg-background-soft/30 border-l border-white/5">
        <SheetHeader className="border-b border-white/5 pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base">Notifications</SheetTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={markAllAsRead}
              >
                Mark all read
              </Button>
            </div>
          </div>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-120px)] thin-scrollbar">
          <div className="space-y-1 p-2">
            {notifications.map((notification, i) => {
              const Icon = getIcon(notification.type);
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`p-3 rounded-lg transition-colors cursor-pointer ${
                    notification.unread
                      ? 'bg-primary/5 border border-primary/20'
                      : 'hover:bg-white/5'
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`h-8 w-8 rounded-lg bg-background border border-white/5 flex items-center justify-center shrink-0 ${getIconColor(
                        notification.type
                      )}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-tight">
                          {notification.title}
                        </p>
                        {notification.unread && (
                          <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.body}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-2">
                        {notification.time} ago
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
