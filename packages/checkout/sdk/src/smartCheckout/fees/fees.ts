import { ERC20Item, NativeItem } from '@imtbl/orderbook';
import { OrderFee } from '../../types/fees';

export const calculateFees = (orderFee: OrderFee, buyTokenOrNative: ERC20Item | NativeItem):string => {
  console.log('orderFee', orderFee);

  console.log('buyTokenOrNative', buyTokenOrNative);

  return '';
};
