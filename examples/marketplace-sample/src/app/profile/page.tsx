'use client';

import { useEffect, useState } from 'react';
import { BrowserProvider } from 'ethers';
import { passportInstance } from '../utils/setupDefault';
import Link from 'next/link';

type UserProfile = {
  email?: string;
  nickname?: string;
  name?: string;
  picture?: string;
  sub: string;
};

export default function Profile() {
  // User state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [linkedWallets, setLinkedWallets] = useState<string[]>([]);
  const [walletBalance, setWalletBalance] = useState<string>("0");
  const [linkingWallet, setLinkingWallet] = useState<boolean>(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  
  // Check authentication on page load
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        setIsLoading(true);
        
        // Check if user is already authenticated
        const isAuthenticated = await passportInstance.isAuthenticated();
        
        if (isAuthenticated) {
          // Get user profile
          const profile = await passportInstance.getUserInfo();
          setUserProfile(profile);
          setIsLoggedIn(true);
          
          // Connect provider and get account
          const provider = await passportInstance.connectEvm();
          
          if (provider) {
            const accounts = await provider.request({ method: "eth_accounts" });
            if (accounts && accounts.length > 0) {
              setAccountAddress(accounts[0]);
              
              // Get wallet balance
              const ethProvider = new BrowserProvider(provider);
              const balanceInWei = await ethProvider.getBalance(accounts[0]);
              const balanceInEth = parseFloat(balanceInWei.toString()) / 1e18;
              setWalletBalance(balanceInEth.toFixed(4));
              
              // Get linked wallets
              const addresses = await passportInstance.getLinkedAddresses();
              setLinkedWallets(addresses || []);
            }
          }
        }
      } catch (error) {
        console.error("Failed to check login status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkLoginStatus();
  }, []);

  const linkAnotherWallet = async () => {
    try {
      setLinkingWallet(true);
      setLinkError(null);
      
      // Get currently linked wallets
      const currentAddresses = await passportInstance.getLinkedAddresses();
      
      // Request to connect a new wallet through Passport
      // This will trigger the Passport wallet selection UI
      const provider = await passportInstance.connectEvm({
        silent: false,  // Force the wallet selection UI to appear
        loginOptions: {
          rpcUrl: 'https://rpc.testnet.immutable.com', // Use the appropriate RPC URL
        }
      });
      
      // Get accounts from the newly connected wallet
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      
      if (accounts && accounts.length > 0) {
        // Fetch updated list of linked wallets
        const updatedAddresses = await passportInstance.getLinkedAddresses();
        setLinkedWallets(updatedAddresses || []);
        
        // Check if a new wallet was actually linked
        if (updatedAddresses?.length > currentAddresses?.length) {
          console.log('New wallet linked successfully');
        } else {
          // If wallet was already linked, or the same wallet was selected
          if (currentAddresses?.includes(accounts[0])) {
            setLinkError('This wallet is already linked to your account');
          }
        }
      }
    } catch (error) {
      console.error('Error linking wallet:', error);
      setLinkError('Failed to link wallet. Please try again.');
    } finally {
      setLinkingWallet(false);
    }
  };

  // Login with Passport
  const loginWithPassport = async () => {
    if (!passportInstance) return;
    try {
      setIsLoading(true);
      
      const provider = await passportInstance.connectEvm();
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      const userProfileData = await passportInstance.getUserInfo();
      
      if (accounts) {
        setIsLoggedIn(true);
        setAccountAddress(accounts[0] || null);
        setUserProfile(userProfileData || null);
        
        // Get wallet balance
        const ethProvider = new BrowserProvider(provider);
        const balanceInWei = await ethProvider.getBalance(accounts[0]);
        const balanceInEth = parseFloat(balanceInWei.toString()) / 1e18;
        setWalletBalance(balanceInEth.toFixed(4));
        
        // Get linked wallets
        const addresses = await passportInstance.getLinkedAddresses();
        setLinkedWallets(addresses || []);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error connecting to Passport:', error);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await passportInstance.logout();
      setIsLoggedIn(false);
      setAccountAddress(null);
      setUserProfile(null);
      setLinkedWallets([]);
      setWalletBalance("0");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  // Format wallet address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">User Profile</h1>
        <p className="text-gray-600">Manage your account information and connected wallets</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center my-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        </div>
      ) : !isLoggedIn ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Please Login to View Your Profile</h2>
          <button 
            onClick={loginWithPassport} 
            className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Info Card */}
          <div className="bg-white shadow rounded-xl p-6 md:col-span-2">
            <div className="flex items-center mb-6">
              {userProfile?.picture ? (
                <img 
                  src={userProfile.picture} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full mr-4 border border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-full mr-4 flex items-center justify-center bg-gray-200 text-gray-600">
                  {userProfile?.name?.[0] || userProfile?.email?.[0] || '?'}
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold">
                  {userProfile?.name || userProfile?.nickname || 'Immutable User'}
                </h2>
                {userProfile?.email && (
                  <p className="text-gray-600">{userProfile.email}</p>
                )}
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-semibold mb-3">Account Information</h3>
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-gray-600">User ID</div>
                  <div className="col-span-2 font-mono text-sm break-all">{userProfile?.sub || 'N/A'}</div>
                </div>
                {userProfile?.email && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-gray-600">Email</div>
                    <div className="col-span-2">{userProfile.email}</div>
                  </div>
                )}
                {userProfile?.nickname && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-gray-600">Nickname</div>
                    <div className="col-span-2">{userProfile.nickname}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Wallet Card */}
          <div className="bg-white shadow rounded-xl p-6">
            <h3 className="font-semibold mb-4">Wallet Information</h3>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div className="text-gray-600 text-sm">Primary Wallet</div>
                <div className="text-xs bg-gray-200 px-2 py-1 rounded-full">Active</div>
              </div>
              <div className="font-mono text-sm mb-2 break-all">
                {accountAddress}
              </div>
              <div className="text-sm">
                Balance: <span className="font-semibold">{walletBalance} ETH</span>
              </div>
            </div>
            
            {linkedWallets.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-gray-600">Linked Wallets</h4>
                <ul className="space-y-2">
                  {linkedWallets.filter(addr => addr !== accountAddress).map((address, index) => (
                    <li key={index} className="text-sm p-2 bg-gray-50 rounded border border-gray-100">
                      <div className="font-mono break-all">{address}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium mb-2">Actions</h4>
              <div className="flex flex-col gap-2">
                {linkError && (
                  <div className="text-red-500 text-sm p-2 bg-red-50 rounded-lg mb-2">
                    {linkError}
                  </div>
                )}
                
                <button 
                  onClick={linkAnotherWallet} 
                  className="text-black hover:bg-gray-100 px-4 py-2 rounded-full border border-gray-200 transition-colors text-sm"
                  disabled={linkingWallet}
                >
                  {linkingWallet ? (
                    <span className="flex items-center justify-center">
                      <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-black rounded-full"></span>
                      Linking Wallet...
                    </span>
                  ) : (
                    'Link Another Wallet'
                  )}
                </button>
                
                <Link href="/marketplace" className="text-center text-black hover:bg-gray-100 px-4 py-2 rounded-full border border-gray-200 transition-colors text-sm">
                  Browse Marketplace
                </Link>
              </div>
            </div>
          </div>

          {/* User Activity Card */}
          <div className="bg-white shadow rounded-xl p-6 md:col-span-3">
            <h3 className="font-semibold mb-4">Account Security</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium mb-2">Connected Sessions</h4>
                <p className="text-sm text-gray-600 mb-4">You are currently logged in from this device.</p>
                <button className="text-black hover:bg-gray-100 px-4 py-2 rounded-full border border-gray-200 transition-colors text-sm">
                  Manage Sessions
                </button>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium mb-2">Account Preferences</h4>
                <p className="text-sm text-gray-600 mb-4">Manage your notification settings and preferences.</p>
                <button className="text-black hover:bg-gray-100 px-4 py-2 rounded-full border border-gray-200 transition-colors text-sm">
                  Update Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}