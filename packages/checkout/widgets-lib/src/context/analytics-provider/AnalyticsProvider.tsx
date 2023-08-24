import { ReactNode } from 'react';
import { AnalyticsProvider } from '../AnalyticsProvider';

interface AnalyticsProviderProps {
  children: ReactNode;
}
export function SegmentAnalyticsProvider({ children }: AnalyticsProviderProps) {
  return (
    <AnalyticsProvider>
      {children}
    </AnalyticsProvider>
  );
}
