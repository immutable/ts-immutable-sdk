import { JsonRpcProvider } from 'ethers';
import { getWithdrawRootToken } from './axelarUtils';

const rootToken = '0x1f9090aaE28b8a3dCeaDf281B0F12828e676c326';

jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  Contract: jest.fn().mockImplementation(() => ({
    allowance: jest.fn(),
    interface: {
      encodeFunctionData: jest.fn(),
    },
    rootToken: jest.fn().mockImplementation(async () => rootToken),
  })),
}));

describe('Axelar', () => {
  describe('getWithdrawRootToken', () => {
    it('should return the root token for a child token', async () => {
      const childToken = '0x388c818ca8b9251b393131c08a736a67ccb19297';
      const destinationChainId = '1';
      const mockChildProvider = new JsonRpcProvider('x');
      const receivedRootToken = await getWithdrawRootToken(
        childToken,
        destinationChainId,
        mockChildProvider,
      );
      expect(receivedRootToken).toEqual(rootToken);
    });

    it('should return the root IMX token withdrawing NATIVE', async () => {
      const childToken = 'NATIVE';
      const destinationChainId = '1';
      const mockChildProvider = new JsonRpcProvider('x');
      const receivedRootToken = await getWithdrawRootToken(
        childToken,
        destinationChainId,
        mockChildProvider,
      );

      const rootIMX = '0xf57e7e7c23978c3caec3c3548e3d615c346e79ff';
      expect(receivedRootToken).toEqual(rootIMX);
    });
  });
});
