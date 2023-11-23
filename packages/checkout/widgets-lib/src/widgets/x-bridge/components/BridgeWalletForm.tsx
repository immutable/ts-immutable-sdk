import {
  BottomSheet, Box, Heading, Select,
} from '@biom3/react';
import { text } from 'resources/text/textConfig';
import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
import { FormControlWrapper } from 'components/FormComponents/FormControlWrapper/FormControlWrapper';
import { useCallback, useContext, useState } from 'react';
import {
  WalletProviderName, CheckoutErrorType, ChainName, ChainId,
} from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import { brigdeWalletWrapperStyles } from './BridgeWalletFormStyles';
import { XBridgeContext } from '../context/XBridgeContext';
import { BridgeWalletItem } from './BridgeWalletItem';
import { BridgeNetworkItem } from './BridgeNetworkItem';

interface BridgeWalletFormProps {
  testId: string;
}
export function BridgeWalletForm({
  testId,
}: BridgeWalletFormProps) {
  const { bridgeState: { checkout } } = useContext(XBridgeContext);
  const { heading, from } = text.views[XBridgeWidgetViews.BRIDGE_WALLET_SELECTION];

  const [fromWalletDrawerOpen, setFromWalletDrawerOpen] = useState(false);
  const [fromNetworkDrawerOpen, setFromNetworkDrawerOpen] = useState(false);

  const [localWeb3Provider, setLocalWeb3Provider] = useState<Web3Provider>();
  const [fromNetwork, setFromNetwork] = useState<ChainId>();

  const isFromWalletAndNetworkSelected = localWeb3Provider !== undefined && fromNetwork !== undefined;

  async function handleWalletConnection(walletProviderName: WalletProviderName) {
    let provider;
    try {
      const createResult = await checkout.createProvider({ walletProviderName });
      provider = createResult.provider;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to create ${walletProviderName} provider`);
    }

    // check if connected
    let connected = false;
    try {
      const { isConnected } = await checkout.checkIsWalletConnected({ provider });
      connected = isConnected;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('failed to check connection');
      throw err;
    }

    if (!connected) {
      // try to connect
      try {
        const { provider: connectedProvider } = await checkout.connect({ provider });
        provider = connectedProvider;
        connected = true;
      } catch (err: any) {
        if (err.type === CheckoutErrorType.USER_REJECTED_REQUEST_ERROR) {
          // eslint-disable-next-line no-console
          console.error('user rejected request');
        }
      }
    }

    if (connected) {
      setLocalWeb3Provider(provider);
      setFromWalletDrawerOpen(false);
      setTimeout(() => setFromNetworkDrawerOpen(true), 500);
    }
  }

  const handleNetworkSelection = useCallback(
    async (chainId: ChainId) => {
      if (!localWeb3Provider) return;
      const currentNetwork = await localWeb3Provider?.getNetwork();
      if (currentNetwork?.chainId === chainId) {
        setFromNetworkDrawerOpen(false);
        setFromNetwork(chainId);
        return;
      }

      try {
        const switchNetwork = await checkout.switchNetwork({ provider: localWeb3Provider, chainId });
        setLocalWeb3Provider(switchNetwork.provider);
        setFromNetworkDrawerOpen(false);
        setFromNetwork(switchNetwork.network.chainId);
      } catch (err) {
        console.error(err);
      }
    },
    [localWeb3Provider],
  );

  return (
    <Box sx={brigdeWalletWrapperStyles}>
      <Heading
        testId={`${testId}-heading`}
        size="small"
        weight="regular"
        sx={{ paddingTop: 'base.spacing.x10', paddingBottom: 'base.spacing.x4' }}
      >
        {heading}
      </Heading>

      {!isFromWalletAndNetworkSelected && (
      <>
        {/** From Wallet Selector */}
        <Heading testId="" size="xSmall" sx={{ paddingBottom: 'base.spacing.x2' }}>{from.heading}</Heading>
        <BottomSheet
          headerBarTitle={from.walletSelectorHeading}
          size="full"
          onCloseBottomSheet={() => setFromWalletDrawerOpen(false)}
          visible={fromWalletDrawerOpen}
        >
          <BottomSheet.Target>
            <FormControlWrapper
              testId={`${testId}-from-select-form-control`}
              textAlign="left"
            >
              <Select
                defaultLabel={from.selectDefaultText}
                size="large"
                targetClickOveride={() => setFromWalletDrawerOpen(true)}
              />
            </FormControlWrapper>
          </BottomSheet.Target>
          <BottomSheet.Content>
            <BridgeWalletItem
              key={WalletProviderName.METAMASK}
              walletProviderName={WalletProviderName.METAMASK}
              onWalletClick={(name) => handleWalletConnection(name)}
            />
            {checkout.passport && (
            <BridgeWalletItem
              key={WalletProviderName.PASSPORT}
              walletProviderName={WalletProviderName.PASSPORT}
              onWalletClick={(name) => handleWalletConnection(name)}
            />
            )}
          </BottomSheet.Content>
        </BottomSheet>
      </>
      )}

      {/**
       * From Network Selector.
       * This must be kept outside of the conditional
       * render so it can close properly on network
       * selection success.
       */}
      <BottomSheet
        headerBarTitle={from.networkSelectorHeading}
        size="full"
        onCloseBottomSheet={() => setFromNetworkDrawerOpen(false)}
        visible={fromNetworkDrawerOpen}
      >
        <BottomSheet.Content>
          <BridgeNetworkItem
            key={ChainName.IMTBL_ZKEVM_TESTNET}
            chainName={ChainName.IMTBL_ZKEVM_TESTNET}
            onNetworkClick={handleNetworkSelection}
            chainId={ChainId.IMTBL_ZKEVM_TESTNET}
          />
          <BridgeNetworkItem
            key={ChainName.SEPOLIA}
            chainName={ChainName.SEPOLIA}
            onNetworkClick={handleNetworkSelection}
            chainId={ChainId.SEPOLIA}
          />
        </BottomSheet.Content>
      </BottomSheet>

      {isFromWalletAndNetworkSelected && (
        <Box>
          <Heading>You have chosen wisely</Heading>
        </Box>
      )}

    </Box>
  );
}
