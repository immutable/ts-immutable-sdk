import { Seaport as SeaportLib } from '@opensea/seaport-js';
import { SEAPORT_CONTRACT_VERSION_V1_4, SEAPORT_CONTRACT_VERSION_V1_5 } from '@opensea/seaport-js/lib/constants';
import {
  ApprovalAction, CreateOrderAction, ExchangeAction, OrderComponents, OrderUseCase,
} from '@opensea/seaport-js/lib/types';
import {
  PopulatedTransaction, providers,
} from 'ethers';
import {
  ERC20Item, ERC721Item, FulfillOrderResponse, NativeItem, PrepareListingResponse, RoyaltyInfo,
} from 'types';
import { Order } from 'openapi/sdk';
import {
  EIP_712_ORDER_TYPE, ItemType, SEAPORT_CONTRACT_NAME,
} from './constants';
import { getOrderComponentsFromMessage } from './components';
import { SeaportLibFactory, SeaportVersion } from './seaport-lib-factory';
import { prepareTransaction } from './transaction';
import { mapImmutableOrderToSeaportOrderComponents } from './map-to-seaport-order';

export class Seaport {
  constructor(
    private seaportLibFactory: SeaportLibFactory,
    private provider: providers.JsonRpcProvider,
    private seaportContractAddress: string,
    private zoneContractAddress: string,
  ) {}

  async prepareSeaportOrder(
    offerer: string,
    listingItem: ERC721Item,
    considerationItem: ERC20Item | NativeItem,
    royaltyInfo: RoyaltyInfo,
    orderStart: Date,
    orderExpiry: Date,
  ): Promise<PrepareListingResponse> {
    const { actions } = await this.createSeaportOrder(
      offerer,
      listingItem,
      considerationItem,
      royaltyInfo,
      orderStart,
      orderExpiry,
    );

    let approvalTransaction: PopulatedTransaction | undefined;

    const approvalAction = actions
      .find((action) => action.type === 'approval') as ApprovalAction | undefined;

    if (approvalAction) {
      approvalTransaction = await prepareTransaction(approvalAction.transactionMethods);
    }

    const createAction: CreateOrderAction | undefined = actions
      .find((action) => action.type === 'create') as CreateOrderAction | undefined;

    if (!createAction) {
      throw new Error('No create order action found');
    }

    const orderMessageToSign = await createAction.getMessageToSign();
    const orderComponents = getOrderComponentsFromMessage(orderMessageToSign);

    return {
      unsignedApprovalTransaction: approvalTransaction,
      typedOrderMessageForSigning: await this.getTypedDataFromOrderComponents(orderComponents),
      orderComponents,
      orderHash: this.getSeaportLib().getOrderHash(orderComponents),
    };
  }

  async fulfilOrder(order: Order, account: string): Promise<FulfillOrderResponse> {
    const orderComponents = await this.mapImmutableOrderToSeaportOrderComponents(order);
    const seaportLib = this.getSeaportLib(order);

    const { actions } = await seaportLib.fulfillOrders({
      accountAddress: account,
      fulfillOrderDetails: [{
        order: {
          parameters: orderComponents,
          signature: order.signature,
        },
        extraData: order.protocol_data.operator_signature,
      }],
    });

    let approvalTransaction: PopulatedTransaction | undefined;

    const approvalAction = actions
      .find((action) => action.type === 'approval') as ApprovalAction | undefined;

    if (approvalAction) {
      approvalTransaction = await prepareTransaction(approvalAction.transactionMethods);
    }

    const fulfillmentAction: ExchangeAction | undefined = actions
      .find((action) => action.type === 'exchange') as ExchangeAction | undefined;

    if (!fulfillmentAction) {
      throw new Error('No exchange action found');
    }

    const fulfillmentTransaction = await prepareTransaction(fulfillmentAction.transactionMethods);

    return {
      unsignedApprovalTransaction: approvalTransaction,
      unsignedFulfillmentTransaction: fulfillmentTransaction,
    };
  }

  async cancelOrder(order: Order, account: string): Promise<PopulatedTransaction> {
    const orderComponents = await this.mapImmutableOrderToSeaportOrderComponents(order);
    const seaportLib = this.getSeaportLib(order);

    const cancellationTransaction = await seaportLib.cancelOrders([orderComponents], account);

    return prepareTransaction(cancellationTransaction);
  }

  private mapImmutableOrderToSeaportOrderComponents(order: Order): OrderComponents {
    const orderCounter = order.protocol_data.counter;
    return mapImmutableOrderToSeaportOrderComponents(
      order,
      orderCounter,
      this.zoneContractAddress,
    );
  }

  private createSeaportOrder(
    offerer: string,
    listingItem: ERC721Item,
    considerationItem: ERC20Item | NativeItem,
    royaltyInfo: RoyaltyInfo,
    orderStart: Date,
    orderExpiry: Date,
  ): Promise<OrderUseCase<CreateOrderAction>> {
    const seaportLib = this.getSeaportLib();
    return seaportLib.createOrder({
      allowPartialFills: false,
      offer: [
        {
          itemType: ItemType.ERC721,
          token: listingItem.contractAddress,
          identifier: listingItem.tokenId,
        },
      ],
      consideration: [
        {
          token: considerationItem.type === 'ERC20' ? considerationItem.contractAddress : undefined,
          amount: considerationItem.amount,
          recipient: offerer,
        },
        {
          token: considerationItem.type === 'ERC20' ? considerationItem.contractAddress : undefined,
          amount: royaltyInfo.amountRequired,
          recipient: royaltyInfo.recipient,
        },
      ],
      startTime: (orderStart.getTime() / 1000).toFixed(0),
      endTime: (orderExpiry.getTime() / 1000).toFixed(0),
      zone: this.zoneContractAddress,
      restrictedByZone: true,
    }, offerer);
  }

  private async getTypedDataFromOrderComponents(
    orderComponents: OrderComponents,
  ): Promise<PrepareListingResponse['typedOrderMessageForSigning']> {
    const { chainId } = await this.provider.getNetwork();

    const domainData = {
      name: SEAPORT_CONTRACT_NAME,
      version: SEAPORT_CONTRACT_VERSION_V1_4,
      chainId,
      verifyingContract: this.seaportContractAddress,
    };

    return {
      domain: domainData,
      types: EIP_712_ORDER_TYPE,
      value: orderComponents,
    };
  }

  private getSeaportLib(order?: Order): SeaportLib {
    const seaportAddress = order?.protocol_data?.seaport_address ?? this.seaportContractAddress;

    let seaportVersion: SeaportVersion = SEAPORT_CONTRACT_VERSION_V1_4;
    if (order?.protocol_data?.seaport_version === SEAPORT_CONTRACT_VERSION_V1_5) {
      seaportVersion = SEAPORT_CONTRACT_VERSION_V1_5;
    }

    return this.seaportLibFactory.create(seaportVersion, seaportAddress);
  }
}
