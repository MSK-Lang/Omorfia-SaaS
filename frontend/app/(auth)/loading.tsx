"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function AuthLoading() {
  return (
    <div className="min-h-screen bg-wheat flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[440px] space-y-8 flex flex-col items-center">
        {/* Branding Placeholder */}
        <div className="text-center space-y-2 opacity-20">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="font-serif text-teal text-4xl font-bold tracking-tighter">Ω</span>
            <span className="font-semibold text-2xl tracking-tight text-charcoal">Omorfia</span>
          </div>
        </div>

        {/* Skeleton Container */}
        <div className="w-full bg-white p-10 rounded-[2rem] border-[0.5px] border-stone shadow-[0_20px_50px_rgba(20,27,38,0.05)] relative overflow-hidden">
          {/* Shimmer Effect */}
          <motion.div 
            animate={{ left: ["-100%", "200%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-wheat/20 to-transparent z-10"
          />
          
          <div className="space-y-6 opacity-10">
            <div className="h-12 w-full bg-stone rounded-2xl" />
            <div className="h-12 w-full bg-stone rounded-2xl" />
            <div className="h-14 w-full bg-teal rounded-full mt-8" />
          </div>
        </div>
      </div>
    </div>
  );
}
