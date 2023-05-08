import { SimpleLayout } from '../SimpleLayout/SimpleLayout';
import { FooterButton } from '../Footer/FooterButton';
import { SuccessBox } from './SuccessBox';
import { CenteredBoxContent } from '../CenteredBoxContent/CenteredBoxContent';
import { useContext, useEffect } from 'react';
import {
  ConnectLoaderActions,
  ConnectLoaderContext,
  ConnectionStatus,
} from '../../context/connect-loader-context/ConnectLoaderContext';

export interface SuccessViewProps {
  successText: string;
  actionText: string;
  onActionClick: () => void;
  successEventAction?: () => void;
}

export const SuccessView = ({
  successText,
  actionText,
  onActionClick,
  successEventAction,
}: SuccessViewProps) => {
  const { connectLoaderDispatch } = useContext(ConnectLoaderContext);

  if (
    successEventAction !== undefined &&
    typeof successEventAction === 'function'
  ) {
    successEventAction();
  }

  useEffect(() => {
    connectLoaderDispatch({
      payload: {
        type: ConnectLoaderActions.UPDATE_CONNECTION_STATUS,
        connectionStatus: ConnectionStatus.CONNECTED_WITH_NETWORK,
      },
    });
  }, [connectLoaderDispatch]);

  const onSuccessActionClick = () => {
    if (onActionClick !== undefined && typeof onActionClick === 'function') {
      onActionClick();
    }
  };

  return (
    <SimpleLayout
      footer={
        <FooterButton
          actionText={actionText}
          onActionClick={onSuccessActionClick}
        />
      }
    >
      <CenteredBoxContent testId="success-view">
        <SuccessBox successText={successText} />
      </CenteredBoxContent>
    </SimpleLayout>
  );
};
