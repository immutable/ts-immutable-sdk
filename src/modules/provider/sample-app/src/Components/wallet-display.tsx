import { AppCtx } from '../context/app-context';
import { Heading } from '@biom3/react';
import { useContext } from 'react';

export const WalletDisplay = () => {
    const { state } = useContext(AppCtx);

    return (
        <>
            {state.address && 
                <>
                    <Heading size='medium'>Wallet</Heading>
                    <p>{!state.address && `Connect your wallet to MetaMask`}</p>
                    <p>{state.address && `Layer 1 address: ${state.address}`}</p>
                </>
            }
        </>
    )
}
