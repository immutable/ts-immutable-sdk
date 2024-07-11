/* eslint-disable no-console */
import * as passport from '@imtbl/passport';
import * as config from '@imtbl/config';
import * as provider from '@imtbl/x-provider';
import {
  track,
  trackError,
  trackDuration,
  identify,
} from '@imtbl/metrics';
import { providers } from 'ethers';

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
    sendTransactionWithConfirmation: 'zkEvmSendTransactionWithConfirmation',
    requestAccounts: 'zkEvmRequestAccounts',
    getBalance: 'zkEvmGetBalance',
    getTransactionReceipt: 'zkEvmGetTransactionReceipt',
  },
};

// To notify game engine that this file is loaded
const initRequest = 'init';
const initRequestId = '1';

let passportClient: passport.Passport | null;
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

interface CallbackToGameData {
  responseFor: string;
  requestId: string;
  success: boolean;
  error?: string;
  errorType?: string | null;
  code?: string;
  deviceCode?: string;
  url?: string;
  interval?: number;
  result?: any;
  accounts?: string[];
}

const callbackToGame = (data: CallbackToGameData) => {
  const message = JSON.stringify(data);
  console.log(`callbackToGame: ${message}`);
  console.log(message);
  if (window.ue !== undefined) {
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

const getPassportClient = (): passport.Passport => {
  if (passportClient == null) {
    throw new Error('No Passport client');
  }
  return passportClient;
};

const setProvider = (
  passportProvider: provider.IMXProvider | null | undefined,
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

const setZkEvmProvider = (zkEvmProvider: passport.Provider | null | undefined): boolean => {
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

/**
 * @name markTime
 */
const mt = (start: number) => Date.now() - start;

track(moduleName, 'loadedGameBridge', {
  sdkVersionTag,
});

// 'status' is set to true if:
// 1. the underlying package function executed successfully without throwing an error
// 2. the object we expect to return is not undefined or null (like HTTP 200 status)
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
          trackDuration(moduleName, 'initialisedPassport', mt(markStart));
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

        trackDuration(moduleName, 'completedInitGameBridge', mt(markStart), {
          ...versionCheckParams,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.initDeviceFlow: {
        const response = await getPassportClient().loginWithDeviceFlow();
        trackDuration(moduleName, 'performedInitDeviceFlow', mt(markStart));
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
        const userInfo = await getPassportClient().login({
          useCachedSession: true,
        });
        const succeeded = userInfo !== null;

        if (!succeeded) {
          throw new Error('Failed to re-login');
        }

        identify({ passportId: userInfo?.sub });
        trackDuration(moduleName, 'performedRelogin', mt(markStart), {
          succeeded,
        });
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: userInfo !== null,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.reconnect: {
        let providerSet = false;
        const userInfo = await getPassportClient().login({
          useCachedSession: true,
        });
        if (userInfo) {
          const passportProvider = await getPassportClient().connectImx();
          providerSet = setProvider(passportProvider);
          identify({ passportId: userInfo?.sub });
        }

        if (!providerSet) {
          throw new Error('Failed to reconnect');
        }

        trackDuration(moduleName, 'performedReconnect', mt(markStart), {
          succeeded: userInfo !== null,
        });
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: providerSet,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.getPKCEAuthUrl: {
        const url = getPassportClient().loginWithPKCEFlow();
        trackDuration(moduleName, 'performedGetPkceAuthUrl', mt(markStart));
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: true,
          result: url,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.loginPKCE: {
        const request = JSON.parse(data);
        const profile = await getPassportClient().loginWithPKCEFlowCallback(
          request.authorizationCode,
          request.state,
        );
        identify({ passportId: profile.sub });
        trackDuration(moduleName, 'performedLoginPkce', mt(markStart));
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: true,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.connectPKCE: {
        const request = JSON.parse(data);
        const profile = await getPassportClient().loginWithPKCEFlowCallback(
          request.authorizationCode,
          request.state,
        );
        const passportProvider = await getPassportClient().connectImx();
        const providerSet = setProvider(passportProvider);

        if (!providerSet) {
          throw new Error('Failed to connect via PKCE');
        }

        identify({ passportId: profile.sub });
        trackDuration(moduleName, 'performedConnectPkce', mt(markStart), {
          succeeded: providerSet,
        });
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: providerSet,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.loginConfirmCode: {
        const request = JSON.parse(data);
        const profile = await getPassportClient().loginWithDeviceFlowCallback(
          request.deviceCode,
          request.interval,
          request.timeoutMs ?? null,
        );

        identify({ passportId: profile.sub });
        trackDuration(moduleName, 'performedLoginConfirmCode', mt(markStart));

        callbackToGame({
          responseFor: fxName,
          requestId,
          success: true,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.connectConfirmCode: {
        const request = JSON.parse(data);
        const profile = await getPassportClient().loginWithDeviceFlowCallback(
          request.deviceCode,
          request.interval,
          request.timeoutMs ?? null,
        );

        const passportProvider = await getPassportClient().connectImx();
        const providerSet = setProvider(passportProvider);

        if (!providerSet) {
          throw new Error('Failed to connect via confirm code');
        }

        identify({ passportId: profile.sub });
        trackDuration(moduleName, 'performedConnectConfirmCode', mt(markStart), {
          succeeded: providerSet,
        });
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: providerSet,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.logout: {
        const deviceFlowEndSessionEndpoint = await getPassportClient().logoutDeviceFlow();
        providerInstance = null;
        zkEvmProviderInstance = null;
        trackDuration(moduleName, 'performedGetLogoutUrl', mt(markStart));
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: true,
          result: deviceFlowEndSessionEndpoint,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.getAccessToken: {
        const accessToken = await getPassportClient().getAccessToken();
        const success = accessToken !== undefined;

        if (!success) {
          throw new Error('No access token');
        }

        trackDuration(moduleName, 'performedGetAccessToken', mt(markStart));
        callbackToGame({
          responseFor: fxName,
          requestId,
          success,
          result: accessToken,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.getIdToken: {
        const idToken = await getPassportClient().getIdToken();
        const success = idToken !== undefined;
        track(moduleName, 'performedGetIdToken', {
          timeMs: Date.now() - markStart,
        });
        callbackToGame({
          responseFor: fxName,
          requestId,
          success,
          result: idToken,
          error: !success ? 'No ID token' : undefined,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.getEmail: {
        const userProfile = await getPassportClient().getUserInfo();
        const success = userProfile?.email !== undefined;
        track(moduleName, 'performedGetEmail', {
          timeMs: Date.now() - markStart,
        });
        callbackToGame({
          responseFor: fxName,
          requestId,
          success,
          result: userProfile?.email,
          error: !success ? 'No email' : undefined,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.getPassportId: {
        const userProfile = await getPassportClient().getUserInfo();
        const success = userProfile?.sub !== undefined;
        track(moduleName, 'performedGetPassportId', {
          timeMs: Date.now() - markStart,
        });
        callbackToGame({
          responseFor: fxName,
          requestId,
          success,
          result: userProfile?.sub,
          error: !success ? 'No Passport ID' : undefined,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.getLinkedAddresses: {
        const linkedAddresses = await getPassportClient().getLinkedAddresses();
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
          },
          ...response,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.zkEvm.connectEvm: {
        const zkEvmProvider = getPassportClient().connectEvm();
        const providerSet = setZkEvmProvider(zkEvmProvider);
        track(moduleName, 'performedZkevmConnectEvm', {
          succeeded: providerSet,
          timeMs: Date.now() - markStart,
        });
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: providerSet,
          error: !providerSet ? 'Failed to connect to EVM' : undefined,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.zkEvm.sendTransaction: {
        const transaction = JSON.parse(data);
        const transactionHash = await getZkEvmProvider().request({
          method: 'eth_sendTransaction',
          params: [transaction],
        });
        const success = transactionHash !== null && transactionHash !== undefined;
        track(moduleName, 'performedZkevmSendTransaction', {
          timeMs: Date.now() - markStart,
        });
        callbackToGame({
          responseFor: fxName,
          requestId,
          success,
          result: transactionHash,
          error: !success ? 'Failed to send transaction' : undefined,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.zkEvm.sendTransactionWithConfirmation: {
        const transaction = JSON.parse(data);
        const zkEvmProvider = getZkEvmProvider();
        const web3Provider = new providers.Web3Provider(zkEvmProvider);
        const signer = web3Provider.getSigner();

        const tx = await signer.sendTransaction(transaction);
        const response = await tx.wait();
        track(moduleName, 'performedZkevmSendTransactionWithConfirmation', {
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
      case PASSPORT_FUNCTIONS.zkEvm.requestAccounts: {
        const result = await getZkEvmProvider().request({
          method: 'eth_requestAccounts',
        });
        const success = result !== null && result !== undefined;
        track(moduleName, 'performedZkevmRequestAccounts', {
          timeMs: Date.now() - markStart,
        });
        callbackToGame({
          responseFor: fxName,
          requestId,
          success,
          accounts: result,
          error: !success ? 'Failed to request accounts' : undefined,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.zkEvm.getBalance: {
        const request = JSON.parse(data);
        const result = await getZkEvmProvider().request({
          method: 'eth_getBalance',
          params: [request.address, request.blockNumberOrTag],
        });
        const success = result !== null && result !== undefined;
        track(moduleName, 'performedZkevmGetBalance', {
          timeMs: Date.now() - markStart,
        });
        callbackToGame({
          responseFor: fxName,
          requestId,
          success,
          result,
          error: !success ? 'Failed to get balance' : undefined,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.zkEvm.getTransactionReceipt: {
        const request = JSON.parse(data);
        const response = await getZkEvmProvider().request({
          method: 'eth_getTransactionReceipt',
          params: [request.txHash],
        });
        const success = response !== null && response !== undefined;
        track(moduleName, 'performedZkevmGetTransactionReceipt', {
          timeMs: Date.now() - markStart,
        });
        callbackToGame({
          ...{
            responseFor: fxName,
            requestId,
            success,
            error: !success ? 'Failed to get transaction receipt' : undefined,
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
    let wrappedError;

    if (!(error instanceof Error)) {
      wrappedError = new Error(error);
    } else {
      wrappedError = error;
    }

    const errorType = error instanceof passport.PassportError
      ? error?.type
      : undefined;

    trackError(moduleName, fxName, wrappedError, {
      fxName,
      requestId,
      errorType,
    });
    trackDuration(moduleName, 'failedCallFunction', mt(markStart), {
      fxName,
      requestId,
      error: wrappedError.message,
    });

    console.log(error);
    callbackToGame({
      responseFor: fxName,
      requestId,
      success: false,
      error: error?.message !== null && error?.message !== undefined ? error.message : 'Error',
      errorType: error instanceof passport.PassportError ? error?.type : null,
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
