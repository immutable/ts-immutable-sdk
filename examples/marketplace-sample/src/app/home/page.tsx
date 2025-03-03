'use client';
import { useEffect, useState, useMemo } from 'react';
import { BrowserProvider } from 'ethers';
import { passportInstance } from '../utils/setupDefault';
import { orderbookSDK } from '../utils/setupOrderbook';
import Link from 'next/link';
import { Provider } from '@imtbl/sdk/passport';
import { Orderbook } from '@imtbl/orderbook';
import { blockchainData } from '@imtbl/sdk';

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
        
        // Check if user is already authenticated
        const isAuthenticated = await passportInstance.isAuthenticated();
        
        if (isAuthenticated) {
          // Get user profile
          const profile = await passportInstance.getUserInfo();
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
      const blockchainData = orderbookSDK.blockchainData;
      
      // Fetch NFTs owned by the user
      const response = await blockchainData.listNFTsByAccountAddress({
        accountAddress: address,
        chainName: blockchainData.ChainName.IMTBL_ZKEVM_TESTNET
      });
      
      if (response && response.result) {
        setUserNFTs(response.result);
      }
    } catch (error) {
      console.error("Failed to fetch NFTs:", error);
      setUserNFTs([]);
    }
  };

  // Fetch transaction history using Immutable's SDK
  const fetchTransactionHistory = async (address: string) => {
    try {
      // Get the blockchain data provider from orderbook SDK
      const blockchainData = orderbookSDK.blockchainData;
      
      // Fetch transaction history for the user
      const response = await blockchainData.listTransactionsByAccountAddress({
        accountAddress: address,
        chainName: blockchainData.ChainName.IMTBL_ZKEVM_TESTNET,
        limit: 20
      });
      
      if (response && response.result) {
        // Transform transaction data into a more usable format
        const formattedTransactions = response.result.map(tx => {
          // Determine transaction type based on data
          let type = 'Transaction';
          if (tx.transfers && tx.transfers.length > 0) {
            if (tx.transfers[0].from.toLowerCase() === address.toLowerCase()) {
              type = 'Sale';
            } else if (tx.transfers[0].to.toLowerCase() === address.toLowerCase()) {
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
            id: tx.transaction_hash,
            hash: tx.transaction_hash,
            type,
            assetName,
            value,
            timestamp: tx.timestamp * 1000, // Convert to milliseconds
          };
        });
        
        setTransactions(formattedTransactions);
      }
    } catch (error) {
      console.error("Failed to fetch transaction history:", error);
      setTransactions([]);
    }
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