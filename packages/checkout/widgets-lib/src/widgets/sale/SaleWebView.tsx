import { useEffect, useRef, useState } from 'react';
import { Environment } from '@imtbl/config';
import { config, passport } from '@imtbl/sdk';

import {
  IMTBLWidgetEvents,
  SaleEventType,
} from '@imtbl/checkout-widgets';
import { WidgetTheme } from '../../lib';
import { ImmutableWebComponent } from '../ImmutableWebComponent';
import { Item } from './types';

const defaultPassportConfig = {
  environment: 'sandbox',
  clientId: 'sWMLNvDrK5F8ibNWOqYgdKWsUtdLLz4J',
  redirectUri: 'http://localhost:3001/sale?login=true',
  logoutRedirectUri: 'http://localhost:3001/sale?logout=true',
  audience: 'platform_api',
  scope: 'openid offline_access email transact',
};

const defaultItems: Item[] = [
  {
    productId: 'P0001',
    qty: 3,
    name: 'Bulbasaur',
    image: 'https://pokemon-nfts.s3.ap-southeast-2.amazonaws.com/images/1.png',
    description: 'Bulbasaur',
  },
  {
    productId: 'P0002',
    qty: 2,
    name: 'Ivyasaur',
    image: 'https://pokemon-nfts.s3.ap-southeast-2.amazonaws.com/images/2.png',
    description: 'Ivyasaur',
  },
  {
    productId: 'P0003',
    qty: 1,
    name: 'Venusaur',
    image: 'https://pokemon-nfts.s3.ap-southeast-2.amazonaws.com/images/3.png',
    description: 'Venusaur',
  },
];

const useParams = () => {
  const urlParams = new URLSearchParams(window.location.search);

  const login = urlParams.get('login') as string;
  const amount = urlParams.get('amount') as string;
  const environmentId = urlParams.get('environmentId') as string;
  const env = urlParams.get('env') as string;
  const fromContractAddress = urlParams.get('fromContractAddress') as string;

  return {
    login,
    amount,
    env,
    environmentId,
    fromContractAddress,
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

function SaleWebView() {
  const params = useParams();
  const {
    login, amount, env, environmentId, fromContractAddress,
  } = params;
  const [passportConfig, setPassportConfig] = useState(
    JSON.stringify(defaultPassportConfig, null, 2),
  );
  const [items, setItems] = useState(JSON.stringify(defaultItems, null, 2));
  const [showWidget, setShowWidget] = useState(true);
  const ref = useRef<ImmutableWebComponent>(null);

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
    // eslint-disable-next-line no-console
    console.log('@@@@@ event', event.detail);

    switch (event.detail.type) {
      case SaleEventType.CLOSE_WIDGET: {
        setShowWidget(false);
        break;
      }
      default:
        // eslint-disable-next-line no-console
        console.log('Does not match any expected event type');
    }
  }) as EventListener;

  useEffect(() => {
    const widget = ref.current;
    const passportInstance = usePassportInstance(JSON.parse(passportConfig));
    widget?.addPassportOption(passportInstance as any);
  }, [passportConfig, items]);

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
      IMTBLWidgetEvents.IMTBL_SALE_WIDGET_EVENT,
      handleEvent,
    );

    return () => {
      window.removeEventListener(
        IMTBLWidgetEvents.IMTBL_SALE_WIDGET_EVENT,
        handleEvent,
      );
    };
  }, []);

  const widgetConfig = {
    theme: WidgetTheme.DARK,
    environment: Environment.SANDBOX,
  };

  const products = btoa(JSON.stringify(JSON.parse(items)));

  return (
    <>
      {showWidget ? (
        <imtbl-sale
          ref={ref}
          widgetConfig={JSON.stringify(widgetConfig)}
          amount={amount}
          products={products}
          fromContractAddress={fromContractAddress}
          environmentId={environmentId}
          env={env}
        />
      ) : undefined}

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

export default SaleWebView;
