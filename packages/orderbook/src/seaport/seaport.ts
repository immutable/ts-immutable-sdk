import { Seaport as SeaportLib } from '@opensea/seaport-js';
import {
  EIP_712_ORDER_TYPE, ItemType, SEAPORT_CONTRACT_NAME, SEAPORT_CONTRACT_VERSION_V1_4,
} from '@opensea/seaport-js/lib/constants';
import {
  ApprovalAction, CreateOrderAction, OrderComponents, OrderUseCase,
} from '@opensea/seaport-js/lib/types';
import {
  PopulatedTransaction, providers,
} from 'ethers';
import {
  ERC20Item, ERC721Item, NativeItem, PrepareListingResponse, RoyaltyInfo,
} from 'types';
import { getOrderComponentsFromMessage } from './components';
import { prepareApprovalTransaction } from './approval';

export class Seaport {
  constructor(
    private seaport: SeaportLib,
    private provider: providers.JsonRpcProvider,
    private seaportContractAddress: string,
    private zoneContractAddress: string,
  ) {}

  async prepareSeaportOrder(
    offerer: string,
    listingItem: ERC721Item,
    considerationItem: ERC20Item | NativeItem,
    royaltyInfo: RoyaltyInfo,
    orderExpiry: Date,
  ): Promise<PrepareListingResponse> {
    const { actions } = await this.createSeaportOrder(
      offerer,
      listingItem,
      considerationItem,
      royaltyInfo,
      orderExpiry,
    );

    let approvalTransaction: PopulatedTransaction | undefined;

    const approvalAction = actions
      .find((action) => action.type === 'approval') as ApprovalAction | undefined;

    if (approvalAction) {
      approvalTransaction = await prepareApprovalTransaction(approvalAction);
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
      orderHash: await this.seaport.getOrderHash(orderComponents),
    };
  }

  private createSeaportOrder(
    offerer: string,
    listingItem: ERC721Item,
    considerationItem: ERC20Item | NativeItem,
    royaltyInfo: RoyaltyInfo,
    orderExpiry: Date,
  ): Promise<OrderUseCase<CreateOrderAction>> {
    return this.seaport.createOrder({
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
      startTime: (new Date().getTime() / 1000).toFixed(0),
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
}
