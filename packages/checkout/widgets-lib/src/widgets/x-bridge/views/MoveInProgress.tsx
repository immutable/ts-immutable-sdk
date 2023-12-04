import { useContext } from 'react';
import { SimpleTextBody } from '../../../components/Body/SimpleTextBody';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { RocketHero } from '../../../components/Hero/RocketHero';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { text } from '../../../resources/text/textConfig';
import { sendBridgeWidgetCloseEvent } from '../BridgeWidgetEvents';
import { FooterLogo } from '../../../components/Footer/FooterLogo';
import { BridgeWidgetViews } from '../../../context/view-context/BridgeViewContextTypes';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';

export function MoveInProgress() {
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

  const { heading, body2 } = text.views[BridgeWidgetViews.IN_PROGRESS];
  // const {
  //   bridgeState: {},
  // } = useContext(XBridgeContext);

  // useEffect(() => {
  //   if (!tokenBridge) return;

  //   (async () => {
  //     try {
  //       const receipt = await transactionResponse.wait();

  //       if (receipt.status === 1) {
  //         const bridgeResult: WaitForDepositResponse = await tokenBridge.waitForDeposit({
  //           transactionHash: receipt.transactionHash,
  //         });

  //         if (bridgeResult.status === CompletionStatus.SUCCESS) {
  //           viewDispatch({
  //             payload: {
  //               type: ViewActions.UPDATE_VIEW,
  //               view: {
  //                 type: BridgeWidgetViews.SUCCESS,
  //                 data: {
  //                   transactionHash: receipt.transactionHash,
  //                 },
  //               },
  //             },
  //           });
  //           return;
  //         }
  //       }

  //       viewDispatch({
  //         payload: {
  //           type: ViewActions.UPDATE_VIEW,
  //           view: {
  //             type: BridgeWidgetViews.FAIL,
  //             data: bridgeForm,
  //           },
  //         },
  //       });
  //     } catch (err) {
  //       viewDispatch({
  //         payload: {
  //           type: ViewActions.UPDATE_VIEW,
  //           view: {
  //             type: BridgeWidgetViews.FAIL,
  //             data: bridgeForm,
  //             reason: 'Transaction failed',
  //           },
  //         },
  //       });
  //     }
  //   })();
  // }, [transactionResponse, tokenBridge]);

  return (
    <SimpleLayout
      testId="move-in-progress-view"
      header={(
        <HeaderNavigation
          transparent
          onCloseButtonClick={() => sendBridgeWidgetCloseEvent(eventTarget)}
        />
      )}
      footer={(
        <FooterLogo />
      )}
      heroContent={<RocketHero />}
      floatHeader
    >
      <SimpleTextBody heading={heading}>
        {body2}
      </SimpleTextBody>
    </SimpleLayout>
  );
}
