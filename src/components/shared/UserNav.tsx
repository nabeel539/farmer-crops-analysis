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
  ChevronDown, 
  LogOut, 
  LogIn, 
  ExternalLink,
  User as UserIcon 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

export function UserNav() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { currentUser, activeRole } = useAppSelector((state) => state.ui);

  const displayName = user?.name || currentUser?.name || 'Guest User';
  const displayEmail = user?.email || currentUser?.email || 'guest@krishi.com';
  const role = user?.role || activeRole || 'FARMER';

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const getRoleIcon = (userRole: string) => {
    switch (userRole) {
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return <Shield className="h-3.5 w-3.5 text-rose-500" />;
      case 'AGRI_MANAGER':
        return <Sparkles className="h-3.5 w-3.5 text-amber-500" />;
      case 'FIELD_OFFICER':
        return <UserCheck className="h-3.5 w-3.5 text-blue-500" />;
      case 'FARMER':
      default:
        return <Smartphone className="h-3.5 w-3.5 text-emerald-500" />;
    }
  };

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
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 gap-2 bg-background/90 border-primary/30 hover:border-primary text-xs font-semibold px-2.5 rounded-md shadow-xs cursor-pointer"
        >
          {getRoleIcon(role)}
          <span className="hidden sm:inline max-w-[120px] truncate">{displayName}</span>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-mono font-medium">
            {role}
          </Badge>
          <ChevronDown className="h-3 w-3 text-muted-foreground ml-0.5" />
        </Button>
      } />
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-xs font-bold leading-none text-foreground">{displayName}</p>
            <p className="text-[11px] leading-none text-muted-foreground truncate">{displayEmail}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Portal links based on authorization */}
        <DropdownMenuItem 
          onClick={() => router.push('/admin')}
          className="cursor-pointer text-xs flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-emerald-600" />
            <span>Admin Console</span>
          </span>
          <ExternalLink className="h-3 w-3 text-muted-foreground" />
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => router.push('/field-officer')}
          className="cursor-pointer text-xs flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <UserCheck className="h-3.5 w-3.5 text-blue-600" />
            <span>Field Officer App</span>
          </span>
          <ExternalLink className="h-3 w-3 text-muted-foreground" />
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => router.push('/farmer')}
          className="cursor-pointer text-xs flex items-center justify-between"
        >
          <span className="flex items-center gap-2">
            <Smartphone className="h-3.5 w-3.5 text-amber-600" />
            <span>Farmer Passbook</span>
          </span>
          <ExternalLink className="h-3 w-3 text-muted-foreground" />
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem 
          onClick={handleLogout}
          className="cursor-pointer text-xs text-rose-600 focus:text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-2"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out / Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
