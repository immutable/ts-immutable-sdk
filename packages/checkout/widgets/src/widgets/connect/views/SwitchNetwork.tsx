import { FooterButton } from '../../../components/Footer/FooterButton';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { SimpleTextBody } from '../../../components/Body/SimpleTextBody';
import { useContext, useState } from 'react';
import { ConnectContext } from '../context/ConnectContext';
import { ChainId, ConnectionProviders } from '@imtbl/checkout-sdk-web';
import { ViewActions, ViewContext } from '../../../context/ViewContext';
import { ConnectWidgetViews } from '../../../context/ConnectViewContextTypes';
import { ImmutableNetworkHero } from '../../../components/Hero/ImmutableNetworkHero';
import { text } from '../../../resources/text/textConfig';

export const SwitchNetwork = () => {
  const { viewDispatch } = useContext(ViewContext);
  const { connectState } = useContext(ConnectContext);
  const { checkout, provider } = connectState;
  const { heading, body } = text.views.SWITCH_NETWORK;

  const [buttonText, setButtonText] = useState('Ready to Switch');

  const switchNetwork = async () => {
    if (!provider) return;

    try {
      await checkout!.switchNetwork({
        provider,
        chainId: ChainId.POLYGON,
      });

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
      testId="switch-network-view"
      header={<HeaderNavigation showClose transparent={true} />}
      footer={
        <FooterButton
          actionText={buttonText}
          onActionClick={() => switchNetwork()}
        />
      }
      heroContent={<ImmutableNetworkHero />}
      floatHeader={true}
    >
      <SimpleTextBody heading={heading}>{body}</SimpleTextBody>
    </SimpleLayout>
  );
};
