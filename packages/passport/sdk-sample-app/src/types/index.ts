import {
  Dispatch,
  SetStateAction,
  PropsWithChildren,
  ComponentType,
} from 'react';
import { RequestArguments } from '@imtbl/passport';
import { imx } from '@imtbl/generated-clients';

export enum EnvironmentNames {
  DEV = 'dev',
  SANDBOX = 'sandbox',
  PRODUCTION = 'production',
  /** Zero-config auth: uses createAuthConfig() with no args, auto-detects sandbox/production */
  DEFAULT = 'default',
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
  order?: imx.Order;
  onClose?: () => void;
}

export interface ViewOffersModalProps extends ModalProps {
  buyTokenAddress: string;
  buyTokenId: string;
  onClose?: () => void;
}

export type HandleExampleSubmitted = (
  request: RequestArguments,
  onSuccess?: (result?: any) => Promise<void>,
) => Promise<void>;

export interface RequestExampleProps {
  handleExampleSubmitted: HandleExampleSubmitted;
  disabled: boolean;
}

export interface RequestExampleAccordionProps {
  disabled: boolean;
  handleExampleSubmitted: HandleExampleSubmitted;
  examples: Array<ComponentType<RequestExampleProps>>;
}
