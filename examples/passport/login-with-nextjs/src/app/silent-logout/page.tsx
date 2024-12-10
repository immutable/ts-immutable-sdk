"use client";

import { useEffect } from 'react';
import { passportInstance } from '../utils/setupLogoutRedirect';

// Assume 'http://localhost:3000' is the URL that initiated the logout
const SILENT_LOGOUT_INITIATOR_URL = 'http://localhost:3000/logout-with-silent-mode';

export default function SilentLogout() {
  useEffect(() => {
    async function handleSilentLogout() {
      try {
        await passportInstance.logoutSilentCallback(SILENT_LOGOUT_INITIATOR_URL);
      } catch (error) {
        console.error('Silent logout error:', error);
      }
    }

    handleSilentLogout();
  }, []);

  return (
    <div>
      <p>Logging out...</p>
    </div>
  );
}