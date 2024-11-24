import config, { applicationEnvironment } from "../config/config";
import { EoaMintMessage } from "../types/eoaMintMessage";

export async function eoaSignableMessage(): Promise<EoaMintMessage> {
  const response = await fetch(`${config[applicationEnvironment].mintingBackendApiBaseUrl}/get-eoa-mint-message`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.status >= 200 && response.status <= 299) return await response.json();

  throw new Error(`${response.status} - Fetch check eligibility failed.`);
}
