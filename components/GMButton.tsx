'use client';

import React, { useEffect, useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { GMNFT_ADDRESS } from '@/app/constants/contracts';
import { usePrivy } from '@privy-io/react-auth';
import { GMNFT_ABI } from '@/abis';

export function GMButton() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { login, authenticated } = usePrivy();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error' | 'info'>('info');
  const [hasShownSuccess, setHasShownSuccess] = useState(false);

  const { data: canMint, isLoading: isLoadingCanMint, refetch, error: canMintError } = useReadContract({
    address: GMNFT_ADDRESS,
    abi: GMNFT_ABI,
    functionName: 'canMint',
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

  const handleGMClick = async () => {
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

    if (isLoadingCanMint) {
      showNotificationMessage('Checking mint status...', 'info');
      return;
    }

    if (canMintError) {
      showNotificationMessage(`Contract error: ${canMintError.message}. The contracts may still be deploying.`, 'error');
      return;
    }

    if (!canMint) {
      showNotificationMessage('You already GMed today! Come back tomorrow.', 'info');
      return;
    }

    try {
      const result = await writeContractAsync({
        address: GMNFT_ADDRESS,
        abi: GMNFT_ABI,
        functionName: 'mint',
      });
      showNotificationMessage('Transaction sent! Waiting for confirmation...', 'info');
    } catch (error: any) {
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
      // Refetch canMint status after successful mint
      setTimeout(() => {
        refetch();
      }, 2000);
    }
  }, [receipt, isConfirming, hasShownSuccess, refetch]);

  useEffect(() => {
    setHasShownSuccess(false);
  }, [tx]);

  // Show errors in notifications
  useEffect(() => {
    if (writeError) {
      showNotificationMessage(`Transaction error: ${writeError.message}`, 'error');
    }
  }, [writeError]);

  return (
    <>
      <div className="fixed bottom-6 left-6 z-30 flex items-end">
        <button
          onClick={handleGMClick}
          disabled={isMinting || isConfirming || isLoadingCanMint}
          className="focus:outline-none cursor-pointer flex items-center justify-center transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'transparent',
            border: 'none',
            boxShadow: 'none',
            padding: 0,
            position: 'relative',
          }}
        >
          <img
            src="/morning.png"
            alt="GM"
            width={56}
            height={56}
            className="block"
            style={{ display: 'block', opacity: isMinting || isConfirming ? 0.6 : 1 }}
          />
          {(isMinting || isConfirming) && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full" />
            </span>
          )}
        </button>
      </div>

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