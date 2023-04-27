import { Body, Button, Heading } from '@biom3/react';
import { HeaderNavigation } from '../../../../components/Header/HeaderNavigation';
import { SimpleLayout } from '../../../../components/SimpleLayout/SimpleLayout';
import PurpleDownGradient from '../../../../assets/PurpleDownGradient.svg';
import ImmutableNetwork from '../../../../assets/ImmutableNetwork.svg';
import { FooterButton } from '../../../../components/Footer/FooterButton';
import { useContext, useState } from 'react';
import { TransitionExampleWidgetViews } from '../../../../context/TransitionExampleViewContextTypes';
import { ViewActions, ViewContext } from '../../../../context/ViewContext';

export const ViewTwo = () => {
  const { viewDispatch } = useContext(ViewContext);
  const [buttonText, setButtonText] = useState('Next');
  const [body, setBody] = useState(ViewTwoContentOne);
  const [hero, setHero] = useState<string | undefined>(PurpleDownGradient);
  // This is just an example of how we could set a function with react state
  // See ViewThree for how to change content using an enum and a useCallback function to ensure its only created once with no dependencies
  // The ViewThree implementation is the preferred method as in this case for ViewTwo the functions are recreated on re-render
  const [actionFunction, setActionFunction] = useState(() => actionPrevious);

  function actionPrevious() {
    setButtonText('Previous');
    setBody(ViewTwoContentTwo);
    setActionFunction(() => actionNext);
    setHero(ImmutableNetwork);
  }

  function actionNext() {
    setButtonText('Next');
    setBody(ViewTwoContentOne);
    setActionFunction(() => actionPrevious);
    setHero(PurpleDownGradient);
  }

  return (
    <SimpleLayout
      header={<HeaderNavigation showClose showBack transparent={true} />}
      footer={
        <FooterButton
          actionText={buttonText}
          onActionClick={() => actionFunction()}
        />
      }
      heroImage={hero}
      floatHeader={true}
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
};

const ViewTwoContentOne = () => {
  return (
    <>
      <Heading>View Two</Heading>
      <Body>Some content here</Body>
    </>
  );
};

const ViewTwoContentTwo = () => {
  return (
    <>
      <Heading>View Two More</Heading>
      <Body>More content</Body>
    </>
  );
};
