import { Configuration } from "config";
import { deposit } from "./deposit";
import * as depositActions from './deposit-actions';
import { Signers } from "./types";
import { TokenAmount } from "types";


jest.mock('@imtbl/core-sdk')
jest.mock('./deposit-actions')

describe('deposit', () => {
  describe('deposit()', () => {
    let depositERC721Mock: jest.Mock;
    let depositERC20Mock: jest.Mock;
    let depositEthMock: jest.Mock;

    beforeEach(() => {
      jest.restoreAllMocks();

      depositERC721Mock = jest.fn();
      depositERC20Mock = jest.fn();
      depositEthMock = jest.fn();

      (depositActions.depositERC20 as jest.Mock).mockImplementation(depositERC20Mock);
      (depositActions.depositERC721 as jest.Mock).mockImplementation(depositERC721Mock);
      (depositActions.depositEth as jest.Mock).mockImplementation(depositEthMock);
    })

      const testCases = [
        {depositType:"ERC20", callsToDepositEth:0, callsToDepositERC20:1, callsToDepositERC721:0},
        {depositType:"ETH", callsToDepositEth:1, callsToDepositERC20:0, callsToDepositERC721:0},
        {depositType:"ERC721", callsToDepositEth:0, callsToDepositERC20:0, callsToDepositERC721:1},
      ];


      testCases.forEach((testCase) => {
        test(`should call deposit${testCase.depositType}() when the type in the paylod is ${testCase.depositType}`, async () => {
          await deposit({
            signers: {} as Signers,
            deposit: { type: testCase.depositType } as unknown as TokenAmount,
            config: {} as Configuration
          });

          expect(depositERC20Mock).toBeCalledTimes(testCase.callsToDepositERC20);
          expect(depositERC721Mock).toBeCalledTimes(testCase.callsToDepositERC721);
          expect(depositEthMock).toBeCalledTimes(testCase.callsToDepositEth);
        });
      });

    test('should not call deposit when deposit type is invalid', async () => {
      await deposit({
        signers: {} as Signers,
        deposit: { type: 'ETHS' } as unknown as TokenAmount,
        config: {} as Configuration
      })

      expect(depositERC20Mock).toBeCalledTimes(0)
      expect(depositERC721Mock).toBeCalledTimes(0)
      expect(depositEthMock).toBeCalledTimes(0)
    });

  })
})
