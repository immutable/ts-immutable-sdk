import { SimpleLayout } from '../SimpleLayout/SimpleLayout';
import { Box } from '@biom3/react';
import {
  SuccessViewStyles,
} from './SuccessViewStyles';
import { FooterButton } from '../Footer/FooterButton';
import { SuccessBox } from './SuccessBox';

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
  if (
    successEventAction !== undefined &&
    typeof successEventAction === 'function'
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
      footer={
        <FooterButton
          actionText={actionText}
          onActionClick={onSuccessActionClick}
        />
      }
    >
      <Box sx={SuccessViewStyles} testId="success-view">
        <SuccessBox successText={successText} />
      </Box>
    </SimpleLayout>
  );
};
