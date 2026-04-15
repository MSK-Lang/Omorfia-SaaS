"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, AlertCircle, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewPatientForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    concern: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('omorfia_pending_patient', JSON.stringify(formData));
    router.push('/scan');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-xl bg-white rounded-[2.5rem] p-12 shadow-[0_20px_60px_rgba(15,23,42,0.06)] border border-stone/30"
    >
      <div className="flex flex-col items-center mb-12 text-center text-charcoal">
        <div className="w-16 h-16 bg-teal/5 rounded-full flex items-center justify-center mb-6 border border-teal/10">
          <User className="text-teal" size={32} strokeWidth={1} />
        </div>
        <h2 className="text-3xl font-serif font-bold tracking-tight mb-3 italic">Subject Intake</h2>
        <p className="text-stone-400 text-xs uppercase tracking-[0.25em] font-bold">
          Dermal registration required before scan sequence
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-5">
          {/* Name Field */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-stone-300 group-focus-within:text-teal transition-colors">
              <User size={16} />
            </div>
            <input
              type="text"
              required
              placeholder="Full Name"
              className="w-full bg-stone-50/50 border border-stone/40 rounded-2xl py-5 pl-14 pr-6 text-charcoal placeholder:text-stone-300 focus:outline-none focus:border-teal/50 focus:bg-white transition-all shadow-inner"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          {/* Email Field */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-stone-300 group-focus-within:text-teal transition-colors">
              <Mail size={16} />
            </div>
            <input
              type="email"
              required
              placeholder="Email Correspondence"
              className="w-full bg-stone-50/50 border border-stone/40 rounded-2xl py-5 pl-14 pr-6 text-charcoal placeholder:text-stone-300 focus:outline-none focus:border-teal/50 focus:bg-white transition-all shadow-inner"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {/* concern Field */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-stone-300 group-focus-within:text-teal transition-colors">
              <AlertCircle size={16} />
            </div>
            <textarea
              required
              placeholder="Primary Aesthetic Concern"
              rows={3}
              className="w-full bg-stone-50/50 border border-stone/40 rounded-2xl py-5 pl-14 pr-6 text-charcoal placeholder:text-stone-300 focus:outline-none focus:border-teal/50 focus:bg-white transition-all resize-none shadow-inner"
              value={formData.concern}
              onChange={(e) => setFormData({ ...formData, concern: e.target.value })}
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full relative flex items-center justify-center gap-4 bg-[#008080] text-white rounded-2xl py-5 font-bold uppercase tracking-[0.25em] text-[11px] overflow-hidden transition-all hover:bg-charcoal shadow-[0_15px_40px_rgba(0,128,128,0.2)]"
        >
          <Sparkles size={16} />
          Initialize AI Scan
          </button>
          {process.env.NODE_ENV === 'development' && (
  <button
    type="button"
    onClick={() => {
      setFormData({ name: "Dev Test", email: "test@omorfia.ai", concern: "General Analysis" });
    }}
    className="mb-4 text-[10px] text-teal-600 underline opacity-50 hover:opacity-100"
  >
    [Dev] Auto-Fill Patient
  </button>
)}
      </form>

      <div className="mt-10 pt-10 border-t border-stone/10 flex items-center justify-between opacity-50">
        <span className="text-[10px] font-mono tracking-widest uppercase text-stone-400">Clinical Edition v2.8</span>
        <div className="flex items-center gap-2">
           <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse"></span>
           <span className="text-[10px] font-bold tracking-widest uppercase text-teal">Secure Handshake: OK</span>
        </div>
      </div>
    </motion.div>
  );
}
