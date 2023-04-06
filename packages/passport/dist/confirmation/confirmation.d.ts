import { ConfirmationResult, Transaction } from './types';
import { PassportConfiguration } from '../config';
export default class ConfirmationScreen {
    private config;
    constructor(config: PassportConfiguration);
    private postMessage;
    startTransaction(accessToken: string, transaction: Transaction): Promise<ConfirmationResult>;
}
