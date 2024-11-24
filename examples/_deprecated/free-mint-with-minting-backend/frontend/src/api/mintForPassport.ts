import { passportInstance } from "../immutable/passport";
import config, { applicationEnvironment } from "../config/config";
import { Mint } from "../types/mint";

export async function mintForPassport(): Promise<Mint> {
  const IDToken = await passportInstance.getIdToken();
  const response = await fetch(`${config[applicationEnvironment].mintingBackendApiBaseUrl}/mint/passport`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${IDToken}`,
    },
    body: JSON.stringify({})
  });

  if (response.status >= 200 && response.status <= 299) return await response.json();

  throw new Error(`${response.status} - Mint post failed.`);
}
