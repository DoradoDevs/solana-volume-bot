const express = require('express');
const { createWallets, handleDeposit } = require('../controllers/walletController');
const botController = require('../controllers/botController');
const router = express.Router();

console.log('Registering routes in api.js');
router.post('/wallets', createWallets);
router.post('/deposit', handleDeposit);
router.use('/start-bot', botController);

module.exports = router;