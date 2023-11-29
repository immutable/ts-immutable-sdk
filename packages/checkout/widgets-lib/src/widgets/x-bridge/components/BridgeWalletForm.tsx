import {
  BottomSheet,
  Box,
  Button,
  Heading,
} from '@biom3/react';
import { text } from 'resources/text/textConfig';
import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
import {
  useCallback, useContext, useMemo, useState,
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
import { bridgeHeadingStyles, brigdeWalletWrapperStyles } from './BridgeWalletFormStyles';
import { XBridgeContext } from '../context/XBridgeContext';
import { BridgeNetworkItem } from './BridgeNetworkItem';
import { WalletNetworkButton } from './WalletNetworkButton';
import { WalletSelector } from './WalletSelector';

const testId = 'bridge-wallet-form';

export function BridgeWalletForm() {
  const { bridgeState: { checkout } } = useContext(XBridgeContext);
  const {
    heading, from, to, submitButton,
  } = text.views[XBridgeWidgetViews.BRIDGE_WALLET_SELECTION];

  // calculating l1/l2 chains to work with based on Checkout environment
  const l1NetworkChainId = getL1ChainId(checkout.config);
  const l1NetworkName = getChainNameById(l1NetworkChainId);
  const imtblZkEvmNetworkChainId = getL2ChainId(checkout.config);
  const imtblZkEvmNetworkName = getChainNameById(imtblZkEvmNetworkChainId);

  /** From wallet and from network local state */
  const [fromWalletDrawerOpen, setFromWalletDrawerOpen] = useState(false);
  const [fromNetworkDrawerOpen, setFromNetworkDrawerOpen] = useState(false);
  const [fromWalletWeb3Provider, setFromWalletWeb3Provider] = useState<Web3Provider | null>();
  const [fromNetwork, setFromNetwork] = useState<ChainId | null>();

  /** To wallet local state */
  const [toWalletDrawerOpen, setToWalletDrawerOpen] = useState(false);
  const [toWalletWeb3Provider, setToWalletWeb3Provider] = useState<Web3Provider | null>();
  const [toNetwork, setToNetwork] = useState<ChainId | null>();

  /* Derived state */
  const isFromWalletAndNetworkSelected = fromWalletWeb3Provider && fromNetwork;
  const isToWalletAndNetworkSelected = toWalletWeb3Provider && toNetwork;
  const fromWalletProviderName = useMemo(() => {
    if (!fromWalletWeb3Provider) return null;
    return isPassportProvider(fromWalletWeb3Provider)
      ? WalletProviderName.PASSPORT
      : WalletProviderName.METAMASK;
  }, [fromWalletWeb3Provider]);

  const toWalletProviderName = useMemo(() => {
    if (!fromWalletWeb3Provider) return null;
    return isPassportProvider(toWalletWeb3Provider)
      ? WalletProviderName.PASSPORT
      : WalletProviderName.METAMASK;
  }, [toWalletWeb3Provider]);

  const fromWalletSelectorOptions = useMemo(() => {
    const options = [WalletProviderName.METAMASK];
    if (checkout.passport) {
      options.push(WalletProviderName.PASSPORT);
    }
    return options;
  }, [checkout]);

  const toWalletSelectorOptions = useMemo(() => {
    const options = [WalletProviderName.METAMASK];

    if (checkout.passport
      && fromNetwork === l1NetworkChainId
      && fromWalletProviderName === WalletProviderName.METAMASK) {
      options.push(WalletProviderName.PASSPORT);
    }
    return options;
  }, [checkout, fromNetwork, fromWalletProviderName]);

  /* --------------------------- */
  /* --- Handling selections --- */
  /* --------------------------- */
  function clearToWalletSelections() {
    setToWalletWeb3Provider(null);
    setToNetwork(null);
  }

  const handleFromWalletConnection = useCallback(async (walletProviderName: WalletProviderName) => {
    if (fromWalletProviderName === walletProviderName) {
      setFromWalletDrawerOpen(false);
      return;
    }

    clearToWalletSelections();
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
      setFromWalletWeb3Provider(provider);

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
      setFromNetwork(null);

      setFromWalletDrawerOpen(false);
      setTimeout(() => setFromNetworkDrawerOpen(true), 500);
    }
  }, [fromWalletProviderName]);

  const handleFromNetworkSelection = useCallback(
    async (chainId: ChainId) => {
      if (!fromWalletWeb3Provider) return;

      if (fromNetwork === chainId) {
        setFromNetworkDrawerOpen(false);
        return;
      }

      clearToWalletSelections();

      if (isPassportProvider(fromWalletWeb3Provider)) {
        setFromNetworkDrawerOpen(false);
        setFromNetwork(chainId);
        return;
      }

      const currentNetwork = await fromWalletWeb3Provider?.getNetwork();
      if (currentNetwork?.chainId === chainId) {
        setFromNetworkDrawerOpen(false);
        setFromNetwork(chainId);
        return;
      }

      try {
        const switchNetwork = await checkout.switchNetwork({ provider: fromWalletWeb3Provider, chainId });
        setFromWalletWeb3Provider(switchNetwork.provider);
        setFromNetworkDrawerOpen(false);
        setFromNetwork(switchNetwork.network.chainId);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
      }
    },
    [fromWalletWeb3Provider],
  );

  const handleToWalletSelection = useCallback(async (selectedToWalletProviderName: WalletProviderName) => {
    if (fromWalletProviderName === selectedToWalletProviderName) {
      // if same from wallet and to wallet, just use the existing fromWalletLocalWeb3Provider
      setToWalletWeb3Provider(fromWalletWeb3Provider);
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
            // don't set anything if user rejects
            return;
          }
          // eslint-disable-next-line no-console
          console.error(err);
        }
      }

      setToWalletWeb3Provider(toWalletProvider);
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

      <Heading size="xSmall" sx={{ paddingBottom: 'base.spacing.x2' }}>{from.heading}</Heading>
      {/* Show the from wallet target (select box) if no selections have been made yet */}
      <WalletSelector
        testId={testId}
        type="from"
        showWalletSelectorTarget={!isFromWalletAndNetworkSelected}
        walletOptions={fromWalletSelectorOptions}
        showDrawer={fromWalletDrawerOpen}
        setShowDrawer={setFromWalletDrawerOpen}
        onWalletItemClick={handleFromWalletConnection}
      />

      {/* From selections have been made */}
      {isFromWalletAndNetworkSelected && fromWalletProviderName && (
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

          <Box>
            <Heading size="xSmall" sx={{ paddingBottom: 'base.spacing.x2' }}>{to.heading}</Heading>
            <WalletSelector
              testId={testId}
              type="to"
              showWalletSelectorTarget={!isToWalletAndNetworkSelected}
              walletOptions={toWalletSelectorOptions}
              showDrawer={toWalletDrawerOpen}
              setShowDrawer={setToWalletDrawerOpen}
              onWalletItemClick={handleToWalletSelection}
            />
          </Box>
        </Box>
      )}

      {/** From Network Selector, we programatically open this so there is no target */}
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

      {/* To wallet selection has been made  */}
      {isToWalletAndNetworkSelected && toWalletProviderName && (
        <Box sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
        >
          <WalletNetworkButton
            testId={testId}
            walletName={toWalletProviderName}
            walletAddress="0x1234...4321"
            chainId={toNetwork!}
            disableNetworkButton
            onWalletClick={() => {
              setToWalletDrawerOpen(true);
            }}
            // eslint-disable-next-line no-console
            onNetworkClick={() => {}}
          />
          <Button testId={`${testId}-submit-button`} size="large">{submitButton.text}</Button>
        </Box>
      )}
    </Box>
  );
}
