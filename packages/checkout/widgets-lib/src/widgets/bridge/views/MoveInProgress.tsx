import { TokenInfo } from '@imtbl/checkout-sdk';
import { TransactionResponse } from '@ethersproject/providers';
import { useContext, useEffect } from 'react';
import { CompletionStatus, WaitForDepositResponse } from '@imtbl/bridge-sdk';
import { SimpleTextBody } from '../../../components/Body/SimpleTextBody';
import { HeaderNavigation } from '../../../components/Header/HeaderNavigation';
import { BridgeHero } from '../../../components/Hero/BridgeHero';
import { SimpleLayout } from '../../../components/SimpleLayout/SimpleLayout';
import { text } from '../../../resources/text/textConfig';
import { sendBridgeWidgetCloseEvent } from '../BridgeWidgetEvents';
import { BridgeWidgetViews, PrefilledBridgeForm } from '../../../context/view-context/BridgeViewContextTypes';
import { ViewActions, ViewContext } from '../../../context/view-context/ViewContext';
import { BridgeContext } from '../context/BridgeContext';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';

interface MoveInProgressProps {
  token: TokenInfo,
  transactionResponse: TransactionResponse,
  bridgeForm: PrefilledBridgeForm,
}

export function MoveInProgress({ token, transactionResponse, bridgeForm }: MoveInProgressProps) {
  const { viewDispatch } = useContext(ViewContext);
  const { eventTargetState: { eventTarget } } = useContext(EventTargetContext);

  const { heading, body1, body2 } = text.views[BridgeWidgetViews.IN_PROGRESS];
  const {
    bridgeState: {
      tokenBridge,
    },
  } = useContext(BridgeContext);

  useEffect(() => {
    if (!tokenBridge) return;

    (async () => {
      try {
        const receipt = await transactionResponse.wait();

        if (receipt.status === 1) {
          const bridgeResult: WaitForDepositResponse = await tokenBridge.waitForDeposit({
            transactionHash: receipt.transactionHash,
          });

          if (bridgeResult.status === CompletionStatus.SUCCESS) {
            viewDispatch({
              payload: {
                type: ViewActions.UPDATE_VIEW,
                view: {
                  type: BridgeWidgetViews.SUCCESS,
                  data: {
                    transactionHash: receipt.transactionHash,
                  },
                },
              },
            });
            return;
          }
        }

        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: {
              type: BridgeWidgetViews.FAIL,
              data: bridgeForm,
            },
          },
        });
      } catch (err) {
        viewDispatch({
          payload: {
            type: ViewActions.UPDATE_VIEW,
            view: {
              type: BridgeWidgetViews.FAIL,
              data: bridgeForm,
              reason: 'Transaction failed',
            },
          },
        });
      }
    })();
  }, [transactionResponse, tokenBridge]);

  return (
    <SimpleLayout
      testId="move-in-progress-view"
      header={(
        <HeaderNavigation
          transparent
          onCloseButtonClick={() => sendBridgeWidgetCloseEvent(eventTarget)}
        />
      )}
      heroContent={<BridgeHero />}
      floatHeader
    >
      <SimpleTextBody heading={heading}>
        {body1(token?.symbol)}
        <br />
        <br />
        {body2}
      </SimpleTextBody>
    </SimpleLayout>
  );
}
