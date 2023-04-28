/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@biom3/react';
import { ChainId } from '@imtbl/checkout-sdk-web';
import { ConnectContext } from '../../context/ConnectContext';
import { useContext } from 'react';
import { ViewActions, ViewContext } from '../../../../context/ViewContext';
import { ConnectWidgetViews } from '../../../../context/ConnectViewContextTypes';
import { SimpleLayout } from '../../../../components/SimpleLayout/SimpleLayout';
import { HeaderNavigation } from '../../../../components/Header/HeaderNavigation';
import { FooterLogo } from '../../../../components/Footer/FooterLogo';
import { ImmutableNetworkHero } from '../../../../components/Hero/ImmutableNetworkHero';

export function ChooseNetwork() {
  const { viewDispatch } = useContext(ViewContext);
  const { connectState } = useContext(ConnectContext);
  const { checkout, provider } = connectState;

  const dispatchFail = (error: any) => {
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: ConnectWidgetViews.FAIL,
          error,
        },
      },
    });
  };

  const dispatchSuccess = () => {
    viewDispatch({
      payload: {
        type: ViewActions.UPDATE_VIEW,
        view: {
          type: ConnectWidgetViews.SUCCESS,
        },
      },
    });
  };

  async function connectPolygonClick() {
    try {
      if (!provider) {
        dispatchFail(new Error('No wallet provider connected'));
        return;
      }
      if (checkout) {
        await checkout.switchNetwork({ provider, chainId: ChainId.POLYGON });
        dispatchSuccess();
      }
    } catch (err: any) {
      dispatchFail(err);
      return;
    }
  }

  return (
    <SimpleLayout
      header={<HeaderNavigation showClose showBack transparent={true} />}
      footer={<FooterLogo />}
      heroContent={<ImmutableNetworkHero />}
      floatHeader={true}
    >
      <Button testId="network-zkevm" onClick={() => connectPolygonClick()}>
        Connect Polygon
      </Button>
    </SimpleLayout>
  );
}
