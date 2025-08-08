'use client';

import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { useState } from 'react';
import { Copy, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { parseAbiItem } from 'viem';
import { CREDIT_ADDRESS } from '@/app/constants/contracts';
import { CREDIT_ABI_ARRAY } from '@/abis';

export default function SendPage() {
  const { address, isConnected } = useAccount();
  const { authenticated } = usePrivy();
  const [copied, setCopied] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [activeTab, setActiveTab] = useState<'hbar' | 'credits'>('hbar');
  const router = useRouter();

  // Fetch HBAR balance
  const { data: balance, isLoading: isLoadingBalance } = useBalance({
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

  // Transaction hooks
  const { writeContractAsync, isPending: isSending } = useWriteContract();
  const { data: receipt, isLoading: isConfirming } = useWaitForTransactionReceipt();

  const copyToClipboard = async () => {
    if (address) {
      try {
        // Try the modern clipboard API first
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(address);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } else {
          // Fallback for older browsers or non-secure contexts
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
        // Show the address in an alert as a last resort
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

  // Format CREDIT balance for display
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

  const handleClose = () => {
    router.push('/');
  };

  // Validate Ethereum address format
  const isValidAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  // Handle send transaction
  const handleSendTransaction = async () => {
    // Clear previous errors
    setValidationError('');
    setIsValidating(true);

    try {
      // Validate recipient address
      if (!recipientAddress.trim()) {
        setValidationError('Please enter a recipient address');
        return;
      }

      if (!isValidAddress(recipientAddress.trim())) {
        setValidationError('Please enter a valid Ethereum address (0x...)');
        return;
      }

      // Validate amount
      if (!amount.trim()) {
        setValidationError('Please enter an amount');
        return;
      }

      const amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        setValidationError('Please enter a valid amount greater than 0');
        return;
      }

      if (activeTab === 'hbar') {
        // Send HBAR
        // Check if user has enough balance
        if (balance && amountValue > parseFloat(balance.formatted)) {
          setValidationError('Insufficient HBAR balance');
          return;
        }

        // Convert amount to wei (assuming 18 decimals for HBAR)
        const amountInWei = BigInt(Math.floor(amountValue * 10 ** 18));

        // Send transaction
        const result = await writeContractAsync({
          address: recipientAddress.trim() as `0x${string}`,
          abi: [parseAbiItem('function receive() payable')],
          functionName: 'receive',
          value: amountInWei,
        });

        console.log('HBAR transaction sent:', result);
        alert('HBAR transaction sent successfully!');
      } else {
        // Send CREDITS
        // Check if user has enough CREDITS
        if (creditBalance && amountValue > Number(creditBalance)) {
          setValidationError('Insufficient CREDITS balance');
          return;
        }

        // Convert amount to wei (CREDITS have 18 decimals)
        const amountInWei = BigInt(Math.floor(amountValue * 10 ** 18));

        // Send CREDITS using transfer function
        const result = await writeContractAsync({
          address: CREDIT_ADDRESS,
          abi: CREDIT_ABI_ARRAY,
          functionName: 'transfer',
          args: [recipientAddress.trim() as `0x${string}`, amountInWei],
        });

        console.log('CREDITS transaction sent:', result);
        alert('CREDITS transaction sent successfully!');
        
        // Refetch CREDITS balance
        setTimeout(() => {
          refetchCreditBalance();
        }, 2000);
      }
      
      // Clear form
      setRecipientAddress('');
      setAmount('');
      
    } catch (error: any) {
      console.error('Transaction error:', error);
      let errorMessage = 'Failed to send transaction. Please try again.';
      
      if (error.message) {
        if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient balance.';
        } else if (error.message.includes('user rejected')) {
          errorMessage = 'Transaction was rejected by user.';
        } else if (error.message.includes('invalid address')) {
          errorMessage = 'Invalid recipient address.';
        } else {
          errorMessage = `Transaction failed: ${error.message}`;
        }
      }
      
      setValidationError(errorMessage);
    } finally {
      setIsValidating(false);
    }
  };

  if (!authenticated || !isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h1>
          <p className="text-white/70 mb-6">Please connect your wallet to access the Send page.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            Connect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-8 max-w-md w-full relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
          title="Close"
        >
          <X className="w-5 h-5 text-white/70" />
        </button>

        <h1 className="text-3xl font-bold text-white text-center mb-8">Send</h1>
        
        {/* Tabs */}
        <div className="flex bg-white/5 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('hbar')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'hbar'
                ? 'bg-purple-600 text-white'
                : 'text-white/70 hover:text-white'
            }`}
          >
            HBAR
          </button>
          <button
            onClick={() => setActiveTab('credits')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'credits'
                ? 'bg-purple-600 text-white'
                : 'text-white/70 hover:text-white'
            }`}
          >
            CREDITS
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Account Balance */}
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-white/70 text-sm font-medium">Account Balance</h2>
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
                  {isLoadingBalance ? 'Loading...' : formatBalance(balance)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">CREDITS:</span>
                <span className="text-blue-400 font-semibold">
                  {creditBalance ? formatCredits(creditBalance as bigint) : 'Loading...'}
                </span>
              </div>
            </div>
            {copied && (
              <div className="mt-2 text-green-400 text-sm text-center">
                Address copied to clipboard!
              </div>
            )}
          </div>

          {/* Send Form */}
          <div className="bg-white/5 rounded-xl p-4">
            <h2 className="text-white/70 text-sm font-medium mb-4">
              Send {activeTab === 'hbar' ? 'HBAR' : 'CREDITS'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">To Address</label>
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="Enter recipient address..."
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">
                  Amount ({activeTab === 'hbar' ? 'HBAR' : 'CREDITS'})
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                />
              </div>
              
              {/* Validation Error */}
              {validationError && (
                <div className="text-red-400 text-sm text-center bg-red-500/10 rounded-lg p-2">
                  {validationError}
                </div>
              )}
              
              <button 
                onClick={handleSendTransaction}
                disabled={isSending || isConfirming || isValidating}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
              >
                {isSending || isConfirming ? 'Sending...' : `Send ${activeTab === 'hbar' ? 'HBAR' : 'CREDITS'}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 