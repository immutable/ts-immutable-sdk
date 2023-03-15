import { getBalance } from './balances';
import { Web3Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { BalanceError } from './errors';

describe('balances', () => {
    it('should call get balance on provider and return the balance', async () => {
        const mockGetBalance = jest.fn().mockResolvedValue(BigNumber.from('1000000'));
        const mockProvider = jest.fn().mockImplementation(() => {
            return {
                getBalance: mockGetBalance
            }
        });
        const balance = await getBalance(mockProvider() as unknown as Web3Provider, '0xAddress');
        expect(mockGetBalance).toBeCalledTimes(1);
        expect(balance).toEqual(BigNumber.from('1000000'));
    });

    it('should call get balance on provider and return the balance', async () => {
        const mockProvider = jest.fn().mockImplementation(() => {
            return {
                getBalance: jest.fn().mockRejectedValue({})
            }
        });
        await expect(getBalance(mockProvider() as unknown as Web3Provider, '0xAddress')).rejects.toThrow(new BalanceError('Error occurred while attempting to get the balance for 0xAddress'))
    });
});
