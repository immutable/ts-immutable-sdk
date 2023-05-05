import { ChainId } from '@imtbl/checkout-sdk';
import { useContext, useState } from 'react';
import { SimpleTextBody } from '../../../components/Body/SimpleTextBody';
import { FooterButton } from '../../../components/Footer/FooterButton';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { ImmutableNetworkHero } from '../../../components/Hero/ImmutableNetworkHero';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { ConnectWidgetViews } from '../../../context/ConnectViewContextTypes';
import { ViewContext, ViewActions } from '../../../context/ViewContext';
import { text } from '../../../resources/text/textConfig';
import { ConnectContext } from '../context/ConnectContext';

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
      header={<HeaderNavigation transparent={true} />}
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
