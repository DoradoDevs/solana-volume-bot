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
        const quoteBuy = await jupiterService.getQuote(inputMint, outputMint, amount * 10 ** 9); // Convert to lamports
        console.log(`Buy quote for wallet ${wallet.publicKey}:`, quoteBuy);
        await jupiterService.swap(quoteBuy, wallet.secretKey);
        await new Promise((resolve) => setTimeout(resolve, 5000)); // 5-second delay
        const tokenAccount = await solanaService.getTokenAccount(wallet.publicKey, outputMint);
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
    // Buy phase
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
    // Sell phase
    for (const wallet of wallets) {
      try {
        const tokenAccount = await solanaService.getTokenAccount(wallet.publicKey, outputMint);
        console.log(`Token account for wallet ${wallet.publicKey}:`, tokenAccount.toString());
        const quoteSell = await jupiterService.getQuote(outputMint, inputMint, amount * 10 ** 9); // Using original amount for sell
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
    const batchSize = Math.floor(Math.random() * 3) + 2; // 2-4 wallets per batch
    for (let i = 0; i < wallets.length; i += batchSize) {
      const batch = wallets.slice(i, i + batchSize);
      const promises = batch.map(async (wallet) => {
        try {
          const quoteBuy = await jupiterService.getQuote(inputMint, outputMint, amount * 10 ** 9);
          console.log(`Buy quote for wallet ${wallet.publicKey}:`, quoteBuy);
          await jupiterService.swap(quoteBuy, wallet.secretKey);
          await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000)); // Random delay up to 2s
          const tokenAccount = await solanaService.getTokenAccount(wallet.publicKey, outputMint);
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
  if (!strategy || !wallets || !inputMint || !outputMint || !amount) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  try {
    await strategies[strategy](wallets, inputMint, outputMint, amount);
    res.json({ success: true, message: `Bot executed ${strategy} strategy` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;