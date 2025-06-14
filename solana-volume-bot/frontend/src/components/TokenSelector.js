import React, { useState } from 'react';

function TokenSelector() {
  const [inputMint, setInputMint] = useState('So11111111111111111111111111111111111111112'); // SOL
  const [outputMint, setOutputMint] = useState('');

  return (
    <div className="mb-4">
      <h2 className="text-xl font-semibold">Select Token</h2>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Input Mint (SOL)"
          value={inputMint}
          readOnly
          className="w-full p-2 border rounded bg-gray-100"
        />
        <input
          type="text"
          placeholder="Output Mint (Token)"
          value={outputMint}
          onChange={(e) => setOutputMint(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
    </div>
  );
}

export default TokenSelector;