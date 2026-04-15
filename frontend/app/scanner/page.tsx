"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ScanFace, ClipboardCheck, Zap, ShieldCheck } from 'lucide-react';
import NewPatientForm from '@/components/scanner/NewPatientForm';
import { createClient } from '@/utils/supabase/client';

export default function ScannerPage() {
  const [clinicName, setClinicName] = useState('Omorfia Clinic');

  useEffect(() => {
    async function fetchClinic() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('organizations')
          .select('name')
          .eq('owner_id', user.id)
          .single();
        if (data) setClinicName(data.name);
      }
    }
    fetchClinic();
  }, []);

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-teal/5 to-transparent"></div>
      
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-20 items-center z-10">
        
        {/* Left Side: Agency Framing */}
        <div className="space-y-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
             <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 border border-teal/10 rounded-full shadow-sm backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-teal animate-pulse"></span>
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-teal">Clinical Environment Active</span>
            </div>
            <h1 className="text-6xl lg:text-8xl font-bold tracking-tighter leading-tight text-charcoal">
              Proprietary AI <br />
              <span className="text-teal italic font-serif">Spectral Analysis</span>
            </h1>
            <p className="text-stone-500 text-lg max-w-md leading-relaxed font-medium">
              Precision topology and clinical marker mapping. Bridge the gap between visual assessment and biological reality.
            </p>
          </motion.div>

          {/* Value Props */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: <Zap size={20} />, title: "Sub-Second Latency", desc: "Real-time diagnostic handover" },
              { icon: <ShieldCheck size={20} />, title: "Clinical Rigor", desc: "Medically-graded metric weights" },
            ].map((item, i) => (
              <motion.div 
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-start gap-5 p-6 rounded-[2rem] bg-white/40 border border-stone/30 shadow-sm"
              >
                <div className="p-3 bg-teal/5 rounded-2xl text-teal border border-teal/10">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-charcoal">{item.title}</h3>
                  <p className="text-xs text-stone-400 mt-1 font-medium">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="pt-10 border-t border-stone/20 flex items-center gap-6">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-4 border-wheat bg-stone flex items-center justify-center text-[10px] font-bold text-teal shadow-inner">AI</div>
              ))}
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-black">
              Trusted by 500+ Luxury Clinics Globally
            </p>
          </div>
        </div>

        {/* Right Side: Intake Form */}
        <div className="flex justify-center">
          <NewPatientForm />
        </div>

      </div>

      {/* Footer Branding */}
      <footer className="absolute bottom-12 left-12 flex items-center gap-4 opacity-40">
        <div className="w-10 h-10 bg-teal text-white rounded-xl flex items-center justify-center font-serif font-bold text-xl italic shadow-lg shadow-teal/20">Ω</div>
        <span className="text-[10px] uppercase tracking-[0.4em] font-black text-charcoal">Omorfia Agency Core</span>
      </footer>

      <div className="absolute bottom-12 right-12 flex items-center gap-6 opacity-40">
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.2em] font-black text-charcoal">Active session</p>
          <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-teal font-bold">{clinicName}</p>
        </div>
      </div>
    </main>
  );
}
