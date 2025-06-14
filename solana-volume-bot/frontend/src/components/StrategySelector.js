import React, { useState } from 'react';
import axios from 'axios';

function StrategySelector({ wallets, setMessage }) {
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [inputMint, setInputMint] = useState('');
  const [outputMint, setOutputMint] = useState('So11111111111111111111111111111111111111112'); // Default to SOL
  const [amount, setAmount] = useState(0.01);
  const [strategy, setStrategy] = useState('sequentialBuySell');

  const handleStartBot = (e) => {
    e.preventDefault();
    if (!selectedWallet || !inputMint || !outputMint || !amount) {
      setMessage('Please fill all fields');
      return;
    }

    const botData = {
      strategy,
      wallets: [{ publicKey: selectedWallet.publicKey, secretKey: selectedWallet.secretKey }],
      inputMint,
      outputMint,
      amount,
    };

    axios.post(`${process.env.REACT_APP_API_URL}/bot/start-bot`, botData)
      .then(response => {
        setMessage(`Bot started: ${response.data.message}`);
      })
      .catch(error => {
        console.error('Error starting bot:', error);
        setMessage('Error starting bot');
      });
  };

  return (
    <div>
      <h2>Bot Strategy</h2>
      <form onSubmit={handleStartBot}>
        <select onChange={(e) => setSelectedWallet(JSON.parse(e.target.value))} value={selectedWallet ? JSON.stringify(selectedWallet) : ''}>
          <option value="" disabled>Select a wallet</option>
          {wallets.map((wallet, index) => (
            <option key={index} value={JSON.stringify(wallet)}>
              {wallet.publicKey}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={inputMint}
          onChange={(e) => setInputMint(e.target.value)}
          placeholder="Input Mint Address"
          required
        />
        <input
          type="text"
          value={outputMint}
          onChange={(e) => setOutputMint(e.target.value)}
          placeholder="Output Mint Address (e.g., SOL)"
          required
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount (SOL)"
          step="0.01"
          min="0.01"
          required
        />
        <select value={strategy} onChange={(e) => setStrategy(e.target.value)}>
          <option value="sequentialBuySell">Sequential Buy/Sell</option>
          <option value="buyAllThenSell">Buy All Then Sell</option>
          <option value="concurrentBuySell">Concurrent Buy/Sell</option>
        </select>
        <button type="submit">Start Bot</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default StrategySelector;