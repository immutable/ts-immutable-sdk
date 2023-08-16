import { createContext, useCallback, useContext, useState } from "react";
import { Web3Provider } from "@ethersproject/providers";
import { ethers } from "ethers";

const MetamaskContext = createContext<{
  mm_connect: () => Promise<void>;
  mm_sendTransaction: (to: string, data: string) => Promise<any>;
  mm_switchNetwork: () => Promise<void>;
}>({
  mm_connect: () => Promise.resolve(),
  mm_sendTransaction: (_to: string, _data: string) =>
    Promise.resolve(undefined),
  mm_switchNetwork: () => Promise.resolve(),
});

export function MetamaskProvider({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) {
  const { ethereum } = window as any;
  const [provider, setProvider] = useState<Web3Provider | undefined>();
  const [address, setAddress] = useState<string | undefined>();

  const mm_connect = useCallback(async () => {
    if (!ethereum) {
      throw new Error("No ethereum provider");
    }

    const _provider = new ethers.providers.Web3Provider(ethereum);
    await _provider.send("eth_requestAccounts", []);
    const _address = await _provider.getSigner().getAddress();
    setProvider(_provider);
    setAddress(_address);

    // if current network chainId is not 13472, switch to 13472
    const chainId = await _provider
      .getNetwork()
      .then((network) => network.chainId);

    if (chainId !== 13472) {
      mm_switchNetwork();
    }
  }, [setProvider, setAddress]);

  const mm_sendTransaction = useCallback(
    async (to: string, data: string) => {
      return provider?.send("eth_sendTransaction", [
        {
          from: address,
          to,
          data,
        },
      ]);
    },
    [provider]
  );

  const mm_switchNetwork = useCallback(async () => {
    if (!ethereum) {
      throw new Error("No ethereum provider");
    }

    const chainId = `0x${(13472).toString(16)}`;

    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }],
    });
  }, [ethereum]);

  return (
    <MetamaskContext.Provider
      value={{
        mm_connect,
        mm_sendTransaction,
        mm_switchNetwork,
      }}
    >
      {children}
    </MetamaskContext.Provider>
  );
}

export function useMetamaskProvider() {
  return useContext(MetamaskContext);
}
