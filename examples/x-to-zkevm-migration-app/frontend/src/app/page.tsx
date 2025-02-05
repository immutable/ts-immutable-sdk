'use client';

import { useIMX } from '@/context/imx';
import { usePassport } from '@/context/passport';
import { useZkEVM } from '@/context/zkevm';
import { Box, Button, Grid, Heading, Stack } from '@biom3/react';
import { passport } from "@imtbl/sdk";
import { useCallback, useEffect, useState } from 'react';

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

  const handleListIMXAssets = useCallback(async () => {
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
  }, [imxWalletAddress, listIMXAssets]);

  const handleListZKEVMAssets = useCallback(async () => {
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
  }, [imxWalletAddress, listZKEVMAssets]);

  useEffect(() => {
    if (userProfile) {
      handleListIMXAssets();
      handleListZKEVMAssets();
    }
  }, [userProfile, handleListIMXAssets, handleListZKEVMAssets]);

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
    <Box sx={{ mb: "base.spacing.x5", m: "base.spacing.x4" }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: "base.spacing.x4" }}
      >
        <Heading>Immutable X to Immutable zkEVM Asset Migrator</Heading>
        {!userProfile ? (
          <Button onClick={handleLogin} size="medium">
            Login to Passport
          </Button>
        ) : (
          <Button onClick={logout} size="medium">
            Logout
          </Button>
        )}
      </Stack>
  
      {userProfile ? (
        <>
          <Box sx={{ mb: "base.spacing.x5" }}>
            <Heading size="small" sx={{ mb: "base.spacing.x2" }}>
              Immutable X Assets (select to migrate)
            </Heading>
            {selectedAssets.length > 0 ? (
              <Button
                onClick={handleBurn}
                size="medium"
                sx={{ mb: "base.spacing.x2" }}
              >
                Migrate Selected ({selectedAssets.length})
              </Button>
            ) : null}
  
            {loading ? (
              <Box>Loading...</Box>
            ) : (
              <Grid
                sx={{
                  gap: "base.spacing.x3",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                }}
              >
                {imxAssets.map((asset) => (
                  <Box
                    key={asset.token_id}
                    onClick={() => handleAssetSelection(asset)}
                    sx={{
                      p: "base.spacing.x3",
                      borderRadius: "8px",
                      b: "1px solid",
                      cursor: "pointer",
                      transition: "border-color 0.2s",
                      borderColor: selectedAssets.includes(asset)
                        ? "base.color.brand.3"
                        : "base.color.brand.1",
                      bg: "transparent",
                    }}
                  >
                    {asset.image_url ? (
                      <img
                        src={asset.image_url}
                        alt={asset.name}
                        style={{
                          width: "100%",
                          height: "192px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          marginBottom: "12px",
                        }}
                      />
                    ) : null}
                    <Box
                      sx={{
                        fontWeight: "600",
                        c: "base.color.text.body.primary",
                        mb: "base.spacing.x1",
                      }}
                    >
                      {asset.name}
                    </Box>
                    <Box
                      sx={{
                        fontSize: "sm",
                        c: "base.color.text.body.primary",
                      }}
                    >
                      ID: {asset.token_id}
                    </Box>
                  </Box>
                ))}
              </Grid>
            )}
          </Box>
  
          <Box>
            <Heading size="small" sx={{ mb: "base.spacing.x2" }}>
              Immutable zkEVM Assets
            </Heading>
            <Grid
              sx={{
                gap: "base.spacing.x3",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              }}
            >
              {zkevmAssets.map((asset) => (
                <Box
                  key={asset.token_id}
                  sx={{
                    p: "base.spacing.x3",
                    borderRadius: "8px",
                    b: "1px solid",
                    borderColor: "base.color.brand.1",
                    bg: "transparent",
                  }}
                >
                  {asset.image ? (
                    <img
                      src={asset.image}
                      alt={asset.name}
                      style={{
                        width: "100%",
                        height: "192px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        marginBottom: "12px",
                      }}
                    />
                  ) : null}
                  <Box
                    sx={{
                      fontWeight: "600",
                      c: "base.color.text.body.primary",
                      mb: "base.spacing.x1",
                    }}
                  >
                    {asset.name}
                  </Box>
                  <Box
                    sx={{
                      fontSize: "sm",
                      c: "base.color.text.body.primary",
                    }}
                  >
                    ID: {asset.token_id}
                  </Box>
                </Box>
              ))}
            </Grid>
          </Box>
        </>
      ) : null}
    </Box>
  );
}