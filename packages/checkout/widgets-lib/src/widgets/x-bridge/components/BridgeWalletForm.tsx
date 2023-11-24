import {
  BottomSheet,
  Box,
  Heading,
  Select,
} from '@biom3/react';
import { text } from 'resources/text/textConfig';
import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
import { FormControlWrapper } from 'components/FormComponents/FormControlWrapper/FormControlWrapper';
import {
  useCallback, useContext, useState,
} from 'react';
import {
  WalletProviderName,
  CheckoutErrorType,
  ChainName,
  ChainId,
} from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import { isPassportProvider } from 'lib/providerUtils';
import { brigdeWalletWrapperStyles, walletItemListStyles } from './BridgeWalletFormStyles';
import { XBridgeContext } from '../context/XBridgeContext';
import { BridgeWalletItem } from './BridgeWalletItem';
import { BridgeNetworkItem } from './BridgeNetworkItem';
import { WalletNetworkButton } from './WalletNetworkButton';

const testId = 'bridge-wallet-form';

export function BridgeWalletForm() {
  const { bridgeState: { checkout } } = useContext(XBridgeContext);
  const { heading, from } = text.views[XBridgeWidgetViews.BRIDGE_WALLET_SELECTION];

  const [fromWalletDrawerOpen, setFromWalletDrawerOpen] = useState(false);
  const [fromNetworkDrawerOpen, setFromNetworkDrawerOpen] = useState(false);

  const [localWeb3Provider, setLocalWeb3Provider] = useState<Web3Provider>();
  const [fromNetwork, setFromNetwork] = useState<ChainId>();
  let localWalletProviderName = WalletProviderName.METAMASK;
  if (isPassportProvider(localWeb3Provider)) {
    localWalletProviderName = WalletProviderName.PASSPORT;
  }

  const isFromWalletAndNetworkSelected = localWeb3Provider !== undefined && fromNetwork !== undefined;

  const handleWalletConnection = async (walletProviderName: WalletProviderName) => {
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
      console.error(err);
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
          console.log('User rejected request');
        }
        // eslint-disable-next-line no-console
        console.error(err);
      }
    }

    if (connected) {
      setLocalWeb3Provider(provider);

      if (isPassportProvider(provider)) {
        /** if Passport skip network selector */
        setFromNetwork(ChainId.IMTBL_ZKEVM_TESTNET); // TODO: handle per environment
        setFromWalletDrawerOpen(false);
        return;
      }

      /**
       * force the selection of network
       * network by clearing the fromNetwork
       */
      setFromNetwork(undefined);

      setFromWalletDrawerOpen(false);
      setTimeout(() => setFromNetworkDrawerOpen(true), 500);
    }
  };

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
        // eslint-disable-next-line no-console
        console.error(err);
      }
    },
    [localWeb3Provider],
  );

  const [walletItemLoading, setWalletItemLoading] = useState(false);
  return (
    <Box testId={testId} sx={brigdeWalletWrapperStyles}>
      <Heading
        testId={`${testId}-heading`}
        size="small"
        weight="regular"
        sx={{ paddingTop: 'base.spacing.x10', paddingBottom: 'base.spacing.x4' }}
      >
        {heading}
      </Heading>

      <Heading testId="" size="xSmall" sx={{ paddingBottom: 'base.spacing.x2' }}>{from.heading}</Heading>
      {/** From Wallet Selector */}
      <BottomSheet
        headerBarTitle={from.walletSelectorHeading}
        size="full"
        onCloseBottomSheet={() => {
          if (walletItemLoading) return;
          setFromWalletDrawerOpen(false);
        }}
        visible={fromWalletDrawerOpen}
      >
        {/**
         * Only remove BottomSheet Target if we have a localWeb3Provider (wallet)
         * and fromNetwork selected.
         */}
        {!isFromWalletAndNetworkSelected
          && (
          <BottomSheet.Target>
            <FormControlWrapper
              testId={`${testId}-from-wallet-form-control`}
              textAlign="left"
            >
              <Select
                testId={`${testId}-from-wallet-select`}
                defaultLabel={from.selectDefaultText}
                size="large"
                targetClickOveride={() => setFromWalletDrawerOpen(true)}
              />
            </FormControlWrapper>
          </BottomSheet.Target>
          )}
        <BottomSheet.Content sx={walletItemListStyles}>
          <BridgeWalletItem
            key={WalletProviderName.METAMASK}
            testId={testId}
            loading={walletItemLoading}
            setLoading={setWalletItemLoading}
            walletProviderName={WalletProviderName.METAMASK}
            onWalletClick={(name) => handleWalletConnection(name)}
          />
          {checkout.passport && (
            <BridgeWalletItem
              key={WalletProviderName.PASSPORT}
              testId={testId}
              loading={walletItemLoading}
              setLoading={setWalletItemLoading}
              walletProviderName={WalletProviderName.PASSPORT}
              onWalletClick={async (name) => await handleWalletConnection(name)}
            />
          )}
        </BottomSheet.Content>
      </BottomSheet>

      {/**
       * From Network Selector.
       * This must be kept outside of the conditional
       * render so it can close properly on network
       * selection success.
       */}
      <BottomSheet
        headerBarTitle={from.networkSelectorHeading}
        size="full"
        onCloseBottomSheet={() => {
          setFromNetworkDrawerOpen(false);
        }}
        visible={fromNetworkDrawerOpen}
      >
        <BottomSheet.Content>
          <BridgeNetworkItem
            key={ChainName.IMTBL_ZKEVM_TESTNET}
            testId={testId}
            chainName={ChainName.IMTBL_ZKEVM_TESTNET}
            onNetworkClick={handleNetworkSelection}
            chainId={ChainId.IMTBL_ZKEVM_TESTNET}
          />
          {/** Show L1 option for Metamask only */}
          {localWalletProviderName === WalletProviderName.METAMASK && (
          <BridgeNetworkItem
            key={ChainName.SEPOLIA}
            testId={testId}
            chainName={ChainName.SEPOLIA}
            onNetworkClick={handleNetworkSelection}
            chainId={ChainId.SEPOLIA}
          />
          )}

        </BottomSheet.Content>
      </BottomSheet>

      {/**
       * When from wallet and from network are chosen
       * hide the select and show the WalletNetworkButton
       */}
      {isFromWalletAndNetworkSelected && (
        <WalletNetworkButton
          testId={testId}
          walletName={localWalletProviderName}
          walletAddress="0x1234...4321"
          chainId={fromNetwork}
          onWalletClick={() => {
            setFromWalletDrawerOpen(true);
          }}
          onNetworkClick={() => setFromNetworkDrawerOpen(true)}
        />
      )}
    </Box>
  );
}
