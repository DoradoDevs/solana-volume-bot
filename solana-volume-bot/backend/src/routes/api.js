const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const botController = require('../controllers/botController');

console.log('walletController:', walletController);
console.log('botController:', botController);

router.use('/wallets', walletController);
router.use('/bot', botController);

module.exports = router;