import { Environment } from '@imtbl/config';
import { ChainId } from '../../../types';
import { getBridgeFeeEstimate } from './getBridgeFeeEstimate';
import { CheckoutConfiguration } from '../../../config';
import { CheckoutErrorType } from '../../../errors';
import { createBridgeInstance } from '../../../instance';
import { HttpClient } from '../../../api/http';
import { JsonRpcProvider } from 'ethers';

jest.mock('../../../gasEstimate');
jest.mock('../../../instance');

describe('getBridgeFeeEstimate', () => {
  const readOnlyProviders = new Map<ChainId, JsonRpcProvider>([]);
  const mockedHttpClient = new HttpClient() as jest.Mocked<HttpClient>;
  const config = new CheckoutConfiguration({
    baseConfig: { environment: Environment.SANDBOX },
  }, mockedHttpClient);

  it('should return the total fees for the bridge', async () => {
    (createBridgeInstance as jest.Mock).mockReturnValue({
      getFee: jest.fn().mockResolvedValue(
        {
          sourceChainGas: BigInt(1),
          bridgeFee: BigInt(2),
          imtblFee: BigInt(3),
          totalFees: BigInt(4),
        },
      ),
    });

    const bridgeFee = await getBridgeFeeEstimate(
      config,
      readOnlyProviders,
      ChainId.SEPOLIA,
      ChainId.IMTBL_ZKEVM_TESTNET,
    );

    expect(bridgeFee).toEqual(
      {
        sourceChainGas: BigInt(1),
        approvalGas: BigInt(0),
        bridgeFee: BigInt(2),
        imtblFee: BigInt(3),
        totalFees: BigInt(4),
      },
    );
  });

  it('should throw checkout error if gas estimator errors', async () => {
    (createBridgeInstance as jest.Mock).mockReturnValue({
      getFee: jest.fn().mockRejectedValue(new Error('error from gas estimator')),
    });

    let type;
    let data;

    try {
      await getBridgeFeeEstimate(
        config,
        readOnlyProviders,
        ChainId.SEPOLIA,
        ChainId.IMTBL_ZKEVM_TESTNET,
      );
    } catch (err: any) {
      type = err.type;
      data = err.data;
    }

    expect(type).toEqual(CheckoutErrorType.BRIDGE_GAS_ESTIMATE_ERROR);
    expect(data.error).toBeDefined();
  });
});
