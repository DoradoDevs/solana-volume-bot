const { generateWallets, depositSol } = require('../services/solanaService');
const { applyTax } = require('../services/taxService');

const createWallets = (req, res) => {
  const { count } = req.body;
  if (count > 30 || count < 1) {
    return res.status(400).json({ error: 'Wallet count must be between 1 and 30' });
  }
  const wallets = generateWallets(count);
  res.json({ wallets });
};

const handleDeposit = async (req, res) => {
  const { fromWalletSecret, toWalletPublicKey, amount } = req.body;
  try {
    const signature = await depositSol(fromWalletSecret, toWalletPublicKey, amount);
    await applyTax(fromWalletSecret, amount);
    res.json({ success: true, signature });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { createWallets, handleDeposit };