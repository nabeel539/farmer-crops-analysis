'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Shield, 
  UserCheck, 
  Smartphone, 
  Sparkles, 
  LogOut, 
  LogIn
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface UserNavProps {
  variant?: 'avatar' | 'pill';
  className?: string;
}

export function UserNav({ variant = 'avatar', className }: UserNavProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { currentUser, activeRole } = useAppSelector((state) => state.ui);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const displayName = user?.name || currentUser?.name || 'Guest User';
  const displayEmail = user?.email || currentUser?.email || 'guest@krishi.com';
  const role = user?.role || activeRole || 'FARMER';

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const getRoleTheme = (userRole: string) => {
    switch (userRole) {
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return {
          icon: <Shield className="h-3.5 w-3.5 text-rose-500" />,
          avatarBg: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 hover:bg-rose-500/25',
          badgeClass: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30',
        };
      case 'AGRI_MANAGER':
        return {
          icon: <Sparkles className="h-3.5 w-3.5 text-amber-500" />,
          avatarBg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/25',
          badgeClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
        };
      case 'FIELD_OFFICER':
        return {
          icon: <UserCheck className="h-3.5 w-3.5 text-blue-500" />,
          avatarBg: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 hover:bg-blue-500/25',
          badgeClass: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30',
        };
      case 'FARMER':
      default:
        return {
          icon: <Smartphone className="h-3.5 w-3.5 text-emerald-500" />,
          avatarBg: 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border-emerald-600/30 hover:bg-emerald-600/25',
          badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
        };
    }
  };

  const theme = getRoleTheme(role);

  if (!mounted) {
    return (
      <div className="h-8 w-8 rounded-full bg-muted/40 animate-pulse border border-border/40 shrink-0" />
    );
  }

  if (!isAuthenticated && !user) {
    return (
      <Link href="/login" prefetch={false}>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 gap-2 border-primary/40 hover:border-primary text-xs font-semibold px-3 rounded-md shadow-xs cursor-pointer"
        >
          <LogIn className="h-3.5 w-3.5 text-primary" />
          <span>Sign In</span>
        </Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <button
          type="button"
          aria-label="User account menu"
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border shrink-0 cursor-pointer transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/40 active:scale-95',
            theme.avatarBg,
            className
          )}
        >
          {initials}
        </button>
      } />
      <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-xl">
        <DropdownMenuLabel className="font-normal p-2 pb-1.5">
          <div className="flex items-center gap-2.5">
            <div className={cn('w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border shrink-0', theme.avatarBg)}>
              {initials}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <p className="text-xs font-bold leading-tight text-foreground truncate">{displayName}</p>
              <p className="text-[11px] leading-tight text-muted-foreground truncate">{displayEmail}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <Badge variant="outline" className={cn('text-[9px] px-1.5 py-0 h-4 font-mono font-medium', theme.badgeClass)}>
                  {role}
                </Badge>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuItem 
          onClick={handleLogout}
          className="cursor-pointer text-xs text-rose-600 focus:text-rose-600 dark:text-rose-400 focus:bg-rose-500/10 font-semibold flex items-center gap-2 px-2.5 py-2 rounded-md"
        >
          <LogOut className="h-3.5 w-3.5 text-rose-500" />
          <span>Sign Out / Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

