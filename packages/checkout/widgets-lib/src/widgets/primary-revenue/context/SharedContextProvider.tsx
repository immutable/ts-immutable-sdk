import {
  useContext,
  createContext,
  useMemo,
  ReactNode,
  useEffect,
  useState,
} from 'react';

import { PrimaryRevenueSuccess } from '@imtbl/checkout-widgets';

import { Item, PaymentTypes, SignResponse } from '../types';
import { useSignOrder } from '../hooks/useSignOrder';
import { ConnectLoaderState } from '../../../context/connect-loader-context/ConnectLoaderContext';
import { StrongCheckoutWidgetsConfig } from '../../../lib/withDefaultWidgetConfig';

type SharedContextProps = {
  config: StrongCheckoutWidgetsConfig;
  env: string;
  environmentId: string;
  items: Item[];
  amount: string;
  fromContractAddress: string;
  provider: ConnectLoaderState['provider'];
  checkout: ConnectLoaderState['checkout'];
};

type SharedContextValues = SharedContextProps & {
  sign: (paymentType: PaymentTypes) => Promise<SignResponse | undefined>;
  execute: () => Promise<PrimaryRevenueSuccess>;
  recipientAddress: string;
  signResponse: SignResponse | undefined;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const SharedContext = createContext<SharedContextValues>({
  items: [],
  amount: '',
  fromContractAddress: '',
  provider: undefined,
  checkout: undefined,
  environmentId: '',
  env: '',
  recipientAddress: '',
  sign: () => Promise.resolve(undefined),
  execute: () => Promise.resolve({} as PrimaryRevenueSuccess),
  signResponse: undefined,
  config: {} as StrongCheckoutWidgetsConfig,
});

SharedContext.displayName = 'PrimaryRevenueSharedContext';

export function SharedContextProvider(props: {
  children: ReactNode;
  value: SharedContextProps;
}) {
  const {
    children,
    value: {
      config,
      env,
      environmentId,
      items,
      amount,
      fromContractAddress,
      provider,
      checkout,
    },
  } = props;

  const [recipientAddress, setRecipientAddress] = useState<string>('');

  // Get recipient address
  useEffect(() => {
    const getRecipientAddress = async () => {
      const signer = provider?.getSigner();
      const address = await signer?.getAddress();
      if (address) {
        setRecipientAddress(address);
      }
    };

    getRecipientAddress();
  }, [provider]);

  const { sign, execute, signResponse } = useSignOrder({
    items,
    provider,
    fromContractAddress,
    recipientAddress,
    environmentId,
    env,
  });

  const values = useMemo(
    () => ({
      config,
      items,
      amount,
      fromContractAddress,
      sign,
      execute,
      signResponse,
      environmentId,
      env,
      provider,
      checkout,
      recipientAddress,
    }),
    [
      config,
      env,
      environmentId,
      items,
      amount,
      fromContractAddress,
      provider,
      checkout,
      recipientAddress,
      signResponse,
    ],
  );

  return (
    <SharedContext.Provider value={values}>{children}</SharedContext.Provider>
  );
}

export function useSharedContext() {
  return useContext(SharedContext);
}
