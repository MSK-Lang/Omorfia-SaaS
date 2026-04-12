"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronRight, ShieldCheck, Mail, Lock, User, Building2, Loader2, AlertCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [fullName, setFullName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const supabase = createClient();

    try {
      // 1. Create Supabase user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("User creation failed. Please check your details and try again.");

      const userId = authData.user.id;

      // 2. Multi-tenant setup: Create organization using Service Role Key via Server Action
      const { createOrganization } = await import('@/app/actions/auth');
      const orgResult = await createOrganization(clinicName, userId);

      if (!orgResult.success) {
        throw new Error("Failed to create clinic organization: " + orgResult.error);
      }

      // Success!
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Signup process error:', err);
      setError(err.message || "An unexpected error occurred during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-wheat flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[480px] space-y-8"
      >
        {/* Branding */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <span className="font-serif text-teal text-4xl font-bold tracking-tighter">Ω</span>
            <span className="font-semibold text-2xl tracking-tight text-charcoal">Omorfia</span>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-charcoal">Create Your Infrastructure</h1>
          <p className="text-charcoal/40 text-sm font-medium">Join the elite global diagnostic network</p>
        </div>

        {/* Form Container */}
        <div className="bg-white p-10 rounded-[2rem] border-[0.5px] border-stone shadow-[0_20px_50px_rgba(20,27,38,0.05)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-[#141B26] text-white p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
                <AlertCircle size={18} className="text-red-400 shrink-0" />
                <p className="text-xs font-medium leading-relaxed">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
                  <input 
                    required
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-wheat/30 border border-stone/50 rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-teal transition-colors" 
                    placeholder="Sarah Jenkins" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Clinic Name</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
                  <input 
                    required
                    type="text" 
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    className="w-full bg-wheat/30 border border-stone/50 rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-teal transition-colors" 
                    placeholder="Elite Spa London" 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
                <input 
                  required
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-wheat/30 border border-stone/50 rounded-2xl pl-11 pr-6 py-3.5 text-sm focus:outline-none focus:border-teal transition-colors" 
                  placeholder="admin@omorfia.global" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Secure Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
                <input 
                  required
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-wheat/30 border border-stone/50 rounded-2xl pl-11 pr-6 py-3.5 text-sm focus:outline-none focus:border-teal transition-colors" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <div className="pt-2">
              <button 
                disabled={isLoading}
                className={`w-full py-5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] transition-all shadow-xl flex items-center justify-center gap-2 disabled:cursor-not-allowed ${
                  isLoading 
                    ? "bg-white text-teal border border-teal/20" 
                    : "bg-teal text-white hover:bg-charcoal shadow-teal/10"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-teal" />
                    Creating Clinic...
                  </>
                ) : (
                  <>
                    Onboard Organization
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Link */}
        <p className="text-center text-charcoal/40 text-xs font-medium">
          Already an elite partner?{" "}
          <Link href="/login" className="text-teal font-bold hover:underline underline-offset-4">Sign In</Link>
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
