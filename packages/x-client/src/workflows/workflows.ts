import axios, { AxiosResponse } from 'axios';
import { Signer } from 'ethers';
import {
  CollectionsApi,
  ExchangesApi,
  ProjectsApi,
  MetadataApi,
  MetadataRefreshesApi,
  MintsApi,
  CreateCollectionRequest,
  UpdateCollectionRequest,
  AddMetadataSchemaToCollectionRequest,
  CreateMetadataRefreshRequest,
  MetadataSchemaRequest,
  Project,
  Collection,
  SuccessResponse,
  GetMetadataRefreshes,
  GetMetadataRefreshErrorsResponse,
  GetMetadataRefreshResponse,
  CreateMetadataRefreshResponse,
} from '../types/api';
import {
  UnsignedMintRequest,
  WalletConnection,
  EthSigner,
  UnsignedExchangeTransferRequest,
  StarkExContractVersion,
} from '../types';
import { mintingWorkflow } from './minting';
import { generateIMXAuthorisationHeaders } from '../utils';
import { ImmutableXConfiguration } from '../config';
import { exchangeTransfersWorkflow } from './exchangeTransfers';

export class Workflows {
  private readonly mintsApi: MintsApi;

  private readonly projectsApi: ProjectsApi;

  private readonly collectionsApi: CollectionsApi;

  private readonly metadataApi: MetadataApi;

  private readonly metadataRefreshesApi: MetadataRefreshesApi;

  private readonly exchangesApi: ExchangesApi;

  private isChainValid(chainID: number) {
    return chainID === this.config.ethConfiguration.chainID;
  }

  constructor(
    protected config: ImmutableXConfiguration,
    collectionsApi: CollectionsApi,
    exchangesApi: ExchangesApi,
    metadataApi: MetadataApi,
    metadataRefreshesApi: MetadataRefreshesApi,
    mintsApi: MintsApi,
    projectsApi: ProjectsApi,
  ) {
    this.config = config;
    this.collectionsApi = collectionsApi;
    this.exchangesApi = exchangesApi;
    this.metadataApi = metadataApi;
    this.metadataRefreshesApi = metadataRefreshesApi;
    this.mintsApi = mintsApi;
    this.projectsApi = projectsApi;
  }

  private async validateChain(signer: Signer) {
    const chainID = (await signer.provider?.getNetwork())?.chainId;

    if (!this.isChainValid(Number(chainID))) {
      throw new Error(
        'The wallet used for this operation is not from the correct network.',
      );
    }
  }

  private async getStarkExContractVersion(): Promise<AxiosResponse<StarkExContractVersion>> {
    const options = {
      baseURL: `${this.config.apiConfiguration.basePath}/v1`,
    };
    return axios.get('/starkex-contract-version', options);
  }

  public async mint(signer: Signer, request: UnsignedMintRequest) {
    await this.validateChain(signer);

    return mintingWorkflow(signer, request, this.mintsApi);
  }

  public async exchangeTransfer(
    walletConnection: WalletConnection,
    request: UnsignedExchangeTransferRequest,
  ) {
    await this.validateChain(walletConnection.ethSigner);

    return exchangeTransfersWorkflow({
      ...walletConnection,
      request,
      exchangesApi: this.exchangesApi,
    });
  }

  public async getProject(ethSigner: EthSigner, id: string): Promise<AxiosResponse<Project, any>> {
    const imxAuthHeaders = await generateIMXAuthorisationHeaders(ethSigner);

    return this.projectsApi.getProject({
      id,
      iMXSignature: imxAuthHeaders.signature,
      iMXTimestamp: imxAuthHeaders.timestamp,
    });
  }

  public async createCollection(
    ethSigner: EthSigner,
    createCollectionRequest: CreateCollectionRequest,
  ): Promise<AxiosResponse<Collection, any>> {
    const imxAuthHeaders = await generateIMXAuthorisationHeaders(ethSigner);

    return this.collectionsApi.createCollection({
      iMXSignature: imxAuthHeaders.signature,
      iMXTimestamp: imxAuthHeaders.timestamp,
      createCollectionRequest,
    });
  }

  public async updateCollection(
    ethSigner: EthSigner,
    address: string,
    updateCollectionRequest: UpdateCollectionRequest,
  ): Promise<AxiosResponse<Collection, any>> {
    const imxAuthHeaders = await generateIMXAuthorisationHeaders(ethSigner);

    return this.collectionsApi.updateCollection({
      iMXSignature: imxAuthHeaders.signature,
      iMXTimestamp: imxAuthHeaders.timestamp,
      address,
      updateCollectionRequest,
    });
  }

  public async addMetadataSchemaToCollection(
    ethSigner: EthSigner,
    address: string,
    addMetadataSchemaToCollectionRequest: AddMetadataSchemaToCollectionRequest,
  ): Promise<AxiosResponse<SuccessResponse, any>> {
    const imxAuthHeaders = await generateIMXAuthorisationHeaders(ethSigner);

    return this.metadataApi.addMetadataSchemaToCollection({
      iMXSignature: imxAuthHeaders.signature,
      iMXTimestamp: imxAuthHeaders.timestamp,
      addMetadataSchemaToCollectionRequest,
      address,
    });
  }

  public async updateMetadataSchemaByName(
    ethSigner: EthSigner,
    address: string,
    name: string,
    metadataSchemaRequest: MetadataSchemaRequest,
  ): Promise<AxiosResponse<SuccessResponse, any>> {
    const imxAuthHeaders = await generateIMXAuthorisationHeaders(ethSigner);

    return this.metadataApi.updateMetadataSchemaByName({
      iMXSignature: imxAuthHeaders.signature,
      iMXTimestamp: imxAuthHeaders.timestamp,
      address,
      name,
      metadataSchemaRequest,
    });
  }

  public async listMetadataRefreshes(
    ethSigner: EthSigner,
    collectionAddress?: string,
    pageSize?: number,
    cursor?: string,
  ): Promise<AxiosResponse<GetMetadataRefreshes, any>> {
    const imxAuthHeaders = await generateIMXAuthorisationHeaders(ethSigner);
    const ethAddress = await ethSigner.getAddress();

    return this.metadataRefreshesApi.getAListOfMetadataRefreshes({
      xImxEthSignature: imxAuthHeaders.signature,
      xImxEthTimestamp: imxAuthHeaders.timestamp,
      xImxEthAddress: ethAddress,
      collectionAddress,
      pageSize,
      cursor,
    });
  }

  public async getMetadataRefreshErrors(
    ethSigner: EthSigner,
    refreshId: string,
    pageSize?: number,
    cursor?: string,
  ): Promise<AxiosResponse<GetMetadataRefreshErrorsResponse, any>> {
    const imxAuthHeaders = await generateIMXAuthorisationHeaders(ethSigner);
    const ethAddress = await ethSigner.getAddress();

    return this.metadataRefreshesApi.getMetadataRefreshErrors({
      xImxEthSignature: imxAuthHeaders.signature,
      xImxEthTimestamp: imxAuthHeaders.timestamp,
      xImxEthAddress: ethAddress,
      refreshId,
      pageSize,
      cursor,
    });
  }

  public async getMetadataRefreshResults(
    ethSigner: EthSigner,
    refreshId: string,
  ): Promise<AxiosResponse<GetMetadataRefreshResponse, any>> {
    const imxAuthHeaders = await generateIMXAuthorisationHeaders(ethSigner);
    const ethAddress = await ethSigner.getAddress();

    return this.metadataRefreshesApi.getMetadataRefreshResults({
      xImxEthSignature: imxAuthHeaders.signature,
      xImxEthTimestamp: imxAuthHeaders.timestamp,
      xImxEthAddress: ethAddress,
      refreshId,
    });
  }

  public async createMetadataRefresh(
    ethSigner: EthSigner,
    request: CreateMetadataRefreshRequest,
  ): Promise<AxiosResponse<CreateMetadataRefreshResponse, any>> {
    const imxAuthHeaders = await generateIMXAuthorisationHeaders(ethSigner);
    const ethAddress = await ethSigner.getAddress();

    return this.metadataRefreshesApi.requestAMetadataRefresh({
      xImxEthSignature: imxAuthHeaders.signature,
      xImxEthTimestamp: imxAuthHeaders.timestamp,
      xImxEthAddress: ethAddress,
      createMetadataRefreshRequest: request,
    });
  }
}
