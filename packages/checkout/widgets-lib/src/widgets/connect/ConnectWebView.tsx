import { Environment } from '@imtbl/config';
import { WidgetTheme } from '../../lib';

function ConnectWebView() {
  const config = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  return (
    <imtbl-connect widgetConfig={JSON.stringify(config)} />
  );
}

export default ConnectWebView;
