'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { X, Copy, Check } from 'lucide-react';
import { CREDIT_ADDRESS, WATER_ADDRESS } from '@/app/constants/contracts';
import { CREDIT_ABI_ARRAY, WATER_ABI_ARRAY } from '@/abis';

interface BuyCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BuyCreditsModal({ isOpen, onClose }: BuyCreditsModalProps) {
  const { address, isConnected } = useAccount();
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error' | 'info'>('info');

  // Fetch HBAR balance
  const { data: hbarBalance, isLoading: isLoadingHbarBalance } = useBalance({
    address: address,
  });

  // Read CREDIT balance
  const { data: creditBalance, refetch: refetchCreditBalance } = useReadContract({
    address: CREDIT_ADDRESS,
    abi: CREDIT_ABI_ARRAY,
    functionName: 'balanceOf',
    args: [address!],
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Read WATER contract info
  const { data: waterContractInfo, error: waterContractError } = useReadContract({
    address: WATER_ADDRESS,
    abi: WATER_ABI_ARRAY,
    functionName: 'getContractInfo',
    query: {
      enabled: !!address && isConnected,
    },
  });

  // Transaction hooks
  const { writeContractAsync, isPending: isSwapping } = useWriteContract();
  const { data: receipt, isLoading: isConfirming } = useWaitForTransactionReceipt();

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setTimeout(() => setNotificationMessage(''), 5000);
  };

  const copyToClipboard = async () => {
    if (address) {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(address);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } else {
          const textArea = document.createElement('textarea');
          textArea.value = address;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          
          try {
            document.execCommand('copy');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch (err) {
            console.error('Fallback copy failed:', err);
            alert('Failed to copy address. Please copy manually: ' + address);
          } finally {
            document.body.removeChild(textArea);
          }
        }
      } catch (err) {
        console.error('Failed to copy address:', err);
        alert('Failed to copy address. Please copy manually: ' + address);
      }
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: any) => {
    if (!balance) return '0.0 HBAR';
    return `${parseFloat(balance.formatted).toFixed(2)} ${balance.symbol}`;
  };

  const formatCredits = (credits: bigint) => {
    if (!credits) return '0 CREDITS';
    
    // CREDIT token uses 18 decimals (standard ERC20)
    const decimals = 18;
    const divisor = BigInt(10 ** decimals);
    
    const wholePart = credits / divisor;
    const fractionalPart = credits % divisor;
    
    // If there's no fractional part, just show the whole number
    if (fractionalPart === BigInt(0)) {
      return `${wholePart.toString()} CREDITS`;
    }
    
    // Format fractional part with proper padding
    const fractionalString = fractionalPart.toString().padStart(decimals, '0');
    
    // Remove trailing zeros
    const trimmedFractional = fractionalString.replace(/0+$/, '');
    
    if (trimmedFractional === '') {
      return `${wholePart.toString()} CREDITS`;
    } else {
      return `${wholePart.toString()}.${trimmedFractional} CREDITS`;
    }
  };



  const handleMaxClick = () => {
    if (hbarBalance) {
      const maxAmount = parseFloat(hbarBalance.formatted);
      setAmount(maxAmount.toString());
    }
  };

  const calculateCreditsOutput = () => {
    if (!amount) return '0 CREDITS';
    
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) return '0 CREDITS';
    
    // Get conversion rate from contract or use default
    let conversionRate = 100; // Default rate
    
    if (waterContractInfo && Array.isArray(waterContractInfo) && waterContractInfo[1]) {
      const contractRate = Number(waterContractInfo[1] as bigint);
      // If the contract rate is in wei format, convert it
      conversionRate = contractRate > 10**10 ? contractRate / 10**18 : contractRate;
    }
    
    // Calculate CREDITS using the conversion rate
    const creditAmount = amountValue * conversionRate;
    
    // Divide by 10^10 as requested and round to 6 decimals
    const adjustedCredits = creditAmount / Math.pow(10, 10);
    const roundedCredits = Math.round(adjustedCredits * 1000000) / 1000000;
    
    // Format the output
    if (roundedCredits === Math.floor(roundedCredits)) {
      // If it's a whole number, show without decimals
      return `${Math.floor(roundedCredits)} CREDITS`;
    } else {
      // If it has decimals, show with up to 6 decimal places
      return `${roundedCredits.toFixed(6).replace(/0+$/, '').replace(/\.$/, '')} CREDITS`;
    }
  };

  const handleSwap = async () => {
    setValidationError('');
    setIsValidating(true);

    try {
      if (!amount.trim()) {
        setValidationError('Please enter an amount');
        return;
      }

      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        setValidationError('Please enter a valid amount greater than 0');
        return;
      }

      if (hbarBalance && amountValue > parseFloat(hbarBalance.formatted)) {
        setValidationError('Insufficient HBAR balance');
        return;
      }

      // Convert amount to wei (18 decimals)
      const amountInWei = BigInt(Math.floor(amountValue * 10 ** 18));

      showNotification('Swapping HBAR for CREDITS...', 'info');

      // Call purchaseTokens function
      await writeContractAsync({
        address: WATER_ADDRESS,
        abi: WATER_ABI_ARRAY,
        functionName: 'purchaseTokens',
        value: amountInWei,
      });

      showNotification('✅ CREDITS purchased successfully!', 'success');
      
      // Clear form and refetch balances
      setAmount('');
      setTimeout(() => {
        refetchCreditBalance();
      }, 2000);

    } catch (error: any) {
      console.error('Swap error:', error);
      let errorMessage = 'Failed to swap HBAR for CREDITS. Please try again.';
      
      if (error.message) {
        if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient HBAR balance.';
        } else if (error.message.includes('user rejected')) {
          errorMessage = 'Transaction was rejected by user.';
        } else if (error.message.includes('Cannot read properties of undefined')) {
          errorMessage = 'Contract connection error. Please try again.';
        } else {
          errorMessage = `Swap failed: ${error.message}`;
        }
      }
      
      setValidationError(errorMessage);
    } finally {
      setIsValidating(false);
    }
  };

  // Debug logging in useEffect to avoid initialization issues
  useEffect(() => {
    if (isOpen) {
      console.log('Water contract info:', waterContractInfo);
      console.log('Water contract error:', waterContractError);
      console.log('CREDIT balance (raw):', creditBalance);
      console.log('CREDIT balance (formatted):', formatCredits(creditBalance && typeof creditBalance === 'bigint' ? creditBalance : BigInt(0)));
      console.log('User address:', address);
    }
  }, [isOpen, waterContractInfo, waterContractError, creditBalance, address]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-8 max-w-md w-full relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
          title="Close"
        >
          <X className="w-5 h-5 text-white/70" />
        </button>

        <h1 className="text-3xl font-bold text-white text-center mb-8">Buy CREDITS</h1>
        
        <div className="space-y-6">
          {/* Account Info */}
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-white/70 text-sm font-medium">Your Balances</h2>
              <div className="flex items-center gap-2">
                <span className="text-white font-mono text-sm">
                  {address ? truncateAddress(address) : 'Loading...'}
                </span>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  title="Copy address to clipboard"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-white/70" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-white/70">HBAR:</span>
                <span className="text-green-400 font-semibold">
                  {isLoadingHbarBalance ? 'Loading...' : formatBalance(hbarBalance)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">CREDITS:</span>
                <span className="text-blue-400 font-semibold">
                  {formatCredits(creditBalance && typeof creditBalance === 'bigint' ? creditBalance : BigInt(0))}
                </span>
              </div>
            </div>
            {copied && (
              <div className="mt-2 text-green-400 text-sm text-center">
                Address copied to clipboard!
              </div>
            )}
          </div>

          {/* Swap Form */}
          <div className="bg-white/5 rounded-xl p-4">
            <h2 className="text-white/70 text-sm font-medium mb-4">Swap HBAR for CREDITS</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">Amount (HBAR)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.0"
                    step="0.01"
                    min="0"
                    className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={handleMaxClick}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    MAX
                  </button>
                </div>
              </div>
              
              {/* Output Preview */}
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/70 text-sm">You'll receive:</span>
                  <span className="text-blue-400 font-semibold">
                    {calculateCreditsOutput()}
                  </span>
                </div>
                <div className="text-white/50 text-xs mt-1">
                  Rate: 1 HBAR = 100 CREDITS
                </div>
              </div>
              
              {/* Validation Error */}
              {validationError && (
                <div className="text-red-400 text-sm text-center bg-red-500/10 rounded-lg p-2">
                  {validationError}
                </div>
              )}
              
              <button 
                onClick={handleSwap}
                disabled={isSwapping || isConfirming || isValidating}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
              >
                {isSwapping || isConfirming ? 'Swapping...' : 'Swap HBAR for CREDITS'}
              </button>
            </div>
          </div>
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
      </div>
    </div>
  );
}
