import { Web3Provider } from '@ethersproject/providers';
import { identifyUser } from './identifyUser';

describe('identifyUser', () => {
  let provider;
  let identify;
  beforeEach(() => {
    jest.resetAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    identify = jest.fn().mockReturnValue({});
  });

  it('should identify a user by their wallet address and add properties isMetaMask and isImtblPP', async () => {
    provider = {
      getSigner: jest.fn().mockReturnValue({
        getAddress: jest.fn().mockResolvedValue('0xtest'),
      }),
      provider: {
        isMetaMask: true,
        request: jest.fn(),
      },
    } as any as Web3Provider;

    await identifyUser(identify, provider);
    expect(identify).toBeCalledWith('0xtest', { isMetaMask: true, isImtblPP: false });
  });

  it('should correctly identify users wallet as Passport', async () => {
    provider = {
      getSigner: jest.fn().mockReturnValue({
        getAddress: jest.fn().mockResolvedValue('0xtest'),
      }),
      provider: {
        isPassport: true,
        request: jest.fn(),
      },
    } as any as Web3Provider;
    await identifyUser(identify, provider);
    expect(identify).toBeCalledWith('0xtest', { isMetaMask: false, isImtblPP: true });
  });
});
