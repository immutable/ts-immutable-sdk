import {
  BiomeCombinedProviders,
  Body,
  Box,
  Button,
  Heading,
  OptionKey,
} from '@biom3/react';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';

import { Network, WidgetTheme } from '@imtbl/checkout-widgets';
import { BridgeWidgetStyle } from './BridgeStyles';

import {
  ChainId,
  Checkout,
  ConnectionProviders,
  GetBalanceResult,
  NetworkFilterTypes,
} from '@imtbl/checkout-sdk';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TransactionResponse, Web3Provider } from '@ethersproject/providers';
import { BridgeForm } from './components/BridgeForm';
import { getAllBalances } from './utils';
import {
  sendBridgeFailedEvent,
  sendBridgeSuccessEvent,
} from './BridgeWidgetEvents';
import { EtherscanLink } from './components/EtherscanLink';
import { Environment } from '@imtbl/config';
import { L1Network, zkEVMNetwork } from '../../lib/networkUtils';

export interface BridgeWidgetProps {
  params: BridgeWidgetParams;
  theme: WidgetTheme;
  environment: Environment;
}

export interface BridgeWidgetParams {
  providerPreference: ConnectionProviders;
  fromContractAddress?: string;
  amount?: string;
  fromNetwork?: Network;
}

export enum BridgeWidgetViews {
  BRIDGE = 'BRIDGE',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

const bridgingNetworks = Object.values(Network);

export const NetworkChainMap = {
  [Network.ETHEREUM]: ChainId.ETHEREUM,
  [Network.IMTBL_ZKEVM_TESTNET]: ChainId.IMTBL_ZKEVM_TESTNET,
  [Network.IMTBL_ZKEVM_DEVNET]: ChainId.IMTBL_ZKEVM_DEVNET,
  [Network.SEPOLIA]: ChainId.SEPOLIA,
};

export function BridgeWidget(props: BridgeWidgetProps) {
  const { environment, params, theme } = props;
  console.log(environment);
  const checkout = useMemo(
    () => new Checkout({ baseConfig: { environment } }),
    [environment]
  );
  const { providerPreference, fromContractAddress, amount, fromNetwork } =
    params;
  const biomeTheme: BaseTokens =
    theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
      ? onLightBase
      : onDarkBase;

  const defaultFromChainId = useMemo(() => {
    return fromNetwork && bridgingNetworks.includes(fromNetwork)
      ? NetworkChainMap[fromNetwork]
      : L1Network(checkout.config.environment);
  }, [fromNetwork, checkout]);

  const firstRender = useRef(true);

  const [provider, setProvider] = useState<Web3Provider>();
  const [balances, setBalances] = useState<GetBalanceResult[]>([]);
  const [connectedChainId, setConnectedChainId] = useState<ChainId>();
  const [selectedNetwork, setSelectedNetwork] = useState<OptionKey>();
  const [nativeCurrencySymbol, setNativeCurrencySymbol] = useState('');
  const [toNetwork, setToNetwork] = useState('');
  const [view, setView] = useState(BridgeWidgetViews.BRIDGE);
  const [transactionResponse, setTransactionResponse] = useState<
    TransactionResponse | undefined
  >();

  /**
   * This effect is used to set up the BridgeWidget state for the first time.
   * It includes connecting with a provider preference
   * Checking that the provider is connected to an available network and switching
   * to the default specified network if not (if no default provided then Ethereum)
   * It then calculates the toNetwork for the bridge and it's associated native currency.
   *
   * NOTE: This effect should only run on the first render of the component to avoid switchNetwork errors
   */
  useEffect(() => {
    const bridgetWidgetSetup = async () => {
      let connectResult = await checkout.connect({ providerPreference });
      let theProvider;
      let chainId;
      chainId = connectResult.network.chainId;
      theProvider = connectResult.provider;

      const allowedBridgingNetworks = await checkout.getNetworkAllowList({
        type: NetworkFilterTypes.ALL,
      });

      const connectedNetworkNotWhitelisted = !allowedBridgingNetworks.networks
        .map((network) => network.chainId)
        .includes(connectResult.network.chainId);

      const requiresNetworkSwitch =
        defaultFromChainId !== connectResult.network.chainId;

      if (connectedNetworkNotWhitelisted || requiresNetworkSwitch) {
        const switchNetworkResponse = await checkout.switchNetwork({
          provider: connectResult.provider,
          chainId: defaultFromChainId,
        });
        chainId = switchNetworkResponse.network.chainId;
        connectResult = await checkout.connect({ providerPreference });
        theProvider = connectResult.provider;
      }

      setProvider(theProvider);
      setConnectedChainId(chainId);
      setSelectedNetwork(chainId as OptionKey);
      const toNetworkOption = allowedBridgingNetworks.networks.find(
        (network) =>
          network.chainId === zkEVMNetwork(checkout.config.environment)
      );

      setToNetwork(toNetworkOption?.name ?? '');
      setNativeCurrencySymbol(connectResult.network.nativeCurrency.symbol);
    };

    if (firstRender.current) {
      firstRender.current = false;
      bridgetWidgetSetup();
    }
  }, [checkout, providerPreference, defaultFromChainId, firstRender]);

  /**
   * This effect is used to refresh all user balances when the network changes.
   * It also filters out any 0 balances as the user will have nothing to swap.
   */
  useEffect(() => {
    const refreshBalances = async () => {
      if (checkout && provider) {
        const getAllBalancesResult = await getAllBalances(checkout, provider);

        const nonZeroBalances = getAllBalancesResult.balances
          .filter((balance) => balance.balance.gt(0))
          .sort((a, b) => b.token.symbol.localeCompare(a.token.symbol));

        setBalances(nonZeroBalances);
      }
    };
    refreshBalances();
  }, [checkout, provider, selectedNetwork]);

  /**
   * When we switch network, we need to refresh the provider object to avoid errors
   * After a switch network, update the new toNetwork and associated native currency
   */
  const handleSelectNetwork = useCallback(
    async (selectedOption: OptionKey) => {
      if (!provider) return;
      const switchNetworkResponse = await checkout.switchNetwork({
        provider,
        chainId: selectedOption as ChainId,
      });
      const connectResult = await checkout.connect({ providerPreference });
      setProvider(connectResult.provider);
      setSelectedNetwork(switchNetworkResponse.network.chainId as OptionKey);
      const toNetworkOption = bridgingNetworks.filter(
        (network) =>
          network.toString() !== switchNetworkResponse.network.name.toString()
      );
      setToNetwork(toNetworkOption[0]);
      setNativeCurrencySymbol(connectResult.network.nativeCurrency.symbol);
    },
    [checkout, provider, providerPreference]
  );

  function sendBridgeWidgetCloseEvent() {
    console.log('add close event to fire here');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateView = async (view: BridgeWidgetViews, err?: any) => {
    setView(view);
    if (view === BridgeWidgetViews.SUCCESS) {
      sendBridgeSuccessEvent();
      return;
    }
    if (view === BridgeWidgetViews.FAIL) {
      sendBridgeFailedEvent(err.message);
      return;
    }
  };

  const updateTransactionResponse = (
    transactionResponse: TransactionResponse
  ) => {
    setTransactionResponse(transactionResponse);
  };

  const renderBridgeForm = () => {
    return (
      <>
        {checkout && provider && (
          <BridgeForm
            provider={provider}
            balances={balances}
            nativeCurrencySymbol={nativeCurrencySymbol}
            defaultAmount={amount}
            defaultTokenAddress={fromContractAddress}
            chainId={connectedChainId}
            selectedNetwork={selectedNetwork}
            toNetwork={toNetwork}
            onSelectedNetworkChange={handleSelectNetwork}
            updateTransactionResponse={updateTransactionResponse}
            updateView={updateView}
          />
        )}
      </>
    );
  };

  const renderView = () => {
    switch (view) {
      case BridgeWidgetViews.BRIDGE:
        return renderBridgeForm();
      case BridgeWidgetViews.SUCCESS:
        return renderSuccess();
      case BridgeWidgetViews.FAIL:
        return renderFailure();
    }
  };

  const renderSuccess = () => {
    return (
      <>
        <Body testId="bridge-success">Success</Body>
        <EtherscanLink hash={transactionResponse?.hash || ''} />
      </>
    );
  };

  const renderFailure = () => {
    return <Body testId="bridge-failure">Failure</Body>;
  };

  return (
    <BiomeCombinedProviders theme={{ base: biomeTheme }}>
      <Box sx={BridgeWidgetStyle}>
        <>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Heading testId="heading">Bridge Widget</Heading>
            <Button
              size={'small'}
              sx={{ alignSelf: 'flex-end' }}
              testId="close-button"
              onClick={() => sendBridgeWidgetCloseEvent()}
            >
              x
            </Button>
          </Box>
          {provider && checkout && renderView()}
          {(!provider || !checkout) && <Body size={'small'}>Loading...</Body>}
        </>
      </Box>
    </BiomeCombinedProviders>
  );
}
