import TransferImx from './TransferImx';
import SpendingCapApproval from './SpendingCapApproval';
import NFTApproval from './NFTApproval';
import SeaportFulfillAvailableAdvancedOrders from './SeaportFulfillAvailableAdvancedOrders';
import ShowGenericConfirmationScreen from './DefaultTransaction';
import TransferERC20 from './TransferERC20';

const EthSendTransactionExamples = [
  TransferImx,
  ShowGenericConfirmationScreen,
  SpendingCapApproval,
  TransferERC20,
  NFTApproval,
  SeaportFulfillAvailableAdvancedOrders,
];

export default EthSendTransactionExamples;
