"use client"; 

import React, { useState, useEffect, useMemo } from 'react'; 
import Link from 'next/link';
import { Camera, Users, LayoutDashboard, History, Settings, Zap, ScanFace } from 'lucide-react'; 
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'; 
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { createClient } from '@/utils/supabase/client';

export default function Dashboard() { 
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [clinicName, setClinicName] = useState<string>('Unregistered Demo');
  const [leads, setLeads] = useState<any[]>([]);


  useEffect(() => {
    async function initUserSession() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      // The Bypass Logic
      let activeUser = user;
      if (!user && document.cookie.includes('omorfia_dev_session=true')) {
        activeUser = { 
          id: 'dev-admin-uuid', // Use a real UUID from your 'organizations' table here if needed
          email: 'muthu@omorfia.dev', 
          user_metadata: { full_name: 'Muthu (Admin Mode)' } 
        } as any;
      }

      setSessionUser(activeUser);

      if (activeUser) {
        // Fetch organization based on owner ID
        const { data: orgData } = await supabase
          .from('organizations')
          .select('name')
          .eq('owner_id', activeUser.id)
          .single();
        
        if (orgData) {
          setClinicName(orgData.name);
        } else if (activeUser.id === 'dev-admin-uuid') {
          setClinicName('Omorfia Global HQ (Dev)');
        }

        // Fetch Leads
        const { data: leadsData, error } = await supabase
          .from('leads')
          .select('*')
          .eq('clinic_id', activeUser.id)
          .order('created_at', { ascending: false })
          .limit(5);
        if (leadsData) setLeads(leadsData);
      }

    }
    
    initUserSession();
  }, []);

  const [data, setData] = useState({ 
    texture: 84, 
    pores: 42, 
    redness: 15, 
    oiliness: 50,
    hydration: 65,
    elasticity: 78
  }); 
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [latency, setLatency] = useState(42);

  // Recharts data format
  const radarData = useMemo(() => [ 
    { subject: 'Texture', A: data.texture, fullMark: 100 }, 
    { subject: 'Hydration', A: data.hydration, fullMark: 100 }, 
    { subject: 'Pores', A: 100 - data.pores, fullMark: 100 }, 
    { subject: 'Redness', A: 100 - data.redness, fullMark: 100 }, 
    { subject: 'Oiliness', A: 100 - data.oiliness, fullMark: 100 }, 
    { subject: 'Elasticity', A: data.elasticity, fullMark: 100 }, 
  ], [data]); 

  
  // Webcam and loop extraction: Offloaded to dedicated `/scan` route.

  return ( 
    <div className="min-h-screen bg-wheat text-charcoal font-sans flex"> 
      {/* 1. SIDEBAR - Refined with Wheat/Stone contrast */} 
      <nav className="w-20 border-r border-stone bg-white/50 backdrop-blur-md flex flex-col items-center py-10 gap-12"> 
        <Link href="/" className="font-serif text-teal text-3xl font-bold tracking-tighter hover:scale-105 transition-transform">Ω</Link> 
        <div className="flex flex-col gap-10 text-gray-400"> 
          <Camera className="text-teal" size={22} /> 
          <Users size={22} className="hover:text-teal transition-colors cursor-pointer" /> 
          <LayoutDashboard size={22} className="hover:text-teal transition-colors cursor-pointer" /> 
          <History size={22} className="hover:text-teal transition-colors cursor-pointer" /> 
        </div> 
        <Settings className="mt-auto text-stone-400 hover:text-charcoal cursor-pointer" size={20} /> 
      </nav> 

      {/* 2. MAIN HUB */} 
      <main className="flex-1 p-8 overflow-y-auto"> 
        <header className="flex justify-between items-end mb-10"> 
          <div> 
            <h1 className="text-3xl font-semibold tracking-tight text-charcoal">Omorfia Intelligence</h1> 
            <div className="flex items-center gap-3 mt-2"> 
              <span className={`flex h-2 w-2 rounded-full ${isAnalyzing ? 'bg-teal animate-pulse' : 'bg-green-500'}`}></span> 
              <p className="text-gray-500 text-xs uppercase tracking-[0.2em]">Session Active: {clinicName}</p> 
            </div> 
          </div> 
          <div className="flex gap-4"> 
            <div className="text-right"> 
              <p className="text-[10px] text-gray-400 uppercase font-bold">Client Focus</p> 
              <p className="text-sm font-medium">{sessionUser?.user_metadata?.full_name || 'Loading...'}</p> 
            </div> 
            <div className="w-10 h-10 rounded-full bg-stone flex items-center justify-center text-teal font-bold uppercase">
              {sessionUser?.user_metadata?.full_name ? sessionUser.user_metadata.full_name.substring(0, 2) : 'AI'}
            </div> 
          </div> 
        </header> 

        <div className="grid grid-cols-12 gap-8"> 
          
          {/* THE FEED (Left Side) */} 
          <div className="col-span-7 space-y-6"> 
            
            {/* INITIATE SCAN ACTION WIDGET */}
            <div className="relative bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-stone/20 overflow-hidden flex flex-col items-center justify-center min-h-[460px]"> 
              <div className="absolute inset-0 bg-wheat/30"></div>
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-teal/10 rounded-full flex items-center justify-center mb-6 shadow-inner relative">
                  <div className="absolute inset-0 border border-teal/20 rounded-full animate-ping opacity-20"></div>
                  <ScanFace className="text-teal" size={36} strokeWidth={1} />
                </div>
                
                <h2 className="font-serif text-3xl font-bold text-charcoal mb-3">Diagnostic Awaiting Setup</h2>
                <p className="text-charcoal/50 text-sm max-w-sm mb-10 leading-relaxed font-medium">Position the client in optimal ambient lighting before initializing the 15-point clinical scan bridging Sequence.</p>
                
                <Link 
                  href="/scan" 
                  className="px-10 py-4 bg-teal text-white rounded-full text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-charcoal transition-all shadow-[0_15px_30px_rgb(0,109,119,0.2)] hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
                >
                  Initiate New Scan
                </Link>
              </div> 
            </div> 

            {/* QUICK METRICS GRID (The "Stuff") */} 
            <div className="grid grid-cols-3 gap-4"> 
              {[
                { label: 'Texture Stability', value: `${data.texture}%` },
                { label: 'Sync Status', value: `${latency}ms` },
                { label: 'Pore Density', value: `${data.pores}%` }
              ].map((item) => ( 
                <div key={item.label} className="bg-white/40 border border-stone p-4 rounded-xl text-center"> 
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">{item.label}</p> 
                  <p className="text-lg font-bold text-teal">{item.value}</p> 
                </div> 
              ))} 
            </div> 
          </div> 

          {/* THE ANALYSIS (Right Side) */} 
          <div className="col-span-5 space-y-6"> 
            
            {/* RADAR CHART CARD */} 
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone h-80"> 
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Diagnostic Radar</h3> 
              <ResponsiveContainer width="100%" height="100%"> 
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}> 
                  <PolarGrid stroke="#EAE7E2" /> 
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 10 }} /> 
                  <Radar 
                    name="Sarah" 
                    dataKey="A" 
                    stroke="#006D77" 
                    fill="#006D77" 
                    fillOpacity={0.2} 
                  /> 
                </RadarChart> 
              </ResponsiveContainer> 
            </div> 

            {/* HIGH-INTENT LEADS TABLE */} 
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone"> 
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">High-Intent Leads</h3> 
                <span className="text-[10px] font-bold text-teal bg-teal/10 px-3 py-1 rounded-full uppercase">Real-Time Sync</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stone/50">
                      <th className="py-3 text-[10px] uppercase tracking-widest text-gray-400 font-bold">Status</th>
                      <th className="py-3 text-[10px] uppercase tracking-widest text-gray-400 font-bold">Melanin Idx</th>
                      <th className="py-3 text-[10px] uppercase tracking-widest text-gray-400 font-bold text-right">Projected Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.length > 0 ? leads.map((lead) => (
                      <tr key={lead.id || lead.lead_id} className="border-b border-stone/20 hover:bg-wheat/20 transition-colors cursor-pointer" onClick={() => window.location.href = `/passport/${lead.lead_id}`}>
                        <td className="py-4">
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${lead.status === 'New' ? 'bg-teal/10 text-teal' : 'bg-stone-100 text-stone-500'}`}>
                            {lead.status || 'New'}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-charcoal">{lead.melanin_index || 0}</span>
                            {lead.melanin_index > 70 && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="High Damage"></span>}
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          <span className="text-sm font-bold text-[#006D77]">${lead.projected_value || 0}</span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-xs text-stone-400 font-medium">Awaiting Clinical Captures...</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div> 
        </div> 

        {/* FOOTER MATH */} 
        <footer className="mt-12 pt-8 border-t border-stone flex justify-between items-center opacity-30"> 
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono">MATHEMATICAL CORE:</span>
            <span className="text-[10px]"><InlineMath math="L(x,y) = \frac{\partial^2 I}{\partial x^2} + \frac{\partial^2 I}{\partial y^2}" /></span>
          </div>
          <p className="text-[10px] font-mono uppercase tracking-widest">Designed for Professional Environments // © 2026 Omorfia</p> 
        </footer> 
      </main> 
    </div> 
  ); 
}
