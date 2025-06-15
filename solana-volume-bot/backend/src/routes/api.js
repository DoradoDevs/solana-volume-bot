const express = require('express');
const walletController = require('../controllers/walletController');
const botController = require('../controllers/botController');
const router = express.Router();

console.log('Imported walletController:', walletController);
console.log('Imported botController:', botController);
console.log('Registering routes in api.js');

router.use('/wallets', walletController);
router.use('/bot', botController);

module.exports = router;