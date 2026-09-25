'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Package,
  MapPin,
  Sprout,
  CalendarCheck,
  Wheat,
  Factory,
  Bell,
  LineChart,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Map,
  Compass
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleSidebar } from '@/store/slices/uiSlice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { title: 'Dashboard', href: '/admin', icon: LayoutDashboard }
    ]
  },
  {
    title: 'Farmer & Land',
    items: [
      { title: 'Farmers', href: '/admin/farmers', icon: Users },
      { title: 'Land Parcels', href: '/admin/land-parcels', icon: MapPin }
    ]
  },
  {
    title: 'Supplies & Stock',
    items: [
      { title: 'Vendors', href: '/admin/vendors', icon: Factory },
      { title: 'Seed Inventory', href: '/admin/seed-distribution', icon: Package }
    ]
  },
  {
    title: 'Operations',
    items: [
      { title: 'Crop Cycles', href: '/admin/crop-cycles', icon: Sprout },
      { title: 'Activities', href: '/admin/activities', icon: CalendarCheck },
      { title: 'Harvest', href: '/admin/harvest', icon: Wheat }
    ]
  },
  {
    title: 'Management',
    items: [
      { title: 'Reports', href: '/admin/reports', icon: FileText },
      { title: 'Settings', href: '/admin/settings', icon: Settings }
    ]
  }
];


export function AdminSidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);

  return (
    <TooltipProvider delay={100}>
      <aside
        className={cn(
          'hidden md:flex flex-col border-r border-border/70 bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out sticky top-0 h-screen shrink-0 z-30 select-none shadow-xs',
          sidebarOpen ? 'w-52' : 'w-16'
        )}
      >
        {/* Brand Header */}
        <div className={cn(
          'h-14 flex items-center border-b border-border/60 shrink-0 px-2.5 transition-all',
          sidebarOpen ? 'justify-between' : 'justify-center'
        )}>
          {sidebarOpen ? (
            <>
              <Link href="/admin" prefetch={false} className="flex items-center gap-2.5 min-w-0 hover:opacity-90 transition-opacity">
                <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0 shadow-sm ring-1 ring-primary/20">
                  <Wheat className="h-5 w-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-sm tracking-tight text-foreground truncate">
                    Krishi AgriTech
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono truncate">
                    Wheat Platform
                  </span>
                </div>
              </Link>
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
                  className="group relative w-10 h-10 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center font-bold transition-all shadow-sm cursor-pointer"
                  title="Click to Expand Sidebar"
                >
                  <Wheat className="h-5 w-5 group-hover:scale-90 transition-transform" />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-card text-primary border border-border/80 rounded-full flex items-center justify-center shadow-xs">
                    <ChevronRight className="h-2.5 w-2.5 stroke-[3]" />
                  </span>
                </button>
              } />
              <TooltipContent side="right" className="font-semibold text-xs py-1.5 px-3 bg-foreground text-background">
                Click to Expand Menu (Sidebar) →
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-thin">
          {NAV_SECTIONS.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {sidebarOpen ? (
                <h4 className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-wider px-2 py-0.5 select-none">
                  {section.title}
                </h4>
              ) : (
                <div className="w-6 h-px bg-border/60 mx-auto my-1" />
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                  const Icon = item.icon;

                  if (!sidebarOpen) {
                    return (
                      <Tooltip key={item.href}>
                        <TooltipTrigger render={
                          <Link
                            href={item.href}
                            prefetch={false}
                            className={cn(
                              'relative flex items-center justify-center h-9 w-9 mx-auto rounded-md transition-all duration-150',
                              isActive
                                ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                                : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            {item.badge && (
                              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-background" />
                            )}
                          </Link>
                        } />
                        <TooltipContent side="right" className="font-semibold text-xs py-1 px-2.5">
                          {item.title}
                          {item.badge && <span className="ml-1.5 text-muted-foreground">({item.badge})</span>}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={false}
                      className={cn(
                        'flex items-center justify-between px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-150 group',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-bold shadow-2xs border border-border/50'
                          : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground'
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon className={cn('h-3.5 w-3.5 shrink-0 transition-colors', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
                        <span className="truncate">{item.title}</span>
                      </div>
                      {item.badge && (
                        <Badge
                          variant={isActive ? 'default' : 'secondary'}
                          className="text-[10px] px-1.5 py-0 h-4 font-mono font-semibold rounded-md shrink-0"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Profile / Status */}
        <div className="p-2 border-t border-border/60 shrink-0">
          {sidebarOpen ? (
            <div className="flex items-center justify-between p-2 rounded-md bg-card border border-border/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-md bg-emerald-500/15 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold truncate text-foreground">Verified System</span>
                  <span className="text-[10px] text-muted-foreground truncate">Punjab Agri Portal</span>
                </div>
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
                Verified Punjab Agri Portal
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
