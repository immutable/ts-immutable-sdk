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
}
