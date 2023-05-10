import { Button, Heading } from '@biom3/react';
import { useContext } from 'react';
import { FooterLogo } from '../../../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../../../components/SimpleLayout/SimpleLayout';
import { ViewContext, ViewActions } from '../../../../../context/ViewContext';
import { InnerExampleWidgetViews } from '../../../../../context/InnerExampleViewContextTypes';
import { Checkout, ConnectionProviders } from '@imtbl/checkout-sdk';
import { zkEVMNetwork } from '../../../../../lib/networkUtils';

export interface ViewTwoProps {
  callBack?: () => void;
}

export const ViewTwo = ({ callBack }: ViewTwoProps) => {
  const { viewDispatch } = useContext(ViewContext);

  const checkout = new Checkout();

  async function connectPolygonClick() {
    try {
      const { provider } = await checkout.connect({
        providerPreference: ConnectionProviders.METAMASK,
      });

      if (checkout) {
        await checkout.switchNetwork({
          provider,
          chainId: zkEVMNetwork(checkout.config.environment),
        });
        dispatchSuccess();
      }
    } catch (err: any) {
      dispatchFail(err);
      return;
    }
  }

  const dispatchFail = (error: any) => {
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: InnerExampleWidgetViews.VIEW_THREE,
        },
      },
    });
  };

  const dispatchSuccess = () => {
    callBack && callBack();
  };

  return (
    <SimpleLayout
      header={<HeaderNavigation title="Inner Widget Example" />}
      footer={<FooterLogo />}
    >
      <Heading>Connect to our Network</Heading>
      <Button onClick={connectPolygonClick}>Switch to Polygon</Button>
    </SimpleLayout>
  );
};
