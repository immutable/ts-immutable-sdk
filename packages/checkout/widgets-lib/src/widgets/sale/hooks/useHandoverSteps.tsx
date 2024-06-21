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

export const getRiveAnimationName = (transactionMethod: TransactionMethod) => {
  switch (transactionMethod) {
    case TransactionMethod.APPROVE:
      return '/access-coins.riv';
    case TransactionMethod.EXECUTE:
      return '/purchasing-items.riv';
    default:
      return '';
  }
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
            animationName: 'Processing',
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
            animationName: 'Processing',
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
            animationName: 'Processing',
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
            animationName: 'Processing',
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
            animationName: 'Processing',
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
            animationName: 'Processing',
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
