import { Button, Heading } from '@biom3/react';
import { useContext } from 'react';
import { FooterLogo } from '../../../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../../../components/SimpleLayout/SimpleLayout';
import { Checkout, ConnectionProviders } from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { InnerExampleWidgetViews } from '../../../../../context/view-context/InnerExampleViewContextTypes';
import {
  ViewContext,
  ViewActions,
} from '../../../../../context/view-context/ViewContext';

export const ViewOne = () => {
  const { viewDispatch } = useContext(ViewContext);

  const checkout = new Checkout({
    baseConfig: { environment: Environment.SANDBOX },
  });

  async function metamaskClick() {
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

  return (
    <SimpleLayout
      header={<HeaderNavigation title="Inner Widget Example" />}
      footer={<FooterLogo />}
    >
      <Heading>Connect your wallet</Heading>
      <Button onClick={metamaskClick}>Connect to Metamask</Button>
    </SimpleLayout>
  );
};
