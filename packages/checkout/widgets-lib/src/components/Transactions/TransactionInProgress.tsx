import { MenuItem } from '@biom3/react';
import { XBridgeWidgetViews } from 'context/view-context/XBridgeViewContextTypes';
import { text } from 'resources/text/textConfig';

export function TransactionInProgress({ key }: { key: string }) {
  const { status: { inProgress } } = text.views[XBridgeWidgetViews.TRANSACTIONS];

  return (
    <MenuItem key={key} emphasized size="small" sx={{ mt: 'base.spacing.x1' }}>
      <MenuItem.FramedIcon icon="Coins" circularFrame />
      <MenuItem.Label>
        zkTKN
      </MenuItem.Label>
      <MenuItem.Caption>
        {inProgress.stepInfo}
        {' '}
        10 mins
      </MenuItem.Caption>
      <MenuItem.PriceDisplay
        fiatAmount="USD $12345.12"
        price="+1835.1234"
      />
    </MenuItem>
  );
}
