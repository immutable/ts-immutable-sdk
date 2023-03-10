import { getEncodeAssetInfo } from "./getEncodeAssetInfo";
import { getSignableRegistrationOnchain, isRegisteredOnChain } from "../registration";
import { Contracts, MintableTokenDetails, MintsApi } from "@imtbl/core-sdk";
import { generateSigners, privateKey1, testConfig, transactionResponse } from "../../test/helpers";
import { completeERC721WithdrawalAction } from "./completeERC721Withdrawal";
import * as encUtils from "enc-utils";
import { TransactionResponse } from "@ethersproject/providers";


jest.mock('@imtbl/core-sdk')
jest.mock('../utils')
jest.mock('enc-utils')
jest.mock('../registration')
jest.mock('./getEncodeAssetInfo')

describe('completeERC721Withdrawal action', () => {
  describe('when ERC721 is mintable', () => {
    const mintableErc721Token: MintableTokenDetails = {
      token_id:'23',
      client_token_id:'12',
      blueprint:'blueprint'
    };
    const encodeAssetResponse = {
      asset_id: 'asset-id',
      asset_type: 'mintable-asset'
    };
    const mintingBlob = 'mintingBlob';

    beforeEach(() => {
      jest.restoreAllMocks();
      (getEncodeAssetInfo as jest.Mock).mockResolvedValue(encodeAssetResponse);
      (encUtils.sanitizeHex as jest.Mock).mockResolvedValue(mintingBlob);
      (MintsApi as jest.Mock).mockReturnValue({
        getMintableTokenDetailsByClientTokenId: jest.fn().mockResolvedValue({
          data: mintableErc721Token
        })
      });
    });
    it('should complete ERC721 withdrawal with on-chain registered user', async () => {
      (Contracts.Core.connect as jest.Mock).mockReturnValue({
        populateTransaction: {
          withdrawAndMint: jest.fn().mockResolvedValue(transactionResponse)
        }
      });
      (isRegisteredOnChain as jest.Mock).mockResolvedValue(true);

      const response = await act();

      await expect(response).toEqual(transactionResponse);
    });
    it('should complete ERC721 withdrawal with unregistered user', async () => {
      (Contracts.Registration.connect as jest.Mock).mockReturnValue({
        populateTransaction: {
          regsiterAndWithdrawAndMint: jest.fn().mockResolvedValue(transactionResponse)
        }
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
      asset_type: 'mintable-asset'
    };
    const mintingBlob = 'mintingBlob';

    beforeEach(() => {
      jest.restoreAllMocks();
      (getEncodeAssetInfo as jest.Mock).mockResolvedValue(encodeAssetResponse);
      (encUtils.sanitizeHex as jest.Mock).mockResolvedValue(mintingBlob);
      const error = {
        response: {
          status: 404
        }
      };
      (MintsApi as jest.Mock).mockReturnValue({
        getMintableTokenDetailsByClientTokenId: jest.fn().mockRejectedValue(error)
      });
    });
    it('should complete ERC721 withdrawal with on-chain registered user', async () => {
      (Contracts.Core.connect as jest.Mock).mockReturnValue({
        populateTransaction: {
          withdrawNft: jest.fn().mockResolvedValue(transactionResponse)
        }
      });
      (isRegisteredOnChain as jest.Mock).mockResolvedValue(true);
      const response = await act();
      await expect(response).toEqual(transactionResponse);
    });
    it('should complete ERC721 withdrawal with unregistered user', async () => {
      (Contracts.Registration.connect as jest.Mock).mockReturnValue({
        populateTransaction: {
          registerAndWithdrawNft: jest.fn().mockResolvedValue(transactionResponse)
        }
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
          status: 500
        }
      };
      (MintsApi as jest.Mock).mockReturnValue({
        getMintableTokenDetailsByClientTokenId: jest.fn().mockRejectedValue(() => {throw error;})
      });
    });

    it('should throw error', async () => {
      const signers = await generateSigners(privateKey1);
      await expect(completeERC721WithdrawalAction({
        ethSigner: signers.ethSigner,
        config: testConfig,
        starkPublicKey: "789912305",
        token: {
          type: 'ERC721',
          tokenId: '23',
          tokenAddress: '0x23cv1'
        }
      })).rejects.toThrowError()
    });
  });
});

async function act(): Promise<TransactionResponse> {
  const signers = await generateSigners(privateKey1);
  return await completeERC721WithdrawalAction({
    ethSigner: signers.ethSigner,
    config: testConfig,
    starkPublicKey: "789912305",
    token: {
      type: 'ERC721',
      tokenId: '23',
      tokenAddress: '0x23cv1'
    }
  });
}
