import React, { useState } from 'react';

function DepositForm() {
  const [walletSecret, setWalletSecret] = useState('');
  const [toWallet, setToWallet] = useState('');
  const [amount, setAmount] = useState('');

  const handleDeposit = async (e) => {
    e.preventDefault();
    const response = await fetch(`${process.env.REACT_APP_API_URL}/deposit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromWalletSecret: JSON.parse(walletSecret), toWalletPublicKey: toWallet, amount: parseFloat(amount) }),
    });
    const result = await response.json();
    alert(result.success ? `Deposit successful: ${result.signature}` : `Error: ${result.error}`);
  };

  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold">Deposit SOL</h2>
      <form onSubmit={handleDeposit} className="space-y-4">
        <input
          type="text"
          placeholder="From Wallet Secret Key (JSON array)"
          value={walletSecret}
          onChange={(e) => setWalletSecret(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="To Wallet Public Key"
          value={toWallet}
          onChange={(e) => setToWallet(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Amount (SOL)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">Deposit</button>
      </form>
    </div>
  );
}

export default DepositForm;