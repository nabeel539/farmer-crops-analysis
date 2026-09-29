'use client';

import React from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { MobileBottomNav } from './MobileBottomNav';

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar for Desktop */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-3.5 sm:p-5 lg:p-6 pb-20 md:pb-6 w-full space-y-5">
          {children}
        </main>
      </div>

      {/* Bottom Bar for Mobile (< md) */}
      <MobileBottomNav />
    </div>
  );
}
