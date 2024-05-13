import { PrismaClient } from "@prisma/client";
import logger from "../logger";
import axios from "axios";
import serverConfig, { environment } from "../config";
import { mintByMintingAPI } from "../minting";
import { v4 as uuidv4 } from "uuid";

export async function mintFailsAndMissing(prisma: PrismaClient): Promise<void> {
  try {
    const pendingMints = await prisma.mints.findMany({
      where: {
        status: {
          not: "succeeded",
        },
      },
    });
    for (const mint of pendingMints) {
      try {
        const uuid = mint.uuid;
        const response = await axios.get(serverConfig[environment].mintRequestURL(serverConfig[environment].chainName, serverConfig[environment].collectionAddress, uuid), {
          headers: {
            "x-immutable-api-key": serverConfig[environment].HUB_API_KEY,
            "x-api-key": serverConfig[environment].RPS_API_KEY,
          },
        });
        logger.debug(`Checking status of mint with UUID ${uuid}: ${JSON.stringify(response.data, null, 2)}`);
        if (response.data.result.length > 0) {
          if (response.data.result[0].status === "failed") {
            const newUUID = uuidv4();

            logger.info(`Mint with UUID ${uuid} failed. Retrying with ${newUUID}.`);

            const updates = await prisma.mints.updateMany({
              where: { uuid },
              data: { status: "pending", uuid: newUUID },
            });

            if (updates.count > 0) {
              mintByMintingAPI(serverConfig[environment].collectionAddress, mint.address, newUUID, serverConfig[environment].metadata);
            }
          }
        } else {
          logger.error(`No mint found with UUID ${uuid}.`);
          const newUUID = uuidv4();

          const updates = await prisma.mints.updateMany({
            where: { uuid },
            data: { status: "pending", uuid: newUUID },
          });

          if (updates.count > 0) {
            mintByMintingAPI(serverConfig[environment].collectionAddress, mint.address, newUUID, serverConfig[environment].metadata);
          }
        }
      } catch (error) {
        logger.error(`Error processing mint with UUID ${mint.uuid}.`);
        console.log(error);
      }
    }
  } catch (error) {
    logger.error(`Error fetching pending mints: ${JSON.stringify(error, null, 2)}`);
  }
}

(async () => {
  const prisma = new PrismaClient();
  await mintFailsAndMissing(prisma);
})();
