import config, { applicationEnvironment } from "../config/config";
import { Mint } from "../types/mint";

export async function mintForEOA(signature: string): Promise<Mint> {
  const response = await fetch(`${config[applicationEnvironment].mintingBackendApiBaseUrl}/mint/eoa`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      signature
    }),
  });

  if (response.status >= 200 && response.status <= 299) return await response.json();

  throw new Error(`${response.status} - Mint post failed.`);
}
