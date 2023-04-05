import { generateSigners, privateKey1, testConfig } from "../../test/helpers";
import {
  CreateWithdrawalResponse,
  GetSignableWithdrawalResponse,
  WithdrawalsApi,
} from "@imtbl/core-sdk";
import {
  prepareWithdrawalAction,
  PrepareWithdrawalWorkflowParams,
} from "./prepareWithdrawal";
import { convertToSignableToken, signMessage } from "@imtbl/toolkit";

jest.mock("@imtbl/core-sdk");
jest.mock("@imtbl/toolkit");

describe("prepareWithdrawal", () => {
  describe("prepareWithdrawal action", () => {
    let getSignableWithdrawalMock: jest.Mock;
    let createWithdrawalMock: jest.Mock;
    const getSignableWithdrawalResponse: GetSignableWithdrawalResponse = {
      signable_message: "hello",
      payload_hash: "hash",
      nonce: 0,
      stark_key: "0x10c",
      vault_id: 123,
      amount: "1",
      asset_id: "22",
    };
    const createWithdrawalResponse: CreateWithdrawalResponse = {
      time: 0,
      status: "status",
      withdrawal_id: 12,
    };

    beforeEach(() => {
      jest.restoreAllMocks();

      getSignableWithdrawalMock = jest.fn().mockResolvedValue({
        data: getSignableWithdrawalResponse,
      });
      createWithdrawalMock = jest.fn().mockResolvedValue({
        data: createWithdrawalResponse,
      });

      (WithdrawalsApi as jest.Mock).mockReturnValue({
        getSignableWithdrawal: getSignableWithdrawalMock,
        createWithdrawal: createWithdrawalMock,
      });
    });

    test("prepare withdrawal for ERC721", async () => {
      const signers = await generateSigners(privateKey1);
      const ethKey = await signers.ethSigner.getAddress();

      (signMessage as jest.Mock).mockReturnValue({
        message: getSignableWithdrawalResponse.signable_message,
        ethAddress: ethKey,
        ethSignature: "raw-eth-signature",
      });

      const request: PrepareWithdrawalWorkflowParams = {
        type: "ERC721",
        config: testConfig.getStarkExConfig(),
        signers: signers,
        tokenId: "1",
        tokenAddress: "asd",
      };
      const resposne = await prepareWithdrawalAction(request);

      expect(resposne).toEqual(createWithdrawalResponse);
      expect(getSignableWithdrawalMock).toHaveBeenCalledWith({
        getSignableWithdrawalRequest: {
          user: ethKey,
          token: convertToSignableToken(request),
          amount: "1",
        },
      });
      expect(createWithdrawalMock).toHaveBeenCalledWith({
        createWithdrawalRequest: {
          stark_key: getSignableWithdrawalResponse.stark_key,
          amount: "1",
          asset_id: getSignableWithdrawalResponse.asset_id,
          vault_id: getSignableWithdrawalResponse.vault_id,
          nonce: getSignableWithdrawalResponse.nonce,
          stark_signature:
            getSignableWithdrawalResponse.payload_hash + "STX" + privateKey1,
        },
        xImxEthAddress: ethKey,
        xImxEthSignature: "raw-eth-signature",
      });
    });

    test("prepare withdrawal for currency token", async () => {
      const signers = await generateSigners(privateKey1);
      const ethKey = await signers.ethSigner.getAddress();

      (signMessage as jest.Mock).mockReturnValue({
        message: getSignableWithdrawalResponse.signable_message,
        ethAddress: ethKey,
        ethSignature: "raw-eth-signature",
      });

      const request: PrepareWithdrawalWorkflowParams = {
        type: "ERC20",
        config: testConfig.getStarkExConfig(),
        signers: signers,
        amount: "1.02",
        tokenAddress: "asd",
      };
      const resposne = await prepareWithdrawalAction(request);

      expect(resposne).toEqual(createWithdrawalResponse);
      expect(getSignableWithdrawalMock).toHaveBeenCalledWith({
        getSignableWithdrawalRequest: {
          user: ethKey,
          token: convertToSignableToken(request),
          amount: request.amount,
        },
      });
      expect(createWithdrawalMock).toHaveBeenCalledWith({
        createWithdrawalRequest: {
          stark_key: getSignableWithdrawalResponse.stark_key,
          amount: request.amount,
          asset_id: getSignableWithdrawalResponse.asset_id,
          vault_id: getSignableWithdrawalResponse.vault_id,
          nonce: getSignableWithdrawalResponse.nonce,
          stark_signature:
            getSignableWithdrawalResponse.payload_hash + "STX" + privateKey1,
        },
        xImxEthAddress: ethKey,
        xImxEthSignature: "raw-eth-signature",
      });
    });
  });
});
