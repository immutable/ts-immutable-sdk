import { mr } from '@imtbl/generated-clients';
import {
  BlockchainDataConfiguration,
  BlockchainDataModuleConfiguration,
} from 'config';
import { formatError } from 'utils/formatErrors';

export class BlockchainData {
  public readonly config: BlockchainDataConfiguration;

  private readonly activities: mr.ActivitiesApi;

  private readonly chains: mr.ChainsApi;

  private readonly collections: mr.CollectionsApi;

  private readonly nfts: mr.NftsApi;

  private readonly nftOwners: mr.NftOwnersApi;

  private readonly tokens: mr.TokensApi;

  constructor(moduleConfig: BlockchainDataModuleConfiguration) {
    this.config = new BlockchainDataConfiguration(moduleConfig);

    this.activities = new mr.ActivitiesApi(this.config.apiConfig);
    this.chains = new mr.ChainsApi(this.config.apiConfig);
    this.collections = new mr.CollectionsApi(this.config.apiConfig);
    this.nfts = new mr.NftsApi(this.config.apiConfig);
    this.nftOwners = new mr.NftOwnersApi(this.config.apiConfig);
    this.tokens = new mr.TokensApi(this.config.apiConfig);
  }

  /**
   * List all activities
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a list of activities
   * @throws {@link index.APIError}
   */
  public async listActivities(
    request: mr.ActivitiesApiListActivitiesRequest
  ): Promise<mr.ListActivitiesResult> {
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
    request: mr.ActivitiesApiGetActivityRequest
  ): Promise<mr.GetActivityResult> {
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
    request: mr.ChainsApiListChainsRequest
  ): Promise<mr.ListChainsResult> {
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
    request: mr.CollectionsApiListCollectionsRequest
  ): Promise<mr.ListCollectionsResult> {
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
    request: mr.CollectionsApiGetCollectionRequest
  ): Promise<mr.GetCollectionResult> {
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
  public async getNFT(
    request: mr.NftsApiGetNFTRequest
  ): Promise<mr.GetNFTResult> {
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
    request: mr.NftsApiListNFTsRequest
  ): Promise<mr.ListNFTsResult> {
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
    request: mr.NftsApiListNFTsByAccountAddressRequest
  ): Promise<mr.ListNFTsResult> {
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
    request: mr.NftOwnersApiListNFTOwnersRequest
  ): Promise<mr.ListNFTOwnersResult> {
    return await this.nftOwners
      .listNFTOwners(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * List ERC20 Token contracts
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a list of ERC20 Tokens
   * @throws {@link index.APIError}
   */
  public async listTokens(
    request: mr.TokensApiListERC20TokensRequest
  ): Promise<mr.ListTokensResult> {
    return await this.tokens
      .listERC20Tokens(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }

  /**
   * Get details for an ERC20 Token by contract address
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a list of ERC20 Tokens
   * @throws {@link index.APIError}
   */
  public async getToken(
    request: mr.TokensApiGetERC20TokenRequest
  ): Promise<mr.GetTokenResult> {
    return await this.tokens
      .getERC20Token(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      });
  }
}
