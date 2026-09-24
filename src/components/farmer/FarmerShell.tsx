'use client';

import React from 'react';
import { FarmerSidebar } from './FarmerSidebar';
import { FarmerHeader } from './FarmerHeader';
import { FarmerBottomNav } from './FarmerBottomNav';

interface FarmerShellProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  farmerName: string;
  farmerCode: string;
  village: string;
}

export function FarmerShell({
  children,
  activeTab,
  setActiveTab,
  farmerName,
  farmerCode,
  village
}: FarmerShellProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Farmer Sidebar for Desktop */}
      <FarmerSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <FarmerHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          farmerName={farmerName}
          farmerCode={farmerCode}
          village={village}
        />
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation (< md) */}
      <FarmerBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
