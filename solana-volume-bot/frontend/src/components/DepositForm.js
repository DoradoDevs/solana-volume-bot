import React, { useState } from 'react';
import axios from 'axios';

function DepositForm({ wallets, setMessage }) {
  const [depositData, setDepositData] = useState({ fromWalletSecret: '', toWalletPublicKey: '', amount: 0 });
  const [tokenAccountData, setTokenAccountData] = useState({ walletPublicKey: '', mint: '' });

  const handleDeposit = (e) => {
    e.preventDefault();
    axios.post(`${process.env.REACT_APP_API_URL}/wallets/deposit`, depositData)
      .then(response => {
        setMessage(`Deposit successful, signature: ${response.data.signature}`);
      })
      .catch(error => {
        console.error('Error depositing:', error);
        setMessage('Error depositing');
      });
  };

  const handleGetTokenAccount = (e) => {
    e.preventDefault();
    axios.post(`${process.env.REACT_APP_API_URL}/wallets/get-token-account`, tokenAccountData)
      .then(response => {
        setMessage(`Token account: ${response.data.tokenAccount}`);
      })
      .catch(error => {
        console.error('Error getting token account:', error);
        setMessage('Error getting token account');
      });
  };

  return (
    <div>
      <h2>Deposit & Token Account</h2>
      <form onSubmit={handleDeposit}>
        <input
          type="text"
          value={depositData.fromWalletSecret}
          onChange={(e) => setDepositData({ ...depositData, fromWalletSecret: e.target.value })}
          placeholder="From Wallet Secret Key"
          required
        />
        <input
          type="text"
          value={depositData.toWalletPublicKey}
          onChange={(e) => setDepositData({ ...depositData, toWalletPublicKey: e.target.value })}
          placeholder="To Wallet Public Key"
          required
        />
        <input
          type="number"
          value={depositData.amount}
          onChange={(e) => setDepositData({ ...depositData, amount: e.target.value })}
          placeholder="Amount (SOL)"
          step="0.01"
          min="0.01"
          required
        />
        <button type="submit">Deposit</button>
      </form>
      <form onSubmit={handleGetTokenAccount}>
        <input
          type="text"
          value={tokenAccountData.walletPublicKey}
          onChange={(e) => setTokenAccountData({ ...tokenAccountData, walletPublicKey: e.target.value })}
          placeholder="Wallet Public Key"
          required
        />
        <input
          type="text"
          value={tokenAccountData.mint}
          onChange={(e) => setTokenAccountData({ ...tokenAccountData, mint: e.target.value })}
          placeholder="Mint Address"
          required
        />
        <button type="submit">Get Token Account</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default DepositForm;