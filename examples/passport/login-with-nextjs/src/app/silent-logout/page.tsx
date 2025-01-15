"use client";

import { useEffect } from 'react';
import { passportInstance } from '../utils/setupLogoutRedirect';

// Assume 'http://localhost:3000' is the URL that initiated the logout
const SILENT_LOGOUT_INITIATOR_URL = 'http://localhost:3000/logout-with-silent-mode';

export default function SilentLogout() {
   useEffect(() => {
     (async () => {
       try {
         // #doc passport-silent-logout-callback
         await passportInstance.logoutSilentCallback(SILENT_LOGOUT_INITIATOR_URL);
         // #enddoc passport-silent-logout-callback
       } catch (error) {
         console.error('Silent logout error:', error);
       }
     })();
   }, []);

  return (
    <div>
      <p>Logging out...</p>
    </div>
  );
}