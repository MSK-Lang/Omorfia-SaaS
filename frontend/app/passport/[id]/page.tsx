"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share, ChevronLeft, MapPin, User, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, RadarChart as RechartsRadarChart, ResponsiveContainer, Radar as RechartsRadar } from 'recharts';
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
    <div className="flex items-center p-4 bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-stone/20 hover:border-[#006D77]/20 transition-colors">
      <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="28" cy="28" r="24" stroke="#E2E8F0" strokeWidth="3" fill="transparent" />
          <motion.circle 
            cx="28" cy="28" r="24" 
            stroke="#006D77" 
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
        <div className="absolute inset-0 flex items-center justify-center font-bold text-[11px] text-[#006D77]">
          {Math.round(score)}
        </div>
      </div>
      <div className="ml-4 flex-1">
        <h4 className="font-bold text-charcoal tracking-tight">{label}</h4>
        <p className="text-[9px] text-[#006D77] uppercase tracking-[0.2em] font-bold mt-0.5 opacity-80">{status}</p>
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
    ? ["#006D77", "#D4AF37", "#006D77"] 
    : ["#006D77", "#008B99", "#006D77"];

  const radarData = [
    { subject: 'Clarity', score: Math.round(((100-metrics.redness) + (100-metrics.blemish_severity) + (100-metrics.pore_density) + (100-metrics.dark_circle_index) + (100-metrics.uv_damage)) / 5) },
    { subject: 'Surface', score: Math.round((metrics.texture + (100-metrics.roughness) + metrics.glow_score + (100-metrics.sebum_level) + metrics.tone_uniformity) / 5) },
    { subject: 'Foundation', score: Math.round(((100-metrics.wrinkle_index) + metrics.firmness_index + (100-metrics.sagging_score) + metrics.elasticity) / 4) },
    { subject: 'Radiance', score: Math.round((metrics.glow_score + metrics.tone_uniformity) / 2) },
    { subject: 'Resilience', score: Math.round((metrics.firmness_index + (100-metrics.uv_damage)) / 2) }
  ];

  return (
    <div className="min-h-screen bg-[#F5F5DC] flex flex-col font-sans text-charcoal relative">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#006D77]/10 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-[#006D77]/5 rounded-full blur-[100px]"></div>
      </div>

      <header className="p-6 flex justify-between items-center relative z-20 max-w-7xl mx-auto w-full">
        <Link href="/dashboard" className="p-2 bg-white/50 backdrop-blur-md rounded-full hover:bg-white transition-colors duration-300 shadow-sm border border-[#006D77]/10">
          <ChevronLeft size={20} className="text-[#006D77]" />
        </Link>
        <span className="font-serif font-bold text-[#006D77] text-xl tracking-tight drop-shadow-sm">Omorfia Passport</span>
        <div className="w-10" />
      </header>

      <div className="relative z-10 lg:grid lg:grid-cols-12 lg:gap-16 lg:items-start lg:max-w-7xl lg:mx-auto lg:px-8 pt-4 w-full flex-grow">
        <div className="lg:col-span-5 w-full flex flex-col items-center">
          
          <div className="flex flex-col items-center w-full mb-8">
            {/* Revenue Potential Badge */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-white/90 backdrop-blur-md border-[1.5px] border-[#D4AF37] px-6 py-2.5 rounded-full flex items-center shadow-[0_0_20px_rgba(212,175,55,0.15)] hover:shadow-[0_0_25px_rgba(212,175,55,0.3)] transition-all duration-500 group"
            >
              <div className="w-2 h-2 rounded-full bg-[#D4AF37] mr-3 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#006D77]">
                Projected Case Value: <span className="text-[#D4AF37] ml-1 font-black">${treatment.price.toLocaleString()}</span>
              </span>
            </motion.div>

            {sessionData.quality_flag === 'MANUAL_REVIEW_RECOMMENDED' && (
              <div className="mb-4 bg-yellow-100 border border-yellow-400 text-yellow-800 text-[10px] uppercase tracking-widest font-bold px-4 py-3 rounded-xl flex items-center justify-center text-center shadow-sm w-full max-w-[320px]">
                ⚠️ Clinical Alert: Manual Review Recommended. Capture conditions suboptimal.
              </div>
            )}
            
            <div className="flex flex-col gap-6 w-full max-w-[320px]">
              {/* Original */}
              <div className="relative w-full aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-lg border-[2px] border-[#006D77] group bg-white">
                <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-[#006D77]/80 backdrop-blur-md rounded-full text-[9px] text-white font-mono tracking-widest uppercase">Visible Light</div>
                {scanImage ? <img src={scanImage} alt="Original" className="absolute inset-0 w-full h-full object-cover z-10" /> : <div className="absolute inset-0 flex items-center justify-center text-[9px] uppercase tracking-widest opacity-40">Missing</div>}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* UV Map (Clinical Lens) */}
                <div className="relative w-full aspect-square rounded-full overflow-hidden shadow-xl border border-white/10 group bg-charcoal">
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[8px] text-white font-mono tracking-widest uppercase shadow-md pointer-events-none">UV Map</div>
                  {sessionData.uv_map ? <img src={sessionData.uv_map} alt="UV Map" className="absolute inset-0 w-full h-full object-cover z-10 transition-transform duration-700 hover:scale-110" /> : <div className="absolute inset-0 flex items-center justify-center text-[8px] uppercase tracking-widest text-[#006D77] opacity-60">Wait</div>}
                </div>
                {/* Erythema Map (Clinical Lens) */}
                <div className="relative w-full aspect-square rounded-full overflow-hidden shadow-xl border border-white/10 group bg-charcoal">
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[8px] text-white font-mono tracking-widest uppercase shadow-md pointer-events-none">Erythema</div>
                  {sessionData.erythema_map ? <img src={sessionData.erythema_map} alt="Erythema Map" className="absolute inset-0 w-full h-full object-cover z-10 transition-transform duration-700 hover:scale-110" /> : <div className="absolute inset-0 flex items-center justify-center text-[8px] uppercase tracking-widest text-[#006D77] opacity-60">Wait</div>}
                </div>
              </div>
            </div>

            <section className="flex flex-col items-center justify-center pt-8 pb-4 w-full relative overflow-visible">
              <motion.div className="absolute w-64 h-64 rounded-full blur-[70px] pointer-events-none opacity-25 z-0" animate={{ backgroundColor: pulseColors }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
              <div className="relative z-10 flex flex-col items-center bg-white/50 backdrop-blur-xl px-12 py-8 rounded-[3rem] shadow-sm border border-white/50">
                <span className="text-[9px] uppercase tracking-[0.5em] font-bold text-[#006D77] mb-2 opacity-80">Biological Skin Age</span>
                <motion.span key={metrics.biological_skin_age} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-serif text-[90px] leading-none font-bold text-charcoal tracking-tighter">
                  {Math.round(metrics.biological_skin_age)}
                </motion.span>
              </div>
            </section>
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[320px] bg-white/80 backdrop-blur-md p-6 rounded-[2.5rem] border border-[#006D77]/10 shadow-sm mb-8">
            <h4 className="text-[9px] uppercase tracking-[0.3em] font-bold text-[#006D77] mb-3">Clinical Insight</h4>
            <p className="text-sm font-serif italic text-charcoal/90 leading-relaxed italic">"{consultantNote}"</p>
          </motion.div>

          <div className="hidden lg:block w-full max-w-sm bg-white/60 backdrop-blur-md p-7 rounded-[2rem] border border-white shadow-sm hover:shadow-lg transition-shadow">
            <h4 className="text-[10px] uppercase tracking-widest font-bold text-[#006D77] mb-6">Session Origins</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-charcoal/80 text-sm font-medium"><MapPin size={14} className="text-[#006D77]" /> Omorfia Global HQ (Demo)</div>
              <div className="flex items-center gap-4 text-charcoal/80 text-sm font-medium"><User size={14} className="text-[#006D77]" /> Integrator UUID: 9A4-2026</div>
              <div className="flex items-center gap-4 text-charcoal/80 text-sm font-medium"><Calendar size={14} className="text-[#006D77]" /> Valid: 12 April 2026</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 w-full flex flex-col items-center lg:items-stretch pb-32">
          <div className="w-[90%] mx-auto lg:w-full bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-sm border border-stone/20 mb-10 h-[380px] relative overflow-hidden hidden sm:block">
            <div className="absolute top-6 left-8">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-1">Architectural Shape</h3>
              <p className="text-sm font-serif text-charcoal font-semibold">Diagnostic Radar Projection</p>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="55%" outerRadius="65%" data={radarData}>
                <PolarGrid stroke="#EAE7E2" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#006D77', fontSize: 11, fontWeight: "bold" }} />
                <Radar name="Patient" dataKey="score" stroke="#006D77" strokeWidth={2} fill="#006D77" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* THE CLOSER CARD */}
          <div className="w-[90%] mx-auto lg:w-full bg-[#006D77] text-white rounded-[2rem] p-8 shadow-[0_20px_40px_rgb(0,109,119,0.2)] relative overflow-hidden mb-10"> 
            <div className="relative z-10"> 
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-3">Automated Treatment Recommendation</h3> 
              <h4 className="text-3xl font-serif mb-3 italic">{treatment.name}</h4> 
              <p className="text-sm opacity-90 leading-relaxed font-medium"> 
                {treatment.description}
              </p> 
              <div className="mt-6 bg-white/10 border border-white/20 px-6 py-4 rounded-[1.5rem] flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-widest font-bold">Estimated Revenue</span>
                <span className="text-2xl font-bold">${treatment.price.toLocaleString()}</span>
              </div>
              <button className="mt-6 w-full bg-white text-[#006D77] py-4 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-[#F5F5DC] transition-all shadow-lg active:scale-[0.98]"> 
                Initiate Consultation
              </button> 
            </div> 
          </div> 


          <div className="px-5 lg:px-0 relative z-10 w-full max-w-md lg:max-w-full mx-auto mt-8">
            <div className="flex space-x-2 p-1.5 bg-white/60 backdrop-blur-md rounded-full shadow-sm mb-8 border border-white">
              {(['Clarity', 'Surface', 'Foundation'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 px-4 rounded-full text-[10px] lg:text-xs uppercase tracking-[0.2em] font-bold transition-all duration-300 ${
                    activeTab === tab ? 'bg-[#006D77] text-white shadow-md' : 'text-charcoal/50 hover:text-charcoal/90 hover:bg-white/50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="min-h-[440px]">
              <AnimatePresence mode='wait'>
                <motion.div key={activeTab} initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: -10 }} transition={{ duration: 0.4, ease: "easeOut" }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {clusters[activeTab].map(metric => (
                    <CircularProgress key={metric.label} label={metric.label} score={metric.score} />
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#F5F5DC] via-[#F5F5DC] to-transparent pointer-events-none z-30">
        <button className="w-full max-w-sm mx-auto py-5 bg-[#006D77] text-white rounded-full text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-charcoal transition-all shadow-[0_10px_20px_rgb(0,109,119,0.2)] flex items-center justify-center gap-2 pointer-events-auto active:scale-[0.98]">
          Share Clinical Results
          <Share size={15} className="mb-[2px] opacity-80" />
        </button>
      </div>
    </div>
  );
}
