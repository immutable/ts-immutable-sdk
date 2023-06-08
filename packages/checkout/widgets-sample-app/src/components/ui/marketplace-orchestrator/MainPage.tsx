import { useConnectWidget } from "./useConnectWidget";
import { useWalletWidget } from "./useWalletWidget";
import { Box, Button, Card, GridBox, Heading } from "@biom3/react";
import { useSwapWidget } from "./useSwapWidget";
import { useBridgeWidget } from "./useBridgeWidget";
import { useCallback, useContext, useMemo, useState } from "react";
import { WidgetContext, hideAllWidgets } from "./WidgetProvider";
import { ImtblWidgets } from "./ImtblWidgets";

export const MainPage = () => {
  
  // local state for enabling/disabling and changing buttons
  const [doneSwap, setDoneSwap] = useState<boolean>(false);
  const [providerPreference, setProviderPreference] = useState("");

  // widget context state for showing/hiding widgets
  const {showWidgets: {
    showConnect,
    showWallet,
    showSwap,
    showBridge
  }, setShowWidgets} = useContext(WidgetContext);

  // hooks for each widget set up event listeners and orchestration logic
  useConnectWidget(setProviderPreference);
  useWalletWidget(setProviderPreference);
  useSwapWidget(setDoneSwap);
  useBridgeWidget();

  // button click functions to open/close widgets
  const openConnectWidget = useCallback(() => {
    setShowWidgets({...hideAllWidgets, showConnect: true});
  }, [setShowWidgets])

  const openWalletWidget = useCallback(() => {
    setShowWidgets({...hideAllWidgets, showWallet: true});
  }, [setShowWidgets])

  const handleBuyClick = () => {
    alert("you can buy now");
  }

  const cardKeys = useMemo(() => [1,2,3,4],[]);

  return(
    <Box sx={{minWidth: '100vw', minHeight: '100vh', width: '100%', height: '100%', backgroundColor: 'base.color.brand.6'}}>
      <Box sx={{width: '100%',padding: 'base.spacing.x4', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
        <Heading>Immutable Checkout Marketplace</Heading>
        {!providerPreference && (
        <Button onClick={openConnectWidget}>Connect Wallet</Button>
      )}
      {providerPreference && (
        <Button onClick={openWalletWidget}>My Wallet</Button>
      )}
      </Box>
      <Box sx={{paddingX: 'base.spacing.x4'}}>
        <GridBox minColumnWidth="40%">
          <Box sx={{display: 'flex', flexDirection: 'row', gap: 'base.spacing.x4', flexWrap: 'wrap'}}>
            {cardKeys.map((val) => (
              <Box key={val}>
              <Card sx={{width: '300px'}}>
                <Card.Title>Guild of Guardians</Card.Title>
                <Card.Caption>Legendary Guardian</Card.Caption>
                <Card.FramedImage imageUrl="https://miro.medium.com/v2/resize:fit:3150/1*uZJEv6HpPe_PLkAVqFIxlA.png" />
                <Card.AssetImage imageUrl="https://gog-art-assets.s3-ap-southeast-2.amazonaws.com/Content/Thumbnails/Heroes/Umbar/Thumbnail_Hero_Umbar_Base.png" aspectRatio="4:3" relativeImageSizeInLayout="60vw" />
              </Card>
              <Button variant={doneSwap ? "primary" : "tertiary"} disabled={!doneSwap} onClick={handleBuyClick}>Buy</Button>
            </Box>
            ))}
          </Box>
          <ImtblWidgets 
            providerPreference={providerPreference} 
            showConnect={showConnect} 
            showWallet={showWallet} 
            showSwap={showSwap} 
            showBridge={showBridge} 
          />
        </GridBox>
      </Box>
    </Box>
  );
}