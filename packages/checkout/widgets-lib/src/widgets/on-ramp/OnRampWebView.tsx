import { Environment } from '@imtbl/config';
import { WidgetTheme } from '../../lib';

function OnRampWebView() {
  const config = {
    theme: WidgetTheme.LIGHT,
    environment: Environment.SANDBOX,
  };

  return (
    <imtbl-onramp widgetConfig={JSON.stringify(config)} />
  );
}

export default OnRampWebView;
