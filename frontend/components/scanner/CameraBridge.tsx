"use client";

import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const calculate_revenue = (melanin_index: number) => {
  if (melanin_index > 70) return 1500;
  if (melanin_index > 40) return 850;
  return 350;
};

export default function CameraBridge() {
  const webcamRef = useRef<Webcam>(null);
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAligned, setIsAligned] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState('Analyzing Clinical Markers...');

  // Simulate biometric alignment for theatricality
  useEffect(() => {
    const timer = setTimeout(() => setIsAligned(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleCapture = async () => {
    if (!webcamRef.current) return;
    
    // reset error state
    setErrorStatus(null);

    // Capture base64 string - react-webcam captures the VIDEO buffer only (SVG is sibling, not captured)
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    setIsProcessing(true);
    
    // Total Stabilization Flow: Single Professional State
    setLoadingText('Analyzing Clinical Markers...');

    try {
      console.log('Sending image to backend...');
      const res = await fetch(imageSrc);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append("file", blob, "capture.jpg");

      // Removed artificial stalls for high-speed clinical handover
      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log('Received response:', data);

      if (data.status === "error") {
        setIsProcessing(false);
        setErrorStatus(data.message || 'FACE ALIGNMENT FAILED');
        return;
      }

      if (data.status === "success" && data.data || data.status === "success" && data.metrics) {
        const payload = data.data || data;
        
        // Supabase Sync
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        // Fallback for demo mode
        const activeUserId = user ? user.id : 'dev-admin-uuid';
        
        const leadId = payload.lead_id || crypto.randomUUID();
        
        try {
          // Agency-specific ROI logic: Confidence weighting
          const confidence = payload.confidence || 0.95;
          const recommendation = payload.recommendation || (payload.melanin_index > 70 ? 'Advanced Laser Resurfacing' : 'Clinical Chemical Peel');

          await supabase.from('leads').insert({
            clinic_id: activeUserId,
            lead_id: leadId,
            status: 'New',
            melanin_index: payload.melanin_index || 0,
            vascular_index: payload.vascular_index || 0,
            quality_flag: payload.quality_flag || 'OPTIMAL',
            spectral_data: {
              uv_map: payload.uv_map || null,
              erythema_map: payload.erythema_map || null
            },
            projected_value: calculate_revenue(payload.melanin_index || 0),
            confidence_score: confidence,
            treatment_recommendation: recommendation,
            raw_payload: payload
          });
        } catch (dbErr) {
          console.error("Failed to sync lead to Supabase:", dbErr);
        }

        localStorage.setItem('omorfia_latest_scan', JSON.stringify(data));
        if (imageSrc) localStorage.setItem('omorfia_scan_image', imageSrc);
        router.push(`/passport/${leadId}`);
      }
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      setErrorStatus('CONNECTION ERROR: ENGINE UNREACHABLE');
    }
  };

  return (
    <div className="relative w-full min-h-[100dvh] bg-[#0A0F14] overflow-hidden flex flex-col items-center justify-center py-10 px-4">
      
      {/* Biometric Title & Instruction Set */}
      <div className="flex flex-col items-center w-full z-30 mb-10">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-[#006D77] tracking-[0.25em] text-2xl font-bold text-center leading-tight"
        >
          OMORFIA
          <span className="text-[10px] text-white/30 tracking-[0.6em] font-sans block mt-2 font-light">CLINICAL PRECISION</span>
        </motion.h2>
        
        {/* Error Messaging Gate */}
        {errorStatus ? (
          <motion.p 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-12 text-rose-500 font-mono text-[9px] tracking-[0.3em] font-bold uppercase text-center bg-rose-500/10 px-6 py-2.5 border border-rose-500/20 rounded-full backdrop-blur-md shadow-lg shadow-rose-500/10"
          >
            {errorStatus}
          </motion.p>
        ) : (
          <p className="mt-12 text-[#006D77]/70 font-mono text-[9px] tracking-[0.3em] font-medium uppercase text-center bg-white/5 px-5 py-2 border border-white/10 rounded-full backdrop-blur-sm">
            Align features within the biometric frame for clinical analysis
          </p>
        )}
      </div>

      {/* Viewfinder System - Expanded for Immersion */}
      <div className="relative w-[85vw] h-[113.3vw] lg:w-[450px] lg:h-[600px] flex items-center justify-center overflow-hidden rounded-[5rem] z-10 shadow-[0_50px_120px_rgba(0,0,0,0.9)] border border-white/10 bg-black">
        
        {/* Background Camera Feed - Hardcoded Aspect Ratio for Parity */}
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{ 
            aspectRatio: 0.75,
            facingMode: "user",
            width: { ideal: 1080 },
            height: { ideal: 1440 }
          }}
          className={`absolute inset-0 w-full h-full object-cover grayscale-[30%] transition-opacity duration-1000 ${isProcessing ? 'opacity-40' : 'opacity-80'}`}
        />

        {/* Dynamic Biometric Silhouette Layer */}
        <div className="absolute inset-0 z-20 flex items-center justify-center p-12 pointer-events-none">
          <motion.svg 
            viewBox="0 0 100 100" 
            className="w-full h-full drop-shadow-[0_0_15px_rgba(0,109,119,0.3)]"
            animate={{ 
              scale: isAligned ? [1, 1.015, 1] : 1,
              opacity: isAligned ? 1 : 0.6,
              stroke: errorStatus ? "#F43F5E" : (isAligned ? "#006D77" : "#555555")
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut"
            }}
          >
            {/* The Precision Face Silhouette */}
            <motion.path
              d="M 50 15 C 80 15 85 40 85 60 C 85 85 65 95 50 95 C 35 95 15 85 15 60 C 15 40 20 15 50 15"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinejoin="round"
            />

            {/* Feature Anchor Points: Eyes */}
            <motion.path d="M 35 48 L 42 48" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
            <motion.path d="M 58 48 L 65 48" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />

            {/* Feature Anchor Point: Nose Base */}
            <motion.path d="M 47 68 L 50 71 L 53 68" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.5" />
          </motion.svg>
        </div>

        {/* Scanning Line Animation overlay */}
        {isAligned && !errorStatus && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            className="absolute inset-0 pointer-events-none"
          >
            <motion.div 
              className="absolute left-0 right-0 h-[100px] bg-gradient-to-b from-transparent via-[#006D77]/20 to-transparent"
              animate={{ top: ["-20%", "100%", "-20%"] }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        )}
      </div>

      {/* Action Controller */}
      <div className="mt-14 z-20">
        <button
          onClick={handleCapture}
          disabled={isProcessing}
          className={`relative px-16 py-5 rounded-full text-[11px] font-bold uppercase tracking-[0.25em] transition-all duration-700 shadow-2xl active:scale-[0.98]
            ${isAligned 
              ? (errorStatus ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-[#006D77] text-white hover:bg-white hover:text-[#006D77]') 
              : 'bg-white/5 text-white/20 border border-white/10 cursor-not-allowed'
            }`}
        >
          {isProcessing ? "Analyzing Topology..." : errorStatus ? "Re-calibrate Scan" : isAligned ? "Finalize Scan" : "Calibrating..."}
        </button>
      </div>

      {/* Extreme Processing State Overlay */}
      <AnimatePresence mode='wait'>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#0A0F14]/98 flex flex-col items-center justify-center p-8"
          >
            <div className="relative mb-8">
              <motion.div 
                className="w-24 h-24 border-[1px] border-white/5 border-t-[#006D77] rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
            
            <motion.p 
              key={loadingText}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="text-[#006D77] font-serif italic text-2xl tracking-tight text-center max-w-xs"
            >
              {loadingText}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
