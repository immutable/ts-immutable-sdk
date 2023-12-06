import {
  Accordion,
  Badge,
  Body,
  Box,
  Button,
  Divider,
  Icon,
  MenuItem,
} from '@biom3/react';
import { ChainId } from '@imtbl/checkout-sdk';
import { text } from 'resources/text/textConfig';
import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
import { logoColour, networkIcon, networkName } from 'lib';
import { containerStyles } from './transactionItemStyles';
import { actionsBadgeStyles, actionsContainerStyles, actionsLayoutStyles } from './transactionStyles';

type TransactionItemProps = {
  key: string
  label: string
  caption: string
  fiatAmount: string
  amount: string
  fromChain: ChainId
  toChain: ChainId
  l1ToL2?: boolean
  action?: () => void
};

export function TransactionItem({
  key,
  label,
  caption,
  fiatAmount,
  amount,
  fromChain,
  toChain,
  l1ToL2,
  action,
}: TransactionItemProps) {
  const { status: { claim } } = text.views[XBridgeWidgetViews.TRANSACTIONS];

  return (
    <Box sx={action ? containerStyles : {}}>

      {action !== undefined && (
        <Box sx={actionsContainerStyles}>
          <Box sx={actionsLayoutStyles}>
            <Icon
              icon="Alert"
              variant="bold"
              sx={{ fill: 'base.color.status.fatal.bright', w: 'base.icon.size.200' }}
            />
            <Body size="xSmall" sx={{ color: 'base.color.text.secondary' }}>
              {claim.banner.heading}
            </Body>
          </Box>
          <Button variant="primary" size="small">{claim.action}</Button>
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
      >
        <Accordion.TargetLeftSlot>
          <MenuItem key={key} size="xSmall">
            <MenuItem.FramedIcon icon="Coins" circularFrame />
            <MenuItem.Label>
              {label}
            </MenuItem.Label>
            <MenuItem.Caption>
              {caption}
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
          mb: 'base.spacing.x2',
          gap: '0',
        }}
        >
          <Divider
            size="xSmall"
            sx={{
              pt: 'base.spacing.x2',
              pr: 'base.spacing.x2',
              pl: 'base.spacing.x2',
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
              <Body size="xxSmall" sx={{ color: 'base.color.translucent.standard.600' }}>0x1E8d...CfDf</Body>
            </Box>
            <Box sx={{ flexGrow: '1' }} />
            <Icon
              icon={l1ToL2 ? 'ArrowForward' : 'ArrowBackward'}
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
              <Body size="xxSmall" sx={{ color: 'base.color.translucent.standard.600' }}>0x1E8d...CfDf</Body>
            </Box>
          </Box>
        </Accordion.ExpandedContent>
      </Accordion>
    </Box>
  );
}
