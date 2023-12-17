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
} from '@biom3/react';
import { ChainId } from '@imtbl/checkout-sdk';
import { logoColour, networkIcon, networkName } from 'lib';
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
  // action: () => void
};

export function TransactionItem({
  label,
  details,
  fiatAmount,
  amount,
  fromChain,
  toChain,
  // action
}: TransactionItemProps) {
  // The action prop is designed for injecting the action to perform
  // in case of flow-rate. Keeping this code here even if it isn't currently
  // use for future reference.
  // https://immutable.atlassian.net/browse/WT-2007
  const action = undefined;

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
              Action heading
            </Body>
          </Box>
          <Button variant="primary" size="small">Action</Button>
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
        <Accordion.TargetLeftSlot sx={{ pr: 'base.spacing.x2' }}>
          <MenuItem size="xSmall">
            <MenuItem.FramedIcon icon="Coins" circularFrame />
            <MenuItem.Label>
              {label}
            </MenuItem.Label>
            <MenuItem.Caption>
              <Link
                size="xSmall"
                rc={<a target="_blank" href={`${details.link}${details.hash}`} rel="noreferrer" />}
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
              <Body size="xxSmall" sx={{ color: 'base.color.translucent.standard.600' }}>0x1E8d...CfDf</Body>
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
              <Body size="xxSmall" sx={{ color: 'base.color.translucent.standard.600' }}>0x1E8d...CfDf</Body>
            </Box>
          </Box>
        </Accordion.ExpandedContent>
      </Accordion>
    </Box>
  );
}
