'use client';

import { useIMX } from '@/context/imx';
import { usePassport } from '@/context/passport';
import { useZkEVM } from '@/context/zkevm';
import {
  Body,
  Box,
  Button,
  Heading,
  Stack
} from '@biom3/react';
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
      <Box sx={{ marginBottom: "base.spacing.x5" }}>
        <Heading size="medium" sx={{ marginBottom: "base.spacing.x5" }}>
          Passport
        </Heading>
        <Stack direction="row" justifyContent={"space-between"}>
          <Box sx={{ marginBottom: "base.spacing.x5" }}>
            {userProfile == null ? (
              <Button
                size="medium"
                variant="primary"
                sx={{ width: "100%", marginBottom: "base.spacing.x10" }}
                disabled={loading}
                onClick={handleLogin}
              >
                Login
              </Button>
            ) : (
              <Button
                size="medium"
                variant="primary"
                sx={{ width: "90%", marginBottom: "base.spacing.x10" }}
                disabled={loading}
                onClick={logout}
              >
                Logout
              </Button>
            )}
          </Box>
          <Box sx={{ marginBottom: "base.spacing.x5", marginTop: "base.spacing.x1", textAlign: "right" }}>
            <div>
              <Body size="small" weight="bold">Connected Account:</Body>
            </div>
            <div>
              <Body size="xSmall" mono={true}>{userProfile ? imxWalletAddress : "(not connected)"}</Body>
            </div>
          </Box>
        </Stack>
      </Box>
      <div className="max-w-6xl mx-auto">
        {/* <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Immutable X to Immutable zkEVM Asset Migrator</h1>
          {userProfile ? (
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                {imxWalletAddress}
              </span>
              <Button
                onClick={logout}
                size="medium"
                variant="primary"
                sx={{ width: "100%", marginBottom: "base.spacing.x10" }}
              >
                Logout
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleLogin}
              size="medium"
              variant="primary"
              sx={{ width: "100%", marginBottom: "base.spacing.x10" }}
            >
              Login to Passport
            </Button>
          )}
        </header> */}

        {userProfile ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">IMX Assets for Migration</h2>
              {selectedAssets.length > 0 ? (
                <Button
                  onClick={handleBurn}
                  size="medium"
                  variant="primary"
                  sx={{ width: "100%", marginBottom: "base.spacing.x10" }}
                >
                  Migrate Selected ({selectedAssets.length})
                </Button>
              ) : null}
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {imxAssets.map((asset) => (
                  <div
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
                  </div>
                ))}
              </div>
            )}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-700">ZKEVM Assets</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {zkevmAssets.map((asset) => (
                  <div
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
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}