import {
  Accordion,
  Body,
  Box,
  Button,
  Divider,
  Icon,
  MenuItem,
  Link,
  EllipsizedText,
} from '@biom3/react';
import { ChainSlug } from '@imtbl/checkout-sdk';
import { logoColour, networkIcon, networkName } from 'lib';
import { UserJourney, useAnalytics } from 'context/analytics-provider/SegmentAnalyticsProvider';
import { text } from 'resources/text/textConfig';
import { BridgeWidgetViews } from 'context/view-context/BridgeViewContextTypes';
import { Transaction, TransactionStatus } from 'lib/clients/checkoutApiType';
import { getChainIdBySlug } from 'lib/chains';
import { MouseEvent, useMemo } from 'react';
import { actionsContainerStyles, actionsLayoutStyles, containerStyles } from './transactionItemStyles';

type TransactionItemProps = {
  label: string
  details: {
    text: string,
    link: string,
    hash: string,
  },
  transaction: Transaction,
  // token: TokenInfo,
  fiatAmount: string
  amount: string
};

export function TransactionItem({
  label,
  details,
  transaction,
  fiatAmount,
  amount,
}: TransactionItemProps) {
  const { track } = useAnalytics();
  const { status: { withdrawalPending } } = text.views[BridgeWidgetViews.TRANSACTIONS];

  const fromChain = getChainIdBySlug(transaction.details.from_chain as ChainSlug);
  const toChain = getChainIdBySlug(transaction.details.to_chain as ChainSlug);

  const dateNow = new Date().getTime();
  const withdrawalReadyDate = useMemo(
    () => (transaction.details.current_status.withdrawal_ready_at
      ? new Date(transaction.details.current_status.withdrawal_ready_at)
      : undefined),
    [transaction],
  );

  const requiresWithdrawalClaim = transaction.details.current_status.status === TransactionStatus.WITHDRAWAL_PENDING;

  // TODO: consider extracting this to datetime utils
  const delayTimeHours = requiresWithdrawalClaim && withdrawalReadyDate !== undefined
    ? Math.ceil((withdrawalReadyDate.getTime() - dateNow) / (60 * 60 * 1000))
    : 0;

  const withdrawalReadyToClaim = withdrawalReadyDate ? withdrawalReadyDate.getTime() < dateNow : false;
  const actionMessage = withdrawalReadyToClaim === true
    ? withdrawalPending.withdrawalReadyText
    // eslint-disable-next-line max-len
    : `${withdrawalPending.withdrawalDelayText} ${delayTimeHours} ${delayTimeHours > 1 ? 'hours' : 'hour'}`;

  const handleDetailsLinkClick = (
    e: MouseEvent<HTMLAnchorElement>,
    linkDetail: { text: string, link: string, hash: string },
  ) => {
    e.preventDefault(); // prevent default opening of link
    e.stopPropagation(); // prevent expanding accordian

    track({
      userJourney: UserJourney.BRIDGE,
      screen: 'TransactionItem',
      control: 'Details',
      controlType: 'Link',
      extras: {
        linkDetail,
      },
    });

    window.open(`${linkDetail.link}${linkDetail.hash}`);
  };

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
              {!requiresWithdrawalClaim && (
                <Link
                  size="xSmall"
                  rc={(
                    <a
                      target="_blank"
                      href="#"
                      rel="noreferrer"
                      onClick={(e) => handleDetailsLinkClick(e, details)}
                    />
                  )}
                >
                  {details.text}
                </Link>
              )}
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
          <Box sx={{
            display: 'flex',
            px: 'base.spacing.x4',
            gap: 'base.spacing.x2',
          }}
          >
            <Icon
              // @ts-ignore
              icon={networkIcon[fromChain]}
              sx={{
                w: 'base.icon.size.250',
                // @ts-ignore
                fill: logoColour[fromChain],
              }}
              variant="bold"
            />
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: '1',
            }}
            >
              <Body size="xxSmall" sx={{ color: 'base.color.translucent.standard.900' }}>
                {networkName[fromChain]}
              </Body>
              <EllipsizedText
                size="xxSmall"
                sx={{ color: 'base.color.translucent.standard.600' }}
                text={transaction.details.from_address}
              />
            </Box>
            <Box sx={{ flexGrow: '1' }} />
            <Icon
              icon="ArrowForward"
              sx={{
                w: 'base.icon.size.250',
                fill: 'base.color.brand.4',
              }}
            />
            <Box sx={{ flexGrow: '1' }} />
            <Icon
              // @ts-ignore
              icon={networkIcon[toChain]}
              sx={{
                w: 'base.icon.size.250',
                // @ts-ignore
                fill: logoColour[toChain],
              }}
              variant="bold"
            />
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: '1',
            }}
            >
              <Body size="xxSmall" sx={{ color: 'base.color.translucent.standard.900' }}>
                {networkName[toChain]}
              </Body>
              <EllipsizedText
                size="xxSmall"
                sx={{ color: 'base.color.translucent.standard.600' }}
                text={transaction.details.to_address}
              />
            </Box>
          </Box>
        </Accordion.ExpandedContent>
      </Accordion>
    </Box>
  );
}
