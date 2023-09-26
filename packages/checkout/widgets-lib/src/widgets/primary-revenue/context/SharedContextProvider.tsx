import {
  useContext,
  createContext,
  useMemo,
  ReactNode,
  useEffect,
  useState,
} from 'react';

import { Environment } from '@imtbl/config';
import { PrimaryRevenueSuccess } from '@imtbl/checkout-widgets';

import { Item, PaymentTypes, SignResponse } from '../types';
import { useSignOrder } from '../hooks/useSignOrder';
import { ConnectLoaderState } from '../../../context/connect-loader-context/ConnectLoaderContext';

type SharedContextProps = {
  envId: string;
  items: Item[];
  amount: string;
  fromCurrency: string;
  provider: ConnectLoaderState['provider'];
  checkout: ConnectLoaderState['checkout'];
};

type SharedContextValues = SharedContextProps & {
  sign: (paymentType: PaymentTypes) => Promise<SignResponse | undefined>
  execute: () => Promise<PrimaryRevenueSuccess>;
  environment: string;
  gameId: string;
  recipientAddress: string;
  signResponse: SignResponse | undefined;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
const SharedContext = createContext<SharedContextValues>({
  envId: '',
  items: [],
  amount: '',
  fromCurrency: '',
  provider: undefined,
  checkout: undefined,
  environment: '',
  gameId: '',
  recipientAddress: '',
  sign: () => Promise.resolve(undefined),
  execute: () => Promise.resolve({} as PrimaryRevenueSuccess),
  signResponse: undefined,
});

SharedContext.displayName = 'PrimaryRevenueSharedContext';

export function SharedContextProvider(props: {
  children: ReactNode;
  value: SharedContextProps;
}) {
  const {
    children,
    value: {
      envId, items, amount, fromCurrency, provider, checkout,
    },
  } = props;

  const [recipientAddress, setRecipientAddress] = useState<string>('');

  // FIXME: retreive gameId & environment from hub config
  const gameId = 'pokemon';
  const environment = Environment.SANDBOX;

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
    fromCurrency,
    recipientAddress,
    gameId,
    environment,
  });

  const values = useMemo(
    () => ({
      envId,
      items,
      amount,
      fromCurrency,
      sign,
      execute,
      signResponse,
      environment,
      gameId,
      provider,
      checkout,
      recipientAddress,
    }),
    [envId, items, amount, fromCurrency, provider, checkout, recipientAddress, signResponse],
  );

  return (
    <SharedContext.Provider value={values}>{children}</SharedContext.Provider>
  );
}

export function useSharedContext() {
  return useContext(SharedContext);
}
