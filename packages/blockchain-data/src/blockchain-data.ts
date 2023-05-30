import {
  ActivitiesApi,
  ActivitiesApiListActivitiesRequest,
  ListActivitiesResult,
} from '@imtbl/multi-rollup-api-client';
import {
  BlockchainDataConfiguration,
  BlockchainDataModuleConfiguration,
} from 'config';

export class BlockchainData {
  private readonly activities: ActivitiesApi;

  constructor(moduleConfig: BlockchainDataModuleConfiguration) {
    const config = new BlockchainDataConfiguration(moduleConfig);

    this.activities = new ActivitiesApi(config.apiConfig);
  }

  public async listActivities(
    params: ActivitiesApiListActivitiesRequest
  ): Promise<ListActivitiesResult> {
    return await this.activities
      .listActivities(params)
      .then((res) => res.data)
      .catch((err) => {
        // throw formatError(err); TODO format error correctly according to our error shape
        throw new Error(err);
      });
  }
}
