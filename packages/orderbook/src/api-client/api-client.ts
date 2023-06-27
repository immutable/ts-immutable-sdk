import {
  CreateOrderProtocolData,
  Fee,
  ListingResult,
  ListListingsResult,
  OrdersService,
} from 'openapi/sdk';
import { CreateListingParams, ListListingsParams } from 'types';
import { ItemType, SEAPORT_CONTRACT_VERSION_V1_4 } from '../seaport';

export class ImmutableApiClient {
  constructor(
    private readonly orderbookService: OrdersService,
    private readonly chainName: string,
    private readonly seaportAddress: string,
  ) {}

  async getListing(listingId: string): Promise<ListingResult> {
    return this.orderbookService.getListing({
      chainName: this.chainName,
      listingId,
    });
  }

  async listListings(
    listOrderParams: ListListingsParams,
  ): Promise<ListListingsResult> {
    return this.orderbookService.listListings({
      chainName: this.chainName,
      ...listOrderParams,
    });
  }

  async createListing({
    orderHash,
    orderComponents,
    orderSignature,
  }: CreateListingParams): Promise<ListingResult> {
    if (orderComponents.offer.length !== 1) {
      throw new Error('Only one item can be listed at a time');
    }

    if (Number(orderComponents.offer[0].itemType) !== ItemType.ERC721) {
      throw new Error('Only ERC721 tokens can be listed');
    }

    const orderTypes = [
      ...orderComponents.consideration.map((c) => c.itemType),
    ];
    const isSameConsiderationType = new Set(orderTypes).size === 1;
    if (!isSameConsiderationType) {
      throw new Error('All consideration items must be of the same type');
    }

    return this.orderbookService.createListing({
      chainName: this.chainName,
      requestBody: {
        order_hash: orderHash,
        account_address: orderComponents.offerer,
        buy: [
          {
            item_type:
              Number(orderComponents.consideration[0].itemType)
              === ItemType.NATIVE
                ? 'NATIVE'
                : 'ERC20',
            start_amount: orderComponents.consideration[0].startAmount,
            contract_address: orderComponents.consideration[0].token,
          },
        ],
        buy_fees:
          orderComponents.consideration.length > 1
            ? [
              {
                amount: orderComponents.consideration[1].startAmount,
                recipient: orderComponents.consideration[1].recipient,
                fee_type: Fee.fee_type.ROYALTY,
              },
            ]
            : [],
        end_time: new Date(
          parseInt(`${orderComponents.endTime.toString()}000`, 10),
        ).toISOString(),
        protocol_data: {
          order_type: CreateOrderProtocolData.order_type.FULL_RESTRICTED,
          zone_address: orderComponents.zone,
          seaport_address: this.seaportAddress,
          seaport_version: SEAPORT_CONTRACT_VERSION_V1_4,
          counter: orderComponents.counter.toString(),
        },
        salt: orderComponents.salt,
        sell: [
          {
            contract_address: orderComponents.offer[0].token,
            token_id: orderComponents.offer[0].identifierOrCriteria,
            item_type: 'ERC721',
          },
        ],
        signature: orderSignature,
        start_time: new Date(
          parseInt(`${orderComponents.startTime.toString()}000`, 10),
        ).toISOString(),
      },
    });
  }
}
