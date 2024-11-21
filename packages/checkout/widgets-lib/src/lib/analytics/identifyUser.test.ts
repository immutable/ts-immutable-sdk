import { BrowserProvider } from 'ethers';
import { NamedBrowserProvider, WalletProviderName } from '@imtbl/checkout-sdk';
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
      provider: {
        isMetaMask: true,
        request: jest.fn(),
      },
    } as any as BrowserProvider;

    await identifyUser(identify, provider);
    expect(identify).toBeCalledWith('0xtest', { isMetaMask: true, isPassportWallet: false });
  });

  it('should correctly identify users wallet as Passport', async () => {
    provider = {
      getSigner: jest.fn().mockReturnValue({
        getAddress: jest.fn().mockResolvedValue('0xtest'),
      }),
      send: jest.fn(),
      name: WalletProviderName.PASSPORT,
    } as any as NamedBrowserProvider;
    await identifyUser(identify, provider);
    expect(identify).toBeCalledWith('0xtest', { isMetaMask: false, isPassportWallet: true });
  });
});
