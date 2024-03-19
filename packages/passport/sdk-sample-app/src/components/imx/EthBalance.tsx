import { Alert, Spinner } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import { utils } from 'ethers';
import { usePassportProvider } from '@/context/PassportProvider';
import { useImmutableProvider } from '@/context/ImmutableProvider';

function EthBalance() {
  const [ethBalance, setEthBalance] = useState<string>('0');
  const [loadingBalance, setLoadingBalance] = useState<boolean>(true);

  const { imxProvider } = usePassportProvider();
  const { sdkClient } = useImmutableProvider();

  useEffect(() => {
    const getEthBalance = async () => {
      const owner = await imxProvider?.getAddress() || '';
      const balances = await sdkClient.getBalance({ owner, address: 'ETH' });
      setEthBalance(utils.formatEther(balances.balance));
      setLoadingBalance(false);
    };

    getEthBalance().catch(console.error);
  }, [sdkClient, imxProvider]);

  return (
    <Alert variant="info">
      Eth Balance:
      {' '}
      { loadingBalance ? <Spinner size="sm" /> : ethBalance }
    </Alert>
  );
}

export default EthBalance;
