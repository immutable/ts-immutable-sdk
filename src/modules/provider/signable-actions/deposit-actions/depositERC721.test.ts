import { generateSigners, privateKey1, testConfig, transactionResponse } from "../../test/helpers";
import {
  DepositsApi,
  EncodingApi,
  UsersApi,
  ERC721Token
} from "@imtbl/core-sdk";
import { depositERC721 } from './';
import { Contracts } from "@imtbl/core-sdk";


jest.mock('@imtbl/core-sdk')

describe('Deposit ERC721', () => {
  describe('depositERC721()', () => {
    let getSignableDepositMock: jest.Mock;
    let encodeAssetMock: jest.Mock;
    let getSignableRegistrationMock: jest.Mock;

    const signableDepositRequest = {
      tokenAddress: "kljh5kl3j4biu3b59385",
      amount: "1",
      type: 'ERC721',
      tokenId: "abcd"
    } as ERC721Token;

    const getSignableDepositResponse = {
      stark_key: "1111",
      vault_id: "2222",
      amount: "1",
    }

    const encodeAssetResponse = {
      asset_type: "asset",
      stark_key: "1111",
      vault_id: "2222",
      amount: "1",
    }

    const getSignableRegistrationResponse = {}

    beforeEach(() => {
      jest.restoreAllMocks()

      getSignableDepositMock = jest.fn().mockResolvedValue({
        data: getSignableDepositResponse
      });
      (DepositsApi as jest.Mock).mockReturnValue({
        getSignableDeposit: getSignableDepositMock,
      });

      encodeAssetMock = jest.fn().mockResolvedValue({
        data: encodeAssetResponse
      });
      (EncodingApi as jest.Mock).mockReturnValue({
        encodeAsset: encodeAssetMock,
      });

      getSignableRegistrationMock = jest.fn().mockResolvedValue({
        data: getSignableRegistrationResponse
      });
      (UsersApi as jest.Mock).mockReturnValue({
        getSignableRegistration: getSignableRegistrationMock,
      });

      getSignableRegistrationMock = jest.fn().mockResolvedValue({
        data: getSignableRegistrationResponse
      });
      (UsersApi as jest.Mock).mockReturnValue({
        getSignableRegistration: getSignableRegistrationMock,
      });

      (Contracts.IERC721.connect as jest.Mock).mockReturnValue({
        isApprovedForAll: async () => (true)
      });

      (Contracts.Core.connect as jest.Mock).mockReturnValue({
        populateTransaction: {
          approve: async () => ('test'),
          depositNft: async () => ('test')
        }
      });

      (Contracts.Registration.connect as jest.Mock).mockReturnValue({
        isRegistered: async () => (true),
      });
    })

    test('should make the correct api requests with the correct params, and return true', async () => {
      const signers = await generateSigners(privateKey1)

      const response = await depositERC721({
        signers,
        deposit: signableDepositRequest,
        config: testConfig,
      });
      expect(getSignableDepositMock).toHaveBeenCalledWith({
        getSignableDepositRequest: {
          amount: "1",
          token: {
            data: {
              token_id: "abcd",
              token_address: "kljh5kl3j4biu3b59385",
            },
            type: "ERC721",
          },
          user: "ETHd90915fa5bce418a23184c9asdfasfasdf5c8e900e3035cf34e2dd36",
        },
      })
      expect(encodeAssetMock).toHaveBeenCalledWith({
        assetType: "asset",
        encodeAssetRequest: {
          token: {
            data: {
              token_id: "abcd",
              token_address: "kljh5kl3j4biu3b59385",
            },
            type: "ERC721",
          },
        },
      })
      expect(response).toEqual(transactionResponse);
    })
  })
})
