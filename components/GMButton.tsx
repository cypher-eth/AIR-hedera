'use client';

import React, { useEffect, useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { parseAbiItem } from 'viem';
import { GMNFT_ADDRESS } from '@/app/constants/contracts';

export function GMButton() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error' | 'info'>('info');
  const [hasShownSuccess, setHasShownSuccess] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [contractExists, setContractExists] = useState<boolean | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  // Check if contract exists by trying to read its code
  const { data: contractCode, error: contractError } = useReadContract({
    address: GMNFT_ADDRESS,
    abi: [parseAbiItem('function name() view returns (string)')],
    functionName: 'name',
    query: {
      enabled: !!address && isConnected,
    },
  });

  const { data: canMint, isLoading: isLoadingCanMint, refetch, error: canMintError } = useReadContract({
    address: GMNFT_ADDRESS,
    abi: [parseAbiItem('function canMint(address user) view returns (bool)')],
    functionName: 'canMint',
    args: [address!],
    query: {
      enabled: !!address && isConnected && contractExists !== false,
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
      showNotificationMessage('Contract not found on this network. Please check the contract address.', 'error');
      return;
    }

    if (isLoadingCanMint) {
      showNotificationMessage('Checking mint status...', 'info');
      return;
    }

    if (canMintError) {
      console.error('CanMint error:', canMintError);
      showNotificationMessage(`Contract error: ${canMintError.message}`, 'error');
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
        abi: [parseAbiItem('function mint()')],
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
          errorMessage = 'Contract interaction failed. Please check if the contract exists on this network.';
        } else {
          errorMessage = `Transaction failed: ${error.message}`;
        }
      }
      
      showNotificationMessage(errorMessage, 'error');
    }
  };

  // Update contract existence status
  useEffect(() => {
    if (contractError) {
      console.error('Contract error:', contractError);
      setContractExists(false);
    } else if (contractCode !== undefined) {
      setContractExists(true);
    }
  }, [contractCode, contractError]);

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
      showNotificationMessage('🎉 GM NFT minted successfully!', 'success');
      setHasShownSuccess(true);
      // Refetch canMint status after successful mint
      setTimeout(() => refetch(), 2000);
    }
  }, [receipt, isConfirming, hasShownSuccess, refetch]);

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

  if (!isConnected) return null;

  return (
    <>
      <div className="fixed bottom-6 left-6 z-30 flex items-end">
        <button
          onClick={handleGMClick}
          onContextMenu={(e) => {
            e.preventDefault();
            setShowDebug(!showDebug);
          }}
          disabled={isMinting || isConfirming || isLoadingCanMint || contractExists === false}
          className="focus:outline-none cursor-pointer flex items-center justify-center transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'transparent',
            border: 'none',
            boxShadow: 'none',
            padding: 0,
            position: 'relative',
          }}
          title={`${debugInfo}${isMinting ? ' | Minting...' : ''}${isConfirming ? ' | Confirming...' : ''}${contractExists === false ? ' | Contract not found' : ''} (Right-click for debug)`}
        >
          <img
            src="/morning.png"
            alt="GM"
            width={56}
            height={56}
            className="block"
            style={{ display: 'block', opacity: isMinting || isConfirming || contractExists === false ? 0.6 : 1 }}
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
            <div><strong>Can Mint:</strong> {canMint === null ? 'Unknown' : canMint ? 'Yes' : 'No'}</div>
            <div><strong>Loading:</strong> {isLoadingCanMint ? 'Yes' : 'No'}</div>
            <div><strong>Contract Address:</strong> {GMNFT_ADDRESS}</div>
            {contractError && (
              <div className="text-red-400"><strong>Contract Error:</strong> {contractError.message}</div>
            )}
            {canMintError && (
              <div className="text-red-400"><strong>CanMint Error:</strong> {canMintError.message}</div>
            )}
          </div>
          <button
            onClick={() => setShowDebug(false)}
            className="mt-2 text-blue-400 hover:text-blue-300"
          >
            Close
          </button>
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