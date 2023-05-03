import { useContext } from 'react';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { ViewContext } from '../../../context/ViewContext';
import { ConnectWidgetViews } from '../../../context/ConnectViewContextTypes';
import { Body } from '@biom3/react';
import { sendConnectWidgetCloseEvent } from '../ConnectWidgetEvents';

export const ConnectResult = () => {
  const { viewState } = useContext(ViewContext);
  return (
    <SimpleLayout
      header={
        <HeaderNavigation
          showClose
          showBack
          onCloseButtonClick={sendConnectWidgetCloseEvent}
        />
      }
      footer={<FooterLogo />}
    >
      {viewState.view.type === ConnectWidgetViews.SUCCESS && (
        <Body testId="success">User connected</Body>
      )}
      {viewState.view.type === ConnectWidgetViews.FAIL && (
        <Body testId="fail">User did not connect</Body>
      )}
    </SimpleLayout>
  );
};
