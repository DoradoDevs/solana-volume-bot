const express = require('express');
const router = express.Router();
const solanaService = require('../services/solanaService');
const taxService = require('../services/taxService');
console.log('Loaded solanaService and taxService in walletController');

router.post('/generate-wallets', (req, res) => {
  const { count } = req.body;
  if (!count || count <= 0) return res.status(400).json({ error: 'Count must be a positive number' });
  const wallets = solanaService.generateWallets(count);
  res.json(wallets);
});

router.post('/deposit', async (req, res) => {
  const { fromWalletSecret, toWalletPublicKey, amount } = req.body;
  if (!fromWalletSecret || !toWalletPublicKey || !amount) return res.status(400).json({ error: 'Missing required fields' });
  try {
    const signature = await solanaService.depositSol(fromWalletSecret, toWalletPublicKey, amount);
    res.json({ signature });
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
  const { userPublicKey } = req.body; // Expect this from frontend wallet connection
  if (!amounts || Object.keys(amounts).length === 0) return res.status(400).json({ error: 'Amounts object is required' });
  if (!userPublicKey) return res.status(400).json({ error: 'userPublicKey is required' });

  let distributionWallets = new Map(); // Should be persistent in production (e.g., database)
  let distributionWallet = distributionWallets.get(userPublicKey.toString());
  if (!distributionWallet) {
    distributionWallet = Keypair.generate();
    distributionWallets.set(userPublicKey.toString(), distributionWallet);
    console.log(`New distribution wallet for ${userPublicKey.toString()}:`, distributionWallet.publicKey.toString());
  } else {
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