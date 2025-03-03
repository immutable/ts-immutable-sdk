'use client';
import { Button, Heading, Card, Grid, Box, Link } from '@biom3/react';
import NextLink from 'next/link';
import { passportInstance } from './utils/setupDefault';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type UserProfile = {
  email?: string;
  nickname?: string;
  sub: string;
};

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!passportInstance) return;
      const userProfile = await passportInstance.getUserInfo();
      if (userProfile) {
        router.push('/home');
      }
    };
    fetchUserProfile();
  }, []);

  const loginWithPassport = async () => {
    if (!passportInstance) return;
    try {
      const provider = await passportInstance.connectEvm();
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      if (accounts) {
        setIsLoggedIn(true);
        router.push('/home')
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error connecting to Passport:', error);
      setIsLoggedIn(false);
    }
  };

  return (
  <>
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <Heading
          size="large"
          className="mb-4 text-center text-blue-800"
        >
          Marketplace Sample
        </Heading>

        <Box className="py-12 px-8 bg-white rounded-xl shadow-lg max-w-2xl w-full">
        <div className="flex flex-col items-center justify-center gap-6">
          <Heading size="small" className="mb-4 text-gray-800">Start Trading Today</Heading>
          <h3 className="text-center text-gray-600 font-medium">Join thousands of collectors and traders on Immutable's secure marketplace</h3>
          
          {!isLoggedIn && (
            <Button 
              variant="primary" 
              size="large" 
              onClick={loginWithPassport}
              disabled={isLoggedIn}
              className="mt-6 hover:scale-105 transition-transform duration-200"
            >
              {/* {isLoading ? 'Connecting...' : 'Get Started'} */}
              Get Started
            </Button>
          )}
          
          {/* {isLoggedIn && (
            <div className="w-full">
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 font-medium text-center">Successfully connected!</p>
                {accountAddress && (
                  <p className="text-sm text-gray-600 text-center mt-2 truncate">
                    Address: {accountAddress}
                  </p>
                )}
                {userProfile && (
                  <p className="text-sm text-gray-600 text-center mt-2 truncate">
                    Email: {userProfile.email}
                  </p>
                ) }
              </div>
              <NextLink href="/marketplace" passHref>
                <Link className="w-full">
                  <Button variant="primary" size="large" className="w-full hover:bg-blue-700 transition-colors duration-200">
                    Browse Marketplace
                  </Button>
                </Link>
              </NextLink>
            </div>
          )} */}
        </div>
      </Box>
      </div>
  </>);
}
