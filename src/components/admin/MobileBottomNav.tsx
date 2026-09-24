'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Map,
  Sprout,
  Bell,
  Wheat
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';

export function MobileBottomNav() {
  const pathname = usePathname();
  const alerts = useAppSelector((state) => state.alerts.alerts);
  const unreadAlerts = alerts.filter((a) => !a.resolved);

  const navItems = [
    {
      title: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard
    },
    {
      title: 'Farmers',
      href: '/admin/farmers',
      icon: Users
    },
    {
      title: 'GIS Map',
      href: '/admin/map',
      icon: Map
    },
    {
      title: 'Crops',
      href: '/admin/crop-cycles',
      icon: Sprout
    },
    {
      title: 'Alerts',
      href: '/admin/alerts',
      icon: Bell,
      badge: unreadAlerts.length > 0 ? unreadAlerts.length : undefined
    }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border/80 px-2 py-1.5 shadow-lg safe-area-inset-bottom">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative',
                isActive
                  ? 'text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className={cn(
                'relative p-1 rounded-lg transition-colors',
                isActive && 'bg-primary/10'
              )}>
                <Icon className="h-5 w-5" />
                {item.badge && (
                  <span className="absolute -top-1 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
