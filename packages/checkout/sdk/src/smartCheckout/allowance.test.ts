import { BigNumber, Contract } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { erc20Allowance } from './allowance';
import { CheckoutErrorType } from '../errors';

jest.mock('ethers', () => ({
  ...jest.requireActual('ethers'),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Contract: jest.fn(),
}));

describe('allowance', () => {
  describe('erc20Allowance', () => {
    let mockProvider: Web3Provider;

    it('should get the allowance from the contract', async () => {
      const allowanceMock = jest.fn().mockResolvedValue(BigNumber.from(1));
      (Contract as unknown as jest.Mock).mockReturnValue({
        allowance: allowanceMock,
      });

      mockProvider = {
        getSigner: jest.fn().mockReturnValue({
          getAddress: jest.fn().mockResolvedValue('0xADDRESS'),
        }),
      } as unknown as Web3Provider;

      const allowance = await erc20Allowance(
        mockProvider,
        'OxERC20',
        '0xSEAPORT',
      );
      expect(allowance).toEqual(BigNumber.from(1));
      expect(allowanceMock).toBeCalledWith('0xADDRESS', '0xSEAPORT');
    });

    it('should throw checkout error when allowance call errors', async () => {
      const allowanceMock = jest.fn().mockRejectedValue({});
      (Contract as unknown as jest.Mock).mockReturnValue({
        allowance: allowanceMock,
      });

      mockProvider = {
        getSigner: jest.fn().mockReturnValue({
          getAddress: jest.fn().mockResolvedValue('0xADDRESS'),
        }),
      } as unknown as Web3Provider;

      try {
        await erc20Allowance(
          mockProvider,
          'OxERC20',
          '0xSEAPORT',
        );
      } catch (err: any) {
        expect(err.message).toEqual('Failed to get the allowance for ERC20');
        expect(err.type).toEqual(CheckoutErrorType.GET_ERC20_ALLOWANCE_ERROR);
        expect(err.data).toEqual({
          contractAddress: 'OxERC20',
        });
        expect(allowanceMock).toBeCalledWith('0xADDRESS', '0xSEAPORT');
      }
    });

    it('should throw checkout error when provider call errors', async () => {
      const allowanceMock = jest.fn().mockResolvedValue({});
      (Contract as unknown as jest.Mock).mockReturnValue({
        allowance: allowanceMock,
      });

      try {
        mockProvider = {
          getSigner: jest.fn().mockReturnValue({
            getAddress: jest.fn().mockRejectedValue(''),
          }),
        } as unknown as Web3Provider;

        await erc20Allowance(
          mockProvider,
          'OxERC20',
          '0xSEAPORT',
        );
      } catch (err: any) {
        expect(err.message).toEqual('Failed to get the allowance for ERC20');
        expect(err.type).toEqual(CheckoutErrorType.GET_ERC20_ALLOWANCE_ERROR);
        expect(err.data).toEqual({
          contractAddress: 'OxERC20',
        });
        expect(allowanceMock).toBeCalledTimes(0);
      }
    });
  });
});
