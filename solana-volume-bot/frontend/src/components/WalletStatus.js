import React, { useState } from 'react';
import axios from 'axios';

function WalletStatus({ wallets, setWallets, setMessage }) {
  const [count, setCount] = useState(1);
  const [equalAmount, setEqualAmount] = useState(0.01);
  const [customAmounts, setCustomAmounts] = useState({});

  const handleGenerateWallets = () => {
    axios.post(`${process.env.REACT_APP_API_URL}/wallets/generate-wallets`, { count })
      .then(response => {
        setWallets(prev => [...prev, ...response.data]);
        setMessage(`Generated ${count} wallet(s)`);
      })
      .catch(error => {
        console.error('Error generating wallets:', error);
        setMessage('Error generating wallets');
      });
  };

  const handleEqualDistribution = (e) => {
    e.preventDefault();
    if (!wallets.length || !equalAmount) {
      setMessage('Please generate wallets and enter an amount');
      return;
    }
    const amountPerWallet = equalAmount / wallets.length;
    const distributionData = {
      amounts: wallets.reduce((acc, wallet) => ({ ...acc, [wallet.publicKey]: amountPerWallet }), {}),
    };
    axios.post(`${process.env.REACT_APP_API_URL}/wallets/distribute`, distributionData)
      .then(response => {
        setMessage(`Distributed ${equalAmount} SOL equally`);
      })
      .catch(error => {
        console.error('Error distributing SOL:', error);
        setMessage('Error distributing SOL');
      });
  };

  const handleCustomDistribution = (e) => {
    e.preventDefault();
    if (!wallets.length || Object.values(customAmounts).some(a => a === undefined || a <= 0)) {
      setMessage('Please enter valid amounts for all wallets');
      return;
    }
    const distributionData = { amounts: customAmounts };
    axios.post(`${process.env.REACT_APP_API_URL}/wallets/distribute`, distributionData)
      .then(response => {
        setMessage('Distributed SOL with custom amounts');
      })
      .catch(error => {
        console.error('Error distributing SOL:', error);
        setMessage('Error distributing SOL');
      });
  };

  const updateCustomAmount = (publicKey, value) => {
    setCustomAmounts(prev => ({ ...prev, [publicKey]: parseFloat(value) || 0 }));
  };

  return (
    <div>
      <h2>Wallet Status</h2>
      <div>
        <input
          type="number"
          value={count}
          onChange={(e) => setCount(e.target.value)}
          placeholder="Number of wallets"
          min="1"
        />
        <button onClick={handleGenerateWallets}>Create Wallets</button>
      </div>
      {wallets.length > 0 && (
        <div>
          <h3>Wallets:</h3>
          <ul>
            {wallets.map((wallet, index) => (
              <li key={index}>
                Public Key: {wallet.publicKey}
              </li>
            ))}
          </ul>
          <h3>Distribute SOL</h3>
          <form onSubmit={handleEqualDistribution}>
            <input
              type="number"
              value={equalAmount}
              onChange={(e) => setEqualAmount(e.target.value)}
              placeholder="Total SOL to distribute"
              step="0.01"
              min="0.01"
              required
            />
            <button type="submit">Distribute to All Equally</button>
          </form>
          <h4>Custom Distribution</h4>
          {wallets.map((wallet, index) => (
            <div key={index}>
              <label>{wallet.publicKey}</label>
              <input
                type="number"
                value={customAmounts[wallet.publicKey] || ''}
                onChange={(e) => updateCustomAmount(wallet.publicKey, e.target.value)}
                placeholder="SOL Amount"
                step="0.01"
                min="0.01"
              />
            </div>
          ))}
          <button onSubmit={handleCustomDistribution}>Distribute</button>
        </div>
      )}
      {message && <p>{message}</p>}
    </div>
  );
}

export default WalletStatus;