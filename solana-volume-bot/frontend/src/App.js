import React, { useMemo, useState, useEffect } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
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
  const [userPublicKey, setUserPublicKey] = useState(null);

  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const walletsArray = useMemo(() => [new PhantomWalletAdapter()], []);

  useEffect(() => {
    // Optional: Fetch initial wallets if backend supports it
    axios.get(`${process.env.REACT_APP_API_URL}/wallets`)
      .then(response => setWallets(response.data))
      .catch(error => console.error('Error fetching wallets:', error));
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={walletsArray} autoConnect>
        <div className="App">
          <h1>Solana Volume Bot</h1>
          {userPublicKey ? (
            <>
              <p>Connected: {userPublicKey.toString()}</p>
              <WalletStatus wallets={wallets} setWallets={setWallets} setMessage={setMessage} />
              <TokenSelector onSelect={setSelectedToken} />
              <DepositForm userPublicKey={userPublicKey} setMessage={setMessage} />
              <StrategySelector
                wallets={wallets}
                setMessage={setMessage}
                inputMint={selectedToken ? selectedToken.address : ''}
                outputMint={selectedToken ? (selectedToken.address === 'So11111111111111111111111111111111111111112' ? '' : 'So11111111111111111111111111111111111111112') : 'So11111111111111111111111111111111111111112'}
              />
            </>
          ) : (
            <p>Please connect your Phantom wallet to use the app.</p>
          )}
          {message && <p>{message}</p>}
        </div>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;