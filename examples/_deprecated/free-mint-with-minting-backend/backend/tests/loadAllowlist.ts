import { readAddressesFromCSV } from "../src/utils";
import { loadAddressesIntoAllowlist } from "../src/database";
import { client } from '../src/dbClient';

const loadPercentage = 100; // Percentage of the allowlist to load

(async () => {
  const filePath = "tests/signers.csv"; // Path to the CSV file containing Ethereum addresses and signatures

  try {
    const signers = await readAddressesFromCSV(filePath);

    if (signers.length > 0) {
      const totalToLoad = Math.ceil((signers.length * loadPercentage) / 100);
      const addressesToLoad = signers.slice(0, totalToLoad).map((signer) => signer.address);

      // Load the defined percentage of addresses into the allowlist
      await loadAddressesIntoAllowlist(addressesToLoad, 1, client);
      console.log(`Loaded ${totalToLoad} addresses (out of ${signers.length}) into the allowlist.`);
    } else {
      console.log("No addresses to load.");
    }
  } catch (error) {
    console.error("Error:", error);
  }
  // try {
  //   const addresses = await readAddressesFromAllowlist(0);
  //   addresses.forEach((address) => console.log(address));
  // } catch (error) {
  //   console.error("Error reading addresses from the database:", error);
  // }
})();
