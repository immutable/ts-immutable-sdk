'use client';

import React from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { passportInstance } from '../../utils/setupDefault';
import { orderbookSDK } from '../../utils/setupOrderbook';
import { OrderStatusName } from '@imtbl/orderbook';
import { Button } from '@biom3/react';
import Link from 'next/link';
import { SUPPORTED_CHAINS } from '../../utils/marketplaceConfig';

// Define the types based on the SDK structure
interface NFTDetails {
  id: string;
  contractAddress: string;
  tokenId: string;
  price: string;
  sellerAddress: string;
  createdAt: string;
}

// Define a custom type for Passport user info - this matches what the SDK actually returns
interface PassportUserInfo {
  // Using an index signature to allow for any properties
  [key: string]: any;
}

export default function NFTDetailsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const listingId = searchParams.get('id');
  
  // User state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userInfo, setUserInfo] = useState<PassportUserInfo | null>(null);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<any>(null);
  
  // NFT details state
  const [nftDetails, setNftDetails] = useState<NFTDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Transaction state
  const [isPurchasing, setIsPurchasing] = useState<boolean>(false);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);
  const [transactionSuccess, setTransactionSuccess] = useState<boolean>(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);
  
  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };
  
  // Format balance for display (ETH)
  const formatBalance = (balance: string) => {
    if (!balance) return '0';
    
    const balanceNum = parseFloat(balance);
    if (balanceNum < 0.000001) return '< 0.000001';
    
    return balanceNum.toFixed(6);
  };
  
  // Check if the current user is the seller
  const isUserSeller = () => {
    if (!nftDetails || !accountAddress) return false;
    return nftDetails.sellerAddress.toLowerCase() === accountAddress.toLowerCase();
  };
  
  // Check login status
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // Check if user is already authenticated
        const userInfo = await passportInstance.getUserInfo();
        
        // Type guard to check for accounts
        const isAuthenticated = !!userInfo && 
                               typeof userInfo === 'object' && 
                               'accounts' in userInfo && 
                               Array.isArray(userInfo.accounts) && 
                               userInfo.accounts.length > 0;
        
        if (isAuthenticated) {
          setIsLoggedIn(true);
          setUserInfo(userInfo as PassportUserInfo);
          
          if (userInfo.accounts && Array.isArray(userInfo.accounts) && userInfo.accounts.length > 0) {
            setAccountAddress(userInfo.accounts[0]);
          }
          
          // Get provider
          const passportProvider = await passportInstance.connectEvm();
          setProvider(passportProvider);
        } else {
          setIsLoggedIn(false);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking login status:", error);
        setIsLoading(false);
      }
    };
    
    checkLoginStatus();
  }, []);
  
  // Load NFT details
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
        
        // Set NFT details
        const nftDetails: NFTDetails = {
          id: order.id,
          contractAddress: nftItem.contractAddress,
          tokenId: nftItem.tokenId,
          price: order.buy[0].amount,
          sellerAddress: order.accountAddress,
          createdAt: order.createdAt
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
      await passportInstance.login();
      // The page will reload after successful login via the redirect
    } catch (error) {
      console.error("Error logging in with Passport:", error);
      setError("Failed to log in. Please try again.");
    }
  };
  
  // Purchase NFT
  const purchaseNFT = async () => {
    if (!isLoggedIn || !nftDetails || !accountAddress || !provider) {
      setError("Please log in to purchase this NFT");
      return;
    }
    
    try {
      setIsPurchasing(true);
      setTransactionError(null);
      
      console.log("Preparing to purchase NFT:", nftDetails.id);
      
      // Get the order
      const orderResponse = await orderbookSDK.getOrderById({
        orderId: nftDetails.id,
        chainName: SUPPORTED_CHAINS.DEFAULT
      });
      
      if (!orderResponse || !orderResponse.result) {
        throw new Error("Could not find the listing");
      }
      
      // Use the appropriate fulfillment method from the SDK
      // Note: Using fulfillOrder instead of prepareFulfillment/confirmFulfillment that might not exist
      const fulfillResponse = await orderbookSDK.fulfillOrder({
        orderId: nftDetails.id,
        takerAddress: accountAddress,
        // If this is a partial fill, specify quantity
        quantity: '1',
      });
      
      // Process any actions returned by the SDK
      if (fulfillResponse && fulfillResponse.actions) {
        for (const action of fulfillResponse.actions) {
          if (action.type === 'transaction') {
            // Send the transaction
            const txRequest = {
              method: 'eth_sendTransaction',
              params: [action.transaction]
            };
            
            const txHash = await provider.request(txRequest);
            console.log("Transaction submitted:", txHash);
            
            // Wait for the transaction to be confirmed
            // This is a simplified version - a production app should wait properly
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        }
      }
      
      console.log("NFT purchased successfully");
      setTransactionSuccess(true);
      setIsPurchasing(false);
      
      // Refresh after a delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
      
    } catch (error) {
      console.error("Error purchasing NFT:", error);
      setTransactionError("Failed to purchase NFT. " + (error instanceof Error ? error.message : "Please try again."));
      setIsPurchasing(false);
    }
  };
  
  // Cancel listing
  const cancelListing = async () => {
    if (!isLoggedIn || !nftDetails || !accountAddress || !provider) {
      setError("Please log in to cancel this listing");
      return;
    }
    
    if (!isUserSeller()) {
      setError("Only the seller can cancel this listing");
      return;
    }
    
    try {
      setIsCancelling(true);
      setTransactionError(null);
      
      console.log("Preparing to cancel listing:", nftDetails.id);
      
      // Use the appropriate method from the SDK to cancel the order
      // Note: Using cancelOrders instead of prepareCancellation/confirmCancellation
      const cancelResult = await orderbookSDK.cancelOrders({
        orderIds: [nftDetails.id],
        accountAddress: accountAddress,
      });
      
      console.log("Listing cancelled successfully");
      setTransactionSuccess(true);
      setIsCancelling(false);
      
      // Refresh after a delay
      setTimeout(() => {
        router.push('/marketplace');
      }, 3000);
      
    } catch (error) {
      console.error("Error cancelling listing:", error);
      setTransactionError("Failed to cancel listing. " + (error instanceof Error ? error.message : "Please try again."));
      setIsCancelling(false);
    }
  };
  
  // If loading
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
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
              <div>Your transaction has been processed successfully!</div>
            </div>
            <button 
              onClick={() => setTransactionSuccess(false)}
              className="text-green-700 hover:text-green-900"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {/* Main content */}
      {loadingDetails ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-xl">Loading NFT details...</div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <Link href="/marketplace">
            <Button>Return to Marketplace</Button>
          </Link>
        </div>
      ) : !nftDetails ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">NFT Not Found</h2>
          <p className="mb-6">The NFT listing you're looking for doesn't exist or has been removed.</p>
          <Link href="/marketplace">
            <Button>Return to Marketplace</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">NFT Details</h1>
            
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50 w-1/4">
                      Listing ID
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {nftDetails.id}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">
                      Contract Address
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {nftDetails.contractAddress}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">
                      Token ID
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {nftDetails.tokenId}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">
                      Price
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="text-xl font-bold">{formatBalance(nftDetails.price)} ETH</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">
                      Seller
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {nftDetails.sellerAddress}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50">
                      Listed Date
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(nftDetails.createdAt)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mt-8">
              {isUserSeller() ? (
                <div>
                  <h2 className="text-lg font-semibold mb-2">Seller Actions</h2>
                  <p className="text-gray-600 mb-4">You are the seller of this NFT listing.</p>
                  <Button
                    onClick={cancelListing}
                    disabled={isCancelling}
                    variant="secondary"
                  >
                    {isCancelling ? 'Cancelling...' : 'Cancel Listing'}
                  </Button>
                </div>
              ) : (
                <div>
                  <h2 className="text-lg font-semibold mb-2">Buy this NFT</h2>
                  {isLoggedIn ? (
                    <Button
                      onClick={purchaseNFT}
                      disabled={isPurchasing}
                      className="w-full md:w-auto"
                    >
                      {isPurchasing ? 'Processing...' : `Buy Now for ${formatBalance(nftDetails.price)} ETH`}
                    </Button>
                  ) : (
                    <div>
                      <p className="text-gray-600 mb-4">You need to connect your wallet to purchase this NFT.</p>
                      <Button onClick={loginWithPassport}>Connect Wallet</Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 