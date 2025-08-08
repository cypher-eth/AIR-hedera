'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useAccount, useReadContract } from 'wagmi';
import { LogOut, User, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CREDIT_ADDRESS } from '@/app/constants/contracts';
import { CREDIT_ABI_ARRAY } from '@/abis';

interface HeaderProps {
  status: string;
  onOpenTopUp?: () => void;
}

export function Header({ status, onOpenTopUp }: HeaderProps) {
  const { user, logout, authenticated } = usePrivy();
  const { address, isConnected } = useAccount();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Refetch CREDIT balance periodically
  useEffect(() => {
    if (!address || !isConnected) return;
    
    const interval = setInterval(() => {
      refetchCreditBalance();
    }, 5000); // Refetch every 5 seconds
    
    return () => clearInterval(interval);
  }, [address, isConnected, refetchCreditBalance]);

  const handleNavigation = (path: string) => {
    setIsDropdownOpen(false);
    router.push(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Status - Always visible */}
          <div className="">
            <div className="bg-black/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10">
              <p className="text-center text-sm text-white/80">
                Status: <span className="font-medium text-white">{status}</span>
              </p>
            </div>
          </div>

          {/* Credits Display with Dropdown - Only show when authenticated */}
          {authenticated && address && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 transition-colors"
              >
                <span className="text-white/90 text-sm font-medium">
                  {formatCredits(creditBalance && typeof creditBalance === 'bigint' ? creditBalance : BigInt(0))}
                </span>
                <ChevronDown className={`w-4 h-4 text-white/70 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-black/80 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl overflow-hidden">
                  <div className="p-4 space-y-3">
                    {user?.email?.address && (
                      <>
                        {/* User Email */}
                        <div className="flex items-center space-x-3 p-2 rounded-lg bg-white/5">
                          <User className="w-4 h-4 text-white/70" />
                          <span className="text-white/90 text-sm truncate">
                            {user?.email?.address}
                          </span>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-white/10"></div>
                      </>
                    )}

                    {/* Navigation options */}
                    <button 
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenTopUp?.();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-white/90 text-sm font-medium transition-colors"
                    >
                      Buy Credits
                    </button>                    
                    <button 
                      onClick={() => handleNavigation('/send')}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-white/90 text-sm font-medium transition-colors"
                    >
                      Send Tokens
                    </button>


                    {/* Divider */}
                    <div className="border-t border-white/10"></div>

                    {/* Disconnect Button */}
                    <button
                      onClick={() => {
                        logout();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 px-3 py-2 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-medium">Disconnect</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}