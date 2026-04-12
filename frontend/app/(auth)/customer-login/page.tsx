"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ShieldCheck, Mail, Key, ArrowLeft, Loader2, Activity } from 'lucide-react';

export default function CustomerLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);

  const statuses = [
    'Verifying Bio-metric Key...',
    'Decrypting Digital Twin...',
    'Syncing Passport...'
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setStatusIndex((prev) => (prev + 1) % statuses.length);
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Passport unlocking logic (Mock)
    setTimeout(() => {
      setIsLoading(false);
      router.push('/dashboard');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-wheat flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[460px] space-y-10"
      >
        {/* Elegant Branding */}
        <div className="text-center space-y-4">
          <Link href="/" className="inline-block group transition-transform hover:scale-105">
            <span className="font-serif text-charcoal text-6xl font-bold tracking-tighter">Ω</span>
          </Link>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-charcoal">Your Beauty Passport</h1>
            <p className="text-gray-500 text-sm font-medium max-w-[280px] mx-auto leading-relaxed">
              Enter your credentials to access your longitudinal skin data.
            </p>
          </div>
        </div>

        {/* Minimalist Private Vault Container */}
        <div className="bg-white p-12 rounded-[2.5rem] border border-stone shadow-[0_30px_70px_-20px_rgba(20,27,38,0.08)] relative overflow-hidden">
          <AnimatePresence>
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center space-y-6"
              >
                {/* Pulsing Horizontal Line */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <motion.div 
                    animate={{ 
                      top: ["0%", "100%", "0%"],
                      opacity: [0.2, 0.5, 0.2]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      ease: "linear" 
                    }}
                    className="absolute left-0 right-0 h-[1px] bg-teal shadow-[0_0_15px_rgba(0,109,119,0.5)]"
                  />
                </div>

                <div className="relative z-10 flex flex-col items-center space-y-4">
                  <div className="bg-teal/5 p-4 rounded-2xl border border-teal/10">
                    <Activity size={32} className="text-teal animate-pulse" />
                  </div>
                  <div className="text-center space-y-1">
                    <motion.p 
                      key={statusIndex}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[11px] font-mono font-bold text-teal uppercase tracking-[0.2em]"
                    >
                      {statuses[statusIndex]}
                    </motion.p>
                    <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Protocol: Active</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] ml-1">Registered Email</label>
              <div className="relative group">
                <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-teal transition-colors" size={18} />
                <input 
                  required
                  type="email" 
                  className="w-full bg-transparent border-b border-stone py-4 pl-8 pr-2 text-sm focus:outline-none focus:border-teal transition-colors placeholder:text-stone-300" 
                  placeholder="name@email.com" 
                />
              </div>
            </div>

            {/* Passport Key Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Passport Key</label>
              </div>
              <div className="relative group">
                <Key className="absolute left-0 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-teal transition-colors" size={18} />
                <input 
                  required
                  type="text" 
                  className="w-full bg-transparent border-b border-stone py-4 pl-8 pr-2 text-sm font-mono font-bold tracking-widest focus:outline-none focus:border-teal transition-colors placeholder:text-stone-300 placeholder:font-sans placeholder:font-normal placeholder:tracking-normal" 
                  placeholder="OM-XXXX-XXXX" 
                />
              </div>
              <p className="text-[9px] text-stone-400 italic mt-2 ml-1">
                Your unique key is provided by your Omorfia-certified clinic.
              </p>
            </div>

            {/* Action Button */}
            <div className="pt-4">
              <button 
                disabled={isLoading}
                className="w-full py-5 bg-teal text-white rounded-full text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-[#005a63] transition-all shadow-2xl shadow-teal/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Unlocking...
                  </>
                ) : (
                  <>
                    Unlock Passport
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Navigation */}
        <div className="flex flex-col items-center gap-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-charcoal/40 text-[10px] font-bold uppercase tracking-widest hover:text-charcoal transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Home
          </Link>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 opacity-20">
            <ShieldCheck size={14} className="text-stone-400" />
            <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-stone-400">Vault_Protocol_v2.4</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
