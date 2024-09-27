import { Contracts } from '@imtbl/x-client';
import { BigNumber } from '@ethersproject/bignumber';
import { getEncodeAssetInfo } from './getEncodeAssetInfo';
import {
  getSignableRegistrationOnchain,
  isRegisteredOnChain,
} from '../registration';
import { completeERC20WithdrawalAction } from './completeERC20Withdrawal';
import {
  generateSigners,
  privateKey1,
  testConfig,
  transactionResponse,
} from '../../test/helpers';

jest.mock('@imtbl/x-client');
jest.mock('@imtbl/toolkit');
jest.mock('../registration');
jest.mock('./getEncodeAssetInfo');

describe('completeERC20Withdrawal action', () => {
  const encodeAssetResponse = {
    asset_id: 'asset-id',
    asset_type: 'asset-type',
  };

  describe('when user is registered on-chain', () => {
    beforeEach(() => {
      jest.restoreAllMocks();
      (getEncodeAssetInfo as jest.Mock).mockResolvedValue(encodeAssetResponse);
      (isRegisteredOnChain as jest.Mock).mockResolvedValue(true);
      (Contracts.CoreV4.connect as jest.Mock).mockReturnValue({
        getWithdrawalBalance: jest.fn().mockReturnValue(BigNumber.from('1000000000000000000')),
      });
      (Contracts.RegistrationV4.connect as jest.Mock).mockReturnValue({
        populateTransaction: {
          withdrawAll: jest.fn().mockResolvedValue(transactionResponse),
        },
      });
    });
    it('should execute withdrawal process for ERC20', async () => {
      const signers = await generateSigners(privateKey1);
      const response = await completeERC20WithdrawalAction({
        ethSigner: signers.ethSigner,
        starkSigner: signers.starkSigner,
        config: testConfig,
        starkPublicKey: '789912305',
        token: {
          type: 'ERC20',
          tokenAddress: '0x12as3',
        },
      });
      await expect(response).toEqual(transactionResponse);
    });
  });

  describe('when user is not registered on-chain', () => {
    beforeEach(() => {
      jest.restoreAllMocks();
      (getEncodeAssetInfo as jest.Mock).mockResolvedValue(encodeAssetResponse);
      (isRegisteredOnChain as jest.Mock).mockResolvedValue(false);
      (getSignableRegistrationOnchain as jest.Mock).mockResolvedValue({
        operator_signature: 'operator-signature',
        payload_hash: 'payload hash',
      });
      (Contracts.CoreV4.connect as jest.Mock).mockReturnValue({
        getWithdrawalBalance: jest.fn().mockReturnValue(BigNumber.from('1000000000000000000')),
      });
      (Contracts.RegistrationV4.connect as jest.Mock).mockReturnValue({
        populateTransaction: {
          registerAndWithdrawAll: jest.fn().mockResolvedValue(transactionResponse),
        },
      });
    });

    it('should execute withdrawal process for ERC20', async () => {
      const signers = await generateSigners(privateKey1);
      const response = await completeERC20WithdrawalAction({
        ethSigner: signers.ethSigner,
        starkSigner: signers.starkSigner,
        config: testConfig,
        starkPublicKey: '789912305',
        token: {
          type: 'ERC20',
          tokenAddress: '0x12as3',
        },
      });
      await expect(response).toEqual(transactionResponse);
    });
  });
});
