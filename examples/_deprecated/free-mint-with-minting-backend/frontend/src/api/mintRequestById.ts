import { passportInstance } from "../immutable/passport";
import config, { applicationEnvironment } from "../config/config";
import { MintRequestByIDResult } from "../types/mintRequestById";

export async function mintRequestById(referenceId: string): Promise<MintRequestByIDResult> {
  const IDToken = await passportInstance.getIdToken();
  const response = await fetch(`${config[applicationEnvironment].mintingBackendApiBaseUrl}/get-mint-request/${referenceId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${IDToken}`,
    }
  });

  if (response.status >= 200 && response.status <= 299) return await response.json();

  throw new Error(`${response.status} - Mint post failed.`);
}
