const { getQuote, executeSwap } = require('../services/jupiterService');
const { getTokenAccount } = require('../services/solanaService');

const strategies = {
  async sequentialBuySell(wallets, inputMint, outputMint, amount) {
    for (const wallet of wallets) {
      const quoteBuy = await getQuote(inputMint, outputMint, amount * 10**9);
      await executeSwap(wallet.secretKey, quoteBuy);
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Delay to avoid rate limits
      const tokenAccount = await getTokenAccount(wallet.publicKey, outputMint);
      const quoteSell = await getQuote(outputMint, inputMint, quoteBuy.outAmount);
      await executeSwap(wallet.secretKey, quoteSell);
    }
  },
  async buyAllThenSell(wallets, inputMint, outputMint, amount) {
    for (const wallet of wallets) {
      const quoteBuy = await getQuote(inputMint, outputMint, amount * 10**9);
      await executeSwap(wallet.secretKey, quoteBuy);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
    for (const wallet of wallets) {
      const tokenAccount = await getTokenAccount(wallet.publicKey, outputMint);
      const quoteSell = await getQuote(outputMint, inputMint, amount * 10**9);
      await executeSwap(wallet.secretKey, quoteSell);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  },
  async concurrentBuySell(wallets, inputMint, outputMint, amount) {
    const batchSize = Math.floor(Math.random() * 3) + 2; // 2-4 wallets
    for (let i = 0; i < wallets.length; i += batchSize) {
      const batch = wallets.slice(i, i + batchSize);
      const promises = batch.map(async (wallet) => {
        const quoteBuy = await getQuote(inputMint, outputMint, amount * 10**9);
        await executeSwap(wallet.secretKey, quoteBuy);
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000));
        const tokenAccount = await getTokenAccount(wallet.publicKey, outputMint);
        const quoteSell = await getQuote(outputMint, inputMint, quoteBuy.outAmount);
        await executeSwap(wallet.secretKey, quoteSell);
      });
      await Promise.all(promises);
    }
  },
};

const startBot = async (req, res) => {
  const { strategy, wallets, inputMint, outputMint, amount } = req.body;
  try {
    await strategies[strategy](wallets, inputMint, outputMint, amount);
    res.json({ success: true, message: `Bot executed ${strategy} strategy` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { startBot };