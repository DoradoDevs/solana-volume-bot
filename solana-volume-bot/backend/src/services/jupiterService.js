const fetch = require('cross-fetch');
const { Connection, Keypair, VersionedTransaction } = require('@solana/web3.js');
const env = require('../config/env');

const getQuote = async (inputMint, outputMint, amount) => {
  const response = await fetch(`${env.JUPITER_API}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=50`);
  return response.json();
};

const executeSwap = async (walletSecret, quoteResponse) => {
  const keypair = Keypair.fromSecretKey(new Uint8Array(walletSecret));
  const response = await fetch(`${env.JUPITER_API}/swap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userPublicKey: keypair.publicKey.toString(),
      quoteResponse,
      prioritizationFeeLamports: { jitoTipLamports: 1000000 },
    }),
  });
  const { swapTransaction } = await response.json();
  const transaction = VersionedTransaction.deserialize(Buffer.from(swapTransaction, 'base64'));
  
  // Calculate 0.01% tax on input amount
  const inputAmount = quoteResponse.inAmount / 10**9;
  const taxAmount = inputAmount * 0.0001 * 10**9;
  const taxInstruction = SystemProgram.transfer({
    fromPubkey: keypair.publicKey,
    toPubkey: new PublicKey(env.TAX_WALLET),
    lamports: taxAmount,
  });
  transaction.message.instructions.push(taxInstruction);
  
  transaction.sign([keypair]);
  const signature = await new Connection(env.QUICKNODE_RPC).sendTransaction(transaction);
  return signature;
};

module.exports = { getQuote, executeSwap };