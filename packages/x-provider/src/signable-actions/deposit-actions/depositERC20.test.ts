import { imx } from '@imtbl/generated-clients';
import {
  Contracts,
  ERC20Amount,
} from '@imtbl/x-client';
import {
  generateSigners,
  privateKey1,
  testConfig,
  transactionResponse,
} from '../../test/helpers';
import { depositERC20 } from '.';

jest.mock('@imtbl/x-client');
jest.mock('@imtbl/generated-clients');

describe('Deposit ERC20', () => {
  describe('depositERC20()', () => {
    let getSignableDepositMock: jest.Mock;
    let encodeAssetMock: jest.Mock;
    let getTokenMock: jest.Mock;

    const signableDepositRequest = {
      tokenAddress: 'kljh5kl3j4biu3b59385',
      amount: '1000000000000000000',
    } as ERC20Amount;

    const getSignableDepositResponse = {
      stark_key: '1111',
      vault_id: '2222',
      amount: '1000000000000000000',
    };

    const encodeAssetResponse = {
      asset_type: 'asset',
      stark_key: '1111',
      vault_id: '2222',
      amount: '1000000000000000000',
    };
    const getTokenResponse = {
      decimals: 18,
    };

    beforeEach(() => {
      jest.restoreAllMocks();

      getSignableDepositMock = jest.fn().mockResolvedValue({
        data: getSignableDepositResponse,
      });
      (imx.DepositsApi as jest.Mock).mockReturnValue({
        getSignableDeposit: getSignableDepositMock,
      });

      encodeAssetMock = jest.fn().mockResolvedValue({
        data: encodeAssetResponse,
      });
      (imx.EncodingApi as jest.Mock).mockReturnValue({
        encodeAsset: encodeAssetMock,
      });

      getTokenMock = jest.fn().mockResolvedValue({
        data: getTokenResponse,
      });
      (imx.TokensApi as jest.Mock).mockReturnValue({
        getToken: getTokenMock,
      });

      (Contracts.IERC20.connect as jest.Mock).mockReturnValue({
        approve: {
          populateTransaction: async () => 'test',
        },
      });

      (Contracts.CoreV4.connect as jest.Mock).mockReturnValue({
        registerAndDepositERC20: {
          populateTransaction: async () => 'test',
        },
        depositERC20: {
          populateTransaction: async () => 'test',
        },
      });
    });

    const testCases = [{ isRegistered: true }, { isRegistered: false }];

    testCases.forEach((testCase) => {
      test(`should make the correct api requests when user is ${testCase.isRegistered ? '' : 'not'
      } registered on-chain`, async () => {
        (Contracts.RegistrationV4.connect as jest.Mock).mockReturnValue({
          isRegistered: async () => testCase.isRegistered,
        });

        const signers = await generateSigners(privateKey1);

        const response = await depositERC20({
          signers,
          deposit: signableDepositRequest,
          config: testConfig,
        });
        expect(getTokenMock).toHaveBeenCalledWith({
          address: 'kljh5kl3j4biu3b59385',
        });
        expect(getSignableDepositMock).toHaveBeenCalledWith({
          getSignableDepositRequest: {
            amount: '1000000000000000000',
            token: {
              data: {
                decimals: 18,
                token_address: 'kljh5kl3j4biu3b59385',
              },
            },
            user: 'ETHd90915fa5bce418a23184c9asdfasfasdf5c8e900e3035cf34e2dd36',
          },
        });
        expect(encodeAssetMock).toHaveBeenCalledWith({
          assetType: 'asset',
          encodeAssetRequest: {
            token: {
              data: {
                token_address: 'kljh5kl3j4biu3b59385',
              },
            },
          },
        });
        expect(response).toEqual(transactionResponse);
      });
    });
  });
});
