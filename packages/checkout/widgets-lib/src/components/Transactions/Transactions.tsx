import {
  useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import { Box } from '@biom3/react';
import {
  ChainId,
  TokenFilterTypes,
  TokenInfo, WalletProviderRdns,
} from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { useTranslation } from 'react-i18next';
import { HeaderNavigation } from '../Header/HeaderNavigation';
import { SimpleLayout } from '../SimpleLayout/SimpleLayout';
import { FooterLogo } from '../Footer/FooterLogo';
import { EventTargetContext } from '../../context/event-target-context/EventTargetContext';
import {
  connectToProvider,
  isPassportProvider,
} from '../../lib/provider';
import {
  DEFAULT_TRANSACTIONS_RETRY_POLICY,
  getL1ChainId,
  getL2ChainId,
} from '../../lib';
import { CheckoutApi, Transaction, TransactionType } from '../../lib/clients';
import { retry } from '../../lib/retry';
import { getChainSlugById } from '../../lib/chains';
import {
  CryptoFiatActions,
  CryptoFiatContext,
} from '../../context/crypto-fiat-context/CryptoFiatContext';
import {
  UserJourney,
  useAnalytics,
} from '../../context/analytics-provider/SegmentAnalyticsProvider';
import {
  BridgeActions,
  BridgeContext,
} from '../../widgets/bridge/context/BridgeContext';
import { WalletDrawer } from '../WalletDrawer/WalletDrawer';
import { sendBridgeWidgetCloseEvent } from '../../widgets/bridge/BridgeWidgetEvents';
import { Shimmer } from './Shimmer';
import {
  supportBoxContainerStyle,
  transactionsContainerStyle,
  transactionsListContainerStyle,
} from './TransactionsStyles';
import { EmptyStateNotConnected } from './EmptyStateNotConnected';
import { SupportMessage } from './SupportMessage';
import { KnownNetworkMap } from './transactionsType';
import { TransactionList } from './TransactionList';
import { NoTransactions } from './NoTransactions';
import { useInjectedProviders } from '../../lib/hooks/useInjectedProviders';
import { WalletChangeEvent } from '../WalletDrawer/WalletDrawerEvents';
import { BrowserProvider, JsonRpcProvider } from 'ethers';

type TransactionsProps = {
  defaultTokenImage: string;
  onBackButtonClick: () => void;
};

export function Transactions({
  defaultTokenImage,
  onBackButtonClick,
}: TransactionsProps) {
  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);

  const { cryptoFiatDispatch } = useContext(CryptoFiatContext);
  const {
    bridgeDispatch,
    bridgeState: { checkout, from },
  } = useContext(BridgeContext);
  const { page } = useAnalytics();
  const { t } = useTranslation();
  const { track } = useAnalytics();

  const [loading, setLoading] = useState(true);
  const [knownTokenMap, setKnownTokenMap] = useState<
  KnownNetworkMap | undefined
  >(undefined);
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [showWalletDrawer, setShowWalletDrawer] = useState(false);

  const isPassport = isPassportProvider(from?.web3Provider);

  // Fetch the tokens for the root chain using the allowed tokens.
  // In case this list does not have all the tokens, there is logic
  // built into the <TransactionsList /> component to fetch the
  // the missing data.
  const rootChainTokensHashmap = useCallback(async () => {
    if (!checkout) return {};

    const rootChainId = getL1ChainId(checkout.config);
    try {
      const tokens = (
        await checkout.getTokenAllowList({
          type: TokenFilterTypes.BRIDGE,
          chainId: rootChainId,
        })
      ).tokens ?? [];
      return tokens.reduce((out, current) => {
        // eslint-disable-next-line no-param-reassign
        out[current.address!.toLowerCase()] = current;
        return out;
      }, {});
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return [];
    }
  }, [checkout]);

  // Fetch the tokens for the root chain using the user balances tokens.
  // In case this list does not have all the tokens, there is logic
  // built into the <TransactionsList /> component to fetch the
  // the missing data.
  const childChainTokensHashmap = useCallback(async () => {
    if (!from?.web3Provider) return {};

    if (!from?.walletAddress) return {};

    const childChainId = getL2ChainId(checkout.config);

    try {
      const data = await checkout.getAllBalances({
        provider: from?.web3Provider,
        walletAddress: from?.walletAddress,
        chainId: childChainId,
      });
      return data.balances.reduce((out, current) => {
        // eslint-disable-next-line no-param-reassign
        out[current.token.address!.toLowerCase()] = current.token;
        return out;
      }, {});
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return [];
    }
  }, [checkout, from]);

  const getTokensDetails = async (tokensWithChainSlug: {
    [p: string]: string;
  }) => {
    const rootChainName = getChainSlugById(getL1ChainId(checkout.config));
    const childChainName = getChainSlugById(getL2ChainId(checkout.config));

    const [rootData, childData] = await Promise.all([
      rootChainTokensHashmap(),
      childChainTokensHashmap(),
    ]);

    // Fetch the data for the missing tokens: tokensWithChainSlug
    const missingTokens: { [k: string]: string } = {};
    Object.entries(tokensWithChainSlug).forEach(([key, value]) => {
      if (
        (tokensWithChainSlug[key] === rootChainName && !rootData[key])
        || (tokensWithChainSlug[key] === childChainName && !childData[key])
      ) missingTokens[key] = value;
    });
    // Root provider is always L1
    const rootProvider = new JsonRpcProvider(
      checkout.config.networkMap.get(getL1ChainId(checkout.config))?.rpcUrls[0],
    );

    // Child provider is always L2
    const childProvider = new JsonRpcProvider(
      checkout.config.networkMap.get(getL2ChainId(checkout.config))?.rpcUrls[0],
    );

    const rootTokenInfoPromises: Promise<TokenInfo | undefined>[] = [];
    const childTokenInfoPromises: Promise<TokenInfo | undefined>[] = [];

    Object.entries(missingTokens).forEach(([tokenAddress, chainName]) => {
      if (chainName === rootChainName) {
        // Root provider
        rootTokenInfoPromises.push(
          checkout.getTokenInfo({
            provider: rootProvider,
            tokenAddress,
          }),
        );
      } else {
        // child provider
        childTokenInfoPromises.push(
          checkout.getTokenInfo({
            provider: childProvider,
            tokenAddress,
          }),
        );
      }
    });
    const rootTokenInfo = await Promise.allSettled(rootTokenInfoPromises);
    const childTokenInfo = await Promise.allSettled(childTokenInfoPromises);

    (
      rootTokenInfo.filter(
        (result) => result.status === 'fulfilled',
      ) as PromiseFulfilledResult<TokenInfo>[]
    ).forEach((result) => {
      const resp = result;
      rootData[resp.value.address!.toLowerCase()] = resp.value;
    });

    (
      childTokenInfo.filter(
        (result) => result.status === 'fulfilled',
      ) as PromiseFulfilledResult<TokenInfo>[]
    ).forEach((result) => {
      const resp = result;
      childData[resp.value.address!.toLowerCase()] = resp.value;
    });

    const allTokenSymbols: string[] = [];
    Object.values(rootData).forEach((token) => allTokenSymbols.push((token as TokenInfo).symbol.toLowerCase()));
    Object.values(childData).forEach((token) => allTokenSymbols.push((token as TokenInfo).symbol.toLowerCase()));

    cryptoFiatDispatch({
      payload: {
        type: CryptoFiatActions.SET_TOKEN_SYMBOLS,
        tokenSymbols: allTokenSymbols,
      },
    });

    return { [rootChainName]: rootData, [childChainName]: childData };
  };

  const getTransactionsDetails = useCallback(
    async (env: Environment, address: string) => {
      const client = new CheckoutApi({ env });
      return client.getTransactions({
        txType: TransactionType.BRIDGE,
        fromAddress: address,
      });
    },
    [],
  );

  const handleWalletChange = useCallback(
    async (event: WalletChangeEvent) => {
      track({
        userJourney: UserJourney.BRIDGE,
        screen: 'EmptyStateNotConnected',
        control: 'WalletProvider',
        controlType: 'Select',
        extras: {
          walletProviderName: event.providerDetail.info.name,
        },
      });

      try {
        let changeAccount = false;
        if (event.providerDetail.info.rdns === WalletProviderRdns.METAMASK) {
          changeAccount = true;
        }
        const web3Provider = new BrowserProvider(event.provider as any);
        const connectedProvider = await connectToProvider(checkout, web3Provider, changeAccount);
        const network = await connectedProvider.getNetwork();
        const address = await (await connectedProvider.getSigner()).getAddress();

        setTxs([]);
        bridgeDispatch({
          payload: {
            type: BridgeActions.SET_WALLETS_AND_NETWORKS,
            from: {
              web3Provider: connectedProvider,
              walletProviderInfo: {
                ...event.providerDetail.info,
              },
              walletAddress: address.toLowerCase(),
              network: network.chainId as unknown as ChainId,
            },
            to: null,
          },
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      } finally {
        setShowWalletDrawer(false);
      }
    },
    [checkout],
  );

  const handleBackButtonClick = () => {
    if (from) {
      bridgeDispatch({
        payload: {
          type: BridgeActions.SET_WALLETS_AND_NETWORKS,
          from: {
            web3Provider: from?.web3Provider,
            walletAddress: from?.walletAddress,
            walletProviderInfo: from?.walletProviderInfo,
            network: from?.network,
          },
          to: null,
        },
      });
      bridgeDispatch({
        payload: {
          type: BridgeActions.SET_TOKEN_AND_AMOUNT,
          token: null,
          amount: '',
        },
      });
    }

    onBackButtonClick();
  };

  const fetchData = useCallback(async () => {
    if (!from?.walletAddress) return undefined;

    const localTxs = await getTransactionsDetails(
      checkout.config.environment,
      from?.walletAddress,
    );

    const tokensWithChainSlug: { [k: string]: string } = {};
    localTxs.result.forEach((txn) => {
      tokensWithChainSlug[txn.details.from_token_address] = txn.details.from_chain;
    });

    return {
      tokens: await getTokensDetails(tokensWithChainSlug),
      transactions: localTxs.result,
    };
  }, [from, getTransactionsDetails]);

  const { providers } = useInjectedProviders({ checkout });
  const walletOptions = useMemo(() => providers, [providers]);

  // Fetch all the data at once
  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await retry(fetchData, DEFAULT_TRANSACTIONS_RETRY_POLICY);
      if (!data) {
        setLoading(false);
        return;
      }

      const knownTxs = data.transactions.filter((txn) => {
        const tokens = data.tokens[txn.details.from_chain];
        if (!tokens) return false;

        const token = tokens[txn.details.from_token_address.toLowerCase()];
        if (!token) return false;

        return true;
      });

      setKnownTokenMap(data.tokens);
      setTxs(knownTxs);

      setLoading(false);
    })();
  }, [from, checkout]);

  useEffect(() => {
    page({
      userJourney: UserJourney.BRIDGE,
      screen: 'Transactions',
    });
  }, []);

  return (
    <SimpleLayout
      testId="bridge-view"
      header={(
        <HeaderNavigation
          showBack
          onBackButtonClick={handleBackButtonClick}
          title={t('views.TRANSACTIONS.layoutHeading')}
          onCloseButtonClick={() => sendBridgeWidgetCloseEvent(eventTarget)}
        />
      )}
      footer={<FooterLogo />}
    >
      <Box sx={transactionsContainerStyle}>
        <Box sx={transactionsListContainerStyle}>
          {!from?.web3Provider && (
            <EmptyStateNotConnected
              openWalletDrawer={() => setShowWalletDrawer(true)}
            />
          )}
          {from?.web3Provider && loading && <Shimmer />}
          {from?.web3Provider
            && !loading
            && txs.length > 0
            && knownTokenMap && (
              <TransactionList
                checkout={checkout}
                transactions={txs}
                knownTokenMap={knownTokenMap}
                isPassport={isPassport}
                defaultTokenImage={defaultTokenImage}
                changeWallet={() => setShowWalletDrawer(true)}
              />
          )}
          {from?.web3Provider && !loading && txs.length === 0 && (
            <NoTransactions
              checkout={checkout}
              isPassport={isPassport}
              changeWallet={() => setShowWalletDrawer(true)}
            />
          )}
        </Box>
        {from?.web3Provider && txs.length > 0 && (
          <Box sx={supportBoxContainerStyle}>
            <SupportMessage checkout={checkout} isPassport={isPassport} />
          </Box>
        )}
        <WalletDrawer
          testId="select-wallet-drawer"
          drawerText={{
            heading: t('views.TRANSACTIONS.walletSelection.heading'),
          }}
          showWalletSelectorTarget={false}
          walletOptions={walletOptions}
          showDrawer={showWalletDrawer}
          setShowDrawer={(show: boolean) => {
            setShowWalletDrawer(show);
          }}
          onWalletChange={handleWalletChange}
        />
      </Box>
    </SimpleLayout>
  );
}
