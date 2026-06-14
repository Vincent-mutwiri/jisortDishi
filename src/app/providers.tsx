'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { CurrencyProvider } from '../context/CurrencyContext';
import { NotificationProvider } from '../context/NotificationContext';
import { SavedMealsProvider } from '../context/SavedMealsContext';
import { DataProvider } from '../context/DataContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <CurrencyProvider>
          <NotificationProvider>
            <SavedMealsProvider>
              <DataProvider>
                {children}
                <Toaster position="top-right" />
              </DataProvider>
            </SavedMealsProvider>
          </NotificationProvider>
        </CurrencyProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
