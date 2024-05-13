import { blockchainData, config as sdkConfig } from "@imtbl/sdk";
import serverConfig from "./config";
import { environment } from "./config";
import logger from "./logger";
import { NFTMetadata } from "./types";

export const mintByMintingAPI = async (contractAddress: string, walletAddress: string, uuid: string, metadata: NFTMetadata | null): Promise<string> => {
  const config: blockchainData.BlockchainDataModuleConfiguration = {
    baseConfig: new sdkConfig.ImmutableConfiguration({
      environment: environment,
    }),
    overrides: {
      basePath: serverConfig[environment].API_URL,
      headers: {
        "x-immutable-api-key": serverConfig[environment].HUB_API_KEY!,
        "x-api-key": serverConfig[environment].RPS_API_KEY!,
      },
    },
  };

  const client = new blockchainData.BlockchainData(config);

  const asset: any = {
    owner_address: walletAddress,
    reference_id: uuid,
    token_id: null,
  };

  if (metadata !== null) {
    asset.metadata = metadata;
  }

  try {
    const response = await client.createMintRequest({
      chainName: serverConfig[environment].chainName,
      contractAddress,
      createMintRequestRequest: {
        assets: [asset],
      },
    });

    logger.info(`Mint request sent with UUID: ${uuid}`);
    logger.debug("Mint request response:", JSON.stringify(response, null, 2));
    console.log(response);

    return uuid;
  } catch (error) {
    logger.error("Error sending mint request:", error);
    console.log(error);
    throw error;
  }
};
