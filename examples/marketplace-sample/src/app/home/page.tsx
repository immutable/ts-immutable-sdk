'use client';
import { useEffect, useState, useMemo } from 'react';
import { BrowserProvider } from 'ethers';
import { passportInstance } from '../utils/setupDefault';
import { orderbookSDK } from '../utils/setupOrderbook';
import Link from 'next/link';
import { Provider } from '@imtbl/sdk/passport';
import { Orderbook } from '@imtbl/orderbook';
import { blockchainData } from '@imtbl/sdk';
import { SUPPORTED_CHAINS } from '../utils/marketplaceConfig';

export default function Home() {
  // User and wallet state
  const [userProfile, setUserProfile] = useState<any>(null);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [loading, setLoading] = useState<boolean>(true);
  
  // NFTs and transactions
  const [userNFTs, setUserNFTs] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  // Provider setup
  const [passportProvider, setPassportProvider] = useState<Provider>();
  const browserProvider = useMemo(() => 
    passportProvider ? new BrowserProvider(passportProvider) : undefined, 
    [passportProvider]
  );

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Check authentication and fetch user data
  useEffect(() => {
    const initializeUserData = async () => {
      try {
        setLoading(true);
        
        // Check if user is already authenticated - use getUserInfo to check authentication
        try {
          const profile = await passportInstance.getUserInfo();
          
          // If we get here without an error, user is authenticated
          setUserProfile(profile);
          
          // Connect provider and get account
          const provider = await passportInstance.connectEvm();
          setPassportProvider(provider);
          
          if (provider) {
            const accounts = await provider.request({ method: "eth_accounts" });
            if (accounts && accounts.length > 0) {
              setAccountAddress(accounts[0]);
              
              // Get wallet balance
              const ethProvider = new BrowserProvider(provider);
              const balanceInWei = await ethProvider.getBalance(accounts[0]);
              const balanceInEth = parseFloat(balanceInWei.toString()) / 1e18;
              setBalance(balanceInEth.toFixed(4));
              
              // Fetch NFTs and transactions
              await fetchUserNFTs(accounts[0]);
              await fetchTransactionHistory(accounts[0]);
            }
          }
        } catch (authError) {
          // If getUserInfo fails, user is not authenticated
          console.log("User is not authenticated:", authError);
        }
      } catch (error) {
        console.error("Failed to initialize user data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeUserData();
  }, []);

  // Login with Passport
  const handleLogin = async () => {
    try {
      setLoading(true);
      const provider = await passportInstance.connectEvm();
      setPassportProvider(provider);
      
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        setAccountAddress(accounts[0]);
        
        const profile = await passportInstance.getUserInfo();
        setUserProfile(profile);
        
        // Get wallet balance
        const ethProvider = new BrowserProvider(provider);
        const balanceInWei = await ethProvider.getBalance(accounts[0]);
        const balanceInEth = parseFloat(balanceInWei.toString()) / 1e18;
        setBalance(balanceInEth.toFixed(4));
        
        // Fetch user NFTs and transactions
        await fetchUserNFTs(accounts[0]);
        await fetchTransactionHistory(accounts[0]);
      }
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user NFTs using Immutable's SDK
  const fetchUserNFTs = async (address: string) => {
    try {
      // Get the blockchain data provider from orderbook SDK
      const blockchainData = orderbookSDK.getAllClients().blockchainData;
      console.log("blockchainData", blockchainData);
      
      // Log the user address for debugging
      console.log("Fetching NFTs for address:", address);
      
      // Try with expanded parameters
      try {
        // Use the listNFTsByAccountAddress method with supported parameters
        const response = await blockchainData.listNFTsByAccountAddress({
          accountAddress: address,
          chainName: SUPPORTED_CHAINS.IMTBL_ZKEVM_TESTNET,
          pageSize: 100  // Request more NFTs per page
        });
        
        console.log("NFT response:", response);
        console.log("User address:", address);
        
        if (response && response.result && response.result.length > 0) {
          setUserNFTs(response.result);
        } else {
          // Check the console logs to see what's coming back
          console.log("No NFTs found or empty result array received");
          setUserNFTs([]);
        }
      } catch (error) {
        console.error("Error fetching NFTs:", error);
        setUserNFTs([]);
      }
    } catch (error) {
      console.error("Failed to fetch NFTs:", error);
      setUserNFTs([]);
    }
  };

  // Fetch transaction history using Immutable's SDK
  const fetchTransactionHistory = async (address: string) => {
    try {
      // For now, focus on orderbook trades since they're most likely to be available
      console.log("Fetching transaction history from orderbook for address:", address);
      
      try {
        // Use the orderbook SDK directly to fetch trade history
        const orderbookResponse = await orderbookSDK.listTrades({
          chainName: SUPPORTED_CHAINS.IMTBL_ZKEVM_TESTNET,
          walletAddress: address,
          limit: 20
        });
        
        console.log("Orderbook transaction history:", orderbookResponse);
        
        if (orderbookResponse && orderbookResponse.result) {
          // Process trades into our transaction format
          const tradeTransactions = orderbookResponse.result.map((trade: any) => ({
            id: trade.id || `trade-${Math.random().toString(36).substr(2, 9)}`,
            hash: trade.transactionHash || '',
            type: trade.makerAddress?.toLowerCase() === address.toLowerCase() ? 'Sale' : 'Purchase',
            assetName: trade.nft?.tokenId || `NFT #${trade.nft?.tokenId || 'Unknown'}`,
            value: `${parseFloat(trade.takerAmount || '0') / 1e18} ETH`,
            timestamp: new Date(trade.timestamp || Date.now()).getTime()
          }));
          
          setTransactions(tradeTransactions);
        } else {
          console.log("No trade history found");
          setTransactions([]);
        }
      } catch (error) {
        console.error("Error fetching trade history:", error);
        setTransactions([]);
      }
    } catch (error) {
      console.error("Failed to fetch transaction history:", error);
      setTransactions([]);
    }
  };

  // Helper function to process transaction data
  const processTransactionData = (txData: any[], userAddress: string) => {
    return txData.map(tx => {
      // Determine transaction type based on data
      let type = 'Transaction';
      if (tx.transfers && tx.transfers.length > 0) {
        if (tx.transfers[0].from.toLowerCase() === userAddress.toLowerCase()) {
          type = 'Sale';
        } else if (tx.transfers[0].to.toLowerCase() === userAddress.toLowerCase()) {
          type = 'Purchase';
        }
      }
      
      // Extract asset name if available
      let assetName = 'Unknown Asset';
      if (tx.transfers && tx.transfers.length > 0 && tx.transfers[0].token_id) {
        assetName = `#${tx.transfers[0].token_id}`;
      }
      
      // Extract value if available
      let value = 'N/A';
      if (tx.transfers && tx.transfers.length > 0 && tx.transfers[0].value) {
        value = `${parseFloat(tx.transfers[0].value) / 1e18} ETH`;
      }
      
      return {
        id: tx.transaction_hash || tx.id || `tx-${Math.random().toString(36).substr(2, 9)}`,
        hash: tx.transaction_hash || tx.hash || '',
        type,
        assetName,
        value,
        timestamp: (tx.timestamp ? tx.timestamp * 1000 : Date.now()), // Convert to milliseconds
      };
    });
  };

  return (
    <div className="min-h-screen w-screen">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          </div>
        )}

        {/* Not Logged In State */}
        {!loading && !accountAddress && (
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Immutable Marketplace</h1>
            <p className="text-lg text-gray-600 mb-8">Connect your wallet to view your dashboard</p>
            <button 
              onClick={handleLogin}
              className="bg-black text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Connect Wallet
            </button>
          </div>
        )}

        {/* Dashboard Content When Logged In */}
        {!loading && accountAddress && (
          <div className="space-y-6">
            {/* Welcome Panel */}
            <div className="bg-white shadow rounded-xl p-6">
              <h2 className="text-2xl font-semibold mb-2">
                Welcome{userProfile?.nickname ? `, ${userProfile.nickname}` : ''}!
              </h2>
              <p className="text-gray-600">
                {userProfile?.email || 'Your personal dashboard'}
              </p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-100 p-4 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-500">Wallet Balance</p>
                  <p className="text-2xl font-bold text-black">{balance} ETH</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-500">NFTs Owned</p>
                  <p className="text-2xl font-bold text-black">{userNFTs.length}</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-500">Recent Transactions</p>
                  <p className="text-2xl font-bold text-black">{transactions.length}</p>
                </div>
              </div>
            </div>

            {/* NFT Collection */}
            <div className="bg-white shadow rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Your NFT Collection</h2>
                <Link href="/marketplace" 
                      className="text-black hover:text-gray-600 text-sm font-medium bg-gray-100 px-4 py-2 rounded-full">
                  Browse Marketplace
                </Link>
              </div>
              
              {userNFTs.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <p className="text-gray-500">You don't own any NFTs yet</p>
                  <Link href="/marketplace" 
                        className="mt-4 inline-block text-white bg-black px-5 py-2 rounded-full hover:bg-gray-800">
                    Discover NFTs
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {userNFTs.map((nft) => (
                    <div key={nft.token_id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                      <div className="h-40 bg-gray-200">
                        {nft.image_url ? (
                          <img 
                            src={nft.image_url} 
                            alt={nft.name || `NFT #${nft.token_id}`} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-gray-400">No Image</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 truncate">{nft.name || `NFT #${nft.token_id}`}</h3>
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          Token ID: {nft.token_id}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Transaction History */}
            <div className="bg-white shadow rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-6">Transaction History</h2>
              
              {transactions.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <p className="text-gray-500">No transactions found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Asset
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Value
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Transaction
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((tx) => (
                        <tr key={tx.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                              ${tx.type === 'Purchase' ? 'bg-gray-800 text-white' : 
                                tx.type === 'Sale' ? 'bg-gray-200 text-black' : 
                                'bg-gray-100 text-gray-800'}`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {tx.assetName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(tx.timestamp)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {tx.value}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <a href={`https://explorer.testnet.immutable.com/tx/${tx.hash}`} 
                               className="text-black hover:text-gray-600 truncate border-b border-gray-400" 
                               target="_blank" 
                               rel="noopener noreferrer">
                              {`${tx.hash.substring(0, 6)}...${tx.hash.substring(tx.hash.length - 4)}`}
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}