
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="py-6 text-center">
      <h1 className="font-orbitron text-5xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500"
          style={{ textShadow: '0 0 10px rgba(192, 132, 252, 0.5), 0 0 20px rgba(236, 72, 153, 0.3)' }}>
        GenioAIpk
      </h1>
      <p className="mt-2 text-sm text-stone-400">
        Created by <span className="font-semibold text-purple-300">shahzaib ali (zavinity)</span>
      </p>
    </header>
  );
};
