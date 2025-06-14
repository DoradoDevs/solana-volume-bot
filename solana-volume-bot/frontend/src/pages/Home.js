import React from 'react';
import DepositForm from '../components/DepositForm';
import StrategySelector from '../components/StrategySelector';
import TokenSelector from '../components/TokenSelector';
import WalletStatus from '../components/WalletStatus';

function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Solana Volume Bot</h1>
      <DepositForm />
      <TokenSelector />
      <StrategySelector />
      <WalletStatus />
    </div>
  );
}

export default Home;