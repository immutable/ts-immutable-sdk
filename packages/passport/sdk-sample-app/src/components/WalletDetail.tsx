import React, { useEffect, useState } from 'react';
import { Accordion } from 'react-bootstrap';
import { utils } from 'ethers';
import { useImmutableProvider } from '@/context/ImmutableProvider';
import { usePassportProvider } from '@/context/PassportProvider';

function WalletDetail() {
  const { imxWalletAddress } = usePassportProvider();
  const [ethBalance, setEthBalance] = useState<string>('0');

  const { coreSdkClient } = useImmutableProvider();

  useEffect(() => {
    const getBalance = async () => {
      if (coreSdkClient && imxWalletAddress) {
        const balances = await coreSdkClient.getBalance({ owner: imxWalletAddress, address: 'ETH' });
        setEthBalance(utils.formatEther(balances.balance));
      }
    };

    getBalance().catch(console.log);
  }, [coreSdkClient, imxWalletAddress]);

  return (
    <Accordion className="pe-0">
      <Accordion.Item eventKey="0" className="p-0">
        <Accordion.Header>Wallet Detail</Accordion.Header>
        <Accordion.Body>
          <ul>
            <li>
              <p>
                Wallet Address:
                { imxWalletAddress }
              </p>
            </li>
            <li>
              <p>
                ETH Balance:
                { ethBalance }
              </p>
            </li>
          </ul>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
}
export default WalletDetail;
