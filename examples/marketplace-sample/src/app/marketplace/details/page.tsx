'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { passportInstance } from '../../utils/setupDefault';
import { orderbookSDK } from '../../utils/setupOrderbook';
import { OrderStatusName } from '@imtbl/orderbook';
import { Button, Heading, Body, Card } from '@biom3/react';
import Link from 'next/link';
import { SUPPORTED_CHAINS, calculateBuyerCost, calculateSellerProceeds } from '../../utils/marketplaceConfig';

// Define the types based on the SDK structure
interface NFTDetails {
  id: string;
  contractAddress: string;
  tokenId: string;
  name?: string;
  description?: string;
  imageUrl?: string;
  collectionName?: string;
  price: string;
  sellerAddress: string;
  createdAt: string;
  attributes?: {
    trait_type: string;
    value: string;
  }[];
}

export default function NFTDetailsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const listingId = searchParams.get('id');
  
  // User state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState<string>("0.0000");
  
  // NFT details
  const [nftDetails, setNftDetails] = useState<NFTDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Transaction state
  const [isPurchasing, setIsPurchasing] = useState<boolean>(false);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);
  const [transactionSuccess, setTransactionSuccess] = useState<string | null>(null);
  
  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  // Format wallet balances
  const formatBalance = (balance: string) => {
    try {
      // Convert to a number with 4 decimal places
      const num = parseFloat(balance);
      return num.toFixed(4);
    } catch (e) {
      return "0.0000";
    }
  };
  
  // Check if the current user is the seller
  const isUserSeller = () => {
    return isLoggedIn && accountAddress && nftDetails?.sellerAddress && 
           accountAddress.toLowerCase() === nftDetails.sellerAddress.toLowerCase();
  };
  
  // Check authentication on page load
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // Check if user is authenticated with Passport
        const { isAuthenticated, accounts, provider } = await passportInstance.getUserInfo();
        
        setIsLoggedIn(isAuthenticated);
        
        if (isAuthenticated && accounts && accounts.length > 0) {
          // Set user account address
          const address = accounts[0];
          setAccountAddress(address);
          
          // Store provider and create signer
          setProvider(provider);
          if (provider) {
            try {
              const signer = provider.getSigner();
              setSigner(signer);
              
              // Get wallet balance using formatBalance helper
              try {
                const balance = await provider.getBalance(address);
                // Convert balance from wei to ETH (1 ETH = 10^18 wei)
                const balanceInEth = parseFloat(balance.toString()) / 1e18;
                setWalletBalance(formatBalance(balanceInEth.toString()));
              } catch (balanceError) {
                console.error("Error getting balance:", balanceError);
                setWalletBalance("0.0000");
              }
            } catch (signerError) {
              console.error("Error getting signer:", signerError);
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
  }, []); // No dependencies to prevent re-runs
  
  // Fetch NFT details when the page loads with proper error handling
  useEffect(() => {
    const loadNFTDetails = async () => {
      try {
        if (listingId) {
          await fetchNFTDetails(listingId);
        } else {
          setError("No listing ID provided");
          setLoadingDetails(false);
        }
      } catch (error) {
        console.error("Error in NFT details effect:", error);
        setError("Failed to load NFT details");
        setLoadingDetails(false);
      }
    };
    
    if (!isLoading) {
      loadNFTDetails();
    }
  }, [listingId, isLoading]);
  
  // Fetch NFT details from the Orderbook SDK
  const fetchNFTDetails = async (id: string) => {
    try {
      setLoadingDetails(true);
      console.log("Fetching NFT details for ID:", id);
      
      // Set a safety timeout to prevent infinite loading
      const safetyTimeout = setTimeout(() => {
        if (loadingDetails) {
          console.log("Safety timeout triggered for NFT details");
          setLoadingDetails(false);
          setError("Loading timed out. Please try again.");
        }
      }, 15000); // 15 seconds timeout
      
      // Get the order details
      const orderResponse = await orderbookSDK.getOrderById({
        orderId: id,
        chainName: SUPPORTED_CHAINS.DEFAULT
      });
      
      // Clear the safety timeout since we got a response
      clearTimeout(safetyTimeout);
      
      console.log("Order response:", orderResponse);
      
      if (orderResponse && orderResponse.result) {
        const order = orderResponse.result;
        const nftItem = order.sell[0]; // Assuming the first sell item is the NFT
        
        // Try to fetch additional NFT details
        let nftMetadata = { 
          name: `NFT #${nftItem.tokenId}`, 
          description: 'No description available',
          image_url: undefined as string | undefined,
          attributes: []
        };
        let collectionName = 'Unknown Collection';
        
        try {
          const { blockchainData } = orderbookSDK.getAllClients();
          
          // Try to get NFT metadata using getNFT method first (fallback to getToken if it fails)
          try {
            const nftResponse = await blockchainData.getNFT({
              chainName: SUPPORTED_CHAINS.DEFAULT,
              contractAddress: nftItem.contractAddress,
              tokenId: nftItem.tokenId
            });
            
            if (nftResponse && nftResponse.result) {
              nftMetadata = nftResponse.result.metadata || nftMetadata;
              collectionName = nftResponse.result.collection?.name || collectionName;
            }
          } catch (nftError) {
            console.log("getNFT not available, trying getToken...", nftError);
            
            try {
              const tokenDetails = await blockchainData.getToken({
                chainName: SUPPORTED_CHAINS.DEFAULT,
                contractAddress: nftItem.contractAddress,
                tokenId: nftItem.tokenId
              });
              
              if (tokenDetails && tokenDetails.metadata) {
                nftMetadata = tokenDetails.metadata;
              }
              
              // Try to fetch collection details separately
              try {
                const collectionResponse = await blockchainData.getCollection({
                  chainName: SUPPORTED_CHAINS.DEFAULT,
                  contractAddress: nftItem.contractAddress
                });
                
                if (collectionResponse) {
                  collectionName = collectionResponse.name || collectionName;
                }
              } catch (collectionError) {
                console.error("Error fetching collection details:", collectionError);
              }
            } catch (tokenError) {
              console.error("Error fetching token details:", tokenError);
            }
          }
        } catch (error) {
          console.error("Error with blockchainData client:", error);
        }
        
        // Set NFT details
        const nftDetails: NFTDetails = {
          id: order.id,
          contractAddress: nftItem.contractAddress,
          tokenId: nftItem.tokenId,
          name: nftMetadata.name || `NFT #${nftItem.tokenId}`,
          description: nftMetadata.description || 'No description available',
          imageUrl: nftMetadata.image_url || '/placeholder-image.png',
          collectionName,
          price: order.buy[0].amount,
          sellerAddress: order.accountAddress,
          createdAt: order.createdAt,
          attributes: nftMetadata.attributes
        };
        
        console.log("Processed NFT details:", nftDetails);
        setNftDetails(nftDetails);
        setLoadingDetails(false);
      } else {
        console.error("Invalid order response format or no result");
        setError("Could not find the NFT listing. It may have been removed or sold.");
        setLoadingDetails(false);
      }
    } catch (error) {
      console.error("Error fetching NFT details:", error);
      setError("Error loading NFT details. Please try again.");
      setLoadingDetails(false);
    }
  };
  
  // Login with Passport
  const loginWithPassport = async () => {
    try {
      setIsPurchasing(true);
      console.log("Attempting to login with passport");
      
      try {
        await passportInstance.login();
        
        const address = await passportInstance.accounts[0];
        console.log("Connected address:", address);
        
        if (address) {
          setAccountAddress(address);
          setIsLoggedIn(true);
          
          // Get signer from passport instance
          const newSigner = passportInstance.getEthersJsSigner();
          setSigner(newSigner);
          
          // Get balance using the Immutable SDK provider
          try {
            const balance = await passportInstance.provider.getBalance(address);
            const formattedBalance = formatBalance(balance.toString());
            setWalletBalance(formattedBalance);
          } catch (balanceError) {
            console.error("Error getting balance:", balanceError);
            setWalletBalance("0.0000");
          }
        }
      } catch (error) {
        console.error("Passport connection failed:", error);
        setTransactionError("Failed to connect. Please try again.");
      }
      
      setIsPurchasing(false);
    } catch (error: any) {
      console.error("Login error:", error);
      setIsPurchasing(false);
      setTransactionError(error.message || "An error occurred during login");
    }
  };
  
  // Purchase an NFT
  const purchaseNFT = async () => {
    try {
      if (!isLoggedIn) {
        await loginWithPassport();
        return;
      }
      
      if (!nftDetails || !accountAddress || !signer) {
        setTransactionError("Missing required data to complete purchase");
        return;
      }
      
      setIsPurchasing(true);
      setTransactionError(null);
      console.log("Starting purchase for NFT:", nftDetails.id);
      
      // Set a safety timeout
      const safetyTimeout = setTimeout(() => {
        if (isPurchasing) {
          console.log("Safety timeout triggered for purchase");
          setIsPurchasing(false);
          setTransactionError("Purchase timed out. Please try again.");
        }
      }, 30000); // 30 seconds timeout for transactions
      
      try {
        // Calculate fees and total cost
        const totalCost = calculateBuyerCost(nftDetails.price);
        console.log("Total cost including fees:", totalCost);
        
        // Call the fulfillOrder method from Orderbook SDK
        const fulfillResponse = await orderbookSDK.fulfillOrder({
          orderId: nftDetails.id,
          takerAddress: accountAddress,
          takerFees: [], // Could add ecosystem fees here if needed
        });
        
        console.log("Fulfill response:", fulfillResponse);
        
        if (fulfillResponse && fulfillResponse.actions) {
          // Process each action - these could be approvals or the actual fulfillment
          for (const action of fulfillResponse.actions) {
            console.log("Processing action:", action.purpose);
            
            // Build the transaction
            const transaction = await action.buildTransaction();
            console.log("Built transaction:", transaction);
            
            // Send the transaction
            const txResponse = await signer.sendTransaction(transaction);
            console.log("Transaction sent:", txResponse.hash);
            
            // Wait for confirmation
            await txResponse.wait(1);
            console.log("Transaction confirmed");
          }
          
          // Clear safety timeout
          clearTimeout(safetyTimeout);
          
          // Success!
          setIsPurchasing(false);
          setTransactionSuccess("Successfully purchased the NFT!");
          console.log("Purchase completed successfully!");
          
          // Wait a moment, then redirect to the marketplace
          setTimeout(() => {
            router.push('/marketplace');
          }, 3000);
        } else {
          throw new Error("Invalid fulfillment response");
        }
      } catch (txError: any) {
        console.error("Transaction error:", txError);
        clearTimeout(safetyTimeout);
        setIsPurchasing(false);
        setTransactionError(txError.message || "Failed to complete the purchase");
      }
    } catch (error: any) {
      console.error("Purchase error:", error);
      setIsPurchasing(false);
      setTransactionError(error.message || "An error occurred during purchase");
    }
  };
  
  // Cancel the listing
  const cancelListing = async () => {
    try {
      if (!nftDetails || !accountAddress || !signer) {
        setTransactionError("Missing required data to cancel listing");
        return;
      }
      
      setIsCancelling(true);
      setTransactionError(null);
      console.log("Starting cancellation for listing:", nftDetails.id);
      
      // Set a safety timeout
      const safetyTimeout = setTimeout(() => {
        if (isCancelling) {
          console.log("Safety timeout triggered for cancellation");
          setIsCancelling(false);
          setTransactionError("Cancellation timed out. Please try again.");
        }
      }, 30000); // 30 seconds timeout for transactions
      
      try {
        // Prepare the cancellation using the correct SDK method
        console.log("Preparing to cancel order:", nftDetails.id);
        
        // Direct cancellation using cancelOrders
        const result = await orderbookSDK.cancelOrders({
          orderIds: [nftDetails.id],
          accountAddress: accountAddress,
          signature: await signer.signMessage(`Cancel order ${nftDetails.id}`)
        });
        
        console.log("Cancellation result:", result);
        
        // Clear safety timeout
        clearTimeout(safetyTimeout);
        
        // Success!
        setIsCancelling(false);
        setTransactionSuccess("Successfully cancelled the listing!");
        console.log("Listing cancelled successfully!");
        
        // Wait a moment, then redirect to the marketplace
        setTimeout(() => {
          router.push('/marketplace');
        }, 3000);
      } catch (txError: any) {
        console.error("Transaction error:", txError);
        clearTimeout(safetyTimeout);
        setIsCancelling(false);
        setTransactionError(txError.message || "Failed to cancel the listing");
      }
    } catch (error: any) {
      console.error("Cancellation error:", error);
      setIsCancelling(false);
      setTransactionError(error.message || "An error occurred during cancellation");
    }
  };
  
  // If loading
  if (isLoading || loadingDetails) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }
  
  // If no listing ID or NFT details not found
  if (!listingId || !nftDetails) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="text-center py-10 border border-gray-200 rounded-lg">
          <Heading>NFT Not Found</Heading>
          <Body className="mt-4">The NFT listing you're looking for doesn't exist or has been removed.</Body>
          <div className="mt-6">
            <Link href="/marketplace">
              <Button>Back to Marketplace</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Back button */}
      <div className="mb-6">
        <Link href="/marketplace">
          <Button variant="secondary" size="small">
            ← Back to Marketplace
          </Button>
        </Link>
      </div>
      
      {/* Transaction notifications */}
      {transactionError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-bold">Transaction Failed</div>
              <div>{transactionError}</div>
            </div>
            <button 
              onClick={() => setTransactionError(null)}
              className="text-red-700 hover:text-red-900"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {transactionSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-700 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-bold">Transaction Successful</div>
              <div>{transactionSuccess}</div>
            </div>
            <button 
              onClick={() => setTransactionSuccess(null)}
              className="text-green-700 hover:text-green-900"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {/* NFT Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left column - Image */}
        <div>
          <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square">
            {nftDetails.imageUrl ? (
              <img 
                src={nftDetails.imageUrl} 
                alt={nftDetails.name || 'NFT'} 
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Body>No image available</Body>
              </div>
            )}
          </div>
          
          {/* Collection info */}
          <Card className="mt-6 p-4">
            <Heading size="small">Collection</Heading>
            <div className="mt-2 flex justify-between items-center">
              <Body>{nftDetails.collectionName}</Body>
              <Link href={`/marketplace?collection=${nftDetails.contractAddress}`}>
                <Button size="small" variant="secondary">View Collection</Button>
              </Link>
            </div>
            <Body className="mt-2 text-sm text-gray-500">
              Contract: {formatAddress(nftDetails.contractAddress)}
            </Body>
            <Body className="mt-1 text-sm text-gray-500">
              Token ID: {nftDetails.tokenId}
            </Body>
          </Card>
        </div>
        
        {/* Right column - Details */}
        <div>
          <Heading>{nftDetails.name}</Heading>
          
          {/* Seller info */}
          <div className="mt-2 flex items-center">
            <Body className="text-gray-500">Sold by: {formatAddress(nftDetails.sellerAddress)}</Body>
            {isUserSeller() && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">You</span>
            )}
          </div>
          
          {/* Price */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <Body className="text-gray-500">Current price</Body>
                <Heading size="large" className="mt-1">{parseFloat(nftDetails.price).toFixed(6)} ETH</Heading>
                <Body className="text-sm text-gray-500 mt-1">
                  ~{calculateBuyerCost(nftDetails.price)} ETH with fees
                </Body>
              </div>
              
              {/* Purchase/Cancel buttons */}
              {isUserSeller() ? (
                <Button 
                  variant="primary"
                  onClick={cancelListing}
                  disabled={isCancelling}
                >
                  {isCancelling ? 'Cancelling...' : 'Cancel Listing'}
                </Button>
              ) : (
                <Button 
                  onClick={purchaseNFT}
                  disabled={isPurchasing}
                >
                  {isPurchasing ? 'Processing...' : 'Buy Now'}
                </Button>
              )}
            </div>
            
            {/* Seller proceeds (only shown to seller) */}
            {isUserSeller() && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Body className="text-gray-500">You will receive</Body>
                <Body className="font-bold">{calculateSellerProceeds(nftDetails.price)} ETH</Body>
                <Body className="text-xs text-gray-500">
                  After marketplace fees and creator royalties
                </Body>
              </div>
            )}
          </div>
          
          {/* Description */}
          <div className="mt-6">
            <Heading size="small">Description</Heading>
            <Body className="mt-2 whitespace-pre-wrap">
              {nftDetails.description || 'No description available'}
            </Body>
          </div>
          
          {/* Attributes/Traits */}
          {nftDetails.attributes && nftDetails.attributes.length > 0 && (
            <div className="mt-6">
              <Heading size="small">Properties</Heading>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                {nftDetails.attributes.map((attr, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-2 text-center">
                    <Body className="text-xs text-gray-500 uppercase">{attr.trait_type}</Body>
                    <Body className="font-medium truncate">{attr.value}</Body>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Listing details */}
          <div className="mt-6">
            <Heading size="small">Listing Details</Heading>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between">
                <Body className="text-gray-500">Listing ID</Body>
                <Body className="font-mono">{nftDetails.id.substring(0, 10)}...</Body>
              </div>
              <div className="flex justify-between">
                <Body className="text-gray-500">Listed</Body>
                <Body>{formatDate(nftDetails.createdAt)}</Body>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 