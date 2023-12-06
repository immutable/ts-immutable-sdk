import {
  BottomSheet,
  Box,
  Button,
  Heading,
} from '@biom3/react';
import { text } from 'resources/text/textConfig';
import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
import {
  useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import {
  WalletProviderName,
  CheckoutErrorType,
  ChainId,
} from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import { isMetaMaskProvider, isPassportProvider } from 'lib/providerUtils';
import { getL1ChainId, getL2ChainId } from 'lib';
import { getChainNameById } from 'lib/chainName';
import { ViewActions, ViewContext } from 'context/view-context/ViewContext';
import { abbreviateAddress } from 'lib/addressUtils';
import {
  bridgeHeadingStyles,
  brigdeWalletWrapperStyles,
  submitButtonWrapperStyles,
} from './WalletAndNetworkSelectorStyles';
import { BridgeActions, XBridgeContext } from '../context/XBridgeContext';
import { NetworkItem } from './NetworkItem';
import { WalletNetworkButton } from './WalletNetworkButton';
import { WalletDrawer } from './WalletDrawer';

const testId = 'wallet-network-selector';

export function WalletAndNetworkSelector() {
  const { bridgeState: { checkout, from, to }, bridgeDispatch } = useContext(XBridgeContext);
  const { viewDispatch } = useContext(ViewContext);
  const {
    heading, fromFormInput, toFormInput, submitButton,
  } = text.views[XBridgeWidgetViews.WALLET_NETWORK_SELECTION];

  // calculating l1/l2 chains to work with based on Checkout environment
  const l1NetworkChainId = getL1ChainId(checkout.config);
  const l1NetworkName = getChainNameById(l1NetworkChainId);
  const imtblZkEvmNetworkChainId = getL2ChainId(checkout.config);
  const imtblZkEvmNetworkName = getChainNameById(imtblZkEvmNetworkChainId);

  /** provider map - saves on re-creating providers if to/from options are changed */
  const providerCache = useRef(new Map<WalletProviderName, Web3Provider>());

  /** From wallet and from network local state */
  const [fromWalletDrawerOpen, setFromWalletDrawerOpen] = useState(false);
  const [fromNetworkDrawerOpen, setFromNetworkDrawerOpen] = useState(false);
  const [fromWalletWeb3Provider, setFromWalletWeb3Provider] = useState<Web3Provider | null>();
  const [fromNetwork, setFromNetwork] = useState<ChainId | null>();
  const [fromWalletAddress, setFromWalletAddress] = useState<string>('');

  /** To wallet local state */
  const [toWalletDrawerOpen, setToWalletDrawerOpen] = useState(false);
  const [toWalletWeb3Provider, setToWalletWeb3Provider] = useState<Web3Provider | null>();
  const [toNetwork, setToNetwork] = useState<ChainId | null>();
  const [toWalletAddress, setToWalletAddress] = useState<string>('');

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

  useEffect(() => {
    if (!from || !to) return;

    // add local state from context values
    // if user has clicked back button
    setFromWalletWeb3Provider(from.web3Provider);
    setFromWalletAddress(from.walletAddress);
    setFromNetwork(from.network);
    setToWalletWeb3Provider(to.web3Provider);
    setToWalletAddress(to.walletAddress);
    setToNetwork(to.network);

    bridgeDispatch({
      payload: {
        type: BridgeActions.SET_WALLETS_AND_NETWORKS,
        from: null,
        to: null,
      },
    });
  }, [from, to]);

  async function createProviderAndConnect(walletProviderName: WalletProviderName): Promise<Web3Provider | undefined> {
    let provider;
    try {
      const createResult = await checkout.createProvider({ walletProviderName });
      provider = createResult.provider;
      providerCache.current.set(walletProviderName, provider);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to create ${walletProviderName} provider`);
      throw error;
    }

    let connected = false;
    try {
      const { isConnected } = await checkout.checkIsWalletConnected({ provider });
      connected = isConnected;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      throw error;
    }

    if (!connected) {
      try {
        const { provider: connectedProvider } = await checkout.connect({ provider });
        provider = connectedProvider;
        connected = true;
      } catch (error: any) {
        if (error.type === CheckoutErrorType.USER_REJECTED_REQUEST_ERROR) {
          // eslint-disable-next-line no-console
          console.log('User rejected request');
        }
        // eslint-disable-next-line no-console
        console.error(error);
        throw error;
      }
    }

    return provider;
  }

  function clearToWalletSelections() {
    setToWalletWeb3Provider(null);
    setToNetwork(null);
  }

  /* --------------------------- */
  /* --- Handling selections --- */
  /* --------------------------- */
  const handleFromWalletConnection = useCallback(async (walletProviderName: WalletProviderName) => {
    if (fromWalletProviderName === walletProviderName) {
      setFromWalletDrawerOpen(false);
      return;
    }

    clearToWalletSelections();
    let provider = providerCache.current.get(walletProviderName);
    if (!provider) {
      try {
        provider = await createProviderAndConnect(walletProviderName);
      } catch (error) {
        return;
      }
    }

    setFromWalletWeb3Provider(provider);
    const address = await provider!.getSigner().getAddress();
    setFromWalletAddress(address);

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
  }, [fromWalletProviderName, providerCache.current]);

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
        if (isPassportProvider(switchNetwork.provider)) {
          providerCache.current.set(WalletProviderName.PASSPORT, switchNetwork.provider);
        } else if (isMetaMaskProvider(switchNetwork.provider)) {
          providerCache.current.set(WalletProviderName.METAMASK, switchNetwork.provider);
        }
        setFromWalletWeb3Provider(switchNetwork.provider);
        setFromNetworkDrawerOpen(false);
        setFromNetwork(switchNetwork.network.chainId);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
      }
    },
    [
      checkout,
      fromWalletWeb3Provider,
      fromWalletProviderName,
      providerCache.current,
      fromNetwork,
    ],
  );

  const handleToWalletSelection = useCallback(async (selectedToWalletProviderName: WalletProviderName) => {
    if (fromWalletProviderName === selectedToWalletProviderName) {
      // if same from wallet and to wallet, just use the existing fromWalletLocalWeb3Provider
      setToWalletWeb3Provider(fromWalletWeb3Provider);
      const address = await fromWalletWeb3Provider!.getSigner().getAddress();
      setToWalletAddress(address);
    } else {
      let toWalletProvider = providerCache.current.get(selectedToWalletProviderName);
      if (!toWalletProvider) {
        try {
          toWalletProvider = await createProviderAndConnect(selectedToWalletProviderName);
        } catch (error) {
          return;
        }
      }
      setToWalletWeb3Provider(toWalletProvider);
      const address = await toWalletProvider!.getSigner().getAddress();
      setToWalletAddress(address);
    }

    // toNetwork is always the opposite of fromNetwork
    const theToNetwork = fromNetwork === l1NetworkChainId ? imtblZkEvmNetworkChainId : l1NetworkChainId;
    setToNetwork(theToNetwork);

    setToWalletDrawerOpen(false);
  }, [fromWalletProviderName, fromNetwork, fromWalletWeb3Provider, providerCache.current]);

  const handleSubmitDetails = useCallback(
    () => {
      if (!fromWalletWeb3Provider || !fromNetwork || !toWalletWeb3Provider || !toNetwork) return;

      bridgeDispatch({
        payload: {
          type: BridgeActions.SET_PROVIDER,
          web3Provider: fromWalletWeb3Provider,
        },
      });

      bridgeDispatch({
        payload: {
          type: BridgeActions.SET_TOKEN_BALANCES,
          tokenBalances: [],
        },
      });

      bridgeDispatch({
        payload: {
          type: BridgeActions.SET_ALLOWED_TOKENS,
          allowedTokens: [],
        },
      });

      bridgeDispatch({
        payload: {
          type: BridgeActions.SET_WALLETS_AND_NETWORKS,
          from: {
            web3Provider: fromWalletWeb3Provider,
            walletAddress: fromWalletAddress,
            network: fromNetwork,
          },
          to: {
            web3Provider: toWalletWeb3Provider,
            walletAddress: toWalletAddress,
            network: toNetwork,
          },
        },
      });

      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: { type: XBridgeWidgetViews.BRIDGE_FORM },
        },
      });
    },
    [
      fromWalletWeb3Provider,
      fromNetwork,
      fromWalletAddress,
      toWalletWeb3Provider,
      toNetwork,
      toWalletAddress,
    ],
  );

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

      <Heading size="xSmall" sx={{ paddingBottom: 'base.spacing.x2' }}>{fromFormInput.heading}</Heading>
      {/* Show the from wallet target (select box) if no selections have been made yet */}
      <WalletDrawer
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
            walletAddress={abbreviateAddress(fromWalletAddress)}
            chainId={fromNetwork}
            onWalletClick={() => {
              setFromWalletDrawerOpen(true);
            }}
            onNetworkClick={() => setFromNetworkDrawerOpen(true)}
          />

          <Box>
            <Heading size="xSmall" sx={{ paddingBottom: 'base.spacing.x2' }}>{toFormInput.heading}</Heading>
            <WalletDrawer
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
        headerBarTitle={fromFormInput.networkSelectorHeading}
        size="full"
        onCloseBottomSheet={() => {
          setFromNetworkDrawerOpen(false);
        }}
        visible={fromNetworkDrawerOpen}
      >
        <BottomSheet.Content>
          <NetworkItem
            key={imtblZkEvmNetworkName}
            testId={testId}
            chainName={imtblZkEvmNetworkName}
            onNetworkClick={handleFromNetworkSelection}
            chainId={imtblZkEvmNetworkChainId}
          />
          {/** Show L1 option for Metamask only */}
          {fromWalletProviderName === WalletProviderName.METAMASK && (
            <NetworkItem
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
            walletAddress={abbreviateAddress(toWalletAddress)}
            chainId={toNetwork!}
            disableNetworkButton
            onWalletClick={() => {
              setToWalletDrawerOpen(true);
            }}
            // eslint-disable-next-line no-console
            onNetworkClick={() => { }}
          />
          <Box sx={submitButtonWrapperStyles}>
            <Button
              testId={`${testId}-submit-button`}
              size="large"
              onClick={handleSubmitDetails}
            >
              {submitButton.text}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
