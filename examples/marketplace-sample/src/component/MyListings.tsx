'use client';

import { useState, useEffect } from 'react';
import { Button, Table, Body } from '@biom3/react';
import { orderbookSDK } from '../app/utils/setupOrderbook';
import { OrderStatusName } from '@imtbl/orderbook';

interface MyListingsProps {
  isLoggedIn: boolean;
  signer: any;
  accountAddress: string | null;
  onLoginRequired: () => void;
  onListingCancelled: () => void;
}

interface UserListing {
  id: string;
  contractAddress: string;
  tokenId: string;
  price: string;
  createdAt: number;
  name?: string;
}

// Define the Order interface to match the SDK structure
interface Order {
  id: string;
  sell: Array<{
    contractAddress: string;
    tokenId: string;
    metadata?: {
      name?: string;
    };
  }>;
  buy: Array<{
    amount: string;
  }>;
}

export default function MyListings({
  isLoggedIn,
  signer,
  accountAddress,
  onLoginRequired,
  onListingCancelled
}: MyListingsProps) {
  const [userListings, setUserListings] = useState<UserListing[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Fetch user's listings when component mounts and user is logged in
  useEffect(() => {
    if (isLoggedIn && accountAddress) {
      fetchUserListings();
    }
  }, [isLoggedIn, accountAddress]);

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  // Fetch user's listings
  const fetchUserListings = async () => {
    if (!accountAddress) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Call the Orderbook SDK to get user's listings
      const response = await orderbookSDK.listListings({
        status: OrderStatusName.ACTIVE,
        accountAddress: accountAddress,
        sellTokenType: "ERC721"
      });
      
      // Transform the response to our UserListing format
      const listings: UserListing[] = response.result.map((order: Order) => ({
        id: order.id,
        contractAddress: order.sell[0].contractAddress,
        tokenId: order.sell[0].tokenId,
        price: order.buy[0].amount,
        createdAt: Date.now(), // In a real app, you'd get this from the order
        name: order.sell[0]?.metadata?.name || `NFT #${order.sell[0].tokenId}`
      }));
      
      setUserListings(listings);
      
    } catch (error) {
      console.error('Failed to fetch user listings:', error);
      setError('Failed to load your listings. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel a listing
  const cancelListing = async (listingId: string) => {
    if (!isLoggedIn) {
      onLoginRequired();
      return;
    }
    
    if (!signer) {
      setError('Signer not available. Please try again.');
      return;
    }
    
    try {
      setCancellingId(listingId);
      setError(null);
      setSuccess(null);
      
      // Call the Orderbook SDK to cancel the listing
      await orderbookSDK.cancelOrders({
        signer,
        orderIds: [listingId]
      });
      
      setSuccess('Successfully cancelled listing!');
      
      // Remove the cancelled listing from the list
      setUserListings(prevListings => 
        prevListings.filter(listing => listing.id !== listingId)
      );
      
      // Notify parent component that a listing was cancelled
      onListingCancelled();
      
    } catch (error) {
      console.error('Failed to cancel listing:', error);
      setError('Failed to cancel listing. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="bg-white shadow rounded-xl p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">My Listings</h2>
      
      {!isLoggedIn ? (
        <div className="text-center py-6">
          <p className="text-gray-500 mb-4">You need to be logged in to view your listings</p>
          <Button 
            variant="primary"
            onClick={onLoginRequired}
          >
            Login to View Listings
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
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
            </div>
          ) : userListings.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <p className="text-gray-500">You don't have any active listings</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table sx={{ width: "100%", marginBottom: "base.spacing.x5" }}>
                <Table.Head>
                  <Table.Row>
                    <Table.Cell>Listing ID</Table.Cell>
                    <Table.Cell>Name</Table.Cell>
                    <Table.Cell>Token ID</Table.Cell>
                    <Table.Cell>Price (ETH)</Table.Cell>
                    <Table.Cell>Created</Table.Cell>
                    <Table.Cell></Table.Cell>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {userListings.map((listing) => (
                    <Table.Row key={listing.id}>
                      <Table.Cell sx={{ paddingY: "base.spacing.x3" }}>
                        <Body mono={true} size="small">{listing.id.substring(0, 8)}...</Body>
                      </Table.Cell>
                      <Table.Cell sx={{ paddingY: "base.spacing.x3" }}>
                        <Body mono={true} size="small">{listing.name}</Body>
                      </Table.Cell>
                      <Table.Cell sx={{ paddingY: "base.spacing.x3" }}>
                        <Body mono={true} size="small">{listing.tokenId}</Body>
                      </Table.Cell>
                      <Table.Cell sx={{ paddingY: "base.spacing.x3" }}>
                        <Body mono={true} size="small">{listing.price}</Body>
                      </Table.Cell>
                      <Table.Cell sx={{ paddingY: "base.spacing.x3" }}>
                        <Body mono={true} size="small">{formatDate(listing.createdAt)}</Body>
                      </Table.Cell>
                      <Table.Cell sx={{ paddingY: "base.spacing.x3" }}>
                        <Button
                          size="small"
                          variant="secondary"
                          disabled={cancellingId === listing.id}
                          onClick={() => cancelListing(listing.id)}
                        >
                          {cancellingId === listing.id ? 'Cancelling...' : 'Cancel Listing'}
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          )}
          
          <div className="mt-4">
            <Button
              variant="secondary"
              onClick={fetchUserListings}
              disabled={isLoading}
            >
              Refresh Listings
            </Button>
          </div>
        </>
      )}
    </div>
  );
} 