"use client";
import { checkout } from '@imtbl/sdk';
import { checkoutSDK } from '../utils/setupDefault';
import { useState, useEffect } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { WalletInfo, WalletProviderName, GetTokenAllowListResult, TokenInfo, GetAllBalancesResult, GetBalanceResult } from '@imtbl/sdk/checkout';
import { Button, Heading, Body, Link, Table } from '@biom3/react';
import NextLink from 'next/link';

export default function ConnectWithMetamask() {
  const [provider, setProvider] = useState<Web3Provider>();
  const [walletProviderName, setWalletProviderName] = useState<WalletProviderName>();
  const [supportedWallets, setSupportedWallets] = useState<WalletInfo[]>();
  const [connectedProvider, setConnectedProvider] = useState<Web3Provider>();
  const [isValidProvider, setIsValidProvider] = useState<boolean>();
  const [isConnected, setIsConnected] = useState<boolean>();
  const [walletAddress, setWalletAddress] = useState<string>();
  const [tokenAllowList, setTokenAllowList] = useState<GetTokenAllowListResult>();
  const [selectedToken, setSelectedToken] = useState<TokenInfo>();
  const [allBalances, setAllBalances] = useState<GetAllBalancesResult>();
  const [loading, setLoadingState] = useState<boolean>(false);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo>();
  const [tokenBalance, setTokenBalance] = useState<GetBalanceResult>();
  const [nativeBalance, setNativeBalance] = useState<GetBalanceResult>();

  const handleTokenChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedAddress = event.target.value;
    const token = tokenAllowList?.tokens.find(token => token.address === selectedAddress);
    setSelectedToken(token);
  };

  const connectWithMetamask = async () => {
    setLoadingState(true);

    // Get the list of default supported providers
    const type = checkout.WalletFilterTypes.ALL;
    const allowListRes = await checkoutSDK.getWalletAllowList({ type });

    setSupportedWallets(allowListRes.wallets);

    // Create a provider given one of the default wallet provider names
    const walletProviderName = checkout.WalletProviderName.METAMASK;
    const providerRes = await checkoutSDK.createProvider({ walletProviderName });
    
    setProvider(providerRes.provider);
    setWalletProviderName(providerRes.walletProviderName);

    // Check if the provider if a Web3Provider
    const isProviderRes = await checkout.Checkout.isWeb3Provider(providerRes.provider);

    setIsValidProvider(isProviderRes);

    // Get the current network information
    // Pass through requestWalletPermissions to request the user's wallet permissions
    const connectRes = await checkoutSDK.connect({ 
      provider: providerRes.provider,
      requestWalletPermissions: true,
    });

    setConnectedProvider(connectRes.provider);

    // Check if the provider if a Web3Provider
    const isConnectedRes = await checkoutSDK.checkIsWalletConnected({
      provider: providerRes.provider
    });
    setIsConnected(isConnectedRes.isConnected);
    setWalletAddress(isConnectedRes.walletAddress);

    // #doc get-token-allow-list
    // Get the list of supported tokens
    const tokenType = await checkout.TokenFilterTypes.ALL;
    const chainId = connectRes.provider._network.chainId ?? checkout.ChainId.IMTBL_ZKEVM_TESTNET;
    const tokenAllowList = await checkoutSDK.getTokenAllowList({ type: tokenType, chainId });
    // #enddoc get-token-allow-list
    setTokenAllowList(tokenAllowList);

    setLoadingState(false);
  };

  useEffect(() => {
    const fetchBalances = async () => {
      if (connectedProvider && walletAddress) {
        // #doc get-all-balances
        // Get all token balances of the wallet
        const chainId = connectedProvider._network.chainId ?? checkout.ChainId.IMTBL_ZKEVM_TESTNET;
        const allBalancesResponse = await checkoutSDK.getAllBalances({ provider: connectedProvider, walletAddress, chainId });
        // #enddoc get-all-balances
        setAllBalances(allBalancesResponse);
      }
    };

    fetchBalances();
  }, [connectedProvider, walletAddress]);

  // Ensure connectedProvider is defined before calling getTokenInfo
  useEffect(() => {
    const fetchTokenInfo = async () => {
      if (connectedProvider) {
        // #doc get-token-info
        // Get the information of a particular token
        const tokenAddress = "0xD61ffaece032CA6E0C469820707d677Feb4BEDD5";
        const tokenInfo = await checkoutSDK.getTokenInfo({ provider: connectedProvider, tokenAddress });
        // #enddoc get-token-info
        setTokenInfo(tokenInfo);
      }
    };
    fetchTokenInfo();
  }, [connectedProvider]);
  useEffect(() => {
    const fetchTokenBalance = async () => {
      if (connectedProvider && walletAddress) {
        // #doc get-token-bal
        // Get the balance of a particular token
        const tokenAddress = '0xD61ffaece032CA6E0C469820707d677Feb4BEDD5'
        const balanceResponse = await checkoutSDK.getBalance({ provider: connectedProvider, walletAddress, tokenAddress });
        // #enddoc get-token-bal
        setTokenBalance(balanceResponse)
      }
    };
    fetchTokenBalance();
  }, [connectedProvider, walletAddress]);
  useEffect(() => {
    const fetchTokenBalance = async () => {
      if (connectedProvider && walletAddress) {
        // #doc get-native-bal
        // Get the balance of the native token
        const balanceResponse = await checkoutSDK.getBalance({ provider: connectedProvider, walletAddress });
        // #enddoc get-native-bal
        setNativeBalance(balanceResponse)
      }
    };
    fetchTokenBalance();
  }, [connectedProvider, walletAddress]);
  return (
    <>
      <Heading size="medium" className="mb-1">
        Wallet Balance with MetaMask
      </Heading>
      <Button 
        className="mb-1"
        size="medium" 
        onClick={async () => await connectWithMetamask()}
        disabled={loading}
      >
        Connect MetaMask
      </Button>
        
      <Table>
        <Table.Head>
          <Table.Row>
            <Table.Cell>Item</Table.Cell>
            <Table.Cell>Value</Table.Cell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell><b>Supported Wallets</b></Table.Cell>
            <Table.Cell>
              {!supportedWallets && ' (not fetched)'}
              {supportedWallets && (
                supportedWallets.map((wallet, index) => (
                  <span key={index}>{wallet.walletProviderName}, </span>
                ))
              )}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell><b>Is Valid Provider</b></Table.Cell>
            <Table.Cell>
              {(isValidProvider) ? `${isValidProvider}` : ' (not  validated)'}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell><b>Connected to Network</b></Table.Cell>
            <Table.Cell>
              {(connectedProvider) ? `chainId ${connectedProvider._network.chainId}` : ' (not connected)'}
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell><b>Supported Token Details</b></Table.Cell>
            <Table.Cell>
              <select id="tokenDropdown" defaultValue="" onChange={handleTokenChange}>
                <option value="" disabled>Select a token</option>
                {tokenAllowList?.tokens.map((token, index) => (
                  <option key={index} value={token.address}>
                    {token.name} (Symbol: {token.symbol}, Decimals: {token.decimals})
                  </option>
                ))}
              </select>
            </Table.Cell>
          </Table.Row>
          {selectedToken && (
            <Table.Row>
              <Table.Cell colSpan={2}>
                <div>
                  <h4>Token Details</h4>
                  <p><strong>Name:</strong> {selectedToken.name}</p>
                  <p><strong>Symbol:</strong> {selectedToken.symbol}</p>
                  <p><strong>Decimals:</strong> {selectedToken.decimals}</p>
                  <p><strong>Address:</strong> {selectedToken.address}</p>
                  {selectedToken.icon && <img src={selectedToken.icon} alt={`${selectedToken.name} icon`} />}
                </div>
              </Table.Cell>
            </Table.Row>
          )}
          <Table.Row>
            <Table.Cell colSpan={2}>
              <div>
                <h4>ERC20 Token Details</h4>
                <p><strong>Name:</strong> {tokenInfo?.name || 'N/A'}</p>
                <p><strong>Symbol:</strong> {tokenInfo?.symbol || 'N/A'}</p>
                <p><strong>Decimals:</strong> {tokenInfo?.decimals || 'N/A'}</p>
                <p><strong>Address:</strong> {tokenInfo?.address || 'N/A'}</p>
                {tokenInfo?.icon && <img src={tokenInfo.icon} alt={`${tokenInfo.name} icon`} />}
              </div>
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
      
      <h4>All Balances</h4>
      {allBalances && allBalances.balances.length > 0 ? (
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.Cell>Token</Table.Cell>
              <Table.Cell>Balance (Hex)</Table.Cell>
              <Table.Cell>Formatted Balance</Table.Cell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {allBalances.balances.map((balanceResult, index) => (
              <Table.Row key={index}>
                <Table.Cell>
                  {balanceResult.token.name} ({balanceResult.token.symbol})
                </Table.Cell>
                <Table.Cell>
                  {balanceResult.balance._hex || 'N/A'}
                </Table.Cell>
                <Table.Cell>
                  {balanceResult.formattedBalance || 'N/A'}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      ) : (
        <p>No balances available - please connect your wallet.</p>
      )}

      <h4>Specific Token Balance</h4>
      {tokenBalance ? (
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.Cell>Token</Table.Cell>
              <Table.Cell>Balance (Hex)</Table.Cell>
              <Table.Cell>Formatted Balance</Table.Cell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Table.Row>
              <Table.Cell>
                {tokenBalance.token.name || 'N/A'}
              </Table.Cell>
              <Table.Cell>
                {tokenBalance.balance._hex || 'N/A'}
              </Table.Cell>
              <Table.Cell>
                {tokenBalance.formattedBalance || 'N/A'}
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      ) : (
        <p>No balances available - please connect your wallet.</p>
      )}

      <h4>Native Token Balance</h4>
      {nativeBalance ? (
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.Cell>Token</Table.Cell>
              <Table.Cell>Balance (Hex)</Table.Cell>
              <Table.Cell>Formatted Balance</Table.Cell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Table.Row>
              <Table.Cell>
                {nativeBalance.token.name || 'N/A'}
              </Table.Cell>
              <Table.Cell>
                {nativeBalance.balance._hex || 'N/A'}
              </Table.Cell>
              <Table.Cell>
                {nativeBalance.formattedBalance || 'N/A'}
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      ) : (
        <p>No balances available - please connect your wallet.</p>
      )}
      
      <Link rc={<NextLink href="/" />}>Return to Examples</Link>
    </>
  );
}