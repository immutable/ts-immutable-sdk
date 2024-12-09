'use client';

import { useBackend } from '@/context/backend'; // Adjust the import path as necessary
import { useIMX } from '@/context/imx';
import { useLink } from '@/context/link';
import { usePassport } from '@/context/passport';
import { useZkEVM } from '@/context/zkevm';
import { Box, Button, Grid, Heading, Stack } from '@biom3/react';
import { useCallback, useEffect, useState } from 'react';

export default function Home() {
  const { listAssets: listIMXAssets } = useIMX();
  const { listAssets: listZKEVMAssets } = useZkEVM();
  const { setupLink, burn: linkBurn } = useLink();
  const {
    login,
    logout,
    burn: passportBurn,
  } = usePassport(); 
  const [imxWalletAddress, setIMXWalletAddress] = useState<string | null>(null);
  const [zkevmWalletAddress, setZKEVMWalletAddress] = useState<string | null>(null);
  const [imxLoginMethod, setImxLoginMethod] = useState<'passport' | 'link' | null>(null);
  const [loading, setLoading] = useState(false);
  const [imxAssets, setIMXAssets] = useState<any[]>([]);
  const [zkevmAssets, setZKEVMAssets] = useState<any[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<any[]>([]);
  const { fetchStagedAssets, stageAssets } = useBackend();
  const [stagedAssets, setStagedAssets] = useState<any[]>([]);
  const [originalIMXAssets, setOriginalIMXAssets] = useState<any[]>([]); // New state for original assets

  useEffect(() => {
    setSelectedAssets([]);
  }, []);

  const handleLoginIMXWithLink = async () => {
    if (setupLink) {
      const address = await setupLink();
      if (address) {
        setIMXWalletAddress(address);
        setImxLoginMethod('link');
        console.log(`Connected to IMX with Link: ${address}`);
      } else {
        console.log('Failed to connect to IMX with Link');
      }
    }
  };

  const handleLoginIMXWithPassport = async () => {
    if (login) {
      const address = await login();
      if (address) {
        setIMXWalletAddress(address);
        setZKEVMWalletAddress(address); // Log into zkEVM as well
        setImxLoginMethod('passport');
        console.log(`Connected to IMX with Passport: ${address}`);
      } else {
        console.log('Failed to connect to IMX with Passport');
      }
    }
  };

  const handleLogoutIMX = async () => {
    if (imxLoginMethod === 'link') {
      setIMXWalletAddress(null);
      setImxLoginMethod(null);
      console.log('Logged out of IMX with Link');
    } else if (imxLoginMethod === 'passport' && logout) {
      await logout(); // Log out from Passport
      setIMXWalletAddress(null);
      setZKEVMWalletAddress(null); // Also log out of zkEVM
      setImxLoginMethod(null);
      console.log('Logged out of IMX with Passport');
    }
  };

  const handleLoginZKEVMWithPassport = async () => {
    if (login) {
      const address = await login();
      if (address) {
        setZKEVMWalletAddress(address);
        console.log(`Connected to zkEVM with Passport: ${address}`);
      } else {
        console.log('Failed to connect to zkEVM with Passport');
      }
    }
  };
  const handleLogoutZKEVM = async () => {
    if (logout) {
      await logout(); // Log out from Passport
    }
    setZKEVMWalletAddress(null);
    console.log('Logged out of zkEVM');
  };

  const handleListIMXAssets = async () => {
    if (listIMXAssets) {
      setLoading(true);
      try {
        if (imxWalletAddress) {
          const assetsResponse = await listIMXAssets(imxWalletAddress);
          let filteredAssets = assetsResponse.result.filter((asset: any) => asset.token_address === process.env.NEXT_PUBLIC_IMX_COLLECTION_ADDRESS);
          setOriginalIMXAssets(filteredAssets); // Set original assets
          setIMXAssets(filteredAssets); // Set displayed assets
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
        if (zkevmWalletAddress) {
          const assetsResponse = await listZKEVMAssets(zkevmWalletAddress);
          let filteredAssets = assetsResponse.result.filter((asset: any) => asset.contract_address === process.env.NEXT_PUBLIC_ZKEVM_COLLECTION_ADDRESS);
          setZKEVMAssets(filteredAssets);
        } else {
          console.log('ZkEVM wallet address is undefined');
        }
      } catch (error) {
        console.error('Error listing ZKEVM assets:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleListStagedAssets = useCallback(async () => {
    if (fetchStagedAssets) {
      try {
        const response = await fetchStagedAssets();
        const stagedAssets = originalIMXAssets.filter((asset: any) => response.some((stagedAsset: any) => stagedAsset.token_id === asset.token_id));
        setStagedAssets(stagedAssets);
      } catch (error) {
        console.error('Error fetching staged assets:', error);
      }
    }
  }, [fetchStagedAssets, originalIMXAssets]); // Add dependencies

  useEffect(() => {
    const fetchAssets = async () => {
      if (imxWalletAddress) {
        await handleListIMXAssets();
      }
    };
    fetchAssets();
  }, [imxWalletAddress]);

  useEffect(() => {
    if (imxAssets.length > 0) { // Ensure imxAssets is loaded
      handleListStagedAssets(); // Call to fetch staged assets only after IMX assets are loaded
    }
  }, [imxAssets.length]); // Change dependency to imxAssets.length

  useEffect(() => {
    if (zkevmWalletAddress) {
      handleListZKEVMAssets();
    }
  }, [zkevmWalletAddress]);

  useEffect(() => {
    if (stagedAssets.length > 0) {
      // Filter out staged assets from imxAssets
      setIMXAssets(originalIMXAssets.filter(asset => 
        !stagedAssets.some(stagedAsset => stagedAsset.token_id === asset.token_id)
      ));
    }
  }, [stagedAssets, originalIMXAssets]); // Add originalIMXAssets as a dependency

  const handleAssetSelection = (asset: any) => {
    setSelectedAssets(prev => 
      prev.includes(asset) ? prev.filter(a => a !== asset) : [...prev, asset]
    );
  };

  const handleBurnPassport = async () => {
    if (passportBurn) {
      setLoading(true);
      try {
        if (imxWalletAddress) {
          await passportBurn(stagedAssets.map(asset => ({
            tokenId: asset.token_id,
            tokenAddress: asset.token_address,
          })));
          
          // Clear selection and refresh asset lists
          setSelectedAssets([]);
          await handleListIMXAssets();
          await handleListZKEVMAssets();
          await handleListStagedAssets();
        } else {
          console.error('IMX wallet address is undefined');
        }
      } catch (error) {
        console.error('Error burning:', error);
      } finally {
        setLoading(false);
      }
    }
  }

  const handleBurnLink = async () => {
    if (linkBurn) {
      setLoading(true);
      try {
        if (imxWalletAddress) {
          await linkBurn(stagedAssets.map(asset => ({
            tokenId: asset.token_id,
            tokenAddress: asset.token_address,
          })));
          
          // Clear selection and refresh asset lists
          setSelectedAssets([]);
          await handleListIMXAssets();
          await handleListZKEVMAssets();
          await handleListStagedAssets();
        } else {
          console.error('IMX wallet address is undefined');
        }
      } catch (error) {
        console.error('Error burning:', error);
      } finally {
        setLoading(false);
      }
    }
  }

  const handleStageAssets = async () => {
    if (selectedAssets.length > 0 && zkevmWalletAddress) {
      // Create migration requests and include metadata
      const migrationReqs = selectedAssets.map(asset => {
        return {
          zkevm_wallet_address: zkevmWalletAddress,
          token_id: asset.token_id,
        };
      });

      // Stage the assets
      await stageAssets(migrationReqs);
      await handleListStagedAssets();
      setSelectedAssets([]); // Clear selected assets
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
        {!imxWalletAddress ? (
          <Stack>
            <Button onClick={handleLoginIMXWithLink} size="medium">
              Login to IMX with Link
            </Button>
            <Button onClick={handleLoginIMXWithPassport} size="medium">
              Login to IMX with Passport
            </Button>
          </Stack>
        ) : (
          <Stack direction="row" alignItems="center">
            <span style={{ marginRight: "base.spacing.x2" }}>
              {imxWalletAddress}
            </span>
            <Button onClick={handleLogoutIMX} size="medium">
              Logout from IMX
            </Button>
          </Stack>
        )}
      </Stack>

      {imxWalletAddress ? (
        <>
          <Box sx={{ mb: "base.spacing.x5" }}>
            <Heading size="small" sx={{ mb: "base.spacing.x2" }}>
              Immutable X Assets (select to migrate)
            </Heading>
            {selectedAssets.length > 0 ? (
              <Button
                onClick={handleStageAssets}
                size="medium"
                sx={{ mb: "base.spacing.x2" }}
              >
                Stage for Migration ({selectedAssets.length})
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

          <Box sx={{ mb: "base.spacing.x5" }}>
            <Heading size="small" sx={{ mb: "base.spacing.x2" }}>
              Staged Assets
            </Heading>
            {stagedAssets.length > 0 ? (
              <Button
                onClick={imxLoginMethod === 'passport' ? handleBurnPassport : handleBurnLink}
                size="medium"
                sx={{ mb: "base.spacing.x2" }}
              >
                Migrate All Staged ({stagedAssets.length})
              </Button>
            ) : null}

            <Grid
              sx={{
                gap: "base.spacing.x3",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              }}
            >
              {stagedAssets.map((asset) => (
                <Box
                  key={asset.token_id}
                  sx={{
                    p: "base.spacing.x3",
                    borderRadius: "8px",
                    b: "1px solid",
                    borderColor: "base.color.brand.1",
                    bg: "transparent",
                    width: "100%",
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
          </Box>

          <Box sx={{ mb: "base.spacing.x5" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: "base.spacing.x4" }}>
              <Heading size="small" sx={{ mb: "base.spacing.x2" }}>
                Immutable zkEVM Assets
              </Heading>
              {!zkevmWalletAddress ? (
                <Button onClick={handleLoginZKEVMWithPassport} size="medium">
                  Login to zkEVM with Passport
                </Button>
              ) : (
                <Stack direction="row" alignItems="center">
                  <span style={{ marginRight: "base.spacing.x2" }}>
                    {zkevmWalletAddress}
                  </span>
                  <Button onClick={handleLogoutZKEVM} size="medium">
                    Logout from zkEVM
                  </Button>
                </Stack>
              )}
            </Stack>
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