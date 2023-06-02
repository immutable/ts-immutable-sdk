'use client';

import { useState, useEffect } from 'react';
import { ERC721PermissionedMintable } from '@imtbl/erc721-permissioned-mintable';

const CONTRACT_ADDRESS = '0x9A48B1B27743d807331d06eCF0bFb15c06fDb58D';

interface State {
  isLoading: Boolean;
  contract: ERC721PermissionedMintable | null;
  response: string;
}

export default function ERC721PermissionedMintablePage() {
  const [state, setState] = useState<State>({
    isLoading: true,
    contract: null,
    response: '',
  });

  useEffect(() => {
    async function fn() {
      const contract = new ERC721PermissionedMintable(CONTRACT_ADDRESS);

      const response = await contract.DEFAULT_ADMIN_ROLE();

      setState({
        isLoading: false,
        contract,
        response: JSON.stringify(response, null, 2),
      });
    }
    fn();
  }, []);

  return (
    <div>
      {state.isLoading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <h1>ERC721PernmissionedMintable</h1>
          <code>{state.response}</code>
        </div>
      )}
    </div>
  );
}
