import { AddFundsWidgetParams } from '@imtbl/checkout-sdk/dist/widgets/definitions/parameters/addFunds';
import { Checkout } from '@imtbl/checkout-sdk';
import { Web3Provider } from '@ethersproject/providers';
import { StrongCheckoutWidgetsConfig } from '../../lib/withDefaultWidgetConfig';

export type AddFundsWidgetInputs = AddFundsWidgetParams & {
  config: StrongCheckoutWidgetsConfig;
  checkout: Checkout;
  web3Provider?: Web3Provider;
};

export default function AddFundsWidget({
  config,
  checkout,
  web3Provider,
}: AddFundsWidgetInputs) {
  // eslint-disable-next-line no-console
  console.log(config, checkout, web3Provider);
  return <>ADD FUNDS WIDGET</>;
}
