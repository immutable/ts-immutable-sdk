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
import { formatError } from 'utils/formatErrors';

export class BlockchainData {
  public readonly config: BlockchainDataConfiguration;

  private readonly activities: ActivitiesApi;

  private readonly chains: ChainsApi;

  private readonly collections: CollectionsApi;

  private readonly nfts: NftsApi;

  private readonly nftOwners: NftOwnersApi;

  constructor(moduleConfig: BlockchainDataModuleConfiguration) {
    this.config = new BlockchainDataConfiguration(moduleConfig);

    this.activities = new ActivitiesApi(this.config.apiConfig);
    this.chains = new ChainsApi(this.config.apiConfig);
    this.collections = new CollectionsApi(this.config.apiConfig);
    this.nfts = new NftsApi(this.config.apiConfig);
    this.nftOwners = new NftOwnersApi(this.config.apiConfig);
  }

  /**
   * List all activities
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a list of activities
   * @throws {@link index.APIError}
   */
  public async listActivities(
    request: ActivitiesApiListActivitiesRequest
  ): Promise<ListActivitiesResult> {
    return await this.activities
      .listActivities(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Get a single activity by ID
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a single activity
   * @throws {@link index.APIError}
   */
  public async getActivity(
    request: ActivitiesApiGetActivityRequest
  ): Promise<GetActivityResult> {
    return await this.activities
      .getActivity(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * List supported chains
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a list of supported chains
   * @throws {@link index.APIError}
   */
  public async listChains(
    request: ChainsApiListChainsRequest
  ): Promise<ListChainsResult> {
    return await this.chains
      .listChains(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * List all collections
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a list of collections
   * @throws {@link index.APIError}
   */
  public async listCollections(
    request: CollectionsApiListCollectionsRequest
  ): Promise<ListCollectionsResult> {
    return await this.collections
      .listCollections(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Get collection by contract address
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a single collection
   * @throws {@link index.APIError}
   */
  public async getCollection(
    request: CollectionsApiGetCollectionRequest
  ): Promise<GetCollectionResult> {
    return await this.collections
      .getCollection(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Get NFT by token ID
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a single NFT
   * @throws {@link index.APIError}
   */
  public async getNFT(request: NftsApiGetNFTRequest): Promise<GetNFTResult> {
    return await this.nfts
      .getNFT(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * List NFTs by contract address
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a list of NFTs
   * @throws {@link index.APIError}
   */
  public async listNFTs(
    request: NftsApiListNFTsRequest
  ): Promise<ListNFTsResult> {
    return await this.nfts
      .listNFTs(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * List NFTs by account address
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a list of NFTs
   * @throws {@link index.APIError}
   */
  public async listNFTsByAccountAddress(
    request: NftsApiListNFTsByAccountAddressRequest
  ): Promise<ListNFTsResult> {
    return await this.nfts
      .listNFTsByAccountAddress(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * List NFT owners by token ID
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a list of NFT owners
   * @throws {@link index.APIError}
   */
  public async listNFTOwners(
    request: NftOwnersApiListNFTOwnersRequest
  ): Promise<ListNFTOwnersResult> {
    return await this.nftOwners
      .listNFTOwners(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }
}
