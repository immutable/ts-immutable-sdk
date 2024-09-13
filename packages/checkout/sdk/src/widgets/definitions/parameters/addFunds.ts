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
};
