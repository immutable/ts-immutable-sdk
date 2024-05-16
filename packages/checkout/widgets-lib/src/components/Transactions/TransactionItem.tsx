import {
  Accordion,
  Box,
  Divider,
  MenuItem,
  Link,
} from '@biom3/react';
import { MouseEvent, useMemo, useState } from 'react';
import { UserJourney, useAnalytics } from '../../context/analytics-provider/SegmentAnalyticsProvider';
import { Transaction } from '../../lib/clients';
import { containerStyles } from './transactionItemStyles';
import { TransactionDetails } from './TransactionDetails';

type TransactionItemProps = {
  label: string
  details: {
    text: string,
    link: string,
    hash: string,
  },
  transaction: Transaction,
  fiatAmount: string,
  amount: string,
  icon: string,
  defaultTokenImage: string,
};

export function TransactionItem({
  label,
  details,
  transaction,
  fiatAmount,
  amount,
  icon,
  defaultTokenImage,
}: TransactionItemProps) {
  const { track } = useAnalytics();
  const [iconError, setIconError] = useState<boolean>(false);
  const tokenUrl = useMemo(
    () => ((!icon || iconError) ? defaultTokenImage : icon),
    [icon, iconError, defaultTokenImage],
  );
  const txnDetailsLink = useMemo(() => `${details.link}${details.hash}`, [details]);

  const handleDetailsLinkClick = (
    event: MouseEvent<HTMLAnchorElement>,
    linkDetail: { text: string, link: string, hash: string },
  ) => {
    event.stopPropagation(); // prevent expanding accordian

    track({
      userJourney: UserJourney.BRIDGE,
      screen: 'TransactionItem',
      control: 'Details',
      controlType: 'Link',
      extras: {
        linkDetail,
      },
    });
  };

  return (
    <Box testId={`transaction-item-${transaction.blockchain_metadata.transaction_hash}`} sx={containerStyles}>
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
            <MenuItem.FramedImage
              circularFrame
              use={(
                <img
                  src={tokenUrl}
                  alt={label}
                  onError={() => setIconError(true)}
                />
              )}
            />
            <MenuItem.Label>
              {label}
            </MenuItem.Label>
            <MenuItem.Caption>
              <Link
                size="xSmall"
                rc={(
                  <a
                    target="_blank"
                    href={txnDetailsLink}
                    rel="noreferrer"
                    onClick={(e) => handleDetailsLinkClick(e, details)}
                  />
                )}
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
          <TransactionDetails transaction={transaction} />
        </Accordion.ExpandedContent>
      </Accordion>
    </Box>
  );
}
