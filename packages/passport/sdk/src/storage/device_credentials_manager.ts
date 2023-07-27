/* eslint-disable class-methods-use-this */
import { DeviceTokenResponse, TokenPayload } from 'types';
import jwt_decode from 'jwt-decode';

const keyCrendentials = 'passport_credentials';
const validCredentialsMinTtlSec = 3600; // 1 hour

export default class DeviceCredentialsManager {
  public saveCredentials(tokenResponse: DeviceTokenResponse) {
    localStorage.setItem(keyCrendentials, JSON.stringify(tokenResponse));
  }

  public getCredentials(): DeviceTokenResponse | null {
    const credentialsJson = localStorage.getItem(keyCrendentials);
    if (credentialsJson) {
      return JSON.parse(credentialsJson);
    }
    return null;
  }

  public areValid(tokenResponse: DeviceTokenResponse): boolean {
    if (tokenResponse) {
      const accessTokenValid = this.isTokenValid(tokenResponse.access_token);
      const idTokenValid = this.isTokenValid(tokenResponse.id_token);
      return accessTokenValid && idTokenValid;
    }
    return false;
  }

  private isTokenValid(jwt: string): boolean {
    const tokenPayload: TokenPayload = jwt_decode(jwt);
    const expiresAt = tokenPayload.exp ?? 0;
    const now = (Date.now() / 1000) + validCredentialsMinTtlSec;
    return expiresAt > now;
  }

  public clearCredentials() {
    localStorage.removeItem(keyCrendentials);
  }
}
