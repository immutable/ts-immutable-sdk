import ValidateTypedDataSignature from '@/components/zkevm/EthSignTypedDataV4Examples/ValidateTypedDataSignature';
import SeaportCreateListing from './SeaportCreateListing';
import SeaportCreateERC721ListingDefault from './SeaportCreateERC721ListingDefault';
import SeaportCreateERC1155ListingDefault from './SeaportCreateERC1155ListingDefault';
import SignEtherMail from './SignEtherMail';
import ValidateEtherMail from './ValidateEtherMail';

const EthSignTypedDataV4Examples = [
  ValidateTypedDataSignature,
  SignEtherMail,
  ValidateEtherMail,
  SeaportCreateListing,
  SeaportCreateERC721ListingDefault,
  SeaportCreateERC1155ListingDefault,
];

export default EthSignTypedDataV4Examples;
