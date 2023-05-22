import { SuccessBox } from './SuccessBox';
import { StatusView } from '../StatusView/StatusView';

export interface SuccessViewProps {
  successText: string;
  actionText: string;
  onActionClick: () => void;
  successEventAction?: () => void;
}

export function SuccessView({
  successText,
  actionText,
  onActionClick,
  successEventAction,
}: SuccessViewProps) {
  if (
    successEventAction !== undefined
    && typeof successEventAction === 'function'
  ) {
    successEventAction();
  }

  const onSuccessActionClick = () => {
    if (onActionClick !== undefined && typeof onActionClick === 'function') {
      onActionClick();
    }
  };

  return (
    <StatusView
      testId="success-view"
      actionText={actionText}
      onActionClick={onSuccessActionClick}
    >
      <SuccessBox successText={successText} />
    </StatusView>
  );
}
