'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Button } from '@/components/ui/button';
import { RoleSwitcherBar } from '@/components/shared/RoleSwitcherBar';
import {
  Bell,
  Menu,
  Wheat,
  Plus,
  ExternalLink,
  PanelLeft
} from 'lucide-react';
import { toggleSidebar } from '@/store/slices/uiSlice';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { MOCK_ALERTS } from '@/data/mockData';

interface AdminHeaderProps {
  onQuickAction?: () => void;
}

export function AdminHeader({ onQuickAction }: AdminHeaderProps) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { currentUser, sidebarOpen } = useAppSelector((state) => state.ui);
  const alerts = useAppSelector((state) => state.alerts.alerts);
  const unreadAlerts = alerts.filter((a) => !a.resolved);

  return (
    <header className="h-16 border-b border-border/80 bg-card/60 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left side: Mobile Menu / Desktop Toggle + Breadcrumbs Title */}
      <div className="flex items-center gap-3">
        {/* Desktop Sidebar Toggle Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => dispatch(toggleSidebar())}
          className="hidden md:flex items-center gap-1.5 h-8 px-2.5 text-xs font-semibold text-foreground bg-card hover:bg-accent border-border/80 shadow-2xs rounded-lg cursor-pointer transition-all"
          title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          <PanelLeft className="h-4 w-4 text-primary" />
          <span className="text-[11px] hidden xl:inline">{sidebarOpen ? 'Collapse Menu' : 'Expand Menu'}</span>
        </Button>

        {/* Mobile Navigation Sheet */}
        <Sheet>
          <SheetTrigger render={
            <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 text-foreground">
              <Menu className="h-5 w-5" />
            </Button>
          } />
          <SheetContent side="left" className="w-80 p-0 flex flex-col bg-sidebar text-sidebar-foreground">
            <div className="h-16 flex items-center gap-3 px-5 border-b border-border/70">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-sm">
                <Wheat className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-foreground">Krishi AgriTech</span>
                <span className="text-[10px] text-muted-foreground uppercase font-mono">Wheat Platform</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-medium scrollbar-thin">
              {/* Overview */}
              <div>
                <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider px-2 block mb-1">Overview</span>
                <div className="space-y-0.5">
                  <Link href="/admin" className={cn('flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors', pathname === '/admin' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground')}>
                    <span className="text-sm">📊</span> Dashboard
                  </Link>
                </div>
              </div>

              {/* Seed & Land Base */}
              <div>
                <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider px-2 block mb-1">Seed & Land Base</span>
                <div className="space-y-0.5">
                  <Link href="/admin/farmers" className={cn('flex items-center justify-between px-3 py-2 rounded-xl transition-colors', pathname === '/admin/farmers' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground')}>
                    <span className="flex items-center gap-2.5"><span className="text-sm">👥</span> Farmers Enrolled</span>
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5">12</Badge>
                  </Link>
                  <Link href="/admin/seed-distribution" className={cn('flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors', pathname === '/admin/seed-distribution' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground')}>
                    <span className="text-sm">📦</span> Seed Distribution
                  </Link>
                  <Link href="/admin/land-parcels" className={cn('flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors', pathname === '/admin/land-parcels' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground')}>
                    <span className="text-sm">📍</span> Land Parcels & GPS
                  </Link>
                  <Link href="/admin/map" className={cn('flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors', pathname === '/admin/map' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground')}>
                    <span className="text-sm">🗺️</span> GIS Field Map
                  </Link>
                </div>
              </div>

              {/* Crop Operations */}
              <div>
                <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider px-2 block mb-1">Crop Operations</span>
                <div className="space-y-0.5">
                  <Link href="/admin/crop-cycles" className={cn('flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors', pathname === '/admin/crop-cycles' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground')}>
                    <span className="text-sm">🌱</span> Wheat Crop Cycles
                  </Link>
                  <Link href="/admin/activities" className={cn('flex items-center justify-between px-3 py-2 rounded-xl transition-colors', pathname === '/admin/activities' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground')}>
                    <span className="flex items-center gap-2.5"><span className="text-sm">📅</span> Field Activities</span>
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5">12</Badge>
                  </Link>
                </div>
              </div>

              {/* Harvest & Processing */}
              <div>
                <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider px-2 block mb-1">Harvest & Processing</span>
                <div className="space-y-0.5">
                  <Link href="/admin/harvest" className={cn('flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors', pathname === '/admin/harvest' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground')}>
                    <span className="text-sm">🌾</span> Harvest Records
                  </Link>
                  <Link href="/admin/production" className={cn('flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors', pathname === '/admin/production' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground')}>
                    <span className="text-sm">🏭</span> Flour Milling & Silos
                  </Link>
                </div>
              </div>

              {/* Intelligence & Settings */}
              <div>
                <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider px-2 block mb-1">Intelligence</span>
                <div className="space-y-0.5">
                  <Link href="/admin/alerts" className={cn('flex items-center justify-between px-3 py-2 rounded-xl transition-colors', pathname === '/admin/alerts' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground')}>
                    <span className="flex items-center gap-2.5"><span className="text-sm">🔔</span> Agri Alerts</span>
                    <Badge variant="destructive" className="text-[10px] h-4 px-1.5">4</Badge>
                  </Link>
                  <Link href="/admin/analytics" className={cn('flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors', pathname === '/admin/analytics' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground')}>
                    <span className="text-sm">📈</span> Analytics & Yield
                  </Link>
                  <Link href="/admin/reports" className={cn('flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors', pathname === '/admin/reports' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground')}>
                    <span className="text-sm">📄</span> Official Reports
                  </Link>
                  <Link href="/admin/settings" className={cn('flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors', pathname === '/admin/settings' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground')}>
                    <span className="text-sm">⚙️</span> Settings & Policy
                  </Link>
                </div>
              </div>

              {/* Portals Switch Section */}
              <div className="pt-2 border-t border-border/60 space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider px-2 block">Other Portals</span>
                <Link href="/field-officer" className="flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold">
                  <span>Field Officer Mobile App</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
                <Link href="/farmer" className="flex items-center justify-between px-3 py-2 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-300 font-semibold">
                  <span>Farmer Passbook App</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Quick Portal Switch Links */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs">
          <Link 
            href="/field-officer" 
            className="flex items-center gap-1 px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            <span>Field Officer</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </Link>
          <span className="text-border">|</span>
          <Link 
            href="/farmer" 
            className="flex items-center gap-1 px-2 py-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            <span>Farmer App</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </Link>
        </div>
      </div>

      {/* Right side: Role Switcher + Alerts + Profile */}
      <div className="flex items-center gap-2.5">
        <RoleSwitcherBar />

        {/* Agri Alerts Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
              <Bell className="h-4 w-4 text-foreground" />
              {unreadAlerts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-background" />
              )}
            </Button>
          } />
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between text-xs">
              <span>Agri Alerts & Warnings</span>
              <Badge variant="secondary" className="text-[10px]">{unreadAlerts.length} Active</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-72 overflow-y-auto space-y-1 p-1">
              {alerts.slice(0, 4).map((alert) => (
                <Link key={alert.id} href="/admin/alerts" className="block">
                  <div className="p-2 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground truncate">{alert.title}</span>
                      <Badge variant={alert.severity === 'CRITICAL' ? 'destructive' : 'outline'} className="text-[9px] px-1 h-3.5">
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">{alert.description}</p>
                    <span className="text-[10px] text-muted-foreground/80">{alert.region}</span>
                  </div>
                </Link>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/admin/alerts" className="text-xs text-center justify-center cursor-pointer font-medium text-primary block w-full py-1">View All Agricultural Alerts</Link>} />
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User initials avatar */}
        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary-foreground flex items-center justify-center font-bold text-xs border border-primary/40 shrink-0">
          {currentUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
        </div>
      </div>
    </header>
  );
}
