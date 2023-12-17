import { HeaderNavigation } from 'components/Header/HeaderNavigation';
import { SimpleLayout } from 'components/SimpleLayout/SimpleLayout';
import { FooterLogo } from 'components/Footer/FooterLogo';
import {
  useCallback, useContext, useEffect, useState,
} from 'react';
import { EventTargetContext } from 'context/event-target-context/EventTargetContext';
import { text } from 'resources/text/textConfig';
import { BridgeWidgetViews } from 'context/view-context/BridgeViewContextTypes';
import { Box } from '@biom3/react';
import { createAndConnectToProvider, isPassportProvider } from 'lib/providerUtils';
import { Web3Provider } from '@ethersproject/providers';
import {
  Checkout,
  TokenInfo,
  WalletProviderName,
} from '@imtbl/checkout-sdk';
import { DEFAULT_TRANSACTIONS_RETRY_POLICY, getL1ChainId, getL2ChainId } from 'lib';
import {
  CheckoutApi, Transaction, TransactionType,
} from 'lib/clients';
import { Environment } from '@imtbl/config';
import { retry } from 'lib/retry';
import { getChainSlugById } from 'lib/chains';
import { CryptoFiatActions, CryptoFiatContext } from 'context/crypto-fiat-context/CryptoFiatContext';
import { sendBridgeWidgetCloseEvent } from '../../widgets/bridge/BridgeWidgetEvents';
import { Shimmer } from './Shimmer';
import {
  supportBoxContainerStyle,
  transactionsContainerStyle,
  transactionsListContainerStyle,
  transactionsListStyle,
} from './TransactionsStyles';
import { EmptyStateNotConnected } from './EmptyStateNotConnected';
import { SupportMessage } from './SupportMessage';
import { KnownNetworkMap } from './transactionsType';
import { TransactionsInProgress } from './TransactionsInProgress';

type TransactionsProps = {
  checkout: Checkout
};

export function Transactions({ checkout }: TransactionsProps) {
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

  const { cryptoFiatDispatch } = useContext(CryptoFiatContext);

  const { layoutHeading } = text.views[BridgeWidgetViews.TRANSACTIONS];

  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState<Web3Provider | undefined>(undefined);
  const [knownTokenMap, setKnownTokenMap] = useState<KnownNetworkMap | undefined>(undefined);
  const [txs, setTxs] = useState<Transaction[]>([]);

  const walletAddress = useCallback(async () => await provider?.getSigner().getAddress(), [provider]);
  const isPassport = isPassportProvider(provider);

  // Fetch the tokens for the root chain using the allowed tokens.
  // In case this list does not have all the tokens, there is logic
  // built into the <TransactionsInProgress /> component to fetch the
  // the missing data.
  const rootChainTokensHashmap = useCallback(async () => {
    if (!checkout) return {};

    const rootChainId = getL1ChainId(checkout.config);
    try {
      const tokens = (await checkout.config.remote.getTokensConfig(rootChainId)).allowed ?? [];
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
  // built into the <TransactionsInProgress /> component to fetch the
  // the missing data.
  const childChainTokensHashmap = useCallback(async () => {
    if (!provider) return {};

    const address = await walletAddress();
    if (!address) return {};

    const childChainId = getL2ChainId(checkout.config);

    try {
      const data = await checkout.getAllBalances({ provider, walletAddress: address, chainId: childChainId });
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
  }, [checkout, provider, walletAddress]);

  const updateAndConnectProvider = useCallback(async (walletProviderName: WalletProviderName) => {
    try {
      setProvider(await createAndConnectToProvider(checkout, walletProviderName));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  }, [checkout]);

  // eslint-disable-next-line @typescript-eslint/no-shadow
  const getTokensDetails = async (checkout: Checkout, txsTokens: string[]) => {
    const rootChainName = getChainSlugById(getL1ChainId(checkout.config));
    const childChainName = getChainSlugById(getL2ChainId(checkout.config));

    const [rootData, childData] = await Promise.all([rootChainTokensHashmap(), childChainTokensHashmap()]);

    // eslint-disable-next-line no-console
    console.log(txsTokens);
    // Fetch the data for the missing tokens: txsTokens

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

  const getTransactionsDetails = async (env: Environment, address: string) => {
    const client = new CheckoutApi({ env });
    return client.getTransactions({ txType: TransactionType.BRIDGE, fromAddress: address });
  };

  const fetchData = async () => {
    const address = await walletAddress();
    if (!address) return undefined;

    const localTxs = await getTransactionsDetails(checkout.config.environment, address);

    const tokens = localTxs.result.map((t) => t.details.from_token_address);

    return { tokens: await getTokensDetails(checkout, tokens), transactions: localTxs.result };
  };

  // Fetch all the data at once
  useEffect(() => {
    (async () => {
      const data = await retry(fetchData, DEFAULT_TRANSACTIONS_RETRY_POLICY);
      if (!data) return;

      setKnownTokenMap(data.tokens);
      setTxs(data.transactions);

      setLoading(false);
    })();
  }, [walletAddress, checkout]);

  return (
    <SimpleLayout
      testId="bridge-view"
      header={(
        <HeaderNavigation
          showBack
          title={layoutHeading}
          onCloseButtonClick={() => sendBridgeWidgetCloseEvent(eventTarget)}
        />
      )}
      footer={<FooterLogo />}
    >
      <Box sx={transactionsContainerStyle}>
        <Box sx={transactionsListContainerStyle}>
          {
            (!txs || !knownTokenMap)
              ? (
                <EmptyStateNotConnected
                  checkout={checkout}
                  updateProvider={updateAndConnectProvider}
                />
              )
              : (
                <Box sx={transactionsListStyle(isPassport)}>
                  {loading
                    ? <Shimmer />
                    : <TransactionsInProgress checkout={checkout} transactions={txs} knownTokenMap={knownTokenMap} />}
                </Box>
              )
          }
        </Box>
        {provider && (
          <Box sx={supportBoxContainerStyle}>
            <SupportMessage
              checkout={checkout}
              isPassport={isPassport}
            />
          </Box>
        )}
      </Box>
    </SimpleLayout>
  );
}
