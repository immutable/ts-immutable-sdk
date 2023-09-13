import { BigNumber, ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { CheckoutConfiguration, getL1ChainId, getL2ChainId } from '../../../config';
import { ChainId } from '../../../types';
import * as instance from '../../../instance';
import { CheckoutError, CheckoutErrorType } from '../../../errors';
import { INDEXER_ETH_ROOT_CONTRACT_ADDRESS } from './constants';

export const estimateApprovalGas = async (
  config: CheckoutConfiguration,
  readOnlyProviders: Map<ChainId, ethers.providers.JsonRpcProvider>,
  provider: Web3Provider,
  fromChainId: ChainId,
  toChainId: ChainId,
  token: string,
  depositAmount: BigNumber,
): Promise<BigNumber> => {
  try {
    const tokenBridge = await instance.createBridgeInstance(
      fromChainId,
      toChainId,
      readOnlyProviders,
      config,
    );

    const depositorAddress = await provider.getSigner().getAddress();

    const { unsignedTx } = await tokenBridge.getUnsignedApproveDepositBridgeTx({
      depositorAddress,
      token,
      depositAmount,
    });

    if (unsignedTx === null) return BigNumber.from(0);

    return await provider.estimateGas(unsignedTx);
  } catch (err: any) {
    throw new CheckoutError(
      'Error occurred while attempting ot estimate gas for approval transaction',
      CheckoutErrorType.BRIDGE_GAS_ESTIMATE_ERROR,
      { message: err.message },
    );
  }
};

export const estimateGasForBridgeApproval = async (
  config: CheckoutConfiguration,
  readOnlyProviders: Map<ChainId, ethers.providers.JsonRpcProvider>,
  provider: Web3Provider,
  l1Address: string,
  delta: BigNumber,
): Promise<BigNumber> => {
  if (l1Address === INDEXER_ETH_ROOT_CONTRACT_ADDRESS) {
    return BigNumber.from(0); // Native ETH does not require approval
  }

  const fromChainId = getL1ChainId(config);
  const toChainId = getL2ChainId(config);

  return await estimateApprovalGas(
    config,
    readOnlyProviders,
    provider,
    fromChainId,
    toChainId,
    l1Address,
    delta,
  );
};
