import React, { useState } from 'react';

function StrategySelector() {
  const [strategy, setStrategy] = useState('sequentialBuySell');
  const [wallets, setWallets] = useState([]);
  const [amount, setAmount] = useState('');
  const [walletCount, setWalletCount] = useState(1);

  const createWallets = async () => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/wallets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count: walletCount }),
    });
    const result = await response.json();
    setWallets(result.wallets);
  };

  const startBot = async () => {
    const inputMint = document.querySelector('input[placeholder="Input Mint (SOL)"]').value;
    const outputMint = document.querySelector('input[placeholder="Output Mint (Token)"]').value;
    const response = await fetch(`${process.env.REACT_APP_API_URL}/bot/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ strategy, wallets, inputMint, outputMint, amount: parseFloat(amount) }),
    });
    const result = await response.json();
    alert(result.success ? result.message : `Error: ${result.error}`);
  };

  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold">Select Strategy</h2>
      <select value={strategy} onChange={(e) => setStrategy(e.target.value)} className="w-full p-2 border rounded mb-2">
        <option value="sequentialBuySell">Sequential Buy/Sell</option>
        <option value="buyAllThenSell">Buy All Then Sell</option>
        <option value="concurrentBuySell">Concurrent Buy/Sell</option>
      </select>
      <input
        type="number"
        placeholder="Number of Wallets (1-30)"
        value={walletCount}
        onChange={(e) => setWalletCount(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      <button onClick={createWallets} className="bg-green-500 text-white p-2 rounded mb-2">Create Wallets</button>
      <input
        type="number"
        placeholder="Amount per Swap (SOL)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />
      <button onClick={startBot} className="bg-blue-500 text-white p-2 rounded">Start Bot</button>
    </div>
  );
}

export default StrategySelector;