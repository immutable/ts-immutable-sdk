import { Signer } from '@ethersproject/abstract-signer';
import axios, { AxiosResponse } from 'axios';
import {
  CollectionsApi,
  ExchangesApi,
  ProjectsApi,
  PrimarySalesApi,
  MetadataApi,
  MetadataRefreshesApi,
  MintsApi,
  CreateCollectionRequest,
  UpdateCollectionRequest,
  AddMetadataSchemaToCollectionRequest,
  CreateMetadataRefreshRequest,
  MetadataSchemaRequest,
  PrimarySalesApiSignableCreatePrimarySaleRequest,
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
import {
  CreatePrimarySaleWorkflow,
  AcceptPrimarySalesWorkflow,
  RejectPrimarySalesWorkflow,
} from './primarySales';

export class Workflows {
  private readonly mintsApi: MintsApi;

  private readonly projectsApi: ProjectsApi;

  private readonly collectionsApi: CollectionsApi;

  private readonly metadataApi: MetadataApi;

  private readonly metadataRefreshesApi: MetadataRefreshesApi;

  private readonly exchangesApi: ExchangesApi;

  private readonly primarySalesApi: PrimarySalesApi;

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
    primarySalesApi: PrimarySalesApi,
    projectsApi: ProjectsApi,
  ) {
    this.config = config;
    this.collectionsApi = collectionsApi;
    this.exchangesApi = exchangesApi;
    this.metadataApi = metadataApi;
    this.metadataRefreshesApi = metadataRefreshesApi;
    this.mintsApi = mintsApi;
    this.primarySalesApi = primarySalesApi;
    this.projectsApi = projectsApi;
  }

  private async validateChain(signer: Signer) {
    const chainID = await signer.getChainId();

    if (!this.isChainValid(chainID)) {
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

  public async getProject(ethSigner: EthSigner, id: string) {
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
  ) {
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
  ) {
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
  ) {
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
  ) {
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
  ) {
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
  ) {
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
  ) {
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
  ) {
    const imxAuthHeaders = await generateIMXAuthorisationHeaders(ethSigner);
    const ethAddress = await ethSigner.getAddress();

    return this.metadataRefreshesApi.requestAMetadataRefresh({
      xImxEthSignature: imxAuthHeaders.signature,
      xImxEthTimestamp: imxAuthHeaders.timestamp,
      xImxEthAddress: ethAddress,
      createMetadataRefreshRequest: request,
    });
  }

  public async createPrimarySale(
    walletConnection: WalletConnection,
    request: PrimarySalesApiSignableCreatePrimarySaleRequest,
  ) {
    await this.validateChain(walletConnection.ethSigner);

    return CreatePrimarySaleWorkflow({
      ...walletConnection,
      request,
      primarySalesApi: this.primarySalesApi,
    });
  }

  public async acceptPrimarySale(ethSigner: EthSigner, primarySaleId: number) {
    return AcceptPrimarySalesWorkflow({
      ethSigner,
      primarySaleId,
      primarySalesApi: this.primarySalesApi,
    });
  }

  public async rejectPrimarySale(ethSigner: EthSigner, primarySaleId: number) {
    return RejectPrimarySalesWorkflow({
      ethSigner,
      primarySaleId,
      primarySalesApi: this.primarySalesApi,
    });
  }
}
