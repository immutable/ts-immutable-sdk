import {
  UnsignedTransferRequest,
  TransfersApi,
  NftTransferDetails,
} from '@imtbl/core-sdk';
import { signRaw, convertToSignableToken } from '@imtbl/toolkit';
import { generateSigners, privateKey1, testConfig } from '../test/helpers';
import { transfer, batchTransfer } from './transfer';

jest.mock('@imtbl/core-sdk');
jest.mock('@imtbl/toolkit');

describe('Transfer', () => {
  describe('transfer()', () => {
    let getSignableTransferMock: jest.Mock;
    let createTransferMock: jest.Mock;

    const receiver = 'abc123';

    const signableTransferRequest: UnsignedTransferRequest = {
      type: 'ERC721',
      tokenId: '112233',
      tokenAddress: 'kljh5kl3j4biu3b59385',
      receiver,
    };

    const getSignableTransferResponse = {
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

    const createTransferResponse = {};

    beforeEach(() => {
      jest.restoreAllMocks();
      getSignableTransferMock = jest.fn().mockResolvedValue({
        data: getSignableTransferResponse,
      });
      createTransferMock = jest.fn().mockResolvedValue({
        data: createTransferResponse,
      });
      (TransfersApi as jest.Mock).mockReturnValue({
        getSignableTransferV1: getSignableTransferMock,
        createTransferV1: createTransferMock,
      });

      (signRaw as jest.Mock).mockReturnValue('raw-eth-signature');
    });

    test('should make the correct api requests with the correct params, and return the correct receipt', async () => {
      const signers = await generateSigners(privateKey1);

      (convertToSignableToken as jest.Mock).mockReturnValue({
        type: 'ERC721',
        data: {
          token_address: signableTransferRequest.tokenAddress,
          token_id: signableTransferRequest.tokenId,
        },
      });
      const response = await transfer({
        signers,
        request: signableTransferRequest,
        config: testConfig,
      });
      expect(getSignableTransferMock).toHaveBeenCalledWith({
        getSignableTransferRequest: {
          sender: await signers.ethSigner.getAddress(),
          token: {
            data: {
              token_address: signableTransferRequest.tokenAddress,
              token_id: signableTransferRequest.tokenId,
            },
            type: 'ERC721',
          },
          amount: '1',
          receiver,
        },
      });
      expect(createTransferMock).toHaveBeenCalledWith({
        createTransferRequest: {
          sender_stark_key: getSignableTransferResponse.sender_stark_key,
          sender_vault_id: getSignableTransferResponse.sender_vault_id,
          receiver_stark_key: getSignableTransferResponse.receiver_stark_key,
          receiver_vault_id: getSignableTransferResponse.receiver_vault_id,
          asset_id: getSignableTransferResponse.asset_id,
          amount: getSignableTransferResponse.amount,
          nonce: getSignableTransferResponse.nonce,
          expiration_timestamp:
            getSignableTransferResponse.expiration_timestamp,
          stark_signature:
            'payload-hashSTXd90915fa5bce418a23184c9asdfasfasdf5c8e900e3035cf34e2dd36',
        },
        xImxEthAddress: await signers.ethSigner.getAddress(),
        xImxEthSignature: 'raw-eth-signature',
      });
      expect(response).toEqual(createTransferResponse);
    });
  });

  describe('batchTransfer()', () => {
    let getSignableTransferMock: jest.Mock;
    let createTransferMock: jest.Mock;

    const receiver = 'abc123';

    const signableTransferRequest: Array<NftTransferDetails> = [
      {
        tokenId: '112233',
        tokenAddress: 'kljh5kl3j4biu3b59385',
        receiver,
      },
    ];

    const getSignableTransferResponse = {
      signable_responses: [
        {
          sender_vault_id: '2222',
          receiver_stark_key: 'aaaa',
          receiver_vault_id: 'bbbb',
          asset_id: '112233',
          amount: '1',
          nonce: 0,
          expiration_timestamp: 0,
          payload_hash: 'payload-hash',
        },
      ],
      sender_stark_key: '1111',
      signable_message: 'signable-message',
    };

    const createTransferResponse = {};

    beforeEach(() => {
      jest.restoreAllMocks();
      getSignableTransferMock = jest.fn().mockResolvedValue({
        data: getSignableTransferResponse,
      });
      createTransferMock = jest.fn().mockResolvedValue({
        data: createTransferResponse,
      });
      (TransfersApi as jest.Mock).mockReturnValue({
        getSignableTransfer: getSignableTransferMock,
        createTransfer: createTransferMock,
      });

      (signRaw as jest.Mock).mockReturnValue('raw-eth-signature');
    });

    test('should make the correct api requests with the correct params, and return the correct receipt', async () => {
      const signers = await generateSigners(privateKey1);

      (convertToSignableToken as jest.Mock).mockReturnValue({
        type: 'ERC721',
        data: {
          token_address: signableTransferRequest[0].tokenAddress,
          token_id: signableTransferRequest[0].tokenId,
        },
      });
      const response = await batchTransfer({
        signers,
        request: signableTransferRequest,
        config: testConfig,
      });
      expect(getSignableTransferMock).toHaveBeenCalledWith({
        getSignableTransferRequestV2: {
          sender_ether_key: await signers.ethSigner.getAddress(),
          signable_requests: [
            {
              token: {
                data: {
                  token_address: signableTransferRequest[0].tokenAddress,
                  token_id: signableTransferRequest[0].tokenId,
                },
                type: 'ERC721',
              },
              amount: '1',
              receiver,
            },
          ],
        },
      });
      expect(createTransferMock).toHaveBeenCalledWith({
        createTransferRequestV2: {
          requests: [
            {
              sender_vault_id:
                getSignableTransferResponse.signable_responses[0]
                  .sender_vault_id,
              receiver_stark_key:
                getSignableTransferResponse.signable_responses[0]
                  .receiver_stark_key,
              receiver_vault_id:
                getSignableTransferResponse.signable_responses[0]
                  .receiver_vault_id,
              asset_id:
                getSignableTransferResponse.signable_responses[0].asset_id,
              amount: getSignableTransferResponse.signable_responses[0].amount,
              nonce: getSignableTransferResponse.signable_responses[0].nonce,
              expiration_timestamp:
                getSignableTransferResponse.signable_responses[0]
                  .expiration_timestamp,
              stark_signature:
                'payload-hashSTXd90915fa5bce418a23184c9asdfasfasdf5c8e900e3035cf34e2dd36',
            },
          ],
          sender_stark_key: getSignableTransferResponse.sender_stark_key,
        },
        xImxEthAddress: await signers.ethSigner.getAddress(),
        xImxEthSignature: 'raw-eth-signature',
      });
      expect(response).toEqual(createTransferResponse);
    });
  });
});
