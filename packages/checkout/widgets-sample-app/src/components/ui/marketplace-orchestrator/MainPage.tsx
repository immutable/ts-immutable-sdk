import { Web3Provider } from '@ethersproject/providers';
import { Box, Button, Heading } from "@biom3/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { WidgetsFactory } from '@imtbl/checkout-widgets';
import {
  Checkout,
  ConnectEventType,
  ConnectionSuccess,
  OrchestrationEventType,
  RequestBridgeEvent,
  BridgeEventType,
  RequestOnrampEvent,
  OnRampEventType,
  RequestSwapEvent,
  SwapEventType,
  WalletEventType,
  WalletNetworkSwitch,
  WidgetTheme, WidgetType, ProviderEventType, ProviderUpdated, WidgetConfiguration, WidgetProperties, ChainId
} from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { passport } from './passport';
import { LanguageSelector } from './LanguageSelector';
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import { WalletConnectModal } from '@walletconnect/modal'

// Create one instance of Checkout and inject Passport
const checkout = new Checkout({
  baseConfig: {
    environment: Environment.PRODUCTION,
    publishableKey: 'pk_imapik-test-pCHFU0GpQImZx9UzSnU3',
  },
  passport,
});

// export declare type EthereumProviderOptions = {
//   projectId: string;
//   methods?: string[];
//   optionalMethods?: string[];
//   events?: string[];
//   optionalEvents?: string[];
//   rpcMap?: EthereumRpcMap;
//   metadata?: Metadata;
//   showQrModal: boolean;
//   qrModalOptions?: QrModalOptions;
//   disableProviderPing?: boolean;
//   relayUrl?: string;
//   storageOptions?: KeyValueStorageOptions;
// } & ChainsProps;


export const MainPage = () => {
  const widgetsFactory = useMemo(() => new WidgetsFactory(checkout, { theme: WidgetTheme.DARK }), [checkout]);

  const connectWidget = useMemo(() => widgetsFactory.create(WidgetType.CONNECT), [widgetsFactory]);
  const walletWidget = useMemo(() => widgetsFactory.create(WidgetType.WALLET), [widgetsFactory]);
  const bridgeWidget = useMemo(() => widgetsFactory.create(WidgetType.BRIDGE), [widgetsFactory]);
  const swapWidget = useMemo(() => widgetsFactory.create(WidgetType.SWAP), [widgetsFactory]);
  const onRampWidget = useMemo(() => widgetsFactory.create(WidgetType.ONRAMP), [widgetsFactory]);

  connectWidget.addListener(ConnectEventType.CLOSE_WIDGET, () => { connectWidget.unmount() });
  walletWidget.addListener(WalletEventType.CLOSE_WIDGET, () => { walletWidget.unmount() });
  bridgeWidget.addListener(BridgeEventType.CLOSE_WIDGET, () => { bridgeWidget.unmount() });
  swapWidget.addListener(SwapEventType.CLOSE_WIDGET, () => swapWidget.unmount());
  onRampWidget.addListener(OnRampEventType.CLOSE_WIDGET, () => { onRampWidget.unmount() });

  // local state for enabling/disabling and changing buttons
  const [doneSwap, setDoneSwap] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [web3Provider, setWeb3Provider] = useState<Web3Provider | undefined>(undefined);

  useEffect(() => {
    connectWidget.addListener(ConnectEventType.CLOSE_WIDGET, () => connectWidget.unmount());
    connectWidget.addListener(ConnectEventType.SUCCESS, (eventData: ConnectionSuccess) => {
      setWeb3Provider(eventData.provider);
    });
    walletWidget.addListener(WalletEventType.NETWORK_SWITCH, (eventData: WalletNetworkSwitch) => {
      setWeb3Provider(eventData.provider)
    });
    swapWidget.addListener(ProviderEventType.PROVIDER_UPDATED, (data: ProviderUpdated) => {
      console.log("swap widget provider updated", data)
    });
  }, [connectWidget, walletWidget, swapWidget]);

  // Orchestration
  useEffect(() => {
    walletWidget.addListener(OrchestrationEventType.REQUEST_BRIDGE, (eventData: RequestBridgeEvent) => {
      walletWidget.unmount();
      bridgeWidget.mount('bridge-target', { tokenAddress: eventData.tokenAddress, amount: eventData.amount });
    })
    walletWidget.addListener(OrchestrationEventType.REQUEST_SWAP, (data: RequestSwapEvent) => {
      walletWidget.unmount();
      swapWidget.mount('swap-target', { fromTokenAddress: data.fromTokenAddress, amount: data.amount });
    })
    walletWidget.addListener(OrchestrationEventType.REQUEST_ONRAMP, (data: RequestOnrampEvent) => {
      walletWidget.unmount();
      onRampWidget.mount('onramp-target', { tokenAddress: data.tokenAddress, amount: data.amount });
    })
    bridgeWidget.addListener(OrchestrationEventType.REQUEST_SWAP, () => {
      bridgeWidget.unmount();
      swapWidget.mount('swap-target');
    });
    bridgeWidget.addListener(OrchestrationEventType.REQUEST_ONRAMP, () => {
      bridgeWidget.unmount();
      onRampWidget.mount('onramp-target');
    });
  }, [walletWidget, bridgeWidget, onRampWidget, swapWidget]);

  // button click functions to open/close widgets
  const openConnectWidget = useCallback(() => {
    connectWidget.mount('connect-target');
  }, [connectWidget])

  const openWalletWidget = useCallback(() => {
    walletWidget.mount('wallet-target');
  }, [walletWidget])

  const openBridgeWidget = useCallback(() => {
    bridgeWidget.mount('bridge-target')
  }, [bridgeWidget])

  const openSwapWidget = useCallback(() => {
    swapWidget.mount('swap-target')
  }, [swapWidget])

  const openOnRampWidget = useCallback(() => {
    onRampWidget.mount('onramp-target')
  }, [onRampWidget, web3Provider])

  const logout = useCallback(async () => {
    await passport.logout();
  }, [passport])

  const updateLanguage = useCallback((language: string) => {
    setSelectedLanguage(language);
    const languageUpdate: WidgetProperties<any> = { config: { language } } as WidgetProperties<any>;
    connectWidget.update(languageUpdate);
    walletWidget.update(languageUpdate);
    bridgeWidget.update(languageUpdate);
    swapWidget.update(languageUpdate);
    onRampWidget.update(languageUpdate);
  }, [onRampWidget, web3Provider])

  const handleDisconnect = useCallback(async () => {
    if ((web3Provider?.provider as any)?.isWalletConnect) {
      console.log('disconnecting wallet connect')
      await (web3Provider?.provider as any).disconnect();
      console.log('disconnected')
    }
  }, [web3Provider])

  /** WALLET CONNECT ETHEREUM PROVIDER + MODAL */

  const [wcProvider, setWcProvider] = useState<InstanceType<typeof EthereumProvider> | null>(null);
  const [wcModal, setWcModal] = useState<InstanceType<typeof WalletConnectModal> | null>(null);
  const [wcDisplayURI, setWcDisplayURI] = useState('');
  const [wcSessionEvent, setWcSessionEvent] = useState<any>();
  const [wcSessionUpdateEvent, setWcSessionUpdateEvent] = useState<any>();
  const [wcPairingTopic, setWcPairingTopic] = useState('');
  const [wcSessionTopic, setWcSessionTopic] = useState('')




  useEffect(() => {
    if (wcProvider !== null) {
      return;
    }
    (async () => {
      const modal = new WalletConnectModal({
        projectId: '938b553484e344b1e0b4bb80edf8c362',
        chains: [`eip155:${ChainId.ETHEREUM.toString()}`, `eip155:${ChainId.IMTBL_ZKEVM_MAINNET}`],
        // chains: [`eip155:${ChainId.SEPOLIA.toString()}`, `eip155:${ChainId.IMTBL_ZKEVM_TESTNET}`],
        explorerRecommendedWalletIds: [
          'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
          '85db431492aa2e8672e93f4ea7acf10c88b97b867b0d373107af63dc4880f041'
        ],
        explorerExcludedWalletIds: 'ALL'
      })
      console.log("wc Modal", modal)

      const wcEthereumProvider = await EthereumProvider.init({
        projectId: '938b553484e344b1e0b4bb80edf8c362',
        chains: [ChainId.ETHEREUM],
        optionalChains: [ChainId.IMTBL_ZKEVM_MAINNET],
        showQrModal: false,
        metadata: {
          name: 'Immutable Checkout',
          description: 'Immutable Checkout',
          url: 'https://toolkit.immutable.com',
          icons: [],
        },
        methods: [
          "personal_sign",
          "eth_sendTransaction",
          "eth_accounts",
          "eth_requestAccounts",
          "eth_call",
          "eth_getBalance",
          "eth_sendRawTransaction",
          "eth_sign",
          "eth_signTransaction",
          "eth_signTypedData",
          "eth_signTypedData_v3",
          "eth_signTypedData_v4",
          "wallet_switchEthereumChain",
          "wallet_addEthereumChain",
          "wallet_getPermissions",
          "wallet_requestPermissions",
          "wallet_registerOnboarding",
          "wallet_watchAsset",
          "wallet_scanQRCode"
        ],
        qrModalOptions: {
          themeMode: 'dark',
        },
        rpcMap: {
          [ChainId.ETHEREUM]: "https://checkout-api.immutable.com/v1/rpc/eth-mainnet",
          [ChainId.IMTBL_ZKEVM_MAINNET]: "https://rpc.immutable.com"
          // [ChainId.SEPOLIA]: "https://checkout-api.sandbox.immutable.com/v1/rpc/eth-sepolia",
          // [ChainId.IMTBL_ZKEVM_TESTNET]: "https://rpc.testnet.immutable.com"
        }
      })
      console.log("wcEthereumProvider", wcEthereumProvider)
      wcEthereumProvider.on('display_uri', (data) => {
        console.log('wc display_uri', data);
        setWcDisplayURI(data);
        const pairingTopic = data.split("@")[0].replace("wc:", "");
        console.log("pairingTopic", pairingTopic)
        setWcPairingTopic(pairingTopic);
      })
      wcEthereumProvider.on('connect', (data) => {
        console.log('wc connect', data);
        modal.closeModal();
      })
      wcEthereumProvider.on('disconnect', (data) => {
        console.log('wc disconnect', data);
      })
      wcEthereumProvider.on('accountsChanged', (data) => {
        console.log('wc accountsChanged', data);
      })
      wcEthereumProvider.on('chainChanged', (data) => {
        console.log('wc chainChanged', data);
      })
      wcEthereumProvider.on('session_update', (data) => {
        console.log('wc session_update', data);
        setWcSessionUpdateEvent(data);
        setWcSessionTopic(data?.topic);
      })
      wcEthereumProvider.on('session_event', (data) => {
        console.log('wc session_event', data);
        setWcSessionEvent(data);
        setWcSessionTopic(data?.topic);
      })
      wcEthereumProvider.on('session_delete', (data) => {
        console.log('wc session_delete', data);
      })
      wcEthereumProvider.on('message', (data) => {
        console.log('wc message', data);
      })

      setWcProvider(wcEthereumProvider);
      setWcModal(modal);
    })();
  }, [wcProvider])

  const openWcModal = useCallback(() => {
    console.log("new display uri", wcDisplayURI);
    console.log('calling open modal');
    if (!wcModal || !wcDisplayURI || wcDisplayURI === '') return;
    (async () => {
      try {
        await wcModal?.openModal({ uri: wcDisplayURI })
      } catch (err) {
        console.log('err with opening modal', err);
      }
    })();
  }, [wcDisplayURI])

  const enableWC = useCallback(async () => {
    console.log('wc enable click')
    if (!wcProvider) return;
    await wcProvider.enable();
  }, [wcProvider]);

  const connectExistingPairingTopic = useCallback(async () => {
    if (!wcProvider || wcPairingTopic === '') return;
    // const topic = wcProvider.session?.topic;
    // console.log('connecting existing topic', topic);
    await wcProvider.connect({
      pairingTopic: wcPairingTopic
    })
  }, [wcProvider, wcPairingTopic])

  const disconnectWC = useCallback(async () => {
    console.log('wc disconnect click')
    if (!wcProvider) return;
    try {
      await wcProvider.disconnect();
      setWcPairingTopic('');
      setWcSessionTopic('');
      console.log('disconnected')
    } catch (err) {
      console.log(err)
    }


  }, [wcProvider]);

  const injectWeb3ProviderIntoWidgets = useCallback(() => {
    if (!widgetsFactory || !wcProvider || !wcProvider.connected) return;
    console.log('wrapping wcProvider and injecting into widgets');
    const wrappedWcProvider = new Web3Provider(wcProvider);
    widgetsFactory.updateProvider(wrappedWcProvider);
  }, [wcProvider, widgetsFactory])

  return (
    <Box sx={{ minWidth: '100vw', minHeight: '100vh', width: '100%', height: '100%', backgroundColor: 'base.color.brand.6' }}>
      <Box sx={{ width: '100%', padding: 'base.spacing.x4', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <Heading>Immutable Checkout Marketplace</Heading>
        <Box sx={{ padding: 'base.spacing.x4', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: 'base.spacing.x6', alignItems: 'center', flexWrap: 'wrap' }}>
          <Button onClick={enableWC}>Enable WC</Button>
          <Button onClick={openWcModal}>Open WC Modal</Button>
          <Button onClick={connectExistingPairingTopic}>Connect existing topic</Button>
          <Button onClick={disconnectWC}>Disconnect WC</Button>
          <Button onClick={injectWeb3ProviderIntoWidgets}>Inject web3provider in widgets</Button>
          <Button onClick={openConnectWidget}>Connect</Button>
          <Button onClick={openWalletWidget}>Wallet</Button>
          <Button onClick={openSwapWidget}>Swap</Button>
          <Button onClick={openBridgeWidget}>Bridge</Button>
          <Button onClick={openOnRampWidget}>On-ramp</Button>
          <LanguageSelector onLanguageChange={(language: string) => updateLanguage(language)} language={selectedLanguage} />
          {(web3Provider?.provider as any)?.isWalletConnect && <Button onClick={handleDisconnect}>Disconnect WC</Button>}
        </Box>
        {passport && web3Provider && (web3Provider.provider as any)?.isPassport && <Button onClick={logout}>Passport Logout</Button>}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 'base.spacing.x3', flexWrap: 'wrap' }}>
        <div id="connect-target"></div>
        <div id="wallet-target"></div>
        <div id="swap-target"></div>
        <div id="bridge-target"></div>
        <div id="onramp-target"></div>
      </Box>
    </Box>
  );
}
