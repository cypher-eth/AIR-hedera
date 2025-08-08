// Verify contract deployment
const { createPublicClient, http, parseAbiItem } = require('viem');

const client = createPublicClient({
  chain: {
    id: 296,
    name: 'HederaTestnet',
    network: 'hedera-testnet',
    nativeCurrency: { name: 'USD', symbol: 'USD', decimals: 18 },
    rpcUrls: {
      default: { http: ['https://testnet.hashio.io/api'] },
      public: { http: ['https://testnet.hashio.io/api'] },
    },
  },
  transport: http(),
});

const contracts = [
  {
    name: 'GMNFT',
    address: '0x4303C39de92F6175644181748139e02AA1c639c3',
    functions: [
      { name: 'maxSupply', abi: [parseAbiItem('function maxSupply() view returns (uint256)')] },
      { name: 'canMint', abi: [parseAbiItem('function canMint(address user) view returns (bool)')] },
    ]
  },
  {
    name: 'CREDIT',
    address: '0x17C66658639B82f7F2a2f6A04eCF252f0e4ca873',
    functions: [
      { name: 'balanceOf', abi: [parseAbiItem('function balanceOf(address owner) view returns (uint256)')] },
      { name: 'name', abi: [parseAbiItem('function name() view returns (string)')] },
    ]
  }
];

async function verifyContracts() {
  console.log('🔍 Verifying contract deployments...\n');
  
  for (const contract of contracts) {
    console.log(`📋 Testing ${contract.name} contract at ${contract.address}`);
    
    try {
      // Check bytecode
      const bytecode = await client.getBytecode({ address: contract.address });
      console.log(`   Bytecode length: ${bytecode?.length || 0} bytes`);
      
      if (!bytecode || bytecode.length === 0) {
        console.log(`   ❌ ${contract.name} has no bytecode - not deployed or wrong address`);
        continue;
      }
      
      console.log(`   ✅ ${contract.name} has bytecode - testing functions...`);
      
      // Test functions
      for (const func of contract.functions) {
        try {
          const result = await client.readContract({
            address: contract.address,
            abi: func.abi,
            functionName: func.name,
            args: func.name === 'canMint' || func.name === 'balanceOf' ? ['0x1F4dD17E1af5EB5512Db387ef7F967204c6aDDaa'] : undefined,
          });
          console.log(`   ✅ ${func.name}: ${result.toString()}`);
        } catch (error) {
          console.log(`   ❌ ${func.name} failed: ${error.message.split('\n')[0]}`);
        }
      }
      
    } catch (error) {
      console.log(`   ❌ Failed to check ${contract.name}: ${error.message}`);
    }
    
    console.log('');
  }
  
  console.log('🎯 Verification complete!');
}

verifyContracts(); 