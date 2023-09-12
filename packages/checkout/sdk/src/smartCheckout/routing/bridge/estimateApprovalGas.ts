import { BigNumber, ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { CheckoutConfiguration, getL1ChainId, getL2ChainId } from '../../../config';
import { ChainId, ItemType } from '../../../types';
import * as instance from '../../../instance';
import { BalanceRequirement } from '../../balanceCheck/types';
import { CheckoutError, CheckoutErrorType } from '../../../errors';

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
  balanceRequirement: BalanceRequirement,
): Promise<BigNumber> => {
  if (balanceRequirement.type === ItemType.NATIVE) {
    return BigNumber.from(0); // Native tokens don't require approval
  }

  if (balanceRequirement.type === ItemType.ERC721) {
    throw new CheckoutError(
      'Cannot estimate approval gas on bridge for an ERC721',
      CheckoutErrorType.BRIDGE_GAS_ESTIMATE_ERROR,
    );
  }

  if (!balanceRequirement.required.token.address) {
    throw new CheckoutError(
      'Cannot estimate approval gas on bridge for an ERC20 without an address',
      CheckoutErrorType.BRIDGE_GAS_ESTIMATE_ERROR,
    );
  }

  const fromChainId = getL1ChainId(config);
  const toChainId = getL2ChainId(config);

  return await estimateApprovalGas(
    config,
    readOnlyProviders,
    provider,
    fromChainId,
    toChainId,
    balanceRequirement.required.token.address,
    balanceRequirement.delta.balance,
  );
};
