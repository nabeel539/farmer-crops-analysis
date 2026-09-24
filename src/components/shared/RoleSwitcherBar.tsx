'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setActiveRole, setCurrentUser } from '@/store/slices/uiSlice';
import { MOCK_USERS } from '@/data/mockData';
import { UserRole } from '@/types';
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
import { Shield, UserCheck, Smartphone, Sparkles, ChevronDown } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';

export function RoleSwitcherBar() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { activeRole, currentUser } = useAppSelector((state) => state.ui);

  const handleRoleChange = (role: UserRole) => {
    const user = MOCK_USERS.find((u) => u.role === role) || MOCK_USERS[0];
    dispatch(setCurrentUser(user));
    dispatch(setActiveRole(role));

    toast.info(`Switched persona to ${user.name} (${role})`);

    // Intelligent route redirection based on role
    if (role === 'FARMER' && !pathname.startsWith('/farmer')) {
      router.push('/farmer');
    } else if (role === 'FIELD_OFFICER' && !pathname.startsWith('/field-officer') && !pathname.startsWith('/admin')) {
      router.push('/field-officer');
    } else if ((role === 'SUPER_ADMIN' || role === 'AGRI_MANAGER') && (pathname.startsWith('/farmer') || pathname.startsWith('/field-officer'))) {
      router.push('/admin');
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Shield className="h-3.5 w-3.5 text-rose-500" />;
      case 'AGRI_MANAGER':
        return <Sparkles className="h-3.5 w-3.5 text-amber-500" />;
      case 'FIELD_OFFICER':
        return <UserCheck className="h-3.5 w-3.5 text-blue-500" />;
      case 'FARMER':
        return <Smartphone className="h-3.5 w-3.5 text-emerald-500" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 gap-2 bg-background/90 border-primary/30 hover:border-primary text-xs font-semibold px-2.5 rounded-md shadow-xs"
        >
          {getRoleIcon(activeRole)}
          <span className="hidden sm:inline">{currentUser.name}</span>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-mono font-medium">
            {activeRole}
          </Badge>
          <ChevronDown className="h-3 w-3 text-muted-foreground ml-0.5" />
        </Button>
      } />
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Switch Active Persona</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {MOCK_USERS.map((user) => (
          <DropdownMenuItem
            key={user.id}
            onClick={() => handleRoleChange(user.role)}
            className="flex items-center justify-between cursor-pointer py-2"
          >
            <div className="flex items-center gap-2.5">
              {getRoleIcon(user.role)}
              <div className="flex flex-col">
                <span className="text-xs font-medium text-foreground">{user.name}</span>
                <span className="text-[10px] text-muted-foreground">{user.role}</span>
              </div>
            </div>
            {activeRole === user.role && (
              <Badge variant="default" className="text-[9px] px-1 h-3.5">Active</Badge>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <div className="p-1.5 flex gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-1/2 text-[11px] h-7" 
            onClick={() => router.push('/admin')}
          >
            Admin UI
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-1/2 text-[11px] h-7" 
            onClick={() => router.push('/farmer')}
          >
            Farmer UI
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
