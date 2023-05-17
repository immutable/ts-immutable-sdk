import { EIP_712_ORDER_TYPE, SEAPORT_CONTRACT_NAME, SEAPORT_CONTRACT_VERSION_V1_4 } from '@opensea/seaport-js/lib/constants';
import { OrderComponents } from '@opensea/seaport-js/lib/types';
import { OrderbookModuleConfiguration } from 'config/config';
import { ERC721 } from 'erc721';
import { BigNumber } from 'ethers';
import {
  OrderBookClient, Order, BuyItem, SellItem, ProtocolData, Fee,
} from 'openapi/sdk';
import { Seaport } from 'seaport';
import { CreateOrderParams, PrepareListingParams, PrepareListingResponse } from 'types';

export class Orderbook {
  private orderbookClient: OrderBookClient;

  private chainId: string;

  constructor(private config: OrderbookModuleConfiguration) {
    // TODO: Move endpoint lookup to a map based on env. Just using override to get dev started
    const apiEndpoint = config.overrides?.apiEndpoint;
    if (!apiEndpoint) {
      throw new Error('API endpoint must be provided as an override');
    }

    // TODO: Move chainId lookup to a map based on env. Just using override to get dev started
    const chainId = config.overrides?.chainId;
    if (!chainId) {
      throw new Error('ChainID must be provided as an override');
    }

    this.chainId = chainId;
    this.orderbookClient = config.overrides?.orderbookClient || new OrderBookClient({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      BASE: apiEndpoint,
    });
  }

  getOrder(orderId: string): Promise<Order> {
    return this.orderbookClient.orderBook.orderBookGetOrder({ chainId: this.chainId, orderId });
  }

  async prepareListing({
    offerer, listingItem, considerationItem, orderExpiry,
  }: PrepareListingParams): Promise<PrepareListingResponse> {
    const royaltyInfo = await new ERC721(listingItem.contractAddress, this.config.provider)
      .royaltyInfo(listingItem.tokenId, considerationItem.amount);

    const seaport = new Seaport(
      this.config.seaportContractAddress,
      this.config.zoneContractAddress,
      this.config.provider,
    );

    const { approvalTransaction, orderMessageToSign } = await seaport.constructSeaportOrder(
      offerer,
      listingItem,
      considerationItem,
      royaltyInfo,
      // Default order expiry to 2 years from now
      orderExpiry || new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 2),
    );

    const typedData = JSON.parse(orderMessageToSign);
    const transformedMessage = typedData.message;
    const { chainId } = await this.config.provider.getNetwork();

    const domainData = {
      name: SEAPORT_CONTRACT_NAME,
      version: SEAPORT_CONTRACT_VERSION_V1_4,
      chainId,
      verifyingContract: this.config.seaportContractAddress,
    };

    const orderComponents: OrderComponents = transformedMessage;
    orderComponents.salt = BigNumber.from(orderComponents.salt).toHexString();
    const orderHash = await seaport.getOrderHash(orderComponents);

    return {
      orderComponents,
      unsignedApprovalTransaction: approvalTransaction,
      typedOrderMessageForSigning: {
        domain: domainData,
        types: EIP_712_ORDER_TYPE,
        value: transformedMessage,
      },
      orderHash,
    };
  }

  createOrder({
    orderHash, orderComponents, offerer, orderSignature,
  }: CreateOrderParams): Promise<Order> {
    // TODO: Add validation
    return this.orderbookClient.orderBook.orderBookCreateOrder({
      chainId: this.chainId,
      requestBody: {
        order_hash: orderHash,
        account_address: offerer,
        buy: [
          {
            item_type: BuyItem.item_type.IMX,
            start_amount: orderComponents.consideration[0].startAmount,
          }],
        buy_fees: orderComponents.consideration.length > 1
          ? [
            {
              amount: orderComponents.consideration[1].startAmount,
              recipient: orderComponents.consideration[1].recipient,
              fee_type: Fee.fee_type.ROYALTY,
            },
          ]
          : [],
        end_time: new Date(parseInt(`${orderComponents.endTime.toString()}000`, 10)).toISOString(),
        protocol_data: {
          order_type: ProtocolData.order_type.FULL_OPEN,
        },
        salt: orderComponents.salt,
        sell: [{
          contract_address: orderComponents.offer[0].token,
          token_id: orderComponents.offer[0].identifierOrCriteria,
          item_type: SellItem.item_type.ERC721,
        }],
        signature: orderSignature,
        start_time: new Date(parseInt(`${orderComponents.startTime.toString()}000`, 10)).toISOString(),
      },
    });
  }
}
