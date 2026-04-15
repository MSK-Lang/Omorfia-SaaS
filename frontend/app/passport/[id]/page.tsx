"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share, ChevronLeft, MapPin, User, Calendar, Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Radar as RechartsRadar } from 'recharts';
import { createClient } from '@/utils/supabase/client';

// Helper for dynamic status labels
const getStatus = (label: string, score: number) => {
  if (['Texture', 'Glow', 'Firmness', 'Uniformity', 'Elasticity'].includes(label)) {
    if (score >= 80) return 'Refined';
    if (score >= 50) return 'Balanced';
    return 'Compromised';
  } else {
    if (score <= 20) return 'Optimal';
    if (score <= 50) return 'Reactive';
    return 'Critical';
  }
};

const CircularProgress = ({ label, score }: { label: string, score: number }) => {
  const isHighGood = ['Texture', 'Glow', 'Firmness', 'Uniformity', 'Elasticity'].includes(label);
  const percentage = isHighGood ? score : 100 - score; 
  const status = getStatus(label, score);

  return (
    <div className="flex items-center p-4 bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-stone/20 hover:border-teal/20 transition-colors">
      <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="28" cy="28" r="24" stroke="#E2E8F0" strokeWidth="3" fill="transparent" />
          <motion.circle 
            cx="28" cy="28" r="24" 
            stroke="#008080" 
            strokeWidth="4" 
            fill="transparent"
            strokeDasharray={2 * Math.PI * 24}
            strokeDashoffset={2 * Math.PI * 24}
            strokeLinecap="round"
            initial={{ strokeDashoffset: 2 * Math.PI * 24 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 24 * (1 - percentage / 100) }}
            transition={{ duration: 1.5, ease: "easeOut", type: "spring", bounce: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-bold text-[11px] text-teal">
          {Math.round(score)}
        </div>
      </div>
      <div className="ml-4 flex-1">
        <h4 className="font-bold text-charcoal tracking-tight">{label}</h4>
        <p className="text-[9px] text-teal uppercase tracking-[0.2em] font-bold mt-0.5 opacity-80">{status}</p>
      </div>
    </div>
  );
};

export default function LuxuryPassport() {
  const [activeTab, setActiveTab] = useState<'Clarity' | 'Surface' | 'Foundation'>('Clarity');
  const [mounted, setMounted] = useState(false);
  const [consultantNote, setConsultantNote] = useState<string>('Initialization of dermal profile underway...');
  const [scanImage, setScanImage] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<any>({
    quality_flag: 'OPTIMAL',
    uv_map: null,
    erythema_map: null
  });
  
  const [metrics, setMetrics] = useState({
    biological_skin_age: 26,
    melanin_index: 35,
    vascular_index: 40,
    texture: 75,
    pore_density: 40,
    redness: 30,
    pigmentation: 25,
    sebum_level: 20,
    glow_score: 80,
    blemish_severity: 15,
    dark_circle_index: 22,
    wrinkle_index: 10,
    uv_damage: 35,
    roughness: 40,
    tone_uniformity: 85,
    firmness_index: 78,
    sagging_score: 10,
    elasticity: 84
  });

  const [treatment, setTreatment] = useState({
    name: 'Standard Hydration Protocol',
    description: 'Skin barrier is stable. Recommend standard maintenance protocol to preserve structural integrity.',
    price: 350
  });

  useEffect(() => {
    setMounted(true);
    
    async function loadData() {
      const stored = localStorage.getItem('omorfia_latest_scan');
      const storedImg = localStorage.getItem('omorfia_scan_image');
      if (storedImg) setScanImage(storedImg);
  
      let payload: any = null;
      if (stored) {
        try {
          payload = JSON.parse(stored);
          if (payload.data) setMetrics(prev => ({ ...prev, ...payload.data }));
          else if (payload.metrics) setMetrics(prev => ({ ...prev, ...payload.metrics }));
          else setMetrics(prev => ({ ...prev, ...payload }));
          
          if (payload.consultant_note) setConsultantNote(payload.consultant_note);
          if (payload.quality_flag) {
            setSessionData({
              quality_flag: payload.quality_flag,
              uv_map: payload.uv_map || null,
              erythema_map: payload.erythema_map || null
            });
          }
        } catch(e) {
          console.error("Failed to parse OMORFIA payload", e);
        }
      }

      // Dynamic Treatment Initialization via Supabase
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user && payload) {
          const { data: orgData } = await supabase
            .from('organizations')
            .select('id')
            .eq('owner_id', user.id)
            .single();
  
          if (orgData) {
            const { data: treatments } = await supabase
              .from('treatment_menu')
              .select('service_name, price, description, trigger_metric, threshold_min')
              .eq('clinic_id', orgData.id);
  
            if (treatments && treatments.length > 0) {
              let selected: any = null;
              for (const t of treatments) {
                 const metricName = t.trigger_metric;
                 const threshold = t.threshold_min;
                 const val = payload[metricName] ?? (payload.metrics?.[metricName] ?? 0);
                 if (val >= threshold) {
                    if (!selected || t.price > selected.price) {
                       selected = t;
                    }
                 }
              }
              
              if (selected) {
                setTreatment({
                   name: selected.service_name,
                   description: selected.description,
                   price: selected.price
                });
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to bind dynamic treatments:", err);
      }
    }
    
    loadData();
  }, []);

  if (!mounted) return null;

  const clusters = {
    Clarity: [
      { label: 'Redness', score: metrics.redness },
      { label: 'Blemishes', score: metrics.blemish_severity },
      { label: 'Pores', score: metrics.pore_density },
      { label: 'Dark Circles', score: metrics.dark_circle_index },
      { label: 'UV Damage', score: metrics.uv_damage },
    ],
    Surface: [
      { label: 'Texture', score: metrics.texture },
      { label: 'Roughness', score: metrics.roughness },
      { label: 'Glow', score: metrics.glow_score },
      { label: 'Sebum', score: metrics.sebum_level },
      { label: 'Uniformity', score: metrics.tone_uniformity },
    ],
    Foundation: [
      { label: 'Wrinkles', score: metrics.wrinkle_index },
      { label: 'Firmness', score: metrics.firmness_index },
      { label: 'Volume', score: metrics.sagging_score },
      { label: 'Skin Age', score: metrics.biological_skin_age },
      { label: 'Elasticity', score: metrics.elasticity },
    ]
  };

  const pulseColors = metrics.biological_skin_age < 30 
    ? ["#008080", "#C5B358", "#008080"] 
    : ["#008080", "#00A3A3", "#008080"];

  const radarData = [
    { subject: 'Clarity', score: Math.round(((100-metrics.redness) + (100-metrics.blemish_severity) + (100-metrics.pore_density) + (100-metrics.dark_circle_index) + (100-metrics.uv_damage)) / 5) },
    { subject: 'Surface', score: Math.round((metrics.texture + (100-metrics.roughness) + metrics.glow_score + (100-metrics.sebum_level) + metrics.tone_uniformity) / 5) },
    { subject: 'Foundation', score: Math.round(((100-metrics.wrinkle_index) + metrics.firmness_index + (100-metrics.sagging_score) + metrics.elasticity) / 4) },
    { subject: 'Radiance', score: Math.round((metrics.glow_score + metrics.tone_uniformity) / 2) },
    { subject: 'Resilience', score: Math.round((metrics.firmness_index + (100-metrics.uv_damage)) / 2) }
  ];

  return (
    <div className="min-h-screen bg-[#F5E6D3] flex flex-col items-center py-12 px-4 pb-32 font-sans text-charcoal selection:bg-teal selection:text-white relative">
      <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
        
        {/* 1. Global Header (Spans all 12 columns) */}
        <header className="lg:col-span-12 text-center space-y-4 mb-4">
          <div className="flex items-center justify-between w-full mb-8">
             <Link href="/dashboard" className="p-3 bg-white/80 backdrop-blur-md rounded-full hover:bg-white transition-all shadow-sm border border-stone/20">
              <ChevronLeft size={20} className="text-teal" />
            </Link>
            <div className="w-10 h-10 bg-teal text-white rounded-xl flex items-center justify-center font-serif font-bold text-xl italic shadow-lg">Ω</div>
            <div className="w-10" /> 
          </div>
          
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-teal tracking-tighter italic drop-shadow-sm">
            Omorfia Passport
          </h1>
          <div className="flex justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-teal text-white border border-white/20 px-6 py-2.5 rounded-full flex items-center shadow-lg shadow-teal/20"
            >
              <Sparkles size={14} className="mr-3" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                Projected Case Value: <span className="text-white ml-1 font-black">${treatment.price.toLocaleString()}</span>
              </span>
            </motion.div>
          </div>
        </header>

        {/* 2. Left Column (Visual Intelligence - lg:col-span-5) */}
        <aside className="lg:col-span-5 flex flex-col gap-6">
          {/* Clinical Alert Card */}
          {sessionData.quality_flag === 'MANUAL_REVIEW_RECOMMENDED' && (
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-amber-100 rounded-2xl text-amber-600">
                 <AlertCircle size={24} />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] font-black text-amber-800/60 mb-0.5">Clinical Alert</p>
                <h4 className="text-xs font-bold text-amber-900 leading-tight">AI Engine detected suboptimal capture conditions. Manual Review Recommended.</h4>
              </div>
            </div>
          )}

          {/* Hero Scan Image */}
          <div className="w-full aspect-square relative rounded-[2.5rem] overflow-hidden border-2 border-white/50 shadow-xl bg-white">
            <div className="absolute top-6 left-6 z-20 px-4 py-1.5 bg-teal/90 backdrop-blur-md rounded-full text-[9px] text-white font-black tracking-widest uppercase">Visible Light</div>
            {scanImage ? (
              <img src={scanImage} alt="Hero" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-300 font-mono text-[10px] uppercase tracking-widest bg-stone-50">Signal Missing</div>
            )}
          </div>

          {/* Spectral Maps Grid */}
          <div className="grid grid-cols-2 gap-4">
             <div className="relative aspect-square rounded-[2rem] overflow-hidden border-2 border-white/50 shadow-lg bg-charcoal">
               <div className="absolute bottom-4 left-4 z-20 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[8px] text-white font-black tracking-widest uppercase">UV Map</div>
               {sessionData.uv_map ? <img src={sessionData.uv_map} alt="UV" className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" /> : <div className="absolute inset-0 flex items-center justify-center text-[8px] uppercase tracking-widest text-teal opacity-40">Analyzing...</div>}
             </div>
             <div className="relative aspect-square rounded-[2rem] overflow-hidden border-2 border-white/50 shadow-lg bg-charcoal">
               <div className="absolute bottom-4 left-4 z-20 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[8px] text-white font-black tracking-widest uppercase">Erythema</div>
               {sessionData.erythema_map ? <img src={sessionData.erythema_map} alt="Erythema" className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" /> : <div className="absolute inset-0 flex items-center justify-center text-[8px] uppercase tracking-widest text-teal opacity-40">Analyzing...</div>}
             </div>
          </div>

          {/* Biological Age Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-[2.5rem] border-2 border-white/50 shadow-lg p-10 flex flex-col items-center justify-center relative overflow-hidden h-64">
            <motion.div className="absolute inset-0 rounded-full blur-[80px] pointer-events-none opacity-20 z-0" animate={{ backgroundColor: pulseColors }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
            <div className="relative z-10 flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-[0.5em] font-black text-teal mb-2">Biological Age</span>
              <motion.span key={metrics.biological_skin_age} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-serif text-[80px] leading-none font-bold text-charcoal tracking-tighter">
                {Math.round(metrics.biological_skin_age)}
              </motion.span>
              <div className="mt-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse"></span>
                <span className="text-[9px] font-black uppercase tracking-widest text-stone-400">Verified Precision</span>
              </div>
            </div>
          </div>

          {/* Clinical Insights & Session Profile */}
          <div className="space-y-4">
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-[2rem] border border-stone/20 shadow-sm">
              <h4 className="text-[9px] uppercase tracking-[0.3em] font-black text-teal mb-3">Clinical Context</h4>
              <p className="text-sm font-serif italic text-charcoal/90 leading-relaxed font-medium">"{consultantNote}"</p>
            </div>
            
            <div className="bg-stone-50/50 p-6 rounded-[2rem] border border-stone/10 opacity-70">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-charcoal/60 text-[10px] font-bold uppercase tracking-widest"><MapPin size={12} /> Global HQ (Demo)</div>
                <div className="flex items-center gap-3 text-charcoal/60 text-[10px] font-bold uppercase tracking-widest"><Calendar size={12} /> Valid: {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* 3. Right Column (Revenue Intelligence - lg:col-span-7) */}
        <main className="lg:col-span-7 flex flex-col gap-8">
          {/* Diagnostic Radar Profile Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-[3rem] p-10 shadow-sm border border-stone/20 flex flex-col min-h-[500px]">
            <header className="mb-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-300 mb-2">Diagnostic Profile</h3>
              <p className="text-3xl font-serif text-charcoal font-bold italic tracking-tight">Architectural Shape</p>
            </header>
            <div className="flex-1 w-full min-h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#E5D5C0" strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#008080', fontSize: 11, fontWeight: "900" }} />
                  <Radar name="Patient" dataKey="score" stroke="#008080" strokeWidth={3} fill="#008080" fillOpacity={0.1} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Treatment Protocol (The Closer) Card */}
          <div className="bg-[#008080] text-white rounded-[3rem] p-12 shadow-[0_30px_60px_rgba(0,128,128,0.25)] relative overflow-hidden">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
             <header className="flex justify-between items-center mb-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Revenue Handover Triggered</h3>
                <div className="bg-white text-teal px-5 py-2 rounded-full text-[10px] font-black tracking-widest shadow-xl">
                  ${treatment.price.toLocaleString()} PROJECTED
                </div>
             </header>
             <h4 className="text-5xl font-serif mb-8 italic tracking-tighter leading-tight drop-shadow-md">
                {treatment.name}
             </h4> 
             <p className="text-xl opacity-90 leading-relaxed font-medium mb-12"> 
                {treatment.description}
             </p> 
             <button className="w-full bg-white text-teal py-7 rounded-[2rem] text-[12px] font-black uppercase tracking-[0.3em] hover:bg-wheat transition-all shadow-2xl active:scale-[0.98]"> 
                Initiate Consultation Sequence
             </button> 
          </div>

          {/* Intelligence Deep-Dive (Metrics Section) */}
          <section className="space-y-8">
            <div className="flex justify-center gap-2 p-1.5 bg-white/60 backdrop-blur-md rounded-full shadow-sm border border-white">
              {(['Clarity', 'Surface', 'Foundation'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 rounded-full text-[10px] uppercase tracking-[0.3em] font-black transition-all duration-500 ${
                    activeTab === tab ? 'bg-teal text-white shadow-xl shadow-teal/20' : 'text-stone-400 hover:text-charcoal'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="min-h-[400px]">
              <AnimatePresence mode='wait'>
                <motion.div 
                  key={activeTab} 
                  initial={{ opacity: 0, scale: 0.98, y: 10 }} 
                  animate={{ opacity: 1, scale: 1, y: 0 }} 
                  exit={{ opacity: 0, scale: 0.98, y: -10 }} 
                  transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }} 
                  className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                >
                  {clusters[activeTab].map(metric => (
                    <CircularProgress key={metric.label} label={metric.label} score={metric.score} />
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </section>
        </main>
      </div>

      {/* 4. Fixed Action Bar (Apple-Premium) */}
      <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#F5E6D3] via-[#F5E6D3]/90 to-transparent flex justify-center z-50 pointer-events-none">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full max-w-sm py-6 bg-charcoal bg-opacity-95 backdrop-blur-md text-white rounded-full text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl border border-white/5 pointer-events-auto flex items-center justify-center gap-4"
        >
          Share Clinical Results
          <Share size={18} className="opacity-80" />
        </motion.button>
      </div>
    </div>
  );
}
