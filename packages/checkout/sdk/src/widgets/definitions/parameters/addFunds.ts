import { Web3Provider } from '@ethersproject/providers';
import { WidgetLanguage } from '../configurations';

export type AddFundsWidgetParams = {
  /** The language to use for the Add Funds widget */
  language?: WidgetLanguage;

  /** Configure to show on-ramp option */
  showOnrampOption?: boolean;

  /** Configure to show swap option */
  showSwapOption?: boolean;

  /** Configure to show on bridge option */
  showBridgeOption?: boolean;

  /** Token address of the fund to be added */
  toTokenAddress?: string;

  /** Amount of the fund to be added */
  toAmount?: string;

  /** Whether to show a back button on the first screen, on click triggers REQUEST_GO_BACK event */
  showBackButton?: boolean;

  /** The destination wallet provider, when requiring to lock destination of funds */
  toProvider?: Web3Provider;
};
