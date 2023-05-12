import { Environment, ImmutableConfiguration } from '@imtbl/config';
import { AnyToken } from '@imtbl/core-sdk';
import { completeWithdrawal } from './withdrawal';
import { Signers } from './types';
import * as WithdrawalActions from './withdrawal-actions';
import { ProviderConfiguration } from '../config';

jest.mock('@imtbl/core-sdk');
jest.mock('./withdrawal-actions');

describe('withdrawal', () => {
  const config = new ProviderConfiguration({
    baseConfig: new ImmutableConfiguration({
      environment: Environment.SANDBOX,
    }),
  });

  describe('completeWithdrawal()', () => {
    let completeERC721WithdrawalMock: jest.Mock;
    let completeERC20WithdrawalMock: jest.Mock;
    let completeEthWithdrawalMock: jest.Mock;

    beforeEach(() => {
      jest.restoreAllMocks();

      completeERC721WithdrawalMock = jest.fn();
      completeERC20WithdrawalMock = jest.fn();
      completeEthWithdrawalMock = jest.fn();

      (
        WithdrawalActions.completeERC20WithdrawalAction as jest.Mock
      ).mockImplementation(completeERC20WithdrawalMock);
      (
        WithdrawalActions.completeERC721WithdrawalAction as jest.Mock
      ).mockImplementation(completeERC721WithdrawalMock);
      (
        WithdrawalActions.completeEthWithdrawalAction as jest.Mock
      ).mockImplementation(completeEthWithdrawalMock);
    });

    const testCases = [
      {
        withdrawalType: 'ERC20',
        callsToWithdrawalEth: 0,
        callsToWithdrawalERC20: 1,
        callsToWithdrawalERC721: 0,
      },
      {
        withdrawalType: 'ETH',
        callsToWithdrawalEth: 1,
        callsToWithdrawalERC20: 0,
        callsToWithdrawalERC721: 0,
      },
      {
        withdrawalType: 'ERC721',
        callsToWithdrawalEth: 0,
        callsToWithdrawalERC20: 0,
        callsToWithdrawalERC721: 1,
      },
    ];

    testCases.forEach((testCase) => {
      test(
        `should call withdrawal${testCase.withdrawalType}() when the type in the paylod is ${testCase.withdrawalType}`,
        async () => {
          await completeWithdrawal({
            signers: {} as Signers,
            starkPublicKey: '',
            token: { type: testCase.withdrawalType } as unknown as AnyToken,
            config,
          });

          expect(completeERC20WithdrawalMock).toBeCalledTimes(
            testCase.callsToWithdrawalERC20,
          );
          expect(completeERC721WithdrawalMock).toBeCalledTimes(
            testCase.callsToWithdrawalERC721,
          );
          expect(completeEthWithdrawalMock).toBeCalledTimes(
            testCase.callsToWithdrawalEth,
          );
        },
      );
    });

    test('should not call withdrawal when withdrawal type is invalid', async () => {
      await completeWithdrawal({
        signers: {} as Signers,
        starkPublicKey: '',
        token: { type: 'ETHS' } as unknown as AnyToken,
        config,
      });

      expect(completeERC20WithdrawalMock).toBeCalledTimes(0);
      expect(completeERC721WithdrawalMock).toBeCalledTimes(0);
      expect(completeEthWithdrawalMock).toBeCalledTimes(0);
    });
  });
});
