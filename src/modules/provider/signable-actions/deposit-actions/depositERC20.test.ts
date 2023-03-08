import { generateSigners, privateKey1, testConfig } from "../../test/helpers";
import {
  DepositsApi,
  EncodingApi,
  UsersApi,
  TokensApi,
} from "@imtbl/core-sdk";
import { depositERC20 } from './';
import { Contracts } from "@imtbl/core-sdk";


jest.mock('@imtbl/core-sdk')

describe('Deposit ERC20', () => {
  describe('depositERC20()', () => {
    let getSignableDepositMock: jest.Mock;
    let encodeAssetMock: jest.Mock;
    let getTokenMock: jest.Mock;
    let getSignableRegistrationMock: jest.Mock;

    const signableDepositRequest = {
      type: 'ERC20',
      tokenAddress: "kljh5kl3j4biu3b59385",
      amount: "1000000000000000000",
    };

    const getSignableDepositResponse = {
      stark_key: "1111",
      vault_id: "2222",
      amount: "1000000000000000000",
    }

    const encodeAssetResponse = {
      asset_type: "asset",
      stark_key: "1111",
      vault_id: "2222",
      amount: "1000000000000000000",
    }
    const getTokenResponse = {
      decimals: 18
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

      getTokenMock = jest.fn().mockResolvedValue({
        data: getTokenResponse
      });
      (TokensApi as jest.Mock).mockReturnValue({
        getToken: getTokenMock,
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

      (Contracts.IERC20.connect as jest.Mock).mockReturnValue({
        populateTransaction: {
          approve: async () => ('test')
        },
      });

      (Contracts.Core.connect as jest.Mock).mockReturnValue({
        populateTransaction: {
          approve: async () => ('test'),
          depositERC20: async () => ('test')
        }
      });

      (Contracts.Registration.connect as jest.Mock).mockReturnValue({
        isRegistered: async () => (true),
      });
    })

    test('should make the correct api requests with the correct params, and return true', async () => {
      const signers = await generateSigners(privateKey1)

      const response = await depositERC20({
        signers,
        deposit: signableDepositRequest,
        config: testConfig,
      });
      expect(getTokenMock).toHaveBeenCalledWith({
        address: "kljh5kl3j4biu3b59385",
      })
      expect(getSignableDepositMock).toHaveBeenCalledWith({
        getSignableDepositRequest: {
          amount: "1000000000000000000",
          token: {
            data: {
              decimals: 18,
              token_address: "kljh5kl3j4biu3b59385",
            },
            type: "ERC20",
          },
          user: "ETHd90915fa5bce418a23184c9asdfasfasdf5c8e900e3035cf34e2dd36",
        },
      })
      expect(encodeAssetMock).toHaveBeenCalledWith({
        assetType: "asset",
        encodeAssetRequest: {
          token: {
            data: {
              token_address: "kljh5kl3j4biu3b59385",
            },
            type: "ERC20",
          },
        },
      })
      expect(response).toEqual(true);
    })
  })
})
