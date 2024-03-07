import { Contracts } from '@imtbl/core-sdk';
import { imx } from '@imtbl/generated-clients';
import { ETHAmount } from '@imtbl/x-client';
import {
  generateSigners,
  privateKey1,
  testConfig,
  transactionResponse,
} from '../../test/helpers';
import { depositEth } from '.';

jest.mock('@imtbl/generated-clients');
jest.mock('@imtbl/core-sdk');

describe('Deposit ETH', () => {
  describe('depositETH()', () => {
    let getSignableDepositMock: jest.Mock;
    let encodeAssetMock: jest.Mock;
    let getSignableRegistrationMock: jest.Mock;

    const signableDepositRequest = {
      tokenAddress: 'kljh5kl3j4biu3b59385',
      amount: '1000000000000000000',
      type: 'ETH',
    } as ETHAmount;

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

    const getSignableRegistrationResponse = {};

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

      getSignableRegistrationMock = jest.fn().mockResolvedValue({
        data: getSignableRegistrationResponse,
      });
      (imx.UsersApi as jest.Mock).mockReturnValue({
        getSignableRegistration: getSignableRegistrationMock,
      });

      (Contracts.Core.connect as jest.Mock).mockReturnValue({
        populateTransaction: {
          registerAndDepositEth: async () => 'test',
          // eslint-disable-next-line @typescript-eslint/naming-convention
          'deposit(uint256,uint256,uint256)': async () => 'test',
        },
      });
    });
    const testCases = [{ isRegistered: true }, { isRegistered: false }];
    testCases.forEach((testcase) => {
      test(`should make the correct api requests when user is ${
        testcase.isRegistered ? '' : 'not'
      } registered on-chain`, async () => {
        (Contracts.Registration.connect as jest.Mock).mockReturnValue({
          isRegistered: async () => testcase.isRegistered,
        });

        const signers = await generateSigners(privateKey1);

        const response = await depositEth({
          signers,
          deposit: signableDepositRequest,
          config: testConfig,
        });
        expect(getSignableDepositMock).toHaveBeenCalledWith({
          getSignableDepositRequest: {
            amount: '1000000000000000000',
            token: {
              data: {
                decimals: 18,
              },
              type: 'ETH',
            },
            user: 'ETHd90915fa5bce418a23184c9asdfasfasdf5c8e900e3035cf34e2dd36',
          },
        });
        expect(encodeAssetMock).toHaveBeenCalledWith({
          assetType: 'asset',
          encodeAssetRequest: {
            token: {
              type: 'ETH',
            },
          },
        });
        expect(response).toEqual(transactionResponse);
      });
    });
  });
});
