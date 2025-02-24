import { ReactNode, useCallback, useContext } from 'react';
import { Environment } from '@imtbl/config';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from '@biom3/react';
import { RiveStateMachineInput } from '../../../types/HandoverTypes';
import { getRemoteRive } from '../../../lib/utils';
import { useHandover } from '../../../lib/hooks/useHandover';
import { HandoverTarget } from '../../../context/handover-context/HandoverContext';
import { HandoverContent } from '../../../components/Handover/HandoverContent';
import {
  APPROVE_TXN_ANIMATION, EXECUTE_TXN_ANIMATION, FIXED_HANDOVER_DURATION, TOOLKIT_SQUID_URL,
} from '../../../lib/squid/config';
import { sendPurchaseCloseEvent } from '../PurchaseWidgetEvents';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';

export enum PurchaseHandoverStep {
  PREPARING = 'preparing',
  REQUEST_APPROVAL = 'requestApproval',
  APPROVAL_CONFIRMED = 'approvalConfirmed',
  REQUEST_EXECUTION = 'requestExecution',
  SUCCESS_ZKEVM = 'successZkEVM',
  EXECUTING = 'executing',
  SUCCESS = 'success',
  NEEDS_GAS = 'needsGas',
  PARTIAL_SUCCESS = 'partialSuccess',
  FAIL = 'FAIL',
}

interface HandoverParams {
  axelarscanUrl?: string;
  transactionHash?: string;
  routeDuration?: string;
}

export const useHandoverConfig = (environment: Environment) => {
  const { t } = useTranslation();
  const { addHandover } = useHandover({
    id: HandoverTarget.GLOBAL,
  });
  const {
    eventTargetState: { eventTarget },
  } = useContext(EventTargetContext);

  const handoverConfigs: Record<
  PurchaseHandoverStep,
  (params: HandoverParams) => {
    animationPath: string;
    state: RiveStateMachineInput;
    headingText: string;
    subheadingText?: ReactNode;
    primaryButtonText?: string;
    onPrimaryButtonClick?: () => void;
    secondaryButtonText?: string;
    onSecondaryButtonClick?: () => void;
    duration?: number;
  }
  > = {
    [PurchaseHandoverStep.PREPARING]: () => ({
      animationPath: APPROVE_TXN_ANIMATION,
      state: RiveStateMachineInput.START,
      headingText: t('views.PURCHASE.handover.preparing.heading'),
    }),
    [PurchaseHandoverStep.REQUEST_APPROVAL]: () => ({
      animationPath: APPROVE_TXN_ANIMATION,
      state: RiveStateMachineInput.WAITING,
      headingText: t('views.PURCHASE.handover.requestingApproval.heading'),
      subheadingText: t('views.PURCHASE.handover.requestingApproval.subHeading'),
    }),
    [PurchaseHandoverStep.APPROVAL_CONFIRMED]: () => ({
      animationPath: APPROVE_TXN_ANIMATION,
      state: RiveStateMachineInput.COMPLETED,
      headingText: t('views.PURCHASE.handover.approved.heading'),
      duration: FIXED_HANDOVER_DURATION,
    }),
    [PurchaseHandoverStep.REQUEST_EXECUTION]: () => ({
      animationPath: EXECUTE_TXN_ANIMATION,
      state: RiveStateMachineInput.WAITING,
      headingText: t('views.PURCHASE.handover.requestingExecution.heading'),
    }),
    [PurchaseHandoverStep.SUCCESS_ZKEVM]: ({ transactionHash }) => ({
      animationPath: EXECUTE_TXN_ANIMATION,
      state: RiveStateMachineInput.COMPLETED,
      headingText: t('views.PURCHASE.handover.executedZkEVM.heading'),
      subheadingText: (
        <Trans
          i18nKey={t('views.PURCHASE.handover.executedZkEVM.subHeading')}
          components={{
            explorerLink: (
              <Link
                size="small"
                rc={(
                  <a
                    target="_blank"
                    href={`https://explorer.immutable.com/tx/${transactionHash}`}
                    rel="noreferrer"
                  />
                )}
              />
            ),
          }}
        />
      ),
      primaryButtonText: t('views.PURCHASE.handover.executed.primaryButtonText'),
      onPrimaryButtonClick: () => {
        sendPurchaseCloseEvent(eventTarget);
      },
    }),
    [PurchaseHandoverStep.SUCCESS]: ({ axelarscanUrl }) => ({
      animationPath: EXECUTE_TXN_ANIMATION,
      state: RiveStateMachineInput.COMPLETED,
      headingText: t('views.PURCHASE.handover.executed.heading'),
      subheadingText: (
        <Trans
          i18nKey={t('views.PURCHASE.handover.executed.subHeading')}
          components={{
            axelarscanLink: (
              <Link
                size="small"
                rc={(
                  <a target="_blank" href={axelarscanUrl} rel="noreferrer" />
                )}
              />
            ),
          }}
        />
      ),
      primaryButtonText: t('views.PURCHASE.handover.executed.primaryButtonText'),
      onPrimaryButtonClick: () => {
        sendPurchaseCloseEvent(eventTarget);
      },
    }),
    [PurchaseHandoverStep.EXECUTING]: ({ routeDuration, axelarscanUrl }) => ({
      animationPath: EXECUTE_TXN_ANIMATION,
      state: RiveStateMachineInput.PROCESSING,
      headingText: t('views.PURCHASE.handover.executing.heading'),
      subheadingText: (
        <>
          {t('views.PURCHASE.handover.executing.subHeadingDuration', {
            duration: routeDuration,
          })}
          <br />
          <Trans
            i18nKey={t('views.PURCHASE.handover.executing.subHeading')}
            components={{
              axelarscanLink: (
                <Link
                  size="small"
                  rc={(
                    <a target="_blank" href={axelarscanUrl} rel="noreferrer" />
                  )}
                />
              ),
            }}
          />
        </>
      ),
    }),
    [PurchaseHandoverStep.NEEDS_GAS]: ({ axelarscanUrl }) => ({
      animationPath: APPROVE_TXN_ANIMATION,
      state: RiveStateMachineInput.COMPLETED,
      headingText: t('views.PURCHASE.handover.needsGas.heading'),
      subheadingText: (
        <Trans
          i18nKey={t('views.PURCHASE.handover.needsGas.subHeading')}
          components={{
            axelarscanLink: (
              <Link
                size="small"
                rc={(
                  <a target="_blank" href={axelarscanUrl} rel="noreferrer" />
                )}
              />
            ),
          }}
        />
      ),
      primaryButtonText: t('views.PURCHASE.handover.needsGas.primaryButtonText'),
      onPrimaryButtonClick: () => {
        window.open(axelarscanUrl, '_blank', 'noreferrer');
      },
      secondaryButtonText: t('views.PURCHASE.handover.needsGas.secondaryButtonText'),
      onSecondaryButtonClick: () => {
        sendPurchaseCloseEvent(eventTarget);
      },
    }),
    [PurchaseHandoverStep.PARTIAL_SUCCESS]: () => ({
      animationPath: APPROVE_TXN_ANIMATION,
      state: RiveStateMachineInput.COMPLETED,
      headingText: t('views.PURCHASE.handover.partialSuccess.heading'),
      subheadingText: (
        <Trans
          i18nKey={t('views.PURCHASE.handover.partialSuccess.subHeading')}
          components={{
            squidLink: (
              <Link
                size="small"
                rc={(
                  <a target="_blank" href={TOOLKIT_SQUID_URL} rel="noreferrer" />
                )}
              />
            ),
          }}
        />
      ),
      primaryButtonText: t('views.PURCHASE.handover.partialSuccess.primaryButtonText'),
      onPrimaryButtonClick: () => {
        window.open(TOOLKIT_SQUID_URL, '_blank', 'noreferrer');
      },
      secondaryButtonText: t('views.PURCHASE.handover.partialSuccess.secondaryButtonText'),
      onSecondaryButtonClick: () => {
        sendPurchaseCloseEvent(eventTarget);
      },
    }),
    [PurchaseHandoverStep.FAIL]: ({ axelarscanUrl }) => ({
      animationPath: APPROVE_TXN_ANIMATION,
      state: RiveStateMachineInput.COMPLETED,
      headingText: t('views.PURCHASE.handover.statusFailed.heading'),
      subheadingText: (
        <Trans
          i18nKey={t('views.PURCHASE.handover.statusFailed.subHeading')}
          components={{
            axelarscanLink: (
              <Link
                size="small"
                rc={(
                  <a target="_blank" href={axelarscanUrl} rel="noreferrer" />
                )}
              />
            ),
          }}
        />
      ),
      secondaryButtonText: t('views.PURCHASE.handover.statusFailed.secondaryButtonText'),
      onSecondaryButtonClick: () => {
        sendPurchaseCloseEvent(eventTarget);
      },
    }),
  };

  const showHandover = useCallback(
    (step: PurchaseHandoverStep, params: HandoverParams = {}) => {
      const config = handoverConfigs[step](params);
      addHandover({
        animationUrl: getRemoteRive(environment, config.animationPath),
        inputValue: config.state,
        duration: config.duration,
        children: (
          <HandoverContent
            headingText={config.headingText}
            subheadingText={config.subheadingText}
            primaryButtonText={config.primaryButtonText}
            onPrimaryButtonClick={config.onPrimaryButtonClick}
            secondaryButtonText={config.secondaryButtonText}
            onSecondaryButtonClick={config.onSecondaryButtonClick}
          />
        ),
      });
    },
    [environment, handoverConfigs],
  );

  return {
    showHandover,
  };
};
