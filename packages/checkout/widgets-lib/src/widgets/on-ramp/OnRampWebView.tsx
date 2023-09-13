import { Environment } from '@imtbl/config';
import { WidgetTheme } from '../../lib';

function OnRampView() {
  const config = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  return (
    <imtbl-onramp widgetConfig={JSON.stringify(config)} />
  );
}

export default OnRampView;
