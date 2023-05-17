import { Seaport as SeaportLib } from '@opensea/seaport-js';
import { ItemType } from '@opensea/seaport-js/lib/constants';
import { Signer } from '@opensea/seaport-js/lib/types';
import { PopulatedTransaction, providers } from 'ethers';
import {
  ERC20Item, ERC721Item, NativeItem, RoyaltyInfo,
} from 'types';

export class Seaport {
  private seaport: SeaportLib;

  constructor(
    seaportContractAddress: string,
    private readonly zoneContractAddress: string,
    provider: providers.JsonRpcProvider | Signer,
  ) {
    this.seaport = new SeaportLib(provider, {
      seaportVersion: '1.4',
      balanceAndApprovalChecksOnOrderCreation: true,
      overrides: {
        contractAddress: seaportContractAddress,
      },
    });
  }

  async constructSeaportOrder(
    offerer: string,
    listingItem: ERC721Item,
    considerationItem: ERC20Item | NativeItem,
    royaltyInfo: RoyaltyInfo,
    orderExpiry: Date,
  ): Promise<{ approvalTransaction: PopulatedTransaction | undefined, orderMessageToSign: string }> {
    const { actions } = await this.seaport.createOrder({
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

    let approvalTransaction: PopulatedTransaction | undefined;
    let orderMessageToSign = '';

    for (const action of actions) {
      if (action.type === 'approval') {
        approvalTransaction = await action.transactionMethods.buildTransaction();
        approvalTransaction.gasLimit = await action.transactionMethods.estimateGas();
        // Add 20% more gas than estimate to prevent out of gas errors
        // This can always be overwritten by the user signing the transaction
        approvalTransaction.gasLimit = approvalTransaction.gasLimit.add(approvalTransaction.gasLimit.div(5));
      }

      if (action.type === 'create') {
        orderMessageToSign = await action.getMessageToSign();
      }
    }

    return { approvalTransaction, orderMessageToSign };
  }
}
