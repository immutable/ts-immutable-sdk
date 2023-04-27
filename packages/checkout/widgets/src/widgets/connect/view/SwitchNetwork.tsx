import { FooterButton } from '../../../components/Footer/FooterButton';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import ImmutableNetwork from '../../../assets/ImmutableNetwork.svg';
import { SimpleTextBody } from '../../../components/Body/SimpleTextBody';
import { useContext, useState } from 'react';
import { ConnectContext } from '../context/ConnectContext';
import {
  ChainId,
  ConnectionProviders,
  ConnectResult,
} from '@imtbl/checkout-sdk-web';
import { ViewActions, ViewContext } from '../../../context/ViewContext';
import { ConnectWidgetViews } from '../../../context/ConnectViewContextTypes';

export const SwitchNetwork = () => {
  const { viewDispatch } = useContext(ViewContext);
  const { connectState } = useContext(ConnectContext);
  const { checkout, provider } = connectState;

  const [buttonText, setButtonText] = useState('Ready to Switch');

  const switchNetwork = async () => {
    if (!provider) return;

    try {
      const switchNetwork = await checkout!.switchNetwork({
        provider,
        chainId: ChainId.POLYGON,
      });

      const connectResult: ConnectResult = await checkout!.connect({
        providerPreference: ConnectionProviders.METAMASK,
      });

      if (switchNetwork.network.chainId !== ChainId.POLYGON) {
        // Is this a failure page?
      }

      viewDispatch({
        payload: {
          type: ViewActions.UPDATE_VIEW,
          view: {
            type: ConnectWidgetViews.SUCCESS,
          },
        },
      });
    } catch (err: any) {
      console.log(err.code, err.message);
      setButtonText('Try Again');
    }
  };

  return (
    <SimpleLayout
      header={<HeaderNavigation showClose transparent={true} />}
      footer={
        <FooterButton
          actionText={buttonText}
          onActionClick={() => switchNetwork()}
        />
      }
      heroImage={ImmutableNetwork}
      floatHeader={true}
    >
      <SimpleTextBody
        heading="To trade here, MetaMask will ask you to switch to the Immutable zkEVM
        network"
      >
        Check for the pop-up from MetaMask and ‘Approve’ to switch. If this is
        the first time, MetaMask will also ask you to add the network.
      </SimpleTextBody>
    </SimpleLayout>
  );
};
