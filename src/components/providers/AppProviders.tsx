'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <TooltipProvider delay={200}>
        {children}
        <Toaster position="top-right" richColors />
      </TooltipProvider>
    </Provider>
  );
}
