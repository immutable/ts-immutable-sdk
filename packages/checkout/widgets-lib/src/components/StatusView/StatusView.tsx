import { SimpleLayout } from '../SimpleLayout/SimpleLayout';
import { FooterButton } from '../Footer/FooterButton';
import { CenteredBoxContent } from '../CenteredBoxContent/CenteredBoxContent';

export interface StatusViewProps {
  actionText: string;
  onActionClick: () => void;
  testId: string;
  children: React.ReactNode;
}

export function StatusView({
  actionText,
  onActionClick,
  testId,
  children,
}: StatusViewProps) {
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
      <CenteredBoxContent testId={testId}>
        {children}
      </CenteredBoxContent>
    </SimpleLayout>
  );
}
