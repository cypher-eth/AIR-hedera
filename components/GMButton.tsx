'use client';

import React, { useEffect, useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { parseAbiItem } from 'viem';
import { GMNFT_ADDRESS, CREDIT_ADDRESS } from '@/app/constants/contracts';
import { usePrivy } from '@privy-io/react-auth';

// Define the complete ABI for better contract interaction
const GMNFT_ABI = [
  parseAbiItem('function canMint(address user) view returns (bool)'),
  parseAbiItem('function mint()'),
  parseAbiItem('function getCurrentTokenId() view returns (uint256)'),
  parseAbiItem('function getLastMintTime(address user) view returns (uint256)'),
  parseAbiItem('function getTimeUntilNextMint(address user) view returns (uint256)'),
];

const CREDIT_ABI = [
  parseAbiItem('function balanceOf(address owner) view returns (uint256)'),
  parseAbiItem('function mint(address to, uint256 amount)'),
];

export function GMButton() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { login, authenticated } = usePrivy();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error' | 'info'>('info');
  const [hasShownSuccess, setHasShownSuccess] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [contractExists, setContractExists] = useState<boolean | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [isContractLoading, setIsContractLoading] = useState(true);
  const [contractLoadTimeout, setContractLoadTimeout] = useState<NodeJS.Timeout | null>(null);

  // Check if contract exists by trying to read its code
  const { data: contractCode, error: contractError, isLoading: isContractCodeLoading } = useReadContract({
    address: GMNFT_ADDRESS,
    abi: GMNFT_ABI,
    functionName: 'getCurrentTokenId',
    query: {
      enabled: !!address && isConnected,
      retry: 1, // Reduce retries to fail faster
      retryDelay: 1000,
    },
  });

  // Fallback: Try a simpler contract check
  const { data: fallbackContractCheck, error: fallbackError } = useReadContract({
    address: GMNFT_ADDRESS,
    abi: [parseAbiItem('function maxSupply() view returns (uint256)')],
    functionName: 'maxSupply',
    query: {
      enabled: !!address && isConnected && contractExists === false,
      retry: 1,
      retryDelay: 1000,
    },
  });

  const { data: canMint, isLoading: isLoadingCanMint, refetch, error: canMintError } = useReadContract({
    address: GMNFT_ADDRESS,
    abi: GMNFT_ABI,
    functionName: 'canMint',
    args: [address!],
    query: {
      enabled: !!address && isConnected && (contractExists !== false || fallbackContractCheck !== undefined),
      retry: 1,
      retryDelay: 1000,
    },
  });

  // Read CREDIT token balance
  const { data: creditBalance, refetch: refetchCreditBalance } = useReadContract({
    address: CREDIT_ADDRESS,
    abi: CREDIT_ABI,
    functionName: 'balanceOf',
    args: [address!],
    query: {
      enabled: !!address && isConnected,
      retry: 1,
      retryDelay: 1000,
    },
  });

  const { writeContractAsync, isPending: isMinting, data: tx, error: writeError } = useWriteContract();
  const { data: receipt, isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: tx });

  const showNotificationMessage = (message: string, type: 'success' | 'error' | 'info') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  // Set a timeout to prevent infinite loading
  useEffect(() => {
    if (isContractLoading) {
      const timeout = setTimeout(() => {
        console.log('Contract loading timeout - marking as failed');
        setIsContractLoading(false);
        setContractExists(false);
      }, 10000); // 10 second timeout
      
      setContractLoadTimeout(timeout);
      
      return () => {
        if (timeout) clearTimeout(timeout);
      };
    }
  }, [isContractLoading]);

  // Clear timeout when contract loads successfully
  useEffect(() => {
    if (contractLoadTimeout && (contractCode !== undefined || contractError)) {
      clearTimeout(contractLoadTimeout);
      setContractLoadTimeout(null);
    }
  }, [contractCode, contractError, contractLoadTimeout]);

  const handleGMClick = async () => {
    console.log('GM Button clicked');
    console.log('Debug info:', {
      isConnected,
      address,
      chainId,
      contractExists,
      contractCode,
      contractError,
      canMint,
      isLoadingCanMint,
      canMintError,
      writeError
    });

    // Check if user is authenticated, if not prompt for login
    if (!authenticated) {
      showNotificationMessage('Please connect your wallet to mint GM NFTs', 'info');
      login();
      return;
    }

    if (!isConnected || !address) {
      showNotificationMessage('Please connect your wallet first', 'error');
      return;
    }

    // Check if we're on the correct network (HederaTestnet, chainId 296)
    if (chainId !== 296) {
      showNotificationMessage(`Wrong network! Please switch to HederaTestnet (Chain ID: 296). Current: ${chainId}`, 'error');
      return;
    }

    if (contractExists === false) {
      showNotificationMessage('Contract not found on this network. The contracts may still be deploying. Please try again in a few minutes.', 'error');
      return;
    }

    if (isLoadingCanMint) {
      showNotificationMessage('Checking mint status...', 'info');
      return;
    }

    if (canMintError) {
      console.error('CanMint error:', canMintError);
      showNotificationMessage(`Contract error: ${canMintError.message}. The contracts may still be deploying.`, 'error');
      return;
    }

    if (!canMint) {
      showNotificationMessage('You already GMed today! Come back tomorrow.', 'info');
      return;
    }

    try {
      console.log('Attempting to mint GM NFT...');
      const result = await writeContractAsync({
        address: GMNFT_ADDRESS,
        abi: GMNFT_ABI,
        functionName: 'mint',
      });
      console.log('Mint transaction sent:', result);
      showNotificationMessage('Transaction sent! Waiting for confirmation...', 'info');
    } catch (error: any) {
      console.error('Mint error:', error);
      let errorMessage = 'Failed to mint GM NFT. Please try again.';
      
      if (error.message) {
        if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient funds for transaction. Please add more tokens to your wallet.';
        } else if (error.message.includes('user rejected')) {
          errorMessage = 'Transaction was rejected by user.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('contract')) {
          errorMessage = 'Contract interaction failed. The contracts may still be deploying. Please try again in a few minutes.';
        } else {
          errorMessage = `Transaction failed: ${error.message}`;
        }
      }
      
      showNotificationMessage(errorMessage, 'error');
    }
  };

  // Update contract existence status
  useEffect(() => {
    if (contractError && fallbackError) {
      console.error('Contract error:', contractError);
      console.error('Fallback error:', fallbackError);
      setContractExists(false);
      setIsContractLoading(false);
    } else if (contractCode !== undefined || fallbackContractCheck !== undefined) {
      console.log('Contract detected via:', contractCode !== undefined ? 'primary' : 'fallback');
      setContractExists(true);
      setIsContractLoading(false);
    } else if (!isContractCodeLoading && !isContractLoading) {
      // If not loading anymore and no result, mark as failed
      setContractExists(false);
      setIsContractLoading(false);
    }
  }, [contractCode, contractError, fallbackContractCheck, fallbackError, isContractCodeLoading, isContractLoading]);

  // Update debug info
  useEffect(() => {
    const debug = `Chain: ${chainId}, Connected: ${isConnected}, Contract: ${contractExists}, CanMint: ${canMint}, Loading: ${isLoadingCanMint}`;
    setDebugInfo(debug);
    console.log('GM Button debug:', debug);
  }, [chainId, isConnected, contractExists, canMint, isLoadingCanMint]);

  useEffect(() => {
    if (!address || !isConnected || !canMint) return;
    const interval = setInterval(() => {
      refetch();
    }, 3000);
    return () => clearInterval(interval);
  }, [address, refetch, isConnected, canMint]);

  useEffect(() => {
    if (receipt && !isConfirming && !hasShownSuccess) {
      showNotificationMessage('🎉 GM NFT minted successfully! +10 CREDIT tokens earned!', 'success');
      setHasShownSuccess(true);
      // Refetch canMint status and credit balance after successful mint
      setTimeout(() => {
        refetch();
        refetchCreditBalance();
      }, 2000);
    }
  }, [receipt, isConfirming, hasShownSuccess, refetch, refetchCreditBalance]);

  useEffect(() => {
    setHasShownSuccess(false);
  }, [tx]);

  // Show errors in notifications
  useEffect(() => {
    if (writeError) {
      console.error('Write contract error:', writeError);
      showNotificationMessage(`Transaction error: ${writeError.message}`, 'error');
    }
  }, [writeError]);

  // Reset loading state when connection changes
  useEffect(() => {
    if (!isConnected) {
      setIsContractLoading(false);
      setContractExists(null);
    } else {
      setIsContractLoading(true);
    }
  }, [isConnected]);

  return (
    <>
      <div className="fixed bottom-6 left-6 z-30 flex items-end">
        <button
          onClick={handleGMClick}
          onContextMenu={(e) => {
            e.preventDefault();
            setShowDebug(!showDebug);
          }}
          disabled={isMinting || isConfirming || isLoadingCanMint || contractExists === false || isContractLoading}
          className="focus:outline-none cursor-pointer flex items-center justify-center transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'transparent',
            border: 'none',
            boxShadow: 'none',
            padding: 0,
            position: 'relative',
          }}
          title={`${debugInfo}${isMinting ? ' | Minting...' : ''}${isConfirming ? ' | Confirming...' : ''}${contractExists === false ? ' | Contract not found' : ''}${isContractLoading ? ' | Loading contracts...' : ''} (Right-click for debug)`}
        >
          <img
            src="/morning.png"
            alt="GM"
            width={56}
            height={56}
            className="block"
            style={{ display: 'block', opacity: isMinting || isConfirming || contractExists === false || isContractLoading ? 0.6 : 1 }}
          />
          {(isMinting || isConfirming) && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full" />
            </span>
          )}
          {contractExists === false && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="text-red-500 text-xs">!</span>
            </span>
          )}
          {isContractLoading && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="text-blue-500 text-xs">⏳</span>
            </span>
          )}
        </button>
      </div>

      {/* Debug Panel */}
      {showDebug && (
        <div className="fixed bottom-20 left-6 z-40 bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-white/20 text-xs text-white/80 max-w-sm">
          <div className="space-y-1">
            <div><strong>Chain ID:</strong> {chainId}</div>
            <div><strong>Connected:</strong> {isConnected ? 'Yes' : 'No'}</div>
            <div><strong>Address:</strong> {address?.slice(0, 6)}...{address?.slice(-4)}</div>
            <div><strong>Contract Exists:</strong> {contractExists === null ? 'Checking...' : contractExists ? 'Yes' : 'No'}</div>
            <div><strong>Contract Loading:</strong> {isContractLoading ? 'Yes' : 'No'}</div>
            <div><strong>Contract Code Loading:</strong> {isContractCodeLoading ? 'Yes' : 'No'}</div>
            <div><strong>Can Mint:</strong> {canMint === null ? 'Unknown' : canMint ? 'Yes' : 'No'}</div>
            <div><strong>Loading:</strong> {isLoadingCanMint ? 'Yes' : 'No'}</div>
            <div><strong>Contract Address:</strong> {GMNFT_ADDRESS}</div>
            <div><strong>CREDIT Balance:</strong> {creditBalance ? `${creditBalance.toString()} CREDIT` : 'Loading...'}</div>
            <div><strong>CREDIT Address:</strong> {CREDIT_ADDRESS}</div>
            {contractError && (
              <div className="text-red-400"><strong>Contract Error:</strong> {contractError.message}</div>
            )}
            {canMintError && (
              <div className="text-red-400"><strong>CanMint Error:</strong> {canMintError.message}</div>
            )}
          </div>
          <div className="mt-2 space-x-2">
            <button
              onClick={() => {
                setIsContractLoading(true);
                setContractExists(null);
                refetch();
                refetchCreditBalance();
              }}
              className="text-blue-400 hover:text-blue-300"
            >
              Refresh
            </button>
            <button
              onClick={() => {
                setIsContractLoading(false);
                setContractExists(false);
              }}
              className="text-yellow-400 hover:text-yellow-300"
            >
              Force Stop Loading
            </button>
            <button
              onClick={async () => {
                try {
                  // Manual contract verification
                  const response = await fetch('https://testnet.hashio.io/api', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      jsonrpc: '2.0',
                      method: 'eth_getCode',
                      params: [GMNFT_ADDRESS, 'latest'],
                      id: 1
                    })
                  });
                  const data = await response.json();
                  console.log('Manual contract check:', data);
                  if (data.result && data.result !== '0x') {
                    setContractExists(true);
                    setIsContractLoading(false);
                  }
                } catch (error) {
                  console.error('Manual verification failed:', error);
                }
              }}
              className="text-green-400 hover:text-green-300"
            >
              Verify Contract
            </button>
            <button
              onClick={() => setShowDebug(false)}
              className="text-gray-400 hover:text-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showNotification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className={
            `px-6 py-4 rounded-lg shadow-lg backdrop-blur-sm border ` +
            (notificationType === 'success'
              ? 'bg-green-500/20 border-green-500/30 text-green-300'
              : notificationType === 'error'
                ? 'bg-red-500/20 border-red-500/30 text-red-300'
                : 'bg-blue-500/20 border-blue-500/30 text-blue-300')
          }>
            <p className="text-center font-medium">{notificationMessage}</p>
          </div>
        </div>
      )}
    </>
  );
}