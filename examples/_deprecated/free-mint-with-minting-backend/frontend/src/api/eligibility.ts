import config, { applicationEnvironment } from "../config/config";
import { EligibilityResult } from "../types/eligibility";

export async function eligibility(walletAddress: string): Promise<EligibilityResult> {
  const response = await fetch(`${config[applicationEnvironment].mintingBackendApiBaseUrl}/eligibility/${walletAddress.toLowerCase()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.status >= 200 && response.status <= 299) return await response.json();

  throw new Error(`${response.status} - Fetch check eligibility failed.`);
}
