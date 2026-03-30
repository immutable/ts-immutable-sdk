import { ethers } from "ethers";
import fs from "fs";
import serverConfig from "../src/config";
import { environment } from "../src/config";

interface Signer {
  address: string;
  signature: string;
}

// Asynchronously generates signers and signs messages
async function generateAndSign(signerCount: number, message: string): Promise<Signer[]> {
  const signers: Signer[] = [];
  for (let i = 0; i < signerCount; i++) {
    const wallet = ethers.Wallet.createRandom();
    const signature = await wallet.signMessage(message);
    signers.push({
      address: wallet.address,
      signature: signature,
    });
  }
  return signers;
}

// Converts an array of Signer objects to CSV format
function convertToCSV(signers: Signer[]): string {
  const header = "address,signature";
  const rows = signers.map((signer) => `${signer.address},${signer.signature}`);
  rows.unshift(header);
  return rows.join("\r\n");
}

// Main function executing the generate, convert and save functionalities
async function main(signerCount: number): Promise<void> {
  const signers = await generateAndSign(signerCount, serverConfig[environment].eoaMintMessage);
  const csvData = convertToCSV(signers);
  const outputFilePath = "tests/signers.csv";

  fs.writeFile(outputFilePath, csvData, (err) => {
    if (err) {
      console.error("Error writing file:", err);
      return;
    }
    console.log("EOAs and Signatures saved to:", outputFilePath);
  });
}

main(3000).catch(console.error);
