import {
  Body,
  BottomSheet, Box, Button, Heading, Icon,
} from '@biom3/react';
import {
  transactionRejectedContainerStyles, contentTextStyles, actionButtonStyles, actionButtonContainerStyles,
} from './TransactionRejectedStyles';
import { text } from '../../resources/text/textConfig';

type TransactionRejectedProps = {
  onCloseBottomSheet?: () => void;
  visible?: boolean;
  showHeaderBar?: boolean;
  transactionType: 'move' | 'swap',
  onRetry: () => void
};

export function TransactionRejected({
  onCloseBottomSheet, visible, showHeaderBar, transactionType, onRetry,
}: TransactionRejectedProps) {
  const { content, buttons } = text.drawers.transactionFailed;

  return (
    <BottomSheet
      headerBarTitle={undefined}
      size="full"
      onCloseBottomSheet={onCloseBottomSheet}
      visible={visible}
      showHeaderBar={showHeaderBar}
    >
      <BottomSheet.Content>
        <Box sx={transactionRejectedContainerStyles}>
          <Icon icon="InformationCircle" sx={{ width: '124px' }} />
          <Heading
            size="small"
            sx={contentTextStyles}
            testId="transaction-rejected-heading"
          >
            {content.heading1}
            <br />
            {content.heading2}
          </Heading>
          <Body sx={contentTextStyles}>
            {content.body1}
            <br />
            {content.body2}
          </Body>
          <Box sx={actionButtonContainerStyles}>
            <Button sx={actionButtonStyles} variant="tertiary" onClick={onRetry}>
              {buttons.retry}
            </Button>
            <Button
              sx={actionButtonStyles}
              variant="tertiary"
              onClick={onCloseBottomSheet}
              testId="transaction-rejected-cancel-button"
            >
              {buttons.cancel(transactionType)}
            </Button>
          </Box>
        </Box>
      </BottomSheet.Content>
    </BottomSheet>
  );
}
