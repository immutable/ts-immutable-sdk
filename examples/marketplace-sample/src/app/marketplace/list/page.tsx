'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { passportInstance } from '../../utils/setupDefault';
import { orderbookSDK } from '../../utils/setupOrderbook';
import { Button, Input, Card, Heading, Body } from '@biom3/react';
import Link from 'next/link';

interface NFT {
  contractAddress: string;
  tokenId: string;
  name?: string;
  description?: string;
  imageUrl?: string;
  collectionName?: string;
}

export default function ListNFT() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // NFT details from URL params
  const contractAddress = searchParams.get('contractAddress');
  const tokenId = searchParams.get('tokenId');
  
  // User state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);
  
  // NFT data
  const [nft, setNft] = useState<NFT | null>(null);
  const [loadingNft, setLoadingNft] = useState<boolean>(true);
  
  // Listing state
  const [price, setPrice] = useState<string>('');
  const [makerFeePercentage, setMakerFeePercentage] = useState<string>('2.5'); // Default 2.5% fee
  const [isCreatingListing, setIsCreatingListing] = useState<boolean>(false);
  const [listingError, setListingError] = useState<string | null>(null);
  const [listingSuccess, setListingSuccess] = useState<boolean>(false);
  
  // Check authentication and params on page load
  useEffect(() => {
    if (!contractAddress || !tokenId) {
      // Redirect if missing required params
      router.push('/dashboard');
      return;
    }
    
    const checkLoginStatus = async () => {
      try {
        // Check if user is already authenticated
        const isAuthenticated = await passportInstance.isAuthenticated();
        
        if (isAuthenticated) {
          // Connect provider and get account
          const passportProvider = await passportInstance.connectEvm();
          setProvider(passportProvider);
          
          if (passportProvider) {
            const accounts = await passportProvider.request({ method: "eth_accounts" });
            if (accounts && accounts.length > 0) {
              setAccountAddress(accounts[0]);
              setIsLoggedIn(true);
              setSigner(passportProvider);
              
              // After user is authenticated, fetch NFT details
              fetchNFTDetails(contractAddress, tokenId);
            }
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking login status:", error);
        setIsLoading(false);
      }
    };
    
    checkLoginStatus();
  }, [contractAddress, tokenId, router]);
  
  // Fetch NFT details
  const fetchNFTDetails = async (contractAddress: string, tokenId: string) => {
    try {
      setLoadingNft(true);
      
      // Use the blockchain data SDK to fetch NFT details
      const blockchainData = orderbookSDK.getAllClients().blockchainData;
      const response = await blockchainData.getNFT({
        chainName: 'imtbl-zkevm-testnet', // Use appropriate chain
        contractAddress: contractAddress,
        tokenId: tokenId
      });
      
      if (response && response.result) {
        const nftData = {
          contractAddress: response.result.token_address,
          tokenId: response.result.token_id,
          name: response.result.metadata?.name || `NFT #${response.result.token_id}`,
          description: response.result.metadata?.description,
          imageUrl: response.result.metadata?.image_url,
          collectionName: response.result.collection?.name
        };
        
        setNft(nftData);
      }
      
      setLoadingNft(false);
    } catch (error) {
      console.error("Error fetching NFT details:", error);
      setLoadingNft(false);
    }
  };
  
  // Create listing
  const createListing = async () => {
    if (!nft || !accountAddress || !signer || !price || parseFloat(price) <= 0) {
      setListingError("Please enter a valid price");
      return;
    }
    
    try {
      setIsCreatingListing(true);
      setListingError(null);
      
      // Calculate fee amount
      const feePercentage = parseFloat(makerFeePercentage) / 100;
      const feeAmount = (parseFloat(price) * feePercentage).toString();
      
      // Prepare listing order with Orderbook SDK
      const { actions, orderComponents, orderHash } = await orderbookSDK.prepareListing({
        makerAddress: accountAddress,
        buy: {
          type: 'ERC20',
          contractAddress: '0x0000000000000000000000000000000000000000', // ETH address (replace with appropriate token)
          amount: price
        },
        sell: {
          type: 'ERC721', // Assuming ERC721 NFT (adjust if needed)
          contractAddress: nft.contractAddress,
          tokenId: nft.tokenId
        }
      });
      
      // Sign all required transactions
      const signatures = [];
      for (const action of actions) {
        if (action.type === 'signature') {
          const signature = await signer.request({
            method: 'personal_sign',
            params: [action.message, accountAddress]
          });
          signatures.push(signature);
        } else if (action.type === 'transaction') {
          // Handle approval transaction if needed
          const tx = await signer.request({
            method: 'eth_sendTransaction',
            params: [action.transaction]
          });
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for tx to be processed
        }
      }
      
      // Create the actual listing with signature and fees
      const { result } = await orderbookSDK.createListing({
        orderComponents,
        orderHash,
        orderSignature: signatures[0],
        makerFees: [
          {
            amount: feeAmount,
            recipientAddress: '0xFeeRecipientAddress', // Replace with marketplace fee address
            type: 'marketplace' // Fee type
          }
        ]
      });
      
      // Success! Show success message and enable navigation back
      setListingSuccess(true);
      setIsCreatingListing(false);
      
    } catch (error) {
      console.error("Error creating listing:", error);
      setListingError("Failed to create listing. Please try again.");
      setIsCreatingListing(false);
    }
  };
  
  // Login with Passport
  const loginWithPassport = async () => {
    try {
      await passportInstance.login();
    } catch (error) {
      console.error("Error logging in with Passport:", error);
    }
  };
  
  // If loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }
  
  // If not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center space-y-4">
        <Heading>Connect Wallet</Heading>
        <Body>Please log in to list your NFT for sale</Body>
        <Button onClick={loginWithPassport}>Connect Wallet</Button>
      </div>
    );
  }
  
  // If listing created successfully
  if (listingSuccess) {
    return (
      <div className="container mx-auto max-w-md p-6">
        <Card>
          <div className="p-6 flex flex-col items-center text-center">
            <div className="text-green-600 text-5xl mb-4">✓</div>
            <Heading>Listing Created!</Heading>
            <Body className="mt-2 mb-6">
              Your NFT has been successfully listed for sale on the marketplace.
            </Body>
            <div className="flex space-x-4">
              <Link href="/dashboard">
                <Button variant="secondary">Back to Dashboard</Button>
              </Link>
              <Link href="/marketplace">
                <Button>View Marketplace</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="secondary">« Back to Dashboard</Button>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <Heading>List NFT for Sale</Heading>
          
          {loadingNft ? (
            <div className="text-center py-10">
              <p>Loading NFT details...</p>
            </div>
          ) : !nft ? (
            <div className="text-center py-10">
              <Body>NFT not found or you don't have permission to sell this NFT.</Body>
              <div className="mt-4">
                <Link href="/dashboard">
                  <Button>Back to Dashboard</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* NFT Preview */}
              <div>
                <div className="h-64 bg-gray-200 rounded-lg relative overflow-hidden">
                  {nft.imageUrl ? (
                    <img 
                      src={nft.imageUrl} 
                      alt={nft.name} 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Body>No image available</Body>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <Heading size="medium">{nft.name}</Heading>
                  <Body className="text-gray-600 mt-1">
                    {nft.collectionName || 'Unknown Collection'}
                  </Body>
                  <Body className="text-sm text-gray-500 mt-2">
                    Token ID: {nft.tokenId}
                  </Body>
                  {nft.description && (
                    <Body className="mt-4 text-gray-700">
                      {nft.description}
                    </Body>
                  )}
                </div>
              </div>
              
              {/* Listing Form */}
              <div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (ETH)
                    </label>
                    <Input
                      type="number"
                      value={price}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)}
                      placeholder="Enter price in ETH"
                      min="0"
                      step="0.001"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maker Fee (%)
                    </label>
                    <Input
                      type="number"
                      value={makerFeePercentage}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMakerFeePercentage(e.target.value)}
                      placeholder="Maker Fee Percentage"
                      min="0"
                      max="50"
                      step="0.1"
                      disabled
                    />
                    <Body className="text-xs text-gray-500 mt-1">
                      Platform fee that will be deducted when your NFT sells
                    </Body>
                  </div>
                  
                  {parseFloat(price) > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Summary</h3>
                      <div className="flex justify-between">
                        <Body>Listing Price:</Body>
                        <Body weight="medium">{price} ETH</Body>
                      </div>
                      <div className="flex justify-between">
                        <Body>Platform Fee ({makerFeePercentage}%):</Body>
                        <Body>
                          {((parseFloat(price) * parseFloat(makerFeePercentage)) / 100).toFixed(6)} ETH
                        </Body>
                      </div>
                      <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between">
                        <Body weight="medium">You'll Receive:</Body>
                        <Body weight="medium">
                          {(parseFloat(price) - ((parseFloat(price) * parseFloat(makerFeePercentage)) / 100)).toFixed(6)} ETH
                        </Body>
                      </div>
                    </div>
                  )}
                  
                  {listingError && (
                    <div className="text-red-500 text-sm">{listingError}</div>
                  )}
                  
                  <Button
                    onClick={createListing}
                    disabled={!price || parseFloat(price) <= 0 || isCreatingListing}
                    className="w-full"
                  >
                    {isCreatingListing ? 'Creating Listing...' : 'List for Sale'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 