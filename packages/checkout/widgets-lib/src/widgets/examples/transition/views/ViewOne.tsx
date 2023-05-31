import { Button, Heading } from '@biom3/react';
import { useContext } from 'react';
import { FooterLogo } from '../../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../../components/SimpleLayout/SimpleLayout';
import { TransitionExampleWidgetViews } from '../../../../context/view-context/TransitionExampleViewContextTypes';
import {
  ViewContext,
  ViewActions,
} from '../../../../context/view-context/ViewContext';

export function ViewOne() {
  const { viewDispatch } = useContext(ViewContext);

  return (
    <SimpleLayout
      header={<HeaderNavigation title="Transition Example" />}
      footer={<FooterLogo />}
    >
      <Heading>View One</Heading>
      <Button
        onClick={() => {
          viewDispatch({
            payload: {
              type: ViewActions.UPDATE_VIEW,
              view: {
                type: TransitionExampleWidgetViews.VIEW_TWO,
              },
            },
          });
        }}
      >
        Go To View Two
      </Button>
    </SimpleLayout>
  );
}
