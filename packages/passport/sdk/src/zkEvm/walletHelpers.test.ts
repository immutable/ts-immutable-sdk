import {
  BigNumber, Wallet, Contract, errors,
} from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { getNonce, getSignedMetaTransactions, getSignedTypedData } from './walletHelpers';
import { TypedDataPayload } from './types';

jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  Contract: jest.fn(),
}));

// SCW addr
const walletAddress = '0x7EEC32793414aAb720a90073607733d9e7B0ecD0';
// User EOA private key
const signer = new Wallet('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');

describe('getSignedMetaTransactions', () => {
  // NOTE: Generated with https://github.com/immutable/wallet-contracts/blob/348add7d2fde13d8f7f83aae0882ad2d97546d72/tests/ImmutableDeployment.spec.ts#L69
  it('should correctly generate the signature for a given transaction', async () => {
    const transactions = [
      {
        delegateCall: false,
        revertOnError: true,
        gasLimit: 1000000,
        to: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        value: '500000000000000000',
        data: '0x',
      },
    ];
    const nonce = 0;
    const chainId = 1779;

    const signature = await getSignedMetaTransactions(
      transactions,
      nonce,
      BigNumber.from(chainId),
      walletAddress,
      signer,
    );

    expect(signature).toBe('0x7a9a1628000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000180000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000f42400000000000000000000000003c44cdddb6a900fa2b585dd299e03d12fa4293bc00000000000000000000000000000000000000000000000006f05b59d3b2000000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004600010001904a25850e09260d88f3fc46fab4901e7c979fc583fe9d30a12c51ba5636355a1351b8ce823f765568d8b88cddd9c8ede9f1cc17dfd7ca953e05ecbbbdf8f51e1c020000000000000000000000000000000000000000000000000000');
  });
});

describe('getSignedTypedData', () => {
  const typedDataPayload = JSON.parse('{"domain":{"name":"Ether Mail","version":"1","chainId":13472,"verifyingContract":"0xd64b0d2d72bb1b3f18046b8a7fc6c9ee6bccd287"},"message":{"from":{"name":"Cow","wallet":"0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826"},"to":{"name":"Bob","wallet":"0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB"},"contents":"Hello, Bob!"},"primaryType":"Mail","types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"}],"Person":[{"name":"name","type":"string"},{"name":"wallet","type":"address"}],"Mail":[{"name":"from","type":"Person"},{"name":"to","type":"Person"},{"name":"contents","type":"string"}]}}') as TypedDataPayload;
  const relayerSignature = '02011b1d383526a2815d26550eb314b5d7e05513273300439b63b94e127c13e1bae9f3f24ab42717c7ae2e25fb82e7fd24afc320690413ca6581c798f91cce8296bd21f4f35a4b33b882a5401499f829481d8ed8d3de23741b0103';
  const chainId = 13472;
  const signaturePrefixWithThreshold = '0x0002';
  const eoaSignatureWeight = '0001';
  const ethSignFlag = '02';

  it('should correctly generate the signature for a given typed data payload', async () => {
    const expectedSignature = '0x000202011b1d383526a2815d26550eb314b5d7e05513273300439b63b94e127c13e1bae9f3f24ab42717c7ae2e25fb82e7fd24afc320690413ca6581c798f91cce8296bd21f4f35a4b33b882a5401499f829481d8ed8d3de23741b01030001aec95114a3b8cf3c9693177a2abd8321cf775366a6c6aadf5953e082680fd90c6cb44972a1635b5e9f7f02490a47425be37a1965a6cbaaaa64404cb2cf3880f71c02';

    const signature = await getSignedTypedData(
      typedDataPayload,
      relayerSignature,
      BigNumber.from(chainId),
      walletAddress,
      signer,
    );

    expect(signature).toEqual(expectedSignature);
  });

  describe('when the EOA address is smaller than the Immutable signer address', () => {
    it('should include the EOA signature in the combined signature first', async () => {
      // The following wallet has an address of `0x15...` which is SMALLER than the Immutable signer address (`0x1B...`),
      // and so its signature should be FIRST in the combined signature
      const lowAddressSigner = new Wallet('0xdac4f6ad57b2977b13c57b65ee7c98d07f4e4afccdf04849e7df7da03fa928be');
      const signMessageSpy = jest.spyOn(lowAddressSigner, 'signMessage');

      const result = await getSignedTypedData(
        typedDataPayload,
        relayerSignature,
        BigNumber.from(chainId),
        walletAddress,
        lowAddressSigner,
      );

      const eoaSignature = await signMessageSpy.mock.results[0].value;
      const eoaSignatureWithoutPrefix = eoaSignature.slice(2); // Remove leading `0x`
      expect(result).toEqual([
        signaturePrefixWithThreshold,
        eoaSignatureWeight,
        eoaSignatureWithoutPrefix,
        ethSignFlag,
        relayerSignature,
      ].join(''));
    });
  });

  describe('when the EOA address is greater than the Immutable signer address', () => {
    it('should include the Immutable signer signature in the combined signature first', async () => {
      // The wallet used here has an address of `0x7E...` which is GREATER than the Immutable signer address (`0x1B...`),
      // and so its signature should be LAST in the combined signature
      const signMessageSpy = jest.spyOn(signer, 'signMessage');

      const result = await getSignedTypedData(
        typedDataPayload,
        relayerSignature,
        BigNumber.from(chainId),
        walletAddress,
        signer,
      );

      const eoaSignature = await signMessageSpy.mock.results[0].value;
      const eoaSignatureWithoutPrefix = eoaSignature.slice(2); // Remove leading `0x`
      expect(result).toEqual([
        signaturePrefixWithThreshold,
        relayerSignature,
        eoaSignatureWeight,
        eoaSignatureWithoutPrefix,
        ethSignFlag,
      ].join(''));
    });
  });
});

describe('getNonce', () => {
  const jsonRpcProvider = {} as JsonRpcProvider;
  const nonceMock = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
    (Contract as unknown as jest.Mock).mockImplementation(() => ({
      nonce: nonceMock,
    }));
  });

  describe('when an error is thrown', () => {
    describe('and the error is a call_exception', () => {
      it('should return 0', async () => {
        const error = new Error('call revert exception');
        Object.defineProperty(error, 'code', { value: errors.CALL_EXCEPTION });

        nonceMock.mockRejectedValue(error);

        const result = await getNonce(jsonRpcProvider, walletAddress);

        expect(result).toEqual(BigNumber.from(0));
      });
    });

    describe('and the error is NOT a call_exception', () => {
      it('should throw the error', async () => {
        const error = new Error('call revert exception');
        Object.defineProperty(error, 'code', { value: errors.NETWORK_ERROR });
        nonceMock.mockRejectedValue(error);

        await expect(() => getNonce(jsonRpcProvider, walletAddress)).rejects.toThrow(error);
      });
    });
  });

  describe('when a BigNumber is returned', () => {
    it('should return a number', async () => {
      nonceMock.mockResolvedValue(BigNumber.from(20));

      const result = await getNonce(jsonRpcProvider, walletAddress);

      expect(result).toEqual(BigNumber.from(20));
    });
  });
});
