import { Seaport as SeaportLib } from '@opensea/seaport-js';
import type {
  ConsiderationInputItem,
  CreateBulkOrdersAction,
  CreateInputItem,
  CreateOrderAction,
  ExchangeAction,
  InputCriteria,
  OrderComponents,
  OrderUseCase,
} from '@opensea/seaport-js/lib/types';
import { JsonRpcProvider } from 'ethers';
import { mapOrderFromOpenApiOrder } from '../openapi/mapper';
import { Order as OpenApiOrder } from '../openapi/sdk';
import {
  Action,
  ActionType,
  ERC1155CollectionItem,
  ERC1155Item,
  ERC20Item,
  ERC721CollectionItem,
  ERC721Item,
  FulfillOrderResponse,
  NativeItem,
  PrepareBulkSeaportOrders,
  PrepareOrderResponse,
  SignableAction,
  SignablePurpose,
  TransactionAction,
  TransactionPurpose,
} from '../types';
import { exhaustiveSwitch } from '../utils';
import {
  getBulkOrderComponentsFromMessage,
  getOrderComponentsFromMessage,
} from './components';
import {
  EIP_712_ORDER_TYPE,
  ItemType,
  SEAPORT_CONTRACT_NAME,
  SEAPORT_CONTRACT_VERSION_V1_5,
} from './constants';
import { mapImmutableOrderToSeaportOrderComponents } from './map-to-seaport-order';
import { SeaportLibFactory } from './seaport-lib-factory';
import { prepareTransaction } from './transaction';

type FulfillmentOrderDetails = Parameters<SeaportLib['fulfillOrders']>[0]['fulfillOrderDetails'][0] & { extraData: string };

function mapImmutableSdkItemToSeaportSdkCreateInputItem(
  item: ERC20Item | ERC721Item | ERC1155Item,
): CreateInputItem {
  switch (item.type) {
    case 'ERC20':
      return {
        token: item.contractAddress,
        amount: item.amount,
      };
    case 'ERC721':
      return {
        itemType: ItemType.ERC721,
        token: item.contractAddress,
        identifier: item.tokenId,
      };
    case 'ERC1155':
      return {
        itemType: ItemType.ERC1155,
        token: item.contractAddress,
        identifier: item.tokenId,
        amount: item.amount,
      };
    default:
      return exhaustiveSwitch(item);
  }
}

function mapImmutableSdkItemToSeaportSdkConsiderationInputItem(
  item:
  | NativeItem
  | ERC20Item
  | ERC721Item
  | ERC1155Item
  | ERC721CollectionItem
  | ERC1155CollectionItem,
  recipient: string,
): ConsiderationInputItem {
  switch (item.type) {
    case 'NATIVE':
      return {
        amount: item.amount,
        recipient,
      };
    case 'ERC20':
      return {
        token: item.contractAddress,
        amount: item.amount,
        recipient,
      };
    case 'ERC721':
      return {
        itemType: ItemType.ERC721,
        token: item.contractAddress,
        identifier: item.tokenId,
        recipient,
      };
    case 'ERC1155':
      return {
        itemType: ItemType.ERC1155,
        token: item.contractAddress,
        identifier: item.tokenId,
        amount: item.amount,
        recipient,
      };
    case 'ERC721_COLLECTION':
      return {
        // seaport will handle mapping an ERC721 item with no identifier to a criteria based item
        itemType: ItemType.ERC721,
        token: item.contractAddress,
        amount: item.amount,
        identifiers: [],
        recipient,
      };
    case 'ERC1155_COLLECTION':
      return {
        // seaport will handle mapping an ERC1155 item with no identifier to a criteria based item
        itemType: ItemType.ERC1155,
        token: item.contractAddress,
        amount: item.amount,
        identifiers: [],
        recipient,
      };
    default:
      return exhaustiveSwitch(item);
  }
}

export class Seaport {
  constructor(
    private seaportLibFactory: SeaportLibFactory,
    private provider: JsonRpcProvider,
    private seaportContractAddress: string,
    private zoneContractAddress: string,
    private rateLimitingKey?: string,
  ) {}

  async prepareBulkSeaportOrders(
    offerer: string,
    orderInputs: {
      offerItem: ERC20Item | ERC721Item | ERC1155Item;
      considerationItem:
      | NativeItem
      | ERC20Item
      | ERC721Item
      | ERC1155Item
      | ERC721CollectionItem
      | ERC1155CollectionItem;
      allowPartialFills: boolean;
      orderStart: Date;
      orderExpiry: Date;
    }[],
  ): Promise<PrepareBulkSeaportOrders> {
    const { actions: seaportActions } = await this.createSeaportOrders(
      offerer,
      orderInputs,
    );

    const approvalActions = seaportActions.filter(
      (action) => action.type === 'approval',
    );

    const network = await this.provider.getNetwork();
    const actions: Action[] = approvalActions.map((approvalAction) => ({
      type: ActionType.TRANSACTION,
      purpose: TransactionPurpose.APPROVAL,
      buildTransaction: prepareTransaction(
        approvalAction.transactionMethods,
        network.chainId,
        offerer,
      ),
    }));

    const createAction: CreateBulkOrdersAction | undefined = seaportActions.find((action) => action.type === 'createBulk');

    if (!createAction) {
      throw new Error('No create bulk order action found');
    }

    const orderMessageToSign = await createAction.getMessageToSign();
    const { components, types, value } = getBulkOrderComponentsFromMessage(orderMessageToSign);

    actions.push({
      type: ActionType.SIGNABLE,
      purpose: SignablePurpose.CREATE_ORDER,
      message: await this.getTypedDataFromBulkOrderComponents(types, value),
    });

    return {
      actions,
      preparedOrders: components.map((orderComponent) => ({
        orderComponents: orderComponent,
        orderHash: this.getSeaportLib().getOrderHash(orderComponent),
      })),
    };
  }

  async prepareSeaportOrder(
    offerer: string,
    offerItem: ERC20Item | ERC721Item | ERC1155Item,
    considerationItem:
    | NativeItem
    | ERC20Item
    | ERC721Item
    | ERC1155Item
    | ERC721CollectionItem
    | ERC1155CollectionItem,
    allowPartialFills: boolean,
    orderStart: Date,
    orderExpiry: Date,
  ): Promise<PrepareOrderResponse> {
    const { actions: seaportActions } = await this.createSeaportOrder(
      offerer,
      offerItem,
      considerationItem,
      allowPartialFills,
      orderStart,
      orderExpiry,
    );

    const actions: Action[] = [];

    const approvalAction = seaportActions.find(
      (action) => action.type === 'approval',
    );

    if (approvalAction) {
      actions.push({
        type: ActionType.TRANSACTION,
        purpose: TransactionPurpose.APPROVAL,
        buildTransaction: prepareTransaction(
          approvalAction.transactionMethods,
          (await this.provider.getNetwork()).chainId,
          offerer,
        ),
      });
    }

    const createAction: CreateOrderAction | undefined = seaportActions.find(
      (action) => action.type === 'create',
    );

    if (!createAction) {
      throw new Error('No create order action found');
    }

    const orderMessageToSign = await createAction.getMessageToSign();
    const orderComponents = getOrderComponentsFromMessage(orderMessageToSign);

    actions.push({
      type: ActionType.SIGNABLE,
      purpose: SignablePurpose.CREATE_ORDER,
      message: await this.getTypedDataFromOrderComponents(orderComponents),
    });

    return {
      actions,
      orderComponents,
      orderHash: this.getSeaportLib().getOrderHash(orderComponents),
    };
  }

  async fulfillOrder(
    order: OpenApiOrder,
    account: string,
    extraData: string,
    unitsToFill?: string,
    considerationCriteria?: InputCriteria[],
  ): Promise<FulfillOrderResponse> {
    const { orderComponents, tips } = mapImmutableOrderToSeaportOrderComponents(order);
    const seaportLib = this.getSeaportLib(order);
    const chainID = (await this.provider.getNetwork()).chainId;

    const fulfilmentOrderDetails: FulfillmentOrderDetails = {
      order: {
        parameters: orderComponents,
        signature: order.signature,
      },
      unitsToFill,
      extraData,
      tips,
    };

    if (considerationCriteria) fulfilmentOrderDetails.considerationCriteria = considerationCriteria;

    const { actions: seaportActions } = await seaportLib.fulfillOrders({
      accountAddress: account,
      fulfillOrderDetails: [fulfilmentOrderDetails],
    });

    const fulfillmentActions: TransactionAction[] = [];

    const approvalActions = seaportActions.filter(
      (action) => action.type === 'approval',
    );

    if (approvalActions.length > 0) {
      approvalActions.forEach((approvalAction) => {
        fulfillmentActions.push({
          type: ActionType.TRANSACTION,
          buildTransaction: prepareTransaction(
            approvalAction.transactionMethods,
            chainID,
            account,
          ),
          purpose: TransactionPurpose.APPROVAL,
        });
      });
    }

    const fulfilOrderAction: ExchangeAction | undefined = seaportActions.find(
      (action) => action.type === 'exchange',
    );

    if (!fulfilOrderAction) {
      throw new Error('No exchange action found');
    }

    fulfillmentActions.push({
      type: ActionType.TRANSACTION,
      buildTransaction: prepareTransaction(
        fulfilOrderAction.transactionMethods,
        chainID,
        account,
      ),
      purpose: TransactionPurpose.FULFILL_ORDER,
    });

    return {
      actions: fulfillmentActions,
      expiration: Seaport.getExpirationISOTimeFromExtraData(extraData),
      order: mapOrderFromOpenApiOrder(order),
    };
  }

  async fulfillBulkOrders(
    fulfillingOrders: {
      extraData: string;
      order: OpenApiOrder;
      unitsToFill?: string;
      considerationCriteria?: InputCriteria[];
    }[],
    account: string,
  ): Promise<{
      actions: Action[];
      expiration: string;
    }> {
    const fulfillOrderDetails = fulfillingOrders.map((o) => {
      const { orderComponents, tips } = mapImmutableOrderToSeaportOrderComponents(o.order);

      const fulfilmentOrderDetails: FulfillmentOrderDetails = {
        order: {
          parameters: orderComponents,
          signature: o.order.signature,
        },
        unitsToFill: o.unitsToFill,
        extraData: o.extraData,
        tips,
      };

      if (o.considerationCriteria && o.considerationCriteria.length > 0) {
        fulfilmentOrderDetails.considerationCriteria = o.considerationCriteria;
      }

      return fulfilmentOrderDetails;
    });

    const { actions: seaportActions } = await this.getSeaportLib().fulfillOrders({
      fulfillOrderDetails,
      accountAddress: account,
    });

    const fulfillmentActions: TransactionAction[] = [];

    const approvalActions = seaportActions.filter(
      (action) => action.type === 'approval',
    );

    const chainID = (await this.provider.getNetwork()).chainId;

    if (approvalActions.length > 0) {
      approvalActions.forEach((approvalAction) => {
        fulfillmentActions.push({
          type: ActionType.TRANSACTION,
          buildTransaction: prepareTransaction(
            approvalAction.transactionMethods,
            chainID,
            account,
          ),
          purpose: TransactionPurpose.APPROVAL,
        });
      });
    }

    const fulfilOrderAction: ExchangeAction | undefined = seaportActions.find(
      (action) => action.type === 'exchange',
    );

    if (!fulfilOrderAction) {
      throw new Error('No exchange action found');
    }

    fulfillmentActions.push({
      type: ActionType.TRANSACTION,
      buildTransaction: prepareTransaction(
        fulfilOrderAction.transactionMethods,
        (await this.provider.getNetwork()).chainId,
        account,
      ),
      purpose: TransactionPurpose.FULFILL_ORDER,
    });

    return {
      actions: fulfillmentActions,
      // return the shortest expiration out of all extraData - they should be very close
      expiration: fulfillOrderDetails
        .map((d) => Seaport.getExpirationISOTimeFromExtraData(d.extraData))
        .reduce((p, c) => (new Date(p) < new Date(c) ? p : c)),
    };
  }

  async cancelOrders(
    orders: OpenApiOrder[],
    account: string,
  ): Promise<TransactionAction> {
    const orderComponents = orders.map(
      (order) => mapImmutableOrderToSeaportOrderComponents(order).orderComponents,
    );
    const seaportLib = this.getSeaportLib(orders[0]);

    const cancellationTransaction = await seaportLib.cancelOrders(
      orderComponents,
      account,
    );

    return {
      type: ActionType.TRANSACTION,
      buildTransaction: prepareTransaction(
        cancellationTransaction,
        (await this.provider.getNetwork()).chainId,
        account,
      ),
      purpose: TransactionPurpose.CANCEL,
    };
  }

  private createSeaportOrders(
    offerer: string,
    orderInputs: {
      offerItem: ERC20Item | ERC721Item | ERC1155Item;
      considerationItem:
      | NativeItem
      | ERC20Item
      | ERC721Item
      | ERC1155Item
      | ERC721CollectionItem
      | ERC1155CollectionItem;
      allowPartialFills: boolean;
      orderStart: Date;
      orderExpiry: Date;
    }[],
  ): Promise<OrderUseCase<CreateBulkOrdersAction>> {
    const seaportLib = this.getSeaportLib();

    return seaportLib.createBulkOrders(
      orderInputs.map((orderInput) => {
        const {
          offerItem,
          considerationItem,
          allowPartialFills,
          orderStart,
          orderExpiry,
        } = orderInput;

        return {
          allowPartialFills,
          offer: [mapImmutableSdkItemToSeaportSdkCreateInputItem(offerItem)],
          consideration: [
            mapImmutableSdkItemToSeaportSdkConsiderationInputItem(
              considerationItem,
              offerer,
            ),
          ],
          startTime: (orderStart.getTime() / 1000).toFixed(0),
          endTime: (orderExpiry.getTime() / 1000).toFixed(0),
          zone: this.zoneContractAddress,
          restrictedByZone: true,
        };
      }),
      offerer,
    );
  }

  private createSeaportOrder(
    offerer: string,
    offerItem: ERC20Item | ERC721Item | ERC1155Item,
    considerationItem:
    | NativeItem
    | ERC20Item
    | ERC721Item
    | ERC1155Item
    | ERC721CollectionItem
    | ERC1155CollectionItem,
    allowPartialFills: boolean,
    orderStart: Date,
    orderExpiry: Date,
  ): Promise<OrderUseCase<CreateOrderAction>> {
    const seaportLib = this.getSeaportLib();

    return seaportLib.createOrder(
      {
        allowPartialFills,
        offer: [mapImmutableSdkItemToSeaportSdkCreateInputItem(offerItem)],
        consideration: [
          mapImmutableSdkItemToSeaportSdkConsiderationInputItem(
            considerationItem,
            offerer,
          ),
        ],
        startTime: (orderStart.getTime() / 1000).toFixed(0),
        endTime: (orderExpiry.getTime() / 1000).toFixed(0),
        zone: this.zoneContractAddress,
        restrictedByZone: true,
      },
      offerer,
    );
  }

  // Types and value are JSON parsed from the seaport-js string, so the types are
  // reflected as any
  private async getTypedDataFromBulkOrderComponents(
    types: any,
    value: any,
  ): Promise<SignableAction['message']> {
    // We must remove EIP712Domain from the types object
    // eslint-disable-next-line no-param-reassign
    delete types.EIP712Domain;
    const { chainId } = await this.provider.getNetwork();

    const domainData = {
      name: SEAPORT_CONTRACT_NAME,
      version: SEAPORT_CONTRACT_VERSION_V1_5,
      chainId,
      verifyingContract: this.seaportContractAddress,
    };

    return {
      domain: domainData,
      types,
      value,
    };
  }

  private async getTypedDataFromOrderComponents(
    orderComponents: OrderComponents,
  ): Promise<SignableAction['message']> {
    const { chainId } = await this.provider.getNetwork();

    const domainData = {
      name: SEAPORT_CONTRACT_NAME,
      version: SEAPORT_CONTRACT_VERSION_V1_5,
      chainId,
      verifyingContract: this.seaportContractAddress,
    };

    return {
      domain: domainData,
      types: EIP_712_ORDER_TYPE,
      value: orderComponents,
    };
  }

  private getSeaportLib(order?: OpenApiOrder): SeaportLib {
    const seaportAddress = order?.protocol_data?.seaport_address ?? this.seaportContractAddress;
    return this.seaportLibFactory.create(seaportAddress);
  }

  private static getExpirationISOTimeFromExtraData(extraData: string): string {
    // Expirtaion bytes in SIP7 extra data [21:29]
    // In hex string -> [21 * 2 + 2 (0x) : 29 * 2]
    // In JS slice (start, end_inclusive), (44,60)
    // 8 bytes uint64 epoch time in seconds
    const expirationHex = extraData.slice(44, 60);
    const expirationInSeconds = parseInt(expirationHex, 16);

    return new Date(expirationInSeconds * 1000).toISOString();
  }
}
