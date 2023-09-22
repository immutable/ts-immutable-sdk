/* eslint-disable no-console */
import { BiomeCombinedProviders, Box } from '@biom3/react';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';
import { Passport } from '@imtbl/passport';
import {
  useContext, useEffect, useMemo, useState,
} from 'react';
import { WidgetTheme } from '../../../lib';
import { StrongCheckoutWidgetsConfig } from '../../../lib/withDefaultWidgetConfig';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { TransakIframe } from '../components/TransakIframe';
import { ConnectLoaderContext } from '../../../context/connect-loader-context/ConnectLoaderContext';
import { Item, useMergeItemsInfo } from '../hooks/useMergeItemsInfo';
import { ViewContext } from '../../../context/view-context/ViewContext';
import { TransakNFTData } from '../hooks/useTransakIframe';
import { SignResponse } from '../hooks/useSignOrder';

export interface PayWithCardProps {
  config: StrongCheckoutWidgetsConfig;
  passport: Passport | undefined;
  items: Item[];
  currency: string;
}

export function PayWithCard({
  config,
  passport,
  items,
  currency,
}: PayWithCardProps) {
  const { theme } = config;
  // const { initialLoadingText } = text.views[PrimaryRevenueWidgetViews.PAY_WITH_CARD];
  const { viewState } = useContext(ViewContext);

  const biomeTheme: BaseTokens = theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
    ? onLightBase
    : onDarkBase;

  const [email, setEmail] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isPassport, setIsPassport] = useState<boolean>(false);

  const { connectLoaderState } = useContext(ConnectLoaderContext);
  const { provider } = connectLoaderState;

  const onOpen = () => {
    console.log('onOpen');
  };

  const onOrderCreated = () => {
    console.log('onOrderCreated');
  };

  const onOrderProcessing = () => {
    console.log('onOrderProcessing');
  };

  const onOrderCompleted = () => {
    console.log('onOrderCompleted');
  };

  const onOrderFailed = () => {
    console.log('onOrderFailed');
  };

  useEffect(() => {
    (async () => {
      setIsPassport(!!(provider?.provider as any)?.isPassport);
      setWalletAddress(await provider!.getSigner().getAddress());
      setEmail((await passport?.getUserInfo())?.email || '');
    })();
  }, []);

  const signResponse: SignResponse = viewState.view.data;
  const mergedItemsList = useMergeItemsInfo(items, signResponse);

  const executeTxn = signResponse?.transactions.find((tx) => tx.method_call.startsWith('execute'))!;
  const nftData: TransakNFTData[] = useMemo(
    () => mergedItemsList.map((item) => ({
      collectionAddress: executeTxn?.contract_address!,
      imageURL: item.image,
      nftName: item.name,
      price: item.amount,
      tokenID: item.tokenId,
      quantity: item.qty,
      nftType: 'ERC721',
    })),
    [mergedItemsList, executeTxn],
  );

  return (
    <BiomeCombinedProviders theme={{ base: biomeTheme }}>
      <Box>
        <SimpleLayout
          header={(
            <HeaderNavigation
              showBack
              title="Pay with Card"
              onCloseButtonClick={() => {}}
            />
          )}
          footerBackgroundColor="base.color.translucent.emphasis.200"
        >
          <TransakIframe
            id="transak-iframe"
            type="nft-checkout"
            email={email}
            walletAddress={walletAddress}
            isPassportWallet={isPassport}
            exchangeScreenTitle="Pay with Card"
            nftData={nftData}
            calldata={executeTxn.raw_data}
            cryptoCurrencyCode={currency}
            estimatedGasLimit={executeTxn.gas_estimate}
            smartContractAddress={executeTxn.contract_address}
            partnerOrderId={executeTxn.params.reference}
            onOpen={onOpen}
            onOrderCreated={onOrderCreated}
            onOrderProcessing={onOrderProcessing}
            onOrderCompleted={onOrderCompleted}
            onOrderFailed={onOrderFailed}
          />
        </SimpleLayout>
      </Box>
    </BiomeCombinedProviders>
  );
}
