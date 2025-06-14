import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DepositForm from './components/DepositForm';
import StrategySelector from './components/StrategySelector';
import TokenSelector from './components/TokenSelector';
import WalletStatus from './components/WalletStatus';
import './App.css';

function App() {
  const [wallets, setWallets] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedToken, setSelectedToken] = useState(null);

  useEffect(() => {
    // Optional: Fetch initial wallets if needed
    axios.get(`${process.env.REACT_APP_API_URL}/wallets`)
      .then(response => setWallets(response.data))
      .catch(error => console.error('Error fetching wallets:', error));
  }, []);

  return (
    <div className="App">
      <h1>Solana Volume Bot</h1>
      <WalletStatus wallets={wallets} setWallets={setWallets} />
      <TokenSelector onSelect={setSelectedToken} />
      <DepositForm wallets={wallets} setMessage={setMessage} />
      <StrategySelector
        wallets={wallets}
        setMessage={setMessage}
        inputMint={selectedToken ? selectedToken.address : ''}
        outputMint={selectedToken ? (selectedToken.address === 'So11111111111111111111111111111111111111112' ? '' : 'So11111111111111111111111111111111111111112') : 'So11111111111111111111111111111111111111112'}
      />
      {message && <p>{message}</p>}
    </div>
  );
}

export default App;