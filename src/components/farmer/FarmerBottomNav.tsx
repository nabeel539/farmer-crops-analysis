'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  Sprout,
  CreditCard,
  Droplets,
  BookOpen,
  Camera
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';

interface FarmerBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function FarmerBottomNav({ activeTab, setActiveTab }: FarmerBottomNavProps) {
  const alerts = useAppSelector((state) => state.alerts.alerts);
  const unreadAlerts = alerts.filter((a) => !a.resolved);

  const navItems = [
    {
      id: 'CROP_STATUS',
      title: 'My Crop',
      icon: Sprout
    },
    {
      id: 'PASSBOOK',
      title: 'Passbook',
      icon: CreditCard
    },
    {
      id: 'OPERATIONS',
      title: 'Operations',
      icon: Droplets
    },
    {
      id: 'DOCTOR',
      title: 'Doctor',
      icon: Camera
    },
    {
      id: 'ADVISORIES',
      title: 'Advisories',
      icon: BookOpen,
      badge: unreadAlerts.length > 0 ? `${unreadAlerts.length}` : undefined
    }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border/80 px-2 py-1.5 shadow-lg safe-area-inset-bottom">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer relative',
                isActive
                  ? 'text-emerald-600 font-bold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className={cn(
                'relative p-1 rounded-lg transition-colors',
                isActive && 'bg-emerald-500/10'
              )}>
                <Icon className="h-5 w-5" />
                {item.badge && (
                  <span className="absolute -top-1 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{item.title}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
