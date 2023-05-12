import { ChainId, Checkout, ConnectionProviders } from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import LoadingButton from './LoadingButton';
import { useEffect, useMemo, useState } from 'react';
import { SuccessMessage, ErrorMessage } from './messages';
import detectEthereumProvider from '@metamask/detect-provider';
import { Environment } from '@imtbl/config';

interface ConnectProps {
  checkout: Checkout;
  setProvider: (provider: Web3Provider) => void;
}

type ProviderType = Map<ChainId, Web3Provider>;

const generateProviders = (provider: any) => {
  const providersMap = new Map();
  providersMap.set(ChainId.GOERLI, new Web3Provider(provider, ChainId.GOERLI));
  providersMap.set(
    ChainId.IMTBL_ZKEVM_DEVNET,
    new Web3Provider(provider, ChainId.IMTBL_ZKEVM_DEVNET)
  );
  return providersMap;
};

export default function Connect(props: ConnectProps) {
  const [mapping, setMapping] = useState<ProviderType | null>(null);

  const checkout = new Checkout({
    baseConfig: { environment: Environment.SANDBOX },
  });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const provider = await detectEthereumProvider();
    provider && setMapping(generateProviders(provider));
  }

  async function guard(chainId: ChainId): Promise<Web3Provider> {
    const provider = mapping!.get(chainId)!;
    try {
      await checkout.switchNetwork({ provider, chainId });
    } catch (err) {
      console.log(err);
    }

    return provider;
  }

  async function connectClick(chainId: ChainId) {
    if (!mapping) return;

    console.log(mapping);

    const res = await mapping.get(chainId)!.send('eth_requestAccounts', []);
    console.log(`${chainId}: `, res);
  }

  async function getNetInfo(chainId: ChainId) {
    if (!mapping) return;

    const provider = await guard(chainId);

    const resA = await checkout.getNetworkInfo({ provider });
    console.log(resA);

    const walletAddress = await provider.getSigner().getAddress();
    const resB = await checkout.getBalance({ provider, walletAddress });
    console.log(resB);
  }

  async function sign(chainId: ChainId) {
    if (!mapping) return;

    const provider = await guard(chainId);
    const resp = await provider
      .getSigner()
      .signMessage(`hello ${chainId} ${(await provider.getNetwork()).chainId}`);
    console.log(resp);
  }

  async function send(chainId: ChainId) {
    if (!mapping) return;

    const provider = await guard(chainId);
    const txRequest = {
      to: '0xDaA1842cF7E43B45385F956b89Ae814C0fE4BD20',
      value: ethers.utils.parseEther('0.0001'),
    };
    const txResponse = await provider.getSigner().sendTransaction(txRequest);
    console.log(txResponse);
    const txReceipt = await provider.waitForTransaction(txResponse.hash);
    console.log(txReceipt);
  }

  return (
    <div>
      <button onClick={() => connectClick(ChainId.GOERLI)}>
        Connect.GOERLI
      </button>
      <button onClick={() => connectClick(ChainId.IMTBL_ZKEVM_DEVNET)}>
        Connect IMTBL_ZKEVM_DEVNET
      </button>
      <button onClick={() => getNetInfo(ChainId.GOERLI)}>Info GOERLI</button>
      <button onClick={() => getNetInfo(ChainId.IMTBL_ZKEVM_DEVNET)}>
        Info IMTBL_ZKEVM_DEVNET
      </button>
      <button onClick={() => sign(ChainId.GOERLI)}>Sign GOERLI</button>
      <button onClick={() => sign(ChainId.IMTBL_ZKEVM_DEVNET)}>
        Sign IMTBL_ZKEVM_DEVNET
      </button>
      <button onClick={() => send(ChainId.GOERLI)}>send GOERLI</button>
      <button onClick={() => send(ChainId.IMTBL_ZKEVM_DEVNET)}>
        send IMTBL_ZKEVM_DEVNET
      </button>
    </div>
  );
}

// const passport = new Passport()
// const provider = passport.getProvider() // ExternalProvider

// const checkout = new Checkout()
// checkout.setProvider(provider)
