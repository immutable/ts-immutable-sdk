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
import { sendAddTokensCloseEvent } from '../AddTokensWidgetEvents';
import { EventTargetContext } from '../../../context/event-target-context/EventTargetContext';

export enum AddTokensHandoverStep {
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
  AddTokensHandoverStep,
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
    [AddTokensHandoverStep.PREPARING]: () => ({
      animationPath: APPROVE_TXN_ANIMATION,
      state: RiveStateMachineInput.START,
      headingText: t('views.ADD_TOKENS.handover.preparing.heading'),
    }),
    [AddTokensHandoverStep.REQUEST_APPROVAL]: () => ({
      animationPath: APPROVE_TXN_ANIMATION,
      state: RiveStateMachineInput.WAITING,
      headingText: t('views.ADD_TOKENS.handover.requestingApproval.heading'),
      subheadingText: t('views.ADD_TOKENS.handover.requestingApproval.subHeading'),
    }),
    [AddTokensHandoverStep.APPROVAL_CONFIRMED]: () => ({
      animationPath: APPROVE_TXN_ANIMATION,
      state: RiveStateMachineInput.COMPLETED,
      headingText: t('views.ADD_TOKENS.handover.approved.heading'),
      duration: FIXED_HANDOVER_DURATION,
    }),
    [AddTokensHandoverStep.REQUEST_EXECUTION]: () => ({
      animationPath: EXECUTE_TXN_ANIMATION,
      state: RiveStateMachineInput.WAITING,
      headingText: t('views.ADD_TOKENS.handover.requestingExecution.heading'),
      subheadingText: t('views.ADD_TOKENS.handover.requestingExecution.subHeading'),
    }),
    [AddTokensHandoverStep.SUCCESS_ZKEVM]: ({ transactionHash }) => ({
      animationPath: EXECUTE_TXN_ANIMATION,
      state: RiveStateMachineInput.COMPLETED,
      headingText: t('views.ADD_TOKENS.handover.executedZkEVM.heading'),
      subheadingText: (
        <Trans
          i18nKey={t('views.ADD_TOKENS.handover.executedZkEVM.subHeading')}
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
      primaryButtonText: t('views.ADD_TOKENS.handover.executed.primaryButtonText'),
      onPrimaryButtonClick: () => {
        sendAddTokensCloseEvent(eventTarget);
      },
    }),
    [AddTokensHandoverStep.SUCCESS]: ({ axelarscanUrl }) => ({
      animationPath: EXECUTE_TXN_ANIMATION,
      state: RiveStateMachineInput.COMPLETED,
      headingText: t('views.ADD_TOKENS.handover.executed.heading'),
      subheadingText: (
        <Trans
          i18nKey={t('views.ADD_TOKENS.handover.executed.subHeading')}
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
      primaryButtonText: t('views.ADD_TOKENS.handover.executed.primaryButtonText'),
      onPrimaryButtonClick: () => {
        sendAddTokensCloseEvent(eventTarget);
      },
    }),
    [AddTokensHandoverStep.EXECUTING]: ({ routeDuration, axelarscanUrl }) => ({
      animationPath: EXECUTE_TXN_ANIMATION,
      state: RiveStateMachineInput.PROCESSING,
      headingText: t('views.ADD_TOKENS.handover.executing.heading'),
      subheadingText: (
        <>
          {t('views.ADD_TOKENS.handover.executing.subHeadingDuration', {
            duration: routeDuration,
          })}
          <br />
          <Trans
            i18nKey={t('views.ADD_TOKENS.handover.executing.subHeading')}
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
    [AddTokensHandoverStep.NEEDS_GAS]: ({ axelarscanUrl }) => ({
      animationPath: APPROVE_TXN_ANIMATION,
      state: RiveStateMachineInput.COMPLETED,
      headingText: t('views.ADD_TOKENS.handover.needsGas.heading'),
      subheadingText: (
        <Trans
          i18nKey={t('views.ADD_TOKENS.handover.needsGas.subHeading')}
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
      primaryButtonText: t('views.ADD_TOKENS.handover.needsGas.primaryButtonText'),
      onPrimaryButtonClick: () => {
        window.open(axelarscanUrl, '_blank', 'noreferrer');
      },
      secondaryButtonText: t('views.ADD_TOKENS.handover.needsGas.secondaryButtonText'),
      onSecondaryButtonClick: () => {
        sendAddTokensCloseEvent(eventTarget);
      },
    }),
    [AddTokensHandoverStep.PARTIAL_SUCCESS]: () => ({
      animationPath: APPROVE_TXN_ANIMATION,
      state: RiveStateMachineInput.COMPLETED,
      headingText: t('views.ADD_TOKENS.handover.partialSuccess.heading'),
      subheadingText: (
        <Trans
          i18nKey={t('views.ADD_TOKENS.handover.partialSuccess.subHeading')}
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
      primaryButtonText: t('views.ADD_TOKENS.handover.partialSuccess.primaryButtonText'),
      onPrimaryButtonClick: () => {
        window.open(TOOLKIT_SQUID_URL, '_blank', 'noreferrer');
      },
      secondaryButtonText: t('views.ADD_TOKENS.handover.partialSuccess.secondaryButtonText'),
      onSecondaryButtonClick: () => {
        sendAddTokensCloseEvent(eventTarget);
      },
    }),
    [AddTokensHandoverStep.FAIL]: ({ axelarscanUrl }) => ({
      animationPath: APPROVE_TXN_ANIMATION,
      state: RiveStateMachineInput.COMPLETED,
      headingText: t('views.ADD_TOKENS.handover.statusFailed.heading'),
      subheadingText: (
        <Trans
          i18nKey={t('views.ADD_TOKENS.handover.statusFailed.subHeading')}
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
      secondaryButtonText: t('views.ADD_TOKENS.handover.statusFailed.secondaryButtonText'),
      onSecondaryButtonClick: () => {
        sendAddTokensCloseEvent(eventTarget);
      },
    }),
  };

  const showHandover = useCallback(
    (step: AddTokensHandoverStep, params: HandoverParams = {}) => {
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
