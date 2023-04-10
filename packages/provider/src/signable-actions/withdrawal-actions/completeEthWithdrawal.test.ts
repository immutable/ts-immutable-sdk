import { getEncodeAssetInfo } from './getEncodeAssetInfo';
import {
  getSignableRegistrationOnchain,
  isRegisteredOnChain,
} from '../registration';
import { Contracts } from '@imtbl/core-sdk';
import {
  generateSigners,
  privateKey1,
  testConfig,
  transactionResponse,
} from '../../test/helpers';
import { completeEthWithdrawalAction } from './completeEthWithdrawal';

jest.mock('@imtbl/core-sdk');
jest.mock('@imtbl/toolkit');
jest.mock('../registration');
jest.mock('./getEncodeAssetInfo');

describe('completeEthWithdrawal action', () => {
  const encodeAssetResponse = {
    asset_id: 'asset-id',
    asset_type: 'asset-type',
  };

  describe('when user is registered on-chain', () => {
    beforeEach(() => {
      jest.restoreAllMocks();
      (getEncodeAssetInfo as jest.Mock).mockResolvedValue(encodeAssetResponse);
      (isRegisteredOnChain as jest.Mock).mockResolvedValue(true);
      (Contracts.Core.connect as jest.Mock).mockReturnValue({
        populateTransaction: {
          withdraw: jest.fn().mockResolvedValue(transactionResponse),
        },
      });
    });
    it('should execute withdrawal process for ERC20', async () => {
      const signers = await generateSigners(privateKey1);
      const response = await completeEthWithdrawalAction({
        ethSigner: signers.ethSigner,
        config: testConfig,
        starkPublicKey: '789912305',
      });
      await expect(response).toEqual(transactionResponse);
    });
  });

  describe('when user is not registered on-chain', () => {
    beforeEach(() => {
      jest.restoreAllMocks();
      (getEncodeAssetInfo as jest.Mock).mockResolvedValue(encodeAssetResponse);
      (getSignableRegistrationOnchain as jest.Mock).mockResolvedValue({
        operator_signature: 'operator-signature',
        payload_hash: 'payload hash',
      });
      (Contracts.Registration.connect as jest.Mock).mockReturnValue({
        populateTransaction: {
          registerAndWithdraw: jest.fn().mockResolvedValue(transactionResponse),
        },
      });
    });

    it('should execute withdrawal process for ERC20', async () => {
      const signers = await generateSigners(privateKey1);
      const response = await completeEthWithdrawalAction({
        ethSigner: signers.ethSigner,
        config: testConfig,
        starkPublicKey: '789912305',
      });
      await expect(response).toEqual(transactionResponse);
    });
  });
});
