import { ImmutableApiClientFactory } from 'api-client';
import { OrderbookModuleConfiguration } from 'config/config';
import { ERC721Factory } from 'erc721';
import { Order } from 'openapi/sdk';
import { SeaportFactory } from 'seaport';
import { CreateOrderParams, PrepareListingParams, PrepareListingResponse } from 'types';

export class Orderbook {
  private chainId: string;

  private apiEndpoint: string;

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
    this.apiEndpoint = apiEndpoint;
  }

  getOrder(orderId: string): Promise<Order> {
    const apiClient = new ImmutableApiClientFactory(this.apiEndpoint, this.chainId).create();
    return apiClient.getOrder(orderId);
  }

  async prepareListing({
    offerer, listingItem, considerationItem, orderExpiry,
  }: PrepareListingParams): Promise<PrepareListingResponse> {
    const erc721 = new ERC721Factory(listingItem.contractAddress, this.config.provider).create();
    const royaltyInfo = await erc721.royaltyInfo(listingItem.tokenId, considerationItem.amount);

    const seaport = new SeaportFactory(
      this.config.seaportContractAddress,
      this.config.zoneContractAddress,
      this.config.provider,
    ).create();

    return seaport.prepareSeaportOrder(
      offerer,
      listingItem,
      considerationItem,
      royaltyInfo,
      // Default order expiry to 2 years from now
      orderExpiry || new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 2),
    );
  }

  createOrder(createOrderParams: CreateOrderParams): Promise<Order> {
    const apiClient = new ImmutableApiClientFactory(this.apiEndpoint, this.chainId).create();
    return apiClient.createOrder(createOrderParams);
  }
}
