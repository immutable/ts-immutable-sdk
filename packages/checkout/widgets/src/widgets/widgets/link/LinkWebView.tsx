import { Environment } from '@imtbl/config';
import { WidgetTheme } from '../../lib';

function LinkWebView() {
  const config = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  return (
    <imtbl-link widgetConfig={JSON.stringify(config)} />
  );
}

export default LinkWebView;
