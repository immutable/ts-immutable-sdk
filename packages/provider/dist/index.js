import { convertToSignableToken, signRaw, signMessage } from '@imtbl/toolkit';
import { TransfersApi, OrdersApi, UsersApi, Contracts, WithdrawalsApi, EncodingApi, MintsApi, TradesApi, DepositsApi, TokensApi, ExchangesApi } from '@imtbl/core-sdk';
import * as encUtils from 'enc-utils';
import { parseUnits } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import { Environment } from '@imtbl/config';

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
    const transferAmount = request.type === "ERC721" ? "1" : request.amount;
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
            amount: "1",
            token: convertToSignableToken({
                type: "ERC721",
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
        throw new Error("Invalid response from Signable registration offchain");
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
    const amountSell = request.sell.type === "ERC721" ? "1" : request.sell.amount;
    const amountBuy = request.buy.type === "ERC721" ? "1" : request.buy.amount;
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
        if (ex.reason === "USER_UNREGISTERED") {
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
    throw new Error("undefined field exception");
};
async function prepareWithdrawalAction(params) {
    const { signers: { ethSigner, starkExSigner }, type, config, } = params;
    await validateChain(ethSigner, params.config);
    const withdrawalsApi = new WithdrawalsApi(config.apiConfiguration);
    const withdrawalAmount = type === "ERC721" ? "1" : params.amount;
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
    const assetType = await getEncodeAssetInfo("asset", "ERC20", starkExConfig, {
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
    const blueprint = token.data.blueprint || "";
    return encUtils.sanitizeHex(encUtils.utf8ToHex(`{${id}}:{${blueprint}}`));
}
async function completeMintableERC721Withdrawal(ethSigner, starkPublicKey, token, config) {
    const starkExConfig = config.getStarkExConfig();
    const assetType = await getEncodeAssetInfo("mintable-asset", "ERC721", starkExConfig, {
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
    const assetType = await getEncodeAssetInfo("asset", "ERC721", starkExConfig, {
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
        type: "ERC721",
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
    const assetType = await getEncodeAssetInfo("asset", "ETH", starkExConfig);
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
    return prepareWithdrawalAction({
        signers,
        config: starkExConfig,
        ...withdrawal,
    });
}
async function completeWithdrawal({ signers: { ethSigner }, starkPublicKey, token, config, }) {
    switch (token.type) {
        case "ETH":
            return completeEthWithdrawalAction({ ethSigner, starkPublicKey, config });
        case "ERC20":
            return completeERC20WithdrawalAction({
                ethSigner,
                starkPublicKey,
                token,
                config,
            });
        case "ERC721":
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

async function depositEth({ signers: { ethSigner }, deposit, config, }) {
    await validateChain(ethSigner, config.getStarkExConfig());
    const user = await ethSigner.getAddress();
    const data = {
        decimals: 18,
    };
    const amount = parseUnits(deposit.amount, "wei");
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
        assetType: "asset",
        encodeAssetRequest: {
            token: {
                type: deposit.type,
            },
        },
    });
    const assetType = encodingResult.data.asset_type;
    const starkPublicKey = signableDepositResult.data.stark_key;
    const vaultId = signableDepositResult.data.vault_id;
    const isRegistered = await isRegisteredOnChain(starkPublicKey, ethSigner, config);
    if (!isRegistered) {
        return executeRegisterAndDepositEth(ethSigner, amount, assetType, starkPublicKey, vaultId, starkExConfig, usersApi);
    }
    else {
        return executeDepositEth(ethSigner, amount, assetType, starkPublicKey, vaultId, starkExConfig);
    }
}
async function executeRegisterAndDepositEth(ethSigner, amount, assetType, starkPublicKey, vaultId, config, usersApi) {
    const etherKey = await ethSigner.getAddress();
    const coreContract = Contracts.Core.connect(config.ethConfiguration.coreContractAddress, ethSigner);
    const signableResult = await getSignableRegistrationOnchain(etherKey, starkPublicKey, usersApi);
    const populatedTransaction = await coreContract.populateTransaction.registerAndDepositEth(etherKey, starkPublicKey, signableResult.operator_signature, assetType, vaultId);
    return ethSigner.sendTransaction({ ...populatedTransaction, value: amount });
}
async function executeDepositEth(ethSigner, amount, assetType, starkPublicKey, vaultId, config) {
    const coreContract = Contracts.Core.connect(config.ethConfiguration.coreContractAddress, ethSigner);
    const populatedTransaction = await coreContract.populateTransaction["deposit(uint256,uint256,uint256)"](starkPublicKey, assetType, vaultId);
    return ethSigner.sendTransaction({ ...populatedTransaction, value: amount });
}

async function depositERC20({ signers: { ethSigner }, deposit, config, }) {
    await validateChain(ethSigner, config.getStarkExConfig());
    const { apiConfiguration, ethConfiguration } = config.getStarkExConfig();
    const user = await ethSigner.getAddress();
    const tokensApi = new TokensApi(apiConfiguration);
    const depositsApi = new DepositsApi(apiConfiguration);
    const encodingApi = new EncodingApi(apiConfiguration);
    const usersApi = new UsersApi(apiConfiguration);
    // Get decimals for this specific ERC20
    const token = await tokensApi.getToken({ address: deposit.tokenAddress });
    const decimals = parseInt(token.data.decimals);
    const data = {
        decimals,
        token_address: deposit.tokenAddress,
    };
    const amount = parseUnits(deposit.amount, 0); // 0 to always use undecimalized value
    // Approve whether an amount of token from an account can be spent by a third-party account
    const tokenContract = Contracts.IERC20.connect(deposit.tokenAddress, ethSigner);
    const approveTransaction = await tokenContract.populateTransaction.approve(ethConfiguration.coreContractAddress, amount);
    await ethSigner.sendTransaction(approveTransaction);
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
        assetType: "asset",
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
    const isRegistered = await isRegisteredOnChain(starkPublicKey, ethSigner, config);
    if (!isRegistered) {
        return executeRegisterAndDepositERC20(ethSigner, quantizedAmount, assetType, starkPublicKey, vaultId, ethConfiguration, usersApi);
    }
    else {
        return executeDepositERC20(ethSigner, quantizedAmount, assetType, starkPublicKey, vaultId, ethConfiguration);
    }
}
async function executeDepositERC20(ethSigner, quantizedAmount, assetType, starkPublicKey, vaultId, config) {
    const coreContract = Contracts.Core.connect(config.coreContractAddress, ethSigner);
    const populatedTransaction = await coreContract.populateTransaction.depositERC20(starkPublicKey, assetType, vaultId, quantizedAmount);
    return ethSigner.sendTransaction(populatedTransaction);
}
async function executeRegisterAndDepositERC20(ethSigner, quantizedAmount, assetType, starkPublicKey, vaultId, config, usersApi) {
    const etherKey = await ethSigner.getAddress();
    const coreContract = Contracts.Core.connect(config.coreContractAddress, ethSigner);
    const signableResult = await getSignableRegistrationOnchain(etherKey, starkPublicKey, usersApi);
    const populatedTransaction = await coreContract.populateTransaction.registerAndDepositERC20(etherKey, starkPublicKey, signableResult.operator_signature, assetType, vaultId, quantizedAmount);
    return ethSigner.sendTransaction(populatedTransaction);
}

async function depositERC721({ signers: { ethSigner }, deposit, config, }) {
    await validateChain(ethSigner, config.getStarkExConfig());
    const user = await ethSigner.getAddress();
    const starkExConfig = config.getStarkExConfig();
    const depositsApi = new DepositsApi(starkExConfig.apiConfiguration);
    const encodingApi = new EncodingApi(starkExConfig.apiConfiguration);
    const usersApi = new UsersApi(starkExConfig.apiConfiguration);
    const data = {
        token_address: deposit.tokenAddress,
        token_id: deposit.tokenId,
    };
    const amount = "1";
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
        assetType: "asset",
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
    const isRegistered = await isRegisteredOnChain(starkPublicKey, ethSigner, config);
    // Approve whether an amount of token from an account can be spent by a third-party account
    const tokenContract = Contracts.IERC721.connect(deposit.tokenAddress, ethSigner);
    const operator = starkExConfig.ethConfiguration.coreContractAddress;
    const isApprovedForAll = await tokenContract.isApprovedForAll(user, operator);
    if (!isApprovedForAll) {
        await tokenContract.setApprovalForAll(operator, true);
    }
    if (!isRegistered) {
        const signableResult = await getSignableRegistrationOnchain(user, starkPublicKey, usersApi);
        const coreContract = Contracts.Core.connect(starkExConfig.ethConfiguration.coreContractAddress, ethSigner);
        // Note: proxy registration contract registerAndDepositNft method is not used as it currently fails erc721 transfer ownership check
        await coreContract.registerUser(user, starkPublicKey, signableResult.operator_signature);
    }
    return executeDepositERC721(ethSigner, deposit.tokenId, assetType, starkPublicKey, vaultId, starkExConfig);
}
async function executeDepositERC721(ethSigner, tokenId, assetType, starkPublicKey, vaultId, config) {
    const coreContract = Contracts.Core.connect(config.ethConfiguration.coreContractAddress, ethSigner);
    const populatedTransaction = await coreContract.populateTransaction.depositNft(starkPublicKey, assetType, vaultId, tokenId);
    return ethSigner.sendTransaction(populatedTransaction);
}

async function deposit({ signers, deposit, config }) {
    switch (deposit.type) {
        case "ETH":
            return depositEth({ signers, deposit, config });
        case "ERC20":
            return depositERC20({ signers, deposit, config });
        case "ERC721":
            return depositERC721({ signers, deposit, config });
    }
}

async function exchangeTransfer({ signers, request, config, }) {
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
        return deposit({
            signers: this.signers,
            deposit: tokenAmount,
            config: this.config
        });
    }
    exchangeTransfer(request) {
        return exchangeTransfer({
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

const WALLET_ACTION = {
    SWITCH_CHAIN: 'wallet_switchEthereumChain',
    CONNECT: 'eth_requestAccounts',
};
function isRequestableProvider(provider) {
    return !!provider?.request;
}
async function connectProvider(provider, chainID) {
    await provider.request({ method: WALLET_ACTION.CONNECT });
    if (chainID) {
        await provider.request({
            method: WALLET_ACTION.SWITCH_CHAIN,
            params: [{ chainId: `0x${chainID.toString(16)}` }],
        });
    }
}

const ERRORS = {
    PROVIDER_NOT_FOUND: 'The Metamask provider was not found',
};
async function connect$1({ chainID, }) {
    const provider = (await detectEthereumProvider());
    if (!isRequestableProvider(provider)) {
        throw new Error(ERRORS.PROVIDER_NOT_FOUND);
    }
    await connectProvider(provider, chainID);
    // NOTE: if we want to listen to Metamask events in the future, we can add a
    // listener here.
    return new ethers.providers.Web3Provider(provider);
}

const COMMUNICATION_TYPE = 'message';
var RequestEventType;
(function (RequestEventType) {
    RequestEventType["GET_CONNECTION_REQUEST"] = "GET_CONNECTION_REQUEST";
    RequestEventType["CONNECT_WALLET_REQUEST"] = "CONNECT_WALLET_REQUEST";
    RequestEventType["SIGN_MESSAGE_REQUEST"] = "SIGN_MESSAGE_REQUEST";
    RequestEventType["DISCONNECT_WALLET_REQUEST"] = "DISCONNECT_WALLET_REQUEST";
})(RequestEventType || (RequestEventType = {}));
var ResponseEventType;
(function (ResponseEventType) {
    ResponseEventType["CONNECT_WALLET_RESPONSE"] = "CONNECT_WALLET_RESPONSE";
    ResponseEventType["SIGN_MESSAGE_RESPONSE"] = "SIGN_MESSAGE_RESPONSE";
    ResponseEventType["GET_CONNECTION_RESPONSE"] = "GET_CONNECTION_RESPONSE";
    ResponseEventType["DISCONNECT_WALLET_RESPONSE"] = "DISCONNECT_WALLET_RESPONSE";
})(ResponseEventType || (ResponseEventType = {}));

function postRequestMessage(iframe, payload) {
    if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(payload, new URL(iframe.src).origin);
    }
}

function messageResponseListener(iframe, event, eventType, callback) {
    if (iframe && event.source !== iframe.contentWindow) {
        return;
    }
    const l2WalletMessage = event.data;
    if (l2WalletMessage.type !== eventType) {
        return;
    }
    callback(l2WalletMessage.details);
}

class ImxSigner {
    publicAddress;
    iframe;
    constructor(publicAddress, iframe) {
        this.publicAddress = publicAddress;
        this.iframe = iframe;
    }
    getAddress() {
        return this.publicAddress;
    }
    signMessage(rawMessage) {
        return new Promise((resolve, reject) => {
            const listener = (event) => {
                messageResponseListener(this.iframe, event, ResponseEventType.SIGN_MESSAGE_RESPONSE, (messageDetails) => {
                    window.removeEventListener(COMMUNICATION_TYPE, listener);
                    if (!messageDetails.success) {
                        reject(new Error(messageDetails.error?.message));
                    }
                    resolve(messageDetails.data.signedMessage);
                });
            };
            window.addEventListener(COMMUNICATION_TYPE, listener);
            postRequestMessage(this.iframe, {
                type: RequestEventType.SIGN_MESSAGE_REQUEST,
                details: { starkPublicKey: this.publicAddress, message: rawMessage },
            });
        });
    }
    getIFrame() {
        return this.iframe;
    }
}

const IMX_WALLET_IFRAME_ID = "imx-wallet-app";
const IMX_WALLET_IFRAME_HOSTS = {
    [Environment.DEVELOPMENT]: "http://localhost:8080",
    [Environment.SANDBOX]: "https://wallets.sandbox.immutable.com",
    [Environment.PRODUCTION]: "https://wallets.immutable.com",
};
const IMX_WALLET_IFRAME_STYLE = "display: none;";
function getIFrame() {
    return document.querySelector(`iframe#${IMX_WALLET_IFRAME_ID}`);
}
async function setupIFrame(env) {
    return new Promise((resolve) => {
        const iframe = document.createElement("iframe");
        iframe.setAttribute("id", IMX_WALLET_IFRAME_ID);
        iframe.setAttribute("src", IMX_WALLET_IFRAME_HOSTS[env]);
        iframe.setAttribute("style", IMX_WALLET_IFRAME_STYLE);
        document.body.appendChild(iframe);
        iframe.onload = () => resolve(iframe);
    });
}
async function getOrSetupIFrame(env) {
    const iframe = getIFrame();
    if (iframe)
        return iframe;
    return await setupIFrame(env);
}

const DEFAULT_CONNECTION_MESSAGE = "Only sign this request if you’ve initiated an action with Immutable X.";
const CONNECTION_FAILED_ERROR = "The L2 IMX Wallet connection has failed";
async function connect(l1Provider, env) {
    const l1Signer = l1Provider.getSigner();
    const address = await l1Signer.getAddress();
    const signature = await l1Signer.signMessage(DEFAULT_CONNECTION_MESSAGE);
    const iframe = await getOrSetupIFrame(env);
    return new Promise((resolve, reject) => {
        const listener = (event) => {
            messageResponseListener(iframe, event, ResponseEventType.CONNECT_WALLET_RESPONSE, (messageDetails) => {
                window.removeEventListener(COMMUNICATION_TYPE, listener);
                if (!messageDetails.success) {
                    reject(new Error(CONNECTION_FAILED_ERROR));
                }
                resolve(new ImxSigner(messageDetails.data.starkPublicKey, iframe));
            });
        };
        window.addEventListener(COMMUNICATION_TYPE, listener);
        postRequestMessage(iframe, {
            type: RequestEventType.CONNECT_WALLET_REQUEST,
            details: { ethAddress: address, signature },
        });
    });
}
async function disconnect(imxSigner) {
    const iframe = imxSigner.getIFrame();
    return new Promise((resolve, reject) => {
        const listener = (event) => {
            messageResponseListener(iframe, event, ResponseEventType.DISCONNECT_WALLET_RESPONSE, (messageDetails) => {
                window.removeEventListener(COMMUNICATION_TYPE, listener);
                if (!messageDetails.success && messageDetails.error) {
                    reject(messageDetails.error);
                }
                iframe.remove();
                resolve();
            });
        };
        window.addEventListener(COMMUNICATION_TYPE, listener);
        postRequestMessage(iframe, {
            type: RequestEventType.DISCONNECT_WALLET_REQUEST,
            details: { starkPublicKey: imxSigner.getAddress() },
        });
    });
}

var ProviderErrorType;
(function (ProviderErrorType) {
    ProviderErrorType["PROVIDER_CONNECTION_ERROR"] = "PROVIDER_CONNECTION_ERROR";
    ProviderErrorType["WALLET_CONNECTION_ERROR"] = "WALLET_CONNECTION_ERROR";
})(ProviderErrorType || (ProviderErrorType = {}));
class ProviderError extends Error {
    type;
    constructor(message, type) {
        super(message);
        this.type = type;
    }
}
const withProviderError = async (fn, customError) => {
    try {
        return await fn();
    }
    catch (error) {
        const errorMessage = customError.message ||
            `${error.message}` ||
            'UnknownError';
        throw new ProviderError(errorMessage, customError.type);
    }
};

class MetaMaskIMXProvider extends GenericIMXProvider {
    static imxSigner;
    constructor(config, ethSigner, starkExSigner) {
        super(config, ethSigner, starkExSigner);
    }
    static async connect(config) {
        const starkExConfig = config.getStarkExConfig();
        return await withProviderError(async () => {
            const metaMaskProvider = await connect$1({
                chainID: starkExConfig.ethConfiguration.chainID,
            });
            this.imxSigner = await connect(metaMaskProvider, starkExConfig.env);
            return new MetaMaskIMXProvider(config, metaMaskProvider.getSigner(), this.imxSigner);
        }, { type: ProviderErrorType.WALLET_CONNECTION_ERROR });
    }
    static async disconnect() {
        if (!this.imxSigner) {
            throw new ProviderError("Attempted to disconnect from the MetaMask IMX provider without an established connection", ProviderErrorType.PROVIDER_CONNECTION_ERROR);
        }
        return withProviderError(async () => {
            await disconnect(this.imxSigner);
        }, { type: ProviderErrorType.PROVIDER_CONNECTION_ERROR });
    }
    static async signMessage(message) {
        if (!this.imxSigner) {
            throw new ProviderError("Attempted to sign a message with the MetaMask IMX provider without an established connection", ProviderErrorType.PROVIDER_CONNECTION_ERROR);
        }
        return withProviderError(async () => {
            return await this.imxSigner.signMessage(message);
        }, { type: ProviderErrorType.PROVIDER_CONNECTION_ERROR });
    }
}

export { GenericIMXProvider, MetaMaskIMXProvider };
