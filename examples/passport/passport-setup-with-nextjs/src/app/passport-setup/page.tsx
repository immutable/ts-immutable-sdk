'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@biom3/react';
import { passport } from '@imtbl/sdk';
import { useAppContext } from '../utils/wrapper';
import { 
  passportInstance, 
  passportInstanceWithDisabledOverlays, 
  passportInstanceWithMinimalScopes,
  passportInstanceWithAllScopes,
  passportInstanceWithSilentLogout,
  passportInstanceForProduction,
  passportInstanceWithAdvancedOptions
} from '../utils/setupDefault';

function PassportSetupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { 
    selectedPassportInstance, 
    setSelectedPassportInstance,
    isAuthenticated,
    setIsAuthenticated,
    userInfo,
    setUserInfo
  } = useAppContext();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configType, setConfigType] = useState<string>('standard');

  // Define fetchUserInfo function first before it's used
  const fetchUserInfo = async () => {
    try {
      const userProfile = await selectedPassportInstance.getUserInfo();
      setUserInfo(userProfile);
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  };

  // Select the appropriate Passport instance based on the URL parameter
  useEffect(() => {
    const config = searchParams.get('config');
    if (config) {
      setConfigType(config);
      
      switch (config) {
        case 'standard':
          setSelectedPassportInstance(passportInstance);
          break;
        case 'no-overlays':
          setSelectedPassportInstance(passportInstanceWithDisabledOverlays);
          break;
        case 'minimal-scopes':
          setSelectedPassportInstance(passportInstanceWithMinimalScopes);
          break;
        case 'all-scopes':
          setSelectedPassportInstance(passportInstanceWithAllScopes);
          break;
        case 'silent-logout':
          setSelectedPassportInstance(passportInstanceWithSilentLogout);
          break;
        case 'production':
          setSelectedPassportInstance(passportInstanceForProduction);
          break;
        default:
          setSelectedPassportInstance(passportInstance);
      }
    }
  }, [searchParams, setSelectedPassportInstance]);

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const accessToken = await selectedPassportInstance.getAccessToken();
        if (accessToken) {
          setIsAuthenticated(true);
          await fetchUserInfo();
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuthentication();
  }, [selectedPassportInstance, setIsAuthenticated]);

  const login = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Save the current config type to localStorage so the redirect page can use it
      localStorage.setItem('passportSetupConfig', configType);
      
      await selectedPassportInstance.login();
      setIsAuthenticated(true);
      await fetchUserInfo();
    } catch (error) {
      console.error('Login failed:', error);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await selectedPassportInstance.logout();
      setIsAuthenticated(false);
      setUserInfo(null);
    } catch (error) {
      console.error('Logout failed:', error);
      setError('Logout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getConfigDescription = () => {
    switch (configType) {
      case 'standard':
        return 'Standard Passport configuration with default settings';
      case 'no-overlays':
        return 'Passport with popup overlays disabled. This affects the UI displayed when pop-ups are blocked or when authentication occurs.';
      case 'minimal-scopes':
        return 'Passport with minimal required scopes (openid, offline_access). This limits access to user information.';
      case 'all-scopes':
        return 'Passport with all available scopes. This provides access to more user information and actions.';
      case 'silent-logout':
        return 'Passport with silent logout mode. This affects how the user is logged out.';
      case 'production':
        return 'Passport configured for production environment instead of sandbox.';
      case 'advanced-options':
        return 'Passport with advanced configuration options including crossSdkBridgeEnabled, jsonRpcReferrer, forceScwDeployBeforeMessageSignature, and custom service endpoint overrides.';
      default:
        return 'Standard Passport configuration';
    }
  };

  // Function to get the environment name for display purposes
  const getEnvironmentName = () => {
    if (configType === 'production') {
      return 'PRODUCTION';
    }
    return 'SANDBOX';
  };

  // Get configuration details to display based on the selected type
  const getConfigDetails = () => {
    const baseConfig = {
      environment: getEnvironmentName(),
      clientId: process.env.NEXT_PUBLIC_CLIENT_ID ? '[CONFIGURED]' : '[NOT CONFIGURED]',
    };

    switch (configType) {
      case 'no-overlays':
        return {
          ...baseConfig,
          popupOverlayOptions: {
            disableGenericPopupOverlay: true,
            disableBlockedPopupOverlay: true,
          }
        };
      case 'minimal-scopes':
        return {
          ...baseConfig,
          scope: 'openid offline_access'
        };
      case 'all-scopes':
        return {
          ...baseConfig,
          scope: 'openid offline_access email transact'
        };
      case 'silent-logout':
        return {
          ...baseConfig,
          logoutMode: 'silent'
        };
      case 'advanced-options':
        return {
          ...baseConfig,
          crossSdkBridgeEnabled: true,
          jsonRpcReferrer: 'https://your-app-domain.com',
          forceScwDeployBeforeMessageSignature: true,
          overrides: {
            authenticationDomain: 'auth.sandbox.immutable.com',
            magicPublishableApiKey: 'pk_live_XXXXXXXXXXXXXXXX',
            magicProviderId: 'immutable',
            passportDomain: 'passport.sandbox.immutable.com',
            imxPublicApiDomain: 'api.sandbox.x.immutable.com',
            zkEvmRpcUrl: 'https://rpc.testnet.immutable.com',
            relayerUrl: 'https://relayer.sandbox.immutable.com',
            indexerMrBasePath: 'https://indexer.sandbox.immutable.com',
            orderBookMrBasePath: 'https://orderbook.sandbox.immutable.com',
            passportMrBasePath: 'https://passport.sandbox.immutable.com',
          }
        };
      default:
        return baseConfig;
    }
  };

  return (
    <div className="container">
      <h1>Testing {configType.replace('-', ' ')} Configuration</h1>
      <p className="card">{getConfigDescription()}</p>
      
      <div className="card">
        <h2>Passport Status</h2>
        <p>Configuration: {configType}</p>
        <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
        
        <div className="button-row">
          {!isAuthenticated ? (
            <Button
              variant="primary"
              onClick={login}
              disabled={loading}
            >
              Login with Passport
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={logout}
              disabled={loading}
            >
              Logout
            </Button>
          )}
          
          <Button
            variant="tertiary"
            onClick={() => router.push('/')}
          >
            Back to Configurations
          </Button>
        </div>
        
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
      
      {isAuthenticated && userInfo && (
        <div className="card">
          <h2>User Information</h2>
          <pre style={{ overflow: 'auto', maxHeight: '300px' }}>
            {JSON.stringify(userInfo, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="card">
        <h2>Configuration Details</h2>
        <pre style={{ overflow: 'auto', maxHeight: '300px' }}>
          {JSON.stringify(getConfigDetails(), null, 2)}
        </pre>
      </div>
    </div>
  );
}

// Wrap with Suspense to address the Next.js build warning
export default function PassportSetup() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PassportSetupContent />
    </Suspense>
  );
} 