import React, { useState } from 'react';
import { Droplets } from 'lucide-react';
import { useAccount, useReadContract } from 'wagmi';
import { CREDIT_ADDRESS } from '@/app/constants/contracts';
import { CREDIT_ABI_ARRAY } from '@/abis';
import { BuyCreditsModal } from './BuyCreditsModal';

export function SaveButton() {
  const { address, isConnected } = useAccount();
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleWaterClick = () => {
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Refetch credit balance when modal closes
    setTimeout(() => {
      refetchCreditBalance();
    }, 1000);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-30 flex items-end">
        <button
          onClick={handleWaterClick}
          className="focus:outline-none cursor-pointer flex items-center justify-center transition-all duration-200 hover:scale-105 rounded-full p-3 border border-white/20 bg-white/10 hover:bg-white/20"
          title={`Buy CREDITS ${creditBalance ? `(${creditBalance.toString()} CREDITS available)` : ''}`}
        >
          <Droplets className="w-8 h-8 text-blue-400" />
        </button>
      </div>

      {/* Buy Credits Modal */}
      <BuyCreditsModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
      />
    </>
  );
} 