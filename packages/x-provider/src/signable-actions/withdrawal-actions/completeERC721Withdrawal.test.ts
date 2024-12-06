import { Contracts } from '@imtbl/x-client';
import { imx } from '@imtbl/generated-clients';
import * as encUtils from 'enc-utils';
import { TransactionResponse } from 'ethers';
import { getEncodeAssetInfo } from './getEncodeAssetInfo';
import {
  getSignableRegistrationOnchain,
  isRegisteredOnChain,
} from '../registration';
import {
  generateSigners,
  privateKey1,
  testConfig,
  transactionResponse,
} from '../../test/helpers';
import { completeERC721WithdrawalAction } from './completeERC721Withdrawal';

jest.mock('@imtbl/x-client');
jest.mock('@imtbl/toolkit');
jest.mock('enc-utils');
jest.mock('../registration');
jest.mock('./getEncodeAssetInfo');
jest.mock('@imtbl/generated-clients');

async function act(): Promise<TransactionResponse> {
  const signers = await generateSigners(privateKey1);
  const mintsApi = new imx.MintsApi(testConfig.immutableXConfig.apiConfiguration);
  return await completeERC721WithdrawalAction({
    ethSigner: signers.ethSigner,
    starkSigner: signers.starkSigner,
    config: testConfig,
    starkPublicKey: '789912305',
    token: {
      type: 'ERC721',
      tokenId: '23',
      tokenAddress: '0x23cv1',
    },
  }, mintsApi);
}

describe('completeERC721Withdrawal action', () => {
  describe('when ERC721 is mintable', () => {
    const mintableErc721Token: imx.MintableTokenDetails = {
      token_id: '23',
      client_token_id: '12',
      blueprint: 'blueprint',
    };
    const encodeAssetResponse = {
      asset_id: 'asset-id',
      asset_type: 'mintable-asset',
    };
    const mintingBlob = 'mintingBlob';

    beforeEach(() => {
      jest.restoreAllMocks();
      (getEncodeAssetInfo as jest.Mock).mockResolvedValue(encodeAssetResponse);
      (encUtils.sanitizeHex as jest.Mock).mockResolvedValue(mintingBlob);
      (imx.MintsApi as jest.Mock).mockReturnValue({
        getMintableTokenDetailsByClientTokenId: jest.fn().mockResolvedValue({
          data: mintableErc721Token,
        }),
        getMint: jest.fn(),
        listMints: jest.fn(),
        mintTokens: jest.fn(),
        basePath: jest.fn(),
        axios: jest.fn(),
        configuration: jest.fn(),
      });
    });
    it('should complete ERC721 withdrawal with on-chain registered user', async () => {
      (Contracts.CoreV4.connect as jest.Mock).mockReturnValue({
        getWithdrawalBalance: jest.fn().mockReturnValue(BigInt('1')),
        withdrawAndMint: {
          populateTransaction: jest.fn().mockResolvedValue(transactionResponse),
        },
      });
      (isRegisteredOnChain as jest.Mock).mockResolvedValue(true);

      const response = await act();

      await expect(response).toEqual(transactionResponse);
    });
    it('should complete ERC721 withdrawal with unregistered user', async () => {
      (Contracts.CoreV4.connect as jest.Mock).mockReturnValue({
        getWithdrawalBalance: jest.fn().mockReturnValue(BigInt('1')),
      });
      (Contracts.RegistrationV4.connect as jest.Mock).mockReturnValue({
        registerWithdrawAndMint: {
          populateTransaction: jest
            .fn()
            .mockResolvedValue(transactionResponse),
        },
      });
      (isRegisteredOnChain as jest.Mock).mockResolvedValue(false);
      (getSignableRegistrationOnchain as jest.Mock).mockResolvedValue({});
      const response = await act();
      await expect(response).toEqual(transactionResponse);
    });
  });

  describe('when ERC721 is already minted on L1', () => {
    const encodeAssetResponse = {
      asset_id: 'asset-id',
      asset_type: 'mintable-asset',
    };
    const mintingBlob = 'mintingBlob';

    beforeEach(() => {
      jest.restoreAllMocks();
      (getEncodeAssetInfo as jest.Mock).mockResolvedValue(encodeAssetResponse);
      (encUtils.sanitizeHex as jest.Mock).mockResolvedValue(mintingBlob);
      const error = {
        response: {
          status: 404,
        },
      };
      (imx.MintsApi as jest.Mock).mockReturnValue({
        getMintableTokenDetailsByClientTokenId: jest
          .fn()
          .mockRejectedValue(error),
        getMint: jest.fn(),
        listMints: jest.fn(),
        mintTokens: jest.fn(),
        basePath: jest.fn(),
        axios: jest.fn(),
        configuration: jest.fn(),
      });
    });

    it('should complete ERC721 withdrawal with on-chain registered user', async () => {
      (Contracts.CoreV4.connect as jest.Mock).mockReturnValue({
        getWithdrawalBalance: jest.fn().mockReturnValue(BigInt('1')),
        withdrawNft: {
          populateTransaction: jest.fn().mockResolvedValue(transactionResponse),
        },
      });
      (isRegisteredOnChain as jest.Mock).mockResolvedValue(true);
      const response = await act();
      await expect(response).toEqual(transactionResponse);
    });

    it('should complete ERC721 withdrawal with unregistered user', async () => {
      (Contracts.CoreV4.connect as jest.Mock).mockReturnValue({
        getWithdrawalBalance: jest.fn().mockReturnValue(BigInt('1')),
      });
      (Contracts.RegistrationV4.connect as jest.Mock).mockReturnValue({
        registerAndWithdrawNft: {
          populateTransaction: jest
            .fn()
            .mockResolvedValue(transactionResponse),
        },
      });
      (isRegisteredOnChain as jest.Mock).mockResolvedValue(false);
      (getSignableRegistrationOnchain as jest.Mock).mockResolvedValue({});
      const response = await act();
      await expect(response).toEqual(transactionResponse);
    });
  });

  describe('when mint api encountered server error', () => {
    beforeEach(() => {
      jest.restoreAllMocks();
      const error = {
        response: {
          status: 500,
        },
      };
      (imx.MintsApi as jest.Mock).mockReturnValue({
        getMintableTokenDetailsByClientTokenId: jest
          .fn()
          .mockRejectedValue(() => {
            // TODO: should be an object of type error (eg. new Error())
            // eslint-disable-next-line @typescript-eslint/no-throw-literal
            throw error;
          }),
      });
    });

    it('should throw error', async () => {
      const signers = await generateSigners(privateKey1);
      const mintsApi = new imx.MintsApi(testConfig.immutableXConfig.apiConfiguration);
      await expect(
        completeERC721WithdrawalAction({
          ethSigner: signers.ethSigner,
          starkSigner: signers.starkSigner,
          config: testConfig,
          starkPublicKey: '789912305',
          token: {
            type: 'ERC721',
            tokenId: '23',
            tokenAddress: '0x23cv1',
          },
        }, mintsApi),
      ).rejects.toThrowError();
    });
  });
});
