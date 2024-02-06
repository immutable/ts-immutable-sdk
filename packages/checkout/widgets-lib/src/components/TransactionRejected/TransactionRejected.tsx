import {
  Body,
  Drawer, Box, Button, DuoCon, Heading,
} from '@biom3/react';
import { useTranslation } from 'react-i18next';
import {
  transactionRejectedContainerStyles,
  contentTextStyles,
  actionButtonStyles,
  actionButtonContainerStyles,
} from './TransactionRejectedStyles';

type TransactionRejectedProps = {
  onCloseDrawer?: () => void;
  visible?: boolean;
  showHeaderBar?: boolean;
  onRetry: () => void
};

export function TransactionRejected({
  onCloseDrawer, visible, showHeaderBar, onRetry,
}: TransactionRejectedProps) {
  const { t } = useTranslation();

  return (
    <Drawer
      headerBarTitle={undefined}
      size="full"
      onCloseDrawer={onCloseDrawer}
      visible={visible}
      showHeaderBar={showHeaderBar}
    >
      <Drawer.Content>
        <Box sx={transactionRejectedContainerStyles}>
          <DuoCon
            icon="Information"
            colorVariant="guidance"
            iconVariant="bold"
          />
          <Heading
            size="small"
            sx={contentTextStyles}
            testId="transaction-rejected-heading"
          >
            {t('drawers.transactionFailed.content.heading1')}
            <br />
            {t('drawers.transactionFailed.content.heading2')}
          </Heading>
          <Body sx={contentTextStyles}>
            {t('drawers.transactionFailed.content.body1')}
            <br />
            {t('drawers.transactionFailed.content.body2')}
          </Body>
          <Box sx={actionButtonContainerStyles}>
            <Button sx={actionButtonStyles} variant="tertiary" onClick={onRetry}>
              {t('drawers.transactionFailed.buttons.retry')}
            </Button>
            <Button
              sx={actionButtonStyles}
              variant="tertiary"
              onClick={onCloseDrawer}
              testId="transaction-rejected-cancel-button"
            >
              {t('drawers.transactionFailed.buttons.cancel')}
            </Button>
          </Box>
        </Box>
      </Drawer.Content>
    </Drawer>
  );
}
