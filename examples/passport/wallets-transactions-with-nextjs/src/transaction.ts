import { passport } from '@imtbl/sdk';
import { BrowserProvider, ethers } from 'ethers';

export async function sendTransaction(passportInstance: passport.Passport) {
  // #doc passport-evm-login-outside-component
  const provider = await passportInstance.connectEvm();
  // #enddoc passport-evm-login-outside-component
  const web3Provider = new BrowserProvider(provider);
  const signer = await web3Provider.getSigner();

  const [userAddress] = await provider.request({ method: 'eth_requestAccounts' });
  const toAddress = process.env.NEXT_PUBLIC_TO_ADDRESS ?? '0x000';
  const erc721Address = process.env.NEXT_PUBLIC_ERC721_ADDRESS ?? '0x000';
  const tokenId = process.env.NEXT_PUBLIC_TOKEN_ID ?? '0';

  // The Application Binary Interface (ABI) of a contract provides instructions for
  // encoding and decoding typed transaction data.
  // Read more about [ABI Formats](https://docs.ethers.org/v5/api/utils/abi/formats/).
  const abi = ['function safeTransferFrom(address from, address to, uint256 tokenId)'];

  // Ethers provides a helper class called `Contract` that allows us to interact with smart contracts
  // by abstracting away data-encoding using the contract ABI (definition of the contract's interface).
  const contract = new ethers.Contract(erc721Address, abi, signer);
  let tx;
  // Send the transaction
  try {
    tx = await contract.safeTransferFrom(userAddress, toAddress, tokenId);
  } catch (error: any) {
    // Handle user denying signature
    if (error.code === 4001) {
      console.error('user denied signature');
    } else {
      console.error('something went wrong: ', error.message);
    }
  }

  // Wait for the transaction to complete
  // On Immutable zkEVM, this takes 1-8 seconds in 99.9% of cases
  const receipt = await tx.wait();

  switch (receipt.status) {
    // Failure
    case 0:
      break;
    // Success
    case 1:
      break;
    default:
      break;
  }
}
