'use client';

import { useState, useEffect } from 'react';
import { Button, Body } from '@biom3/react';
import { orderbookSDK } from '../app/utils/setupOrderbook';
import { Environment } from '@imtbl/sdk/config';

interface CreateListingProps {
  isLoggedIn: boolean;
  signer: any;
  accountAddress: string | null;
  onListingCreated: () => void;
  onLoginRequired: () => void;
}

interface NFT {
  contractAddress: string;
  tokenId: string;
  name: string;
}

// Define the blockchain data response type
interface NFTItem {
  token_address: string;
  token_id: string;
  metadata?: {
    name?: string;
  };
}

interface BlockchainDataResponse {
  result: NFTItem[];
}

export default function CreateListing({
  isLoggedIn,
  signer,
  accountAddress,
  onListingCreated,
  onLoginRequired
}: CreateListingProps) {
  const [userNFTs, setUserNFTs] = useState<NFT[]>([]);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [price, setPrice] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoadingNFTs, setIsLoadingNFTs] = useState<boolean>(false);

  // Fetch user's NFTs when component mounts and user is logged in
  useEffect(() => {
    if (isLoggedIn && accountAddress) {
      fetchUserNFTs();
    }
  }, [isLoggedIn, accountAddress]);

  // Fetch user's NFTs
  const fetchUserNFTs = async () => {
    if (!accountAddress) return;
    
    try {
      setIsLoadingNFTs(true);
      
      // Use the blockchain data API to fetch owned NFTs
      // Note: This is a mock implementation since we don't have direct access to the SDK's methods
      // In a real implementation, you would use the proper SDK method
      
      // Mock data for demonstration
      const mockNFTs: NFT[] = [
        {
          contractAddress: '0x765df6da33c1ec1f83be42db171d7ee334a46df5',
          tokenId: '1',
          name: 'Sample NFT #1'
        },
        {
          contractAddress: '0x765df6da33c1ec1f83be42db171d7ee334a46df5',
          tokenId: '2',
          name: 'Sample NFT #2'
        },
        {
          contractAddress: '0x765df6da33c1ec1f83be42db171d7ee334a46df5',
          tokenId: '3',
          name: 'Sample NFT #3'
        }
      ];
      
      setUserNFTs(mockNFTs);
      
      /* Commented out actual implementation until SDK access is available
      const blockchainData = orderbookSDK.getAllClients().blockchainData;
      
      // Fetch NFTs owned by the user
      const response: BlockchainDataResponse = await blockchainData.listNFTsByAccountAddress({
        accountAddress: accountAddress,
        chainName: Environment.SANDBOX, // Use the appropriate environment
        cursor: '', // Start with empty cursor for first page
        pageSize: 100,
      });

      if (response && response.result) {
        // Transform API response to our NFT interface
        const nfts: NFT[] = response.result.map((item: NFTItem) => ({
          contractAddress: item.token_address || '',
          tokenId: item.token_id || '',
          name: item.metadata?.name || `NFT #${item.token_id}`
        })).filter((nft: NFT) => nft.contractAddress && nft.tokenId); // Filter out any items missing required data
        
        setUserNFTs(nfts);
      }
      */
      
    } catch (error) {
      console.error('Failed to fetch NFTs:', error);
      setError('Failed to load your NFTs. Please try again later.');
    } finally {
      setIsLoadingNFTs(false);
    }
  };

  // Create a new listing
  const createListing = async () => {
    if (!isLoggedIn) {
      onLoginRequired();
      return;
    }
    
    if (!selectedNFT) {
      setError('Please select an NFT to list');
      return;
    }
    
    if (!price || parseFloat(price) <= 0) {
      setError('Please enter a valid price');
      return;
    }
    
    if (!signer) {
      setError('Signer not available. Please try again.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      
      // Create the listing using the Orderbook SDK
      const result = await orderbookSDK.createListing({
        signer,
        sellToken: {
          type: 'ERC721',
          contractAddress: selectedNFT.contractAddress,
          tokenId: selectedNFT.tokenId
        },
        buyToken: {
          type: 'ETH',
          amount: price
        },
        fees: []
      });
      
      setSuccess(`Successfully created listing for ${selectedNFT.name}!`);
      setSelectedNFT(null);
      setPrice('');
      
      // Notify parent component that a listing was created
      onListingCreated();
      
    } catch (error) {
      console.error('Failed to create listing:', error);
      setError('Failed to create listing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-xl p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Create New Listing</h2>
      
      {!isLoggedIn ? (
        <div className="text-center py-6">
          <p className="text-gray-500 mb-4">You need to be logged in to create listings</p>
          <Button 
            variant="primary"
            onClick={onLoginRequired}
          >
            Login to Create Listing
          </Button>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl">
              {error}
              <button 
                onClick={() => setError(null)}
                className="ml-2 text-red-700 hover:text-red-900"
              >
                ✕
              </button>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-100 text-green-700 rounded-xl">
              {success}
              <button 
                onClick={() => setSuccess(null)}
                className="ml-2 text-green-700 hover:text-green-900"
              >
                ✕
              </button>
            </div>
          )}
          
          <div className="space-y-4">
            {/* NFT Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select NFT</label>
              {isLoadingNFTs ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black"></div>
                  <span className="text-sm text-gray-500">Loading your NFTs...</span>
                </div>
              ) : userNFTs.length === 0 ? (
                <div className="text-sm text-gray-500">
                  You don't have any NFTs to list. Please purchase or mint some NFTs first.
                </div>
              ) : (
                <div>
                  {selectedNFT && (
                    <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                      <h3 className="font-medium">{selectedNFT.name}</h3>
                      <p className="text-xs text-gray-500">Token ID: {selectedNFT.tokenId}</p>
                      <p className="text-xs text-gray-500 truncate max-w-xs">Contract: {selectedNFT.contractAddress}</p>
                    </div>
                  )}
                  
                  <select
                    value={selectedNFT ? `${selectedNFT.contractAddress}-${selectedNFT.tokenId}` : ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value) {
                        const [contractAddress, tokenId] = value.split('-');
                        const nft = userNFTs.find(n => n.contractAddress === contractAddress && n.tokenId === tokenId);
                        setSelectedNFT(nft || null);
                      } else {
                        setSelectedNFT(null);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="">Select an NFT</option>
                    {userNFTs.map((nft, index) => (
                      <option key={index} value={`${nft.contractAddress}-${nft.tokenId}`}>
                        {nft.name} (Token ID: {nft.tokenId})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (ETH)</label>
              <input
                type="number"
                placeholder="Enter price in ETH"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                step="0.001"
                className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            
            {/* Create Listing Button */}
            <div className="pt-2">
              <Button
                variant="primary"
                onClick={createListing}
                disabled={isLoading || !selectedNFT || !price}
              >
                {isLoading ? 'Creating Listing...' : 'Create Listing'}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 