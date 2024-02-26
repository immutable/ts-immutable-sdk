import {
  Drawer, Box, Button, Heading,
} from '@biom3/react';
import { BridgeWidgetViews } from 'context/view-context/BridgeViewContextTypes';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { WalletProviderName, ChainId } from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import {
  createAndConnectToProvider,
  getWalletProviderNameByProvider,
  isMetaMaskProvider,
  isPassportProvider,
} from 'lib/providerUtils';
import { getL1ChainId, getL2ChainId } from 'lib';
import { getChainNameById } from 'lib/chains';
import { ViewActions, ViewContext } from 'context/view-context/ViewContext';
import { abbreviateAddress } from 'lib/addressUtils';
import {
  UserJourney,
  useAnalytics,
} from 'context/analytics-provider/SegmentAnalyticsProvider';
import { useTranslation } from 'react-i18next';
import { useWalletConnect } from 'lib/hooks/useWalletConnect';
import {
  bridgeHeadingStyles,
  brigdeWalletWrapperStyles,
  submitButtonWrapperStyles,
} from './WalletAndNetworkSelectorStyles';
import { BridgeActions, BridgeContext } from '../context/BridgeContext';
import { NetworkItem } from './NetworkItem';
import { WalletNetworkButton } from './WalletNetworkButton';
import { WalletDrawer } from './WalletDrawer';

const testId = 'wallet-network-selector';

export function WalletAndNetworkSelector() {
  const { t } = useTranslation();
  const {
    bridgeState: { checkout, from, to },
    bridgeDispatch,
  } = useContext(BridgeContext);
  const { viewDispatch } = useContext(ViewContext);

  const { track } = useAnalytics();

  // calculating l1/l2 chains to work with based on Checkout environment
  const l1NetworkChainId = getL1ChainId(checkout.config);
  const l1NetworkName = getChainNameById(l1NetworkChainId);
  const imtblZkEvmNetworkChainId = getL2ChainId(checkout.config);
  const imtblZkEvmNetworkName = getChainNameById(imtblZkEvmNetworkChainId);

  const passportCache = useRef<Web3Provider>();

  /** WalletConnect */
  const { isWalletConnectEnabled, openWalletConnectModal } = useWalletConnect({
    checkout,
  });

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
    return getWalletProviderNameByProvider(fromWalletWeb3Provider);
  }, [fromWalletWeb3Provider]);

  const toWalletProviderName = useMemo(() => {
    if (!toWalletWeb3Provider) return null;
    return getWalletProviderNameByProvider(toWalletWeb3Provider);
  }, [toWalletWeb3Provider]);

  const fromWalletSelectorOptions = useMemo(() => {
    const options = [WalletProviderName.METAMASK.toString()];
    if (checkout.passport) {
      options.push(WalletProviderName.PASSPORT.toString());
    }
    if (isWalletConnectEnabled) {
      options.push('walletconnect');
    }
    return options;
  }, [checkout, isWalletConnectEnabled]);

  const toWalletSelectorOptions = useMemo(() => {
    const options = [WalletProviderName.METAMASK.toString()];

    if (checkout.passport && fromNetwork === l1NetworkChainId) {
      options.push(WalletProviderName.PASSPORT.toString());
    }
    if (isWalletConnectEnabled) {
      options.push('walletconnect');
    }
    return options;
  }, [checkout, fromNetwork, fromWalletProviderName, isWalletConnectEnabled]);

  useEffect(() => {
    if (!from || !to) return;

    if (fromWalletAddress !== from?.walletAddress) {
      track({
        userJourney: UserJourney.BRIDGE,
        screen: 'WalletAndNetwork',
        control: 'FromWallet',
        controlType: 'Select',
        extras: {
          walletAddress: from?.walletAddress,
        },
      });
    }

    if (fromNetwork !== from?.network) {
      track({
        userJourney: UserJourney.BRIDGE,
        screen: 'WalletAndNetwork',
        control: 'FromNetwork',
        controlType: 'Select',
        extras: {
          chainId: from?.network,
        },
      });
    }

    if (toWalletAddress !== to?.walletAddress) {
      track({
        userJourney: UserJourney.BRIDGE,
        screen: 'WalletAndNetwork',
        control: 'ToWallet',
        controlType: 'Select',
        extras: {
          walletAddress: to?.walletAddress,
        },
      });
    }

    if (toNetwork !== to?.network) {
      track({
        userJourney: UserJourney.BRIDGE,
        screen: 'WalletAndNetwork',
        control: 'ToNetwork',
        controlType: 'Select',
        extras: {
          chainId: to?.network,
        },
      });
    }

    // add local state from context values
    // if user has clicked back button
    setFromWalletWeb3Provider(from.web3Provider);
    setFromWalletAddress(from.walletAddress.toLowerCase());
    setFromNetwork(from.network);

    setToWalletWeb3Provider(to.web3Provider);
    setToWalletAddress(to.walletAddress.toLowerCase());
    setToNetwork(to.network);

    bridgeDispatch({
      payload: {
        type: BridgeActions.SET_WALLETS_AND_NETWORKS,
        from: null,
        to: null,
      },
    });
  }, [from, to]);

  const createProviderAndConnect = useCallback(
    async (walletProviderName: string): Promise<Web3Provider | undefined> => {
      let web3Provider: Web3Provider;
      try {
        web3Provider = await createAndConnectToProvider(
          checkout,
          walletProviderName as WalletProviderName,
        );
        if (walletProviderName === WalletProviderName.PASSPORT.toString()) {
          passportCache.current = web3Provider;
        }
        return web3Provider;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        throw error;
      }
    },
    [checkout],
  );

  function clearToWalletSelections() {
    setToWalletWeb3Provider(null);
    setToNetwork(null);
  }

  /* --------------------------- */
  /* --- Handling selections --- */
  /* --------------------------- */

  const handleFromWalletConnectionSuccess = async (provider: Web3Provider) => {
    setFromWalletWeb3Provider(provider);
    const address = await provider!.getSigner().getAddress();
    setFromWalletAddress(address.toLowerCase());

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
  };

  const handleFromWalletConnection = useCallback(
    async (walletProviderName: string) => {
      clearToWalletSelections();
      let provider;
      if (
        walletProviderName === WalletProviderName.PASSPORT.toString()
        && passportCache.current
      ) {
        provider = passportCache.current;
        await handleFromWalletConnectionSuccess(provider);
        return;
      }
      if (!provider) {
        try {
          if (walletProviderName === 'walletconnect') {
            await openWalletConnectModal({
              connectCallback: (ethereumProvider) => {
                handleFromWalletConnectionSuccess(
                  new Web3Provider(ethereumProvider),
                );
              },
              restoreSession: true,
            });
          } else {
            provider = await createProviderAndConnect(
              walletProviderName as WalletProviderName,
            );
            await handleFromWalletConnectionSuccess(provider);
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error);
        }
      }
    },
    [fromWalletProviderName, passportCache.current, openWalletConnectModal],
  );

  const handleFromNetworkSelection = useCallback(
    async (chainId: ChainId) => {
      if (!fromWalletWeb3Provider) return;

      clearToWalletSelections();
      setFromNetworkDrawerOpen(false);
      setFromNetwork(chainId);

      // const currentNetwork = await fromWalletWeb3Provider?.getNetwork();
      // if (currentNetwork?.chainId === chainId) {
      //   setFromNetworkDrawerOpen(false);
      //   setFromNetwork(chainId);
      //   return;
      // }

      // let switchNetwork;
      // try {
      //   switchNetwork = await checkout.switchNetwork({
      //     provider: fromWalletWeb3Provider,
      //     chainId,
      //   });
      //   setFromWalletWeb3Provider(switchNetwork.provider);
      //   setFromNetworkDrawerOpen(false);
      //   setFromNetwork(switchNetwork.network.chainId);
      // } catch (err) {
      //   // eslint-disable-next-line no-console
      //   console.error(err);
      // }
    },
    [checkout, fromWalletWeb3Provider],
  );

  const handleSettingToNetwork = useCallback(() => {
    // toNetwork is always the opposite of fromNetwork
    const theToNetwork = fromNetwork === l1NetworkChainId
      ? imtblZkEvmNetworkChainId
      : l1NetworkChainId;
    setToNetwork(theToNetwork);
    setToWalletDrawerOpen(false);
  }, [fromNetwork]);

  const handleWalletConnectToWalletConnection = useCallback(
    (provider: Web3Provider) => {
      setToWalletWeb3Provider(provider);
      provider!
        .getSigner()
        .getAddress()
        .then((address) => {
          setToWalletAddress(address.toLowerCase());
          handleSettingToNetwork();
        });
    },
    [handleSettingToNetwork],
  );

  const handleToWalletSelection = useCallback(
    async (selectedToWalletProviderName: WalletProviderName | string) => {
      if (fromWalletProviderName === selectedToWalletProviderName) {
        // if same from wallet and to wallet, just use the existing fromWalletLocalWeb3Provider
        setToWalletWeb3Provider(fromWalletWeb3Provider);
        const address = await fromWalletWeb3Provider!.getSigner().getAddress();
        setToWalletAddress(address.toLowerCase());
        handleSettingToNetwork();
        return;
      }

      let toWalletProvider;
      try {
        if (selectedToWalletProviderName === 'walletconnect') {
          await openWalletConnectModal({
            connectCallback: (ethereumProvider) => {
              const newProvider = new Web3Provider(ethereumProvider);
              handleWalletConnectToWalletConnection(newProvider);
              handleSettingToNetwork();
            },
          });
        } else {
          if (
            selectedToWalletProviderName
              === WalletProviderName.PASSPORT.toString()
            && passportCache.current
          ) {
            toWalletProvider = passportCache.current;
          } else {
            toWalletProvider = await createProviderAndConnect(
              selectedToWalletProviderName as WalletProviderName,
            );
          }
          setToWalletWeb3Provider(toWalletProvider);
          const address = await toWalletProvider!.getSigner().getAddress();
          setToWalletAddress(address.toLowerCase());
          handleSettingToNetwork();
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    },
    [
      fromWalletProviderName,
      fromWalletWeb3Provider,
      passportCache.current,
      handleSettingToNetwork,
      handleWalletConnectToWalletConnection,
    ],
  );

  const handleSubmitDetails = useCallback(() => {
    if (
      !fromWalletWeb3Provider
      || !fromNetwork
      || !toWalletWeb3Provider
      || !toNetwork
    ) return;

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
          walletAddress: fromWalletAddress.toLowerCase(),
          network: fromNetwork,
        },
        to: {
          web3Provider: toWalletWeb3Provider,
          walletAddress: toWalletAddress.toLowerCase(),
          network: toNetwork,
        },
      },
    });

    track({
      userJourney: UserJourney.BRIDGE,
      screen: 'WalletAndNetwork',
      control: 'Next',
      controlType: 'Button',
      extras: {
        fromWalletAddress,
        fromNetwork,
        fromWallet: {
          address: fromWalletAddress,
          isPassportWallet: isPassportProvider(fromWalletWeb3Provider),
          isMetaMask: isMetaMaskProvider(fromWalletWeb3Provider),
        },
        toWalletAddress,
        toNetwork,
        toWallet: {
          address: toWalletAddress,
          isPassportWallet: isPassportProvider(toWalletWeb3Provider),
          isMetaMask: isMetaMaskProvider(toWalletWeb3Provider),
        },
      },
    });

    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: { type: BridgeWidgetViews.BRIDGE_FORM },
      },
    });
  }, [
    fromWalletWeb3Provider,
    fromNetwork,
    fromWalletAddress,
    toWalletWeb3Provider,
    toNetwork,
    toWalletAddress,
  ]);

  return (
    <Box testId={testId} sx={brigdeWalletWrapperStyles}>
      <Heading
        testId={`${testId}-heading`}
        size="small"
        weight="regular"
        sx={bridgeHeadingStyles}
      >
        {t('views.WALLET_NETWORK_SELECTION.heading')}
      </Heading>

      <Heading size="xSmall" sx={{ paddingBottom: 'base.spacing.x2' }}>
        {t('views.WALLET_NETWORK_SELECTION.fromFormInput.heading')}
      </Heading>
      {/* Show the from wallet target (select box) if no selections have been made yet */}
      <WalletDrawer
        testId={`${testId}-from`}
        drawerText={{
          heading: t(
            'views.WALLET_NETWORK_SELECTION.fromFormInput.walletSelectorHeading',
          ),
          defaultText: t(
            'views.WALLET_NETWORK_SELECTION.fromFormInput.selectDefaultText',
          ),
        }}
        showWalletSelectorTarget={!isFromWalletAndNetworkSelected}
        walletOptions={fromWalletSelectorOptions}
        showDrawer={fromWalletDrawerOpen}
        setShowDrawer={setFromWalletDrawerOpen}
        onWalletItemClick={handleFromWalletConnection}
      />

      {/* From selections have been made */}
      {isFromWalletAndNetworkSelected && fromWalletProviderName && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'base.spacing.x10',
          }}
        >
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
            <Heading size="xSmall" sx={{ paddingBottom: 'base.spacing.x2' }}>
              {t('views.WALLET_NETWORK_SELECTION.toFormInput.heading')}
            </Heading>
            <WalletDrawer
              testId={`${testId}-to`}
              drawerText={{
                heading: t(
                  'views.WALLET_NETWORK_SELECTION.toFormInput.walletSelectorHeading',
                ),
                defaultText: t(
                  'views.WALLET_NETWORK_SELECTION.toFormInput.selectDefaultText',
                ),
              }}
              showWalletSelectorTarget={!isToWalletAndNetworkSelected}
              walletOptions={toWalletSelectorOptions}
              showDrawer={toWalletDrawerOpen}
              setShowDrawer={setToWalletDrawerOpen}
              onWalletItemClick={handleToWalletSelection}
            />
          </Box>
        </Box>
      )}

      {/** From Network Selector, we programmatically open this so there is no target */}
      <Drawer
        headerBarTitle={t(
          'views.WALLET_NETWORK_SELECTION.fromFormInput.networkSelectorHeading',
        )}
        size="full"
        onCloseDrawer={() => {
          setFromNetworkDrawerOpen(false);
        }}
        visible={fromNetworkDrawerOpen}
      >
        <Drawer.Content sx={{ paddingX: 'base.spacing.x4' }}>
          <NetworkItem
            key={imtblZkEvmNetworkName}
            testId={testId}
            chainName={imtblZkEvmNetworkName}
            onNetworkClick={handleFromNetworkSelection}
            chainId={imtblZkEvmNetworkChainId}
          />
          {/** Show L1 option for Metamask && Wallet Connect only */}
          {(fromWalletProviderName === WalletProviderName.METAMASK.toString()
            || fromWalletProviderName === 'walletconnect') && (
            <NetworkItem
              key={l1NetworkName}
              testId={testId}
              chainName={l1NetworkName}
              onNetworkClick={handleFromNetworkSelection}
              chainId={l1NetworkChainId}
            />
          )}
        </Drawer.Content>
      </Drawer>

      {/* To wallet selection has been made  */}
      {isToWalletAndNetworkSelected && toWalletProviderName && (
        <Box
          sx={{
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
            onNetworkClick={() => {}}
          />
          <Box sx={submitButtonWrapperStyles}>
            <Button
              testId={`${testId}-submit-button`}
              size="large"
              onClick={handleSubmitDetails}
            >
              {t('views.WALLET_NETWORK_SELECTION.submitButton.text')}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
