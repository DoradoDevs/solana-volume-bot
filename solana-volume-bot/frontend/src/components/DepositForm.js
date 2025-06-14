import React, { useState } from 'react';
import axios from 'axios';

function DepositForm({ userPublicKey, setMessage }) {
  const [amount, setAmount] = useState(0.01);
  const distributionWallet = 'DISTRIBUTION_WALLET_PUBLIC_KEY_HERE'; // Replace with backend-controlled address

  const handleDeposit = (e) => {
    e.preventDefault();
    if (!userPublicKey) {
      setMessage('Please connect your wallet first');
      return;
    }

    // This is a manual deposit instruction; backend will handle distribution
    setMessage(`Please send ${amount} SOL to ${distributionWallet} from your connected wallet`);
    // Note: Actual transaction would require wallet adapter to sign and send
  };

  return (
    <div>
      <h2>Deposit SOL</h2>
      <form onSubmit={handleDeposit}>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount (SOL)"
          step="0.01"
          min="0.01"
          required
        />
        <button type="submit">Deposit to Distribution Wallet</button>
      </form>
      <p>Distribution Wallet: {distributionWallet}</p>
      {message && <p>{message}</p>}
    </div>
  );
}

export default DepositForm;