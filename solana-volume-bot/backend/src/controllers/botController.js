const express = require('express');
const router = express.Router();
const solanaService = require('../services/solanaService');
const taxService = require('../services/taxService');
const jupiterService = require('../services/jupiterService');
console.log('Loaded services in botController');

const strategies = {
  async sequentialBuySell(wallets, inputMint, outputMint, amount) {
    console.log(`Starting sequentialBuySell with ${wallets.length} wallets, inputMint: ${inputMint}, outputMint: ${outputMint}, amount: ${amount}`);
    for (const wallet of wallets) {
      try {
        const quoteBuy = await jupiterService.getQuote(inputMint, outputMint, amount * 10 ** 9);
        console.log(`Buy quote for wallet ${wallet.publicKey}:`, quoteBuy);
        await jupiterService.swap(quoteBuy, wallet.secretKey);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        const tokenAccount = await solanaService.getTokenAccount(wallet.publicKey, outputMint, wallet.secretKey);
        console.log(`Token account for wallet ${wallet.publicKey}:`, tokenAccount.toString());
        const quoteSell = await jupiterService.getQuote(outputMint, inputMint, quoteBuy.outAmount);
        console.log(`Sell quote for wallet ${wallet.publicKey}:`, quoteSell);
        await jupiterService.swap(quoteSell, wallet.secretKey);
      } catch (error) {
        console.error(`Error in sequentialBuySell for wallet ${wallet.publicKey}:`, error.message);
        throw error;
      }
    }
    console.log('Completed sequentialBuySell strategy');
  },

  async buyAllThenSell(wallets, inputMint, outputMint, amount) {
    console.log(`Starting buyAllThenSell with ${wallets.length} wallets, inputMint: ${inputMint}, outputMint: ${outputMint}, amount: ${amount}`);
    for (const wallet of wallets) {
      try {
        const quoteBuy = await jupiterService.getQuote(inputMint, outputMint, amount * 10 ** 9);
        console.log(`Buy quote for wallet ${wallet.publicKey}:`, quoteBuy);
        await jupiterService.swap(quoteBuy, wallet.secretKey);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } catch (error) {
        console.error(`Error in buy phase for wallet ${wallet.publicKey}:`, error.message);
        throw error;
      }
    }
    for (const wallet of wallets) {
      try {
        const tokenAccount = await solanaService.getTokenAccount(wallet.publicKey, outputMint, wallet.secretKey);
        console.log(`Token account for wallet ${wallet.publicKey}:`, tokenAccount.toString());
        const quoteSell = await jupiterService.getQuote(outputMint, inputMint, amount * 10 ** 9);
        console.log(`Sell quote for wallet ${wallet.publicKey}:`, quoteSell);
        await jupiterService.swap(quoteSell, wallet.secretKey);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } catch (error) {
        console.error(`Error in sell phase for wallet ${wallet.publicKey}:`, error.message);
        throw error;
      }
    }
    console.log('Completed buyAllThenSell strategy');
  },

  async concurrentBuySell(wallets, inputMint, outputMint, amount) {
    console.log(`Starting concurrentBuySell with ${wallets.length} wallets, inputMint: ${inputMint}, outputMint: ${outputMint}, amount: ${amount}`);
    const batchSize = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < wallets.length; i += batchSize) {
      const batch = wallets.slice(i, i + batchSize);
      const promises = batch.map(async (wallet) => {
        try {
          const quoteBuy = await jupiterService.getQuote(inputMint, outputMint, amount * 10 ** 9);
          console.log(`Buy quote for wallet ${wallet.publicKey}:`, quoteBuy);
          await jupiterService.swap(quoteBuy, wallet.secretKey);
          await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000));
          const tokenAccount = await solanaService.getTokenAccount(wallet.publicKey, outputMint, wallet.secretKey);
          console.log(`Token account for wallet ${wallet.publicKey}:`, tokenAccount.toString());
          const quoteSell = await jupiterService.getQuote(outputMint, inputMint, quoteBuy.outAmount);
          console.log(`Sell quote for wallet ${wallet.publicKey}:`, quoteSell);
          await jupiterService.swap(quoteSell, wallet.secretKey);
        } catch (error) {
          console.error(`Error in concurrentBuySell for wallet ${wallet.publicKey}:`, error.message);
          throw error;
        }
      });
      await Promise.all(promises);
    }
    console.log('Completed concurrentBuySell strategy');
  },
};

router.post('/start-bot', async (req, res) => {
  const { strategy, wallets, inputMint, outputMint, amount } = req.body;
  console.log('Received /start-bot request:', req.body);
  if (!strategy || !wallets || !inputMint || !outputMint || !amount) {
    return res.status(400).json({ success: false, error: 'Missing required fields', body: req.body });
  }
  if (!strategies[strategy]) {
    return res.status(400).json({ success: false, error: `Invalid strategy: ${strategy}`, body: req.body });
  }
  if (!Array.isArray(wallets) || wallets.length === 0) {
    return res.status(400).json({ success: false, error: 'Wallets must be a non-empty array', body: req.body });
  }
  for (const wallet of wallets) {
    if (!wallet.publicKey || !wallet.secretKey) {
      return res.status(400).json({ success: false, error: 'Each wallet must have publicKey and secretKey', body: req.body });
    }
  }
  try {
    await strategies[strategy](wallets, inputMint, outputMint, amount);
    res.json({ success: true, message: `Bot executed ${strategy} strategy` });
  } catch (error) {
    console.error('Error executing bot strategy:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;