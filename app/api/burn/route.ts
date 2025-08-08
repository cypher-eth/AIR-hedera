// /app/api/burn/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, createWalletClient, http, parseUnits, isHex, stringToHex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

// If you're on a well-known chain, import it (e.g. import { mainnet, sepolia } from 'viem/chains')
// Otherwise just pass chainId in the request or via env.
export const runtime = 'nodejs'; // ensures Node (Edge can't sign with PK)
export const dynamic = 'force-dynamic';

// Hardcoded values from the repository
const RPC_URL = 'https://testnet.hashio.io/api';
const OPERATOR_PRIVATE_KEY = process.env.PRIVATE_KEY || '0x1234567890123456789012345678901234567890123456789012345678901234'; // Get from env or fallback to test key
const CREDIT_ADDRESS = '0x37805D217B7FFd09099d51711C246E2624EB6a9f' as `0x${string}`;
const CHAIN_ID = 296; // Hedera Testnet

const CREDIT_ABI = [
  // Minimal ABI fragment for operatorBurn(address, uint256)
  {
    type: 'function',
    name: 'operatorBurn',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [],
  },
] as const;

export async function POST(req: NextRequest) {
  try {
    // Parse body
    const body = await req.json().catch(() => ({}));
    // You can pass: { burnAmount: "1.23", user: "0x..." }  OR  { burnAmountWei: "1230000000000000000", user: "0x..." }
    // Prefer strings to avoid float imprecision.
    const { burnAmount, burnAmountWei, user } = body || {};

    if (
      (burnAmount == null && burnAmountWei == null) ||
      (burnAmountWei != null && typeof burnAmountWei !== 'string') ||
      (burnAmount != null && typeof burnAmount !== 'string') ||
      !user ||
      typeof user !== 'string'
    ) {
      return NextResponse.json(
        { success: false, error: 'Provide burnAmount (as string, e.g. "1.5"), burnAmountWei (as string), and user (as address string).' },
        { status: 400 }
      );
    }

    // Validate user address
    if (!user.startsWith('0x') || user.length !== 42) {
      return NextResponse.json({ success: false, error: 'Invalid user address format' }, { status: 400 });
    }

    // Convert to BigInt (wei) - always use 18 decimals
    let amountWei: bigint;
    if (burnAmountWei != null) {
      if (!/^\d+$/.test(burnAmountWei)) {
        return NextResponse.json({ success: false, error: 'burnAmountWei must be a numeric string' }, { status: 400 });
      }
      amountWei = BigInt(burnAmountWei);
    } else {
      amountWei = parseUnits(burnAmount as string, 18);
    }

    // Build clients
    const transport = http(RPC_URL, { retryCount: 3, timeout: 20_000 });
    const account = privateKeyToAccount(
      OPERATOR_PRIVATE_KEY.startsWith('0x') ? (OPERATOR_PRIVATE_KEY as `0x${string}`) : (`0x${OPERATOR_PRIVATE_KEY}` as `0x${string}`)
    );

    const publicClient = createPublicClient({
      transport,
      chain: { 
        id: CHAIN_ID, 
        name: 'hedera-testnet', 
        nativeCurrency: { name: 'USD', symbol: 'USD', decimals: 18 }, 
        rpcUrls: { default: { http: [RPC_URL] } } 
      },
    });

    const walletClient = createWalletClient({
      account,
      transport,
      chain: publicClient.chain, // aligns chain config
    });

    // Optional: idempotency via client-provided key
    const idemKey = req.headers.get('x-idempotency-key');
    if (idemKey && !isHex(idemKey)) {
      // Not strictly required, but you can enforce hex to avoid weird chars
      return NextResponse.json({ success: false, error: 'x-idempotency-key must be hex if provided' }, { status: 400 });
    }

    // Prepare and send tx
    const hash = await walletClient.writeContract({
      address: CREDIT_ADDRESS,
      abi: CREDIT_ABI,
      functionName: 'operatorBurn',
      args: [user as `0x${string}`, amountWei],
      // gas, gasPrice, nonce can be supplied if you want; otherwise node will estimate
      // If you want to tag idempotency, many RPCs ignore it; consider offchain store.
    });

    // Wait for 1 confirmation (tweak confirmations as needed)
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    const success = receipt.status === 'success';

    return NextResponse.json({
      success,
      txHash: hash,
      blockNumber: receipt.blockNumber.toString(),
      gasUsed: receipt.gasUsed?.toString?.(),
      user: user,
      amountWei: amountWei.toString(),
    });
  } catch (err: any) {
    // Try to surface common revert or RPC errors
    const msg =
      err?.shortMessage ||
      err?.message ||
      (typeof err === 'string' ? err : 'Unknown error');

    // Some providers include a nested "data" with reason
    const reason = err?.cause?.reason || err?.cause?.message || err?.data?.message;

    return NextResponse.json(
      {
        success: false,
        error: msg,
        reason: reason,
      },
      { status: 500 }
    );
  }
}