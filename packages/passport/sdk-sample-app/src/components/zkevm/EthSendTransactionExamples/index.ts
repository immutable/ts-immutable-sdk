import TransferImx from './TransferImx';
import SpendingCapApproval from './SpendingCapApproval';
import NFTApproval from './NFTApproval';
import SeaportFulfillAvailableAdvancedOrders from './SeaportFulfillAvailableAdvancedOrders';
import SeaportCancel from './SeaportCancel';
import ShowGenericConfirmationScreen from './DefaultTransaction';
import TransferERC20 from './TransferERC20';
import NFTTransfer from './NFTTransfer';

const EthSendTransactionExamples = [
  TransferImx,
  ShowGenericConfirmationScreen,
  SpendingCapApproval,
  TransferERC20,
  NFTApproval,
  NFTTransfer,
  SeaportFulfillAvailableAdvancedOrders,
  SeaportCancel,
];

export default EthSendTransactionExamples;
