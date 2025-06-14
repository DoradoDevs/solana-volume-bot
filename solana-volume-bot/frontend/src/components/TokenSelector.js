import React from 'react';

function TokenSelector({ onSelect }) {
  const tokens = [
    { name: 'SOL', address: 'So11111111111111111111111111111111111111112' },
    { name: 'USDC', address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
  ];

  return (
    <div>
      <h3>Select Token</h3>
      <select onChange={(e) => onSelect(tokens.find(t => t.address === e.target.value))}>
        <option value="">Select a token</option>
        {tokens.map(token => (
          <option key={token.address} value={token.address}>
            {token.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default TokenSelector;