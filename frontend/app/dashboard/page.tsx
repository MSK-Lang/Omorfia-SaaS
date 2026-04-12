"use client"; 

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'; 
import Link from 'next/link';
import Webcam from 'react-webcam'; 
import { Camera, Users, LayoutDashboard, History, Settings, Zap } from 'lucide-react'; 
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'; 
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

export default function Dashboard() { 
  const webcamRef = useRef<Webcam>(null);
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

  const capture = useCallback(async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        const start = performance.now();
        setIsAnalyzing(true);
        try {
          const res = await fetch(imageSrc);
          const blob = await res.blob();
          const formData = new FormData();
          formData.append("file", blob, "frame.jpg");

          const response = await fetch("http://localhost:8000/analyze", {
            method: "POST",
            body: formData,
          });
          const result = await response.json();
          
          if (result.status === "success" && result.data) {
            const normalizedTexture = Math.min(100, (result.data.texture / 12)); 
            
            setData(prev => ({
              ...prev,
              texture: Math.round(normalizedTexture),
              pores: Math.round(result.data.pores),
              redness: Math.round(result.data.redness),
              oiliness: Math.round(result.data.oiliness),
              hydration: Math.max(0, 100 - (result.data.oiliness * 0.5) - (result.data.redness * 0.2)),
              elasticity: Math.max(0, normalizedTexture * 0.8 + 20),
            }));
            setLatency(Math.round(performance.now() - start));
          }
        } catch (error) {
          console.error("Analysis failed:", error);
        } finally {
          setIsAnalyzing(false);
        }
      }
    }
  }, [webcamRef]);

  useEffect(() => {
    const interval = setInterval(capture, 2000);
    return () => clearInterval(interval);
  }, [capture]);

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
              <p className="text-gray-500 text-xs uppercase tracking-[0.2em]">Session Active: Elite Spa London</p> 
            </div> 
          </div> 
          <div className="flex gap-4"> 
            <div className="text-right"> 
              <p className="text-[10px] text-gray-400 uppercase font-bold">Client Focus</p> 
              <p className="text-sm font-medium">Sarah Jenkins</p> 
            </div> 
            <div className="w-10 h-10 rounded-full bg-stone flex items-center justify-center text-teal font-bold">SJ</div> 
          </div> 
        </header> 

        <div className="grid grid-cols-12 gap-8"> 
          
          {/* THE FEED (Left Side) */} 
          <div className="col-span-7 space-y-6"> 
            <div className="relative bg-white rounded-2xl p-2 shadow-sm border border-stone"> 
              <div className="rounded-xl overflow-hidden relative"> 
                <Webcam 
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full h-auto" 
                  videoConstraints={{
                    facingMode: "user",
                    width: 1280,
                    height: 720
                  }}
                /> 
                {/* Minimalist HUD UI */} 
                <div className="absolute top-6 left-6 text-white/80 font-mono text-[10px] bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10"> 
                  LUMINANCE: OPTIMAL 
                </div> 
                <div className="absolute bottom-6 right-6 text-white/80 font-mono text-[10px] bg-teal/60 backdrop-blur-md px-3 py-1 rounded-full"> 
                  AI ENGINE v2.4 
                </div> 
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

            {/* RECOMMENDATION ENGINE */} 
            <div className="bg-teal text-white rounded-2xl p-8 shadow-lg relative overflow-hidden"> 
              <Zap className="absolute -right-4 -bottom-4 text-white/10" size={120} /> 
              <div className="relative z-10"> 
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-4">Recommended Protocol</h3> 
                <h4 className="text-xl font-serif mb-2 italic">
                  {data.texture < 60 ? "Deep Sea Mineral Infusion" : "Hydra-Silk Preservation"}
                </h4> 
                <p className="text-sm opacity-80 leading-relaxed max-w-[280px]"> 
                  Based on your <span className="font-bold">Texture Stability ({data.texture}%)</span> and hydration levels, we suggest a high-pressure mineral mist to restore the lipid barrier. 
                </p> 
                <button className="mt-6 bg-white text-teal px-6 py-2 rounded-full text-xs font-bold uppercase hover:bg-wheat transition-all"> 
                  Book Treatment — £120 
                </button> 
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
