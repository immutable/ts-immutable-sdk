import {
  Accordion,
  Body,
  Box,
  Button,
  Divider,
  Icon,
  MenuItem,
} from '@biom3/react';
import { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Environment } from '@imtbl/config';
import { UserJourney, useAnalytics } from '../../context/analytics-provider/SegmentAnalyticsProvider';
import { Transaction, TransactionStatus } from '../../lib/clients/checkoutApiType';
import { BridgeWidgetViews } from '../../context/view-context/BridgeViewContextTypes';
import { ViewActions, ViewContext } from '../../context/view-context/ViewContext';
import { TokenImage } from '../TokenImage/TokenImage';
import { actionsContainerStyles, actionsLayoutStyles, containerStyles } from './transactionItemStyles';
import { TransactionDetails } from './TransactionDetails';

type TransactionItemWithdrawPendingProps = {
  label: string,
  transaction: Transaction,
  fiatAmount: string,
  amount: string,
  icon: string,
  defaultTokenImage: string,
  environment: Environment,
};

export function TransactionItemWithdrawPending({
  label,
  transaction,
  fiatAmount,
  amount,
  icon,
  defaultTokenImage,
  environment,
}: TransactionItemWithdrawPendingProps) {
  const { viewDispatch } = useContext(ViewContext);
  const { track } = useAnalytics();
  const translation = useTranslation();
  const dateNowUnixMs = useMemo(() => new Date().getTime(), []);
  const withdrawalReadyDate = useMemo(
    () => (transaction.details.current_status.withdrawal_ready_at
      ? new Date(transaction.details.current_status.withdrawal_ready_at)
      : undefined),
    [transaction],
  );

  const requiresWithdrawalClaim = transaction.details.current_status.status === TransactionStatus.WITHDRAWAL_PENDING;

  const relativeTimeFormat = new Intl.RelativeTimeFormat(translation[1].language || 'en', { numeric: 'auto' });

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
  }, [dateNowUnixMs, translation[1].language]);

  const withdrawalReadyToClaim = withdrawalReadyDate ? withdrawalReadyDate.getTime() < dateNowUnixMs : false;
  const actionMessage = useMemo(
    () => (withdrawalReadyToClaim === true
      ? translation.t('views.TRANSACTIONS.status.withdrawalPending.withdrawalReadyText')
      : `${translation.t('views.TRANSACTIONS.status.withdrawalPending.withdrawalDelayText')} ${delayTimeString}`),
    [delayTimeString, translation[1].language],
  );

  const handleWithdrawalClaimClick = () => {
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: BridgeWidgetViews.CLAIM_WITHDRAWAL,
          transaction,
        },
      },
    });
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
                sx={{ color: 'base.color.text.body.secondary' }}
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
                {translation.t('views.TRANSACTIONS.status.withdrawalPending.actionButtonText')}
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
          borderTopRightRadius: '0',
          borderTopLeftRadius: '0',
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
            <MenuItem.FramedImage
              circularFrame
              use={(
                <TokenImage
                  src={icon}
                  name={label}
                  defaultImage={defaultTokenImage}
                />
              )}
            />
            <MenuItem.Label>
              {label}
            </MenuItem.Label>
            <MenuItem.Caption>
              {translation.t('views.TRANSACTIONS.status.withdrawalPending.caption')}
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
          <TransactionDetails transaction={transaction} environment={environment} />
        </Accordion.ExpandedContent>
      </Accordion>
    </Box>
  );
}
