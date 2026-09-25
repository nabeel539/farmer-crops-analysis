'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Sprout,
  CreditCard,
  Droplets,
  BookOpen,
  CloudSun,
  Camera,
  ChevronLeft,
  ChevronRight,
  Wheat,
  ShieldCheck,
  MapPin,
  HelpCircle,
  TrendingUp,
  Radio
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleSidebar } from '@/store/slices/uiSlice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FarmerNavItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface FarmerNavSection {
  title: string;
  items: FarmerNavItem[];
}

interface FarmerSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function FarmerSidebar({ activeTab, setActiveTab }: FarmerSidebarProps) {
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const alerts = useAppSelector((state) => state.alerts.alerts);
  const unreadAlerts = alerts.filter((a) => !a.resolved);

  const NAV_SECTIONS: FarmerNavSection[] = [
    {
      title: 'Farm Overview',
      items: [
        { id: 'CROP_STATUS', title: 'My Wheat Crop', subtitle: 'Live Crop & Phenology', icon: Sprout },
        { id: 'PARCELS', title: 'Land Parcels & GPS', subtitle: 'Field Boundaries', icon: MapPin }
      ]
    },
    {
      title: 'Field Operations',
      items: [
        { id: 'OPERATIONS', title: 'Field Operations Log', subtitle: 'Irrigation & Fertilizers', icon: Droplets },
        { id: 'DOCTOR', title: 'Crop Doctor & AI', subtitle: 'Leaf Disease Diagnosis', icon: Camera, badge: 'AI Scan' }
      ]
    },
    {
      title: 'Advisories & Market',
      items: [
        { id: 'ADVISORIES', title: 'Farm Advisories', subtitle: 'Expert Agronomy Tips', icon: BookOpen, badge: unreadAlerts.length > 0 ? `${unreadAlerts.length}` : undefined },
        { id: 'WEATHER_MANDI', title: 'Weather & Mandi Rates', subtitle: 'Forecast & Grain Prices', icon: CloudSun }
      ]
    }
  ];

  return (
    <TooltipProvider delay={100}>
      <aside
        className={cn(
          'hidden md:flex flex-col border-r border-border/70 bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out sticky top-0 h-screen shrink-0 z-30 select-none shadow-xs',
          sidebarOpen ? 'w-64' : 'w-[70px]'
        )}
      >
        {/* Brand Header */}
        <div className={cn(
          'h-16 flex items-center border-b border-border/60 shrink-0 px-3 transition-all',
          sidebarOpen ? 'justify-between' : 'justify-center'
        )}>
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-md bg-emerald-600 flex items-center justify-center text-white font-bold shrink-0 shadow-sm ring-1 ring-emerald-500/30">
                  <Wheat className="h-5 w-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-sm tracking-tight text-foreground truncate">
                    Farmer Portal
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono uppercase tracking-wider font-semibold truncate">
                    Wheat Management
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => dispatch(toggleSidebar())}
                className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-md shrink-0 cursor-pointer"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Tooltip>
              <TooltipTrigger render={
                <button
                  onClick={() => dispatch(toggleSidebar())}
                  className="group relative w-10 h-10 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center font-bold transition-all shadow-sm cursor-pointer"
                  title="Click to Expand Sidebar"
                >
                  <Wheat className="h-5 w-5 group-hover:scale-90 transition-transform" />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-card text-emerald-600 border border-border/80 rounded-full flex items-center justify-center shadow-xs">
                    <ChevronRight className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                </button>
              } />
              <TooltipContent side="right" className="font-semibold text-xs py-1.5 px-3 bg-foreground text-background">
                Expand Farmer Menu →
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-thin">
          {NAV_SECTIONS.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {sidebarOpen ? (
                <h4 className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider px-2.5 py-1 select-none">
                  {section.title}
                </h4>
              ) : (
                <div className="w-6 h-px bg-border/60 mx-auto my-1.5" />
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;

                  if (!sidebarOpen) {
                    return (
                      <Tooltip key={item.id}>
                        <TooltipTrigger render={
                          <button
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                              'relative flex items-center justify-center h-10 w-10 mx-auto rounded-md transition-all duration-150 cursor-pointer',
                              isActive
                                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                                : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                            )}
                          >
                            <Icon className="h-4.5 w-4.5" />
                            {item.badge && (
                              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-background" />
                            )}
                          </button>
                        } />
                        <TooltipContent side="right" className="font-semibold text-xs py-1 px-2.5">
                          <div>{item.title}</div>
                          <div className="text-[10px] text-muted-foreground">{item.subtitle}</div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={cn(
                        'w-full flex items-center justify-between px-2.5 py-2.5 rounded-md text-xs font-medium transition-all duration-150 group cursor-pointer text-left',
                        isActive
                          ? 'bg-emerald-600/10 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-600/30 shadow-2xs'
                          : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={cn('h-4 w-4 shrink-0 transition-colors', isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground group-hover:text-foreground')} />
                        <div className="flex flex-col min-w-0">
                          <span className="truncate leading-tight">{item.title}</span>
                          <span className="text-[10px] text-muted-foreground leading-none pt-0.5 truncate">
                            {item.subtitle}
                          </span>
                        </div>
                      </div>
                      {item.badge && (
                        <Badge
                          variant={isActive ? 'default' : 'secondary'}
                          className={cn(
                            'text-[10px] px-1.5 py-0 h-4 font-mono font-semibold rounded-md shrink-0',
                            isActive ? 'bg-emerald-600 text-white' : ''
                          )}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Farmer ID & Helpline */}
        <div className="p-2.5 border-t border-border/60 shrink-0 space-y-2">
          {sidebarOpen ? (
            <div className="p-2.5 rounded-md bg-card border border-border/60 space-y-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-md bg-emerald-500/15 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold truncate text-foreground">Verified Grower</span>
                  <span className="text-[10px] text-muted-foreground font-mono truncate">Passbook: PB-2026-001</span>
                </div>
              </div>
              <div className="pt-1.5 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Toll-Free Helpline:</span>
                <span className="font-bold text-emerald-600 font-mono">0800-15000</span>
              </div>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger render={
                <div className="w-10 h-10 mx-auto rounded-md bg-card border border-border/60 flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
              } />
              <TooltipContent side="right" className="font-semibold text-xs py-1 px-2.5">
                Verified Grower (PB-2026-001)
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
