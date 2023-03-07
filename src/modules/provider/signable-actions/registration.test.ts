import { generateSigners, privateKey1, testConfig } from "../test/helpers";
import { UsersApi } from "@imtbl/core-sdk";
import { signRaw } from "./utils";
import { registerOffchain } from "./registration";


jest.mock('@imtbl/core-sdk')
jest.mock('./utils')

describe('Registration', () => {
  // describe('isRegisteredOnChain workflow', () => {
  //   let isRegisteredMock: jest.Mock;
  //   let connectMock: jest.Mock;
  //
  //   beforeEach(() => {
  //     jest.restoreAllMocks();
  //     isRegisteredMock = jest.fn().mockResolvedValue(true);
  //     connectMock = jest.fn().mockResolvedValue({
  //       isRegistered: isRegisteredMock
  //     });
  //
  //     (ContractFactory as unknown as jest.Mock).mockReturnValue({
  //       connect: connectMock,
  //     });
  //   })
  //
  //   test('should check stark public key and not throw an error', async () => {
  //     const signers = await generateSigners(privateKey1)
  //
  //     expect(async ()=>await isRegisteredOnChain("stark-key", signers.ethSigner, testConfig))
  //       .not.toThrowError(Error);
  //   });
  // });

  describe('registerOffchain', () => {
    let getSignableRegistrationOffchainMock: jest.Mock;
    let registerUserMock: jest.Mock;
    const registerUserResponse = {
      tx_hash: 'tx_hash'
    };

    beforeEach(() => {
      jest.restoreAllMocks();

      const getSignableRegistrationResponse = {
        signable_message:'signable',
        payload_hash: 'hash'
      };

      getSignableRegistrationOffchainMock = jest.fn().mockResolvedValue({
        data: getSignableRegistrationResponse
      });
      registerUserMock = jest.fn().mockResolvedValue({data: registerUserResponse});
      (UsersApi as jest.Mock).mockReturnValue({
        getSignableRegistrationOffchain: getSignableRegistrationOffchainMock,
        registerUser: registerUserMock,
      });

      (signRaw as jest.Mock).mockReturnValue("raw-eth-signature");
    })

    test('should make the correct api requests with the correct params, and return the correct result', async () => {
      const signers = await generateSigners(privateKey1)
      const ethKey = await signers.ethSigner.getAddress();
      const starkKey = await signers.starkExSigner.getAddress();

      const getSignableRegistrationRequest = {
        ether_key: ethKey,
        stark_key: starkKey,
      };

      const response = await registerOffchain(
        signers,
        testConfig
      );
      expect(getSignableRegistrationOffchainMock).toHaveBeenCalledWith({
        getSignableRegistrationRequest: getSignableRegistrationRequest
      });
      expect(registerUserMock).toHaveBeenCalledWith({
        registerUserRequest: {
          eth_signature: 'raw-eth-signature',
          ether_key: ethKey,
          stark_signature: await signers.starkExSigner.signMessage('hash'),
          stark_key: starkKey,
        }
      });
      console.log(response, registerUserResponse)
      expect(response).toEqual(registerUserResponse);
    })
  })
})
