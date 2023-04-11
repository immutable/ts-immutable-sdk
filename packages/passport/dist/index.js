import { UserManager } from 'oidc-client-ts';
import { ethers } from 'ethers';
import { Magic } from 'magic-sdk';
import { OpenIdExtension } from '@magic-ext/oidc';
import { Configuration, TransfersApi, OrdersApi, ExchangesApi, TradesApi, generateLegacyStarkPrivateKey, createStarkSigner, UsersApi } from '@imtbl/core-sdk';
import { convertToSignableToken, signRaw } from '@imtbl/toolkit/src';

var PassportErrorType;
(function (PassportErrorType) {
    PassportErrorType["AUTHENTICATION_ERROR"] = "AUTHENTICATION_ERROR";
    PassportErrorType["INVALID_CONFIGURATION"] = "INVALID_CONFIGURATION";
    PassportErrorType["WALLET_CONNECTION_ERROR"] = "WALLET_CONNECTION_ERROR";
    PassportErrorType["NOT_LOGGED_IN_ERROR"] = "NOT_LOGGED_IN_ERROR";
    PassportErrorType["REFRESH_TOKEN_ERROR"] = "REFRESH_TOKEN_ERROR";
    PassportErrorType["USER_REGISTRATION_ERROR"] = "USER_REGISTRATION_ERROR";
    PassportErrorType["LOGOUT_ERROR"] = "LOGOUT_ERROR";
    PassportErrorType["TRANSFER_ERROR"] = "TRANSFER_ERROR";
    PassportErrorType["CREATE_ORDER_ERROR"] = "CREATE_ORDER_ERROR";
    PassportErrorType["CANCEL_ORDER_ERROR"] = "CANCEL_ORDER_ERROR";
    PassportErrorType["EXCHANGE_TRANSFER_ERROR"] = "EXCHANGE_TRANSFER_ERROR";
    PassportErrorType["CREATE_TRADE_ERROR"] = "CREATE_TRADE_ERROR";
    PassportErrorType["OPERATION_NOT_SUPPORTED_ERROR"] = "OPERATION_NOT_SUPPORTED_ERROR";
    PassportErrorType["LOGOUT_ERROR"] = "LOGOUT_ERROR";
})(PassportErrorType || (PassportErrorType = {}));
class PassportError extends Error {
    type;
    constructor(message, type) {
        super(message);
        this.type = type;
    }
}
const withPassportError = async (fn, customErrorType) => {
    try {
        return await fn();
    }
    catch (error) {
        const errorMessage = `${customErrorType}: ${error.message}` || 'UnknownError';
        throw new PassportError(errorMessage, customErrorType);
    }
};

const POLL_INTERVAL = 1 * 1000; // every 1 second
const MAX_RETRIES = 3;
const wait = (ms) => new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
});
const retryWithDelay = async (fn, options) => {
    const { retries = MAX_RETRIES, interval = POLL_INTERVAL, finalErr = Error('Retry failed'), } = options || {};
    try {
        return await fn();
    }
    catch (err) {
        if (retries <= 0) {
            return Promise.reject(finalErr);
        }
        await wait(interval);
        return retryWithDelay(fn, { retries: retries - 1, finalErr });
    }
};

const getAuthConfiguration = ({ oidcConfiguration, }) => ({
    authority: oidcConfiguration.authenticationDomain,
    redirect_uri: oidcConfiguration.redirectUri,
    popup_redirect_uri: oidcConfiguration.redirectUri,
    client_id: oidcConfiguration.clientId,
    metadata: {
        authorization_endpoint: `${oidcConfiguration.authenticationDomain}/authorize`,
        token_endpoint: `${oidcConfiguration.authenticationDomain}/oauth/token`,
        userinfo_endpoint: `${oidcConfiguration.authenticationDomain}/userinfo`,
        end_session_endpoint: `${oidcConfiguration.authenticationDomain}/v2/logout` +
            `?returnTo=${encodeURIComponent(oidcConfiguration.logoutRedirectUri)}` +
            `&client_id=${oidcConfiguration.clientId}`,
    },
    mergeClaims: true,
    loadUserInfo: true,
    scope: 'openid offline_access profile email create:users passport:user_create imx:passport_user.create imx:passport_user.read imx:order.create imx:order.cancel imx:trade.create imx:transfer.create wallet:transfer wallet:trade transact',
    extraQueryParams: {
        audience: 'platform_api',
    },
});
class AuthManager {
    userManager;
    config;
    constructor(config) {
        this.config = config;
        this.userManager = new UserManager(getAuthConfiguration(config));
    }
    async login() {
        return withPassportError(async () => {
            const oidcUser = await this.userManager.signinPopup();
            return this.mapOidcUserToDomainModel(oidcUser);
        }, PassportErrorType.AUTHENTICATION_ERROR);
    }
    async loginCallback() {
        return withPassportError(async () => this.userManager.signinPopupCallback(), PassportErrorType.AUTHENTICATION_ERROR);
    }
    async logout() {
        return withPassportError(async () => this.userManager.signoutRedirect(), PassportErrorType.LOGOUT_ERROR);
    }
    async getUser() {
        return withPassportError(async () => {
            const oidcUser = await this.userManager.getUser();
            if (!oidcUser) {
                throw new Error('Failed to retrieve user');
            }
            return this.mapOidcUserToDomainModel(oidcUser);
        }, PassportErrorType.NOT_LOGGED_IN_ERROR);
    }
    async requestRefreshTokenAfterRegistration() {
        return withPassportError(async () => {
            const updatedUser = await retryWithDelay(async () => {
                const user = await this.userManager.signinSilent();
                const passportMetadata = user?.profile?.passport;
                const metadataExists = !!passportMetadata?.ether_key &&
                    !!passportMetadata?.stark_key &&
                    !!passportMetadata?.user_admin_key;
                if (metadataExists) {
                    return user;
                }
                return Promise.reject('user wallet addresses not exist');
            });
            if (!updatedUser) {
                return null;
            }
            return this.mapOidcUserToDomainModel(updatedUser);
        }, PassportErrorType.REFRESH_TOKEN_ERROR);
    }
    mapOidcUserToDomainModel = (oidcUser) => {
        const passport = oidcUser.profile?.passport;
        return {
            idToken: oidcUser.id_token,
            accessToken: oidcUser.access_token,
            refreshToken: oidcUser.refresh_token,
            profile: {
                sub: oidcUser.profile.sub,
                email: oidcUser.profile.email,
                nickname: oidcUser.profile.nickname,
            },
            etherKey: passport?.ether_key || '',
        };
    };
}

class MagicAdapter {
    magicClient;
    config;
    constructor(config) {
        this.config = config;
        this.magicClient = new Magic(config.magicPublishableApiKey, {
            network: config.network,
            extensions: [new OpenIdExtension()],
        });
    }
    async login(idToken) {
        return withPassportError(async () => {
            await this.magicClient.openid.loginWithOIDC({
                jwt: idToken,
                providerId: this.config.magicProviderId,
            });
            return new ethers.providers.Web3Provider(this.magicClient
                .rpcProvider);
        }, PassportErrorType.WALLET_CONNECTION_ERROR);
    }
}

var ReceiveMessage;
(function (ReceiveMessage) {
    ReceiveMessage["CONFIRMATION_WINDOW_READY"] = "confirmation_window_ready";
    ReceiveMessage["TRANSACTION_CONFIRMED"] = "transaction_confirmed";
    ReceiveMessage["TRANSACTION_ERROR"] = "transaction_error";
})(ReceiveMessage || (ReceiveMessage = {}));
var SendMessage;
(function (SendMessage) {
    SendMessage["TRANSACTION_START"] = "transaction_start";
})(SendMessage || (SendMessage = {}));
var TransactionTypes;
(function (TransactionTypes) {
    TransactionTypes["CancelOrder"] = "delete:v1/orders";
    TransactionTypes["CreateOrder"] = "post:v1/orders";
    TransactionTypes["CreateTrade"] = "post:v1/trades";
    TransactionTypes["CreateTransfer"] = "post:v1/transfers";
    TransactionTypes["CreateBatchTransfer"] = "post:v2/transfers";
})(TransactionTypes || (TransactionTypes = {}));
const PassportEventType = 'imx_passport_confirmation';

const openPopupCenter = ({ url, title, width, height, }) => {
    // Fixes dual-screen position                             Most browsers      Firefox
    const dualScreenLeft = window.screenLeft !== undefined ? window.screenLeft : window.screenX;
    const dualScreenTop = window.screenTop !== undefined ? window.screenTop : window.screenY;
    const windowWidth = window.innerWidth
        ? window.innerWidth
        : document.documentElement.clientWidth
            ? document.documentElement.clientWidth
            : screen.width;
    const windowHeight = window.innerHeight
        ? window.innerHeight
        : document.documentElement.clientHeight
            ? document.documentElement.clientHeight
            : screen.height;
    const systemZoom = windowWidth / window.screen.availWidth;
    const left = (windowWidth - width) / 2 / systemZoom + dualScreenLeft;
    const top = (windowHeight - height) / 2 / systemZoom + dualScreenTop;
    const newWindow = window.open(url, title, `
      scrollbars=yes,
      width=${width / systemZoom}, 
      height=${height / systemZoom}, 
      top=${top}, 
      left=${left}
     `);
    if (!newWindow) {
        throw new Error('Failed to open confirmation screen');
    }
    newWindow.focus();
    return newWindow;
};

const ConfirmationWindowTitle = 'Confirm this transaction';
const ConfirmationWindowHeight = 600;
const ConfirmationWindowWidth = 600;
const ConfirmationWindowClosedPollingDuration = 1000;
class ConfirmationScreen {
    config;
    constructor(config) {
        this.config = config;
    }
    postMessage(destinationWindow, accessToken, message) {
        destinationWindow.postMessage({
            eventType: PassportEventType,
            accessToken,
            ...message,
        }, this.config.passportDomain);
    }
    startTransaction(accessToken, transaction) {
        return new Promise((resolve, reject) => {
            const messageHandler = ({ data, origin }) => {
                if (origin != this.config.passportDomain ||
                    data.eventType != PassportEventType) {
                    return;
                }
                switch (data.messageType) {
                    case ReceiveMessage.CONFIRMATION_WINDOW_READY: {
                        this.postMessage(confirmationWindow, accessToken, {
                            messageType: SendMessage.TRANSACTION_START,
                            messageData: transaction,
                        });
                        break;
                    }
                    case ReceiveMessage.TRANSACTION_CONFIRMED: {
                        resolve({ confirmed: true });
                        break;
                    }
                    case ReceiveMessage.TRANSACTION_ERROR: {
                        reject(new Error('Transaction error'));
                        break;
                    }
                    default:
                        reject(new Error('Unsupported message type'));
                }
            };
            window.addEventListener('message', messageHandler);
            const confirmationWindow = openPopupCenter({
                url: `${this.config.passportDomain}/transaction-confirmation`,
                title: ConfirmationWindowTitle,
                width: ConfirmationWindowWidth,
                height: ConfirmationWindowHeight,
            });
            // https://stackoverflow.com/questions/9388380/capture-the-close-event-of-popup-window-in-javascript/48240128#48240128
            const timer = setInterval(function () {
                if (confirmationWindow.closed) {
                    clearInterval(timer);
                    window.removeEventListener('message', messageHandler);
                    resolve({ confirmed: false });
                }
            }, ConfirmationWindowClosedPollingDuration);
        });
    }
}

const ERC721$1 = 'ERC721';
const transfer = ({ request, transfersApi, starkSigner, user, passportConfig, }) => {
    return withPassportError(async () => {
        const transferAmount = request.type === ERC721$1 ? '1' : request.amount;
        const getSignableTransferRequest = {
            sender: user.etherKey,
            token: convertToSignableToken(request),
            amount: transferAmount,
            receiver: request.receiver,
        };
        const signableResult = await transfersApi.getSignableTransferV1({
            getSignableTransferRequest,
        });
        const confirmationScreen = new ConfirmationScreen(passportConfig);
        const confirmationResult = await confirmationScreen.startTransaction(user.accessToken, {
            transactionType: TransactionTypes.CreateTransfer,
            transactionData: getSignableTransferRequest,
        });
        if (!confirmationResult.confirmed) {
            throw new Error('Transaction rejected by user');
        }
        const signableResultData = signableResult.data;
        const { payload_hash: payloadHash } = signableResultData;
        const starkSignature = await starkSigner.signMessage(payloadHash);
        const senderStarkKey = await starkSigner.getAddress();
        const transferSigningParams = {
            sender_stark_key: signableResultData.sender_stark_key || senderStarkKey,
            sender_vault_id: signableResultData.sender_vault_id,
            receiver_stark_key: signableResultData.receiver_stark_key,
            receiver_vault_id: signableResultData.receiver_vault_id,
            asset_id: signableResultData.asset_id,
            amount: signableResultData.amount,
            nonce: signableResultData.nonce,
            expiration_timestamp: signableResultData.expiration_timestamp,
            stark_signature: starkSignature,
        };
        const createTransferRequest = {
            createTransferRequest: transferSigningParams,
        };
        const headers = {
            Authorization: 'Bearer ' + user.accessToken,
        };
        const { data: responseData } = await transfersApi.createTransferV1(createTransferRequest, { headers });
        return {
            sent_signature: responseData.sent_signature,
            status: responseData.status?.toString(),
            time: responseData.time,
            transfer_id: responseData.transfer_id,
        };
    }, PassportErrorType.TRANSFER_ERROR);
};
async function batchNftTransfer({ user, starkSigner, request, transfersApi, passportConfig, }) {
    return withPassportError(async () => {
        const ethAddress = user.etherKey;
        const signableRequests = request.map((nftTransfer) => {
            return {
                amount: '1',
                token: convertToSignableToken({
                    type: ERC721$1,
                    tokenId: nftTransfer.tokenId,
                    tokenAddress: nftTransfer.tokenAddress,
                }),
                receiver: nftTransfer.receiver,
            };
        });
        const getSignableTransferRequestV2 = {
            sender_ether_key: ethAddress,
            signable_requests: signableRequests,
        };
        const signableResult = await transfersApi.getSignableTransfer({
            getSignableTransferRequestV2,
        });
        const confirmationScreen = new ConfirmationScreen(passportConfig);
        const confirmationResult = await confirmationScreen.startTransaction(user.accessToken, {
            transactionType: TransactionTypes.CreateBatchTransfer,
            transactionData: getSignableTransferRequestV2,
        });
        if (!confirmationResult.confirmed) {
            throw new Error('Transaction rejected by user');
        }
        const requests = await Promise.all(signableResult.data.signable_responses.map(async (resp) => {
            const starkSignature = await starkSigner.signMessage(resp.payload_hash);
            return {
                sender_vault_id: resp.sender_vault_id,
                receiver_stark_key: resp.receiver_stark_key,
                receiver_vault_id: resp.receiver_vault_id,
                asset_id: resp.asset_id,
                amount: resp.amount,
                nonce: resp.nonce,
                expiration_timestamp: resp.expiration_timestamp,
                stark_signature: starkSignature,
            };
        }));
        const transferSigningParams = {
            sender_stark_key: signableResult.data.sender_stark_key,
            requests,
        };
        const headers = {
            Authorization: 'Bearer ' + user.accessToken,
        };
        const response = await transfersApi.createTransfer({
            createTransferRequestV2: transferSigningParams,
        }, { headers });
        return {
            transfer_ids: response?.data.transfer_ids,
        };
    }, PassportErrorType.TRANSFER_ERROR);
}

const ERC721 = 'ERC721';
async function createOrder({ starkSigner, user, request, ordersApi, passportConfig, }) {
    return withPassportError(async () => {
        const ethAddress = user.etherKey;
        const amountSell = request.sell.type === ERC721 ? '1' : request.sell.amount;
        const amountBuy = request.buy.type === ERC721 ? '1' : request.buy.amount;
        const getSignableOrderRequestV3 = {
            user: ethAddress,
            amount_buy: amountBuy,
            token_buy: convertToSignableToken(request.buy),
            amount_sell: amountSell,
            token_sell: convertToSignableToken(request.sell),
            fees: request.fees,
            expiration_timestamp: request.expiration_timestamp,
        };
        const getSignableOrderResponse = await ordersApi.getSignableOrder({
            getSignableOrderRequestV3,
        });
        const confirmationScreen = new ConfirmationScreen(passportConfig);
        const confirmationResult = await confirmationScreen.startTransaction(user.accessToken, {
            transactionType: TransactionTypes.CreateOrder,
            transactionData: getSignableOrderRequestV3,
        });
        if (!confirmationResult.confirmed) {
            throw new Error('Transaction rejected by user');
        }
        const { payload_hash: payloadHash } = getSignableOrderResponse.data;
        const starkSignature = await starkSigner.signMessage(payloadHash);
        const signableResultData = getSignableOrderResponse.data;
        const orderParams = {
            createOrderRequest: {
                include_fees: true,
                fees: request.fees,
                stark_signature: starkSignature,
                amount_buy: signableResultData.amount_buy,
                amount_sell: signableResultData.amount_sell,
                asset_id_buy: signableResultData.asset_id_buy,
                asset_id_sell: signableResultData.asset_id_sell,
                expiration_timestamp: signableResultData.expiration_timestamp,
                nonce: signableResultData.nonce,
                stark_key: signableResultData.stark_key,
                vault_id_buy: signableResultData.vault_id_buy,
                vault_id_sell: signableResultData.vault_id_sell,
            },
        };
        const headers = {
            Authorization: 'Bearer ' + user.accessToken,
        };
        const createOrderResponse = await ordersApi.createOrder(orderParams, {
            headers,
        });
        return {
            ...createOrderResponse.data,
        };
    }, PassportErrorType.CREATE_ORDER_ERROR);
}
async function cancelOrder({ user, starkSigner, request, ordersApi, passportConfig, }) {
    return withPassportError(async () => {
        const getSignableCancelOrderRequest = {
            order_id: request.order_id,
        };
        const getSignableCancelOrderResponse = await ordersApi.getSignableCancelOrder({
            getSignableCancelOrderRequest,
        });
        const confirmationScreen = new ConfirmationScreen(passportConfig);
        const confirmationResult = await confirmationScreen.startTransaction(user.accessToken, {
            transactionType: TransactionTypes.CancelOrder,
            transactionData: getSignableCancelOrderRequest,
        });
        if (!confirmationResult.confirmed) {
            throw new Error('Transaction rejected by user');
        }
        const { payload_hash: payloadHash } = getSignableCancelOrderResponse.data;
        const starkSignature = await starkSigner.signMessage(payloadHash);
        const headers = {
            Authorization: 'Bearer ' + user.accessToken,
        };
        const cancelOrderResponse = await ordersApi.cancelOrder({
            id: request.order_id.toString(),
            cancelOrderRequest: {
                order_id: request.order_id,
                stark_signature: starkSignature,
            },
        }, { headers });
        return {
            order_id: cancelOrderResponse.data.order_id,
            status: cancelOrderResponse.data.status,
        };
    }, PassportErrorType.CANCEL_ORDER_ERROR);
}

async function exchangeTransfer({ user, starkSigner, request, exchangesApi, }) {
    return withPassportError(async () => {
        const ethAddress = user.etherKey;
        const transferAmount = request.amount;
        const signableResult = await exchangesApi.getExchangeSignableTransfer({
            id: request.transactionID,
            getSignableTransferRequest: {
                sender: ethAddress,
                token: convertToSignableToken(request),
                amount: transferAmount,
                receiver: request.receiver,
            },
        });
        const starkAddress = await starkSigner.getAddress();
        const { payload_hash: payloadHash } = signableResult.data;
        const starkSignature = await starkSigner.signMessage(payloadHash);
        const transferSigningParams = {
            sender_stark_key: signableResult.data.sender_stark_key || starkAddress,
            sender_vault_id: signableResult.data.sender_vault_id,
            receiver_stark_key: signableResult.data.receiver_stark_key,
            receiver_vault_id: signableResult.data.receiver_vault_id,
            asset_id: signableResult.data.asset_id,
            amount: signableResult.data.amount,
            nonce: signableResult.data.nonce,
            expiration_timestamp: signableResult.data.expiration_timestamp,
            stark_signature: starkSignature,
        };
        const headers = {
            Authorization: 'Bearer ' + user.accessToken,
        };
        const response = await exchangesApi.createExchangeTransfer({
            id: request.transactionID,
            createTransferRequest: transferSigningParams,
        }, { headers });
        return {
            sent_signature: response?.data.sent_signature,
            status: response?.data.status?.toString(),
            time: response?.data.time,
            transfer_id: response?.data.transfer_id,
        };
    }, PassportErrorType.EXCHANGE_TRANSFER_ERROR);
}

async function createTrade({ request, tradesApi, user, starkSigner, passportConfig, }) {
    return withPassportError(async () => {
        const ethAddress = user.etherKey;
        const getSignableTradeRequest = {
            expiration_timestamp: request.expiration_timestamp,
            fees: request.fees,
            order_id: request.order_id,
            user: ethAddress,
        };
        const getSignableTradeResponse = await tradesApi.getSignableTrade({
            getSignableTradeRequest,
        });
        const confirmationScreen = new ConfirmationScreen(passportConfig);
        const confirmationResult = await confirmationScreen.startTransaction(user.accessToken, {
            transactionType: TransactionTypes.CreateTrade,
            transactionData: getSignableTradeRequest,
        });
        if (!confirmationResult.confirmed) {
            throw new Error('Transaction rejected by user');
        }
        const { payload_hash: payloadHash } = getSignableTradeResponse.data;
        const starkSignature = await starkSigner.signMessage(payloadHash);
        const { data: signableResultData } = getSignableTradeResponse;
        const tradeParams = {
            createTradeRequest: {
                include_fees: true,
                fees: request?.fees,
                stark_signature: starkSignature,
                order_id: request?.order_id,
                fee_info: signableResultData.fee_info,
                amount_buy: signableResultData.amount_buy,
                amount_sell: signableResultData.amount_sell,
                asset_id_buy: signableResultData.asset_id_buy,
                asset_id_sell: signableResultData.asset_id_sell,
                expiration_timestamp: signableResultData.expiration_timestamp,
                nonce: signableResultData.nonce,
                stark_key: signableResultData.stark_key,
                vault_id_buy: signableResultData.vault_id_buy,
                vault_id_sell: signableResultData.vault_id_sell,
            },
        };
        const headers = { Authorization: 'Bearer ' + user.accessToken };
        const { data: createTradeResponse } = await tradesApi.createTrade(tradeParams, {
            headers,
        });
        return createTradeResponse;
    }, PassportErrorType.CREATE_TRADE_ERROR);
}

class PassportImxProvider {
    user;
    starkSigner;
    transfersApi;
    ordersApi;
    passportConfig;
    exchangesApi;
    tradesApi;
    constructor({ user, starkSigner, passportConfig }) {
        this.user = user;
        this.starkSigner = starkSigner;
        this.passportConfig = passportConfig;
        const apiConfig = new Configuration({
            basePath: passportConfig.imxAPIConfiguration.basePath,
        });
        this.transfersApi = new TransfersApi(apiConfig);
        this.ordersApi = new OrdersApi(apiConfig);
        this.exchangesApi = new ExchangesApi(apiConfig);
        this.tradesApi = new TradesApi(apiConfig);
    }
    async transfer(request) {
        return transfer({
            request,
            user: this.user,
            starkSigner: this.starkSigner,
            transfersApi: this.transfersApi,
            passportConfig: this.passportConfig,
        });
    }
    registerOffchain() {
        throw new PassportError('Operation not supported', PassportErrorType.OPERATION_NOT_SUPPORTED_ERROR);
    }
    isRegisteredOnchain() {
        throw new PassportError('Operation not supported', PassportErrorType.OPERATION_NOT_SUPPORTED_ERROR);
    }
    createOrder(request) {
        return createOrder({
            request,
            user: this.user,
            starkSigner: this.starkSigner,
            ordersApi: this.ordersApi,
            passportConfig: this.passportConfig,
        });
    }
    cancelOrder(request) {
        return cancelOrder({
            request,
            user: this.user,
            starkSigner: this.starkSigner,
            ordersApi: this.ordersApi,
            passportConfig: this.passportConfig,
        });
    }
    createTrade(request) {
        return createTrade({
            request,
            user: this.user,
            starkSigner: this.starkSigner,
            tradesApi: this.tradesApi,
            passportConfig: this.passportConfig,
        });
    }
    batchNftTransfer(request) {
        return batchNftTransfer({
            request,
            user: this.user,
            starkSigner: this.starkSigner,
            transfersApi: this.transfersApi,
            passportConfig: this.passportConfig,
        });
    }
    exchangeTransfer(request) {
        return exchangeTransfer({
            request,
            user: this.user,
            starkSigner: this.starkSigner,
            exchangesApi: this.exchangesApi,
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    deposit(deposit) {
        throw new PassportError('Operation not supported', PassportErrorType.OPERATION_NOT_SUPPORTED_ERROR);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    prepareWithdrawal(request) {
        throw new PassportError('Operation not supported', PassportErrorType.OPERATION_NOT_SUPPORTED_ERROR);
    }
    completeWithdrawal(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    starkPublicKey, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    token) {
        throw new PassportError('Operation not supported', PassportErrorType.OPERATION_NOT_SUPPORTED_ERROR);
    }
    getAddress() {
        return Promise.resolve(this.starkSigner.getAddress());
    }
}

var Networks;
(function (Networks) {
    Networks["PRODUCTION"] = "mainnet";
    Networks["SANDBOX"] = "goerli";
    Networks["DEVELOPMENT"] = "goerli";
})(Networks || (Networks = {}));

const Config = {
    PRODUCTION: {
        network: Networks.PRODUCTION,
        authenticationDomain: 'https://auth.immutable.com',
        magicPublishableApiKey: 'pk_live_10F423798A540ED7',
        magicProviderId: 'fSMzaRQ4O7p4fttl7pCyGVtJS_G70P8SNsLXtPPGHo0=',
        baseIMXApiPath: 'https://api.x.immutable.com',
        passportDomain: 'https://passport.immutable.com',
    },
    SANDBOX: {
        network: Networks.SANDBOX,
        authenticationDomain: 'https://auth.immutable.com',
        magicPublishableApiKey: 'pk_live_10F423798A540ED7',
        magicProviderId: 'fSMzaRQ4O7p4fttl7pCyGVtJS_G70P8SNsLXtPPGHo0=',
        baseIMXApiPath: 'https://api.sandbox.x.immutable.com',
        passportDomain: 'https://passport.sandbox.immutable.com',
    },
    DEVELOPMENT: {
        network: Networks.DEVELOPMENT,
        authenticationDomain: 'https://auth.dev.immutable.com',
        magicPublishableApiKey: 'pk_live_4058236363130CA9',
        magicProviderId: 'C9odf7hU4EQ5EufcfgYfcBaT5V6LhocXyiPRhIjw2EY=',
        baseIMXApiPath: 'https://api.dev.x.immutable.com',
    },
};
const validateConfiguration = (configurationName, configuration, requiredKeys) => {
    if (!configuration) {
        throw new PassportError(`${configurationName} cannot be null`, PassportErrorType.INVALID_CONFIGURATION);
    }
    const missingKeys = requiredKeys
        .map((key) => !configuration[key] && key)
        .filter((n) => n)
        .join(', ');
    if (missingKeys !== '') {
        throw new PassportError(`${configurationName} - ${missingKeys} cannot be null`, PassportErrorType.INVALID_CONFIGURATION);
    }
};
const getPassportConfiguration = (environmentConfiguration, oidcConfiguration) => {
    validateConfiguration('EnvironmentConfiguration', environmentConfiguration, [
        'network',
        'authenticationDomain',
        'magicPublishableApiKey',
        'magicProviderId',
        'passportDomain',
    ]);
    validateConfiguration('OidcConfiguration', oidcConfiguration, [
        'clientId',
        'logoutRedirectUri',
        'redirectUri',
    ]);
    return {
        network: environmentConfiguration.network,
        oidcConfiguration: {
            authenticationDomain: environmentConfiguration.authenticationDomain,
            clientId: oidcConfiguration.clientId,
            logoutRedirectUri: oidcConfiguration.logoutRedirectUri,
            redirectUri: oidcConfiguration.redirectUri,
        },
        imxAPIConfiguration: {
            basePath: environmentConfiguration.baseIMXApiPath,
        },
        passportDomain: environmentConfiguration.passportDomain,
        magicPublishableApiKey: environmentConfiguration.magicPublishableApiKey,
        magicProviderId: environmentConfiguration.magicProviderId,
    };
};

const getStarkSigner = async (signer) => {
    return withPassportError(async () => {
        const priKey = await generateLegacyStarkPrivateKey(signer);
        const privateKey = Buffer.from(priKey, 'hex');
        return createStarkSigner(privateKey);
    }, PassportErrorType.WALLET_CONNECTION_ERROR);
};

async function registerPassport({ ethSigner, starkSigner, usersApi }, authorization) {
    return withPassportError(async () => {
        const userAddress = await ethSigner.getAddress();
        const starkPublicKey = await starkSigner.getAddress();
        const signableResult = await usersApi.getSignableRegistrationOffchain({
            getSignableRegistrationRequest: {
                ether_key: userAddress,
                stark_key: starkPublicKey,
            },
        });
        const { signable_message: signableMessage, payload_hash: payloadHash } = signableResult.data;
        const ethSignature = await signRaw(signableMessage, ethSigner);
        const starkSignature = await starkSigner.signMessage(payloadHash);
        const response = await usersApi.registerPassportUser({
            authorization: `Bearer ` + authorization,
            registerPassportUserRequest: {
                eth_signature: ethSignature,
                ether_key: userAddress,
                stark_signature: starkSignature,
                stark_key: starkPublicKey,
            },
        });
        return response.statusText;
    }, PassportErrorType.USER_REGISTRATION_ERROR);
}

class Passport {
    authManager;
    magicAdapter;
    config;
    constructor(environmentConfiguration, oidcConfiguration) {
        const passportConfiguration = getPassportConfiguration(environmentConfiguration, oidcConfiguration);
        this.config = passportConfiguration;
        this.authManager = new AuthManager(this.config);
        this.magicAdapter = new MagicAdapter(this.config);
    }
    async connectImx() {
        const user = await this.authManager.login();
        if (!user.idToken) {
            throw new PassportError('Failed to initialise', PassportErrorType.WALLET_CONNECTION_ERROR);
        }
        const provider = await this.magicAdapter.login(user.idToken);
        const ethSigner = provider.getSigner();
        const starkSigner = await getStarkSigner(ethSigner);
        if (!user.etherKey) {
            const updatedUser = await this.registerUser(ethSigner, starkSigner, user.accessToken);
            return new PassportImxProvider({
                user: updatedUser,
                starkSigner,
                passportConfig: this.config,
            });
        }
        const userWithEtherKey = user;
        return new PassportImxProvider({
            user: userWithEtherKey,
            starkSigner,
            passportConfig: this.config,
        });
    }
    async loginCallback() {
        return this.authManager.loginCallback();
    }
    async logout() {
        return this.authManager.logout();
    }
    async getUserInfo() {
        const user = await this.authManager.getUser();
        return user.profile;
    }
    async getIdToken() {
        const user = await this.authManager.getUser();
        return user.idToken;
    }
    async getAccessToken() {
        const user = await this.authManager.getUser();
        return user.accessToken;
    }
    async registerUser(userAdminKeySigner, starkSigner, jwt) {
        const configuration = new Configuration({
            basePath: this.config.imxAPIConfiguration.basePath,
        });
        const usersApi = new UsersApi(configuration);
        await registerPassport({
            ethSigner: userAdminKeySigner,
            starkSigner,
            usersApi,
        }, jwt);
        const updatedUser = await this.authManager.requestRefreshTokenAfterRegistration();
        if (!updatedUser) {
            throw new PassportError('Failed to get refresh token', PassportErrorType.REFRESH_TOKEN_ERROR);
        }
        return updatedUser;
    }
}

export { Config, Passport, PassportError };
