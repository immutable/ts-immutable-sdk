import { ethers } from 'ethers';
import { BytesLike, Deferrable, isBytesLike } from 'ethers/lib/utils';
import { TransactionRequest } from '@ethersproject/abstract-provider';
import { Interface } from '@ethersproject/abi';
import { Multicall__factory } from 'contracts/types';

export class MockProvider extends ethers.providers.BaseProvider {
  mockedContracts: Map<string, Map<ethers.BytesLike, jest.Mock>>;

  constructor() {
    super(0);
    this.mockedContracts = new Map<string, Map<ethers.BytesLike, jest.Mock>>();
  }

  async detectNetwork(): Promise<ethers.providers.Network> {
    return {
      name: 'Mock',
      chainId: 0,
    };
  }

  async call(transaction: Deferrable<TransactionRequest>): Promise<string> {
    const address = await transaction.to;
    if (!address) throw new Error('no contract address');

    const contract = this.mockedContracts.get(address);
    if (!contract) throw new Error('no mock contract deployed at ' + address);

    if (isBytesLike(transaction.data)) {
      const fnSig = transaction.data.toString().substring(0, 10);
      const result = contract.get(fnSig);
      if (typeof result !== 'undefined') return result();
      throw new Error('data not mocked for fn ' + fnSig);
    }

    throw new Error('invalid transaction data');
  }

  mock<I extends Interface>(
    address: string,
    iface: I,
    fn: Parameters<I['getFunction']>[0],
    result: readonly any[]
  ) {
    const fullFnSig = iface.getFunction(fn).format();
    const fnSig = ethers.utils.id(fullFnSig).substring(0, 10);
    const contract =
      this.mockedContracts.get(address) ?? new Map<BytesLike, jest.Mock>();

    const resultStr = iface.encodeFunctionResult(fn, result);

    const mockFn = jest.fn().mockReturnValue(resultStr);

    contract.set(fnSig, mockFn);
    this.mockedContracts.set(address, contract);
  }

  mockOnce<I extends Interface>(
    address: string,
    iface: I,
    fn: Parameters<I['getFunction']>[0],
    result: readonly any[]
  ) {
    const fullFnSig = iface.getFunction(fn).format();
    const fnSig = ethers.utils.id(fullFnSig).substring(0, 10);
    const contract =
      this.mockedContracts.get(address) ?? new Map<BytesLike, jest.Mock>();

    const resultStr = iface.encodeFunctionResult(fn, result);

    const mockFn = contract.get(fnSig) ?? jest.fn();
    mockFn.mockReturnValueOnce(resultStr);

    contract.set(fnSig, mockFn);
    this.mockedContracts.set(address, contract);
  }
}
