import { ethers } from 'ethers';
import { BytesLike, Deferrable, isBytesLike } from 'ethers/lib/utils';
import { TransactionRequest } from '@ethersproject/abstract-provider';

export class MockProvider extends ethers.providers.BaseProvider {
  mockedContracts: Map<string, Map<ethers.BytesLike, string>>;

  constructor() {
    super(0);
    this.mockedContracts = new Map<string, Map<ethers.BytesLike, string>>();
  }

  async detectNetwork(): Promise<ethers.providers.Network> {
    return {
      name: 'Mock',
      chainId: 0,
    };
  }

  async call(transaction: Deferrable<TransactionRequest>): Promise<string> {
    console.log(transaction);
    const address = await transaction.to;
    if (!address) throw new Error('no contract address');

    const contract = this.mockedContracts.get(address);
    if (!contract) throw new Error('no mock contract deployed at ' + address);

    if (isBytesLike(transaction.data)) {
      const result = contract.get(transaction.data.toString().substring(0, 10));
      console.log({ result });
      if (typeof result !== 'undefined') return result;
      throw new Error(
        'data not mocked for fn ' + transaction.data.toString().substring(0, 10)
      );
    }

    throw new Error('invalid transaction data');
  }

  mock(address: string, fn: string, result: string) {
    const fnSig = ethers.utils.id(fn).substring(0, 10);
    console.log({ id: ethers.utils.id(fn), short: fnSig });
    const contract =
      this.mockedContracts.get(address) ?? new Map<BytesLike, string>();
    contract.set(fnSig, result);
    this.mockedContracts.set(address, contract);
  }
}
