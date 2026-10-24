'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster position="top-right" richColors closeButton expand={false} />
    </SessionProvider>
  );
}
