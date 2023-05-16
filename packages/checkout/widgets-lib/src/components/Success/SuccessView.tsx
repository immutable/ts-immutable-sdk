import { SimpleLayout } from '../SimpleLayout/SimpleLayout';
import { FooterButton } from '../Footer/FooterButton';
import { SuccessBox } from './SuccessBox';
import { CenteredBoxContent } from '../CenteredBoxContent/CenteredBoxContent';

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
    <SimpleLayout
      footer={(
        <FooterButton
          actionText={actionText}
          onActionClick={onSuccessActionClick}
        />
      )}
    >
      <CenteredBoxContent testId="success-view">
        <SuccessBox successText={successText} />
      </CenteredBoxContent>
    </SimpleLayout>
  );
}
