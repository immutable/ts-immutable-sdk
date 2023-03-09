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

    test('should call depositERC20() when the type in the paylod is ERC20', async () => {
      deposit({
        signers: {} as Signers,
        deposit: { type: 'ERC20' } as unknown as TokenAmount,
        config: {} as Configuration
      })

      expect(depositERC20Mock).toBeCalledTimes(1)
      expect(depositERC721Mock).toBeCalledTimes(0)
      expect(depositEthMock).toBeCalledTimes(0)
    })

    test('should call depositERC721() when the type in the paylod is ERC721', async () => {
      deposit({
        signers: {} as Signers,
        deposit: { type: 'ERC721' } as unknown as TokenAmount,
        config: {} as Configuration
      })

      expect(depositERC20Mock).toBeCalledTimes(0)
      expect(depositERC721Mock).toBeCalledTimes(1)
      expect(depositEthMock).toBeCalledTimes(0)
    })

    test('should call depositEth() when the type in the paylod is ETH', async () => {
      deposit({
        signers: {} as Signers,
        deposit: { type: 'ETH' } as unknown as TokenAmount,
        config: {} as Configuration
      })

      expect(depositERC20Mock).toBeCalledTimes(0)
      expect(depositERC721Mock).toBeCalledTimes(0)
      expect(depositEthMock).toBeCalledTimes(1)
    })
  })
})
