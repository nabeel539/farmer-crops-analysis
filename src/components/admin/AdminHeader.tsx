'use client';

import React from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { setActiveRole } from '@/store/slices/uiSlice';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RoleSwitcherBar, UserNav } from '@/components/shared/RoleSwitcherBar';
import {
  Bell,
  Menu,
  Wheat,
  Plus,
  ExternalLink,
  LayoutDashboard,
  Users,
  Package,
  MapPin,
  Map,
  Sprout,
  Calendar,
  Factory,
  TrendingUp,
  FileText,
  Settings,
  ShieldAlert,
  LogOut,
  ChevronDown
} from 'lucide-react';
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

interface AdminHeaderProps {
  onQuickAction?: () => void;
}

export function AdminHeader({ onQuickAction }: AdminHeaderProps) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { currentUser } = useAppSelector((state) => state.ui);
  const alerts = useAppSelector((state) => state.alerts.alerts);
  const unreadAlerts = alerts.filter((a) => !a.resolved);

  return (
    <header className="h-16 border-b border-border/80 bg-card/60 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left side: Mobile Menu + Breadcrumbs Title */}
      <div className="flex items-center gap-3">
        {/* Mobile Navigation Sheet */}
        <Sheet>
          <SheetTrigger render={
            <Button variant="ghost" size="icon" className="md:hidden h-9 w-9 text-foreground">
              <Menu className="h-5 w-5" />
            </Button>
          } />
          <SheetContent side="left" className="w-80 p-0 flex flex-col bg-sidebar text-sidebar-foreground">
            <div className="h-16 flex items-center gap-3 px-5 border-b border-border/70">
              <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-sm">
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
                  <Link href="/admin" prefetch={false} className={cn('flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors', pathname === '/admin' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground')}>
                    <LayoutDashboard className="h-4 w-4 shrink-0 text-primary" />
                    <span>Dashboard</span>
                  </Link>
                </div>
              </div>

              {/* Seed & Land Base */}
              <div>
                <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider px-2 block mb-1">Seed & Land Base</span>
                <div className="space-y-0.5">
                  <Link href="/admin/farmers" prefetch={false} className={cn('flex items-center justify-between px-3 py-2 rounded-md transition-colors', pathname === '/admin/farmers' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground')}>
                    <span className="flex items-center gap-2.5">
                      <Users className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span>Farmers Enrolled</span>
                    </span>
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-mono">12</Badge>
                  </Link>
                  <Link href="/admin/seed-distribution" prefetch={false} className={cn('flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors', pathname === '/admin/seed-distribution' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground')}>
                    <Package className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>Seed Distribution</span>
                  </Link>
                  <Link href="/admin/land-parcels" prefetch={false} className={cn('flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors', pathname === '/admin/land-parcels' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground')}>
                    <MapPin className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                    <span>Land Parcels & GPS</span>
                  </Link>
                  <Link href="/admin/map" prefetch={false} className={cn('flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors', pathname === '/admin/map' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground')}>
                    <Map className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                    <span>GIS Field Map</span>
                  </Link>
                </div>
              </div>

              {/* Crop Operations */}
              <div>
                <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider px-2 block mb-1">Crop Operations</span>
                <div className="space-y-0.5">
                  <Link href="/admin/crop-cycles" prefetch={false} className={cn('flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors', pathname === '/admin/crop-cycles' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground')}>
                    <Sprout className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>Wheat Crop Cycles</span>
                  </Link>
                  <Link href="/admin/activities" prefetch={false} className={cn('flex items-center justify-between px-3 py-2 rounded-md transition-colors', pathname === '/admin/activities' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground')}>
                    <span className="flex items-center gap-2.5">
                      <Calendar className="h-4 w-4 shrink-0 text-cyan-600 dark:text-cyan-400" />
                      <span>Field Activities</span>
                    </span>
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-mono">12</Badge>
                  </Link>
                </div>
              </div>

              {/* Harvest & Processing */}
              <div>
                <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider px-2 block mb-1">Harvest & Processing</span>
                <div className="space-y-0.5">
                  <Link href="/admin/harvest" prefetch={false} className={cn('flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors', pathname === '/admin/harvest' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground')}>
                    <Wheat className="h-4 w-4 shrink-0 text-amber-500" />
                    <span>Harvest Records</span>
                  </Link>
                  <Link href="/admin/production" prefetch={false} className={cn('flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors', pathname === '/admin/production' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground')}>
                    <Factory className="h-4 w-4 shrink-0 text-purple-600 dark:text-purple-400" />
                    <span>Flour Milling & Silos</span>
                  </Link>
                </div>
              </div>

              {/* Intelligence & Settings */}
              <div>
                <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider px-2 block mb-1">Intelligence</span>
                <div className="space-y-0.5">
                  <Link href="/admin/alerts" prefetch={false} className={cn('flex items-center justify-between px-3 py-2 rounded-md transition-colors', pathname === '/admin/alerts' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground')}>
                    <span className="flex items-center gap-2.5">
                      <Bell className="h-4 w-4 shrink-0 text-rose-500" />
                      <span>Agri Alerts</span>
                    </span>
                    <Badge variant="destructive" className="text-[10px] h-4 px-1.5 font-mono">4</Badge>
                  </Link>
                  <Link href="/admin/analytics" prefetch={false} className={cn('flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors', pathname === '/admin/analytics' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground')}>
                    <TrendingUp className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
                    <span>Analytics & Yield</span>
                  </Link>
                  <Link href="/admin/reports" prefetch={false} className={cn('flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors', pathname === '/admin/reports' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground')}>
                    <FileText className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                    <span>Official Reports</span>
                  </Link>
                  <Link href="/admin/settings" prefetch={false} className={cn('flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors', pathname === '/admin/settings' ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:bg-sidebar-accent hover:text-foreground')}>
                    <Settings className="h-4 w-4 shrink-0 text-slate-500" />
                    <span>Settings & Policy</span>
                  </Link>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Portal Active Badge (No instant role switching without login) */}
        <div className="flex items-center gap-2 px-3 py-1 bg-muted/60 border border-border/80 text-xs font-semibold">
          <span className="w-2 h-2 shrink-0 bg-emerald-500 animate-pulse" />
          <span className="text-foreground font-bold tracking-tight">Admin Command Center</span>
        </div>
      </div>

      {/* Right side: Alerts + Profile */}
      <div className="flex items-center gap-3">
        {/* Agri Alerts Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl hover:bg-muted/80 cursor-pointer">
              <Bell className="h-4 w-4 text-foreground" />
              {unreadAlerts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-background animate-pulse" />
              )}
            </Button>
          } />
          <DropdownMenuContent align="end" className="w-80 rounded-2xl p-2 shadow-xl border border-border/80">
            <DropdownMenuLabel className="flex items-center justify-between text-xs px-2 py-1.5">
              <span className="font-bold">Agri Alerts & Warnings</span>
              <Badge variant="secondary" className="text-[10px] font-mono">{unreadAlerts.length} Active</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-72 overflow-y-auto space-y-1 p-1 scrollbar-thin">
              {alerts.slice(0, 4).map((alert) => (
                <Link key={alert.id} href="/admin/alerts" className="block">
                  <div className="p-2.5 rounded-xl hover:bg-muted/60 transition-colors cursor-pointer text-xs space-y-1 border border-transparent hover:border-border/60">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-foreground truncate">{alert.title}</span>
                      <Badge variant={alert.severity === 'CRITICAL' ? 'destructive' : 'outline'} className="text-[9px] px-1.5 h-4 font-semibold">
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">{alert.description}</p>
                    <span className="text-[10px] text-muted-foreground/80 font-mono">{alert.region}</span>
                  </div>
                </Link>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/admin/alerts" className="text-xs text-center justify-center cursor-pointer font-bold text-emerald-600 block w-full py-1.5 rounded-lg hover:bg-emerald-500/10">View All Agricultural Alerts →</Link>} />
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User initials avatar — click to logout */}
        <UserNav />
      </div>
    </header>
  );
}
