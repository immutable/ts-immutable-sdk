import { CreateWithdrawalResponse, ImmutableXConfiguration } from '@imtbl/core-sdk';
import { TokenAmount } from 'types';
import { Signers } from '../types';
export type PrepareWithdrawalWorkflowParams = TokenAmount & {
    signers: Signers;
    config: ImmutableXConfiguration;
};
export declare function prepareWithdrawalAction(params: PrepareWithdrawalWorkflowParams): Promise<CreateWithdrawalResponse>;
