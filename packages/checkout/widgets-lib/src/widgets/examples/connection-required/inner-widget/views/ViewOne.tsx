import { Button, Heading } from '@biom3/react';
import { useContext } from 'react';
import { Checkout, ConnectionProviders } from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { FooterLogo } from '../../../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../../../components/SimpleLayout/SimpleLayout';
import { InnerExampleWidgetViews } from '../../../../../context/view-context/InnerExampleViewContextTypes';
import {
  ViewContext,
  ViewActions,
} from '../../../../../context/view-context/ViewContext';

export function ViewOne() {
  const { viewDispatch } = useContext(ViewContext);

  const checkout = new Checkout({
    baseConfig: { environment: Environment.SANDBOX },
  });

  async function metamaskClick() {
    const dispatchChooseNetworks = () => {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: InnerExampleWidgetViews.VIEW_TWO,
          },
        },
      });
    };

    try {
      await checkout.connect({
        providerPreference: ConnectionProviders.METAMASK,
      });
    } catch (err: any) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: InnerExampleWidgetViews.VIEW_THREE,
          },
        },
      });
      return;
    }

    dispatchChooseNetworks();
  }

  return (
    <SimpleLayout
      header={<HeaderNavigation title="Inner Widget Example" />}
      footer={<FooterLogo />}
    >
      <Heading>Connect your wallet</Heading>
      <Button onClick={() => metamaskClick()}>Connect to Metamask</Button>
    </SimpleLayout>
  );
}
