import { mr, BlockchainData as Types } from '@imtbl/generated-clients';
import {
  BlockchainDataConfiguration,
  BlockchainDataModuleConfiguration,
} from './config';
import { formatError } from './utils/formatErrors';

export class BlockchainData {
  public readonly config: BlockchainDataConfiguration;

  private readonly activities: mr.ActivitiesApi;

  private readonly chains: mr.ChainsApi;

  private readonly collections: mr.CollectionsApi;

  private readonly nfts: mr.NftsApi;

  private readonly nftOwners: mr.NftOwnersApi;

  private readonly tokens: mr.TokensApi;

  private readonly metadata: mr.MetadataApi;

  constructor(moduleConfig: BlockchainDataModuleConfiguration) {
    this.config = new BlockchainDataConfiguration(moduleConfig);

    this.activities = new mr.ActivitiesApi(this.config.apiConfig);
    this.chains = new mr.ChainsApi(this.config.apiConfig);
    this.collections = new mr.CollectionsApi(this.config.apiConfig);
    this.nfts = new mr.NftsApi(this.config.apiConfig);
    this.nftOwners = new mr.NftOwnersApi(this.config.apiConfig);
    this.tokens = new mr.TokensApi(this.config.apiConfig);
    this.metadata = new mr.MetadataApi(this.config.apiConfig);
  }

  /**
   * List all activities
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a list of activities
   * @throws {@link index.APIError}
   */
  public async listActivities(
    request: Types.ListActivitiesRequestParams,
  ): Promise<Types.ListActivitiesResult> {
    return (await this.activities
      .listActivities(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      })) as Types.ListActivitiesResult;
  }

  /**
   * List activities sorted by updated_at timestamp ascending, useful for time based data replication
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a list of activities
   * @throws {@link index.APIError}
   */
  public async listActivityHistory(
    request: Types.ListActivityHistoryRequestParams,
  ): Promise<Types.ListActivitiesResult> {
    return (await this.activities
      .listActivityHistory(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      })) as Types.ListActivitiesResult;
  }

  /**
   * Get a single activity by ID
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a single activity
   * @throws {@link index.APIError}
   */
  public async getActivity(
    request: Types.GetActivityRequestParams,
  ): Promise<Types.GetActivityResult> {
    return (await this.activities
      .getActivity(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      })) as Types.GetActivityResult;
  }

  /**
   * List supported chains
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a list of supported chains
   * @throws {@link index.APIError}
   */
  public async listChains(
    request: Types.ListChainsRequestParams,
  ): Promise<Types.ListChainsResult> {
    return (await this.chains
      .listChains(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      })) as Types.ListChainsResult;
  }

  /**
   * List all collections
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a list of collections
   * @throws {@link index.APIError}
   */
  public async listCollections(
    request: Types.ListCollectionsRequestParams,
  ): Promise<Types.ListCollectionsResult> {
    return (await this.collections
      .listCollections(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      })) as Types.ListCollectionsResult;
  }

  /**
   * List collections by NFT owner
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a list of collections
   * @throws {@link index.APIError}
   */
  public async listCollectionsByNFTOwner(
    request: Types.ListCollectionsByNFTOwnerRequestParams,
  ): Promise<Types.ListCollectionsResult> {
    return (await this.collections
      .listCollectionsByNFTOwner(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      })) as Types.ListCollectionsResult;
  }

  /**
   * Get a collection by contract address
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a single collection
   * @throws {@link index.APIError}
   */
  public async getCollection(
    request: Types.GetCollectionRequestParams,
  ): Promise<Types.GetCollectionResult> {
    return (await this.collections
      .getCollection(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      })) as Types.GetCollectionResult;
  }

  /**
   * Get NFT by token ID
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a single NFT
   * @throws {@link index.APIError}
   */
  public async getNFT(
    request: Types.GetNFTRequestParams,
  ): Promise<Types.GetNFTResult> {
    return (await this.nfts
      .getNFT(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      })) as Types.GetNFTResult;
  }

  /**
   * List NFTs by contract address
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a list of NFTs
   * @throws {@link index.APIError}
   */
  public async listNFTs(
    request: Types.ListNFTsRequestParams,
  ): Promise<Types.ListNFTsResult> {
    return (await this.nfts
      .listNFTs(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      })) as Types.ListNFTsResult;
  }

  /**
   * List NFTs by account address
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a list of NFTs
   * @throws {@link index.APIError}
   */
  public async listNFTsByAccountAddress(
    request: Types.ListNFTsByAccountAddressRequestParams,
  ): Promise<Types.ListNFTsResult> {
    return (await this.nfts
      .listNFTsByAccountAddress(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      })) as Types.ListNFTsResult;
  }

  /**
   * List All NFTs on a chain
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a list of NFTs
   * @throws {@link index.APIError}
   */
  public async listAllNFTs(
    request: Types.ListAllNFTsRequestParams,
  ): Promise<Types.ListNFTsResult> {
    return (await this.nfts
      .listAllNFTs(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      })) as Types.ListNFTsResult;
  }

  /**
   * Create a mint request to mint a set of NFTs for a given collection
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the remaining rate limits
   * @throws {@link index.APIError}
   */
  public async createMintRequest(
    request: Types.CreateMintRequestRequestParams,
  ): Promise<Types.CreateMintRequestResult> {
    return (await this.nfts
      .createMintRequest(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      })) as Types.CreateMintRequestResult;
  }

  /**
   * List all mint requests for a given contract address
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a list of mint requests
   * @throws {@link index.APIError}
   */
  public async listMintRequests(
    request: Types.ListMintRequestsRequestParams,
  ): Promise<Types.ListMintRequestsResult> {
    return (await this.nfts
      .listMintRequests(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      })) as Types.ListMintRequestsResult;
  }

  /**
   * Retrieve the status of a single mint request identified by its reference ID
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a single mint request
   * @throws {@link index.APIError}
   */
  public async getMintRequest(
    request: Types.GetMintRequestRequestParams,
  ): Promise<Types.ListMintRequestsResult> {
    return (await this.nfts
      .getMintRequest(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      })) as Types.ListMintRequestsResult;
  }

  /**
   * List NFT owners by token ID
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a list of NFT owners
   * @throws {@link index.APIError}
   */
  public async listNFTOwners(
    request: Types.ListNFTOwnersRequestParams,
  ): Promise<Types.ListNFTOwnersResult> {
    return (await this.nftOwners
      .listNFTOwners(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      })) as Types.ListNFTOwnersResult;
  }

  /**
   * List NFT owners by contract address
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a list of NFT owners
   * @throws {@link index.APIError}
   */
  public async listNFTOwnersByContractAddress(
    request: Types.ListOwnersByContractAddressRequestParams,
  ): Promise<Types.ListNFTOwnersResult> {
    return (await this.nftOwners
      .listOwnersByContractAddress(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      })) as Types.ListNFTOwnersResult;
  }

  /**
   * List All NFT owners on a chain
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a list of NFT owners
   * @throws {@link index.APIError}
   */
  public async listAllNFTOwners(
    request: Types.ListAllNFTOwnersRequestParams,
  ): Promise<Types.ListNFTOwnersResult> {
    return (await this.nftOwners
      .listAllNFTOwners(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      })) as Types.ListNFTOwnersResult;
  }

  /**
   * List ERC20 Token contracts
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a list of ERC20 Tokens
   * @throws {@link index.APIError}
   */
  public async listTokens(
    request: Types.ListERC20TokensRequestParams,
  ): Promise<Types.ListTokensResult> {
    return (await this.tokens
      .listERC20Tokens(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      })) as Types.ListTokensResult;
  }

  /**
   * Get details for an ERC20 Token by contract address
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a list of ERC20 Tokens
   * @throws {@link index.APIError}
   */
  public async getToken(
    request: Types.GetERC20TokenRequestParams,
  ): Promise<Types.GetTokenResult> {
    return (await this.tokens
      .getERC20Token(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      })) as Types.GetTokenResult;
  }

  /**
   * Get metadata by ID
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a single Metadata
   * @throws {@link index.APIError}
   */
  public async getMetadata(
    request: Types.GetMetadataRequestParams,
  ): Promise<Types.GetMetadataResult> {
    return (await this.metadata
      .getMetadata(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      })) as Types.GetMetadataResult;
  }

  /**
   * List NFT Metadata by contract address
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a list of Metadata
   * @throws {@link index.APIError}
   */
  public async listNFTMetadataByContractAddress(
    request: Types.ListMetadataRequestParams,
  ): Promise<Types.ListMetadataResult> {
    return (await this.metadata
      .listMetadata(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      })) as Types.ListMetadataResult;
  }

  /**
   * List NFT Metadata by chain
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with a list of Metadata
   * @throws {@link index.APIError}
   */
  public async listNFTMetadataByChain(
    request: Types.ListMetadataForChainRequestParams,
  ): Promise<Types.ListMetadataResult> {
    return (await this.metadata
      .listMetadataForChain(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      })) as Types.ListMetadataResult;
  }

  /**
   * Refresh collection metadata
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the updated collection
   * @throws {@link index.APIError}
   */
  public async refreshCollectionMetadata(
    request: Types.RefreshCollectionMetadataRequestParams,
  ): Promise<Types.RefreshCollectionMetadataResult> {
    return (await this.collections
      .refreshCollectionMetadata(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      })) as Types.RefreshCollectionMetadataResult;
  }

  /**
   * Refresh metadata for specific NFTs
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the remaining rate limits
   * @throws {@link index.APIError}
   */
  public async refreshNFTMetadata(
    request: Types.RefreshNFTMetadataByTokenIDRequestParams,
  ): Promise<Types.MetadataRefreshRateLimitResult> {
    return (await this.metadata
      .refreshNFTMetadataByTokenID(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      })) as Types.MetadataRefreshRateLimitResult;
  }

  /**
   * Refresh metadata by ID. This will refresh metadata for all NFTs that reference the given metadata ID.
   * @param request - the request object containing the parameters to be provided in the API request
   * @returns a promise that resolves with the remaining rate limits
   * @throws {@link index.APIError}
   */
  public async refreshStackedMetadata(
    request: Types.RefreshMetadataByIDRequestParams,
  ): Promise<Types.MetadataRefreshRateLimitResult> {
    return (await this.metadata
      .refreshMetadataByID(request)
      .then((res) => res.data)
      .catch((err) => {
        throw formatError(err);
      })) as Types.MetadataRefreshRateLimitResult;
  }
}
