'use client';

import { useState, useEffect } from 'react';
import { ERC721PermissionedMintable } from '@imtbl/erc721-permissioned-mintable';

const CONTRACT_ADDRESS = '0x9A48B1B27743d807331d06eCF0bFb15c06fDb58D';

// with popoulated transaction
// { "data": "0xa217fddf", "to": "0x9A48B1B27743d807331d06eCF0bFb15c06fDb58D" }

// with direct function execution
//

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
      // Contract interface instance

      const contract = new ERC721PermissionedMintable(CONTRACT_ADDRESS);
      try {
        //
        const response = await contract.DEFAULT_ADMIN_ROLE();
        console.log('response', response);

        setState({
          isLoading: false,
          contract,
          response: JSON.stringify(response, null, 2),
        });
      } catch (error) {
        setState({
          isLoading: false,
          contract,
          response: JSON.stringify(error, null, 2),
        });
      }
    }
    fn();
  }, []);

  return (
    <div>
      {state.isLoading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <h1>ERC721PermissionedMintable</h1>
          <code>{state.response}</code>
        </div>
      )}
    </div>
  );
}
