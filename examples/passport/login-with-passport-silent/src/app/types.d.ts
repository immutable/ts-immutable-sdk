import { passport } from '@imtbl/sdk';

// Extend the existing Passport type definitions
declare module '@imtbl/sdk' {
  namespace passport {
    interface LoginOptions {
      useCachedSession?: boolean;
      anonymousId?: string;
      useSilentLogin?: boolean;
    }

    interface LogoutOptions {
      silent?: boolean;
    }

    interface Passport {
      isAuthenticated(): Promise<boolean>;
      getUserInfo(): Promise<any>;
      loginCallback(): Promise<void>;
      logout(options?: LogoutOptions): Promise<void>;
    }
  }
} 