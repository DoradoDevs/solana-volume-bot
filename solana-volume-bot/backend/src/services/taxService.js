const { Connection, Keypair, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const env = require('../config/env');

const connection = new Connection(env.QUICKNODE_RPC, 'confirmed');

const applyTax = async (fromWalletSecret, amount) => {
  const taxAmount = amount * 0.0001; // 0.01% tax
  const fromKeypair = Keypair.fromSecretKey(new Uint8Array(fromWalletSecret));
  
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: fromKeypair.publicKey,
      toPubkey: new PublicKey(env.TAX_WALLET),
      lamports: taxAmount * LAMPORTS_PER_SOL,
    })
  );
  
  const signature = await connection.sendTransaction(transaction, [fromKeypair]);
  await connection.confirmTransaction(signature);
  return taxAmount;
};

module.exports = { applyTax };