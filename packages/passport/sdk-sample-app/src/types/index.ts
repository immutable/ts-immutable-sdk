import { Dispatch, SetStateAction, PropsWithChildren } from 'react';

export enum EnvironmentNames {
  DEV = 'dev',
  SANDBOX = 'sandbox',
  PRODUCTION = 'production',
}

export type CardStackPropsType = PropsWithChildren<{
  title: string;
}>;

export interface EnvironmentPropsType {
  disabled: boolean
}

export interface BulkTransferProps {
  showBulkTransfer: boolean
  setShowBulkTransfer: Dispatch<SetStateAction<boolean>>
}

export interface TransferProps {
  showTransfer: boolean
  setShowTransfer: Dispatch<SetStateAction<boolean>>
}

export interface TradeProps {
  showTrade: boolean
  setShowTrade: Dispatch<SetStateAction<boolean>>
}

export interface OrderProps {
  show: boolean
  setShow: Dispatch<SetStateAction<boolean>>
}

export interface RequestProps {
  showRequest: boolean;
  setShowRequest: Dispatch<SetStateAction<boolean>>;
}
