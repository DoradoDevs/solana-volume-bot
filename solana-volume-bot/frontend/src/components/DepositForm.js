import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import axios from 'axios';

function DepositForm({ userPublicKey, setMessage }) {
  const [amount, setAmount] = useState(0.01);
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [distributionWallet, setDistributionWallet] = useState('');

  useEffect(() => {
    if (userPublicKey) {
      axios.get(`${process.env.REACT_APP_API_URL}/wallets/get-distribution-wallet?userPublicKey=${userPublicKey.toString()}`)
        .then(response => setDistributionWallet(response.data.distributionWallet))
        .catch(error => {
          console.error('Error fetching distribution wallet:', error);
          setMessage('Error fetching distribution wallet');
        });
    }
  }, [userPublicKey]);

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!publicKey) {
      setMessage('Please connect your wallet first');
      return;
    }
    if (!amount || amount <= 0) {
      setMessage('Please enter a valid amount');
      return;
    }
    if (!distributionWallet) {
      setMessage('Distribution wallet not available');
      return;
    }

    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(distributionWallet),
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'processed');

      await axios.post(`${process.env.REACT_APP_API_URL}/wallets/deposit`, {
        fromPublicKey: publicKey.toString(),
        toPublicKey: distributionWallet,
        amount,
        signature,
      });
      setMessage(`Deposit of ${amount} SOL successful, signature: ${signature}`);
    } catch (error) {
      console.error('Error depositing:', error);
      setMessage('Error depositing SOL');
    }
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
      <p>Distribution Wallet: {distributionWallet || 'Loading...'}</p>
      {message && <p>{message}</p>}
    </div>
  );
}

export default DepositForm;