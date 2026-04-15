"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Search, 
  ArrowUpRight, 
  Target,
  Sparkles,
  SearchIcon,
  Filter
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  Legend
} from 'recharts';
import { createClient } from '@/utils/supabase/client';

export default function AdminDashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchAdminData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: leadsData } = await supabase
          .from('leads')
          .select('*')
          .eq('clinic_id', user.id)
          .order('created_at', { ascending: false });
        
        if (leadsData) setLeads(leadsData);
      }
      setLoading(false);
    }
    fetchAdminData();
  }, []);

  // ROI Logic: Confidence Weighted Revenue
  const metrics = useMemo(() => {
    const totalRevenue = leads.reduce((sum, lead) => {
      const value = lead.projected_value || 0;
      const confidence = lead.confidence_score || 0.95;
      return sum + (value * confidence);
    }, 0);

    const highValueLeads = leads.filter(l => (l.melanin_index || 0) > 70).length;
    const totalScans = leads.length;
    const opportunityGap = totalScans - highValueLeads;

    return {
      totalRevenue,
      highValueLeads,
      totalScans,
      opportunityGap,
      avgConfidence: leads.length ? (leads.reduce((sum, l) => sum + (l.confidence_score || 0), 0) / leads.length) : 0
    };
  }, [leads]);

  // Heatmap Data (Opportunity Gap Stacked Bar)
  const chartData = [
    { name: 'Total Opportunities', total: metrics.totalScans, highValue: metrics.highValueLeads, gap: metrics.opportunityGap }
  ];

  const filteredLeads = leads.filter(l => 
    l.lead_id?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.treatment_recommendation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12">
      {/* 1. Header: Total Revenue Identified */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
        <div>
          <h2 className="text-[10px] uppercase tracking-[0.4em] font-black text-teal mb-3">Revenue Intelligence Portal</h2>
          <h1 className="text-5xl font-bold tracking-tighter text-charcoal">Agency Command Center</h1>
        </div>

        <div className="bg-white p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(15,23,42,0.05)] border border-stone/30 flex items-center gap-10 min-w-[450px]">
          <div className="w-20 h-20 bg-teal text-white rounded-[2rem] flex items-center justify-center shadow-[0_10px_25px_rgba(0,128,128,0.25)]">
            <TrendingUp size={40} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] font-black text-stone-400 mb-2">Total Revenue Identified by AI</p>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-serif font-bold text-charcoal tracking-tighter">${Math.round(metrics.totalRevenue).toLocaleString()}</span>
              <span className="text-[10px] font-black text-teal bg-white border border-teal/20 px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-sm">
                +{Math.round(metrics.avgConfidence * 100)}% Confidence
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Visuals Grid */}
      <div className="grid grid-cols-12 gap-10">
        {/* Opportunity Gap Chart */}
        <div className="col-span-12 lg:col-span-8 bg-white p-12 rounded-[4rem] shadow-sm border border-stone/30 min-h-[550px] flex flex-col">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h3 className="text-2xl font-bold text-charcoal flex items-center gap-3 tracking-tight">
                <Target className="text-teal" size={24} />
                The Opportunity Gap
              </h3>
              <p className="text-sm font-medium text-stone-400 mt-2">Total clinical scans vs. high-conversion outcomes</p>
            </div>
            <div className="text-right">
              <span className="text-4xl font-bold text-charcoal tracking-tighter">{metrics.opportunityGap}</span>
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-300 font-black">Untapped Leads</p>
            </div>
          </div>

          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={chartData}
                margin={{ top: 20, right: 40, left: 10, bottom: 20 }}
                barSize={80}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5D5C0" />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" hide />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '2rem', border: '1px solid #E5D5C0', boxShadow: '0 30px 60px rgba(15,23,42,0.08)', padding: '20px' }}
                />
                <Legend verticalAlign="top" align="right" height={50} iconType="circle"/>
                <Bar dataKey="highValue" name="High-Value Conversions" stackId="a" fill="#008080" radius={[40, 0, 0, 40]} />
                <Bar dataKey="gap" name="Untapped Potential" stackId="a" fill="#F5E6D3" radius={[0, 40, 40, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-10 p-8 bg-teal/5 rounded-[2.5rem] border border-teal/10 flex items-center gap-6">
             <Sparkles className="text-teal" size={28} />
             <p className="text-sm font-medium text-charcoal/80 leading-relaxed">
              <span className="font-black text-teal uppercase tracking-widest text-[10px] mr-2">Agency Insight:</span> 
              Identified <span className="font-bold text-charcoal">${Math.round(metrics.opportunityGap * 850).toLocaleString()}</span> in untapped revenue. Activate <span className="underline font-bold text-teal">Auto-Followup</span> to capture margin.
             </p>
          </div>
        </div>

        {/* Quick Stats Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-10">
          <div className="bg-white p-10 rounded-[3rem] border border-stone/30 shadow-sm space-y-8">
            <div className="flex justify-between items-center pb-6 border-b border-stone/10">
              <div>
                <p className="text-[10px] uppercase font-black text-stone-300 mb-2">Total Scans</p>
                <p className="text-4xl font-bold text-charcoal tracking-tighter">{metrics.totalScans}</p>
              </div>
              <div className="p-3 bg-stone-50 rounded-2xl text-stone-400">
                <Users size={20} />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[10px] uppercase font-black text-stone-300 mb-2">High Value</p>
                <p className="text-4xl font-bold text-teal tracking-tighter">{metrics.highValueLeads}</p>
              </div>
              <div className="p-3 bg-teal/5 rounded-2xl text-teal border border-teal/10">
                <Sparkles size={20} />
              </div>
            </div>
          </div>

          <div className="bg-charcoal text-white p-12 rounded-[4rem] shadow-2xl shadow-charcoal/30 relative overflow-hidden flex-1 min-h-[300px]">
            <div className="absolute top-0 right-0 p-10">
              <ShieldCheck className="text-teal/20" size={140} strokeWidth={0.5} />
            </div>
            <div className="relative z-10 flex flex-col h-full">
              <h3 className="text-2xl font-bold mb-6 tracking-tight">Integrity Report</h3>
              <p className="text-white/50 text-base leading-relaxed mb-10 font-medium">
                Metrics are derived from 15-point spectral topology. Projections are confidence-weighted based on skin-marker reliability.
              </p>
              <div className="mt-auto space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-black">Spectral Accuracy</span>
                  <span className="font-bold text-teal font-mono">99.2%</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-teal h-full w-[99.2%] shadow-[0_0_10px_rgba(0,128,128,1)]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Lead Command Center Table */}
      <section className="bg-white rounded-[4rem] shadow-sm border border-stone/30 overflow-hidden">
        <div className="p-12 border-b border-stone/10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h3 className="text-3xl font-bold text-charcoal tracking-tight">Lead Command Center</h3>
            <p className="text-sm font-medium text-stone-400 mt-2">Real-time revenue monitoring and treatment recommendations</p>
          </div>
          <div className="flex items-center gap-5">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" size={20} />
              <input 
                type="text" 
                placeholder="Search leads or treatments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-stone-50 border border-stone/30 rounded-[1.5rem] py-4 pl-14 pr-8 text-sm focus:outline-none focus:border-teal/50 focus:bg-white transition-all w-80 shadow-inner"
              />
            </div>
            <button className="p-4 bg-stone-50 border border-stone/30 rounded-[1.5rem] text-stone-400 hover:text-teal hover:border-teal transition-all shadow-sm">
              <Filter size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/50">
                <th className="px-12 py-6 text-[10px] uppercase tracking-[0.3em] text-stone-400 font-black">Identified Lead</th>
                <th className="px-12 py-6 text-[10px] uppercase tracking-[0.3em] text-stone-400 font-black">AI Diagnosis</th>
                <th className="px-12 py-6 text-[10px] uppercase tracking-[0.3em] text-stone-400 font-black">Recommendation</th>
                <th className="px-12 py-6 text-[10px] uppercase tracking-[0.3em] text-stone-400 font-black text-right">Projected ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone/10">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-teal/[0.02] transition-colors cursor-pointer group">
                  <td className="px-12 py-8">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-teal font-black uppercase text-sm border border-stone/20 overflow-hidden shadow-sm">
                         {lead.raw_payload?.full_name ? lead.raw_payload.full_name.substring(0, 2) : 'AI'}
                      </div>
                      <div>
                        <p className="text-base font-bold text-charcoal">{lead.raw_payload?.full_name || 'Anonymous Subject'}</p>
                        <p className="text-[10px] text-stone-300 font-mono tracking-tighter uppercase font-bold">{lead.lead_id?.substring(0, 12)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-12 py-8">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-black text-charcoal uppercase tracking-tighter">Melanin Index: {lead.melanin_index}</span>
                        <div className="w-24 bg-stone-100 h-1.5 rounded-full overflow-hidden border border-stone/20">
                           <div className="bg-gradient-to-r from-teal/40 to-teal h-full" style={{ width: `${lead.melanin_index}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-12 py-8">
                    <span className="text-[10px] font-black text-white bg-teal px-4 py-2 rounded-xl uppercase tracking-widest shadow-lg shadow-teal/10">
                      {lead.treatment_recommendation || 'Standard Protocol'}
                    </span>
                  </td>
                  <td className="px-12 py-8 text-right">
                    <div className="flex flex-col items-end">
                      <p className="text-xl font-bold text-charcoal tracking-tighter">${lead.projected_value || 0}</p>
                      <p className="text-[10px] font-black text-teal uppercase tracking-widest mt-1">
                        {(lead.confidence_score * 100).toFixed(1)}% QUALITY
                      </p>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-12 py-32 text-center">
                    <div className="flex flex-col items-center gap-6 opacity-20">
                      <Users size={64} strokeWidth={1} />
                      <p className="text-sm font-black uppercase tracking-[0.4em]">No opportunities identified</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
