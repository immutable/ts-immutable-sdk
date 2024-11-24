import { Mint } from "../types/mint";

const mintResultsKey = 'immutable-mint-request-results';

/**
 * 'immutable-mint-request-results' : [
 * { tokenID, walletAddress, uuid, collectionAddress, status }, 
 * { tokenID, walletAddress, uuid, collectionAddress, status },
 * ]
 */

export function getMintResultsLS(): Mint[] {
  const lsMintResults = localStorage.getItem(mintResultsKey);
  if (!lsMintResults) return [];

  return JSON.parse(lsMintResults);
}

export function updateMintResultLS(mint: Mint, status: string) {
  const existingMintResults = getMintResultsLS();

  // mint found in existing mints
  const matchedMintIndex = existingMintResults.findIndex((existing) => existing.uuid === mint.uuid);

  let updatedMintResults: Mint[] = [];
  if (matchedMintIndex === -1) {
    // add
    updatedMintResults = [
      ...existingMintResults, {
        ...mint,
        status
      }
    ]
  } else {
    // update at id
    updatedMintResults = existingMintResults;
    updatedMintResults.splice(matchedMintIndex, 1, { ...updatedMintResults[matchedMintIndex], ...mint, status })
  }

  // set
  localStorage.setItem(mintResultsKey,
    JSON.stringify(updatedMintResults)
  )
}