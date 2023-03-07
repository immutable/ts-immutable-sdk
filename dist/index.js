import { ImmutableX, generateLegacyStarkPrivateKey, createStarkSigner, TransfersApi, OrdersApi, UsersApi, Contracts, WithdrawalsApi, EncodingApi, MintsApi, TradesApi, DepositsApi, TokensApi, ExchangesApi } from '@imtbl/core-sdk';
export { EncodeAssetRequestTokenTypeEnum, EthSigner, FeeTokenTypeEnum, GetMetadataRefreshResponseStatusEnum, MetadataRefreshExcludingSummaryStatusEnum } from '@imtbl/core-sdk';
import { UserManager } from 'oidc-client-ts';
import { ethers } from 'ethers';
import { Magic } from 'magic-sdk';
import { OpenIdExtension } from '@magic-ext/oidc';
import BN from 'bn.js';
import * as encUtils from 'enc-utils';
import { parseUnits } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';

/* eslint-disable @typescript-eslint/no-unused-vars */
const StarkExAPIFactory = (config) => {
    const imtblClient = new ImmutableX(config.getStarkExConfig());
    const { deposit, registerOffchain, isRegisteredOnchain, prepareWithdrawal, completeWithdrawal, createOrder, cancelOrder, createTrade, transfer, batchNftTransfer, ...StarkEx } = imtblClient;
    return { ...StarkEx };
};

const Checkout = {};

const Auth = {};

var PassportErrorType;
(function (PassportErrorType) {
    PassportErrorType["AUTHENTICATION_ERROR"] = "AUTHENTICATION_ERROR";
    PassportErrorType["INVALID_CONFIGURATION"] = "INVALID_CONFIGURATION";
    PassportErrorType["WALLET_CONNECTION_ERROR"] = "WALLET_CONNECTION_ERROR";
    PassportErrorType["NOT_LOGGED_IN_ERROR"] = "NOT_LOGGED_IN_ERROR";
})(PassportErrorType || (PassportErrorType = {}));
class PassportError extends Error {
    type;
    constructor(message, type) {
        super(message);
        this.type = type;
    }
}
const withPassportError = async (fn, customError) => {
    try {
        return await fn();
    }
    catch (error) {
        const errorMessage = customError.message ||
            `${customError.type}: ${error.message}` ||
            'UnknownError';
        throw new PassportError(errorMessage, customError.type);
    }
};

// TODO: This is a static Auth0 domain that could come from env or config file
const passportAuthDomain = 'https://auth.dev.immutable.com';
const getAuthConfiguration = ({ clientId, redirectUri }) => ({
    authority: passportAuthDomain,
    redirect_uri: redirectUri,
    popup_redirect_uri: redirectUri,
    client_id: clientId,
    metadata: {
        authorization_endpoint: `${passportAuthDomain}/authorize`,
        token_endpoint: `${passportAuthDomain}/oauth/token`,
    },
});
class AuthManager {
    userManager;
    constructor({ clientId, redirectUri }) {
        this.userManager = new UserManager(getAuthConfiguration({
            clientId,
            redirectUri,
        }));
    }
    mapOidcUserToDomainModel = (oidcUser) => ({
        idToken: oidcUser.id_token,
        accessToken: oidcUser.access_token,
        refreshToken: oidcUser.refresh_token,
        profile: {
            sub: oidcUser.profile.sub,
            email: oidcUser.profile.email,
            nickname: oidcUser.profile.nickname,
        },
    });
    async login() {
        return withPassportError(async () => {
            const oidcUser = await this.userManager.signinPopup();
            return this.mapOidcUserToDomainModel(oidcUser);
        }, {
            type: PassportErrorType.AUTHENTICATION_ERROR,
        });
    }
    async loginCallback() {
        return withPassportError(async () => this.userManager.signinPopupCallback(), {
            type: PassportErrorType.AUTHENTICATION_ERROR,
        });
    }
    async getUser() {
        return withPassportError(async () => {
            const oidcUser = await this.userManager.getUser();
            if (!oidcUser) {
                throw new Error('Failed to retrieve user');
            }
            return this.mapOidcUserToDomainModel(oidcUser);
        }, {
            type: PassportErrorType.NOT_LOGGED_IN_ERROR,
        });
    }
}

// TODO: The apiKey & providerId are static properties that could come from env or config file
const magicApiKey = 'pk_live_4058236363130CA9';
const magicProviderId = 'C9odf7hU4EQ5EufcfgYfcBaT5V6LhocXyiPRhIjw2EY=';
class MagicAdapter {
    magicClient;
    constructor(network = 'goerli') {
        this.magicClient = new Magic(magicApiKey, {
            network,
            extensions: [
                new OpenIdExtension(),
            ]
        });
    }
    async login(idToken) {
        return withPassportError(async () => {
            await this.magicClient.openid.loginWithOIDC({
                jwt: idToken,
                providerId: magicProviderId,
            });
            return new ethers.providers.Web3Provider(this.magicClient.rpcProvider);
        }, {
            type: PassportErrorType.WALLET_CONNECTION_ERROR,
        });
    }
}

class PassportImxProvider {
    jwt;
    starkSigner;
    constructor(jwt, starkSigner) {
        this.jwt = jwt;
        this.starkSigner = starkSigner;
    }
    transfer(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    request) {
        throw new Error('Method not implemented.');
    }
    registerOffchain() {
        throw new Error('Method not implemented.');
    }
    isRegisteredOnchain() {
        throw new Error('Method not implemented.');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createOrder(request) {
        throw new Error('Method not implemented.');
    }
    cancelOrder(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    request) {
        throw new Error('Method not implemented.');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    createTrade(request) {
        throw new Error('Method not implemented.');
    }
    batchNftTransfer(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    request) {
        throw new Error('Method not implemented.');
    }
    exchangeTransfer(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    request) {
        throw new Error('Method not implemented.');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    deposit(deposit) {
        throw new Error('Method not implemented.');
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    prepareWithdrawal(request) {
        throw new Error('Method not implemented.');
    }
    completeWithdrawal(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    starkPublicKey, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    token) {
        throw new Error('Method not implemented.');
    }
    getAddress() {
        throw new Error('Method not implemented.');
    }
}

const getStarkSigner = async (signer) => {
    return withPassportError(async () => {
        const privateKey = await generateLegacyStarkPrivateKey(signer);
        return createStarkSigner(privateKey);
    }, { type: PassportErrorType.WALLET_CONNECTION_ERROR });
};

const checkRequiredConfiguration = (config) => {
    const requiredConfiguration = ['clientId', 'redirectUri'];
    const errorMessage = requiredConfiguration
        .map((key) => !config[key] && key)
        .filter((n) => n)
        .join(', ');
    if (errorMessage !== '') {
        throw new PassportError(`${errorMessage} cannot be null`, PassportErrorType.INVALID_CONFIGURATION);
    }
};
class Passport {
    authManager;
    magicAdapter;
    constructor(config) {
        checkRequiredConfiguration(config);
        this.authManager = new AuthManager(config);
        this.magicAdapter = new MagicAdapter(config.network);
    }
    async connectImx() {
        const user = await this.authManager.login();
        if (!user.idToken) {
            throw new PassportError('Failed to initialise', PassportErrorType.WALLET_CONNECTION_ERROR);
        }
        const provider = await this.magicAdapter.login(user.idToken);
        const signer = await getStarkSigner(provider.getSigner());
        return new PassportImxProvider(user, signer);
    }
    async loginCallback() {
        return this.authManager.loginCallback();
    }
    async getUserInfo() {
        const user = await this.authManager.getUser();
        return user.profile;
    }
}

/**
 * Helper method to convert token type to a SignableToken type
 * @param token - the token type to convert to a SignableToken type
 * @returns the converted SignableToken
 */
function convertToSignableToken(token) {
    switch (token.type) {
        case 'ERC721':
            return {
                type: 'ERC721',
                data: {
                    token_id: token.tokenId,
                    token_address: token.tokenAddress,
                },
            };
        case 'ERC20':
            return {
                type: 'ERC20',
                data: {
                    token_address: token.tokenAddress,
                },
            };
        case 'ETH':
            return {
                type: 'ETH',
                data: {
                    decimals: 18,
                },
            };
    }
}

// used to sign message with L1 keys. Used for registration
function serializeEthSignature(sig) {
    // This is because golang appends a recovery param
    // https://github.com/ethers-io/ethers.js/issues/823
    return encUtils.addHexPrefix(encUtils.padLeft(sig.r.toString(16), 64) +
        encUtils.padLeft(sig.s.toString(16), 64) +
        encUtils.padLeft(sig.recoveryParam?.toString(16) || '', 2));
}
function importRecoveryParam(v) {
    return v.trim()
        ? new BN(v, 16).cmp(new BN(27)) !== -1
            ? new BN(v, 16).sub(new BN(27)).toNumber()
            : new BN(v, 16).toNumber()
        : undefined;
}
// used chained with serializeEthSignature. serializeEthSignature(deserializeSignature(...))
function deserializeSignature(sig, size = 64) {
    sig = encUtils.removeHexPrefix(sig);
    return {
        r: new BN(sig.substring(0, size), 'hex'),
        s: new BN(sig.substring(size, size * 2), 'hex'),
        recoveryParam: importRecoveryParam(sig.substring(size * 2, size * 2 + 2)),
    };
}
async function signRaw(payload, signer) {
    const signature = deserializeSignature(await signer.signMessage(payload));
    return serializeEthSignature(signature);
}
async function signMessage(message, signer) {
    const ethAddress = await signer.getAddress();
    const ethSignature = await signRaw(message, signer);
    return {
        message,
        ethAddress,
        ethSignature,
    };
}

function isChainValid(chainID, config) {
    return chainID === config.ethConfiguration.chainID;
}
async function validateChain(signer, config) {
    const chainID = await signer.getChainId();
    if (!isChainValid(chainID, config))
        throw new Error('The wallet used for this operation is not connected to the correct network.');
}

async function transfer({ signers: { ethSigner, starkExSigner }, request, config, }) {
    await validateChain(ethSigner, config.getStarkExConfig());
    const ethAddress = await ethSigner.getAddress();
    const transfersApi = new TransfersApi(config.getStarkExConfig().apiConfiguration);
    const transferAmount = request.type === 'ERC721' ? '1' : request.amount;
    const signableResult = await transfersApi.getSignableTransferV1({
        getSignableTransferRequest: {
            sender: ethAddress,
            token: convertToSignableToken(request),
            amount: transferAmount,
            receiver: request.receiver,
        },
    });
    const { signable_message: signableMessage, payload_hash: payloadHash } = signableResult.data;
    const ethSignature = await signRaw(signableMessage, ethSigner);
    const starkSignature = await starkExSigner.signMessage(payloadHash);
    const transferSigningParams = {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        sender_stark_key: signableResult.data.sender_stark_key,
        sender_vault_id: signableResult.data.sender_vault_id,
        receiver_stark_key: signableResult.data.receiver_stark_key,
        receiver_vault_id: signableResult.data.receiver_vault_id,
        asset_id: signableResult.data.asset_id,
        amount: signableResult.data.amount,
        nonce: signableResult.data.nonce,
        expiration_timestamp: signableResult.data.expiration_timestamp,
        stark_signature: starkSignature,
    };
    const response = await transfersApi.createTransferV1({
        createTransferRequest: transferSigningParams,
        xImxEthAddress: ethAddress,
        xImxEthSignature: ethSignature,
    });
    return {
        sent_signature: response?.data.sent_signature,
        status: response?.data.status?.toString(),
        time: response?.data.time,
        transfer_id: response?.data.transfer_id,
    };
}
async function batchTransfer({ signers: { ethSigner, starkExSigner }, request, config, }) {
    await validateChain(ethSigner, config.getStarkExConfig());
    const ethAddress = await ethSigner.getAddress();
    const transfersApi = new TransfersApi(config.getStarkExConfig().apiConfiguration);
    const signableRequests = request.map((nftTransfer) => {
        return {
            amount: '1',
            token: convertToSignableToken({
                type: 'ERC721',
                tokenId: nftTransfer.tokenId,
                tokenAddress: nftTransfer.tokenAddress,
            }),
            receiver: nftTransfer.receiver,
        };
    });
    const signableResult = await transfersApi.getSignableTransfer({
        getSignableTransferRequestV2: {
            sender_ether_key: ethAddress,
            signable_requests: signableRequests,
        },
    });
    const signableMessage = signableResult.data.signable_message;
    if (signableMessage === undefined) {
        throw new Error('Invalid response from Signable registration offchain');
    }
    const ethSignature = await signRaw(signableMessage, ethSigner);
    const requests = [];
    for (const resp of signableResult.data.signable_responses) {
        const starkSignature = await starkExSigner.signMessage(resp.payload_hash);
        const req = {
            sender_vault_id: resp.sender_vault_id,
            receiver_stark_key: resp.receiver_stark_key,
            receiver_vault_id: resp.receiver_vault_id,
            asset_id: resp.asset_id,
            amount: resp.amount,
            nonce: resp.nonce,
            expiration_timestamp: resp.expiration_timestamp,
            stark_signature: starkSignature,
        };
        requests.push(req);
    }
    // TODO: throw error on missing payload hash?
    const transferSigningParams = {
        sender_stark_key: signableResult.data.sender_stark_key,
        requests,
    };
    const response = await transfersApi.createTransfer({
        createTransferRequestV2: transferSigningParams,
        xImxEthAddress: ethAddress,
        xImxEthSignature: ethSignature,
    });
    return {
        transfer_ids: response?.data.transfer_ids,
    };
}

async function createOrder({ signers, request, config, }) {
    await validateChain(signers.ethSigner, config.getStarkExConfig());
    const ethAddress = await signers.ethSigner.getAddress();
    const ordersApi = new OrdersApi(config.getStarkExConfig().apiConfiguration);
    const amountSell = request.sell.type === 'ERC721' ? '1' : request.sell.amount;
    const amountBuy = request.buy.type === 'ERC721' ? '1' : request.buy.amount;
    const getSignableOrderRequest = {
        user: ethAddress,
        amount_buy: amountBuy,
        token_buy: convertToSignableToken(request.buy),
        amount_sell: amountSell,
        token_sell: convertToSignableToken(request.sell),
        fees: request.fees,
        expiration_timestamp: request.expiration_timestamp,
    };
    const getSignableOrderResponse = await ordersApi.getSignableOrder({
        getSignableOrderRequestV3: getSignableOrderRequest,
    });
    const { signable_message: signableMessage, payload_hash: payloadHash } = getSignableOrderResponse.data;
    const ethSignature = await signRaw(signableMessage, signers.ethSigner);
    const starkSignature = await signers.starkExSigner.signMessage(payloadHash);
    const resp = getSignableOrderResponse.data;
    const orderParams = {
        createOrderRequest: {
            amount_buy: resp.amount_buy,
            amount_sell: resp.amount_sell,
            asset_id_buy: resp.asset_id_buy,
            asset_id_sell: resp.asset_id_sell,
            expiration_timestamp: resp.expiration_timestamp,
            include_fees: true,
            fees: request.fees,
            nonce: resp.nonce,
            stark_key: resp.stark_key,
            stark_signature: starkSignature,
            vault_id_buy: resp.vault_id_buy,
            vault_id_sell: resp.vault_id_sell,
        },
        xImxEthAddress: ethAddress,
        xImxEthSignature: ethSignature,
    };
    const createOrderResponse = await ordersApi.createOrder(orderParams);
    return {
        ...createOrderResponse.data,
    };
}
async function cancelOrder({ signers, request, config, }) {
    const ordersApi = new OrdersApi(config.getStarkExConfig().apiConfiguration);
    const getSignableCancelOrderResponse = await ordersApi.getSignableCancelOrder({
        getSignableCancelOrderRequest: {
            order_id: request.order_id,
        },
    });
    const { signable_message: signableMessage, payload_hash: payloadHash } = getSignableCancelOrderResponse.data;
    const ethSignature = await signRaw(signableMessage, signers.ethSigner);
    const starkSignature = await signers.starkExSigner.signMessage(payloadHash);
    const ethAddress = await signers.ethSigner.getAddress();
    const cancelOrderResponse = await ordersApi.cancelOrder({
        id: request.order_id.toString(),
        cancelOrderRequest: {
            order_id: request.order_id,
            stark_signature: starkSignature,
        },
        xImxEthAddress: ethAddress,
        xImxEthSignature: ethSignature,
    });
    return {
        order_id: cancelOrderResponse.data.order_id,
        status: cancelOrderResponse.data.status,
    };
}

async function registerOffchain(signers, config) {
    await validateChain(signers.ethSigner, config.getStarkExConfig());
    const usersApi = new UsersApi(config.getStarkExConfig().apiConfiguration);
    const userAddress = await signers.ethSigner.getAddress();
    const starkPublicKey = await signers.starkExSigner.getAddress();
    const signableResult = await usersApi.getSignableRegistrationOffchain({
        getSignableRegistrationRequest: {
            ether_key: userAddress,
            stark_key: starkPublicKey,
        },
    });
    const { signable_message: signableMessage, payload_hash: payloadHash } = signableResult.data;
    const ethSignature = await signRaw(signableMessage, signers.ethSigner);
    const starkSignature = await signers.starkExSigner.signMessage(payloadHash);
    const registeredUser = await usersApi.registerUser({
        registerUserRequest: {
            eth_signature: ethSignature,
            ether_key: userAddress,
            stark_signature: starkSignature,
            stark_key: starkPublicKey,
        },
    });
    return registeredUser.data;
}
async function isRegisteredOnChain(starkPublicKey, ethSigner, config) {
    await validateChain(ethSigner, config.getStarkExConfig());
    const registrationContract = Contracts.Registration.connect(config.getStarkExConfig().ethConfiguration.registrationContractAddress, ethSigner);
    try {
        return await registrationContract.isRegistered(starkPublicKey);
    }
    catch (ex) {
        if (ex.reason === 'USER_UNREGISTERED') {
            return false;
        }
        throw ex;
    }
}
async function getSignableRegistrationOnchain(etherKey, starkPublicKey, usersApi) {
    const response = await usersApi.getSignableRegistration({
        getSignableRegistrationRequest: {
            ether_key: etherKey,
            stark_key: starkPublicKey,
        },
    });
    return {
        operator_signature: response.data.operator_signature,
        payload_hash: response.data.payload_hash,
    };
}

const assertIsDefined = (value) => {
    if (value !== undefined)
        return value;
    throw new Error('undefined field exception');
};
async function prepareWithdrawalAction(params) {
    const { signers: { ethSigner, starkExSigner }, type, config, } = params;
    const withdrawalsApi = new WithdrawalsApi(config.apiConfiguration);
    const withdrawalAmount = type === 'ERC721' ? '1' : params.amount;
    const signableWithdrawalResult = await withdrawalsApi.getSignableWithdrawal({
        getSignableWithdrawalRequest: {
            user: await ethSigner.getAddress(),
            token: convertToSignableToken(params),
            amount: withdrawalAmount,
        },
    });
    const { signable_message: signableMessage, payload_hash: payloadHash } = signableWithdrawalResult.data;
    const starkSignature = await starkExSigner.signMessage(payloadHash);
    const { ethAddress, ethSignature } = await signMessage(signableMessage, ethSigner);
    const prepareWithdrawalResponse = await withdrawalsApi.createWithdrawal({
        createWithdrawalRequest: {
            stark_key: assertIsDefined(signableWithdrawalResult.data.stark_key),
            amount: withdrawalAmount,
            asset_id: assertIsDefined(signableWithdrawalResult.data.asset_id),
            vault_id: assertIsDefined(signableWithdrawalResult.data.vault_id),
            nonce: assertIsDefined(signableWithdrawalResult.data.nonce),
            stark_signature: starkSignature,
        },
        xImxEthAddress: ethAddress,
        xImxEthSignature: ethSignature,
    });
    return prepareWithdrawalResponse.data;
}

async function getEncodeAssetInfo(assetType, tokenType, config, tokenData) {
    const encodingApi = new EncodingApi(config.apiConfiguration);
    const result = await encodingApi.encodeAsset({
        assetType,
        encodeAssetRequest: {
            token: {
                type: tokenType,
                ...(tokenData && { data: tokenData }),
            },
        },
    });
    return result.data;
}

async function executeRegisterAndWithdrawERC20({ ethSigner, assetType, starkPublicKey, config, }) {
    const etherKey = await ethSigner.getAddress();
    const starkExConfig = config.getStarkExConfig();
    const usersApi = new UsersApi(starkExConfig.apiConfiguration);
    const signableResult = await getSignableRegistrationOnchain(etherKey, starkPublicKey, usersApi);
    const contract = Contracts.Registration.connect(config.getStarkExConfig().ethConfiguration.registrationContractAddress, ethSigner);
    const populatedTransaction = await contract.populateTransaction.registerAndWithdraw(etherKey, starkPublicKey, signableResult.operator_signature, assetType);
    return ethSigner.sendTransaction(populatedTransaction);
}
async function executeWithdrawERC20(ethSigner, assetType, starkPublicKey, config) {
    const contract = Contracts.Core.connect(config.ethConfiguration.coreContractAddress, ethSigner);
    const populatedTransaction = await contract.populateTransaction.withdraw(starkPublicKey, assetType);
    return ethSigner.sendTransaction(populatedTransaction);
}
async function completeERC20WithdrawalAction({ ethSigner, starkPublicKey, token, config, }) {
    await validateChain(ethSigner, config.getStarkExConfig());
    const starkExConfig = config.getStarkExConfig();
    const assetType = await getEncodeAssetInfo('asset', 'ERC20', starkExConfig, {
        token_address: token.tokenAddress,
    });
    const isRegistered = await isRegisteredOnChain(starkPublicKey, ethSigner, config);
    if (!isRegistered) {
        return executeRegisterAndWithdrawERC20({
            ethSigner,
            assetType: assetType.asset_type,
            starkPublicKey,
            config,
        });
    }
    else {
        return executeWithdrawERC20(ethSigner, assetType.asset_type, starkPublicKey, starkExConfig);
    }
}

async function executeWithdrawMintableERC721(ethSigner, assetType, starkPublicKey, mintingBlob, config) {
    const contract = Contracts.Core.connect(config.ethConfiguration.coreContractAddress, ethSigner);
    const populatedTransaction = await contract.populateTransaction.withdrawAndMint(starkPublicKey, assetType, mintingBlob);
    return ethSigner.sendTransaction(populatedTransaction);
}
async function executeRegisterAndWithdrawMintableERC721(ethSigner, assetType, starkPublicKey, mintingBlob, config) {
    const etherKey = await ethSigner.getAddress();
    const usersApi = new UsersApi(config.apiConfiguration);
    const signableResult = await getSignableRegistrationOnchain(etherKey, starkPublicKey, usersApi);
    const contract = Contracts.Registration.connect(config.ethConfiguration.registrationContractAddress, ethSigner);
    const populatedTransaction = await contract.populateTransaction.regsiterAndWithdrawAndMint(etherKey, starkPublicKey, signableResult.operator_signature, assetType, mintingBlob);
    return ethSigner.sendTransaction(populatedTransaction);
}
function getMintingBlob(token) {
    const id = token.data.id;
    const blueprint = token.data.blueprint || '';
    return encUtils.sanitizeHex(encUtils.utf8ToHex(`{${id}}:{${blueprint}}`));
}
async function completeMintableERC721Withdrawal(ethSigner, starkPublicKey, token, config) {
    const starkExConfig = config.getStarkExConfig();
    const assetType = await getEncodeAssetInfo('mintable-asset', 'ERC721', starkExConfig, {
        id: token.data.id,
        token_address: token.data.tokenAddress,
        ...(token.data.blueprint && { blueprint: token.data.blueprint }),
    });
    const mintingBlob = getMintingBlob(token);
    const isRegistered = await isRegisteredOnChain(starkPublicKey, ethSigner, config);
    if (!isRegistered) {
        return executeRegisterAndWithdrawMintableERC721(ethSigner, assetType.asset_type, starkPublicKey, mintingBlob, starkExConfig);
    }
    else {
        return executeWithdrawMintableERC721(ethSigner, assetType.asset_type, starkPublicKey, mintingBlob, starkExConfig);
    }
}
async function executeRegisterAndWithdrawERC721(ethSigner, assetType, starkPublicKey, tokenId, config) {
    const etherKey = await ethSigner.getAddress();
    const usersApi = new UsersApi(config.apiConfiguration);
    const signableResult = await getSignableRegistrationOnchain(etherKey, starkPublicKey, usersApi);
    const contract = Contracts.Registration.connect(config.ethConfiguration.registrationContractAddress, ethSigner);
    const populatedTransaction = await contract.populateTransaction.registerAndWithdrawNft(etherKey, starkPublicKey, signableResult.operator_signature, assetType, tokenId);
    return ethSigner.sendTransaction(populatedTransaction);
}
async function executeWithdrawERC721(ethSigner, assetType, starkPublicKey, tokenId, config) {
    const contract = Contracts.Core.connect(config.ethConfiguration.coreContractAddress, ethSigner);
    const populatedTransaction = await contract.populateTransaction.withdrawNft(starkPublicKey, assetType, tokenId);
    return ethSigner.sendTransaction(populatedTransaction);
}
async function completeERC721Withdrawal(ethSigner, starkPublicKey, token, config) {
    const starkExConfig = config.getStarkExConfig();
    const assetType = await getEncodeAssetInfo('asset', 'ERC721', starkExConfig, {
        token_id: token.tokenId,
        token_address: token.tokenAddress,
    });
    const isRegistered = await isRegisteredOnChain(starkPublicKey, ethSigner, config);
    if (!isRegistered) {
        return executeRegisterAndWithdrawERC721(ethSigner, assetType.asset_type, starkPublicKey, token.tokenId, starkExConfig);
    }
    else {
        return executeWithdrawERC721(ethSigner, assetType.asset_type, starkPublicKey, token.tokenId, starkExConfig);
    }
}
async function completeERC721WithdrawalAction({ ethSigner, starkPublicKey, token, config, }) {
    await validateChain(ethSigner, config.getStarkExConfig());
    const tokenAddress = token.tokenAddress;
    const tokenId = token.tokenId;
    const starkExConfig = config.getStarkExConfig();
    const mintsApi = new MintsApi(starkExConfig.apiConfiguration);
    return await mintsApi
        .getMintableTokenDetailsByClientTokenId({
        tokenAddress,
        tokenId,
    })
        .then((mintableToken) => completeMintableERC721Withdrawal(ethSigner, starkPublicKey, {
        type: 'ERC721',
        data: {
            id: tokenId,
            tokenAddress: tokenAddress,
            blueprint: mintableToken.data.blueprint,
        },
    }, config))
        .catch((error) => {
        if (error.response?.status === 404) {
            // token is already minted on L1
            return completeERC721Withdrawal(ethSigner, starkPublicKey, token, config);
        }
        throw error; // unable to recover from any other kind of error
    });
}

async function executeRegisterAndWithdrawEth(ethSigner, assetType, starkPublicKey, config) {
    const etherKey = await ethSigner.getAddress();
    const usersApi = new UsersApi(config.apiConfiguration);
    const signableResult = await getSignableRegistrationOnchain(etherKey, starkPublicKey, usersApi);
    const contract = Contracts.Registration.connect(config.ethConfiguration.registrationContractAddress, ethSigner);
    const populatedTransaction = await contract.populateTransaction.registerAndWithdraw(etherKey, starkPublicKey, signableResult.operator_signature, assetType);
    return ethSigner.sendTransaction(populatedTransaction);
}
async function executeWithdrawEth(ethSigner, assetType, starkPublicKey, config) {
    const contract = Contracts.Core.connect(config.ethConfiguration.coreContractAddress, ethSigner);
    const populatedTransaction = await contract.populateTransaction.withdraw(starkPublicKey, assetType);
    return ethSigner.sendTransaction(populatedTransaction);
}
async function completeEthWithdrawalAction({ ethSigner, starkPublicKey, config, }) {
    await validateChain(ethSigner, config.getStarkExConfig());
    const starkExConfig = config.getStarkExConfig();
    const assetType = await getEncodeAssetInfo('asset', 'ETH', starkExConfig);
    const isRegistered = await isRegisteredOnChain(starkPublicKey, ethSigner, config);
    if (!isRegistered) {
        return executeRegisterAndWithdrawEth(ethSigner, assetType.asset_type, starkPublicKey, starkExConfig);
    }
    else {
        return executeWithdrawEth(ethSigner, assetType.asset_type, starkPublicKey, starkExConfig);
    }
}

async function prepareWithdrawal({ signers, withdrawal, config, }) {
    const starkExConfig = config.getStarkExConfig();
    await validateChain(signers.ethSigner, starkExConfig);
    return prepareWithdrawalAction({
        signers,
        config: starkExConfig,
        ...withdrawal,
    });
}
async function completeWithdrawal({ signers: { ethSigner }, starkPublicKey, token, config, }) {
    await validateChain(ethSigner, config.getStarkExConfig());
    switch (token.type) {
        case 'ETH':
            return completeEthWithdrawalAction({ ethSigner, starkPublicKey, config });
        case 'ERC20':
            return completeERC20WithdrawalAction({
                ethSigner,
                starkPublicKey,
                token,
                config,
            });
        case 'ERC721':
            return completeERC721WithdrawalAction({
                ethSigner,
                starkPublicKey,
                token,
                config,
            });
    }
}

async function createTrade({ signers: { ethSigner, starkExSigner }, request, config, }) {
    await validateChain(ethSigner, config.getStarkExConfig());
    const ethAddress = await ethSigner.getAddress();
    const tradesApi = new TradesApi(config.getStarkExConfig().apiConfiguration);
    const signableResult = await tradesApi.getSignableTrade({
        getSignableTradeRequest: {
            user: ethAddress,
            order_id: request.order_id,
            fees: request.fees,
        },
    });
    const { signable_message: signableMessage, payload_hash: payloadHash } = signableResult.data;
    const ethSignature = await signRaw(signableMessage, ethSigner);
    const starkSignature = await starkExSigner.signMessage(payloadHash);
    const createTradeResponse = await tradesApi.createTrade({
        createTradeRequest: {
            amount_buy: signableResult.data.amount_buy,
            amount_sell: signableResult.data.amount_sell,
            asset_id_buy: signableResult.data.asset_id_buy,
            asset_id_sell: signableResult.data.asset_id_sell,
            expiration_timestamp: signableResult.data.expiration_timestamp,
            fee_info: signableResult.data.fee_info,
            fees: request.fees,
            include_fees: true,
            nonce: signableResult.data.nonce,
            order_id: request.order_id,
            stark_key: signableResult.data.stark_key,
            vault_id_buy: signableResult.data.vault_id_buy,
            vault_id_sell: signableResult.data.vault_id_sell,
            stark_signature: starkSignature,
        },
        xImxEthAddress: ethAddress,
        xImxEthSignature: ethSignature,
    });
    return createTradeResponse.data;
}

async function depositEth(signer, deposit, config) {
    await validateChain(signer, config.getStarkExConfig());
    const user = await signer.getAddress();
    const data = {
        decimals: 18,
    };
    const amount = parseUnits(deposit.amount, 'wei');
    const starkExConfig = config.getStarkExConfig();
    const depositsApi = new DepositsApi(starkExConfig.apiConfiguration);
    const encodingApi = new EncodingApi(starkExConfig.apiConfiguration);
    const usersApi = new UsersApi(starkExConfig.apiConfiguration);
    const getSignableDepositRequest = {
        user,
        token: {
            type: deposit.type,
            data,
        },
        amount: amount.toString(),
    };
    const signableDepositResult = await depositsApi.getSignableDeposit({
        getSignableDepositRequest,
    });
    const encodingResult = await encodingApi.encodeAsset({
        assetType: 'asset',
        encodeAssetRequest: {
            token: {
                type: deposit.type,
            },
        },
    });
    const assetType = encodingResult.data.asset_type;
    const starkPublicKey = signableDepositResult.data.stark_key;
    const vaultId = signableDepositResult.data.vault_id;
    const isRegistered = await isRegisteredOnChain(starkPublicKey, signer, config);
    if (!isRegistered) {
        return executeRegisterAndDepositEth(signer, amount, assetType, starkPublicKey, vaultId, starkExConfig, usersApi);
    }
    else {
        return executeDepositEth(signer, amount, assetType, starkPublicKey, vaultId, starkExConfig);
    }
}
async function executeRegisterAndDepositEth(signer, amount, assetType, starkPublicKey, vaultId, config, usersApi) {
    const etherKey = await signer.getAddress();
    const coreContract = Contracts.Core.connect(config.ethConfiguration.coreContractAddress, signer);
    const signableResult = await getSignableRegistrationOnchain(etherKey, starkPublicKey, usersApi);
    const populatedTransaction = await coreContract.populateTransaction.registerAndDepositEth(etherKey, starkPublicKey, signableResult.operator_signature, assetType, vaultId);
    return signer.sendTransaction({ ...populatedTransaction, value: amount });
}
async function executeDepositEth(signer, amount, assetType, starkPublicKey, vaultId, config) {
    const coreContract = Contracts.Core.connect(config.ethConfiguration.coreContractAddress, signer);
    const populatedTransaction = await coreContract.populateTransaction['deposit(uint256,uint256,uint256)'](starkPublicKey, assetType, vaultId);
    return signer.sendTransaction({ ...populatedTransaction, value: amount });
}

async function depositERC20(signer, deposit, config) {
    await validateChain(signer, config.getStarkExConfig());
    const user = await signer.getAddress();
    const starkExConfig = config.getStarkExConfig();
    const tokensApi = new TokensApi(starkExConfig.apiConfiguration);
    const depositsApi = new DepositsApi(starkExConfig.apiConfiguration);
    const encodingApi = new EncodingApi(starkExConfig.apiConfiguration);
    const usersApi = new UsersApi(starkExConfig.apiConfiguration);
    // Get decimals for this specific ERC20
    const token = await tokensApi.getToken({ address: deposit.tokenAddress });
    const decimals = parseInt(token.data.decimals);
    const data = {
        decimals,
        token_address: deposit.tokenAddress,
    };
    const amount = parseUnits(deposit.amount, 0); // 0 to always use undecimalized value
    // Approve whether an amount of token from an account can be spent by a third-party account
    const tokenContract = Contracts.IERC20.connect(deposit.tokenAddress, signer);
    const approveTransaction = await tokenContract.populateTransaction.approve(starkExConfig.ethConfiguration.coreContractAddress, amount);
    await signer.sendTransaction(approveTransaction);
    const getSignableDepositRequest = {
        user,
        token: {
            type: deposit.type,
            data,
        },
        amount: amount.toString(),
    };
    const signableDepositResult = await depositsApi.getSignableDeposit({
        getSignableDepositRequest,
    });
    // Perform encoding on asset details to get an assetType (required for stark contract request)
    const encodingResult = await encodingApi.encodeAsset({
        assetType: 'asset',
        encodeAssetRequest: {
            token: {
                type: deposit.type,
                data: {
                    token_address: deposit.tokenAddress,
                },
            },
        },
    });
    const assetType = encodingResult.data.asset_type;
    const starkPublicKey = signableDepositResult.data.stark_key;
    const vaultId = signableDepositResult.data.vault_id;
    const quantizedAmount = BigNumber.from(signableDepositResult.data.amount);
    const isRegistered = await isRegisteredOnChain(starkPublicKey, signer, config);
    if (!isRegistered) {
        return executeRegisterAndDepositERC20(signer, quantizedAmount, assetType, starkPublicKey, vaultId, starkExConfig, usersApi);
    }
    else {
        return executeDepositERC20(signer, quantizedAmount, assetType, starkPublicKey, vaultId, starkExConfig);
    }
}
async function executeDepositERC20(signer, quantizedAmount, assetType, starkPublicKey, vaultId, config) {
    const coreContract = Contracts.Core.connect(config.ethConfiguration.coreContractAddress, signer);
    const populatedTransaction = await coreContract.populateTransaction.depositERC20(starkPublicKey, assetType, vaultId, quantizedAmount);
    return signer.sendTransaction(populatedTransaction);
}
async function executeRegisterAndDepositERC20(signer, quantizedAmount, assetType, starkPublicKey, vaultId, config, usersApi) {
    const etherKey = await signer.getAddress();
    const coreContract = Contracts.Core.connect(config.ethConfiguration.coreContractAddress, signer);
    const signableResult = await getSignableRegistrationOnchain(etherKey, starkPublicKey, usersApi);
    const populatedTransaction = await coreContract.populateTransaction.registerAndDepositERC20(etherKey, starkPublicKey, signableResult.operator_signature, assetType, vaultId, quantizedAmount);
    return signer.sendTransaction(populatedTransaction);
}

async function depositERC721(signer, deposit, config) {
    await validateChain(signer, config.getStarkExConfig());
    const user = await signer.getAddress();
    const starkExConfig = config.getStarkExConfig();
    const depositsApi = new DepositsApi(starkExConfig.apiConfiguration);
    const encodingApi = new EncodingApi(starkExConfig.apiConfiguration);
    const usersApi = new UsersApi(starkExConfig.apiConfiguration);
    const data = {
        token_address: deposit.tokenAddress,
        token_id: deposit.tokenId,
    };
    const amount = '1';
    const getSignableDepositRequest = {
        user,
        token: {
            type: deposit.type,
            data,
        },
        amount: amount.toString(),
    };
    const signableDepositResult = await depositsApi.getSignableDeposit({
        getSignableDepositRequest,
    });
    // Perform encoding on asset details to get an assetType (required for stark contract request)
    const encodingResult = await encodingApi.encodeAsset({
        assetType: 'asset',
        encodeAssetRequest: {
            token: {
                type: deposit.type,
                data: {
                    token_address: deposit.tokenAddress,
                    token_id: deposit.tokenId,
                },
            },
        },
    });
    const assetType = encodingResult.data.asset_type;
    const starkPublicKey = signableDepositResult.data.stark_key;
    const vaultId = signableDepositResult.data.vault_id;
    const isRegistered = await isRegisteredOnChain(starkPublicKey, signer, config);
    // Approve whether an amount of token from an account can be spent by a third-party account
    const tokenContract = Contracts.IERC721.connect(deposit.tokenAddress, signer);
    const operator = starkExConfig.ethConfiguration.coreContractAddress;
    const isApprovedForAll = await tokenContract.isApprovedForAll(user, operator);
    if (!isApprovedForAll) {
        await tokenContract.setApprovalForAll(operator, true);
    }
    if (!isRegistered) {
        const signableResult = await getSignableRegistrationOnchain(user, starkPublicKey, usersApi);
        const coreContract = Contracts.Core.connect(starkExConfig.ethConfiguration.coreContractAddress, signer);
        // Note: proxy registration contract registerAndDepositNft method is not used as it currently fails erc721 transfer ownership check
        await coreContract.registerUser(user, starkPublicKey, signableResult.operator_signature);
    }
    return executeDepositERC721(signer, deposit.tokenId, assetType, starkPublicKey, vaultId, starkExConfig);
}
async function executeDepositERC721(signer, tokenId, assetType, starkPublicKey, vaultId, config) {
    const coreContract = Contracts.Core.connect(config.ethConfiguration.coreContractAddress, signer);
    const populatedTransaction = await coreContract.populateTransaction.depositNft(starkPublicKey, assetType, vaultId, tokenId);
    return signer.sendTransaction(populatedTransaction);
}

async function deposit(signers, deposit, config) {
    switch (deposit.type) {
        case 'ETH':
            return depositEth(signers.ethSigner, deposit, config);
        case 'ERC20':
            return depositERC20(signers.ethSigner, deposit, config);
        case 'ERC721':
            return depositERC721(signers.ethSigner, deposit, config);
    }
}

async function exchangeTransfers({ signers, request, config, }) {
    await validateChain(signers.ethSigner, config.getStarkExConfig());
    const exchangeApi = new ExchangesApi(config.getStarkExConfig().apiConfiguration);
    const ethAddress = await signers.ethSigner.getAddress();
    const transferAmount = request.amount;
    const signableResult = await exchangeApi.getExchangeSignableTransfer({
        id: request.transactionID,
        getSignableTransferRequest: {
            sender: ethAddress,
            token: convertToSignableToken(request),
            amount: transferAmount,
            receiver: request.receiver,
        },
    });
    const { signable_message: signableMessage, payload_hash: payloadHash } = signableResult.data;
    const ethSignature = await signRaw(signableMessage, signers.ethSigner);
    const starkSignature = await signers.starkExSigner.signMessage(payloadHash);
    const transferSigningParams = {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        sender_stark_key: signableResult.data.sender_stark_key,
        sender_vault_id: signableResult.data.sender_vault_id,
        receiver_stark_key: signableResult.data.receiver_stark_key,
        receiver_vault_id: signableResult.data.receiver_vault_id,
        asset_id: signableResult.data.asset_id,
        amount: signableResult.data.amount,
        nonce: signableResult.data.nonce,
        expiration_timestamp: signableResult.data.expiration_timestamp,
        stark_signature: starkSignature,
    };
    const response = await exchangeApi.createExchangeTransfer({
        id: request.transactionID,
        createTransferRequest: transferSigningParams,
        xImxEthAddress: ethAddress,
        xImxEthSignature: ethSignature,
    });
    return {
        sent_signature: response?.data.sent_signature,
        status: response?.data.status?.toString(),
        time: response?.data.time,
        transfer_id: response?.data.transfer_id,
    };
}

class GenericIMXProvider {
    config;
    signers;
    constructor(config, ethSigner, starkExSigner) {
        this.config = config;
        this.signers = { ethSigner, starkExSigner };
    }
    async getAddress() {
        return await this.signers.ethSigner.getAddress();
    }
    registerOffchain() {
        return registerOffchain(this.signers, this.config);
    }
    batchNftTransfer(request) {
        return batchTransfer({
            signers: this.signers,
            request,
            config: this.config,
        });
    }
    cancelOrder(request) {
        return cancelOrder({
            signers: this.signers,
            request,
            config: this.config,
        });
    }
    completeWithdrawal(starkPublicKey, token) {
        return completeWithdrawal({
            config: this.config,
            signers: this.signers,
            token,
            starkPublicKey,
        });
    }
    createOrder(request) {
        return createOrder({
            signers: this.signers,
            request,
            config: this.config,
        });
    }
    createTrade(request) {
        return createTrade({
            signers: this.signers,
            request,
            config: this.config,
        });
    }
    deposit(tokenAmount) {
        return deposit(this.signers, tokenAmount, this.config);
    }
    exchangeTransfer(request) {
        return exchangeTransfers({
            signers: this.signers,
            request,
            config: this.config,
        });
    }
    async isRegisteredOnchain() {
        const starkPublicKey = await this.signers.starkExSigner.getAddress();
        return isRegisteredOnChain(starkPublicKey, this.signers.ethSigner, this.config);
    }
    prepareWithdrawal(request) {
        return prepareWithdrawal({
            signers: this.signers,
            withdrawal: request,
            config: this.config,
        });
    }
    transfer(request) {
        return transfer({
            signers: this.signers,
            request,
            config: this.config,
        });
    }
}

export { Auth, Checkout, GenericIMXProvider, Passport, PassportError, StarkExAPIFactory };
