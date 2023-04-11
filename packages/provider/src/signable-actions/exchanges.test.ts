import { generateSigners, privateKey1, testConfig } from '../test/helpers';
import { UnsignedExchangeTransferRequest, ExchangesApi } from '@imtbl/core-sdk';
import { exchangeTransfer } from './exchanges';
import { signRaw, convertToSignableToken } from '@imtbl/toolkit';

jest.mock('@imtbl/core-sdk');
jest.mock('@imtbl/toolkit');

describe('ExchangeTransfer', () => {
  describe('exchangeTransfer()', () => {
    let getSignableExchangeTransferMock: jest.Mock;
    let createExchangeTransferMock: jest.Mock;

    const receiver = 'abc123';

    const signableExchangeTransferRequest: UnsignedExchangeTransferRequest = {
      type: 'ETH',
      amount: '1000000000000000000',
      transactionID: 'abc123',
      receiver,
    };

    const getSignableExchangeTransferResponse = {
      sender_stark_key: '1111',
      sender_vault_id: '2222',
      receiver_stark_key: 'aaaa',
      receiver_vault_id: 'bbbb',
      asset_id: '112233',
      amount: '1',
      nonce: 0,
      expiration_timestamp: 0,
      signable_message: 'signable-message',
      payload_hash: 'payload-hash',
    };

    const createExchangeTransferResponse = {};

    beforeEach(() => {
      jest.restoreAllMocks();
      getSignableExchangeTransferMock = jest.fn().mockResolvedValue({
        data: getSignableExchangeTransferResponse,
      });
      createExchangeTransferMock = jest.fn().mockResolvedValue({
        data: createExchangeTransferResponse,
      });
      (ExchangesApi as jest.Mock).mockReturnValue({
        getExchangeSignableTransfer: getSignableExchangeTransferMock,
        createExchangeTransfer: createExchangeTransferMock,
      });

      (signRaw as jest.Mock).mockReturnValue('raw-eth-signature');
    });

    test('should make the correct api requests with the correct params, and return the correct receipt', async () => {
      const signers = await generateSigners(privateKey1);

      (convertToSignableToken as jest.Mock).mockReturnValue({
        type: 'ETH',
        data: {
          decimals: 18,
        },
      });
      const response = await exchangeTransfer({
        signers,
        request: signableExchangeTransferRequest,
        config: testConfig,
      });
      expect(getSignableExchangeTransferMock).toHaveBeenCalledWith({
        id: 'abc123',
        getSignableTransferRequest: {
          sender: await signers.ethSigner.getAddress(),
          token: {
            data: {
              decimals: 18,
            },
            type: 'ETH',
          },
          amount: '1000000000000000000',
          receiver: receiver,
        },
      });
      expect(createExchangeTransferMock).toHaveBeenCalledWith({
        createTransferRequest: {
          sender_stark_key:
            getSignableExchangeTransferResponse.sender_stark_key,
          sender_vault_id: getSignableExchangeTransferResponse.sender_vault_id,
          receiver_stark_key:
            getSignableExchangeTransferResponse.receiver_stark_key,
          receiver_vault_id:
            getSignableExchangeTransferResponse.receiver_vault_id,
          asset_id: getSignableExchangeTransferResponse.asset_id,
          amount: getSignableExchangeTransferResponse.amount,
          nonce: getSignableExchangeTransferResponse.nonce,
          expiration_timestamp:
            getSignableExchangeTransferResponse.expiration_timestamp,
          stark_signature:
            'payload-hashSTXd90915fa5bce418a23184c9asdfasfasdf5c8e900e3035cf34e2dd36',
        },
        id: 'abc123',
        xImxEthAddress: await signers.ethSigner.getAddress(),
        xImxEthSignature: 'raw-eth-signature',
      });
      expect(response).toEqual(createExchangeTransferResponse);
    });
  });
});
