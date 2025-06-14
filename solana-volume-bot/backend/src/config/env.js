require('dotenv').config();
console.log('Loaded environment variables:', process.env);
module.exports = {
  QUICKNODE_RPC: process.env.QUICKNODE_RPC,
  TAX_WALLET: process.env.TAX_WALLET,
  JUPITER_API: process.env.JUPITER_API,
  PORT: process.env.PORT || 5000,
};