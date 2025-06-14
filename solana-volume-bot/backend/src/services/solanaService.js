const { Connection, Keypair, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { getAssociatedTokenAddressSync, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID } = require('@solana/spl-token');

// Force reload of env module to avoid caching issues
delete require.cache[require.resolve('../config/env')];
const { env } = require('../config/env');
console.log('Imported env in solanaService:', env);

const connection = new Connection(env.QUICKNODE_RPC, 'confirmed');

const generateWallets = (count) => {
  const wallets = [];
  for (let i = 0; i < count; i++) {
    const keypair = Keypair.generate();
    wallets.push({
      publicKey: keypair.publicKey.toString(),
      secretKey: Array.from(keypair.secretKey),
    });
  }
  return wallets;
};

const depositSol = async (fromWalletSecret, toWalletPublicKey, amount) => {
  const fromKeypair = Keypair.fromSecretKey(new Uint8Array(fromWalletSecret));
  const toPublicKey = new PublicKey(toWalletPublicKey);
  const taxAmount = amount * 0.0001; // 0.01% tax
  const netAmount = amount - taxAmount;

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: fromKeypair.publicKey,
      toPubkey: toPublicKey,
      lamports: netAmount * LAMPORTS_PER_SOL,
    }),
    SystemProgram.transfer({
      fromPubkey: fromKeypair.publicKey,
      toPubkey: new PublicKey(env.TAX_WALLET),
      lamports: taxAmount * LAMPORTS_PER_SOL,
    })
  );

  const signature = await connection.sendTransaction(transaction, [fromKeypair]);
  await connection.confirmTransaction(signature);
  return signature;
};

const getTokenAccount = async (walletPublicKey, mint) => {
  const tokenAccount = getAssociatedTokenAddressSync(new PublicKey(mint), new PublicKey(walletPublicKey));
  try {
    await connection.getTokenAccountBalance(tokenAccount);
    return tokenAccount;
  } catch (error) {
    const transaction = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        new PublicKey(walletPublicKey),
        tokenAccount,
        new PublicKey(walletPublicKey),
        new PublicKey(mint)
      )
    );
    const signature = await connection.sendTransaction(transaction, [Keypair.fromSecretKey(new Uint8Array(walletSecret))]);
    await connection.confirmTransaction(signature);
    return tokenAccount;
  }
};

module.exports = { generateWallets, depositSol, getTokenAccount };