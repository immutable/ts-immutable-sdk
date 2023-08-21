import { Dispatch, SetStateAction, PropsWithChildren } from 'react';
import { RequestArguments } from '@imtbl/passport';
import { Order } from '@imtbl/core-sdk';

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

export interface ModalProps {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
}

export interface MakeOfferModalProps extends ModalProps {
  order?: Order;
  onClose?: () => void;
}

export interface RequestExampleProps {
  handleExampleSubmitted: (request: RequestArguments) => Promise<void>;
  disabled: boolean;
}
