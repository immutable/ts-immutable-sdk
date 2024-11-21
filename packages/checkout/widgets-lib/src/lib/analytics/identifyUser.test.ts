import { WrappedBrowserProvider } from '@imtbl/checkout-sdk';
import { identifyUser } from './identifyUser';

describe('identifyUser', () => {
  let provider;
  let identify;
  beforeEach(() => {
    jest.resetAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    identify = jest.fn().mockReturnValue({});
  });

  it('should identify a user by their wallet address and add properties isMetaMask and isPassportWallet', async () => {
    provider = {
      getSigner: jest.fn().mockReturnValue({
        getAddress: jest.fn().mockResolvedValue('0xtest'),
      }),
      ethereumProvider: {
        isMetaMask: true,
        request: jest.fn(),
      },
    } as any as WrappedBrowserProvider;

    await identifyUser(identify, provider);
    expect(identify).toBeCalledWith('0xtest', { isMetaMask: true, isPassportWallet: false }, undefined);
  });

  it('should correctly identify users wallet as Passport', async () => {
    const options = { foo: 'bar' };

    provider = {
      getSigner: jest.fn().mockReturnValue({
        getAddress: jest.fn().mockResolvedValue('0xtest'),
      }),
      send: jest.fn(),
      ethereumProvider: {
        isPassport: true,
        request: jest.fn(),
      },
    } as any as WrappedBrowserProvider;
    await identifyUser(identify, provider, options);
    expect(identify).toBeCalledWith('0xtest', { isMetaMask: false, isPassportWallet: true }, options);
  });
});
