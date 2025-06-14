import React, { useState } from 'react';
import axios from 'axios';

function StrategySelector({ wallets, setMessage, inputMint, outputMint }) {
  const [amount, setAmount] = useState(0.01);
  const [strategy, setStrategy] = useState('sequentialBuySell');

  const handleStartBot = (e) => {
    e.preventDefault();
    if (!wallets.length || !inputMint || !outputMint || !amount) {
      setMessage('Please fill all fields and generate wallets');
      return;
    }

    const botData = {
      strategy,
      wallets,
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
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount per Swap (SOL)"
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