import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { ethers } from 'ethers';

const MetamaskContext = createContext<{
  mm_connect: () => Promise<void>;
  mm_sendTransaction: (to: string, data: string) => Promise<any>;
  mm_switchNetwork: () => Promise<void>;
  mm_loading: boolean;
  address: string;
  provider: Web3Provider | undefined;
}>({
  mm_connect: () => Promise.resolve(),
  mm_sendTransaction: (_to: string, _data: string) =>
    Promise.resolve(undefined),
  mm_switchNetwork: () => Promise.resolve(),
  mm_loading: false,
  address: '',
  provider: undefined,
});

export function MetamaskProvider({
  children,
  connectOnMount = true,
}: {
  children: JSX.Element | JSX.Element[];
  connectOnMount?: boolean;
}) {
  const { ethereum } = window as any;
  const [provider, setProvider] = useState<Web3Provider | undefined>();
  const [address, setAddress] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const mm_connect = useCallback(async () => {
    try {
      if (!ethereum) {
        throw new Error('No ethereum provider');
      }

      setLoading(true);
      const _provider = new ethers.providers.Web3Provider(ethereum);
      await _provider.send('eth_requestAccounts', []);

      const _address = await _provider.getSigner().getAddress();
      setProvider(_provider);
      setAddress(_address);

      const chainId = await _provider
        .getNetwork()
        .then((network) => network.chainId);

      if (chainId !== 13472) {
        await mm_switchNetwork();
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  }, [setProvider, setAddress]);

  const mm_sendTransaction = useCallback(
    async (to: string, data: string) => {
      try {
        if (!provider) {
          mm_connect();
        }

        setLoading(true);

        const result = await provider?.send('eth_sendTransaction', [
          {
            from: address,
            to,
            data,
          },
        ]);

        setLoading(false);

        return result;
      } catch (error) {
        setLoading(false);
      }
    },
    [provider]
  );

  const mm_switchNetwork = useCallback(async () => {
    try {
      if (!ethereum) {
        throw new Error('No ethereum provider');
      }

      const chainId = `0x${(13472).toString(16)}`;

      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
    } catch (error) {
      setLoading(false);
    }
  }, [ethereum]);

  useEffect(() => {
    if (connectOnMount) {
      mm_connect();
    }
  }, []);

  return (
    <MetamaskContext.Provider
      value={{
        mm_connect,
        mm_sendTransaction,
        mm_switchNetwork,
        mm_loading: loading,
        address: address || '',
        provider: provider || undefined,
      }}
    >
      {children}
    </MetamaskContext.Provider>
  );
}

export function useMetamaskProvider() {
  return useContext(MetamaskContext);
}
