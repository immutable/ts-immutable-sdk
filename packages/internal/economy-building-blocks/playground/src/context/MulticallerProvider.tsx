import { createContext, useCallback, useContext } from "react";
import axios from "axios";

export type Call = {
  address: string;
  functionSignature: string,
  functionArgs: string[],
}

export type SignResponse = {
  txData: string;
  multicallerAddress: string;
}

const MulticallerContext = createContext<{
  sign: (gameProjectId: string, reference: string, calls: Call[]) => Promise<SignResponse | undefined>;
}>({
  sign: (_gameProjectId: string, _reference: string, _calls: Call[]) => Promise.resolve(undefined),
});

const multicallerBaseUrl = "https://game-multicaller.dev.imtbl.com";

export function MulticallerProvider({children}: {children: JSX.Element | JSX.Element[]}) {
  const sign = useCallback(async (gameProjectId: string, reference: string, calls: Call[]) => {
    const reqCalls = calls.map((call) => ({
      address: call.address,
      func_signature: call.functionSignature,
      func_args: call.functionArgs,
    }));
    const response = await axios.post(
      `${multicallerBaseUrl}/v1/games/${gameProjectId}/sign`,
      {
        reference: reference,
        calls: reqCalls,
      }
    );
    return { 
      multicallerAddress: response.data.guarded_multicaller_address,
      txData: response.data.tx_data 
    };
  }, []);

  return (
    <MulticallerContext.Provider value={{sign}}>{children}</MulticallerContext.Provider>
  )
};

export function useMulticaller() {
  return useContext(MulticallerContext);
}
