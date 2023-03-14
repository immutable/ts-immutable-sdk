import registerPassport, { registerPassportParams } from './registration';

describe('registerPassportWorkflow', () => {
  const requestBody = {
    ether_key: '0x232',
    stark_key: '0x567',
    stark_signature: '0x123',
    eth_signature: '0x123',
  };
  const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ';

  it('registerPassportWorkflow successfully called api client to register passport user', async () => {
    const mockUserApi = {
      registerPassportUser: jest.fn().mockResolvedValue({ statusText: "No Content" }),
      getSignableRegistrationOffchain: jest.fn().mockReturnValue({
          data: {
            payload_hash: "0x34",
            signable_message: "message to sign"
          }
        }
      )
    };
    const mockEthSigner = {
      getAddress: jest.fn().mockReturnValue(requestBody.ether_key),
      signMessage: jest.fn().mockReturnValue(requestBody.eth_signature)
    };
    const mockStarkSigner = {
      getAddress: jest.fn().mockReturnValue(requestBody.stark_key),
      signMessage: jest.fn().mockReturnValue(requestBody.stark_signature)
    };
    const request: registerPassportParams = {
      ethSigner: mockEthSigner as never,
      starkSigner: mockStarkSigner as never,
      usersApi: mockUserApi as never,
    };

    const res = await registerPassport(request, mockToken);

    expect(res).toEqual("No Content");
    expect(mockStarkSigner.signMessage).toHaveBeenCalled();
    expect(mockEthSigner.signMessage).toHaveBeenCalled();
    expect(mockUserApi.registerPassportUser).toHaveBeenCalledWith({
      authorization: mockToken,
      registerPassportUserRequest: {
        ...requestBody,
        eth_signature: "0x0000000000000000000000000000000000000000000000000000000000000123000000000000000000000000000000000000000000000000000000000000000000"
      }
    });
  });
  it('registerPassportWorkflow failed to call api client to register passport user', async () => {
    const mockUserApi = {
      registerPassportUser: jest.fn().mockRejectedValue("error"),
      getSignableRegistrationOffchain: jest.fn().mockReturnValue({
          data: {
            payload_hash: "0x34",
            signable_message: "message to sign"
          }
        }
      )
    };
    const mockEthSigner = {
      getAddress: jest.fn().mockReturnValue(requestBody.ether_key),
      signMessage: jest.fn().mockReturnValue(requestBody.eth_signature)
    };
    const mockStarkSigner = {
      getAddress: jest.fn().mockReturnValue(requestBody.stark_key),
      signMessage: jest.fn().mockReturnValue(requestBody.stark_signature)
    };
    const request: registerPassportParams = {
      ethSigner: mockEthSigner as never,
      starkSigner: mockStarkSigner as never,
      usersApi: mockUserApi as never,
    };

    await expect(registerPassport(request, mockToken)).rejects.toEqual("error");

    expect(mockStarkSigner.signMessage).toHaveBeenCalled();
    expect(mockEthSigner.signMessage).toHaveBeenCalled();
    expect(mockUserApi.registerPassportUser).toHaveBeenCalledWith({
      authorization: mockToken,
      registerPassportUserRequest: {
        ...requestBody,
        eth_signature: "0x0000000000000000000000000000000000000000000000000000000000000123000000000000000000000000000000000000000000000000000000000000000000"
      }
    });
  });
});
