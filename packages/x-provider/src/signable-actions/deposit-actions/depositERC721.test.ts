import { imx } from '@imtbl/generated-clients';
import {
  Contracts,
  ERC721Token,
} from '@imtbl/x-client';
import {
  generateSigners,
  privateKey1,
  testConfig,
  transactionResponse,
} from '../../test/helpers';
import { depositERC721 } from '.';

jest.mock('@imtbl/generated-clients');
jest.mock('@imtbl/x-client');

describe('Deposit ERC721', () => {
  describe('depositERC721()', () => {
    let getSignableDepositMock: jest.Mock;
    let encodeAssetMock: jest.Mock;

    const signableDepositRequest = {
      tokenAddress: 'kljh5kl3j4biu3b59385',
      amount: '1',
      type: 'ERC721',
      tokenId: 'abcd',
    } as ERC721Token;

    const getSignableDepositResponse = {
      stark_key: '1111',
      vault_id: '2222',
      amount: '1',
    };

    const encodeAssetResponse = {
      asset_type: 'asset',
      stark_key: '1111',
      vault_id: '2222',
      amount: '1',
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

      (Contracts.IERC721.connect as jest.Mock).mockReturnValue({
        isApprovedForAll: async () => true,
      });

      (Contracts.CoreV4.connect as jest.Mock).mockReturnValue({
        registerUser: async () => 'test',
        approve: {
          populateTransaction: async () => 'test',
        },
        depositNft: {
          populateTransaction: async () => 'test',
        },
      });
    });

    const testCases = [{ isRegistered: true }, { isRegistered: false }];

    testCases.forEach((testcase) => {
      test(`should make the correct api requests when user is ${
        testcase.isRegistered ? '' : 'not'
      } registered on-chain`, async () => {
        (Contracts.RegistrationV4.connect as jest.Mock).mockReturnValue({
          isRegistered: async () => testcase.isRegistered,
        });
        const signers = await generateSigners(privateKey1);

        const response = await depositERC721({
          signers,
          deposit: signableDepositRequest,
          config: testConfig,
        });
        expect(getSignableDepositMock).toHaveBeenCalledWith({
          getSignableDepositRequest: {
            amount: '1',
            token: {
              data: {
                token_id: 'abcd',
                token_address: 'kljh5kl3j4biu3b59385',
              },
              type: 'ERC721',
            },
            user: 'ETHd90915fa5bce418a23184c9asdfasfasdf5c8e900e3035cf34e2dd36',
          },
        });
        expect(encodeAssetMock).toHaveBeenCalledWith({
          assetType: 'asset',
          encodeAssetRequest: {
            token: {
              data: {
                token_id: 'abcd',
                token_address: 'kljh5kl3j4biu3b59385',
              },
              type: 'ERC721',
            },
          },
        });
        expect(response).toEqual(transactionResponse);
      });
    });
  });
});
