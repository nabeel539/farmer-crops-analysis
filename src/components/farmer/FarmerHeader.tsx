'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Button } from '@/components/ui/button';
import { RoleSwitcherBar } from '@/components/shared/RoleSwitcherBar';
import {
  Bell,
  Menu,
  Wheat,
  PanelLeft,
  ExternalLink,
  Sprout,
  CreditCard,
  Droplets,
  BookOpen,
  CloudSun,
  Camera,
  MapPin,
  ShieldCheck,
  PhoneCall
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
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FarmerHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  farmerName: string;
  farmerCode: string;
  village: string;
}

export function FarmerHeader({
  activeTab,
  setActiveTab,
  farmerName,
  farmerCode,
  village
}: FarmerHeaderProps) {
  const dispatch = useAppDispatch();
  const { sidebarOpen } = useAppSelector((state) => state.ui);
  const alerts = useAppSelector((state) => state.alerts.alerts);
  const unreadAlerts = alerts.filter((a) => !a.resolved);

  return (
    <header className="h-16 border-b border-border/80 bg-card/70 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left side: Mobile Menu / Desktop Toggle + Farmer Info */}
      <div className="flex items-center gap-3">
        {/* Desktop Sidebar Toggle Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => dispatch(toggleSidebar())}
          className="hidden md:flex items-center gap-1.5 h-8 px-2.5 text-xs font-semibold text-foreground bg-card hover:bg-accent border-border/80 shadow-2xs rounded-lg cursor-pointer transition-all"
          title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          <PanelLeft className="h-4 w-4 text-emerald-600" />
          <span className="text-[11px] hidden xl:inline">{sidebarOpen ? 'Collapse' : 'Expand Menu'}</span>
        </Button>

        {/* Mobile Navigation Drawer Sheet */}
        <Sheet>
          <SheetTrigger render={
            <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 text-foreground">
              <Menu className="h-5 w-5" />
            </Button>
          } />
          <SheetContent side="left" className="w-80 p-0 flex flex-col bg-sidebar text-sidebar-foreground">
            <div className="h-16 flex items-center gap-3 px-5 border-b border-border/70">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-sm">
                <Wheat className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-foreground">Farmer Portal</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono uppercase tracking-wider font-semibold">Wheat Management</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-medium scrollbar-thin">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground text-sm">{farmerName}</span>
                  <Badge variant="outline" className="text-[10px] font-mono bg-background text-emerald-600">
                    {farmerCode}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">{village} &bull; 10 Acres Wheat</p>
              </div>

              {/* Navigation Items */}
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('CROP_STATUS')}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors cursor-pointer text-left',
                    activeTab === 'CROP_STATUS' ? 'bg-emerald-600 text-white font-bold' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
                  )}
                >
                  <span className="flex items-center gap-2.5"><Sprout className="h-4 w-4" /> My Wheat Crop</span>
                  <span className="text-[10px] opacity-80 font-mono">Live Stage</span>
                </button>


                <button
                  onClick={() => setActiveTab('OPERATIONS')}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors cursor-pointer text-left',
                    activeTab === 'OPERATIONS' ? 'bg-emerald-600 text-white font-bold' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
                  )}
                >
                  <span className="flex items-center gap-2.5"><Droplets className="h-4 w-4" /> Field Operations</span>
                  <span className="text-[10px] opacity-80 font-mono">Log Activity</span>
                </button>

                <button
                  onClick={() => setActiveTab('DOCTOR')}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors cursor-pointer text-left',
                    activeTab === 'DOCTOR' ? 'bg-emerald-600 text-white font-bold' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
                  )}
                >
                  <span className="flex items-center gap-2.5"><Camera className="h-4 w-4" /> Crop Doctor & AI</span>
                  <Badge variant="default" className="text-[10px] h-4 bg-emerald-500">Scan</Badge>
                </button>

                <button
                  onClick={() => setActiveTab('ADVISORIES')}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors cursor-pointer text-left',
                    activeTab === 'ADVISORIES' ? 'bg-emerald-600 text-white font-bold' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
                  )}
                >
                  <span className="flex items-center gap-2.5"><BookOpen className="h-4 w-4" /> Farm Advisories</span>
                  <span className="text-[10px] opacity-80 font-mono">Expert Tips</span>
                </button>

                <button
                  onClick={() => setActiveTab('WEATHER_MANDI')}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors cursor-pointer text-left',
                    activeTab === 'WEATHER_MANDI' ? 'bg-emerald-600 text-white font-bold' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground'
                  )}
                >
                  <span className="flex items-center gap-2.5"><CloudSun className="h-4 w-4" /> Weather & Mandi Rates</span>
                  <span className="text-[10px] opacity-80 font-mono">Prices</span>
                </button>
              </div>

              {/* Other Portals Switch */}
              <div className="pt-2 border-t border-border/60 space-y-2">
                <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider px-2 block">Switch Portals</span>
                <Link href="/admin" className="flex items-center justify-between px-3 py-2 rounded-xl bg-primary/10 text-primary font-semibold">
                  <span>Admin Console</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
                <Link href="/field-officer" className="flex items-center justify-between px-3 py-2 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-300 font-semibold">
                  <span>Field Officer App</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Farmer Profile Badge on Header */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
            🌾
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-xs sm:text-sm leading-tight text-foreground truncate max-w-[150px] sm:max-w-xs">
                {farmerName}
              </h1>
              <Badge variant="outline" className="text-[9px] h-4 font-mono hidden sm:inline-flex border-emerald-500/30 text-emerald-600 bg-emerald-500/10">
                {farmerCode}
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground font-mono leading-none truncate hidden sm:block">
              {village} &bull; Rabi Season 2025-26
            </p>
          </div>
        </div>
      </div>

      {/* Right side: Direct Call + Role Switcher + Alerts + Avatar */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Direct Call to Field Officer Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.info('Connecting call to Field Officer Muhammad Asif (0300-7654321)...')}
          className="hidden lg:flex items-center gap-1.5 h-8 px-2.5 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 rounded-lg cursor-pointer"
        >
          <PhoneCall className="h-3.5 w-3.5 text-emerald-600" />
          <span className="text-[11px] font-semibold">Call Field Officer</span>
        </Button>

        {/* Role Switcher */}
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
              <span>Farm Advisories & Alerts</span>
              <Badge variant="secondary" className="text-[10px]">{unreadAlerts.length} Active</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-72 overflow-y-auto space-y-1 p-1">
              {alerts.slice(0, 4).map((alert) => (
                <div 
                  key={alert.id}
                  onClick={() => setActiveTab('ADVISORIES')}
                  className="p-2 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground truncate">{alert.title}</span>
                    <Badge variant={alert.severity === 'CRITICAL' ? 'destructive' : 'outline'} className="text-[9px] px-1 h-3.5">
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">{alert.description}</p>
                </div>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={
              <button 
                onClick={() => setActiveTab('ADVISORIES')}
                className="text-xs text-center justify-center cursor-pointer font-medium text-emerald-600 block w-full py-1"
              >
                View All Agricultural Advisories
              </button>
            } />
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Farmer initials avatar */}
        <div className="w-8 h-8 rounded-full bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs border border-emerald-600/40 shrink-0">
          BA
        </div>
      </div>
    </header>
  );
}
