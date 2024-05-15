import { PrismaClient } from "@prisma/client";
import logger from "../logger";
import axios from "axios";
import serverConfig, { environment } from "../config";
import { client } from "../dbClient";

export async function updateMintStatus(prisma: PrismaClient): Promise<void> {
  try {
    const pendingMints = await prisma.imAssets.findMany({
      where: {
        mintingStatus: {
          not: "succeeded",
        },
      },
    });
    for (const mint of pendingMints) {
      try {
        const uuid = mint.assetId;
        const response = await axios.get(serverConfig[environment].mintRequestURL(serverConfig[environment].chainName, serverConfig[environment].collectionAddress, uuid), {
          headers: {
            "x-immutable-api-key": serverConfig[environment].HUB_API_KEY,
            "x-api-key": serverConfig[environment].RPS_API_KEY,
          },
        });
        logger.debug(`Checking status of mint with UUID ${uuid}: ${JSON.stringify(response.data, null, 2)}`);
        if (response.data.result.length > 0) {
          if (response.data.result[0].status === "succeeded") {
            await prisma.$transaction(async (prisma) => {
              // Update the status of minted tokens
              await prisma.imAssets.updateMany({
                where: { assetId: uuid },
                data: { assetId: "succeeded" },
              });

              // Log the successful mint
              logger.info(`Mint with UUID ${uuid} succeeded. Updating status.`);
            });
          } else if (response.data.result[0].status === "failed") {
            await prisma.imAssets.updateMany({
              where: { assetId: uuid },
              data: { mintingStatus: "failed" },
            });
            logger.info(`Mint with UUID ${uuid} failed. Updating status.`);
          }
        } else {
          await prisma.imAssets.updateMany({
            where: { assetId: uuid },
            data: { mintingStatus: "not_found_on_remote" },
          });
          logger.error(`No mint found with UUID ${uuid}.`);
        }
      } catch (error) {
        logger.error(`Error processing mint with UUID ${mint.assetId}.`);
        console.log(error);
      }
    }
  } catch (error) {
    logger.error(`Error fetching pending mints: ${JSON.stringify(error, null, 2)}`);
  }
}

(async () => {
  await updateMintStatus(client);
})();
