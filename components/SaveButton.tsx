import React, { useState } from 'react';
import { Droplets } from 'lucide-react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseAbiItem } from 'viem';
import { CREDIT_ADDRESS, WATER_ADDRESS } from '@/app/constants/contracts';

export function SaveButton() {
  const { address, isConnected } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error' | 'info'>('info');

  // Read CREDIT balance
  const { data: creditBalance, refetch: refetchCreditBalance } = useReadContract({
    address: CREDIT_ADDRESS,
    abi: [parseAbiItem('function balanceOf(address owner) view returns (uint256)')],
    functionName: 'balanceOf',
    args: [address!],
    query: {
      enabled: !!address && isConnected && CREDIT_ADDRESS !== '0x0000000000000000000000000000000000000000',
    },
  });

  // Read WATER contract allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CREDIT_ADDRESS,
    abi: [parseAbiItem('function allowance(address owner, address spender) view returns (uint256)')],
    functionName: 'allowance',
    args: [address!, WATER_ADDRESS],
    query: {
      enabled: !!address && isConnected && CREDIT_ADDRESS !== '0x0000000000000000000000000000000000000000',
    },
  });

  // Write contract for approvals and burns
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

    if (!creditBalance || creditBalance === 0n) {
      showNotification('You need CREDIT tokens to use the water feature', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      const burnAmount = 1n; // Burn 1 CREDIT token
      const currentAllowance = allowance || 0n;

      // Check if we need to approve
      if (currentAllowance < burnAmount) {
        showNotification('Approving CREDIT tokens for water...', 'info');
        
        // Approve WATER contract to spend CREDIT tokens
        await writeContractAsync({
          address: CREDIT_ADDRESS,
          abi: [parseAbiItem('function approve(address spender, uint256 amount) returns (bool)')],
          functionName: 'approve',
          args: [WATER_ADDRESS, burnAmount],
        });

        showNotification('Approval successful! Burning CREDIT tokens...', 'info');
      }

      // Burn CREDIT tokens
      await writeContractAsync({
        address: WATER_ADDRESS,
        abi: [parseAbiItem('function burnCredits(uint256 amount)')],
        functionName: 'burnCredits',
        args: [burnAmount],
      });

      showNotification('💧 Water used! 1 CREDIT token burned', 'success');
      
      // Refetch balances
      setTimeout(() => {
        refetchCreditBalance();
        refetchAllowance();
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