import {
  ReactNode, useCallback, useState,
} from 'react';
import { SimpleTextBody } from '../../components/Body/SimpleTextBody';
import { FooterButton } from '../../components/Footer/FooterButton';
import { HeaderNavigation } from '../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../components/SimpleLayout/SimpleLayout';
import { ConnectWidgetViews } from '../../context/view-context/ConnectViewContextTypes';
import { text } from '../../resources/text/textConfig';

export interface SwitchNetworkProps {
  heroContent: ReactNode;
  switchNetwork: () => void;
  onClose: () => void;
  zkNetwork: boolean;
}

export function SwitchNetwork(props: SwitchNetworkProps) {
  const {
    heroContent, switchNetwork, onClose, zkNetwork,
  } = props;

  const { eth, zkEVM } = text.views[ConnectWidgetViews.SWITCH_NETWORK];

  const textContent = zkNetwork ? zkEVM : eth;

  const [buttonText, setButtonText] = useState(textContent.button.text);

  const handleSwitchNetwork = useCallback(async () => {
    try {
      await switchNetwork();
    } catch {
      setButtonText(textContent.button.retryText);
    }
  }, [switchNetwork]);

  return (
    <SimpleLayout
      testId="switch-network-view"
      header={(
        <HeaderNavigation
          transparent
          onCloseButtonClick={onClose}
        />
      )}
      footer={(
        <FooterButton
          actionText={buttonText}
          onActionClick={handleSwitchNetwork}
        />
      )}
      heroContent={heroContent}
      floatHeader
    >
      <SimpleTextBody heading={textContent.heading}>{textContent.body}</SimpleTextBody>
    </SimpleLayout>
  );
}
