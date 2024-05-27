import { PrismaClient } from "@prisma/client";
import logger from "./logger";

export async function checkAddressMinted(address: string, client: PrismaClient): Promise<string | null> {
  try {
    logger.info(`Checking if user has minted: ${address}`);
    const mintedAddress = await client.imAssets.findFirst({
      where: {
        ownerAddress: address,
      },
    });
    logger.info(`User has minted: ${mintedAddress !== null}`);
    return mintedAddress?.assetId ?? null;
  } catch (error) {
    logger.error(`Error checking if user has minted: ${error}`);
    throw error;
  }
}

export async function totalMintCountAcrossAllPhases(client: PrismaClient): Promise<number> {
  try {
    const mintCount = await client.imAssets.count();
    return mintCount;
  } catch (error) {
    logger.error(`Error getting total mint count: ${error}`);
    throw error;
  }
}


export async function loadAddressesIntoAllowlist(addresses: string[], phase: number, client: PrismaClient) {
  try {
    for (let address of addresses) {
      await client.allowlist.create({
        data: {
          address: address.toLowerCase(),
          phase: phase,
        },
      });
    }
    console.log("Addresses have been successfully loaded into the database.");
  } catch (error) {
    console.error("Error loading addresses into the database:", error);
  }
}

export async function readAddressesFromAllowlist(phase: number, client: PrismaClient): Promise<string[]> {
  try {
    const addresses = await client.allowlist.findMany({
      where: {
        phase: phase,
      },
    });
    return addresses.map((address: any) => address.address.toLowerCase());
  } catch (error) {
    console.error("Error reading addresses from the database:", error);
    throw error;
  }
}
