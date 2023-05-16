import { useContext, useEffect } from 'react';
import {
  ConnectLoaderActions,
  ConnectLoaderContext,
  ConnectionStatus,
} from '../../context/connect-loader-context/ConnectLoaderContext';

type ConnectLoaderSuccessProps = {
  children: JSX.Element;
};

export function ConnectLoaderSuccess({ children }: ConnectLoaderSuccessProps) {
  const { connectLoaderDispatch } = useContext(ConnectLoaderContext);

  useEffect(() => {
    connectLoaderDispatch({
      payload: {
        type: ConnectLoaderActions.UPDATE_CONNECTION_STATUS,
        connectionStatus: ConnectionStatus.CONNECTED_WITH_NETWORK,
      },
    });
  }, [connectLoaderDispatch]);

  return children;
}
