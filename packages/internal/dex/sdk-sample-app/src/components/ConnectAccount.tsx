import { connectMetamaskWallet } from "@/utils/connectMetamask";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

type ConnectAccountProps = {
    setAccount: Dispatch<SetStateAction<string | null>>
}

export const ConnectAccount = (props: ConnectAccountProps) => {
    const [isMetamaskInstalled, setIsMetamaskInstalled] = useState<boolean>(false);

    useEffect(() => {
        if ((window as any).ethereum) {
          // Check if Metamask wallet is installed
          setIsMetamaskInstalled(true);
        }
      }, []);

    return (
        <div className="App App-header">
          {isMetamaskInstalled ? (
            <div>
              <button
                className="disabled:opacity-50 mt-2 py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
                onClick={async () => props.setAccount(await connectMetamaskWallet())}
              >
                Connect Your Metamask Wallet
              </button>
            </div>
          ) : (
            <p>This sample app uses Metamask. To continue, please install Metamask.</p>
          )}
        </div>
      );
}