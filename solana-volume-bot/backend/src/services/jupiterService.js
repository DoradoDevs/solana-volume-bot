const axios = require('axios');
console.log('Using QUICKNODE_RPC from process.env in jupiterService:', process.env.QUICKNODE_RPC);
console.log('Using JUPITER_API from process.env in jupiterService:', process.env.JUPITER_API);

const getQuote = async (inputMint, outputMint, amount) => {
  try {
    const response = await axios.get(`${process.env.JUPITER_API}/v6/quote`, {
      params: {
        inputMint: inputMint,
        outputMint: outputMint,
        amount: amount,
        slippage: 0.5,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching quote from Jupiter API:', error.message);
    throw error;
  }
};

const swap = async (quoteResponse, userWalletSecret) => {
  try {
    const { swapTransaction } = quoteResponse;
    const userKeypair = Keypair.fromSecretKey(new Uint8Array(userWalletSecret));
    const connection = new Connection(process.env.QUICKNODE_RPC, 'confirmed');
    const transaction = Transaction.from(Buffer.from(swapTransaction, 'base64'));
    transaction.sign(userKeypair);
    const signature = await connection.sendRawTransaction(transaction.serialize());
    await connection.confirmTransaction(signature);
    return signature;
  } catch (error) {
    console.error('Error executing swap:', error.message);
    throw error;
  }
};

module.exports = { getQuote, swap };