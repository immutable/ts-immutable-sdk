import { Seaport as SeaportLib } from '@opensea/seaport-js';
import {
  ApprovalAction, CreateOrderAction, ExchangeAction, OrderComponents, OrderUseCase,
} from '@opensea/seaport-js/lib/types';
import {
  PopulatedTransaction, providers,
} from 'ethers';
import {
  Action,
  ActionType,
  ERC20Item,
  ERC721Item,
  FulfillOrderResponse,
  NativeItem,
  PrepareListingResponse,
  RoyaltyInfo,
  SignableAction,
  SignablePurpose,
  TransactionAction,
  TransactionPurpose,
} from 'types';
import { Order } from 'openapi/sdk';
import {
  EIP_712_ORDER_TYPE,
  ItemType,
  SEAPORT_CONTRACT_NAME,
  SEAPORT_CONTRACT_VERSION_V1_5,
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
    const { actions: seaportActions } = await this.createSeaportOrder(
      offerer,
      listingItem,
      considerationItem,
      royaltyInfo,
      orderStart,
      orderExpiry,
    );

    const listingActions: Action[] = [];

    const approvalAction = seaportActions
      .find((action) => action.type === 'approval') as ApprovalAction | undefined;

    if (approvalAction) {
      listingActions.push({
        type: ActionType.TRANSACTION,
        purpose: TransactionPurpose.APPROVAL,
        buildTransaction: prepareTransaction(approvalAction.transactionMethods),
      });
    }

    const createAction: CreateOrderAction | undefined = seaportActions
      .find((action) => action.type === 'create') as CreateOrderAction | undefined;

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
  ): Promise<FulfillOrderResponse> {
    const orderComponents = await this.mapImmutableOrderToSeaportOrderComponents(order);
    const seaportLib = this.getSeaportLib(order);

    const { actions: seaportActions } = await seaportLib.fulfillOrders({
      accountAddress: account,
      fulfillOrderDetails: [{
        order: {
          parameters: orderComponents,
          signature: order.signature,
        },
        extraData,
      }],
    });

    const fulfillmentActions: TransactionAction[] = [];

    const approvalAction = seaportActions
      .find((action) => action.type === 'approval') as ApprovalAction | undefined;

    if (approvalAction) {
      fulfillmentActions.push({
        type: ActionType.TRANSACTION,
        buildTransaction: prepareTransaction(approvalAction.transactionMethods),
        purpose: TransactionPurpose.APPROVAL,
      });
    }

    const fulfilOrderAction: ExchangeAction | undefined = seaportActions
      .find((action) => action.type === 'exchange') as ExchangeAction | undefined;

    if (!fulfilOrderAction) {
      throw new Error('No exchange action found');
    }

    fulfillmentActions.push({
      type: ActionType.TRANSACTION,
      buildTransaction: prepareTransaction(fulfilOrderAction.transactionMethods),
      purpose: TransactionPurpose.FULFILL_ORDER,
    });

    return { actions: fulfillmentActions };
  }

  async cancelOrder(order: Order, account: string): Promise<PopulatedTransaction> {
    const orderComponents = await this.mapImmutableOrderToSeaportOrderComponents(order);
    const seaportLib = this.getSeaportLib(order);

    const cancellationTransaction = await seaportLib.cancelOrders([orderComponents], account);

    return prepareTransaction(cancellationTransaction)();
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

    const seaportVersion: SeaportVersion = SEAPORT_CONTRACT_VERSION_V1_5;
    // if (order?.protocol_data?.seaport_version === SEAPORT_CONTRACT_VERSION_V1_5) {
    //   seaportVersion = SEAPORT_CONTRACT_VERSION_V1_5;
    // }

    return this.seaportLibFactory.create(seaportVersion, seaportAddress);
  }
}
