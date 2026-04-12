"use client";

import React from 'react';
import CameraBridge from '@/components/scanner/CameraBridge';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function ScanPage() {
  return (
    <div className="min-h-screen bg-[#141B26] flex flex-col font-sans">
      <header className="absolute top-6 left-6 z-50">
        <Link href="/dashboard" className="p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors flex items-center justify-center">
          <ChevronLeft size={20} className="text-teal" />
        </Link>
      </header>
      
      <main className="flex-1 w-full h-full">
        <CameraBridge />
      </main>
    </div>
  );
}
