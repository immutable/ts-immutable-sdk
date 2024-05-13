import logger from "./logger";
import { Pool } from 'pg'

export async function checkAddressMinted(address: string, pgClient: Pool): Promise<string | null> {
  try {
    logger.info(`Checking if user has minted: ${address}`);
    const result = await pgClient.query('SELECT uuid FROM im_assets WHERE address = $1', [address]);
    const mintedAddress = result.rows[0];
    logger.info(`User has minted: ${mintedAddress !== null}`);
    return mintedAddress?.uuid ?? null;
  } catch (error) {
    logger.error(`Error checking if user has minted: ${error}`);
    throw error;
  }
}

export async function totalMintCountAcrossAllPhases(pgClient: Pool): Promise<number> {
  const result = await pgClient.query('SELECT COUNT(*) FROM im_assets');
  return parseInt(result.rows[0].count);
}


export async function loadAddressesIntoAllowlist(addresses: string[], phase: number, pgClient: Pool) {
  try {
    for (let address of addresses) {
      await pgClient.query('INSERT INTO allowlist (address, phase) VALUES ($1, $2) ON CONFLICT DO NOTHING;', [address.toLowerCase(), phase]);
    }
    console.log("Addresses have been successfully loaded into the database.");
  } catch (error) {
    console.error("Error loading addresses into the database:", error);
  }
}

export async function readAddressesFromAllowlist(phase: number, pgClient: Pool): Promise<string[]> {
  try {
    const result = await pgClient.query('SELECT address FROM allowlist WHERE phase = $1', [phase]);

    return result.rows.map((address) => address.address.toLowerCase());
  } catch (error) {
    console.error("Error reading addresses from the database:", error);
    throw error;
  }
}
