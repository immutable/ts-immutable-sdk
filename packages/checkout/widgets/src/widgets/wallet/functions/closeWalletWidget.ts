import { sendWalletWidgetCloseEvent } from "../WalletWidgetEvents";

export function closeWalletWidget(){
  sendWalletWidgetCloseEvent();
}