import { Environment } from '@imtbl/config';
import { WidgetTheme } from '../../lib';

function PrimaryRevenueWebView() {
  const config = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  return <imtbl-primary-revenue widgetConfig={JSON.stringify(config)} />;
}

export default PrimaryRevenueWebView;
