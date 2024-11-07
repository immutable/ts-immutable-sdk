/* eslint-disable no-console */
import * as passport from '@imtbl/passport';
import * as config from '@imtbl/config';
import * as provider from '@imtbl/x-provider';
import * as xClient from '@imtbl/x-client';
import {
  track,
  trackError,
  trackDuration,
  identify,
} from '@imtbl/metrics';
import { BrowserProvider } from 'ethers';

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
    signTypedDataV4: 'zkEvmSignTypedDataV4',
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
let versionInfo: VersionInfo | null;

declare global {
  interface Window {
    callFunction: (jsonData: string) => void;
    ue: any;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    Unity: any;
    uwb: any;
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
declare function blu_event(event: string, data: string): void;
// eslint-disable-next-line @typescript-eslint/naming-convention
declare function UnityPostMessage(message: string): void;

// Type for common callback data
type CommonCallbackData = {
  responseFor: string;
  requestId: string;
  success: boolean;
  error: string | null;
  errorType?: string | null;
  result?: any;
};

// Type for callback data specific to initDeviceFlow
type InitDeviceFlowCallbackData = CommonCallbackData & {
  code: string;
  deviceCode: string;
  url: string;
  interval: number;
};

type RequestAccountsCallbackData = CommonCallbackData & {
  accounts: string[];
};

type CallbackData = CommonCallbackData | InitDeviceFlowCallbackData | RequestAccountsCallbackData;

type VersionInfo = {
  gameBridgeTag: string;
  gameBridgeSha: string;
  engine: string;
  engineVersion: string;
  engineSdkVersion: string;
  platform: string;
  platformVersion: string;
  deviceModel: string;
};

const callbackToGame = (data: CallbackData) => {
  const message = JSON.stringify(data);
  console.log(`callbackToGame: ${message}`);
  if (typeof window.ue !== 'undefined') {
    if (typeof window.ue.jsconnector === 'undefined') {
      const unrealError = 'Unreal JSConnector not defined';
      console.error(unrealError);
      throw new Error(unrealError);
    } else {
      window.ue.jsconnector.sendtogame(message);
    }
  } else if (typeof blu_event !== 'undefined') {
    blu_event('sendtogame', message);
  } else if (typeof UnityPostMessage !== 'undefined') {
    UnityPostMessage(message);
  } else if (typeof window.Unity !== 'undefined') {
    window.Unity.call(message);
  } else if (typeof window.uwb !== 'undefined') {
    window.uwb.ExecuteJsMethod('callback', message);
  } else {
    const gameBridgeError = 'No available game callbacks to call from ImmutableSDK game-bridge';
    console.error(gameBridgeError);
    throw new Error(gameBridgeError);
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

    switch (fxName) {
      case PASSPORT_FUNCTIONS.init: {
        const request = JSON.parse(data);
        const redirect: string | null = request?.redirectUri;
        const logoutMode: 'silent' | 'redirect' = request?.isSilentLogout === true ? 'silent' : 'redirect';
        if (!passportClient) {
          console.log(`Connecting to ${request.environment} environment`);

          let passportConfig: passport.PassportModuleConfiguration;

          const environment = request.environment === 'production'
            ? config.Environment.PRODUCTION
            : config.Environment.SANDBOX;
          const baseConfig = new config.ImmutableConfiguration({ environment });

          if (request.environment === 'dev' || request.environment === 'development') {
            passportConfig = {
              baseConfig,
              clientId: request.clientId,
              redirectUri: redirect ?? redirectUri,
              logoutRedirectUri: request?.logoutRedirectUri,
              audience,
              scope,
              crossSdkBridgeEnabled: true,
              logoutMode,
              overrides: {
                authenticationDomain: 'https://auth.dev.immutable.com',
                magicPublishableApiKey: 'pk_live_4058236363130CA9', // Public key
                magicProviderId: 'C9odf7hU4EQ5EufcfgYfcBaT5V6LhocXyiPRhIjw2EY=', // Public key
                passportDomain: 'https://passport.dev.immutable.com',
                imxPublicApiDomain: 'https://api.dev.immutable.com',
                immutableXClient: new xClient.IMXClient({
                  baseConfig,
                  overrides: {
                    immutableXConfig: xClient.createConfig({
                      basePath: 'https://api.dev.x.immutable.com',
                      chainID: 5,
                      coreContractAddress: '0xd05323731807A35599BF9798a1DE15e89d6D6eF1',
                      registrationContractAddress: '0x7EB840223a3b1E0e8D54bF8A6cd83df5AFfC88B2',
                    }),
                  },
                }),
                zkEvmRpcUrl: 'https://rpc.dev.immutable.com',
                relayerUrl: 'https://api.dev.immutable.com/relayer-mr',
                indexerMrBasePath: 'https://api.dev.immutable.com',
                orderBookMrBasePath: 'https://api.dev.immutable.com',
                passportMrBasePath: 'https://api.dev.immutable.com',
              },
            };
          } else {
            passportConfig = {
              baseConfig,
              clientId: request.clientId,
              audience,
              scope,
              redirectUri: redirect ?? redirectUri,
              logoutRedirectUri: request?.logoutRedirectUri,
              crossSdkBridgeEnabled: true,
              jsonRpcReferrer: 'http://imtblgamesdk.local',
              logoutMode,
            };
          }

          passportClient = new passport.Passport(passportConfig);
          trackDuration(moduleName, 'initialisedPassport', mt(markStart));
        }
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: true,
          error: null,
        });

        // version check
        const { engineVersion } = request;
        versionInfo = {
          gameBridgeTag: sdkVersionTag,
          gameBridgeSha: sdkVersionSha,
          engine: engineVersion.engine,
          engineVersion: engineVersion.engineVersion,
          engineSdkVersion: engineVersion.engineSdkVersion ?? '',
          platform: engineVersion.platform,
          platformVersion: engineVersion.platformVersion,
          deviceModel: engineVersion.deviceModel ?? 'N/A',
        };
        console.log(`Version check: ${JSON.stringify(versionInfo)}`);

        trackDuration(moduleName, 'completedInitGameBridge', mt(markStart), {
          ...versionInfo,
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
          error: null,
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
          error: null,
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
          error: null,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.getPKCEAuthUrl: {
        const url = await getPassportClient().loginWithPKCEFlow();
        trackDuration(moduleName, 'performedGetPkceAuthUrl', mt(markStart));
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: true,
          error: null,
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
          error: null,
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
          error: null,
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
          error: null,
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
          error: null,
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
          error: null,
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
          error: null,
          result: accessToken,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.getIdToken: {
        const idToken = await getPassportClient().getIdToken();
        const success = idToken !== undefined;

        if (!success) {
          throw new Error('No ID token');
        }

        trackDuration(moduleName, 'performedGetIdToken', mt(markStart));
        callbackToGame({
          responseFor: fxName,
          requestId,
          success,
          error: null,
          result: idToken,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.getEmail: {
        const userProfile = await getPassportClient().getUserInfo();
        const success = userProfile?.email !== undefined;

        if (!success) {
          throw new Error('No email');
        }

        trackDuration(moduleName, 'performedGetEmail', mt(markStart));
        callbackToGame({
          responseFor: fxName,
          requestId,
          success,
          error: null,
          result: userProfile?.email,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.getPassportId: {
        const userProfile = await getPassportClient().getUserInfo();
        const success = userProfile?.sub !== undefined;

        if (!success) {
          throw new Error('No Passport ID');
        }

        trackDuration(moduleName, 'performedGetPassportId', mt(markStart));
        callbackToGame({
          responseFor: fxName,
          requestId,
          success,
          error: null,
          result: userProfile?.sub,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.getLinkedAddresses: {
        const linkedAddresses = await getPassportClient().getLinkedAddresses();
        trackDuration(moduleName, 'performedGetLinkedAddresses', mt(markStart));
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: true,
          error: null,
          result: linkedAddresses,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.imx.getAddress: {
        const address = await getProvider().getAddress();
        trackDuration(moduleName, 'performedImxGetAddress', mt(markStart));
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: true,
          error: null,
          result: address,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.imx.isRegisteredOffchain: {
        const registered = await getProvider().isRegisteredOffchain();
        trackDuration(moduleName, 'performedImxIsRegisteredOffchain', mt(markStart));
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: true,
          error: null,
          result: registered,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.imx.registerOffchain: {
        const response = await getProvider().registerOffchain();
        trackDuration(moduleName, 'performedImxRegisterOffchain', mt(markStart));
        callbackToGame({
          ...{
            responseFor: fxName,
            requestId,
            success: true,
            error: null,
          },
          ...response,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.imx.transfer: {
        const unsignedTransferRequest = JSON.parse(data);
        const response = await getProvider().transfer(unsignedTransferRequest);
        trackDuration(moduleName, 'performedImxTransfer', mt(markStart), {
          requestId,
          transferRequest: JSON.stringify(unsignedTransferRequest),
          transferResponse: JSON.stringify(response),
        });
        callbackToGame({
          ...{
            responseFor: fxName,
            requestId,
            success: true,
            error: null,
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
        trackDuration(moduleName, 'performedImxBatchNftTransfer', mt(markStart), {
          requestId,
          transferRequest: JSON.stringify(nftTransferDetails),
          transferResponse: JSON.stringify(response),
        });
        callbackToGame({
          ...{
            responseFor: fxName,
            requestId,
            success: true,
            error: null,
          },
          ...response,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.zkEvm.connectEvm: {
        const zkEvmProvider = getPassportClient().connectEvm();
        const providerSet = setZkEvmProvider(zkEvmProvider);

        if (!providerSet) {
          throw new Error('Failed to connect to EVM');
        }

        trackDuration(moduleName, 'performedZkevmConnectEvm', mt(markStart), {
          succeeded: providerSet,
        });
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: providerSet,
          error: null,
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

        if (!success) {
          throw new Error('Failed to send transaction');
        }

        trackDuration(moduleName, 'performedZkevmSendTransaction', mt(markStart), {
          requestId,
          transactionRequest: JSON.stringify(transaction),
          transactionResponse: transactionHash,
        });
        callbackToGame({
          responseFor: fxName,
          requestId,
          success,
          error: null,
          result: transactionHash,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.zkEvm.sendTransactionWithConfirmation: {
        const transaction = JSON.parse(data);
        const zkEvmProvider = getZkEvmProvider();
        const web3Provider = new BrowserProvider(zkEvmProvider);
        const signer = await web3Provider.getSigner();

        const tx = await signer.sendTransaction(transaction);
        const response = await tx.wait();
        trackDuration(moduleName, 'performedZkevmSendTransactionWithConfirmation', mt(markStart), {
          requestId,
          transactionRequest: JSON.stringify(transaction),
          transactionResponse: JSON.stringify(response),
        });
        callbackToGame({
          ...{
            responseFor: fxName,
            requestId,
            success: true,
            error: null,
          },
          ...response,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.zkEvm.signTypedDataV4: {
        const payload = JSON.parse(data);
        const [address] = await getZkEvmProvider().request({
          method: 'eth_requestAccounts',
        });
        const signature = await getZkEvmProvider().request({
          method: 'eth_signTypedData_v4',
          params: [address, payload],
        });

        const success = signature !== null && signature !== undefined;

        if (!success) {
          throw new Error('Failed to sign payload');
        }

        trackDuration(moduleName, 'performedZkevmSignTypedDataV4', mt(markStart), {
          requestId,
        });
        callbackToGame({
          responseFor: fxName,
          requestId,
          success,
          error: null,
          result: signature,
        });
        break;
      }
      case PASSPORT_FUNCTIONS.zkEvm.requestAccounts: {
        const result = await getZkEvmProvider().request({
          method: 'eth_requestAccounts',
        });
        const success = result !== null && result !== undefined;

        if (!success) {
          throw new Error('Failed to request accounts');
        }

        trackDuration(moduleName, 'performedZkevmRequestAccounts', mt(markStart));
        callbackToGame({
          responseFor: fxName,
          requestId,
          success,
          error: null,
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
        const success = result !== null && result !== undefined;

        if (!success) {
          throw new Error('Failed to get balance');
        }

        trackDuration(moduleName, 'performedZkevmGetBalance', mt(markStart));
        callbackToGame({
          responseFor: fxName,
          requestId,
          success,
          error: null,
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
        const success = response !== undefined;

        if (!success) {
          throw new Error('Failed to get transaction receipt');
        }

        trackDuration(moduleName, 'performedZkevmGetTransactionReceipt', mt(markStart));
        callbackToGame({
          ...{
            responseFor: fxName,
            requestId,
            success,
            error: null,
          },
          ...response,
        });
        break;
      }
      case trackFunction: {
        const request = JSON.parse(data);
        const properties = request.properties ? JSON.parse(request.properties) : {};
        track(request.moduleName, request.eventName, properties);
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: true,
          error: null,
        });
        break;
      }
      default: {
        const request = JSON.parse(data);
        const properties = request.properties ? JSON.parse(request.properties) : {};
        properties.fxName = fxName;
        track(moduleName, 'callFunctionDefaultCaseCalled', properties);
        callbackToGame({
          responseFor: fxName,
          requestId,
          success: false,
          error: `Invalid game bridge function: ${fxName}`,
        });
        break;
      }
    }
  } catch (error: any) {
    console.log(`Error in callFunction: ${error}`);

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
      ...versionInfo,
    });
    trackDuration(moduleName, 'failedCallFunction', mt(markStart), {
      fxName,
      requestId,
      error: wrappedError.message,
    });

    console.log('callFunction error', wrappedError);
    console.log('callFunction errorType', errorType);
    callbackToGame({
      responseFor: fxName,
      requestId,
      success: false,
      error: error?.message !== null && error?.message !== undefined ? error.message : 'Error',
      errorType: error instanceof passport.PassportError ? error?.type : null,
    });
  }
};

window.addEventListener('offline', () => {
  console.log('gameBridge offline');
});

window.addEventListener('online', () => {
  console.log('gameBridge online');
});

function onLoadHandler() {
  // File loaded
  // This is to prevent callFunction not defined error in Unity
  callbackToGame({
    responseFor: initRequest,
    requestId: initRequestId,
    success: true,
    error: null,
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
