import { Body, Button, Heading } from '@biom3/react';
import { useContext, useState } from 'react';
import { HeaderNavigation } from '../../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../../components/SimpleLayout/SimpleLayout';
import { FooterButton } from '../../../../components/Footer/FooterButton';
import { ImmutableNetworkHero } from '../../../../components/Hero/ImmutableNetworkHero';
import { TransitionExampleWidgetViews } from '../../../../context/view-context/TransitionExampleViewContextTypes';
import {
  ViewContext,
  ViewActions,
} from '../../../../context/view-context/ViewContext';

function ViewTwoContentOne() {
  return (
    <>
      <Heading>View Two</Heading>
      <Body>Some content here</Body>
    </>
  );
}

function ViewTwoContentTwo() {
  return (
    <>
      <Heading>View Two More</Heading>
      <Body>More content</Body>
    </>
  );
}

export function ViewTwo() {
  const { viewDispatch } = useContext(ViewContext);
  const [buttonText, setButtonText] = useState('Next');
  const [body, setBody] = useState(ViewTwoContentOne);
  const [hero, setHero] = useState<React.ReactNode>(<ImmutableNetworkHero />);
  // This is just an example of how we could set a function with react state
  // See ViewThree for how to change content using an enum and a useCallback function to ensure its only created
  // once with no dependencies The ViewThree implementation is the preferred method as in this case for ViewTwo
  // the functions are recreated on re-render
  // TODO: TODO: Fix use before defined error
  // eslint-disable-next-line
  const [actionFunction, setActionFunction] = useState(() => actionPrevious);

  function actionPrevious() {
    setButtonText('Previous');
    setBody(ViewTwoContentTwo);
    // TODO: TODO: Fix use before defined error
    // eslint-disable-next-line
    setActionFunction(() => actionNext);
    setHero(<ImmutableNetworkHero />);
  }

  function actionNext() {
    setButtonText('Next');
    setBody(ViewTwoContentOne);
    setActionFunction(() => actionPrevious);
    setHero(<ImmutableNetworkHero />);
  }

  return (
    <SimpleLayout
      header={<HeaderNavigation showBack transparent />}
      footer={(
        <FooterButton
          actionText={buttonText}
          onActionClick={() => actionFunction()}
        />
      )}
      heroContent={hero}
      floatHeader
    >
      {body}
      <Button
        onClick={() => {
          viewDispatch({
            payload: {
              type: ViewActions.UPDATE_VIEW,
              view: {
                type: TransitionExampleWidgetViews.VIEW_THREE,
              },
            },
          });
        }}
      >
        Go To View Three
      </Button>
    </SimpleLayout>
  );
}
