import { generateSigners, privateKey1, testConfig } from "../test/helpers";
import { UnsignedTransferRequest, TransfersApi } from "@imtbl/core-sdk";
import { transfer } from './transfer';
import { signRaw } from './utils';


jest.mock('@imtbl/core-sdk')
jest.mock('./utils')

describe('Transfer', () => {
  describe('transfer()', () => {
    let getSignableTransferMock: jest.Mock;
    let createTransferMock: jest.Mock;

    const receiver = "abc123";

    const signableTransferRequest: UnsignedTransferRequest = {
      type: 'ERC721',
      tokenId: "112233",
      tokenAddress: "kljh5kl3j4biu3b59385",
      receiver,
    };

    const getSignableTransferResponse = {
      sender_stark_key: "1111",
      sender_vault_id: "2222",
      receiver_stark_key: "aaaa",
      receiver_vault_id: "bbbb",
      asset_id: "112233",
      amount: "1",
      nonce: 0,
      expiration_timestamp: 0,
      signable_message: "signable-message",
      payload_hash: "payload-hash"
    }

    const createTransferResponse = {}

    beforeEach(() => {
      jest.restoreAllMocks()
      getSignableTransferMock = jest.fn().mockResolvedValue({
        data: getSignableTransferResponse
      });
      createTransferMock = jest.fn().mockResolvedValue({
        data: createTransferResponse
      });
      (TransfersApi as jest.Mock).mockReturnValue({
        getSignableTransferV1: getSignableTransferMock,
        createTransferV1: createTransferMock,
      });

      (signRaw as jest.Mock).mockReturnValue("raw-eth-signature");
    })

    test('should make the correct api requests with the correct params, and return the correct receipt', async () => {
      const signers = await generateSigners(privateKey1)

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
            type: "ERC721",
          },
          amount: "1",
          receiver: receiver,
        },
      })
      expect(createTransferMock).toHaveBeenCalledWith({
        createTransferRequest: {
          sender_stark_key: getSignableTransferResponse.sender_stark_key,
          sender_vault_id: getSignableTransferResponse.sender_vault_id,
          receiver_stark_key: getSignableTransferResponse.receiver_stark_key,
          receiver_vault_id: getSignableTransferResponse.receiver_vault_id,
          asset_id: getSignableTransferResponse.asset_id,
          amount: getSignableTransferResponse.amount,
          nonce: getSignableTransferResponse.nonce,
          expiration_timestamp: getSignableTransferResponse.expiration_timestamp,
          stark_signature: "payload-hashSTXd90915fa5bce418a23184c9asdfasfasdf5c8e900e3035cf34e2dd36",
        },
        xImxEthAddress: await signers.ethSigner.getAddress(),
        xImxEthSignature: "raw-eth-signature",
      })
      expect(response).toEqual(createTransferResponse);
    })
  })
})
