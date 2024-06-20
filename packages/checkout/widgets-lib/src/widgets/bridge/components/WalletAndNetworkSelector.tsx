import {
  Box,
  Button,
  Drawer,
  Heading,
} from '@biom3/react';
import { BridgeWidgetViews } from 'context/view-context/BridgeViewContextTypes';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ChainId, WalletProviderName, WalletProviderRdns } from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import {
  connectToProvider,
  getWalletProviderNameByProvider,
  isMetaMaskProvider,
  isPassportProvider,
  isWalletConnectProvider,
} from 'lib/provider';
import { getL1ChainId, getL2ChainId } from 'lib';
import { getChainNameById } from 'lib/chains';
import { ViewActions, ViewContext } from 'context/view-context/ViewContext';
import { abbreviateAddress } from 'lib/addressUtils';
import {
  useAnalytics,
  UserJourney,
} from 'context/analytics-provider/SegmentAnalyticsProvider';
import { useTranslation } from 'react-i18next';
import {
  bridgeHeadingStyles,
  brigdeWalletWrapperStyles,
  submitButtonWrapperStyles,
} from './WalletAndNetworkSelectorStyles';
import { BridgeActions, BridgeContext } from '../context/BridgeContext';
import { NetworkItem } from './NetworkItem';
import { WalletNetworkButton } from './WalletNetworkButton';
import { WalletDrawer } from '../../../components/WalletDrawer/WalletDrawer';
import { useInjectedProviders } from '../../../lib/hooks/useInjectedProviders';
import { WalletChangeEvent } from '../../../components/WalletDrawer/WalletDrawerEvents';

const testId = 'wallet-network-selector';

export function WalletAndNetworkSelector() {
  const { t } = useTranslation();
  const {
    bridgeState: { checkout, from, to },
    bridgeDispatch,
  } = useContext(BridgeContext);
  const { viewDispatch } = useContext(ViewContext);
  const { providers } = useInjectedProviders({ checkout });
  const { environment } = checkout.config;

  const { track } = useAnalytics();

  // add default state from context values
  // if user has clicked back button
  const defaultFromWeb3Provider = from?.web3Provider ?? null;
  const defaultFromNetwork = from?.network ?? null;
  const defaultFromWalletAddress = from?.walletAddress?.toLowerCase() ?? '';
  const defaultFromWallet = from ? {
    provider: defaultFromWeb3Provider,
    providerDetail: {
      provider: defaultFromWeb3Provider,
      info: {
        ...from.walletProviderInfo,
      },
    },
  } as unknown as WalletChangeEvent : null;

  const defaultToWeb3Provider = to?.web3Provider ?? null;
  const defaultToNetwork = to?.network ?? null;
  const defaultToWalletAddress = to?.walletAddress?.toLowerCase() ?? '';
  const defaultToWallet = to ? {
    provider: defaultToWeb3Provider,
    providerDetail: {
      provider: defaultToWeb3Provider,
      info: {
        ...to.walletProviderInfo,
      },
    },
  } as unknown as WalletChangeEvent : null;

  // calculating l1/l2 chains to work with based on Checkout environment
  const l1NetworkChainId = getL1ChainId(checkout.config);
  const l1NetworkName = getChainNameById(l1NetworkChainId);
  const imtblZkEvmNetworkChainId = getL2ChainId(checkout.config);
  const imtblZkEvmNetworkName = getChainNameById(imtblZkEvmNetworkChainId);

  /** From wallet and from network local state */
  const [fromWalletDrawerOpen, setFromWalletDrawerOpen] = useState(false);
  const [fromNetworkDrawerOpen, setFromNetworkDrawerOpen] = useState(false);
  const [fromWalletWeb3Provider, setFromWalletWeb3Provider] = useState<Web3Provider | null>(defaultFromWeb3Provider);
  const [fromNetwork, setFromNetwork] = useState<ChainId | null>(defaultFromNetwork);
  const [fromWalletAddress, setFromWalletAddress] = useState<string>(defaultFromWalletAddress);
  const [fromWallet, setFromWallet] = useState<WalletChangeEvent | null>(defaultFromWallet);

  /** To wallet local state */
  const [toNetworkDrawerOpen, setToNetworkDrawerOpen] = useState(false);
  const [toWalletDrawerOpen, setToWalletDrawerOpen] = useState(false);
  const [toWalletWeb3Provider, setToWalletWeb3Provider] = useState<Web3Provider | null>(defaultToWeb3Provider);
  const [toNetwork, setToNetwork] = useState<ChainId | null>(defaultToNetwork);
  const [toWalletAddress, setToWalletAddress] = useState<string>(defaultToWalletAddress);
  const [toWallet, setToWallet] = useState<WalletChangeEvent | null>(defaultToWallet);

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

  const fromWalletSelectorOptions = useMemo(() => providers, [providers]);

  const toWalletSelectorOptions = useMemo(() => (
    providers
      .filter((providerDetail) => (
        providerDetail.info.rdns !== WalletProviderRdns.PASSPORT
        || (providerDetail.info.rdns === WalletProviderRdns.PASSPORT
          && fromWallet?.providerDetail?.info?.rdns !== WalletProviderRdns.PASSPORT)
      ))
  ), [providers, fromNetwork, fromWallet]);

  useEffect(() => {
    if (!from || !to) return;

    bridgeDispatch({
      payload: {
        type: BridgeActions.SET_WALLETS_AND_NETWORKS,
        from: null,
        to: null,
      },
    });
  }, [from, to]);

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

    track({
      userJourney: UserJourney.BRIDGE,
      screen: 'WalletAndNetwork',
      control: 'FromWallet',
      controlType: 'Select',
      extras: {
        walletAddress: address.toLowerCase(),
      },
    });

    /** if Passport skip from network selector and default to zkEVM */
    if (isPassportProvider(provider)) {
      setFromNetwork(imtblZkEvmNetworkChainId);
      setFromWalletDrawerOpen(false);

      track({
        userJourney: UserJourney.BRIDGE,
        screen: 'WalletAndNetwork',
        control: 'FromNetwork',
        controlType: 'Select',
        extras: {
          chainId: imtblZkEvmNetworkChainId,
        },
      });
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
    async (event: WalletChangeEvent) => {
      clearToWalletSelections();
      setFromWallet(event);

      let changeAccount = false;
      if (event.providerDetail.info.rdns === WalletProviderRdns.METAMASK) {
        changeAccount = true;
      }
      const web3Provider = new Web3Provider(event.provider as any);
      const connectedProvider = await connectToProvider(checkout, web3Provider, changeAccount);
      await handleFromWalletConnectionSuccess(connectedProvider);
    },
    [checkout],
  );

  const handleFromNetworkSelection = useCallback(
    async (chainId: ChainId) => {
      if (!fromWalletWeb3Provider) return;

      clearToWalletSelections();
      setFromNetworkDrawerOpen(false);
      setFromNetwork(chainId);

      track({
        userJourney: UserJourney.BRIDGE,
        screen: 'WalletAndNetwork',
        control: 'FromNetwork',
        controlType: 'Select',
        extras: {
          chainId,
        },
      });
    },
    [checkout, fromWalletWeb3Provider],
  );

  const handleToNetworkSelection = useCallback(
    async (chainId: ChainId) => {
      if (!toWalletWeb3Provider) return;
      setToNetworkDrawerOpen(false);
      setToNetwork(chainId);

      track({
        userJourney: UserJourney.BRIDGE,
        screen: 'WalletAndNetwork',
        control: 'ToNetwork',
        controlType: 'Select',
        extras: {
          chainId,
        },
      });
    },
    [checkout, toWalletWeb3Provider],
  );

  const handleSettingToNetwork = useCallback((toAddress: string) => {
    // If the toWallet is Passport the toNetwork can only be L2
    // If the user selects the same wallet (e.g. MetaMask) for from AND to this can only be a bridge
    const theToNetwork = fromWalletAddress === toAddress && fromNetwork === imtblZkEvmNetworkChainId
      ? l1NetworkChainId
      : imtblZkEvmNetworkChainId;
    setToNetwork(theToNetwork);
    setToWalletDrawerOpen(false);

    track({
      userJourney: UserJourney.BRIDGE,
      screen: 'WalletAndNetwork',
      control: 'ToNetwork',
      controlType: 'Select',
      extras: {
        chainId: theToNetwork,
      },
    });
  }, [fromWalletAddress, fromNetwork]);

  const handleWalletConnectToWalletConnection = useCallback(
    (provider: Web3Provider) => {
      setToWalletWeb3Provider(provider);
      provider!
        .getSigner()
        .getAddress()
        .then((address) => {
          setToWalletAddress(address.toLowerCase());
          handleSettingToNetwork(address.toLowerCase());

          track({
            userJourney: UserJourney.BRIDGE,
            screen: 'WalletAndNetwork',
            control: 'ToWallet',
            controlType: 'Select',
            extras: {
              walletAddress: address.toLowerCase(),
            },
          });
        });
    },
    [handleSettingToNetwork],
  );

  const handleToWalletSelection = useCallback(
    async (event: WalletChangeEvent) => {
      if (fromWallet?.providerDetail.info.rdns === event.providerDetail.info.rdns) {
        // if same from wallet and to wallet, just use the existing fromWalletLocalWeb3Provider
        setToWalletWeb3Provider(fromWalletWeb3Provider);
        setToWallet(event);
        const address = await fromWalletWeb3Provider!.getSigner().getAddress();
        setToWalletAddress(address.toLowerCase());
        handleSettingToNetwork(address.toLowerCase());

        track({
          userJourney: UserJourney.BRIDGE,
          screen: 'WalletAndNetwork',
          control: 'ToWallet',
          controlType: 'Select',
          extras: {
            walletAddress: address.toLowerCase(),
          },
        });
        return;
      }

      try {
        setToWallet(event);
        const web3Provider = new Web3Provider(event.provider as any);
        const connectedProvider = await connectToProvider(checkout, web3Provider, false);

        if (isWalletConnectProvider(connectedProvider)) {
          handleWalletConnectToWalletConnection(connectedProvider);
        } else {
          setToWalletWeb3Provider(connectedProvider);
          const address = await connectedProvider!.getSigner().getAddress();
          setToWalletAddress(address.toLowerCase());
          handleSettingToNetwork(address.toLowerCase());

          track({
            userJourney: UserJourney.BRIDGE,
            screen: 'WalletAndNetwork',
            control: 'ToWallet',
            controlType: 'Select',
            extras: {
              walletAddress: address.toLowerCase(),
            },
          });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    },
    [
      fromWalletProviderName,
      fromWalletWeb3Provider,
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
          walletProviderInfo: fromWallet?.providerDetail.info,
          network: fromNetwork,
        },
        to: {
          web3Provider: toWalletWeb3Provider,
          walletAddress: toWalletAddress.toLowerCase(),
          walletProviderInfo: toWallet?.providerDetail.info,
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
          rdns: fromWallet?.providerDetail.info.rdns,
          uuid: fromWallet?.providerDetail.info.uuid,
          isPassportWallet: isPassportProvider(fromWalletWeb3Provider),
          isMetaMask: isMetaMaskProvider(fromWalletWeb3Provider),
        },
        toWalletAddress,
        toNetwork,
        toWallet: {
          address: toWalletAddress,
          rdns: toWallet?.providerDetail.info.rdns,
          uuid: toWallet?.providerDetail.info.uuid,
          isPassportWallet: isPassportProvider(toWalletWeb3Provider),
          isMetaMask: isMetaMaskProvider(toWalletWeb3Provider),
        },
        moveType: fromNetwork && fromNetwork === toNetwork ? 'transfer' : 'bridge',
      },
    });

    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: { type: BridgeWidgetViews.BRIDGE_FORM },
      },
    });
  }, [
    fromWallet,
    fromWalletWeb3Provider,
    fromNetwork,
    fromWalletAddress,
    toWallet,
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
        showDrawer={fromWalletDrawerOpen}
        setShowDrawer={setFromWalletDrawerOpen}
        walletOptions={fromWalletSelectorOptions}
        onWalletChange={handleFromWalletConnection}
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
            walletProviderDetail={fromWallet?.providerDetail}
            walletProvider={fromWalletWeb3Provider}
            walletName={fromWalletProviderName}
            walletAddress={abbreviateAddress(fromWalletAddress)}
            chainId={fromNetwork}
            disableNetworkButton={fromWalletProviderName === WalletProviderName.PASSPORT.toString()}
            onWalletClick={() => {
              // TODO: Force an account selection here
              setFromWalletDrawerOpen(true);
            }}
            onNetworkClick={() => setFromNetworkDrawerOpen(true)}
            environment={environment}
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
              onWalletChange={handleToWalletSelection}
            />
          </Box>
        </Box>
      )}

      {/** From Network Selector, we programmatically open this so there is no target */}
      <Drawer
        headerBarTitle={t(
          fromNetworkDrawerOpen ? 'views.WALLET_NETWORK_SELECTION.fromFormInput.networkSelectorHeading'
            : 'views.WALLET_NETWORK_SELECTION.toFormInput.networkSelectorHeading',
        )}
        size="full"
        onCloseDrawer={() => {
          if (fromNetworkDrawerOpen) {
            setFromNetworkDrawerOpen(false);
          } else {
            setToNetworkDrawerOpen(false);
          }
        }}
        visible={fromNetworkDrawerOpen || toNetworkDrawerOpen}
      >
        <Drawer.Content sx={{ paddingX: 'base.spacing.x4' }}>
          <NetworkItem
            key={imtblZkEvmNetworkName}
            testId={testId}
            chainName={imtblZkEvmNetworkName}
            onNetworkClick={fromNetworkDrawerOpen ? handleFromNetworkSelection : handleToNetworkSelection}
            chainId={imtblZkEvmNetworkChainId}
            environment={environment}
          />
          {/** If selecting from network, show L1 option for everything but Passport */}
          {(toNetworkDrawerOpen || fromWallet?.providerDetail.info.rdns !== WalletProviderRdns.PASSPORT) && (
            <NetworkItem
              key={l1NetworkName}
              testId={testId}
              chainName={l1NetworkName}
              onNetworkClick={fromNetworkDrawerOpen ? handleFromNetworkSelection : handleToNetworkSelection}
              chainId={l1NetworkChainId}
              environment={environment}
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
            walletProviderDetail={toWallet?.providerDetail}
            walletProvider={toWalletWeb3Provider}
            walletName={toWalletProviderName}
            walletAddress={abbreviateAddress(toWalletAddress)}
            chainId={toNetwork!}
            disableNetworkButton={fromNetwork === l1NetworkChainId
              || toWalletProviderName === WalletProviderName.PASSPORT.toString()
              || fromWalletAddress === toWalletAddress}
            onWalletClick={() => {
              setToWalletDrawerOpen(true);
            }}
            onNetworkClick={() => {
              setToNetworkDrawerOpen(true);
            }}
            environment={environment}
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
