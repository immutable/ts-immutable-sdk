import BN from 'bn.js';
import * as encUtils from 'enc-utils';

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
async function generateIMXAuthorisationHeaders(ethSigner) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = await signRaw(timestamp, ethSigner);
    return {
        timestamp,
        signature,
    };
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

/**
 * Helper method to convert token type to a SignableToken type
 * @param token - the token type to convert to a SignableToken type
 * @returns the converted SignableToken
 */
function convertToSignableToken(token) {
    switch (token.type) {
        case "ERC721":
            return {
                type: "ERC721",
                data: {
                    token_id: token.tokenId,
                    token_address: token.tokenAddress,
                },
            };
        case "ERC20":
            return {
                type: "ERC20",
                data: {
                    token_address: token.tokenAddress,
                },
            };
        case "ETH":
            return {
                type: "ETH",
                data: {
                    decimals: 18,
                },
            };
    }
}

export { convertToSignableToken, generateIMXAuthorisationHeaders, signMessage, signRaw };
