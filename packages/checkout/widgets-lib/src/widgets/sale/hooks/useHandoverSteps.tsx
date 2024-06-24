import { useCallback } from 'react';
import { getRemoteRive } from 'lib/utils';
import { useHandover } from 'lib/hooks/useHandover';
import { useTranslation } from 'react-i18next';
import { HandoverTarget } from 'context/handover-context/HandoverContext';
import { Heading } from '@biom3/react';
import { Environment } from '@imtbl/config';
import { ExecuteTransactionStep } from '../types';

export enum TransactionMethod {
  APPROVE = 'approve(address spender,uint256 amount)',
  // eslint-disable-next-line max-len
  EXECUTE = 'execute(address multicallSigner, bytes32 reference, address[] targets, bytes[] data, uint256 deadline, bytes signature)',
}

type TransactionRiveAnimationsConfig = {
  url: string;
  stateMachine: string;
  input: string;
  inputValues: Record<string, StateMachineInput>;
};

export const getRiveAnimationName = (transactionMethod: TransactionMethod) => {
  switch (transactionMethod) {
    case TransactionMethod.APPROVE:
      return '/access_coins.riv';
    case TransactionMethod.EXECUTE:
      return '/purchasing_items.riv';
    default:
      return '';
  }
};

export enum StateMachineInput {
  START = 0,
  WAITING = 1,
  PROCESSING = 2,
  COMPLETED = 3,
  ERROR = 4,
}

export const transactionRiveAnimations: Record<
TransactionMethod,
TransactionRiveAnimationsConfig
> = {
  [TransactionMethod.APPROVE]: {
    url: getRiveAnimationName(TransactionMethod.APPROVE),
    stateMachine: 'State',
    input: 'mode',
    inputValues: {
      start: StateMachineInput.START,
      waiting: StateMachineInput.WAITING,
      processing: StateMachineInput.PROCESSING,
      completed: StateMachineInput.COMPLETED,
      error: StateMachineInput.ERROR,
    },
  },
  [TransactionMethod.EXECUTE]: {
    url: getRiveAnimationName(TransactionMethod.EXECUTE),
    stateMachine: 'State',
    input: 'mode',
    inputValues: {
      start: StateMachineInput.START,
      waiting: StateMachineInput.WAITING,
      processing: StateMachineInput.PROCESSING,
      completed: StateMachineInput.COMPLETED,
      error: StateMachineInput.ERROR,
    },
  },
};

export function useHandoverSteps(environment: Environment) {
  const { t } = useTranslation();
  const { addHandover } = useHandover({
    id: HandoverTarget.GLOBAL,
  });

  const onTxnStepExecuteNextTransaction = useCallback(
    (method: string, step: ExecuteTransactionStep) => {
      const key = `${method}-${step}`;
      switch (key) {
        case `${TransactionMethod.APPROVE}-${ExecuteTransactionStep.AFTER}`:
          addHandover({
            animationUrl: getRemoteRive(
              environment,
              getRiveAnimationName(TransactionMethod.APPROVE),
            ),
            inputValue:
              transactionRiveAnimations[TransactionMethod.APPROVE].inputValues
                .processing,
            children: (
              <Heading>
                {t('views.PAYMENT_METHODS.handover.approve.after')}
              </Heading>
            ),
          });
          break;

        case `${TransactionMethod.EXECUTE}-${ExecuteTransactionStep.AFTER}`:
          addHandover({
            animationUrl: getRemoteRive(
              environment,
              getRiveAnimationName(TransactionMethod.EXECUTE),
            ),
            inputValue:
              transactionRiveAnimations[TransactionMethod.EXECUTE].inputValues
                .processing,
            children: (
              <Heading>
                {t('views.PAYMENT_METHODS.handover.execute.after')}
              </Heading>
            ),
          });
          break;

        default:
      }
    },
    [environment, addHandover, t],
  );

  const onTxnStepExecuteAll = useCallback(
    (method: string, step: ExecuteTransactionStep) => {
      const key = `${method}-${step}`;
      switch (key) {
        case `${TransactionMethod.APPROVE}-${ExecuteTransactionStep.BEFORE}`:
          addHandover({
            animationUrl: getRemoteRive(
              environment,
              getRiveAnimationName(TransactionMethod.APPROVE),
            ),
            inputValue:
              transactionRiveAnimations[TransactionMethod.APPROVE].inputValues
                .processing,
            children: (
              <Heading>
                {t('views.PAYMENT_METHODS.handover.approve.before')}
              </Heading>
            ),
          });
          break;
        case `${TransactionMethod.APPROVE}-${ExecuteTransactionStep.AFTER}`:
          addHandover({
            animationUrl: getRemoteRive(
              environment,
              getRiveAnimationName(TransactionMethod.APPROVE),
            ),
            inputValue:
              transactionRiveAnimations[TransactionMethod.APPROVE].inputValues
                .processing,
            children: (
              <Heading>
                {t('views.PAYMENT_METHODS.handover.approve.after')}
              </Heading>
            ),
          });
          break;
        case `${TransactionMethod.EXECUTE}-${ExecuteTransactionStep.BEFORE}`:
          addHandover({
            animationUrl: getRemoteRive(
              environment,
              getRiveAnimationName(TransactionMethod.EXECUTE),
            ),
            inputValue:
              transactionRiveAnimations[TransactionMethod.EXECUTE].inputValues
                .processing,
            children: (
              <Heading>
                {t('views.PAYMENT_METHODS.handover.execute.before')}
              </Heading>
            ),
          });
          break;

        case `${TransactionMethod.EXECUTE}-${ExecuteTransactionStep.AFTER}`:
          addHandover({
            duration: 2000,
            animationUrl: getRemoteRive(
              environment,
              getRiveAnimationName(TransactionMethod.EXECUTE),
            ),
            inputValue:
              transactionRiveAnimations[TransactionMethod.EXECUTE].inputValues
                .processing,
            children: (
              <Heading>
                {t('views.PAYMENT_METHODS.handover.execute.after')}
              </Heading>
            ),
          });
          break;

        default:
      }
    },
    [environment, addHandover, t],
  );

  return {
    onTxnStepExecuteNextTransaction,
    onTxnStepExecuteAll,
  };
}
