// #doc blockchain-data-api-exported-types
import { blockchainData, config } from '@imtbl/sdk';

const configuration: blockchainData.BlockchainDataModuleConfiguration = {
  baseConfig: new config.ImmutableConfiguration({
    environment: config.Environment.PRODUCTION,
  }),
};

const client = new blockchainData.BlockchainData(configuration);

export async function getChains(
  request: blockchainData.Types.ListChainsRequestParams,
): Promise<blockchainData.Types.Chain> {
  const chains: blockchainData.Types.ListChainsResult = await client.listChains(
    request,
  );

  return chains.result[0]; // type inference, autocomplete works here for `Chain` object
}
// #enddoc blockchain-data-api-exported-types
