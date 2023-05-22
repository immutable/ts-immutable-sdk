import { StatusView } from '../StatusView/StatusView';
import { FailureBox } from './FailureBox';

export interface FailureViewProps {
  failureText: string;
  actionText: string;
  onActionClick: () => void;
  failureEventAction?: () => void;
}

export function FailureView({
  failureText,
  actionText,
  onActionClick,
  failureEventAction,
}: FailureViewProps) {
  if (
    failureEventAction !== undefined
    && typeof failureEventAction === 'function'
  ) {
    failureEventAction();
  }

  const onFailureActionClick = () => {
    if (onActionClick !== undefined && typeof onActionClick === 'function') {
      onActionClick();
    }
  };

  return (
    <StatusView
      testId="failure-view"
      actionText={actionText}
      onActionClick={onFailureActionClick}
    >
      <FailureBox failText={failureText} />
    </StatusView>
  );
}
