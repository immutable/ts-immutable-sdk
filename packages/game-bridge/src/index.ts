/* eslint-disable no-console */
import * as passport from '@imtbl/passport';
import * as config from '@imtbl/config';
import * as provider from '@imtbl/x-provider';
import { track, identify } from '@imtbl/metrics';

/* eslint-disable no-undef */
const scope = 'openid offline_access profile email transact';
const audience = 'platform_api';
const redirectUri = 'https://localhost:3000/'; // Not required

const keyFunctionName = 'fxName';
const keyRequestId = 'requestId';
const keyData = 'data';

const trackFunction = 'track';
const moduleName = 'gameBridge';

// version check placeholders
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sdkVersionTag = '__SDK_VERSION__';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sdkVersionSha = '__SDK_VERSION_SHA__';

const PASSPORT_FUNCTIONS = {
  init: 'init',
  initDeviceFlow: 'initDeviceFlow',
  relogin: 'relogin',
  reconnect: 'reconnect',
  getPKCEAuthUrl: 'getPKCEAuthUrl',
  loginPKCE: 'loginPKCE',
  connectPKCE: 'connectPKCE',
  loginConfirmCode: 'loginConfirmCode',
  connectConfirmCode: 'connectConfirmCode',
  getAccessToken: 'getAccessToken',
  getIdToken: 'getIdToken',
  logout: 'logout',
  getEmail: 'getEmail',
  getPassportId: 'getPassportId',
  getLinkedAddresses: 'getLinkedAddresses',
  imx: {
    getAddress: 'getAddress',
    isRegisteredOffchain: 'isRegisteredOffchain',
    registerOffchain: 'registerOffchain',
    transfer: 'imxTransfer',
    batchNftTransfer: 'imxBatchNftTransfer',
  },
  zkEvm: {
    connectEvm: 'connectEvm',
    sendTransaction: 'zkEvmSendTransaction',
    requestAccounts: 'zkEvmRequestAccounts',
    getBalance: 'zkEvmGetBalance',
    getTransactionReceipt: 'zkEvmGetTransactionReceipt',
  },
};

// To notify game engine that this file is loaded
const initRequest = 'init';
const initRequestId = '1';

let passportClient: passport.Passport;
let providerInstance: provider.IMXProvider | null;
let zkEvmProviderInstance: passport.Provider | null;

declare global {
  interface Window {
    callFunction: (jsonData: string) => void;
    ue: any;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Unity: any;
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
    console.error(
      'No available game callbacks to call from ImmutableSDK game-bridge',
    );
  }
};

const setProvider = (
  passportProvider: provider.IMXProvider | null,
): boolean => {
  if (passportProvider !== null && passportProvider !== undefined) {
    providerInstance = passportProvider;
    console.log('IMX provider set');
    return true;
  }
  console.log('No IMX provider');
  return false;
};

const getProvider = (): provider.IMXProvider => {
  if (providerInstance == null) {
    throw new Error('No IMX provider');
  }
  return providerInstance;
};

const setZkEvmProvider = (zkEvmProvider: passport.Provider | null): boolean => {
  if (zkEvmProvider !== null && zkEvmProvider !== undefined) {
    zkEvmProviderInstance = zkEvmProvider;
    console.log('zkEvm provider set');
    return true;
  }
  console.log('No zkEvm provider');
  return false;
};

const getZkEvmProvider = (): passport.Provider => {
  if (zkEvmProviderInstance == null) {
    throw new Error('No zkEvm provider');
  }
  return zkEvmProviderInstance;
};

track(moduleName, 'loadedGameBridge', {
  sdkVersionTag,
});

window.callFunction = async (jsonData: string) => {
  // eslint-disable-line no-unused-vars
  console.log(`Call function ${jsonData}`);

  let fxName = null;
  let requestId = null;

  const markStart = Date.now();
  try {
    const json = JSON.parse(jsonData);
    fxName = json[keyFunctionName];
    requestId = json[keyRequestId];
    const data = json[keyData];

    track(moduleName, 'startedCallFunction', {
      function: fxName,
    });
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
            redirectUri: redirect ?? redirectUri,
            logoutRedirectUri: request?.logoutRedirectUri,
            crossSdkBridgeEnabled: true,
          };
          passportClient = new passport.Passport(passportConfig);
          track(moduleName, 'initialisedPassport', {
            timeMs: Date.now() - markStart,
          });
        }
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: true,
        });

        // version check
        const { engineVersion } = request;
        const versionCheckParams = {
          gameBridgeTag: sdkVersionTag,
          gameBridgeSha: sdkVersionSha,
          engine: engineVersion.engine,
          engineVersion: engineVersion.engineVersion,
          engineSdkVersion: engineVersion.engineSdkVersion ?? '',
          platform: engineVersion.platform,
          platformVersion: engineVersion.platformVersion,
          deviceModel: engineVersion.deviceModel ?? 'N/A',
        };
        console.log(`Version check: ${JSON.stringify(versionCheckParams)}`);

        track(moduleName, 'completedInitGameBridge', {
          ...versionCheckParams,
          timeMs: Date.now() - markStart,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.initDeviceFlow: {
        const response = await passportClient?.loginWithDeviceFlow();
        track(moduleName, 'performedInitDeviceFlow', {
          timeMs: Date.now() - markStart,
        });
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
      case PASSPORT_FUNCTIONS.relogin: {
        const userInfo = await passportClient?.login({
          useCachedSession: true,
        });
        const succeeded = userInfo !== null;
        if (succeeded) {
          identify({ passportId: userInfo?.sub });
        }
        track(moduleName, 'performedRelogin', {
          succeeded,
          timeMs: Date.now() - markStart,
        });
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: true,
          result: userInfo !== null,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.reconnect: {
        let providerSet = false;
        const userInfo = await passportClient?.login({
          useCachedSession: true,
        });
        if (userInfo) {
          const passportProvider = await passportClient?.connectImx();
          providerSet = setProvider(passportProvider);
          identify({ passportId: userInfo?.sub });
        }
        track(moduleName, 'performedReconnect', {
          succeeded: userInfo !== null,
          timeMs: Date.now() - markStart,
        });
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: true,
          result: providerSet,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.getPKCEAuthUrl: {
        const response = passportClient?.loginWithPKCEFlow();
        track(moduleName, 'performedGetPkceAuthUrl', {
          timeMs: Date.now() - markStart,
        });
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: true,
          result: response,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.loginPKCE: {
        const request = JSON.parse(data);
        const profile = await passportClient?.loginWithPKCEFlowCallback(
          request.authorizationCode,
          request.state,
        );
        identify({ passportId: profile.sub });
        track(moduleName, 'performedLoginPkce', {
          timeMs: Date.now() - markStart,
        });
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: true,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.connectPKCE: {
        const request = JSON.parse(data);
        const profile = await passportClient?.loginWithPKCEFlowCallback(
          request.authorizationCode,
          request.state,
        );
        const passportProvider = await passportClient?.connectImx();
        const providerSet = setProvider(passportProvider);
        if (providerSet) {
          identify({ passportId: profile.sub });
        }
        track(moduleName, 'performedConnectPkce', {
          succeeded: providerSet,
          timeMs: Date.now() - markStart,
        });
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: true,
          result: providerSet,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.loginConfirmCode: {
        const request = JSON.parse(data);
        const profile = await passportClient?.loginWithDeviceFlowCallback(
          request.deviceCode,
          request.interval,
          request.timeoutMs ?? null,
        );

        identify({ passportId: profile.sub });
        track(moduleName, 'performedLoginConfirmCode', {
          timeMs: Date.now() - markStart,
        });

        callbackToGame({
          responseFor: fxName,
          requestId,
          success: true,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.connectConfirmCode: {
        const request = JSON.parse(data);
        const profile = await passportClient?.loginWithDeviceFlowCallback(
          request.deviceCode,
          request.interval,
          request.timeoutMs ?? null,
        );

        const passportProvider = await passportClient?.connectImx();
        const providerSet = setProvider(passportProvider);

        if (providerSet) {
          identify({ passportId: profile.sub });
        }
        track(moduleName, 'performedConnectConfirmCode', {
          succeeded: providerSet,
          timeMs: Date.now() - markStart,
        });

        callbackToGame({
          responseFor: fxName,
          requestId,
          success: true,
          result: providerSet,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.logout: {
        const deviceFlowEndSessionEndpoint = await passportClient?.logoutDeviceFlow();
        providerInstance = null;
        zkEvmProviderInstance = null;
        track(moduleName, 'performedGetLogoutUrl', {
          timeMs: Date.now() - markStart,
        });
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: true,
          result: deviceFlowEndSessionEndpoint,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.getAccessToken: {
        const accessToken = await passportClient?.getAccessToken();
        track(moduleName, 'performedGetAccessToken', {
          timeMs: Date.now() - markStart,
        });
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: true,
          result: accessToken,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.getIdToken: {
        const idToken = await passportClient?.getIdToken();
        track(moduleName, 'performedGetIdToken', {
          timeMs: Date.now() - markStart,
        });
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: true,
          result: idToken,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.getEmail: {
        const userProfile = await passportClient?.getUserInfo();
        track(moduleName, 'performedGetEmail', {
          timeMs: Date.now() - markStart,
        });
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: true,
          result: userProfile?.email,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.getPassportId: {
        const userProfile = await passportClient?.getUserInfo();
        track(moduleName, 'performedGetPassportId', {
          timeMs: Date.now() - markStart,
        });
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: true,
          result: userProfile?.sub,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.getLinkedAddresses: {
        const linkedAddresses = await passportClient?.getLinkedAddresses();
        track(moduleName, 'performedGetLinkedAddresses', {
          timeMs: Date.now() - markStart,
        });
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: true,
          result: linkedAddresses,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.imx.getAddress: {
        const address = await getProvider().getAddress();
        track(moduleName, 'performedImxGetAddress', {
          timeMs: Date.now() - markStart,
        });
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: true,
          result: address,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.imx.isRegisteredOffchain: {
        const registered = await getProvider().isRegisteredOffchain();
        track(moduleName, 'performedImxIsRegisteredOffchain', {
          timeMs: Date.now() - markStart,
        });
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: true,
          result: registered,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.imx.registerOffchain: {
        const response = await getProvider().registerOffchain();
        track(moduleName, 'performedImxRegisterOffchain', {
          timeMs: Date.now() - markStart,
        });
        callbackToGame({
          ...{
            responseFor: fxName,
            requestId,
            success: true,
          },
          ...response,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.imx.transfer: {
        const unsignedTransferRequest = JSON.parse(data);
        const response = await getProvider().transfer(unsignedTransferRequest);
        track(moduleName, 'performedImxTransfer', {
          timeMs: Date.now() - markStart,
        });
        callbackToGame({
          ...{
            responseFor: fxName,
            requestId,
            success: true,
          },
          ...response,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.imx.batchNftTransfer: {
        const nftTransferDetails = JSON.parse(data);
        const response = await getProvider().batchNftTransfer(
          nftTransferDetails,
        );
        track(moduleName, 'performedImxBatchNftTransfer', {
          timeMs: Date.now() - markStart,
        });
        callbackToGame({
          ...{
            responseFor: fxName,
            requestId,
            success: true,
            result: response,
          },
          ...response,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.zkEvm.connectEvm: {
        const zkEvmProvider = passportClient?.connectEvm();
        const providerSet = setZkEvmProvider(zkEvmProvider);
        track(moduleName, 'performedZkevmConnectEvm', {
          succeeded: providerSet,
          timeMs: Date.now() - markStart,
        });
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: true,
          result: providerSet,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.zkEvm.sendTransaction: {
        const transaction = JSON.parse(data);
        const transactionHash = await getZkEvmProvider().request({
          method: 'eth_sendTransaction',
          params: [transaction],
        });
        track(moduleName, 'performedZkevmSendTransaction', {
          timeMs: Date.now() - markStart,
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
        const result = await getZkEvmProvider().request({
          method: 'eth_requestAccounts',
        });
        track(moduleName, 'performedZkevmRequestAccounts', {
          timeMs: Date.now() - markStart,
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
        const result = await getZkEvmProvider().request({
          method: 'eth_getBalance',
          params: [request.address, request.blockNumberOrTag],
        });
        track(moduleName, 'performedZkevmGetBalance', {
          timeMs: Date.now() - markStart,
        });
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: true,
          result,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.zkEvm.getTransactionReceipt: {
        const request = JSON.parse(data);
        const response = await getZkEvmProvider().request({
          method: 'eth_getTransactionReceipt',
          params: [request.txHash],
        });
        track(moduleName, 'performedZkevmGetTransactionReceipt', {
          timeMs: Date.now() - markStart,
        });
        callbackToGame({
          ...{
            responseFor: fxName,
            requestId,
            success: true,
          },
          ...response,
        });
        break;
      }
      case trackFunction: {
        const request = JSON.parse(data);
        const properties = JSON.parse(request.properties);
        track(request.moduleName, request.eventName, properties);
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: true,
        });
        break;
      }
      default:
        break;
    }
  } catch (error: any) {
    track(moduleName, 'failedCallFunction', {
      function: fxName,
      error: error.message,
      timeMs: Date.now() - markStart,
    });
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
