import { PrismaClient } from "@prisma/client";
import logger from "../logger";
import serverConfig, { environment } from "../config";
import { v4 as uuidv4 } from "uuid";
import { client } from '../dbClient';
import { blockchainDataClient } from "../blockchainDataClient";

export async function mintFailsAndMissing(prisma: PrismaClient): Promise<void> {
  try {
    const pendingMints = await prisma.imAssets.findMany({
      where: {
        OR: [{
          mintingStatus: {
            not: "succeeded",
          },
        }, {
          mintingStatus: null
        }],
      },
    });
    for (const mint of pendingMints) {
      try {
        const uuid = mint.assetId;
        const response = await blockchainDataClient.getMintRequest({
          chainName: serverConfig[environment].chainName,
          contractAddress: serverConfig[environment].collectionAddress,
          referenceId: uuid,
        });
        logger.debug(`Checking status of mint with UUID ${uuid}: ${JSON.stringify(response, null, 2)}`);
        if (response.result.length > 0) {
          if (response.result[0].status === "failed") {
            const newUUID = uuidv4();

            logger.info(`Mint with UUID ${uuid} failed. Replace with a new UUID: ${newUUID}.`);

            await prisma.imAssets.updateMany({
              where: { assetId: uuid },
              data: { mintingStatus: null, assetId: newUUID },
            });

            logger.warn(`Please run the server to resubmit the mints`)
          }
          if (response.result[0].status === "succeeded") {
            await prisma.imAssets.updateMany({
              where: { assetId: uuid },
              data: { mintingStatus: "succeeded" },
            });
          }

        } else {
          logger.error(`No mint found with UUID ${uuid}.`);
          const newUUID = uuidv4();

          await prisma.imAssets.updateMany({
            where: { assetId: uuid },
            data: { mintingStatus: null, assetId: newUUID },
          });
          logger.info(`Issue a new mint with UUID: ${newUUID}.`);
          logger.warn(`Please run the server to resubmit the mints`)
        }
      } catch (error) {
        logger.error(`Error processing mint with UUID ${mint.assetId}.`);
        console.log(error);
      }
    }
    logger.info('Done');
  } catch (error) {
    logger.error(`Error fetching pending mints: ${JSON.stringify(error, null, 2)}`);
  }
}

(async () => {
  await mintFailsAndMissing(client);
})();
