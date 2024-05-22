import { Seaport as SeaportLib } from '@opensea/seaport-js';
import {
  ApprovalAction,
  CreateInputItem,
  CreateOrderAction,
  ExchangeAction,
  OrderComponents,
  OrderUseCase,
} from '@opensea/seaport-js/lib/types';
import { providers } from 'ethers';
import { mapFromOpenApiOrder } from 'openapi/mapper';
import {
  Action,
  ActionType,
  ERC1155Item,
  ERC20Item,
  ERC721Item,
  FulfillOrderResponse,
  NativeItem,
  PrepareListingResponse,
  SignableAction,
  SignablePurpose,
  TransactionAction,
  TransactionPurpose,
} from '../types';
import { FulfillableOrder, Order, ProtocolData } from '../openapi/sdk';
import {
  EIP_712_ORDER_TYPE,
  ItemType,
  SEAPORT_CONTRACT_NAME,
  SEAPORT_CONTRACT_VERSION_V1_5,
} from './constants';
import { getOrderComponentsFromMessage } from './components';
import { SeaportLibFactory } from './seaport-lib-factory';
import { prepareTransaction } from './transaction';
import { mapImmutableOrderToSeaportOrderComponents } from './map-to-seaport-order';

export class Seaport {
  constructor(
    private seaportLibFactory: SeaportLibFactory,
    private provider: providers.JsonRpcProvider,
    private seaportContractAddress: string,
    private zoneContractAddress: string,
    private rateLimitingKey?: string,
  ) {}

  async prepareSeaportOrder(
    offerer: string,
    listingItem: ERC721Item | ERC1155Item,
    considerationItem: ERC20Item | NativeItem,
    orderStart: Date,
    orderExpiry: Date,
  ): Promise<PrepareListingResponse> {
    const { actions: seaportActions } = await this.createSeaportOrder(
      offerer,
      listingItem,
      considerationItem,
      orderStart,
      orderExpiry,
    );

    const listingActions: Action[] = [];

    const approvalAction = seaportActions.find((action) => action.type === 'approval') as
      | ApprovalAction
      | undefined;

    if (approvalAction) {
      listingActions.push({
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
    ) as CreateOrderAction | undefined;

    if (!createAction) {
      throw new Error('No create order action found');
    }

    const orderMessageToSign = await createAction.getMessageToSign();
    const orderComponents = getOrderComponentsFromMessage(orderMessageToSign);

    listingActions.push({
      type: ActionType.SIGNABLE,
      purpose: SignablePurpose.CREATE_LISTING,
      message: await this.getTypedDataFromOrderComponents(orderComponents),
    });

    return {
      actions: listingActions,
      orderComponents,
      orderHash: this.getSeaportLib().getOrderHash(orderComponents),
    };
  }

  async fulfillOrder(
    order: Order,
    account: string,
    extraData: string,
    unitsToFill?: string,
  ): Promise<FulfillOrderResponse> {
    const { orderComponents, tips } = mapImmutableOrderToSeaportOrderComponents(order);
    const seaportLib = this.getSeaportLib(order);

    let seaportActions;
    // Temporary workaround for the fees scaling issue in case of
    // partial fills when using `fulfillOrders` SDK function.
    if (order.protocol_data.order_type === ProtocolData.order_type.PARTIAL_RESTRICTED) {
      const useCase = await seaportLib.fulfillOrder({
        order: {
          parameters: orderComponents,
          signature: order.signature,
        },
        unitsToFill,
        tips,
        extraData,
        accountAddress: account,
      });

      seaportActions = useCase.actions;
    } else if (order.protocol_data.order_type === ProtocolData.order_type.FULL_RESTRICTED) {
      const useCase = await seaportLib.fulfillOrders({
        accountAddress: account,
        fulfillOrderDetails: [
          {
            order: {
              parameters: orderComponents,
              signature: order.signature,
            },
            unitsToFill,
            extraData,
            tips,
          },
        ],
      });

      seaportActions = useCase.actions;
    } else {
      throw new Error('Failed to fulfill order because order type is unknown');
    }

    const fulfillmentActions: TransactionAction[] = [];

    const approvalAction = seaportActions.find((action) => action.type === 'approval') as
      | ApprovalAction
      | undefined;

    if (approvalAction) {
      fulfillmentActions.push({
        type: ActionType.TRANSACTION,
        buildTransaction: prepareTransaction(
          approvalAction.transactionMethods,
          (await this.provider.getNetwork()).chainId,
          account,
        ),
        purpose: TransactionPurpose.APPROVAL,
      });
    }

    const fulfilOrderAction: ExchangeAction | undefined = seaportActions.find(
      (action) => action.type === 'exchange',
    ) as ExchangeAction | undefined;

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
      expiration: Seaport.getExpirationISOTimeFromExtraData(extraData),
      order: mapFromOpenApiOrder(order),
    };
  }

  async fulfillBulkOrders(
    fulfillingOrders: Array<FulfillableOrder>,
    account: string,
  ): Promise<{
      actions: Action[];
      expiration: string;
    }> {
    const fulfillOrderDetails = fulfillingOrders.map((o) => {
      const { orderComponents, tips } = mapImmutableOrderToSeaportOrderComponents(o.order);

      return {
        order: {
          parameters: orderComponents,
          signature: o.order.signature,
        },
        extraData: o.extra_data,
        tips,
      };
    });

    const { actions: seaportActions } = await this.getSeaportLib().fulfillOrders({
      fulfillOrderDetails,
      accountAddress: account,
    });

    const fulfillmentActions: TransactionAction[] = [];

    const approvalAction = seaportActions.find((action) => action.type === 'approval') as
      | ApprovalAction
      | undefined;

    if (approvalAction) {
      fulfillmentActions.push({
        type: ActionType.TRANSACTION,
        buildTransaction: prepareTransaction(
          approvalAction.transactionMethods,
          (await this.provider.getNetwork()).chainId,
          account,
        ),
        purpose: TransactionPurpose.APPROVAL,
      });
    }

    const fulfilOrderAction: ExchangeAction | undefined = seaportActions.find(
      (action) => action.type === 'exchange',
    ) as ExchangeAction | undefined;

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

  async cancelOrders(orders: Order[], account: string): Promise<TransactionAction> {
    const orderComponents = orders.map(
      (order) => mapImmutableOrderToSeaportOrderComponents(order).orderComponents,
    );
    const seaportLib = this.getSeaportLib(orders[0]);

    const cancellationTransaction = await seaportLib.cancelOrders(orderComponents, account);

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

  private createSeaportOrder(
    offerer: string,
    listingItem: ERC721Item | ERC1155Item,
    considerationItem: ERC20Item | NativeItem,
    orderStart: Date,
    orderExpiry: Date,
  ): Promise<OrderUseCase<CreateOrderAction>> {
    const seaportLib = this.getSeaportLib();

    const offerItem: CreateInputItem = listingItem.type === 'ERC721'
      ? {
        itemType: ItemType.ERC721,
        token: listingItem.contractAddress,
        identifier: listingItem.tokenId,
      }
      : {
        itemType: ItemType.ERC1155,
        token: listingItem.contractAddress,
        identifier: listingItem.tokenId,
        amount: listingItem.amount,
      };

    return seaportLib.createOrder(
      {
        allowPartialFills: listingItem.type === 'ERC1155',
        offer: [offerItem],
        consideration: [
          {
            token:
              considerationItem.type === 'ERC20' ? considerationItem.contractAddress : undefined,
            amount: considerationItem.amount,
            recipient: offerer,
          },
        ],
        startTime: (orderStart.getTime() / 1000).toFixed(0),
        endTime: (orderExpiry.getTime() / 1000).toFixed(0),
        zone: this.zoneContractAddress,
        restrictedByZone: true,
      },
      offerer,
    );
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

  private getSeaportLib(order?: Order): SeaportLib {
    const seaportAddress = order?.protocol_data?.seaport_address ?? this.seaportContractAddress;
    return this.seaportLibFactory.create(seaportAddress, this.rateLimitingKey);
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
