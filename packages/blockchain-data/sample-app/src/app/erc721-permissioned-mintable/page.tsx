'use client';

import { useState, useEffect } from 'react';
import { getDefaultProvider, Wallet } from 'ethers';
import { ERC721PermissionedMintable } from '@imtbl/erc721-permissioned-mintable';

import { PageLayout } from '@/components/PageLayout';
import { Provider, TransactionResponse } from '@ethersproject/providers';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
const PRIVATE_KEY = process.env.NEXT_PUBLIC_PRIVATE_KEY!;

interface State {
  isLoading: Boolean;
  contract: ERC721PermissionedMintable | null;
  name: string;
  provider: Provider | null;
}

export default function ERC721PermissionedMintablePage() {
  const [state, setState] = useState<State>({
    isLoading: true,
    contract: null,
    name: '',
    provider: null,
  });

  const [result, setResult] = useState<TransactionResponse | null>(null);

  useEffect(() => {
    async function fn() {
      // Contract interface instance
      const contract = new ERC721PermissionedMintable(CONTRACT_ADDRESS);
      const provider = getDefaultProvider('sepolia');

      try {
        const name = await contract.name(provider);

        setState({
          isLoading: false,
          contract,
          name,
          provider,
        });
      } catch (error) {
        setState({
          isLoading: false,
          contract,
          name: '',
          provider: null,
        });
      }
    }
    fn();
  }, []);

  const mint = async () => {
    if (state.contract === null) return;
    if (state.provider === null) return;

    const wallet = new Wallet(PRIVATE_KEY, state.provider);

    // We can use the read function hasRole to check if the intended signer
    // has sufficient permissions to mint before we send the transaction
    const minterRole = await state.contract.MINTER_ROLE(state.provider);

    const hasMinterRole = await state.contract.hasRole(
      state.provider,
      minterRole,
      wallet.address,
    );

    if (!hasMinterRole) {
      // Handle scenario
      console.log('Account doesnt have permissions to mint.');
      return;
    }

    // Specify who we want to recieve the minted token
    // In this case we are minting a token
    const recipient = wallet.address;

    // Rather than be executed directly, write functions on the SDK client are returned
    // as populated transactions so that users can implement their own transaction signing logic.
    const populatedTransaction = await state.contract.populateMint(
      recipient,
      1,
    );

    const result: TransactionResponse = await wallet.sendTransaction(
      populatedTransaction,
    );

    setResult(result);
  };

  return (
    <PageLayout>
      <div className="my-4">
        {state.isLoading ? (
          <p>Loading...</p>
        ) : (
          <div>
            <div>
              <h1 className={`text-xs tracking-wider font-mono mb-1`}>
                ERC721PermissionedMintable
              </h1>
              <h1 className={`text-xl font-bold`}>{state.name}</h1>
            </div>
            <div className="my-4">
              <button
                className="cursor-pointer dark:bg-neutral-700/90 hover:dark:bg-neutral-600/90 rounded-md p-2 font-semibold"
                onClick={mint}
              >
                Mint token
              </button>
            </div>
            {result && (
              <p>
                Token has been minted. Click{' '}
                <a
                  className="cursor-pointer underline"
                  href={`https://sepolia.etherscan.io/tx/${result.hash}`}
                  target="_blank"
                >
                  here
                </a>{' '}
                to view.
              </p>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
