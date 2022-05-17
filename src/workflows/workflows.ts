import {
  DepositsApi,
  EncodingApi,
  MintsApi,
  TokensApi,
  UsersApi,
  TransfersApi,
  TransfersApiGetTransferRequest, WithdrawalsApi, SignableToken,
} from '../api';
import { Signer } from '@ethersproject/abstract-signer';
import {
  isRegisteredOnChainWorkflow,
  registerOffchainWorkflow,
} from './registration';
import { mintingWorkflow } from './minting';
import { transfersWorkflow, batchTransfersWorkflow } from './transfers';
import {
  depositERC20Workflow,
  depositERC721Workflow,
  depositEthWorkflow,
} from './deposit';
import { burnWorkflow, getBurnWorkflow } from './burn';
import {
  UnsignedMintRequest,
  UnsignedTransferRequest,
  UnsignedBatchNftTransferRequest,
  ERC20Deposit,
  ERC721Deposit,
  ETHDeposit,
  TokenDeposit,
  TokenType,
  UnsignedBurnRequest,
  Config, MintableERC721Withdrawal, ERC721Withdrawal, ERC20Withdrawal,
} from '../types';
import { Core__factory } from '../contracts';
import {
  completeERC20WithdrawalWorfklow,
  completeERC721WithdrawalWorfklow,
  completeETHWithdrawalWorkflow,
  completeMintableERC721WithdrawalWorfklow,
  prepareWithdrawalWorkflow,
} from './withdrawals';

export class Workflows {
  private readonly usersApi: UsersApi;
  private readonly mintsApi: MintsApi;
  private readonly transfersApi: TransfersApi;
  private readonly depositsApi: DepositsApi;
  private readonly tokensApi: TokensApi;
  private readonly encodingApi: EncodingApi;
  private readonly withdrawalsAPI: WithdrawalsApi;

  constructor(protected config: Config) {
    this.config = config;
    this.usersApi = new UsersApi(config.api);
    this.mintsApi = new MintsApi(config.api);
    this.transfersApi = new TransfersApi(config.api);
    this.usersApi = new UsersApi(config.api);
    this.mintsApi = new MintsApi(config.api);
    this.depositsApi = new DepositsApi(config.api);
    this.tokensApi = new TokensApi(config.api);
    this.encodingApi = new EncodingApi(config.api);
    this.withdrawalsAPI = new WithdrawalsApi(config.api);
  }

  public registerOffchain(signer: Signer) {
    return registerOffchainWorkflow(signer, this.usersApi);
  }

  public isRegisteredOnchain(signer: Signer) {
    // Get instance of contract
    const coreContract = Core__factory.connect(
      this.config.starkContractAddress,
      signer,
    );

    return isRegisteredOnChainWorkflow(signer, coreContract);
  }

  public mint(signer: Signer, request: UnsignedMintRequest) {
    return mintingWorkflow(signer, request, this.mintsApi);
  }

  public transfer(signer: Signer, request: UnsignedTransferRequest) {
    return transfersWorkflow(signer, request, this.transfersApi);
  }

  public batchNftTransfer(
    signer: Signer,
    request: UnsignedBatchNftTransferRequest,
  ) {
    return batchTransfersWorkflow(signer, request, this.transfersApi);
  }

  public burn(signer: Signer, request: UnsignedBurnRequest) {
    return burnWorkflow(signer, request, this.transfersApi);
  }

  public deposit(signer: Signer, deposit: TokenDeposit) {
    // Get instance of contract
    const coreContract = Core__factory.connect(
      this.config.starkContractAddress,
      signer,
    );

    switch (deposit.type) {
      case TokenType.ETH:
        return depositEthWorkflow(
          signer,
          deposit,
          this.depositsApi,
          this.usersApi,
          this.encodingApi,
          coreContract,
        );
      case TokenType.ERC20:
        return depositERC20Workflow(
          signer,
          deposit,
          this.depositsApi,
          this.usersApi,
          this.tokensApi,
          this.encodingApi,
          coreContract,
          this.config,
        );
      case TokenType.ERC721:
        return depositERC721Workflow(
          signer,
          deposit,
          this.depositsApi,
          this.usersApi,
          this.encodingApi,
          coreContract,
          this.config,
        );
    }
  }

  public depositEth(signer: Signer, deposit: ETHDeposit) {
    // Get instance of contract
    const coreContract = Core__factory.connect(
      this.config.starkContractAddress,
      signer,
    );

    return depositEthWorkflow(
      signer,
      deposit,
      this.depositsApi,
      this.usersApi,
      this.encodingApi,
      coreContract,
    );
  }

  public getBurn(request: TransfersApiGetTransferRequest) {
    return getBurnWorkflow(request, this.transfersApi);
  }

  public depositERC20(signer: Signer, deposit: ERC20Deposit) {
    // Get instance of contract
    const coreContract = Core__factory.connect(
      this.config.starkContractAddress,
      signer,
    );

    return depositERC20Workflow(
      signer,
      deposit,
      this.depositsApi,
      this.usersApi,
      this.tokensApi,
      this.encodingApi,
      coreContract,
      this.config,
    );
  }

  public depositERC721(signer: Signer, deposit: ERC721Deposit) {
    // Get instance of contract
    const coreContract = Core__factory.connect(
      this.config.starkContractAddress,
      signer,
    );

    return depositERC721Workflow(
      signer,
      deposit,
      this.depositsApi,
      this.usersApi,
      this.encodingApi,
      coreContract,
      this.config,
    );
  }

  public prepareWithdrawal(signer: Signer, token: SignableToken, quantity: string) {
    return prepareWithdrawalWorkflow(signer, token, quantity, this.withdrawalsAPI);
  }

  public async completeETHWithdrawal(signer: Signer, starkPublicKey: string) {
    const coreContract = Core__factory.connect(
      this.config.starkContractAddress,
      signer,
    );
    const isRegisteredStark = await coreContract.getEthKey(starkPublicKey).then((result) => result !== '');
    if(isRegisteredStark) {
      return completeETHWithdrawalWorkflow(signer, starkPublicKey, coreContract, this.encodingApi);
    } else {
      throw new Error('user is not registered. Workflow not yet implemented')
    }
  }

  public async completeERC20Withdrawal(signer: Signer, starkPublicKey: string, token: ERC20Withdrawal) {
    const coreContract = Core__factory.connect(
      this.config.starkContractAddress,
      signer,
    );
    const isRegisteredStark = await coreContract.getEthKey(starkPublicKey).then((result) => result !== '');
    if(isRegisteredStark) {
      return completeERC20WithdrawalWorfklow(signer, starkPublicKey, token, coreContract, this.encodingApi);
    } else {
      throw new Error('user is not registered. Workflow not yet implemented')
    }
  }

  public async completeMintableERC721Withdrawal(signer: Signer, starkPublicKey: string, token: MintableERC721Withdrawal) {
    const coreContract = Core__factory.connect(
      this.config.starkContractAddress,
      signer,
    );
    const isRegisteredStark = await coreContract.getEthKey(starkPublicKey).then((result) => result !== '');
    if(isRegisteredStark) {
      return completeMintableERC721WithdrawalWorfklow(signer, starkPublicKey, token, coreContract, this.encodingApi);
    } else {
      throw new Error('user is not registered. Workflow not yet implemented')
    }
  }

  public async completeERC721Withdrawal(signer: Signer, starkPublicKey: string, token: ERC721Withdrawal) {
    const coreContract = Core__factory.connect(
      this.config.starkContractAddress,
      signer,
    );
    const isRegisteredStark = await coreContract.getEthKey(starkPublicKey).then((result) => result !== '');
    if(isRegisteredStark) {
      return completeERC721WithdrawalWorfklow(signer, starkPublicKey, token, coreContract, this.encodingApi);
    } else {
      throw new Error('user is not registered. Workflow not yet implemented')
    }
  }
}
