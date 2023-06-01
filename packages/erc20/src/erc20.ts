import { BigNumberish } from '@ethersproject/bignumber';
import { CallOverrides, PopulatedTransaction } from '@ethersproject/contracts';
import { ERC20 as OpenZeppelinERC20, ERC20__factory as OpenZeppelinERC20Factory } from '@imtbl/contracts';
import { PromiseOrValue } from '@imtbl/contracts/src/typechain/types/common';
import { Overrides } from 'ethers';

export class ERC20 {
  private readonly contract: OpenZeppelinERC20;

  constructor(contractAddress: string) {
    const factory = new OpenZeppelinERC20Factory();
    this.contract = factory.attach(contractAddress);
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async totalSupply(overrides?: CallOverrides): Promise<PopulatedTransaction> {
    return this.contract.populateTransaction.totalSupply(overrides);
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async balanceOf(
    account: PromiseOrValue<string>,
    overrides?: CallOverrides,
  ): Promise<PopulatedTransaction> {
    return this.contract.populateTransaction.balanceOf(account, overrides);
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async transfer(
    to: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> },
  ): Promise<PopulatedTransaction> {
    return this.contract.populateTransaction.transfer(to, amount, overrides);
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async allowance(
    owner: PromiseOrValue<string>,
    spender: PromiseOrValue<string>,
    overrides?: CallOverrides,
  ): Promise<PopulatedTransaction> {
    return this.contract.populateTransaction.allowance(owner, spender, overrides);
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async approve(
    spender: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> },
  ): Promise<PopulatedTransaction> {
    return this.contract.populateTransaction.approve(spender, amount, overrides);
  }

  /**
   * @returns a promise that resolves with a populated transaction
   */
  public async transferFrom(
    from: PromiseOrValue<string>,
    to: PromiseOrValue<string>,
    amount: PromiseOrValue<BigNumberish>,
    overrides?: Overrides & { from?: PromiseOrValue<string> },
  ): Promise<PopulatedTransaction> {
    return this.contract.populateTransaction.transferFrom(from, to, amount, overrides);
  }
}
