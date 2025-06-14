import React, { useState } from 'react';
import axios from 'axios';

function WalletStatus({ wallets, setWallets }) {
  const [count, setCount] = useState(1);
  const [message, setMessage] = useState('');

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
        <button onClick={handleGenerateWallets}>Generate Wallets</button>
      </div>
      {wallets.length > 0 && (
        <div>
          <h3>Wallets:</h3>
          <ul>
            {wallets.map((wallet, index) => (
              <li key={index}>
                Public Key: {wallet.publicKey}, Secret Key: {JSON.stringify(wallet.secretKey)}
              </li>
            ))}
          </ul>
        </div>
      )}
      {message && <p>{message}</p>}
    </div>
  );
}

export default WalletStatus;