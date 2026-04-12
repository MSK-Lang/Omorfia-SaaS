"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GatekeeperPage() {
  const [key, setKey] = useState('');
  const router = useRouter();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (key === 'omorfia-dev-2026') {
        // Set the bypass cookie to avoid RLS/Supabase auth bottlenecks in dev
        document.cookie = "omorfia_dev_session=true; path=/; max-age=86400"; // Expires in 24 hrs
        router.push('/dashboard');
      } else {
        // Silent rejection: clear the field
        setKey('');
      }
    }
  };

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center p-6 font-mono selection:bg-teal/20">
      <div className="w-full max-w-xs animate-in fade-in duration-1000">
        <label 
          htmlFor="master-key"
          className="block text-teal text-[9px] uppercase tracking-[0.5em] font-bold mb-8 text-center opacity-60"
        >
          Enter Master Key
        </label>
        <input
          id="master-key"
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          autoComplete="off"
          spellCheck="false"
          className="w-full bg-transparent border-b border-teal/20 focus:border-teal text-teal text-center text-2xl pb-4 focus:outline-none transition-colors tracking-[0.2em] shadow-none"
        />
      </div>
    </div>
  );
}