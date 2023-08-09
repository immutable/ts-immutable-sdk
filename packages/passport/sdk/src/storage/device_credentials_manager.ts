/* eslint-disable class-methods-use-this */
import { DeviceTokenResponse, TokenPayload, PKCEData } from 'types';
import jwt_decode from 'jwt-decode';

const keyCrendentials = 'passport_credentials';
const KEY_PKCE_STATE = 'pkce_state';
const KEY_PKCE_VERIFIER = 'pkce_verifier';
const validCredentialsMinTtlSec = 3600; // 1 hour

export default class DeviceCredentialsManager {
  public saveCredentials(tokenResponse: DeviceTokenResponse) {
    if (this.areValid(tokenResponse)) {
      localStorage.setItem(keyCrendentials, JSON.stringify(tokenResponse));
    } else {
      throw Error('Invalid credentials.');
    }
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
    try {
      const tokenPayload: TokenPayload = jwt_decode(jwt);
      const expiresAt = tokenPayload.exp ?? 0;
      const now = (Date.now() / 1000) + validCredentialsMinTtlSec;
      return expiresAt > now;
    } catch (error) {
      return false;
    }
  }

  public clearCredentials() {
    localStorage.removeItem(keyCrendentials);
  }

  public savePKCEData(data: PKCEData) {
    localStorage.setItem(KEY_PKCE_STATE, data.state);
    localStorage.setItem(KEY_PKCE_VERIFIER, data.verifier);
  }

  public getPKCEData(): PKCEData | null {
    const state = localStorage.getItem(KEY_PKCE_STATE);
    const verifier = localStorage.getItem(KEY_PKCE_VERIFIER);
    if (state && verifier) {
      return { state, verifier };
    }
    return null;
  }
}
