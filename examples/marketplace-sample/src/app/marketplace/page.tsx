'use client';

import { useEffect, useState } from 'react';
import { BrowserProvider } from 'ethers';
import { passportInstance } from '../utils/setupDefault';
import { orderbookSDK } from '../utils/setupOrderbook';
import { OrderStatusName } from '@imtbl/orderbook';
import { Button, Table, Body } from '@biom3/react';
import Link from 'next/link';
import CreateListing from '../../component/CreateListing';
import MyListings from '../../component/MyListings';

// Define the types based on the SDK structure
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

interface ListOrdersResponse {
  result: Order[];
  page: {
    nextCursor: string;
    previousCursor: string;
  };
}

export default function Marketplace() {
  // User state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<string>("0");
  const [provider, setProvider] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);
  
  // Marketplace data
  const [marketplaceItems, setMarketplaceItems] = useState<Order[]>([]);
  const [filteredItems, setFilteredItems] = useState<Order[]>([]);
  const [loadingItems, setLoadingItems] = useState<boolean>(true);
  const [purchasingItem, setPurchasingItem] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const itemsPerPage = 20;
  
  // Filters
  const [listingIdFilter, setListingIdFilter] = useState<string>("");
  const [contractAddressFilter, setContractAddressFilter] = useState<string>("");
  const [tokenIdFilter, setTokenIdFilter] = useState<string>("");
  const [priceRangeMin, setPriceRangeMin] = useState<string>("");
  const [priceRangeMax, setPriceRangeMax] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("price_asc");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Collections derived from marketplace items
  const [collections, setCollections] = useState<string[]>([]);

  // UI state
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'my-listings'>('buy');

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };
  
  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Check authentication on page load
  useEffect(() => {
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
              
              // Get wallet balance
              const ethProvider = new BrowserProvider(passportProvider);
              const balanceInWei = await ethProvider.getBalance(accounts[0]);
              const balanceInEth = parseFloat(balanceInWei.toString()) / 1e18;
              setWalletBalance(balanceInEth.toFixed(4));
              
              // Set up signer
              const signer = await ethProvider.getSigner();
              setSigner(signer);
            }
          }
        }
      } catch (error) {
        console.error("Failed to check login status:", error);
      } finally {
        setIsLoading(false);
        // Fetch marketplace listings even if not logged in
        fetchListings();
      }
    };
    
    checkLoginStatus();
  }, []);

  // Fetch listings from Orderbook SDK
  const fetchListings = async () => {
    try {
      setLoadingItems(true);
      
      // Calculate pagination parameters
      const offset = (currentPage - 1) * itemsPerPage;
      
      // Call the Orderbook SDK to get actual listings
      const response: ListOrdersResponse = await orderbookSDK.listListings({
        status: OrderStatusName.ACTIVE,
        offset: offset,
        limit: itemsPerPage,
        sellTokenType: "ERC721" // Filter for NFTs
      });
      
      // Get unique collections for filter dropdown
      const collectionsSet = new Set<string>();
      response.result.forEach((order: Order) => {
        if (order.sell[0]?.metadata?.name) {
          collectionsSet.add(order.sell[0].metadata.name);
        }
      });
      setCollections(Array.from(collectionsSet));
      console.log(response.result);
      // Set listings and pagination info
      setMarketplaceItems(response.result);
      setFilteredItems(response.result);
      
      // Calculate total pages based on available results
      // Since we don't have a total count, we'll estimate based on current results
      const totalItems = response.result.length;
      const hasMore = response.page.nextCursor !== null && response.page.nextCursor !== '';
      setTotalPages(hasMore ? currentPage + 1 : currentPage);
      
    } catch (error) {
      console.error("Failed to fetch listings:", error);
    } finally {
      setLoadingItems(false);
    }
  };

  // Apply filters
  const applyFilters = () => {
    if (!marketplaceItems.length) return;
    
    let filtered = [...marketplaceItems];
    
    // Search query filter (searches in name, token ID, and contract address)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => {
        const name = order.sell[0]?.metadata?.name?.toLowerCase() || '';
        const tokenId = order.sell[0]?.tokenId?.toLowerCase() || '';
        const contractAddress = order.sell[0]?.contractAddress?.toLowerCase() || '';
        
        return name.includes(query) || 
               tokenId.includes(query) || 
               contractAddress.includes(query);
      });
    }
    
    // Filter by Listing ID
    if (listingIdFilter) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(listingIdFilter.toLowerCase())
      );
    }
    
    // Filter by Contract Address
    if (contractAddressFilter) {
      filtered = filtered.filter(order => 
        order.sell[0]?.contractAddress?.toLowerCase().includes(contractAddressFilter.toLowerCase())
      );
    }
    
    // Filter by Token ID
    if (tokenIdFilter) {
      filtered = filtered.filter(order => 
        order.sell[0]?.tokenId?.toString().includes(tokenIdFilter)
      );
    }
    
    // Filter by Price (min)
    if (priceRangeMin !== "") {
      filtered = filtered.filter(order => {
        const price = parseFloat(order.buy[0]?.amount || "0");
        return price >= parseFloat(priceRangeMin);
      });
    }
    
    // Filter by Price (max)
    if (priceRangeMax !== "") {
      filtered = filtered.filter(order => {
        console.log(priceRangeMax);
        const price = parseFloat(order.buy[0]?.amount || "0");
        return price <= parseFloat(priceRangeMax);
      });
    }
    
    // Apply sorting
    if (sortOption === "price_asc") {
      filtered.sort((a, b) => {
        const priceA = parseFloat(a.buy[0]?.amount || "0");
        const priceB = parseFloat(b.buy[0]?.amount || "0");
        return priceA - priceB;
      });
    } else if (sortOption === "price_desc") {
      filtered.sort((a, b) => {
        const priceA = parseFloat(a.buy[0]?.amount || "0");
        const priceB = parseFloat(b.buy[0]?.amount || "0");
        return priceB - priceA;
      });
    }
    
    setFilteredItems(filtered);
  };

  // Handle page changes
  const changePage = (newPage: number) => {
    setCurrentPage(newPage);
    // Refetch with new page
    fetchListings();
  };
  
  // Update filters when filter state changes
  useEffect(() => {
    applyFilters();
  }, [listingIdFilter, contractAddressFilter, tokenIdFilter, priceRangeMin, priceRangeMax, sortOption, searchQuery, marketplaceItems]);

  // Login with Passport
  const loginWithPassport = async () => {
    if (!passportInstance) return;
    try {
      setIsLoading(true);
      
      const passportProvider = await passportInstance.connectEvm();
      setProvider(passportProvider);
      
      const accounts = await passportProvider.request({ method: 'eth_requestAccounts' });
      
      if (accounts && accounts.length > 0) {
        setIsLoggedIn(true);
        setAccountAddress(accounts[0]);
        
        // Get wallet balance
        const ethProvider = new BrowserProvider(passportProvider);
        const balanceInWei = await ethProvider.getBalance(accounts[0]);
        const balanceInEth = parseFloat(balanceInWei.toString()) / 1e18;
        setWalletBalance(balanceInEth.toFixed(4));
        
        // Set up signer
        const signer = await ethProvider.getSigner();
        setSigner(signer);
      }
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Purchase an item
  const purchaseItem = async (order: Order) => {
    if (!isLoggedIn) {
      loginWithPassport();
      return;
    }
    
    if (!signer || !order.id) {
      setPurchaseError("Cannot complete purchase. Please try again later.");
      return;
    }
    
    try {
      setPurchasingItem(order.id);
      setPurchaseError(null);
      setPurchaseSuccess(null);
      
      // Prepare purchase parameters
      const takerFeeRecipient = "0x0000000000000000000000000000000000000000";
      const takerFeePercentage = 0;
      
      // Call the fulfill method to purchase the item
      const result = await orderbookSDK.fulfillOrder({
        orderId: order.id,
        signer: signer,
        takerFeeRecipient,
        takerFeePercentage
      });
      
      setPurchaseSuccess(`Successfully purchased ${order.sell[0]?.metadata?.name || 'NFT'}!`);
      
      // Refresh listings after purchase
      await fetchListings();
      
    } catch (error) {
      console.error("Purchase failed:", error);
      setPurchaseError("Failed to complete purchase. Please try again.");
    } finally {
      setPurchasingItem(null);
    }
  };

  // Function to clear all filters
  const clearFilters = () => {
    setListingIdFilter("");
    setContractAddressFilter("");
    setTokenIdFilter("");
    setPriceRangeMin("");
    setPriceRangeMax("");
    setSortOption("price_asc");
    setSearchQuery("");
  };

  // Handle listing creation
  const handleListingCreated = () => {
    // Refresh listings after a new listing is created
    fetchListings();
    // Switch to my-listings tab to show the user their new listing
    setActiveTab('my-listings');
  };

  // Handle listing cancellation
  const handleListingCancelled = () => {
    // Refresh listings after a listing is cancelled
    fetchListings();
  };

  return (
    <div className="min-h-screen w-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Purchase notifications */}
        {purchaseError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl">
            {purchaseError}
            <button 
              onClick={() => setPurchaseError(null)}
              className="ml-2 text-red-700 hover:text-red-900"
            >
              ✕
            </button>
          </div>
        )}
        
        {purchaseSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-100 text-green-700 rounded-xl">
            {purchaseSuccess}
            <button 
              onClick={() => setPurchaseSuccess(null)}
              className="ml-2 text-green-700 hover:text-green-900"
            >
              ✕
            </button>
          </div>
        )}

        {/* User info and login button */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">NFT Marketplace</h1>
          
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="text-gray-500">Address:</span> {formatAddress(accountAddress || '')}
              </div>
              <div className="text-sm">
                <span className="text-gray-500">Balance:</span> {walletBalance} ETH
              </div>
            </div>
          ) : (
            <Button
              variant="primary"
              onClick={loginWithPassport}
              disabled={isLoading}
            >
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          )}
        </div>
        
        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('buy')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'buy'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Buy NFTs
              </button>
              <button
                onClick={() => setActiveTab('sell')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'sell'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Sell NFTs
              </button>
              <button
                onClick={() => setActiveTab('my-listings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my-listings'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Listings
              </button>
            </nav>
          </div>
        </div>
        
        {activeTab === 'sell' ? (
          <CreateListing
            isLoggedIn={isLoggedIn}
            signer={signer}
            accountAddress={accountAddress}
            onListingCreated={handleListingCreated}
            onLoginRequired={loginWithPassport}
          />
        ) : activeTab === 'my-listings' ? (
          <MyListings
            isLoggedIn={isLoggedIn}
            signer={signer}
            accountAddress={accountAddress}
            onLoginRequired={loginWithPassport}
            onListingCancelled={handleListingCancelled}
          />
        ) : (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white shadow rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Filters</h2>
              
              {/* Search bar */}
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name, token ID, or contract address"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                  <div className="absolute left-3 top-3 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Listing ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Listing ID</label>
                  <input
                    type="text"
                    placeholder="Filter by listing ID"
                    value={listingIdFilter}
                    onChange={(e) => setListingIdFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                
                {/* Contract Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contract Address</label>
                  <input
                    type="text"
                    placeholder="Filter by contract address"
                    value={contractAddressFilter}
                    onChange={(e) => setContractAddressFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                
                {/* Token ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Token ID</label>
                  <input
                    type="text"
                    placeholder="Filter by token ID"
                    value={tokenIdFilter}
                    onChange={(e) => setTokenIdFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                
                {/* Price Range */}
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                    <input
                      type="number"
                      placeholder="Min"
                      min="0"
                      step="0.01"
                      value={priceRangeMin}
                      onChange={(e) => setPriceRangeMin(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                    <input
                      type="number"
                      placeholder="Max"
                      min="0"
                      step="0.01"
                      value={priceRangeMax}
                      onChange={(e) => setPriceRangeMax(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>
                
                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Listings */}
            <div className="bg-white shadow rounded-xl p-6 w-full mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Marketplace Listings</h2>
                <div className="text-sm text-gray-500">
                  {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} available
                </div>
              </div>
              
              {loadingItems ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl">
                  <p className="text-gray-500 mb-4">No items found matching your criteria</p>
                  <button 
                    onClick={clearFilters}
                    className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <Table sx={{ maxWidth: "2000px", width: "100%", maxHeight: "800px", overflowY: "auto", marginBottom: "base.spacing.x5", justifySelf: "center"}}>
                  <Table.Head>
                    <Table.Row>
                      <Table.Cell sx={{ padding: "base.spacing.x2" }}>SNO</Table.Cell>
                      <Table.Cell sx={{ padding: "base.spacing.x2" }}>Listing ID</Table.Cell>
                      <Table.Cell sx={{ padding: "base.spacing.x2" }}>Contract Address</Table.Cell>
                      <Table.Cell sx={{ padding: "base.spacing.x2" }}>Token ID</Table.Cell>
                      <Table.Cell sx={{ padding: "base.spacing.x2" }}>Name</Table.Cell>
                      <Table.Cell sx={{ padding: "base.spacing.x2" }}>Price</Table.Cell>
                      <Table.Cell sx={{ padding: "base.spacing.x2" }}></Table.Cell>
                    </Table.Row>
                  </Table.Head>
                  <Table.Body>
                    {filteredItems.map((listing: Order, index: number) => {
                      return (
                        <Table.Row key={index}>
                          <Table.Cell sx={{ paddingLeft: "base.spacing.x5", paddingRight: "base.spacing.x2", paddingY: "base.spacing.x5" }}>
                            <Body mono={true} size="small">{index + 1}</Body>
                          </Table.Cell>
                          <Table.Cell sx={{ paddingX: "base.spacing.x2", paddingY: "base.spacing.x5" }}>
                            <Body mono={true} size="small">{listing.id.substring(0, 8)}...</Body>
                          </Table.Cell>
                          <Table.Cell sx={{ paddingX: "base.spacing.x2", paddingY: "base.spacing.x5" }}>
                            <Body mono={true} size="small">{(listing.sell[0].contractAddress)}</Body>
                          </Table.Cell>
                          <Table.Cell sx={{ paddingX: "base.spacing.x2", paddingY: "base.spacing.x5" }}>
                            <Body mono={true} size="small">{listing.sell[0].tokenId}</Body>
                          </Table.Cell>
                          <Table.Cell sx={{ paddingLeft: "base.spacing.x2", paddingRight: "base.spacing.x5", paddingY: "base.spacing.x2" }}>
                            <Body mono={true} size="small">{listing.buy[0].amount} ETH</Body>
                          </Table.Cell>
                          <Table.Cell sx={{ paddingLeft: "base.spacing.x2", paddingRight: "base.spacing.x5", paddingY: "base.spacing.x2" }}>
                            <Button
                              size="small"
                              variant="primary"
                              disabled={loadingItems || purchasingItem === listing.id}
                              onClick={() => purchaseItem(listing)}
                            >
                              {purchasingItem === listing.id ? 'Purchasing...' : 'Purchase'}
                            </Button>
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
                </Table>
              )}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <nav className="flex items-center space-x-2">
                    <button
                      onClick={() => changePage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded-full border border-gray-300 text-sm disabled:opacity-50"
                    >
                      Previous
                    </button>
                    
                    <div className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </div>
                    
                    <button
                      onClick={() => changePage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 rounded-full border border-gray-300 text-sm disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}