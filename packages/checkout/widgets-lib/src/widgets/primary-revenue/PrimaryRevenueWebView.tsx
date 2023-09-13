import { useEffect, useState } from 'react';
import { Environment } from '@imtbl/config';
import { config, passport } from '@imtbl/sdk';

import {
  IMTBLWidgetEvents,
  PrimaryRevenueEventType,
} from '@imtbl/checkout-widgets';
import { WidgetTheme } from '../../lib';
import { ImmutableWebComponent } from '../ImmutableWebComponent';
import { Item } from './hooks/useMergeItemsInfo';

const defaultPassportConfig = {
  environment: 'sandbox',
  clientId: 'XuGsHvMqMJrb73diq1fCswWwn4AYhcM6',
  redirectUri: 'http://localhost:3001/primary-revenue?login=true',
  logoutRedirectUri: 'http://localhost:3001/primary-revenue?logout=true',
  audience: 'platform_api',
  scope: 'openid offline_access email transact',
};

const defaultItems: Item[] = [
  {
    productId: 'P0001',
    qty: 1,
    name: 'Poliwag',
    image: 'https://pokemon-nfts.s3.ap-southeast-2.amazonaws.com/images/60.png',
    description: 'Poliwag',
  },
  {
    productId: 'P0002',
    qty: 1,
    name: 'Poliwhirl',
    image: 'https://pokemon-nfts.s3.ap-southeast-2.amazonaws.com/images/61.png',
    description: 'Poliwhirl',
  },
  {
    productId: 'P0003',
    qty: 1,
    name: 'Poliwrath',
    image: 'https://pokemon-nfts.s3.ap-southeast-2.amazonaws.com/images/62.png',
    description: 'Poliwrath',
  },
];

const useParams = () => {
  const urlParams = new URLSearchParams(window.location.search);

  const login = urlParams.get('login') as string;
  const amount = urlParams.get('amount') as string;
  const envId = urlParams.get('envId') as string;
  const fromCurrency = urlParams.get('fromCurrency') as string;

  return {
    login,
    amount,
    envId,
    fromCurrency,
  };
};

const usePassportInstance = (passportConfig: any) => {
  const {
    clientId,
    redirectUri,
    logoutRedirectUri,
    audience,
    scope,
    environment,
  } = passportConfig;

  if (!clientId || !redirectUri || !logoutRedirectUri || !audience || !scope) {
    return null;
  }

  const passportInstance = new passport.Passport({
    baseConfig: new config.ImmutableConfiguration({
      environment: environment || config.Environment.SANDBOX,
    }),
    clientId,
    redirectUri,
    logoutRedirectUri,
    audience,
    scope,
  });

  return passportInstance;
};

function PrimaryRevenueWebView() {
  const params = useParams();
  const {
    login, amount, envId, fromCurrency,
  } = params;
  const [passportOn, setPassportOn] = useState(false);
  const [passportConfig, setPassportConfig] = useState(
    JSON.stringify(defaultPassportConfig, null, 2),
  );
  const [items, setItems] = useState(JSON.stringify(defaultItems, null, 2));
  const [showWidget, setShowWidget] = useState(true);

  const handlePassportConfigChange = (e: any) => {
    setPassportConfig(e.target.value);
  };

  const handlePassportConfigFormat = (e: any) => {
    let value;
    try {
      value = JSON.parse(e.target.value);
    } catch (error) {
      /** */
    }

    if (value) {
      setPassportConfig(JSON.stringify(value, null, 2));
      localStorage.setItem('imtbl/prw_passportConfig', JSON.stringify(value));
    }
  };

  const handleItemsChange = (e: any) => {
    setItems(e.target.value);
  };

  const handleItemsFormat = (e: any) => {
    let value;
    try {
      value = JSON.parse(e.target.value);
    } catch (error) {
      /** */
    }

    if (value) {
      setItems(JSON.stringify(value, null, 2));
      localStorage.setItem('imtbl/prw_items', JSON.stringify(value));
    }
  };

  const handleEvent = ((event: CustomEvent) => {
    console.log('@@@@@ event', event.detail);

    switch (event.detail.type) {
      case PrimaryRevenueEventType.CLOSE_WIDGET: {
        setShowWidget(false);
        break;
      }
      default:
        console.log('Does not match any expected event type');
    }
  }) as EventListener;

  useEffect(() => {
    if (!passportOn) return;

    const primaryRevenueElement = document.querySelector<ImmutableWebComponent>(
      'imtbl-primary-revenue',
    );
    const passportInstance = usePassportInstance(JSON.parse(passportConfig));
    primaryRevenueElement?.addPassportOption(passportInstance as any);
  }, [passportOn, passportConfig, items]);

  useEffect(() => {
    const passportInstance = usePassportInstance(JSON.parse(passportConfig));

    if (passportInstance) {
      passportInstance.loginCallback();
    }
  }, [login]);

  useEffect(() => {
    const lsPassportConfig = localStorage.getItem('imtbl/prw_passportConfig');
    if (lsPassportConfig) {
      setPassportConfig(JSON.stringify(JSON.parse(lsPassportConfig), null, 2));
    }

    const lsItems = localStorage.getItem('imtbl/prw_items');
    if (lsItems) {
      setItems(JSON.stringify(JSON.parse(lsItems), null, 2));
    }
  }, []);

  useEffect(() => {
    window.addEventListener(
      IMTBLWidgetEvents.IMTBL_PRIMARY_REVENUE_WIDGET_EVENT,
      handleEvent,
    );

    return () => {
      window.removeEventListener(
        IMTBLWidgetEvents.IMTBL_PRIMARY_REVENUE_WIDGET_EVENT,
        handleEvent,
      );
    };
  }, []);

  const widgetConfig = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  return (
    <>
      {showWidget ? (
        <imtbl-primary-revenue
          widgetConfig={JSON.stringify(widgetConfig)}
          amount={amount}
          envId={envId}
          fromCurrency={fromCurrency}
          items={items}
        />
      ) : undefined}

      <br />
      <button type="button" onClick={() => setPassportOn(true)}>
        Passport On
      </button>
      <br />
      <br />
      <br />
      <h3>Passport Config</h3>
      <textarea
        rows={12}
        cols={80}
        value={passportConfig}
        onChange={handlePassportConfigChange}
        onBlur={handlePassportConfigFormat}
      />
      <br />
      <br />
      <h3>Items</h3>
      <textarea
        rows={20}
        cols={80}
        value={items}
        onChange={handleItemsChange}
        onBlur={handleItemsFormat}
      />
    </>
  );
}

export default PrimaryRevenueWebView;
