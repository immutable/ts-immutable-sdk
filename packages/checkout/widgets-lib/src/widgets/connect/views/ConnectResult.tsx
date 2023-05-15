import { useContext } from 'react';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { ConnectWidgetViews } from '../../../context/view-context/ConnectViewContextTypes';
import { Body } from '@biom3/react';
import { ViewContext } from '../../../context/view-context/ViewContext';

export const ConnectResult = () => {
  const { viewState } = useContext(ViewContext);
  return (
    <SimpleLayout
      header={<HeaderNavigation showBack />}
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
