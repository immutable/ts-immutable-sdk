/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@biom3/react';
import { ConnectionProviders } from '@imtbl/checkout-sdk-web';
import { useContext } from 'react';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { ConnectWidgetViews } from '../../../context/ConnectViewContextTypes';
import { ViewContext, ViewActions } from '../../../context/ViewContext';
import { ButtonWrapperStyle } from '../ConnectStyles';
import { ConnectContext, ConnectActions } from '../context/ConnectContext';

export function OtherWallets() {
  const { connectState, connectDispatch } = useContext(ConnectContext);
  const { viewDispatch } = useContext(ViewContext);
  const { checkout } = connectState;

  async function metamaskClick() {
    try {
      if (!checkout) return;
      const connectResult = await checkout.connect({
        providerPreference: ConnectionProviders.METAMASK,
      });
      connectDispatch({
        payload: {
          type: ConnectActions.SET_PROVIDER,
          provider: connectResult.provider,
        },
      });
    } catch (err: any) {
      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: ConnectWidgetViews.FAIL,
            error: err,
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
          type: ConnectWidgetViews.SWITCH_NETWORK,
        },
      },
    });
  };

  return (
    <SimpleLayout
      header={<HeaderNavigation showClose showBack />}
      footer={<FooterLogo />}
    >
      <div className="imtbl-other-wallets">
        <Button
          testId="other-metamask"
          sx={ButtonWrapperStyle}
          onClick={metamaskClick}
        >
          MetaMask
        </Button>
        <Button
          testId="other-walletconnect"
          onClick={() => dispatchChooseNetworks()}
        >
          Wallet Connect
        </Button>
      </div>
    </SimpleLayout>
  );
}
