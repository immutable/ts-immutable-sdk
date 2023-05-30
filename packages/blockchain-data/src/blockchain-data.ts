import {
  ActivitiesApi,
  ActivitiesApiListActivitiesRequest,
  ActivitiesApiGetActivityRequest,
  ListActivitiesResult,
  GetActivityResult,
  ChainsApi,
  CollectionsApi,
  NftsApi,
  NftOwnersApi,
  ChainsApiListChainsRequest,
  ListChainsResult,
  CollectionsApiListCollectionsRequest,
  ListCollectionsResult,
  CollectionsApiGetCollectionRequest,
  GetCollectionResult,
  NftsApiGetNFTRequest,
  GetNFTResult,
  NftsApiListNFTsRequest,
  ListNFTsResult,
  NftsApiListNFTsByAccountAddressRequest,
  NftOwnersApiListNFTOwnersRequest,
  ListNFTOwnersResult,
} from '@imtbl/multi-rollup-api-client';
import {
  BlockchainDataConfiguration,
  BlockchainDataModuleConfiguration,
} from 'config';

export class BlockchainData {
  private readonly activities: ActivitiesApi;

  private readonly chains: ChainsApi;

  private readonly collections: CollectionsApi;

  private readonly nfts: NftsApi;

  private readonly nftOwners: NftOwnersApi;

  constructor(moduleConfig: BlockchainDataModuleConfiguration) {
    const config = new BlockchainDataConfiguration(moduleConfig);

    this.activities = new ActivitiesApi(config.apiConfig);
    this.chains = new ChainsApi(config.apiConfig);
    this.collections = new CollectionsApi(config.apiConfig);
    this.nfts = new NftsApi(config.apiConfig);
    this.nftOwners = new NftOwnersApi(config.apiConfig);
  }

  /**
   * List all activities
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a list of activities
   * @throws {@link index.IMXError} // TODO FIXME
   */
  public async listActivities(
    request: ActivitiesApiListActivitiesRequest
  ): Promise<ListActivitiesResult> {
    return await this.activities
      .listActivities(request)
      .then((res) => res.data)
      .catch((err) => {
        // throw formatError(err); TODO format error correctly according to our error shape
        throw new Error(err);
      });
  }

  /**
   * Get a single activity by ID
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a single activity
   * @throws {@link index.IMXError} // TODO FIXME
   */
  public async getActivity(
    request: ActivitiesApiGetActivityRequest
  ): Promise<GetActivityResult> {
    return await this.activities
      .getActivity(request)
      .then((res) => res.data)
      .catch((err) => {
        // throw formatError(err); TODO format error correctly according to our error shape
        throw new Error(err);
      });
  }

  /**
   * List supported chains
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a list of supported chains
   * @throws {@link index.IMXError} // TODO FIXME
   */
  public async listChains(
    request: ChainsApiListChainsRequest
  ): Promise<ListChainsResult> {
    return await this.chains
      .listChains(request)
      .then((res) => res.data)
      .catch((err) => {
        // throw formatError(err); TODO format error correctly according to our error shape
        throw new Error(err);
      });
  }

  /**
   * List all collections
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a list of collections
   * @throws {@link index.IMXError} // TODO FIXME
   */
  public async listCollections(
    request: CollectionsApiListCollectionsRequest
  ): Promise<ListCollectionsResult> {
    return await this.collections
      .listCollections(request)
      .then((res) => res.data)
      .catch((err) => {
        // throw formatError(err); TODO format error correctly according to our error shape
        throw new Error(err);
      });
  }

  /**
   * Get collection by contract address
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a single collection
   * @throws {@link index.IMXError} // TODO FIXME
   */
  public async getCollection(
    request: CollectionsApiGetCollectionRequest
  ): Promise<GetCollectionResult> {
    return await this.collections
      .getCollection(request)
      .then((res) => res.data)
      .catch((err) => {
        // throw formatError(err); TODO format error correctly according to our error shape
        throw new Error(err);
      });
  }

  /**
   * Get NFT by token ID
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a single NFT
   * @throws {@link index.IMXError} // TODO FIXME
   */
  public async getNFT(request: NftsApiGetNFTRequest): Promise<GetNFTResult> {
    return await this.nfts
      .getNFT(request)
      .then((res) => res.data)
      .catch((err) => {
        // throw formatError(err); TODO format error correctly according to our error shape
        throw new Error(err);
      });
  }

  /**
   * List NFTs by contract address
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a list of NFTs
   * @throws {@link index.IMXError} // TODO FIXME
   */
  public async listNFTs(
    request: NftsApiListNFTsRequest
  ): Promise<ListNFTsResult> {
    return await this.nfts
      .listNFTs(request)
      .then((res) => res.data)
      .catch((err) => {
        // throw formatError(err); TODO format error correctly according to our error shape
        throw new Error(err);
      });
  }

  /**
   * List NFTs by account address
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a list of NFTs
   * @throws {@link index.IMXError} // TODO FIXME
   */
  public async listNFTsByAccountAddress(
    request: NftsApiListNFTsByAccountAddressRequest
  ): Promise<ListNFTsResult> {
    return await this.nfts
      .listNFTsByAccountAddress(request)
      .then((res) => res.data)
      .catch((err) => {
        // throw formatError(err); TODO format error correctly according to our error shape
        throw new Error(err);
      });
  }

  /**
   * List NFT owners by token ID
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a list of NFT owners
   * @throws {@link index.IMXError} // TODO FIXME
   */
  public async listNFTOwners(
    request: NftOwnersApiListNFTOwnersRequest
  ): Promise<ListNFTOwnersResult> {
    return await this.nftOwners
      .listNFTOwners(request)
      .then((res) => res.data)
      .catch((err) => {
        // throw formatError(err); TODO format error correctly according to our error shape
        throw new Error(err);
      });
  }
}
