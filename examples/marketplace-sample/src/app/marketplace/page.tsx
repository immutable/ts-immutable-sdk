'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { passportInstance } from '../utils/setupDefault';
import { orderbookSDK } from '../utils/setupOrderbook';
import { OrderStatusName } from '@imtbl/orderbook';
import { Button, Heading, Body, Card } from '@biom3/react';
import Link from 'next/link';
import { SUPPORTED_CHAINS, DISPLAY_SETTINGS, calculateBuyerCost } from '../utils/marketplaceConfig';

// Define the types based on the SDK structure
interface NFTListing {
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
}

interface Collection {
  name: string;
  contractAddress: string;
  description?: string;
  imageUrl?: string;
  totalItems?: number;
}

// Define the Order interface based on the SDK structure
interface Order {
  id: string;
  accountAddress: string;
  createdAt: string;
  sell: {
    contractAddress: string;
    tokenId: string;
    metadata?: {
      name?: string;
      description?: string;
      image_url?: string;
    };
  }[];
  buy: {
    amount: string;
  }[];
}

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

export default function Marketplace() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get URL parameters
  const collectionParam = searchParams.get('collection');
  const tabParam = searchParams.get('tab') || 'listings';
  
  // User state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState<string>("0");
  const [signer, setSigner] = useState<any>(null);
  
  // Marketplace data
  const [listings, setListings] = useState<NFTListing[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [userListings, setUserListings] = useState<NFTListing[]>([]);
  const [loadingListings, setLoadingListings] = useState<boolean>(true);
  const [loadingCollections, setLoadingCollections] = useState<boolean>(true);
  const [loadingUserListings, setLoadingUserListings] = useState<boolean>(true);
  
  // Filters and pagination
  const [activeTab, setActiveTab] = useState<string>(tabParam);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(collectionParam);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [priceRangeMin, setPriceRangeMin] = useState<string>("");
  const [priceRangeMax, setPriceRangeMax] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("price_asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  
  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
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
  
  // Separate useEffect for data fetching that depends on authentication state
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch marketplace data regardless of login status
        if (!isLoading) {
          fetchMarketplaceListings();
        }
        
        // If logged in, fetch user's listings
        if (isLoggedIn && accountAddress && !isLoading) {
          fetchUserListings(accountAddress);
        }
      } catch (error) {
        console.error("Error in data fetching useEffect:", error);
      }
    };
    
    fetchData();
  }, [isLoggedIn, accountAddress, isLoading]); // Only re-run when these values change
  
  // Update active tab when URL parameter changes
  useEffect(() => {
    setActiveTab(tabParam);
  }, [tabParam]);
  
  // Update selected collection when URL parameter changes
  useEffect(() => {
    setSelectedCollection(collectionParam);
    
    // If collection is selected, fetch listings for that collection
    if (collectionParam) {
      fetchListingsByCollection(collectionParam);
    }
  }, [collectionParam]);
  
  // Fetch all marketplace listings
  const fetchMarketplaceListings = async () => {
    try {
      setLoadingListings(true);
      console.log("Fetching marketplace listings");
      
      // Set a safety timeout to prevent infinite loading
      const safetyTimeout = setTimeout(() => {
        if (loadingListings) {
          console.log("Safety timeout triggered for marketplace listings");
          setLoadingListings(false);
        }
      }, 15000); // 15 seconds timeout
      
      // Use the orderbook SDK to fetch active listings
      const response = await orderbookSDK.listOrders({
        status: OrderStatusName.ACTIVE,
        type: 'LISTING',
        chainName: SUPPORTED_CHAINS.DEFAULT,
        cursor: '',
        pageSize: DISPLAY_SETTINGS.ITEMS_PER_PAGE
      });
      
      // Clear the safety timeout since we got a response
      clearTimeout(safetyTimeout);
      
      console.log("List orders response:", response);
      
      if (response && response.result) {
        // Process the listings to extract NFT details
        const listingsData: NFTListing[] = await Promise.all(
          response.result.map(async (order: Order) => {
            const nftItem = order.sell[0]; // Assuming the first sell item is the NFT
            let nftMetadata: any = { name: `NFT #${nftItem.tokenId}`, image_url: null };
            let collectionName = 'Unknown Collection';
            
            // Try to fetch additional NFT details
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
                  
                  if (tokenDetails) {
                    nftMetadata = tokenDetails.metadata || nftMetadata;
                  }
                } catch (tokenError) {
                  console.error("Error fetching token details:", tokenError);
                }
              }
              
              // Try to fetch collection details
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
            } catch (error) {
              console.error("Error with blockchainData client:", error);
            }
            
            return {
              id: order.id,
              contractAddress: nftItem.contractAddress,
              tokenId: nftItem.tokenId,
              name: nftMetadata.name || `NFT #${nftItem.tokenId}`,
              description: nftMetadata.description,
              imageUrl: nftMetadata.image_url || '/placeholder-image.png',
              collectionName,
              price: order.buy[0].amount,
              sellerAddress: order.accountAddress,
              createdAt: order.createdAt
            };
          })
        );
        
        console.log("Processed listings data:", listingsData);
        setListings(listingsData);
        
        // Set pagination info
        if (response.page) {
          setTotalPages(Math.ceil(response.result.length / DISPLAY_SETTINGS.ITEMS_PER_PAGE));
        }
        
        // Now that we have listings, fetch collections
        fetchCollections();
      } else {
        console.log("No listings found or invalid response format");
        setListings([]);
        setTotalPages(1);
      }
      
      setLoadingListings(false);
    } catch (error) {
      console.error("Error fetching marketplace listings:", error);
      setListings([]);
      setLoadingListings(false);
    }
  };
  
  // Fetch listings by collection
  const fetchListingsByCollection = async (collectionAddress: string) => {
    try {
      setLoadingListings(true);
      console.log("Fetching listings for collection:", collectionAddress);
      
      // Set a safety timeout to prevent infinite loading
      const safetyTimeout = setTimeout(() => {
        if (loadingListings) {
          console.log("Safety timeout triggered for collection listings");
          setLoadingListings(false);
        }
      }, 15000); // 15 seconds timeout
      
      // Use the orderbook SDK to fetch active listings for a specific collection
      const response = await orderbookSDK.listOrders({
        status: OrderStatusName.ACTIVE,
        type: 'LISTING',
        chainName: SUPPORTED_CHAINS.DEFAULT,
        sellToken: {
          type: 'ERC721',
          contractAddress: collectionAddress
        },
        cursor: '',
        pageSize: DISPLAY_SETTINGS.ITEMS_PER_PAGE
      });
      
      // Clear the safety timeout since we got a response
      clearTimeout(safetyTimeout);
      
      console.log("Collection listings response:", response);
      
      if (response && response.result) {
        // Process the listings to extract NFT details
        const listingsData: NFTListing[] = await Promise.all(
          response.result.map(async (order: Order) => {
            const nftItem = order.sell[0]; // Assuming the first sell item is the NFT
            let nftMetadata: any = { name: `NFT #${nftItem.tokenId}`, image_url: null };
            let collectionName = 'Unknown Collection';
            
            // Try to fetch additional NFT details
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
                  
                  if (tokenDetails) {
                    nftMetadata = tokenDetails.metadata || nftMetadata;
                  }
                } catch (tokenError) {
                  console.error("Error fetching token details:", tokenError);
                }
              }
              
              // Try to fetch collection details
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
            } catch (error) {
              console.error("Error with blockchainData client:", error);
            }
            
            return {
              id: order.id,
              contractAddress: nftItem.contractAddress,
              tokenId: nftItem.tokenId,
              name: nftMetadata.name || `NFT #${nftItem.tokenId}`,
              description: nftMetadata.description,
              imageUrl: nftMetadata.image_url || '/placeholder-image.png',
              collectionName,
              price: order.buy[0].amount,
              sellerAddress: order.accountAddress,
              createdAt: order.createdAt
            };
          })
        );
        
        console.log("Processed collection listings data:", listingsData);
        setListings(listingsData);
        
        // Set pagination info
        if (response.page) {
          setTotalPages(Math.ceil(response.result.length / DISPLAY_SETTINGS.ITEMS_PER_PAGE));
        }
      } else {
        console.log("No collection listings found or invalid response format");
        setListings([]);
        setTotalPages(1);
      }
      
      setLoadingListings(false);
    } catch (error) {
      console.error("Error fetching collection listings:", error);
      setListings([]);
      setLoadingListings(false);
    }
  };
  
  // Fetch all collections
  const fetchCollections = async () => {
    try {
      setLoadingCollections(true);
      console.log("Fetching collections based on listings");
      
      // Set a safety timeout to prevent infinite loading
      const safetyTimeout = setTimeout(() => {
        if (loadingCollections) {
          console.log("Safety timeout triggered for collections");
          setLoadingCollections(false);
        }
      }, 10000); // 10 seconds timeout
      
      // Extract collections from the listings we already have
      if (listings.length > 0) {
        const uniqueCollections = new Map<string, Collection>();
        
        await Promise.all(
          listings.map(async (item) => {
            if (!uniqueCollections.has(item.contractAddress)) {
              try {
                const { blockchainData } = orderbookSDK.getAllClients();
                
                // Try different methods to get collection info
                try {
                  const collectionDetails = await blockchainData.getCollection({
                    chainName: SUPPORTED_CHAINS.DEFAULT,
                    contractAddress: item.contractAddress
                  });
                  
                  if (collectionDetails) {
                    uniqueCollections.set(item.contractAddress, {
                      name: collectionDetails.name || 'Unknown Collection',
                      contractAddress: item.contractAddress,
                      description: collectionDetails.description,
                      imageUrl: collectionDetails.image_url || '/placeholder-collection.png',
                      totalItems: collectionDetails.total_supply_raw 
                        ? parseInt(collectionDetails.total_supply_raw)
                        : undefined
                    });
                  }
                } catch (error) {
                  console.log("Error with getCollection, using listing data as fallback", error);
                  uniqueCollections.set(item.contractAddress, {
                    name: item.collectionName || 'Unknown Collection',
                    contractAddress: item.contractAddress,
                    imageUrl: '/placeholder-collection.png'
                  });
                }
              } catch (error) {
                console.error("Error fetching collection details:", error);
                uniqueCollections.set(item.contractAddress, {
                  name: item.collectionName || 'Unknown Collection',
                  contractAddress: item.contractAddress,
                  imageUrl: '/placeholder-collection.png'
                });
              }
            }
          })
        );
        
        console.log("Processed collections:", Array.from(uniqueCollections.values()));
        setCollections(Array.from(uniqueCollections.values()));
      } else {
        console.log("No listings available to extract collections from");
        setCollections([]);
      }
      
      // Clear the safety timeout since we processed the data
      clearTimeout(safetyTimeout);
      
      setLoadingCollections(false);
    } catch (error) {
      console.error("Error in fetchCollections:", error);
      setCollections([]);
      setLoadingCollections(false);
    }
  };
  
  // Fetch user's listings
  const fetchUserListings = async (address: string) => {
    try {
      setLoadingUserListings(true);
      console.log("Fetching user listings for address:", address);
      
      // Set a safety timeout to prevent infinite loading
      const safetyTimeout = setTimeout(() => {
        if (loadingUserListings) {
          console.log("Safety timeout triggered for user listings");
          setLoadingUserListings(false);
        }
      }, 15000); // 15 seconds timeout
      
      // Use the orderbook SDK to fetch user's active listings
      const response = await orderbookSDK.listOrders({
        status: OrderStatusName.ACTIVE,
        type: 'LISTING',
        chainName: SUPPORTED_CHAINS.DEFAULT,
        accountAddress: address,
        cursor: '',
        pageSize: DISPLAY_SETTINGS.ITEMS_PER_PAGE
      });
      
      // Clear the safety timeout since we got a response
      clearTimeout(safetyTimeout);
      
      console.log("User listings response:", response);
      
      if (response && response.result) {
        // Process the listings to extract NFT details
        const listingsData: NFTListing[] = await Promise.all(
          response.result.map(async (order: Order) => {
            const nftItem = order.sell[0]; // Assuming the first sell item is the NFT
            let nftMetadata: any = { name: `NFT #${nftItem.tokenId}`, image_url: null };
            let collectionName = 'Unknown Collection';
            
            // Try to fetch additional NFT details
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
                  
                  if (tokenDetails) {
                    nftMetadata = tokenDetails.metadata || nftMetadata;
                  }
                } catch (tokenError) {
                  console.error("Error fetching token details:", tokenError);
                }
              }
              
              // Try to fetch collection details
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
            } catch (error) {
              console.error("Error with blockchainData client:", error);
            }
            
            return {
              id: order.id,
              contractAddress: nftItem.contractAddress,
              tokenId: nftItem.tokenId,
              name: nftMetadata.name || `NFT #${nftItem.tokenId}`,
              description: nftMetadata.description,
              imageUrl: nftMetadata.image_url || '/placeholder-image.png',
              collectionName,
              price: order.buy[0].amount,
              sellerAddress: order.accountAddress,
              createdAt: order.createdAt
            };
          })
        );
        
        console.log("Processed user listings data:", listingsData);
        setUserListings(listingsData);
      } else {
        console.log("No user listings found or invalid response format");
        setUserListings([]);
      }
      
      setLoadingUserListings(false);
    } catch (error) {
      console.error("Error fetching user listings:", error);
      setUserListings([]);
      setLoadingUserListings(false);
    }
  };
  
  // Handle tab change
  const handleTabChange = (id: string) => {
    setActiveTab(id);
    router.push(`/marketplace?tab=${id}`);
    
    // Reset collection filter when changing tabs
    if (selectedCollection && id !== 'collections') {
      setSelectedCollection(null);
    }
  };
  
  // Handle collection selection
  const handleCollectionSelect = (collectionAddress: string) => {
    setSelectedCollection(collectionAddress);
    router.push(`/marketplace?collection=${collectionAddress}`);
    setActiveTab('listings');
  };
  
  // Apply filters to listings
  const applyFilters = () => {
    let filtered = [...listings];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        (item.name?.toLowerCase().includes(query) || false) || 
        item.tokenId.toLowerCase().includes(query) ||
        (item.collectionName?.toLowerCase().includes(query) || false)
      );
    }
    
    // Apply price range filter
    if (priceRangeMin) {
      filtered = filtered.filter(item => parseFloat(item.price) >= parseFloat(priceRangeMin));
    }
    
    if (priceRangeMax) {
      filtered = filtered.filter(item => parseFloat(item.price) <= parseFloat(priceRangeMax));
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'price_asc':
        filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price_desc':
        filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      default:
        break;
    }
    
    return filtered;
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
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <Heading>NFT Marketplace</Heading>
        <Body className="mt-2">Discover, buy, and sell unique digital assets</Body>
      </div>
      
      <div className="mb-8">
        <div className="flex space-x-4 border-b border-gray-200">
          <button 
            className={`py-2 px-4 text-base font-medium ${activeTab === 'listings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => handleTabChange('listings')}
          >
            All Listings
          </button>
          <button 
            className={`py-2 px-4 text-base font-medium ${activeTab === 'collections' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => handleTabChange('collections')}
          >
            Collections
          </button>
          {isLoggedIn && (
            <button 
              className={`py-2 px-4 text-base font-medium ${activeTab === 'my-listings' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => handleTabChange('my-listings')}
            >
              My Listings
            </button>
          )}
        </div>
      </div>
      
      {/* Filters */}
      {activeTab === 'listings' && (
        <div className="mb-8 bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, token ID..."
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
              <input
                type="number"
                value={priceRangeMin}
                onChange={(e) => setPriceRangeMin(e.target.value)}
                placeholder="Min ETH"
                min="0"
                step="0.001"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
              <input
                type="number"
                value={priceRangeMax}
                onChange={(e) => setPriceRangeMax(e.target.value)}
                placeholder="Max ETH"
                min="0"
                step="0.001"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      {/* Selected Collection Info */}
      {selectedCollection && (
        <div className="mb-8">
          {collections.filter(c => c.contractAddress === selectedCollection).map((collection, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
              <div>
                <Heading size="medium">{collection.name}</Heading>
                <Body className="mt-1">{collection.description || 'No description available'}</Body>
                <Body className="text-sm text-gray-500 mt-1">
                  {collection.totalItems || 0} items • Contract: {formatAddress(collection.contractAddress)}
                </Body>
              </div>
              <Button 
                variant="secondary"
                onClick={() => {
                  setSelectedCollection(null);
                  router.push('/marketplace');
                }}
              >
                Clear Filter
              </Button>
            </div>
          ))}
        </div>
      )}
      
      {/* Content based on active tab */}
      {activeTab === 'listings' && (
        <div>
          {loadingListings ? (
            <div className="text-center py-10">
              <p>Loading listings...</p>
            </div>
          ) : applyFilters().length === 0 ? (
            <div className="text-center py-10 border border-gray-200 rounded-lg">
              <Body size="large">No listings found</Body>
              {!isLoggedIn ? (
                <div className="mt-4">
                  <Button onClick={loginWithPassport}>Connect Wallet to Sell</Button>
                </div>
              ) : (
                <div className="mt-4">
                  <Link href="/dashboard">
                    <Button>Go to Dashboard to Sell</Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {applyFilters().map((listing, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gray-200 relative">
                    {listing.imageUrl ? (
                      <img 
                        src={listing.imageUrl} 
                        alt={listing.name || 'NFT'} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Body>No image available</Body>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <Heading size="small" className="line-clamp-1">{listing.name}</Heading>
                        <Body className="text-gray-600 text-sm mt-1">
                          {listing.collectionName || 'Unknown Collection'}
                        </Body>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{parseFloat(listing.price).toFixed(6)} ETH</div>
                        <div className="text-xs text-gray-500">
                          ~{calculateBuyerCost(listing.price)} ETH with fees
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <Body className="text-xs text-gray-500">
                        Seller: {formatAddress(listing.sellerAddress)}
                      </Body>
                      <Link href={`/marketplace/details?id=${listing.id}`}>
                        <Button size="small">View</Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <div className="flex items-center px-4">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="secondary"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'collections' && (
        <div>
          {loadingCollections ? (
            <div className="text-center py-10">
              <p>Loading collections...</p>
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-10 border border-gray-200 rounded-lg">
              <Body size="large">No collections found</Body>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((collection, index) => (
                <div 
                  key={index} 
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleCollectionSelect(collection.contractAddress)}
                >
                  <div className="h-48 bg-gray-200 relative">
                    {collection.imageUrl ? (
                      <img 
                        src={collection.imageUrl} 
                        alt={collection.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Body>No image available</Body>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <Heading size="small">{collection.name}</Heading>
                    <Body className="text-gray-600 mt-2 line-clamp-2">
                      {collection.description || 'No description available'}
                    </Body>
                    <div className="mt-4 flex justify-between items-center">
                      <Body className="text-gray-500">
                        {collection.totalItems || 0} NFTs
                      </Body>
                      <Button 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCollectionSelect(collection.contractAddress);
                        }}
                      >
                        View Listings
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'my-listings' && (
        <div>
          {!isLoggedIn ? (
            <div className="text-center py-10 border border-gray-200 rounded-lg">
              <Body size="large">Please connect your wallet to view your listings</Body>
              <div className="mt-4">
                <Button onClick={loginWithPassport}>Connect Wallet</Button>
              </div>
            </div>
          ) : loadingUserListings ? (
            <div className="text-center py-10">
              <p>Loading your listings...</p>
            </div>
          ) : userListings.length === 0 ? (
            <div className="text-center py-10 border border-gray-200 rounded-lg">
              <Body size="large">You don't have any active listings</Body>
              <div className="mt-4">
                <Link href="/dashboard">
                  <Button>Go to Dashboard to Sell</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {userListings.map((listing, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gray-200 relative">
                    {listing.imageUrl ? (
                      <img 
                        src={listing.imageUrl} 
                        alt={listing.name || 'NFT'} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Body>No image available</Body>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <Heading size="small" className="line-clamp-1">{listing.name}</Heading>
                        <Body className="text-gray-600 text-sm mt-1">
                          {listing.collectionName || 'Unknown Collection'}
                        </Body>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{parseFloat(listing.price).toFixed(6)} ETH</div>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <Body className="text-xs text-gray-500">
                        Listed: {new Date(listing.createdAt).toLocaleDateString()}
                      </Body>
                      <Link href={`/marketplace/details?id=${listing.id}`}>
                        <Button size="small">Manage</Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}