import React, { useState } from 'react';
import { Droplets } from 'lucide-react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CREDIT_ADDRESS } from '@/app/constants/contracts';
import { CREDIT_ABI } from '@/abis';

export function SaveButton() {
  const { address, isConnected } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error' | 'info'>('info');

  // Read CREDIT balance
  const { data: creditBalance, refetch: refetchCreditBalance } = useReadContract({
    address: CREDIT_ADDRESS,
    abi: CREDIT_ABI,
    functionName: 'balanceOf',
    args: [address!],
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Write contract for burns
  const { writeContractAsync, isPending } = useWriteContract();
  const { data: receipt, isLoading: isConfirming } = useWaitForTransactionReceipt();

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setTimeout(() => setNotificationMessage(''), 5000);
  };

  const handleWaterClick = async () => {
    if (!isConnected || !address) {
      showNotification('Please connect your wallet first', 'error');
      return;
    }

    if (!creditBalance || creditBalance === BigInt(0)) {
      showNotification('You need CREDIT tokens to use the water feature', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      const burnAmount = BigInt(1); // Burn 1 CREDIT token

      showNotification('Burning CREDIT tokens for water...', 'info');

      // Burn CREDIT tokens directly using the CREDIT contract
      await writeContractAsync({
        address: CREDIT_ADDRESS,
        abi: CREDIT_ABI,
        functionName: 'burnCredits',
        args: [burnAmount],
      });

      showNotification('💧 Water used! 1 CREDIT token burned', 'success');
      
      // Refetch balances
      setTimeout(() => {
        refetchCreditBalance();
      }, 2000);

    } catch (error: any) {
      console.error('Water burn error:', error);
      showNotification(
        error.message?.includes('insufficient') 
          ? 'Insufficient CREDIT balance' 
          : 'Failed to burn CREDIT tokens. Please try again.',
        'error'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const isDisabled = isProcessing || isPending || isConfirming;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-30 flex items-end">
        <button
          onClick={handleWaterClick}
          disabled={isDisabled}
          className={`focus:outline-none cursor-pointer flex items-center justify-center transition-all duration-200 hover:scale-105 rounded-full p-3 border border-white/20 ${
            isDisabled 
              ? 'bg-gray-600/20 cursor-not-allowed scale-100' 
              : 'bg-white/10 hover:bg-white/20'
          }`}
          title={`Water ${creditBalance ? `(${creditBalance.toString()} CREDIT available)` : ''}`}
        >
          <Droplets className={`w-8 h-8 ${isDisabled ? 'text-gray-400' : 'text-blue-400'}`} />
        </button>
      </div>

      {/* Notification */}
      {notificationMessage && (
        <div className={`fixed top-20 right-6 z-50 p-4 rounded-lg shadow-lg border ${
          notificationType === 'success' 
            ? 'bg-green-500/20 border-green-500/30 text-green-400' 
            : notificationType === 'error'
            ? 'bg-red-500/20 border-red-500/30 text-red-400'
            : 'bg-blue-500/20 border-blue-500/30 text-blue-400'
        }`}>
          {notificationMessage}
        </div>
      )}
    </>
  );
} 