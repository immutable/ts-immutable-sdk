import { useContext, useEffect } from 'react';
import {
  ConnectLoaderActions,
  ConnectLoaderContext,
  ConnectionStatus,
} from '../../context/connect-loader-context/ConnectLoaderContext';
import { ConnectWidgetViews } from '../../context/view-context/ConnectViewContextTypes';

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
        deepLink: ConnectWidgetViews.SUCCESS,
      },
    });
  }, [connectLoaderDispatch]);

  return children;
}
