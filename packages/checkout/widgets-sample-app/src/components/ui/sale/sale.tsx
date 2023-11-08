import { useEffect, useMemo, useState } from 'react';
import { Environment } from '@imtbl/config';
import { config, passport } from '@imtbl/sdk';
import { WidgetsFactory } from '@imtbl/checkout-widgets';
import { SaleEventType, SaleItem, WidgetTheme, WidgetType } from '@imtbl/checkout-sdk';
import { Checkout } from '@imtbl/checkout-sdk';
import { Passport } from '@imtbl/passport';

const defaultPassportConfig = {
  environment: 'sandbox',
  clientId: 'XuGsHvMqMJrb73diq1fCswWwn4AYhcM6',
  redirectUri: 'http://localhost:3000/sale?login=true',
  logoutRedirectUri: 'http://localhost:3000/sale?logout=true',
  audience: 'platform_api',
  scope: 'openid offline_access email transact',
};

const defaultItems: SaleItem[] = [
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
  const fromContractAddress = urlParams.get('fromContractAddress') as string;

  return {
    login,
    amount,
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
    return undefined;
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

export function SaleUI() {
  const params = useParams();
  const {
    login, amount, environmentId, fromContractAddress,
  } = params;
  const [passportConfig, setPassportConfig] = useState(
    JSON.stringify(defaultPassportConfig, null, 2),
  );
  const [items, setItems] = useState(JSON.stringify(defaultItems, null, 2));

  const passportInstance = useMemo(() => usePassportInstance(JSON.parse(passportConfig)), []);
  const checkout = useMemo(() => new Checkout({baseConfig: {environment: Environment.SANDBOX}, passport: passportInstance as unknown as Passport}), [passportInstance])
  const factory = useMemo(() => new WidgetsFactory(checkout, {theme: WidgetTheme.DARK}), [checkout])
  const saleWidget = useMemo(() => factory.create(WidgetType.SALE, {theme: WidgetTheme.DARK}), 
  [factory, amount, environmentId, fromContractAddress, defaultItems]
  )

  // mount sale widget and subscribe to close event
  useEffect(() => {
    saleWidget.mount("sale", {
      amount, 
      environmentId, 
      fromContractAddress, 
      items: defaultItems
    });
    saleWidget.addListener(SaleEventType.CLOSE_WIDGET, () => { saleWidget.unmount()})
  }, [saleWidget])

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

  useEffect(() => {
    if (passportInstance && login) {
      passportInstance.loginCallback();
    }
  }, [login, passportInstance]);

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



  return (
    <>
    <div id="sale"></div>
    <button onClick={() => saleWidget.mount('sale', {
      amount, 
      environmentId, 
      fromContractAddress, 
      items: defaultItems
    })}>Mount</button>
    <button onClick={() => saleWidget.unmount()}>Unmount</button>
    <button onClick={() => saleWidget.update({config: {theme: WidgetTheme.LIGHT}})}>Update Config Light</button>
    <button onClick={() => saleWidget.update({config: {theme: WidgetTheme.DARK}})}>Update Config Dark</button>
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
