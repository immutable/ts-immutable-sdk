import { BridgeConfiguration } from 'config';
import { ethers } from 'ethers';
import {
  ApproveBridgeRequest,
  ApproveBridgeResponse,
  BridgeDepositRequest,
  BridgeDepositResponse,
  BridgeFeeRequest,
  BridgeFeeResponse,
  FungibleToken,
} from 'types';
import { RootERC20Predicate } from 'contracts/ABIs/RootERC20Predicate';
import { ERC20 } from 'contracts/ABIs/ERC20';
import { BridgeError, BridgeErrorType, withBridgeError } from 'errors';

export class TokenBridge {
  private config: BridgeConfiguration;

  constructor(config: BridgeConfiguration) {
    this.config = config;
  }

  public async getFee(req: BridgeFeeRequest): Promise<BridgeFeeResponse> {
    if (!ethers.utils.isAddress(req.token)) {
      throw new BridgeError(
        `token address ${req.token} is not a valid address`,
        BridgeErrorType.INVALID_ADDRESS
      );
    }
    return {
      bridgeable: true,
      feeAmount: await this.getFeeForToken(req.token),
    };
  }

  public async getUnsignedDepositTx(
    req: BridgeDepositRequest
  ): Promise<BridgeDepositResponse> {
    if (req.token === 'NATIVE') {
      throw new BridgeError(
        'native token deposit is not yet supported',
        BridgeErrorType.UNSUPPORTED_ERROR
      );
    }

    if (!ethers.utils.isAddress(req.depositorAddress)) {
      throw new BridgeError(
        `depositor address ${req.depositorAddress} is not a valid address`,
        BridgeErrorType.INVALID_ADDRESS
      );
    }

    if (!ethers.utils.isAddress(req.recipientAddress)) {
      throw new BridgeError(
        `recipient address ${req.recipientAddress} is not a valid address`,
        BridgeErrorType.INVALID_ADDRESS
      );
    }

    // If the token is ERC20, the address must be valid
    if (req.token !== 'NATIVE' && !ethers.utils.isAddress(req.token)) {
      throw new BridgeError(
        `token address ${req.token} is not a valid address`,
        BridgeErrorType.INVALID_ADDRESS
      );
    }
    // The deposit amount cannot be <= 0
    if (req.depositAmount.isNegative() || req.depositAmount.isZero()) {
      throw new BridgeError(
        `deposit amount ${req.depositAmount.toString()} is invalid`,
        BridgeErrorType.INVALID_AMOUNT
      );
    }

    // Convert the addresses to correct format addresses (e.g. prepend 0x if not already)
    const depositor = ethers.utils.getAddress(req.depositorAddress);
    const receipient = ethers.utils.getAddress(req.recipientAddress);
    const token = ethers.utils.getAddress(req.token);

    const rootERC20PredicateContract = await withBridgeError<ethers.Contract>(
      async () => {
        const rootERC20PredicateContract = new ethers.Contract(
          this.config.bridgeContracts.rootChainERC20Predicate,
          RootERC20Predicate
        );
        return rootERC20PredicateContract;
      },
      BridgeErrorType.INTERNAL_ERROR
    );

    // Encode the function data into a payload
    const data = await withBridgeError<string>(async () => {
      return rootERC20PredicateContract.interface.encodeFunctionData(
        'depositTo',
        [token, receipient, req.depositAmount]
      );
    }, BridgeErrorType.INTERNAL_ERROR);

    return {
      unsignedTx: {
        data: data,
        to: this.config.bridgeContracts.rootChainERC20Predicate,
        value: 0,
        from: depositor,
      },
    };
  }

  public async getUnsignedApproveBridgeTx(
    req: ApproveBridgeRequest
  ): Promise<ApproveBridgeResponse> {
    // If the token is NATIVE, no approval is required
    if (req.token === 'NATIVE') {
      // When native tokens are supported, change this to return required: false
      throw new BridgeError(
        'native token deposit is not yet supported',
        BridgeErrorType.UNSUPPORTED_ERROR
      );
    }

    if (!ethers.utils.isAddress(req.depositorAddress)) {
      throw new BridgeError(
        `depositor address ${req.depositorAddress} is not a valid address`,
        BridgeErrorType.INVALID_ADDRESS
      );
    }

    // If the token is ERC20, the address must be valid
    if (req.token !== 'NATIVE' && !ethers.utils.isAddress(req.token)) {
      throw new BridgeError(
        `token address ${req.token} is not a valid address`,
        BridgeErrorType.INVALID_ADDRESS
      );
    }

    // The deposit amount cannot be <= 0
    if (req.depositAmount.isNegative() || req.depositAmount.isZero()) {
      throw new BridgeError(
        `deposit amount ${req.depositAmount.toString()} is invalid`,
        BridgeErrorType.INVALID_AMOUNT
      );
    }

    const erc20Contract: ethers.Contract =
      await withBridgeError<ethers.Contract>(async () => {
        return new ethers.Contract(req.token, ERC20, this.config.rootProvider);
      }, BridgeErrorType.INTERNAL_ERROR);

    // Get the current approved allowance of the RootERC20Predicate
    const rootERC20PredicateAllowance: ethers.BigNumber =
      await withBridgeError<ethers.BigNumber>(async () => {
        return await erc20Contract.allowance(
          req.depositorAddress,
          this.config.bridgeContracts.rootChainERC20Predicate
        );
      }, BridgeErrorType.PROVIDER_ERROR);

    // If the allowance is greater than or equal to the deposit amount, no approval is required
    if (rootERC20PredicateAllowance.gte(req.depositAmount)) {
      return {
        unsignedTx: null,
        required: false,
      };
    }
    // Calculate the amount of tokens that need to be approved for deposit
    const approvalAmountRequired = req.depositAmount.sub(
      rootERC20PredicateAllowance
    );

    // Encode the approve function call data for the ERC20 contract
    const data: string = await withBridgeError<string>(async () => {
      return erc20Contract.interface.encodeFunctionData('approve', [
        this.config.bridgeContracts.rootChainERC20Predicate,
        approvalAmountRequired,
      ]);
    }, BridgeErrorType.INTERNAL_ERROR);

    // Create the unsigned transaction for the approval
    const unsignedTx: ethers.providers.TransactionRequest = {
      data: data,
      to: req.token,
      value: 0,
      from: req.depositorAddress,
    };

    return {
      unsignedTx: unsignedTx,
      required: true,
    };
  }

  private async getFeeForToken(
    token: FungibleToken
  ): Promise<ethers.BigNumber> {
    return ethers.BigNumber.from(0);
  }
}
