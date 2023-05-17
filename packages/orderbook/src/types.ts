import { PopulatedTransaction } from 'ethers';

export interface ERC721Item {
  type: 'ERC721'
  contractAddress: string
  tokenId: string
}

export interface ERC20Item {
  type: 'ERC20'
  contractAddress: string
  amount: string
}

export interface NativeItem {
  type: 'IMX'
  amount: string
}

export interface RoyaltyInfo {
  recipient: string
  amountRequired: string
}

export interface PrepareListingParams {
  offerer: string
  listingItem: ERC721Item
  considerationItem: ERC20Item | NativeItem
  orderExpiry?: Date
}

export interface PrepareListingResponse {
  unsignedApprovalTransaction?: PopulatedTransaction
  typedOrderMessageForSigning: {}
  orderComponents: {}
}

export interface CreateOrderParams {}
export interface CreateOrderResponse {}
