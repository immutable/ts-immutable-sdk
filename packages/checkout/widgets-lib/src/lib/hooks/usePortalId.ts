import { useId } from 'react';

export function usePortalId(): string {
  return useId().replaceAll(':', '-');
}
