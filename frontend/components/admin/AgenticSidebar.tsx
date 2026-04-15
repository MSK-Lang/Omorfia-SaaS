"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  Users, 
  Settings, 
  Zap, 
  MessageSquare, 
  BrainCircuit, 
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  LayoutDashboard
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

type Modules = {
  lead_intelligence: boolean;
  auto_conversion: boolean;
  advanced_spectral: boolean;
};

export default function AgenticSidebar() {
  const pathname = usePathname();
  const [modules, setModules] = useState<Modules>({
    lead_intelligence: true,
    auto_conversion: false,
    advanced_spectral: true
  });

  useEffect(() => {
    async function fetchModules() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('organizations')
          .select('service_modules')
          .eq('owner_id', user.id)
          .single();
        if (data?.service_modules) {
          setModules(data.service_modules);
        }
      }
    }
    fetchModules();
  }, []);

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: "ROI Portal", href: "/admin", active: pathname === "/admin" },
    { icon: <Users size={20} />, label: "Leads Command", href: "/admin/leads", active: pathname === "/admin/leads" },
    { icon: <TrendingUp size={20} />, label: "Market Intelligence", href: "#", disabled: true },
  ];

  const agenticModules = [
    { id: 'lead_intelligence', icon: <BrainCircuit size={18} />, label: "Lead Intelligence", status: modules.lead_intelligence },
    { id: 'advanced_spectral', icon: <Zap size={18} />, label: "Advanced Spectral", status: modules.advanced_spectral },
    { id: 'auto_conversion', icon: <MessageSquare size={18} />, label: "Auto-Conversion", status: modules.auto_conversion },
  ];

  return (
    <aside className="w-80 bg-white border-r border-stone/30 flex flex-col h-screen sticky top-0 overflow-y-auto">
      {/* Brand Header */}
      <div className="p-8 pb-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-teal text-white rounded-2xl flex items-center justify-center font-serif font-bold text-2xl italic shadow-lg shadow-teal/20">Ω</div>
          <div>
            <h1 className="text-2xl font-bold tracking-tighter text-charcoal">Omorfia</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] font-black text-teal">Revenue Engine</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-6 space-y-2">
        <p className="px-4 text-[10px] uppercase tracking-[0.25em] font-black text-stone-400 mb-6">Core Portal</p>
        {menuItems.map((item) => (
          <Link 
            key={item.label}
            href={item.href}
            className={`flex items-center justify-between px-5 py-5 rounded-3xl transition-all group ${
              item.active 
              ? 'bg-teal text-white shadow-[0_10px_25px_rgba(0,128,128,0.25)]' 
              : 'text-stone-400 hover:bg-stone-50 hover:text-charcoal'
            } ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center gap-4">
              {item.icon}
              <span className="text-sm font-bold">{item.label}</span>
            </div>
            {item.active && <ChevronRight size={16} />}
          </Link>
        ))}
      </nav>

      {/* Agentic Modules Upsell */}
      <div className="mt-14 px-6">
        <p className="px-4 text-[10px] uppercase tracking-[0.25em] font-black text-stone-400 mb-8">Agentic Modules</p>
        <div className="space-y-5">
          {agenticModules.map((module) => (
            <div key={module.id} className="p-6 bg-stone-50/50 border border-stone/40 rounded-[2rem] space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${module.status ? 'bg-teal/5 text-teal border border-teal/10' : 'bg-stone-200/50 text-stone-400'}`}>
                    {module.icon}
                  </div>
                  <span className="text-sm font-bold text-charcoal">{module.label}</span>
                </div>
                {module.status ? (
                  <div className="w-2 h-2 rounded-full bg-teal shadow-[0_0_10px_rgba(0,128,128,1)]"></div>
                ) : (
                   <span className="text-[9px] font-black text-stone-300 uppercase tracking-tighter">Inactive</span>
                )}
              </div>
              
              {!module.status && (
                <button className="w-full bg-white border border-stone/40 text-[10px] font-black uppercase tracking-widest text-charcoal py-3 rounded-2xl hover:bg-teal hover:text-white hover:border-teal transition-all shadow-sm">
                  Contact Agency to Activate
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Account */}
      <div className="mt-auto p-10 border-t border-stone/10 bg-stone-50/30">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-wheat flex items-center justify-center text-teal font-black border-2 border-white shadow-sm">
            HQ
          </div>
          <div>
            <p className="text-xs font-black text-charcoal uppercase tracking-wider">Stakeholder View</p>
            <Link href="/logout" className="text-[10px] font-black text-teal hover:underline uppercase tracking-widest">Sign Out</Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
