import { Button, Heading } from '@biom3/react';
import { useContext } from 'react';
import { FooterLogo } from '../../../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../../../components/SimpleLayout/SimpleLayout';
import { ViewContext, ViewActions } from '../../../../../context/ViewContext';
import { InnerExampleWidgetViews } from '../../../../../context/InnerExampleViewContextTypes';
import { Checkout, ConnectionProviders } from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';

export const ViewOne = () => {
  const { viewDispatch } = useContext(ViewContext);

  const checkout = new Checkout({
    baseConfig: { environment: Environment.PRODUCTION },
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
