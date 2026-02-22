import React, { useEffect, useState } from 'react';
import { runAllTests } from '../utils/crypto.test.js';

function CryptoTest() {
  const [results, setResults] = useState(null);

  useEffect(() => {
    runAllTests().then(res => setResults(res));
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Crypto Module Tests</h2>
      {results ? (
        <div>
          <p>✅ Passed: {results.passCount}</p>
          <p>❌ Failed: {results.failCount}</p>
        </div>
      ) : (
        <p>Running tests...</p>
      )}
      <p>Check browser console for details</p>
    </div>
  );
}

export default CryptoTest;