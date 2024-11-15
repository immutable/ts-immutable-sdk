'use client';

import { useIMX } from '@/context/imx';
import { usePassport } from '@/context/passport';
import { useZkEVM } from '@/context/zkevm';
import { Box, Button, Heading } from '@biom3/react';
import { passport } from "@imtbl/sdk";
import { useEffect, useState } from 'react';

export default function Home() {
  const { listAssets: listIMXAssets } = useIMX();
  const { listAssets: listZKEVMAssets } = useZkEVM();
  const {
    imxWalletAddress,
    login,
    logout,
    getUserInfo,
    burn,
  } = usePassport(); 
  const [userProfile, setUserProfile] = useState<passport.UserProfile | null>(null);
  const [imxAssets, setIMXAssets] = useState<any[]>([]);
  const [zkevmAssets, setZKEVMAssets] = useState<any[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (login) {
      await login();
      const profile = await getUserInfo?.();
      if (profile) {
        console.log('User info fetched:', profile);
        setUserProfile(profile);
      } else {
        console.log('Failed to fetch user info');
      }
    }
  };

  const handleListIMXAssets = async () => {
    if (listIMXAssets) {
      setLoading(true);
      try {
        if (imxWalletAddress) {
          const assetsResponse = await listIMXAssets(imxWalletAddress);
          setIMXAssets(assetsResponse.result);
        } else {
          console.log('IMX wallet address is undefined');
        }
      } catch (error) {
        console.error('Error listing IMX assets:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleListZKEVMAssets = async () => {
    if (listZKEVMAssets) {
      setLoading(true);
      try {
        if (imxWalletAddress) {
          const assetsResponse = await listZKEVMAssets(imxWalletAddress);
          setZKEVMAssets(assetsResponse.result);
          console.log(`zkevmAssets: `, assetsResponse)
        } else {
          console.log('IMX wallet address is undefined');
        }
      } catch (error) {
        console.error('Error listing ZKEVM assets:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (userProfile) {
      handleListIMXAssets();
      handleListZKEVMAssets();
    }
  }, [userProfile]);

  const handleAssetSelection = (asset: any) => {
    setSelectedAssets(prev => 
      prev.includes(asset) ? prev.filter(a => a !== asset) : [...prev, asset]
    );
  };

  const handleBurn = async () => {
    if (userProfile && burn) {
      setLoading(true);
      try {
        if (imxWalletAddress) {
          await burn(selectedAssets.map(asset => ({
            tokenId: asset.token_id,
            tokenAddress: asset.token_address,
          })));
          
          // Clear selection and refresh asset lists
          setSelectedAssets([]);
          await handleListIMXAssets();
          await handleListZKEVMAssets();
        } else {
          console.error('IMX wallet address is undefined');
        }
      } catch (error) {
        console.error('Error burning:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <Box className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <Heading>Immutable X to Immutable zkEVM Asset Migrator</Heading>
          {!userProfile ? (
            <Button
              onClick={handleLogin}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login to Passport
            </Button>
          ) : (
            <Box className="flex items-center gap-4">
              <span className="text-gray-600">
                {imxWalletAddress}
              </span>
              <Button
                onClick={logout}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Logout
              </Button>
            </Box>
          )}
        </header>

        {userProfile && (
          <Box>
            <Box className="flex justify-between items-center mb-4">
              <Heading size="small">Immutable X Assets (select to migrate)</Heading>
              {selectedAssets.length > 0 && (
                <Button
                  onClick={handleBurn}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Migrate Selected ({selectedAssets.length})
                </Button>
              )}
            </Box>

            {loading ? (
              <Box className="flex justify-center items-center h-64">
                <Box className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></Box>
              </Box>
            ) : (
              <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {imxAssets.map((asset) => (
                  <Box
                    key={asset.token_id}
                    onClick={() => handleAssetSelection(asset)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedAssets.includes(asset.token_id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {asset.image_url && (
                      <img
                        src={asset.image_url}
                        alt={asset.name}
                        className="w-full h-48 object-cover rounded-md mb-3"
                      />
                    )}
                    <h3 className="font-semibold text-gray-800">{asset.name}</h3>
                    <p className="text-sm text-gray-600">ID: {asset.token_id}</p>
                  </Box>
                ))}
              </Box>
            )}
            <Box className="mt-8">
              <Heading size="small">Immutable zkEVM Assets</Heading>
              <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {zkevmAssets.map((asset) => (
                  <Box
                    key={asset.token_id}
                    className="p-4 rounded-lg border border-gray-200 hover:border-blue-300"
                  >
                    {asset.image && (
                      <img
                        src={asset.image}
                        alt={asset.name}
                        className="w-full h-48 object-cover rounded-md mb-3"
                      />
                    )}
                    <h3 className="font-semibold text-gray-800">{asset.name}</h3>
                    <p className="text-sm text-gray-600">ID: {asset.token_id}</p>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </main>
  );
}