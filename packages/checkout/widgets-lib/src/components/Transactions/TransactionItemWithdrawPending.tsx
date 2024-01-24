import {
  Accordion,
  Body,
  Box,
  Button,
  Divider,
  Icon,
  MenuItem,
} from '@biom3/react';
import { UserJourney, useAnalytics } from 'context/analytics-provider/SegmentAnalyticsProvider';
import { text } from 'resources/text/textConfig';
import { BridgeWidgetViews } from 'context/view-context/BridgeViewContextTypes';
import { Transaction, TransactionStatus } from 'lib/clients/checkoutApiType';
import { useMemo } from 'react';
import { actionsContainerStyles, actionsLayoutStyles, containerStyles } from './transactionItemStyles';
import { TransactionDetails } from './TransactionDetails';

type TransactionItemWithdrawPendingProps = {
  label: string
  transaction: Transaction,
  // token: TokenInfo,
  fiatAmount: string
  amount: string
};

export function TransactionItemWithdrawPending({
  label,
  transaction,
  fiatAmount,
  amount,
}: TransactionItemWithdrawPendingProps) {
  const { track } = useAnalytics();
  const { status: { withdrawalPending } } = text.views[BridgeWidgetViews.TRANSACTIONS];

  const dateNowUnixMs = useMemo(() => new Date().getTime(), []);
  const withdrawalReadyDate = useMemo(
    () => (transaction.details.current_status.withdrawal_ready_at
      ? new Date(transaction.details.current_status.withdrawal_ready_at)
      : undefined),
    [transaction],
  );

  const requiresWithdrawalClaim = transaction.details.current_status.status === TransactionStatus.WITHDRAWAL_PENDING;

  const relativeTimeFormat = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  const delayTimeString = useMemo(() => {
    if (!requiresWithdrawalClaim || withdrawalReadyDate === undefined) return '';

    const timeDiffMins = (withdrawalReadyDate!.getTime() - dateNowUnixMs) / (60 * 1000);

    if (timeDiffMins <= 1) return 'in 1 minute';

    if (timeDiffMins < 60) {
      return relativeTimeFormat.format(Math.ceil(timeDiffMins), 'minute');
    }
    const timeDiffHours = timeDiffMins / 60; // hours
    if (timeDiffMins < 60 * 24) {
      return relativeTimeFormat.format(Math.ceil(timeDiffHours), 'hour');
    }
    const timeDiffDays = timeDiffHours / 24; // days
    return relativeTimeFormat.format(Math.ceil(timeDiffDays), 'day');
  }, [dateNowUnixMs]);

  const withdrawalReadyToClaim = withdrawalReadyDate ? withdrawalReadyDate.getTime() < dateNowUnixMs : false;
  const actionMessage = withdrawalReadyToClaim === true
    ? withdrawalPending.withdrawalReadyText
    : `${withdrawalPending.withdrawalDelayText} ${delayTimeString}`;

  const handleWithdrawalClaimClick = () => {
    // WT-2053 - https://immutable.atlassian.net/browse/WT-2053
    // entrypoint for claim withdrawal
  };

  return (
    <Box testId={`transaction-item-${transaction.blockchain_metadata.transaction_hash}`} sx={containerStyles}>
      {requiresWithdrawalClaim && (
        <>
          <Box sx={actionsContainerStyles}>
            <Box sx={actionsLayoutStyles}>
              <Icon
                icon="Alert"
                variant="bold"
                sx={{
                  fill: withdrawalReadyToClaim
                    ? 'base.color.status.fatal.bright'
                    : 'base.color.status.attention.bright',
                  w: 'base.icon.size.200',
                }}
              />
              <Body
                testId={`transaction-item-${transaction.blockchain_metadata.transaction_hash}-action-message`}
                size="xSmall"
                sx={{ color: 'base.color.text.secondary' }}
              >
                {actionMessage}
              </Body>
            </Box>
            {requiresWithdrawalClaim && withdrawalReadyToClaim && (
              <Button
                testId={`transaction-item-${transaction.blockchain_metadata.transaction_hash}-action-button`}
                variant="primary"
                size="small"
                onClick={handleWithdrawalClaimClick}
              >
                {withdrawalPending.actionButtonText}
              </Button>
            )}
          </Box>
          <Divider size="small" sx={{ color: 'base.color.translucent.emphasis.300', opacity: 0.1 }} />
        </>
      )}

      <Accordion
        chevronSide="right"
        sx={{
          button: {
            p: 'base.spacing.x1',
          },
          article: {
            pr: 'base.spacing.x10',
          },
        }}
        onExpandChange={
          (expanded) => expanded
            && track({
              userJourney: UserJourney.BRIDGE,
              screen: 'TransactionItem',
              control: 'Accordion',
              controlType: 'Button',
            })
        }
      >
        <Accordion.TargetLeftSlot sx={{ pr: 'base.spacing.x2' }}>
          <MenuItem size="xSmall">
            <MenuItem.FramedIcon icon="Coins" circularFrame />
            <MenuItem.Label>
              {label}
            </MenuItem.Label>
            <MenuItem.Caption>
              Paused
            </MenuItem.Caption>
            <MenuItem.PriceDisplay
              fiatAmount={fiatAmount}
              price={amount}
            />
          </MenuItem>
        </Accordion.TargetLeftSlot>
        <Accordion.ExpandedContent sx={{
          pr: '0',
          pl: '0',
          mb: 'base.spacing.x3',
          gap: '0',
        }}
        >
          <Divider
            size="xSmall"
            sx={{
              px: 'base.spacing.x2',
            }}
          />
          <TransactionDetails transaction={transaction} />
        </Accordion.ExpandedContent>
      </Accordion>
    </Box>
  );
}
