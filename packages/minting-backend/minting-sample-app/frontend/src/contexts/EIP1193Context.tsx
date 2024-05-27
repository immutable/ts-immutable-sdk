import { createContext, useEffect, useState } from "react";
import { Web3Provider } from "@ethersproject/providers";

export interface EIP1193ContextState {
  provider: Web3Provider | null;
  setProvider: (provider: Web3Provider | null) => void;
  walletAddress: string;
  setWalletAddress: (address: string) => void;
  isPassportProvider: boolean;
}

export const EIP1193Context = createContext<EIP1193ContextState>({
  provider: null,
  setProvider: () => {},
  walletAddress: '',
  setWalletAddress: () => {},
  isPassportProvider: false
});

interface EIP1193ContextProvider {
  children: React.ReactNode;
}
export const EIP1193ContextProvider = ({children}: EIP1193ContextProvider) => {
  const [provider, setProvider] = useState<Web3Provider | null>(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [isPassport, setIsPassport] = useState(false);

  useEffect(() => {
    if(!provider) {
      setWalletAddress('');
      setIsPassport(false);
      return;
    }
    
    const setProviderDetails = async () => {
      const address = await provider?.getSigner().getAddress();
      setWalletAddress(address.toLowerCase());

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setIsPassport((provider?.provider as any)?.isPassport === true);
    }
    setProviderDetails();
  }, [provider]);

  useEffect(() => {
    if(provider && provider.provider) {
      (provider.provider as any)?.on('accountsChanged', (accounts: string[]) => {
        setWalletAddress(accounts.length > 0 ? accounts[0].toLowerCase() : "");
      })
    }
  }, [provider])

  return (
    <EIP1193Context.Provider value={{
      provider, 
      setProvider,
      walletAddress,
      setWalletAddress,
      isPassportProvider: isPassport,
      }}>
      {children}
    </EIP1193Context.Provider>
  )

}


