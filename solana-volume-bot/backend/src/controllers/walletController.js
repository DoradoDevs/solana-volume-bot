const express = require('express');
const router = express.Router();
const solanaService = require('../services/solanaService');
const taxService = require('../services/taxService');
const { MongoClient, ObjectId } = require('mongodb');
const crypto = require('crypto');

console.log('Loaded solanaService and taxService in walletController');

// MongoDB Configuration
const uri = 'mongodb://localhost:27017'; // Update with your MongoDB URI (e.g., MongoDB Atlas connection string)
const dbName = 'solana_volume_bot';
const client = new MongoClient(uri);
let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db(dbName);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}
connectDB();

const encryptKey = crypto.randomBytes(32); // Use a secure key in production (e.g., from environment variables)
const iv = crypto.randomBytes(16);

function encrypt(text) {
  const cipher = crypto.createCipheriv('aes-256-cbc', encryptKey, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decrypt(encrypted) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', encryptKey, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

router.post('/generate-wallets', (req, res) => {
  const { count } = req.body;
  if (!count || count <= 0) return res.status(400).json({ error: 'Count must be a positive number' });
  const wallets = solanaService.generateWallets(count);
  res.json(wallets);
});

router.post('/deposit', async (req, res) => {
  const { fromPublicKey, toPublicKey, amount, signature } = req.body;
  if (!fromPublicKey || !toPublicKey || !amount || !signature) return res.status(400).json({ error: 'Missing required fields' });
  try {
    const connection = new Connection(process.env.QUICKNODE_RPC, 'confirmed');
    const confirmed = await connection.getSignatureStatus(signature);
    if (!confirmed) throw new Error('Transaction not confirmed');

    console.log(`Deposit of ${amount} SOL from ${fromPublicKey} to ${toPublicKey}, signature: ${signature}`);
    res.json({ success: true, message: 'Deposit recorded', signature });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/get-token-account', async (req, res) => {
  const { walletPublicKey, mint } = req.body;
  if (!walletPublicKey || !mint) return res.status(400).json({ error: 'Missing required fields' });
  try {
    const tokenAccount = await solanaService.getTokenAccount(walletPublicKey, mint);
    res.json({ tokenAccount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/distribute', async (req, res) => {
  const { amounts } = req.body;
  const { userPublicKey } = req.body;
  if (!amounts || Object.keys(amounts).length === 0) return res.status(400).json({ error: 'Amounts object is required' });
  if (!userPublicKey) return res.status(400).json({ error: 'userPublicKey is required' });

  if (!db) return res.status(500).json({ error: 'Database not connected' });

  const walletsCollection = db.collection('distributionWallets');
  let distributionWalletData = await walletsCollection.findOne({ userPublicKey: userPublicKey.toString() });
  let distributionWallet;

  if (!distributionWalletData) {
    distributionWallet = Keypair.generate();
    const encryptedSecretKey = encrypt(JSON.stringify(Array.from(distributionWallet.secretKey)));
    await walletsCollection.insertOne({ userPublicKey: userPublicKey.toString(), secretKey: encryptedSecretKey });
    console.log(`New distribution wallet for ${userPublicKey.toString()}:`, distributionWallet.publicKey.toString());
  } else {
    const decryptedSecretKey = JSON.parse(decrypt(distributionWalletData.secretKey));
    distributionWallet = Keypair.fromSecretKey(new Uint8Array(decryptedSecretKey));
    console.log(`Reusing distribution wallet for ${userPublicKey.toString()}:`, distributionWallet.publicKey.toString());
  }

  try {
    const signature = await solanaService.distributeSol(distributionWallet.secretKey, amounts);
    res.json({ signature, distributionWallet: distributionWallet.publicKey.toString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;