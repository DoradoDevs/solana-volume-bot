const express = require('express');
const { createWallets, handleDeposit } = require('../controllers/walletController');
const { startBot } = require('../controllers/botController');
const router = express.Router();

router.post('/wallets', createWallets);
router.post('/deposit', handleDeposit);
router.post('/bot/start', startBot);

module.exports = router;