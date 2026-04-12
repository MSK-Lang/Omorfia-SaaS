"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronRight, ShieldCheck, Mail, Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock Auth logic
    setTimeout(() => {
      setIsLoading(false);
      router.push('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-wheat flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[440px] space-y-8"
      >
        {/* Branding */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <span className="font-serif text-teal text-4xl font-bold tracking-tighter">Ω</span>
            <span className="font-semibold text-2xl tracking-tight text-charcoal">Omorfia</span>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-charcoal">Welcome Back</h1>
          <p className="text-charcoal/40 text-sm font-medium">Access your diagnostic infrastructure</p>
        </div>

        {/* Form Container */}
        <div className="bg-white p-10 rounded-[2rem] border-[0.5px] border-stone shadow-[0_20px_50px_rgba(20,27,38,0.05)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                <input 
                  required
                  type="email" 
                  className="w-full bg-wheat/30 border border-stone/50 rounded-2xl pl-12 pr-6 py-4 text-sm focus:outline-none focus:border-teal transition-colors" 
                  placeholder="admin@omorfia.global" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Password</label>
                <Link href="#" className="text-[10px] font-bold text-stone-300 uppercase tracking-widest hover:text-charcoal transition-colors">Forgot Password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                <input 
                  required
                  type="password" 
                  className="w-full bg-wheat/30 border border-stone/50 rounded-2xl pl-12 pr-6 py-4 text-sm focus:outline-none focus:border-teal transition-colors" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <button 
              disabled={isLoading}
              className="w-full py-5 bg-charcoal text-white rounded-full text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-teal transition-all shadow-2xl shadow-charcoal/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In to Terminal
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-charcoal/40 text-xs font-medium">
          Don't have an account?{" "}
          <Link href="/signup" className="text-teal font-bold hover:underline underline-offset-4">Create Organization</Link>
        </p>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 opacity-30">
          <ShieldCheck size={14} className="text-stone-400" />
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-stone-400 italic">Secure_Infrastructure_v2.4</span>
        </div>
      </motion.div>
    </div>
  );
}
