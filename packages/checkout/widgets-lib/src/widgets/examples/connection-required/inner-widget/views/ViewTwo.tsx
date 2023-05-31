import { Button, Heading } from '@biom3/react';
import { useContext } from 'react';
import { Checkout, ConnectionProviders } from '@imtbl/checkout-sdk';
import { Environment } from '@imtbl/config';
import { FooterLogo } from '../../../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../../../components/SimpleLayout/SimpleLayout';
import { zkEVMNetwork } from '../../../../../lib/networkUtils';
import { InnerExampleWidgetViews } from '../../../../../context/view-context/InnerExampleViewContextTypes';
import {
  ViewContext,
  ViewActions,
} from '../../../../../context/view-context/ViewContext';

export interface ViewTwoProps {
  callBack?: () => void;
}

export function ViewTwo({ callBack }: ViewTwoProps) {
  const { viewDispatch } = useContext(ViewContext);

  const checkout = new Checkout({
    baseConfig: { environment: Environment.SANDBOX },
  });

  async function connectPolygonClick() {
    // TODO: are you going to do something with the error?
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    const dispatchSuccess = () => callBack && callBack();

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
    }
  }

  return (
    <SimpleLayout
      header={<HeaderNavigation title="Inner Widget Example" />}
      footer={<FooterLogo />}
    >
      <Heading>Connect to our Network</Heading>
      <Button onClick={async () => await connectPolygonClick()}>Switch to Polygon</Button>
    </SimpleLayout>
  );
}
