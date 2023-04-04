import { generateSigners, privateKey1, testConfig } from "../test/helpers";
import { TradesApi, GetSignableTradeRequest } from "@imtbl/core-sdk";
import { signRaw } from "@imtbl/toolkit";
import { createTrade } from "./trades";

jest.mock("@imtbl/core-sdk");
jest.mock("@imtbl/toolkit");

describe("Trades", () => {
  describe("createTrade()", () => {
    let getSignableTradeMock: jest.Mock;
    let createTradeMock: jest.Mock;

    const getSignableTradeResponse = {
      signable_message: "hello",
      payload_hash: "hash",
      amount_sell: "1",
      amount_buy: "12",
      asset_id_buy: "1234",
      asset_id_sell: "5678",
      fee_info: [],
      expiration_timestamp: 0,
      nonce: 0,
      stark_key: "0x10c",
      vault_id_buy: "abc",
      vault_id_sell: "def",
    };
    const createTradeResponse = {
      trade_id: 0,
      request_id: "123456",
      status: "some-status",
    };

    beforeEach(() => {
      jest.restoreAllMocks();
      getSignableTradeMock = jest.fn().mockResolvedValue({
        data: getSignableTradeResponse,
      });
      createTradeMock = jest.fn().mockResolvedValue({
        data: createTradeResponse,
      });
      (TradesApi as jest.Mock).mockReturnValue({
        getSignableTrade: getSignableTradeMock,
        createTrade: createTradeMock,
      });

      (signRaw as jest.Mock).mockReturnValue("raw-eth-signature");
    });

    test("should make the api requests with the correct params", async () => {
      const signers = await generateSigners(privateKey1);
      const ethKey = await signers.ethSigner.getAddress();

      const signableTradeRequest: GetSignableTradeRequest = {
        user: ethKey,
        order_id: 1212,
        fees: [],
      };

      const response = await createTrade({
        signers,
        request: signableTradeRequest,
        config: testConfig,
      });

      expect(getSignableTradeMock).toHaveBeenCalledWith({
        getSignableTradeRequest: signableTradeRequest,
      });
      expect(createTradeMock).toHaveBeenCalledWith({
        createTradeRequest: {
          amount_buy: getSignableTradeResponse.amount_buy,
          amount_sell: getSignableTradeResponse.amount_sell,
          asset_id_buy: getSignableTradeResponse.asset_id_buy,
          asset_id_sell: getSignableTradeResponse.asset_id_sell,
          expiration_timestamp: getSignableTradeResponse.expiration_timestamp,
          include_fees: true,
          fees: signableTradeRequest.fees,
          fee_info: getSignableTradeResponse.fee_info,
          order_id: signableTradeRequest.order_id,
          nonce: getSignableTradeResponse.nonce,
          stark_key: getSignableTradeResponse.stark_key,
          stark_signature:
            getSignableTradeResponse.payload_hash + "STX" + privateKey1,
          vault_id_buy: getSignableTradeResponse.vault_id_buy,
          vault_id_sell: getSignableTradeResponse.vault_id_sell,
        },
        xImxEthAddress: ethKey,
        xImxEthSignature: "raw-eth-signature",
      });
      expect(response).toEqual(createTradeResponse);
    });
  });
});
