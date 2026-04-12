"use client";

import React from 'react';
import { motion } from 'framer-motion';

export interface DiagnosticsData {
  redness: number;
  uv_damage: number;
  pore_density: number;
  wrinkle_index: number;
  [key: string]: any;
}

export default function RecommendationEngine({ metrics }: { metrics: DiagnosticsData }) {
  
  // The Logic: Orchestrate precise clinical recommendations
  const getProtocol = (results: DiagnosticsData) => {
    let recommendations = [];

    // Protocol 1: Calming
    if (results.redness > 50) {
      recommendations.push({
        id: "red-01",
        title: "Azelaic Acid & Niacinamide",
        category: "Calming",
        reason: `Dermal inflammation index measured at ${Math.round(results.redness)}%. Niacinamide structurally regulates inflammation and stabilizes the epidermal barrier.`
      });
    }

    // Protocol 2: Brightening
    if (results.uv_damage > 40) {
      recommendations.push({
        id: "uv-02",
        title: "Vitamin C + Ferulic",
        category: "Brightening",
        reason: `Sub-surface melanin aggregations detected (${Math.round(results.uv_damage)}%). L-Ascorbic Acid neutralizes free radicals and inhibits tyrosinase synthesis.`
      });
    }

    // Protocol 3: Clarifying
    if (results.pore_density > 60) {
      recommendations.push({
        id: "pore-03",
        title: "Encapsulated BHA",
        category: "Clarifying",
        reason: `Follicular dilation density is elevated (${Math.round(results.pore_density)}%). Salicylic acid's lipophilic nature clears the sebaceous lining effectively.`
      });
    }

    // Protocol 4: Restorative
    if (results.wrinkle_index > 30) {
      recommendations.push({
        id: "wrk-04",
        title: "Multi-Peptide Complex",
        category: "Restorative",
        reason: `Structural line formations at ${Math.round(results.wrinkle_index)}% severity. Peptides selectively signal fibroblasts to up-regulate native collagen synthesis.`
      });
    }
    
    // Aesthetic Fallback
    if (recommendations.length === 0) {
      recommendations.push({
        id: "base-00",
        title: "Hydra-Silk Preservation",
        category: "Maintenance",
        reason: "All targeted structural markers exhibit extreme stability. Maintain the hydrolipid barrier with continuous ceramide reinforcement."
      });
    }

    return recommendations;
  };

  const protocol = getProtocol(metrics);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1.0] } 
    }
  };

  return (
    <div className="w-full mt-10 mb-8 px-4 lg:px-0">
      
      {/* Engine Title Block */}
      <div className="text-center mb-10 w-full">
        <h3 className="text-[2rem] leading-none font-serif font-bold text-charcoal tracking-tight">Your Personalized Protocol</h3>
        <div className="h-1 w-10 bg-[#006D77] mx-auto mt-5 rounded-full shadow-[0_0_10px_#006D77]"></div>
      </div>
      
      {/* Grid Expansion */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 w-full"
      >
        {protocol.map((rec) => (
          <motion.div 
            key={rec.id}
            variants={cardVariants}
            className="bg-[#F5F5DC] border border-[#006D77]/20 rounded-2xl p-7 flex flex-col justify-between shadow-[0_4px_25px_rgb(0,0,0,0.03)] hover:shadow-xl hover:border-[#006D77]/40 transition-all duration-300 relative overflow-hidden group"
          >
            {/* Subtle Gradient Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none group-hover:from-white/40 transition-colors"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-5">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#006D77] bg-[#006D77]/5 px-3 py-1.5 rounded-full border border-[#006D77]/10">
                  {rec.category}
                </span>
              </div>
              <h4 className="text-lg font-serif font-bold text-charcoal mb-4 leading-tight group-hover:text-[#006D77] transition-colors">{rec.title}</h4>
              <p className="text-xs font-medium text-charcoal/60 leading-relaxed mb-8">
                <span className="text-[#006D77] font-bold block mb-1.5 uppercase tracking-widest text-[9px] font-mono">Scientific Reason</span>
                {rec.reason}
              </p>
            </div>
            
            <button className="relative z-10 w-full py-3.5 bg-white border border-[#006D77]/20 text-[#006D77] rounded-xl text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-[#006D77] hover:border-[#006D77] hover:text-white transition-colors duration-300 shadow-sm active:scale-[0.98]">
              Buy at Clinic
            </button>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
