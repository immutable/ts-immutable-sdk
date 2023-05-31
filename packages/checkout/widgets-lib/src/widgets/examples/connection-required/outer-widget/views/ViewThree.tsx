import { Button, Heading } from '@biom3/react';
import { useContext } from 'react';
import { FooterLogo } from '../../../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../../../components/SimpleLayout/SimpleLayout';
import { OuterExampleWidgetViews } from '../../../../../context/view-context/OuterExampleViewContextTypes';
import {
  ViewContext,
  ViewActions,
} from '../../../../../context/view-context/ViewContext';

export function ViewThree() {
  const { viewDispatch } = useContext(ViewContext);

  return (
    <SimpleLayout
      header={<HeaderNavigation title="Outer Widget Example" />}
      footer={<FooterLogo />}
    >
      <Heading>View Three</Heading>
      <Button
        onClick={() => {
          viewDispatch({
            payload: {
              type: ViewActions.UPDATE_VIEW,
              view: {
                type: OuterExampleWidgetViews.VIEW_ONE,
              },
            },
          });
        }}
      >
        Go To View One
      </Button>
    </SimpleLayout>
  );
}
