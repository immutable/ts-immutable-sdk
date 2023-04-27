import { Button, Heading } from '@biom3/react';
import { useContext } from 'react';
import { FooterLogo } from '../../../../../components/Footer/FooterLogo';
import { HeaderNavigation } from '../../../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../../../components/SimpleLayout/SimpleLayout';
import { ViewContext, ViewActions } from '../../../../../context/ViewContext';
import { InnerExampleWidgetViews } from '../../../../../context/InnerExampleViewContextTypes';

export const ViewThree = () => {
  const { viewDispatch } = useContext(ViewContext);

  return (
    <SimpleLayout
      header={<HeaderNavigation title="Inner Widget Example" showClose />}
      footer={<FooterLogo />}
    >
      <Heading>Something went wrong</Heading>
      <Button
        onClick={() => {
          viewDispatch({
            payload: {
              type: ViewActions.UPDATE_VIEW,
              view: {
                type: InnerExampleWidgetViews.VIEW_ONE,
              },
            },
          });
        }}
      >
        Start Over
      </Button>
    </SimpleLayout>
  );
};
