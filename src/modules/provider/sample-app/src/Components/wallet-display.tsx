import { useContext } from 'react';
import { AppCtx } from '../Context/app-context';
import { Heading } from '@biom3/react';

export const WalletDisplay = () => {
    const { state } = useContext(AppCtx);

    return (
        <>
            <Heading size='medium'>Sign a message</Heading>
            <p>{!state.layer1address && `Connect your wallet to MetaMask`}</p>
            <p>{state.layer1address && `Layer 1 address: ${state.layer1address}`}</p>
            <p>{state.layer2address && `Layer 2 address: ${state.layer2address}`}</p>
        </>
    )
}