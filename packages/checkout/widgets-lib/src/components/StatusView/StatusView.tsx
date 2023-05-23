import { SimpleLayout } from '../SimpleLayout/SimpleLayout';
import { FooterButton } from '../Footer/FooterButton';
import { CenteredBoxContent } from '../CenteredBoxContent/CenteredBoxContent';
import { StatusBox } from './StatusBox';
import { StatusType } from './StatusType';

export interface StatusViewProps {
  actionText: string;
  onActionClick: () => void;
  statusEventAction?: () => void;
  testId: string;
  statusText: string;
  statusType: StatusType;
}

export function StatusView({
  actionText,
  onActionClick,
  statusEventAction,
  testId,
  statusText,
  statusType,
}: StatusViewProps) {
  if (
    statusEventAction !== undefined
    && typeof statusEventAction === 'function'
  ) {
    statusEventAction();
  }
  const onStatusActionClick = () => {
    if (onActionClick !== undefined && typeof onActionClick === 'function') {
      onActionClick();
    }
  };

  return (
    <SimpleLayout
      footer={(
        <FooterButton
          actionText={actionText}
          onActionClick={onStatusActionClick}
        />
      )}
    >
      <CenteredBoxContent testId={testId}>
        <StatusBox statusText={statusText} statusType={statusType} />
      </CenteredBoxContent>
    </SimpleLayout>
  );
}
