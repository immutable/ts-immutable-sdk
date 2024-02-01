/* eslint-disable no-console */
import 'dotenv/config';

// @ts-ignore
import { setupForBridge } from './lib/utils.ts';

// @ts-ignore
import { MULTICALL_ADDRESS, MULTICALL_ABI_ETHERS } from './lib/constants.ts';

import { ethers } from 'ethers';

async function multicall() {

  const params = await setupForBridge();

  const provider = params.rootProvider;

  // Get Multicall contract instance.
  const multicall = new ethers.Contract(MULTICALL_ADDRESS, MULTICALL_ABI_ETHERS, provider);

  type Aggregate3Response = { success: boolean; returnData: string };

  // Define some users.
  const users = [
    '0x8700B87C2A053BDE8Cdc84d5078B4AE47c127FeB',
    '0x9EAB9D856a3a667dc4CD10001D59c679C64756E7',
    '0x78d32460D0a53Ac2678e869Eb6b4f6bA9d2Ef360',
    '0x3B60e31CFC48a9074CD5bEbb26C9EAa77650a43F',
    '0x99FBa19112f221D0B44c9c22241f5e6b2Db715F6',
    '0xE943CA883ef3294E0FC55a1A14591aBeAD1B5927',
    '0x26E3a9c84fdB9b7fE33Dfd5E8D273D016e4e4Fb6',
  ];

  // Setup the contract addresses and interface methods that we'll need.
  const ensRegistryAddr = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
  const ensRegistryInterface = new ethers.Contract(ensRegistryAddr, 
    ['function resolver(bytes32) view returns (address)'],
    provider);
  const resolverInterface = new ethers.Contract(
    ensRegistryAddr,
    ['function name(bytes32) view returns (string)'],
    provider);

  // CALL 1: Get the reverse resolver address for each account.
  // For each address, compute it's reverse resolver namehash.
  const nodes = users.map((addr) => ethers.utils.namehash(addr.substring(2).toLowerCase() + '.addr.reverse'));

  // Prepare the calls to look up each user's resolver address.
  const resolverCalls = nodes.map((node) => ({
    target: ensRegistryAddr,
    allowFailure: true, // We allow failure for all calls.
    callData: ensRegistryInterface.interface.encodeFunctionData('resolver', [node]),
  }));

  // Execute those calls.
  const resolverResults: Aggregate3Response[] = await multicall.callStatic.aggregate3(
    resolverCalls
  );

  // Decode the responses.
  const resolverAddrs = resolverResults.map(({ success, returnData }, i) => {
    if (!success) throw new Error(`Failed to get resolver for ${users[i]}`);
    return ensRegistryInterface.interface.decodeFunctionResult('resolver', returnData)[0];
  });

  // CALL 2: Get the name for each account.
  // First we prepare the calls.
  const nameCalls = resolverAddrs.map((resolverAddr, i) => ({
    target: resolverAddr,
    allowFailure: false, // We allow failure for all calls.
    callData: resolverInterface.interface.encodeFunctionData('name', [nodes[i]]),
  }));

  // Execute those calls.
  const nameResults: Aggregate3Response[] = await multicall.callStatic.aggregate3(nameCalls);

  // Decode the responses.
  const names = nameResults.map(({ success, returnData }, i) => {
    if (!success) throw new Error(`Failed to get name for ${users[i]}`);
    if (returnData === '0x') return users[i]; // If no ENS name, return the address.
    return <string>resolverInterface.interface.decodeFunctionResult('name', returnData)[0];
  });

  // Print the mapping of address to ENS names.
  users.forEach((user, i) => console.log(`${user}: ${names[i]}`));
}

(async () => {
  try {
      await multicall();
      console.log('Exiting successfully');
      return;
  } catch(err) {
      console.error('Exiting with error', err);
      return;
  }
})();