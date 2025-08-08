// Test the formatCredits function logic
function formatCredits(credits) {
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
}

// Test cases
console.log('Test 1: 0 CREDITS');
console.log(formatCredits(BigInt(0)));

console.log('\nTest 2: 4 CREDITS (4 * 10^18 wei)');
console.log(formatCredits(BigInt(4) * BigInt(10 ** 18)));

console.log('\nTest 3: 0.00000000040000001 CREDITS (4 * 10^10 wei)');
console.log(formatCredits(BigInt(4) * BigInt(10 ** 10)));

console.log('\nTest 4: 10 CREDITS (10 * 10^18 wei)');
console.log(formatCredits(BigInt(10) * BigInt(10 ** 18)));

console.log('\nTest 5: 1 wei');
console.log(formatCredits(BigInt(1)));

