import {
  useAccount, useDisconnect, useEnsName,
} from 'wagmi';
import { useState } from 'react';
import { passportInstance } from '../utils/passport';
import { Button, Table } from '@biom3/react';

export function Account() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({ address });

  // setup the loading state to enable/disable buttons when loading
  const [loading, setLoadingState] = useState<boolean>(false);

  const passportLogout = async () => {
    // disable button while loading
    setLoadingState(true);
    // disconnect Wagmi from Passport
    disconnect();
    // logout from Passport
    await passportInstance.logout();
  };

  // render the view to show the connected accounts and logout
  return (
    <>
      <Button
        className="mb-1"
        onClick={() => passportLogout()}
        disabled={loading}
        type="button"
      >
        Passport Logout
      </Button>
      <Table>
      <Table.Head>
        <Table.Row>
          <Table.Cell>Item</Table.Cell>
          <Table.Cell>Value</Table.Cell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        <Table.Row>
          <Table.Cell><b>Connected Account</b></Table.Cell>
          <Table.Cell>
            {!address && (
              <span>(not&nbsp;connected)</span>
            )
            }
            {address && (
              <span>{ensName ? `${ensName} (${address})` : address}</span>
            )}
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
    </>
  );
}
