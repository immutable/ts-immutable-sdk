import {
  Accordion,
  Badge,
  Body,
  Box,
  Button,
  Divider,
  Icon,
  MenuItem,
  Link,
  EllipsizedText,
} from '@biom3/react';
import { ChainId } from '@imtbl/checkout-sdk';
import { logoColour, networkIcon, networkName } from 'lib';
import { UserJourney, useAnalytics } from 'context/analytics-provider/SegmentAnalyticsProvider';
import {
  containerStyles, actionsBadgeStyles, actionsContainerStyles, actionsLayoutStyles,
} from './transactionItemStyles';

type TransactionItemProps = {
  label: string
  details: {
    text: string,
    link: string,
    hash: string,
  }
  fiatAmount: string
  amount: string
  fromChain: ChainId
  toChain: ChainId
  fromAddress: string
  toAddress: string
  action?: () => void
  actionMessage?: string
};

export function TransactionItem({
  label,
  details,
  fiatAmount,
  amount,
  fromChain,
  toChain,
  fromAddress,
  toAddress,
  action,
  actionMessage,
}: TransactionItemProps) {
  const { track } = useAnalytics();

  const handleDetailsLinkClick = (linkDetail: { text: string, link: string, hash: string }) => {
    track({
      userJourney: UserJourney.BRIDGE,
      screen: 'TransactionItem',
      control: 'Details',
      controlType: 'Link',
      extras: {
        linkDetail,
      },
    });

    window.open(`${linkDetail.link}${linkDetail.hash}`, '_blank');
  };

  return (
    <Box sx={action ? containerStyles : {}}>
      {(action || actionMessage) && (
        <Box sx={actionsContainerStyles}>
          <Box sx={actionsLayoutStyles}>
            <Icon
              icon="Alert"
              variant="bold"
              sx={{ fill: 'base.color.status.fatal.bright', w: 'base.icon.size.200' }}
            />
            {actionMessage && (
            <Body size="xSmall" sx={{ color: 'base.color.text.secondary' }}>
              {actionMessage}
            </Body>
            )}
          </Box>
          {action && (
          <Button variant="primary" size="small" onClick={action}>
            Action
          </Button>
          )}
          <Badge
            isAnimated
            variant="fatal"
            sx={actionsBadgeStyles}
          />
        </Box>
      )}

      <Accordion
        emphasized
        chevronSide="right"
        sx={{
          my: 'base.spacing.x2',
          mx: action ? 'base.spacing.x2' : '0',
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
              <Link
                size="xSmall"
                onClick={() => handleDetailsLinkClick(details)}
              >
                {details.text}
              </Link>
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
              <EllipsizedText size="xxSmall" sx={{ color: 'base.color.translucent.standard.600' }} text={fromAddress} />
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
              <EllipsizedText size="xxSmall" sx={{ color: 'base.color.translucent.standard.600' }} text={toAddress} />
            </Box>
          </Box>
        </Accordion.ExpandedContent>
      </Accordion>
    </Box>
  );
}
