import React, { useState, useEffect, useMemo } from 'react';
import {
  BiomeThemeProvider, Box, Heading, Button, Body,
} from '@biom3/react';
import { BaseTokens, onDarkBase, onLightBase } from '@biom3/design-tokens';
import { WidgetTheme } from '@imtbl/checkout-widgets';
import {
  ChainId,
  Checkout,
  ConnectionProviders,
  Transaction,
} from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { Environment } from '@imtbl/config';
import { buyWidgetStyle } from './BuyStyles';
// TODO: fix circular dependency
// eslint-disable-next-line import/no-cycle
import AssetDetails from './AssetDetails';
// TODO: fix circular dependency
// eslint-disable-next-line import/no-cycle
import BuyButton from './BuyButton';
import {
  sendBuyWidgetCloseEvent,
  sendBuyWidgetNotConnectedEvent,
} from './BuyWidgetEvents';

export enum BuyWidgetViews {
  BUY = 'BUY',
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
}

export type GetAssetResponse = {
  image: string;
  name: string;
  collection: {
    address: string;
    name: string;
  };
};

export type BuyFees = {
  amount: {
    bn: BigNumber;
    formatted: string;
  };
  token: {
    address: string;
    name: string;
    symbol: string;
    decimal: number;
    icon: string;
  };
  type: string;
  recipient: string;
}[];

export type GetOrderResponse = {
  accountAddress: string;
  buy: {
    itemType: string;
    token: {
      address: string;
      name: string;
      symbol: string;
      decimal: number;
      icon: string;
    };
    amount: {
      bn: BigNumber;
      formatted: string;
    };
  };
  sell: {
    token: string;
    tokenIdentifier: string;
  };
  buyFees: BuyFees;
  chainId: string;
  createTime: string;
  endTime: string;
  id: string;
  status: string;
};
export interface BuyWidgetProps {
  params: BuyWidgetParams;
  theme: WidgetTheme;
  environment: Environment;
}

export interface BuyWidgetParams {
  providerPreference: ConnectionProviders;
  orderId: string;
}

class Asset {
  public static async getAsset(
    // eslint-disable-next-line
    tokenAddress: string,
    // eslint-disable-next-line
    tokenId: string,
  ): Promise<GetAssetResponse> {
    return {
      image: 'https://card.godsunchained.com/?id=1659&q=4',
      name: 'Furious Felid',
      collection: {
        address: '0xacb3c6a43d15b907e8433077b6d38ae40936fe2c',
        name: 'Gods Unchained Cards',
      },
    };
  }
}

export class Orderbook {
  private provider: Web3Provider;

  constructor(provider: Web3Provider) {
    this.provider = provider;
  }

  public async createOrder(
    // eslint-disable-next-line
    chainId: ChainId,
    // eslint-disable-next-line
    orderId: string,
  ): Promise<Transaction> {
    // Stubbed exchange.getTransaction
    return {
      nonce: '0x00', // ignored by MetaMask
      gasPrice: '0x000', // customizable by user during MetaMask confirmation.
      gas: '0x000', // customizable by user during MetaMask confirmation.
      to: '', // To address.
      from: '', // User's active address.
      value: '0x00', // Only required to send ether to the recipient from the initiating external account.
      data: '0x000', // Optional, but used for defining smart contract creation and interaction.
      chainId: 5, // Used to prevent transaction reuse across blockchains. Auto-filled by MetaMask.
    };
  }

  public async getOrder(
    // eslint-disable-next-line
    chainId: number,
    // eslint-disable-next-line
    orderId: string,
  ): Promise<GetOrderResponse> {
    const imxToken = {
      address: '',
      name: 'Immutable X',
      symbol: 'IMX',
      decimal: 18,
      // eslint-disable-next-line
      icon: "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3Csvg version='1.1' id='Layer_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 139 113' style='enable-background:new 0 0 139 113;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bclip-path:url(%23SVGID_00000053504646934646330740000009134454895836103350_);%7D .st1%7Bfill:%2317B5CB;%7D%0A%3C/style%3E%3Cg%3E%3Cdefs%3E%3Crect id='SVGID_1_' width='139' height='113'/%3E%3C/defs%3E%3CclipPath id='SVGID_00000035518931339590433170000002358037249938198420_'%3E%3Cuse xlink:href='%23SVGID_1_' style='overflow:visible;'/%3E%3C/clipPath%3E%3Cg style='clip-path:url(%23SVGID_00000035518931339590433170000002358037249938198420_);'%3E%3Cpath class='st1' d='M124.1,0h14.6L79.5,67.6c-1.5,1.7-1.6,4.3-0.1,6.1l34.1,39.7H98.3L66.8,76.6l-1.6-2c-1.5-1.7-1.4-4.4,0.1-6.1 L124.1,0z'/%3E%3Cpath class='st1' d='M91.2,73.7c-1-1.1-1.3-2.7-1-4.1c0.3-0.8,0.8-1.6,1.4-2.2l3.9-4.3l43.5,50.3h-13.8 C125.2,113.4,99.7,83.6,91.2,73.7z'/%3E%3Cpath class='st1' d='M15.2,113.4H0l46.6-53.9c1.5-1.7,1.5-4.3,0-6L0.4,0H15l46.5,53.9c1.2,1.6,1.4,3.9,0.1,5.4 C49.4,73.4,15.2,113.4,15.2,113.4z'/%3E%3Cpath class='st1' d='M40.6,0h-14l43.1,49.9c0,0,0.1-0.1,4.9-5.8c1.3-1.5,1.6-3.4,0.1-4.9C65.7,30,40.6,0,40.6,0z'/%3E%3Cpath class='st1' d='M82.6,34.8L112.5,0H98.3L82.7,18.2l-4.5,5.3c-1.5,1.7-1.6,4.3-0.1,6.1C79.2,30.9,82.6,34.8,82.6,34.8z'/%3E%3Cpath class='st1' d='M56.6,78.6l-29.9,34.8h14.1l15.6-18.2l4.5-5.3c1.5-1.7,1.6-4.3,0.1-6.1C59.9,82.5,56.6,78.6,56.6,78.6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E%0A",
    };

    return {
      accountAddress: '0x96654086969DCaa88933E753Aa52d46EAB269Ff7',
      buy: {
        itemType: 'IMX',
        token: imxToken,
        amount: {
          bn: BigNumber.from('10000000000000000000'),
          formatted: '10.0',
        },
      },
      sell: {
        token: '0x20c',
        tokenIdentifier: '12345',
      },
      buyFees: [
        {
          amount: {
            bn: BigNumber.from('10000000000000000'),
            formatted: '0.01',
          },
          token: imxToken,
          type: 'ROYALTY',
          recipient: '0x1bc',
        },
        {
          amount: {
            bn: BigNumber.from('20000000000000000'),
            formatted: '0.02',
          },
          token: imxToken,
          type: 'ROYALTY',
          recipient: '0x2de',
        },
      ],
      chainId: '1',
      createTime: new Date().getTime().toString(),
      endTime: new Date(new Date().getTime() + 60 * 60000).toString(),
      id: '1',
      status: 'ACTIVE',
    };
  }
}

export function BuyWidget({
  environment,
  params: { providerPreference, orderId },
  theme,
}: BuyWidgetProps) {
  const checkout = useMemo(
    () => new Checkout({ baseConfig: { environment } }),
    [environment],
  );
  const [provider, setProvider] = useState<Web3Provider>();
  const [orderbook, setOrderbook] = useState<Orderbook>();
  const [connectedChainId, setConnectedChainId] = useState<ChainId>();
  const [order, setOrder] = useState<GetOrderResponse>();
  const [asset, setAsset] = useState<GetAssetResponse>();
  const [view, setView] = useState(BuyWidgetViews.BUY);
  const biomeTheme: BaseTokens = theme.toLowerCase() === WidgetTheme.LIGHT.toLowerCase()
    ? onLightBase
    : onDarkBase;

  useEffect(() => {
    const buyWidgetSetup = async () => {
      if (
        (await checkout.checkIsWalletConnected({ providerPreference }))
          .isConnected
      ) {
        const connectResult = await checkout.connect({ providerPreference });
        const { chainId } = connectResult.network;
        const theProvider = connectResult.provider;
        const ordrbk = new Orderbook(theProvider);
        // TODO: Variable is declared in the upper scope
        // eslint-disable-next-line
        const order = await ordrbk.getOrder(chainId, orderId);
        // TODO: Variable is declared in the upper scope
        // eslint-disable-next-line
        const asset = await Asset.getAsset(
          order.sell.token,
          order.sell.tokenIdentifier,
        );

        setProvider(theProvider);
        setConnectedChainId(chainId);
        setOrderbook(ordrbk);
        setOrder(order);
        setAsset(asset);
      } else {
        sendBuyWidgetNotConnectedEvent(providerPreference);
      }
    };

    buyWidgetSetup();
  }, [checkout, providerPreference, orderId]);

  const renderAssetDetails = () => (
    order
      && asset
      && provider && (
        <>
          <AssetDetails order={order} asset={asset} />
          <BuyButton
            order={order}
            checkout={checkout}
            provider={provider}
            chainId={connectedChainId!}
            orderbook={orderbook!}
            updateView={setView}
          />
        </>
    )
  );

  const renderSuccess = () => <Body>Success</Body>;

  const renderFailure = () => <Body>Failure</Body>;

  return (
    <BiomeThemeProvider theme={{ base: biomeTheme }}>
      <Box sx={buyWidgetStyle}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Heading testId="heading">Buy Widget</Heading>
          <Button
            size="small"
            sx={{ alignSelf: 'flex-end' }}
            testId="close-button"
            onClick={sendBuyWidgetCloseEvent}
          >
            x
          </Button>
        </Box>
        {view === BuyWidgetViews.BUY && renderAssetDetails()}
        {view === BuyWidgetViews.SUCCESS && renderSuccess()}
        {view === BuyWidgetViews.FAIL && renderFailure()}
      </Box>
    </BiomeThemeProvider>
  );
}
