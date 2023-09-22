/* eslint-disable no-console */
import * as passport from '@imtbl/passport';
import * as config from '@imtbl/config';
import * as provider from '@imtbl/provider';

/* eslint-disable no-undef */
const scope = 'openid offline_access profile email transact';
const audience = 'platform_api';
const redirectUri = 'https://localhost:3000/'; // Not required
const logoutRedirectUri = 'https://localhost:3000/'; // Not required

const keyFunctionName = 'fxName';
const keyRequestId = 'requestId';
const keyData = 'data';

// version check placeholders
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sdkVersionTag = '__SDK_VERSION__';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sdkVersionSha = '__SDK_VERSION_SHA__';

const PASSPORT_FUNCTIONS = {
  init: 'init',
  connect: 'connect',
  getPKCEAuthUrl: 'getPKCEAuthUrl',
  connectPKCE: 'connectPKCE',
  confirmCode: 'confirmCode',
  connectWithCredentials: 'connectWithCredentials',
  getAddress: 'getAddress',
  checkStoredCredentials: 'checkStoredCredentials',
  logout: 'logout',
  getEmail: 'getEmail',
  imx: {
    transfer: 'imxTransfer',
    batchNftTransfer: 'imxBatchNftTransfer',
  },
  zkEvm: {
    connectEvm: 'connectEvm',
    sendTransaction: 'zkEvmSendTransaction',
    requestAccounts: 'zkEvmRequestAccounts',
    getBalance: 'zkEvmGetBalance',
  },
};

// To notify game engine that this file is loaded
const initRequest = 'init';
const initRequestId = '1';

let passportClient: passport.Passport;
let providerInstance: provider.IMXProvider;
let zkEvmProviderInstance: passport.Provider;

declare global {
  interface Window {
    callFunction: (jsonData: string) => void,
    ue: any,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Unity: any,
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
declare function blu_event(event: string, data: string): void;
// eslint-disable-next-line @typescript-eslint/naming-convention
declare function UnityPostMessage(message: string): void;

const callbackToGame = (data: object) => {
  const message = JSON.stringify(data);
  console.log(`callbackToGame: ${message}`);
  console.log(message);
  if (typeof window.ue !== 'undefined') {
    if (typeof window.ue.jsconnector === 'undefined') {
      console.error('Unreal JSConnector not defined');
    } else {
      window.ue.jsconnector.sendtogame(message);
    }
  } else if (typeof blu_event !== 'undefined') {
    blu_event('sendtogame', message);
  } else if (typeof UnityPostMessage !== 'undefined') {
    UnityPostMessage(message);
  } else if (window.Unity !== 'undefined') {
    window.Unity.call(message);
  } else {
    console.error('No available game callbacks to call from ImmutableSDK game-bridge');
  }
};

const setProvider = (passportProvider: provider.IMXProvider | null): boolean => {
  if (passportProvider !== null && passportProvider !== undefined) {
    providerInstance = passportProvider;
    console.log('IMX provider set');
    return true;
  }
  console.log('No IMX provider');
  return false;
};

const setZkEvmProvider = (zkEvmProvider: passport.Provider | null): boolean => {
  if (zkEvmProvider !== null && zkEvmProvider !== undefined) {
    zkEvmProviderInstance = zkEvmProvider;
    console.log('ZkEvm provider set');
    return true;
  }
  console.log('No ZkEvm provider');
  return false;
};

window.callFunction = async (jsonData: string) => { // eslint-disable-line no-unused-vars
  console.log(`Call function ${jsonData}`);

  let fxName = null;
  let requestId = null;

  try {
    const json = JSON.parse(jsonData);
    fxName = json[keyFunctionName];
    requestId = json[keyRequestId];
    const data = json[keyData];

    switch (fxName) {
      case PASSPORT_FUNCTIONS.init: {
        const request = JSON.parse(data);
        const redirect: string | null = request?.redirectUri;
        if (!passportClient) {
          const passportConfig = {
            baseConfig: new config.ImmutableConfiguration({
              environment: request.environment,
            }),
            clientId: request.clientId,
            audience,
            scope,
            redirectUri: (redirect ?? redirectUri),
            logoutRedirectUri,
            crossSdkBridgeEnabled: true,
          };
          passportClient = new passport.Passport(passportConfig);
        }
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: true,
        });

        // version check here...

        break;
      }
      case PASSPORT_FUNCTIONS.connect: {
        const response = await passportClient?.loginWithDeviceFlow();
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: true,
          code: response.code,
          deviceCode: response.deviceCode,
          url: response.url,
          interval: response.interval,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.getPKCEAuthUrl: {
        const response = passportClient?.getPKCEAuthorizationUrl();
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: true,
          result: response,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.connectPKCE: {
        const request = JSON.parse(data);
        const passportProvider = await passportClient?.connectImxPKCEFlow(request.authorizationCode, request.state);
        const success = setProvider(passportProvider);
        callbackToGame({
          responseFor: fxName,
          requestId,
          success,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.confirmCode: {
        const request = JSON.parse(data);
        const passportProvider = await passportClient?.connectImxDeviceFlow(
          request.deviceCode,
          request.interval,
          request.timeoutMs ?? null,
        );
        const success = setProvider(passportProvider);
        callbackToGame({
          responseFor: fxName,
          requestId,
          success,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.connectWithCredentials: {
        const credentials = JSON.parse(data);
        /* eslint-disable @typescript-eslint/naming-convention */
        const passportProvider = await passportClient?.connectImxWithCredentials({
          access_token: credentials.accessToken,
          refresh_token: credentials.refreshToken,
          id_token: credentials.idToken,
          token_type: credentials.tokenType,
          expires_in: credentials.expiresIn,
        });
        /* eslint-enable @typescript-eslint/naming-convention */
        const success = setProvider(passportProvider);
        callbackToGame({
          responseFor: fxName,
          requestId,
          success,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.zkEvm.connectEvm: {
        const zkEvmProvider = passportClient?.connectEvm();
        const success = setZkEvmProvider(zkEvmProvider);
        callbackToGame({
          responseFor: fxName,
          requestId,
          success,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.getAddress: {
        const address = await providerInstance?.getAddress();
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: true,
          result: address,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.checkStoredCredentials: {
        const credentials = passportClient?.checkStoredDeviceFlowCredentials();
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: true,
          accessToken: credentials?.access_token,
          refreshToken: credentials?.refresh_token,
          idToken: credentials?.id_token,
          tokenType: credentials?.token_type,
          expiresIn: credentials?.expires_in,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.logout: {
        await passportClient?.logoutDeviceFlow();
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: true,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.getEmail: {
        const userProfile = await passportClient?.getUserInfoDeviceFlow();
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: true,
          result: userProfile?.email,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.imx.transfer: {
        const unsignedTransferRequest = JSON.parse(data);
        const response = await providerInstance?.transfer(unsignedTransferRequest);
        callbackToGame({
          ...{
            responseFor: fxName,
            requestId,
            success: response !== null && response !== undefined,
          },
          ...response,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.imx.batchNftTransfer: {
        const nftTransferDetails = JSON.parse(data);
        const response = await providerInstance?.batchNftTransfer(nftTransferDetails);
        callbackToGame({
          ...{
            responseFor: fxName,
            requestId,
            success: response !== null && response !== undefined,
            result: response,
          },
          ...response,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.zkEvm.sendTransaction: {
        const transaction = JSON.parse(data);
        const transactionHash = await zkEvmProviderInstance.request({
          method: 'eth_sendTransaction',
          params: [transaction],
        });
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: true,
          result: transactionHash,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.zkEvm.requestAccounts: {
        const result = await zkEvmProviderInstance.request({
          method: 'eth_requestAccounts',
        });
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: true,
          accounts: result,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.zkEvm.getBalance: {
        const request = JSON.parse(data);
        const result = await zkEvmProviderInstance.request({
          method: 'eth_getBalance',
          params: [request.address, request.blockNumberOrTag],
        });
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: true,
          result,
        });
        break;
      }
      default:
        break;
    }
  } catch (error: any) {
    console.log(error);
    callbackToGame({
      responseFor: fxName,
      requestId,
      success: false,
      error: error.message,
      errorType: error instanceof passport.PassportError ? error.type : null,
    });
  }
};

function onLoadHandler() {
  // File loaded
  // This is to prevent callFunction not defined error in Unity
  callbackToGame({
    responseFor: initRequest,
    requestId: initRequestId,
    success: true,
  });
}

console.log('index.ts loaded');

function winLoad(callback: { (): void }) {
  if (document.readyState === 'complete') {
    callback();
  } else {
    window.addEventListener('load', callback);
  }
}

winLoad(onLoadHandler);
