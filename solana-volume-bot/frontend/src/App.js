import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WalletComponent from './components/WalletComponent';
import BotComponent from './components/BotComponent';
import './App.css';

function App() {
  const [wallets, setWallets] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/wallets`)
      .then(response => setWallets(response.data))
      .catch(error => console.error('Error fetching wallets:', error));
  }, []);

  return (
    <div className="App">
      <h1>Solana Volume Bot</h1>
      <WalletComponent wallets={wallets} setWallets={setWallets} />
      <BotComponent wallets={wallets} />
    </div>
  );
}

export default App;