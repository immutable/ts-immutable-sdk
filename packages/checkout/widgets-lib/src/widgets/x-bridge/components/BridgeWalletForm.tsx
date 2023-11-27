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
  ChainId,
} from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import { isPassportProvider } from 'lib/providerUtils';
import { getL1ChainId, getL2ChainId } from 'lib';
import { getChainNameById } from 'lib/chainName';
import { bridgeHeadingStyles, brigdeWalletWrapperStyles, walletItemListStyles } from './BridgeWalletFormStyles';
import { XBridgeContext } from '../context/XBridgeContext';
import { BridgeWalletItem } from './BridgeWalletItem';
import { BridgeNetworkItem } from './BridgeNetworkItem';
import { WalletNetworkButton } from './WalletNetworkButton';

const testId = 'bridge-wallet-form';

export function BridgeWalletForm() {
  const { bridgeState: { checkout } } = useContext(XBridgeContext);
  const { heading, from, to } = text.views[XBridgeWidgetViews.BRIDGE_WALLET_SELECTION];

  // calculating l1/l2 chains to work with based on Checkout environment
  const l1NetworkChainId = getL1ChainId(checkout.config);
  const l1NetworkName = getChainNameById(l1NetworkChainId);
  const imtblZkEvmNetworkChainId = getL2ChainId(checkout.config);
  const imtblZkEvmNetworkName = getChainNameById(imtblZkEvmNetworkChainId);

  /** From wallet and from network local state */
  const [fromWalletDrawerOpen, setFromWalletDrawerOpen] = useState(false);
  const [fromNetworkDrawerOpen, setFromNetworkDrawerOpen] = useState(false);
  const [fromWalletLocalWeb3Provider, setFromWalletLocalWeb3Provider] = useState<Web3Provider>();
  const [fromNetwork, setFromNetwork] = useState<ChainId>();

  /** To wallet local state */
  const [toWalletDrawerOpen, setToWalletDrawerOpen] = useState(false);
  const [toWalletLocalWeb3Provider, setToWalletLocalWeb3Provider] = useState<Web3Provider>();
  const [toNetwork, setToNetwork] = useState<ChainId>();

  // state to show that a wallet item has been clicked and is loading
  // disable all wallet buttons while this is loading
  const [walletItemLoading, setWalletItemLoading] = useState(false);

  /* Derived state */
  const isFromWalletAndNetworkSelected = fromWalletLocalWeb3Provider !== undefined && fromNetwork !== undefined;
  const isToWalletAndNetworkSelected = toWalletLocalWeb3Provider !== undefined && toNetwork !== undefined;
  const fromWalletProviderName = isPassportProvider(fromWalletLocalWeb3Provider)
    ? WalletProviderName.PASSPORT
    : WalletProviderName.METAMASK;
  const toWalletProviderName = isPassportProvider(toWalletLocalWeb3Provider)
    ? WalletProviderName.PASSPORT
    : WalletProviderName.METAMASK;

  /* --------------------------- */
  /* --- Handling selections --- */
  /* --------------------------- */
  const handleFromWalletConnection = async (walletProviderName: WalletProviderName) => {
    setToWalletLocalWeb3Provider(undefined);
    setToNetwork(undefined);

    let provider;
    try {
      const createResult = await checkout.createProvider({ walletProviderName });
      provider = createResult.provider;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to create ${walletProviderName} provider`);
    }

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
      setFromWalletLocalWeb3Provider(provider);

      /** if Passport skip from network selector and default to zkEVM */
      if (isPassportProvider(provider)) {
        setFromNetwork(imtblZkEvmNetworkChainId);
        setFromWalletDrawerOpen(false);
        return;
      }

      /**
       * Force the selection of network
       * by clearing the fromNetwork
       * and opening the network drawer
       */
      setFromNetwork(undefined);

      setFromWalletDrawerOpen(false);
      setTimeout(() => setFromNetworkDrawerOpen(true), 500);
    }
  };

  const handleFromNetworkSelection = useCallback(
    async (chainId: ChainId) => {
      if (!fromWalletLocalWeb3Provider) return;
      setToWalletLocalWeb3Provider(undefined);
      setToNetwork(undefined);

      const currentNetwork = await fromWalletLocalWeb3Provider?.getNetwork();
      if (currentNetwork?.chainId === chainId) {
        setFromNetworkDrawerOpen(false);
        setFromNetwork(chainId);
        return;
      }

      try {
        const switchNetwork = await checkout.switchNetwork({ provider: fromWalletLocalWeb3Provider, chainId });
        setFromWalletLocalWeb3Provider(switchNetwork.provider);
        setFromNetworkDrawerOpen(false);
        setFromNetwork(switchNetwork.network.chainId);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
      }
    },
    [fromWalletLocalWeb3Provider],
  );

  const handleToWalletSelection = useCallback(async (selectedToWalletProviderName: WalletProviderName) => {
    if (fromWalletProviderName === selectedToWalletProviderName) {
      // if same from wallet and to wallet, just use the existing fromWalletLocalWeb3Provider
      setToWalletLocalWeb3Provider(fromWalletLocalWeb3Provider);
    } else {
      // from wallet and to wallet selections are different (e.g from MM to PP)
      // make connection to separate wallet provider to use for the to address
      let toWalletProvider;
      try {
        const createResult = await checkout.createProvider({ walletProviderName: selectedToWalletProviderName });
        toWalletProvider = createResult.provider;
      } catch (error) {
      // eslint-disable-next-line no-console
        console.error(`Failed to create ${selectedToWalletProviderName} provider`);
      }

      let connected = false;
      try {
        const { isConnected } = await checkout.checkIsWalletConnected({ provider: toWalletProvider });
        connected = isConnected;
      } catch (err) {
      // eslint-disable-next-line no-console
        console.error(err);
        throw err;
      }

      if (!connected) {
        try {
          const { provider: connectedProvider } = await checkout.connect({ provider: toWalletProvider });
          toWalletProvider = connectedProvider;
          connected = true;
        } catch (err: any) {
          if (err.type === CheckoutErrorType.USER_REJECTED_REQUEST_ERROR) {
          // eslint-disable-next-line no-console
            console.log('User rejected request');
            setWalletItemLoading(false);
            return; // don't set anything if they reject
          }
          // eslint-disable-next-line no-console
          console.error(err);
        }
      }

      setToWalletLocalWeb3Provider(toWalletProvider);
    }

    // toNetwork is always the opposite of fromNetwork
    const theToNetwork = fromNetwork === l1NetworkChainId ? imtblZkEvmNetworkChainId : l1NetworkChainId;
    setToNetwork(theToNetwork);

    setToWalletDrawerOpen(false);
  }, [fromWalletProviderName, fromNetwork]);

  return (
    <Box testId={testId} sx={brigdeWalletWrapperStyles}>
      <Heading
        testId={`${testId}-heading`}
        size="small"
        weight="regular"
        sx={bridgeHeadingStyles}
      >
        {heading}
      </Heading>

      {/** From Wallet Selector */}
      <Heading testId="" size="xSmall" sx={{ paddingBottom: 'base.spacing.x2' }}>{from.heading}</Heading>
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
            onWalletClick={handleFromWalletConnection}
          />
          {checkout.passport && (
            <BridgeWalletItem
              key={WalletProviderName.PASSPORT}
              testId={testId}
              loading={walletItemLoading}
              setLoading={setWalletItemLoading}
              walletProviderName={WalletProviderName.PASSPORT}
              onWalletClick={handleFromWalletConnection}
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
            key={imtblZkEvmNetworkName}
            testId={testId}
            chainName={imtblZkEvmNetworkName}
            onNetworkClick={handleFromNetworkSelection}
            chainId={imtblZkEvmNetworkChainId}
          />
          {/** Show L1 option for Metamask only */}
          {fromWalletProviderName === WalletProviderName.METAMASK && (
          <BridgeNetworkItem
            key={l1NetworkName}
            testId={testId}
            chainName={l1NetworkName}
            onNetworkClick={handleFromNetworkSelection}
            chainId={l1NetworkChainId}
          />
          )}

        </BottomSheet.Content>
      </BottomSheet>

      {/**
       * When from wallet and from network are chosen
       * hide the select and show the WalletNetworkButton
       */}
      {isFromWalletAndNetworkSelected && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 'base.spacing.x10' }}>
          <WalletNetworkButton
            testId={testId}
            walletName={fromWalletProviderName}
            walletAddress="0x1234...4321"
            chainId={fromNetwork}
            onWalletClick={() => {
              setFromWalletDrawerOpen(true);
            }}
            onNetworkClick={() => setFromNetworkDrawerOpen(true)}
          />

          {/** To Wallet Selector */}
          <Box>
            <Heading testId="" size="xSmall" sx={{ paddingBottom: 'base.spacing.x2' }}>{to.heading}</Heading>
            <BottomSheet
              headerBarTitle={to.walletSelectorHeading}
              size="full"
              onCloseBottomSheet={() => {
                if (walletItemLoading) return;
                setToWalletDrawerOpen(false);
              }}
              visible={toWalletDrawerOpen}
            >
              {!isToWalletAndNetworkSelected && (
              <BottomSheet.Target>
                <FormControlWrapper
                  testId={`${testId}-to-wallet-form-control`}
                  textAlign="left"
                >
                  <Select
                    testId={`${testId}-to-wallet-select`}
                    defaultLabel={to.selectDefaultText}
                    size="large"
                    targetClickOveride={() => setToWalletDrawerOpen(true)}
                  />
                </FormControlWrapper>
              </BottomSheet.Target>
              )}
              <BottomSheet.Content sx={walletItemListStyles}>
                <BridgeWalletItem
                  key={WalletProviderName.METAMASK}
                  testId={`${testId}-to`}
                  loading={walletItemLoading}
                  setLoading={setWalletItemLoading}
                  walletProviderName={WalletProviderName.METAMASK}
                  onWalletClick={handleToWalletSelection}
                />

                {/** conditionally show To Passport option */}
                {checkout.passport
                && fromNetwork === l1NetworkChainId
                && fromWalletProviderName === WalletProviderName.METAMASK && (
                <BridgeWalletItem
                  key={WalletProviderName.PASSPORT}
                  testId={`${testId}-to`}
                  loading={walletItemLoading}
                  setLoading={setWalletItemLoading}
                  walletProviderName={WalletProviderName.PASSPORT}
                  onWalletClick={handleToWalletSelection}
                />
                )}
              </BottomSheet.Content>
            </BottomSheet>
          </Box>
        </Box>
      )}
      {isToWalletAndNetworkSelected && (
      <WalletNetworkButton
        testId={testId}
        walletName={toWalletProviderName}
        walletAddress="0x1234...4321"
        chainId={toNetwork}
        onWalletClick={() => {
          setToWalletDrawerOpen(true);
        }}
        // eslint-disable-next-line no-console
        onNetworkClick={() => console.log('this button currently does nothing...')}
      />
      )}
    </Box>
  );
}
