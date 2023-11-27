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

  const l1NetworkChainId = getL1ChainId(checkout.config);
  const l1NetworkName = getChainNameById(l1NetworkChainId);
  const imtblZkEvmNetworkChainId = getL2ChainId(checkout.config);
  const imtblZkEvmNetworkName = getChainNameById(imtblZkEvmNetworkChainId);

  const [fromWalletDrawerOpen, setFromWalletDrawerOpen] = useState(false);
  const [fromNetworkDrawerOpen, setFromNetworkDrawerOpen] = useState(false);

  const [fromWalletLocalWeb3Provider, setFromWalletLocalWeb3Provider] = useState<Web3Provider>();
  const [fromNetwork, setFromNetwork] = useState<ChainId>();

  const [toWalletDrawerOpen, setToWalletDrawerOpen] = useState(false);
  const [toWalletLocalWeb3Provider, setToWalletLocalWeb3Provider] = useState<Web3Provider>();
  const [toNetwork, setToNetwork] = useState<ChainId>();

  console.log('toWalletLocalWeb3Provider is: ', toWalletLocalWeb3Provider);
  console.log('toNetwork is: ', toNetwork);

  let fromWalletProviderName = WalletProviderName.METAMASK;
  if (isPassportProvider(fromWalletLocalWeb3Provider)) {
    fromWalletProviderName = WalletProviderName.PASSPORT;
  }

  let toWalletProviderName = WalletProviderName.METAMASK;
  if (isPassportProvider(toWalletLocalWeb3Provider)) {
    toWalletProviderName = WalletProviderName.PASSPORT;
  }

  const isFromWalletAndNetworkSelected = fromWalletLocalWeb3Provider !== undefined && fromNetwork !== undefined;
  const isToWalletAndNetworkSelected = toWalletLocalWeb3Provider !== undefined && toNetwork !== undefined;

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
      setFromWalletLocalWeb3Provider(provider);

      /** if Passport skip from network selector */
      if (isPassportProvider(provider)) {
        setFromNetwork(imtblZkEvmNetworkChainId);
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
      if (!fromWalletLocalWeb3Provider) return;

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
    // if localWalletProviderName === MetaMask
    // to options are
    // MetaMask
    // and

    // if localWalletProviderName === Passport fromNetwork is zkEVM by default
    // to options are
    // MetaMask

    // if from wallet and to wallet are different
    // make a connection to the to wallet
    // store it in localToWalletWeb3Provider

    if (fromWalletProviderName !== selectedToWalletProviderName) {
      // connect and save toWalletLocalWebProvider
      // createProvider
      // check if connceted
      // connect

      let toWalletProvider;
      try {
        const createResult = await checkout.createProvider({ walletProviderName: selectedToWalletProviderName });
        toWalletProvider = createResult.provider;
      } catch (error) {
      // eslint-disable-next-line no-console
        console.error(`Failed to create ${selectedToWalletProviderName} provider`);
      }

      // check if connected
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
      // try to connect
        try {
          const { provider: connectedProvider } = await checkout.connect({ provider: toWalletProvider });
          toWalletProvider = connectedProvider;
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

      setToWalletLocalWeb3Provider(toWalletProvider);
    } else {
      console.log('setting toWallet provider to be the same as from wallet provider');
      // toWalletLocalWeb3Provider is the same as fromWalletLocalWeb3Provider
      setToWalletLocalWeb3Provider(fromWalletLocalWeb3Provider);
    }

    // toNetwork is always the opposite of fromNetwork
    const theToNetwork = fromNetwork === l1NetworkChainId ? imtblZkEvmNetworkChainId : l1NetworkChainId;
    setToNetwork(theToNetwork);

    setToWalletDrawerOpen(false);
  }, [fromWalletProviderName, fromNetwork]);

  const [walletItemLoading, setWalletItemLoading] = useState(false);

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
            onWalletClick={async (name) => await handleWalletConnection(name)}
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
            key={imtblZkEvmNetworkName}
            testId={testId}
            chainName={imtblZkEvmNetworkName}
            onNetworkClick={handleNetworkSelection}
            chainId={imtblZkEvmNetworkChainId}
          />
          {/** Show L1 option for Metamask only */}
          {fromWalletProviderName === WalletProviderName.METAMASK && (
          <BridgeNetworkItem
            key={l1NetworkName}
            testId={testId}
            chainName={l1NetworkName}
            onNetworkClick={handleNetworkSelection}
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
                  testId={testId}
                  loading={walletItemLoading}
                  setLoading={setWalletItemLoading}
                  walletProviderName={WalletProviderName.METAMASK}
                  onWalletClick={async (name) => await handleToWalletSelection(name)}
                />

                {/** if passport has been configured in checkout
                 * AND fromNetwork is L1
                 * AND fromWallet is MetaMask
                 * -> show Passport option */}
                {checkout.passport
                && fromNetwork === l1NetworkChainId
                && fromWalletProviderName === WalletProviderName.METAMASK && (
                <BridgeWalletItem
                  key={WalletProviderName.PASSPORT}
                  testId={testId}
                  loading={walletItemLoading}
                  setLoading={setWalletItemLoading}
                  walletProviderName={WalletProviderName.PASSPORT}
                  onWalletClick={async (name) => await handleToWalletSelection(name)}
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
        onNetworkClick={() => console.log('wrong')}
      />
      )}
    </Box>
  );
}
