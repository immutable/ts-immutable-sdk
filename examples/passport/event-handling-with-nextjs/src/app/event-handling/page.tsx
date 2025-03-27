'use client';
import React, { useEffect, useState } from 'react';
import { Button, Heading, Link } from '@biom3/react';
import NextLink from 'next/link';
import { passportInstance } from '../utils/setupDefault';

export default function EventHandlingPage() {
  const [authEvents, setAuthEvents] = useState<{type: string, timestamp: string, data?: any}[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to add an event to our log with timestamp
  const logEvent = (type: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`${type} at ${timestamp}`, data);
    setAuthEvents(prev => [...prev, { type, timestamp, data }]);
  };

  // Check if user is already logged in on component mount
  useEffect(() => {
    if (!passportInstance) return;

    const checkLoginStatus = async () => {
      try {
        const userProfile = await passportInstance.getUserInfo();
        if (userProfile) {
          setIsLoggedIn(true);
          setUserInfo(userProfile);
          logEvent('CHECKED_LOGIN_STATUS', { status: 'logged_in', userProfile });
        } else {
          logEvent('CHECKED_LOGIN_STATUS', { status: 'not_logged_in' });
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        logEvent('LOGIN_STATUS_ERROR', { error: String(error) });
      }
    };

    checkLoginStatus();
  }, []);

  // Handle login
  const handleLogin = async () => {
    if (!passportInstance) return;
    
    try {
      setLoading(true);
      setError(null);
      logEvent('LOGIN_INITIATED');

      await passportInstance.loginCallback();
      
      // After login attempt, check if we're actually logged in
      const userProfile = await passportInstance.getUserInfo();
      if (userProfile) {
        setIsLoggedIn(true);
        setUserInfo(userProfile);
        logEvent('LOGIN_SUCCESS', userProfile);
      } else {
        logEvent('LOGIN_FAILED', { reason: 'No user profile returned' });
        setError('Login failed: No user profile returned');
      }
    } catch (error) {
      console.error('Login error:', error);
      logEvent('LOGIN_ERROR', { error: String(error) });
      setError(`Failed to login: ${String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    if (!passportInstance) return;
    
    try {
      setLoading(true);
      setError(null);
      logEvent('LOGOUT_INITIATED');

      await passportInstance.logout();
      
      setIsLoggedIn(false);
      setUserInfo(null);
      logEvent('LOGOUT_SUCCESS');
    } catch (error) {
      console.error('Logout error:', error);
      logEvent('LOGOUT_ERROR', { error: String(error) });
      setError(`Failed to logout: ${String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  // Clear event log
  const clearEvents = () => {
    setAuthEvents([]);
  };

  return (
    <>
      <Heading 
        size="medium" 
        className="mb-1">
        Passport Authentication Events Demo
      </Heading>
      
      <p className="mb-1">
        This demo shows authentication events captured from interactions with the Immutable Passport SDK.
      </p>
      
      {error && (
        <div className="mb-1 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
          <button 
            className="ml-2 text-red-700"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}
      
      <div className="mb-1">
        {!isLoggedIn ? (
          <Button 
            size="medium" 
            onClick={handleLogin} 
            disabled={loading}
            variant={loading ? "tertiary" : "primary"}
          >
            {loading ? "Logging in..." : "Login with Passport"}
          </Button>
        ) : (
          <Button 
            size="medium" 
            variant="tertiary"
            onClick={handleLogout} 
            disabled={loading}
          >
            {loading ? "Logging out..." : "Logout"}
          </Button>
        )}
      </div>
      
      {userInfo && (
        <div className="mb-1 p-3 bg-green-50 border border-green-200 rounded">
          <Heading size="small" className="mb-1">User Info:</Heading>
          <pre className="text-xs overflow-auto max-h-40">
            {JSON.stringify(userInfo, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mb-1">
        <Button 
          size="small" 
          variant="secondary"
          onClick={clearEvents}
          disabled={authEvents.length === 0}
        >
          Clear Event Log
        </Button>
      </div>
      
      <div className="mb-1">
        <Heading size="small" className="mb-1">Authentication Event Log:</Heading>
        {authEvents.length === 0 ? (
          <p>No events logged yet. Login or logout to generate events.</p>
        ) : (
          <div className="border p-1 rounded overflow-auto max-h-80">
            {authEvents.map((event, index) => (
              <div key={index} className="mb-1 pb-1 border-b">
                <div className="flex justify-between">
                  <strong>{event.type}</strong>
                  <span className="text-gray-500 text-xs">{new Date(event.timestamp).toLocaleTimeString()}</span>
                </div>
                {event.data && (
                  <pre className="text-xs overflow-auto mt-1">
                    {JSON.stringify(event.data, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Link rc={<NextLink href="/" />} className="mb-1">Return to Home</Link>
    </>
  );
} 