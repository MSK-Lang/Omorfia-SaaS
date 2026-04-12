"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, 
  Zap, 
  ShieldCheck, 
  Activity, 
  Sparkles,
  ArrowUpRight,
  Fingerprint,
  LineChart,
  Globe,
  Database,
  Layers,
  Cpu,
  Menu,
  X,
  Loader2
} from 'lucide-react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

export default function LandingPage() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  const handleNav = (href: string) => {
    setNavigatingTo(href);
    router.push(href);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-wheat text-charcoal font-sans selection:bg-teal selection:text-white">
      {/* 1. MINIMALIST NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 h-20 bg-wheat/40 backdrop-blur-md border-b border-stone/50 z-50 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-teal text-3xl font-bold tracking-tighter">Ω</span>
            <span className="font-semibold text-xl tracking-tight text-charcoal">Omorfia</span>
          </Link>
          <div className="hidden lg:flex items-center gap-10">
            <Link href="#platform" className="text-sm font-medium text-charcoal/60 hover:text-teal transition-colors">Platform</Link>
            <Link href="#markers" className="text-sm font-medium text-charcoal/60 hover:text-teal transition-colors">Bio-Markers</Link>
            <Link href="#contact" className="text-sm font-medium text-charcoal/60 hover:text-teal transition-colors">Contact</Link>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-8">
          <Link 
            href="/login" 
            onClick={() => handleNav('/login')}
            className="text-sm font-medium text-charcoal/60 hover:text-charcoal transition-colors flex items-center gap-2"
          >
            {navigatingTo === '/login' && <Loader2 size={14} className="animate-spin" />}
            Sign In
          </Link>
          <Link 
            href="/signup"
            onClick={() => handleNav('/signup')}
            className="bg-teal text-white px-7 py-2.5 rounded-full text-sm font-medium hover:bg-charcoal transition-all shadow-xl shadow-teal/10 flex items-center gap-2 min-w-[110px] justify-center"
          >
            {navigatingTo === '/signup' ? <Loader2 size={16} className="animate-spin" /> : "Sign Up"}
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden p-2 text-charcoal"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-20 left-0 right-0 bg-wheat border-b border-stone shadow-2xl p-8 flex flex-col gap-6 lg:hidden"
            >
              <Link 
                href="#platform" 
                onClick={() => setIsMenuOpen(false)}
                className="text-lg font-medium text-charcoal/60"
              >
                Platform
              </Link>
              <Link 
                href="#markers" 
                onClick={() => setIsMenuOpen(false)}
                className="text-lg font-medium text-charcoal/60"
              >
                Bio-Markers
              </Link>
              <Link 
                href="#contact" 
                onClick={() => setIsMenuOpen(false)}
                className="text-lg font-medium text-charcoal/60"
              >
                Contact
              </Link>
              <div className="h-[1px] bg-stone w-full my-2" />
              <Link 
                href="/login" 
                onClick={() => { setIsMenuOpen(false); handleNav('/login'); }} 
                className="text-lg font-medium text-charcoal/60 text-left flex items-center justify-between"
              >
                Sign In
                {navigatingTo === '/login' && <Loader2 size={18} className="animate-spin text-teal" />}
              </Link>
              <Link 
                href="/signup"
                onClick={() => { setIsMenuOpen(false); handleNav('/signup'); }}
                className="bg-teal text-white py-4 rounded-full text-center font-bold uppercase tracking-widest flex items-center justify-center gap-3"
              >
                {navigatingTo === '/signup' && <Loader2 size={18} className="animate-spin" />}
                Sign Up
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="pt-48 pb-32 px-6 md:px-12 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="space-y-10"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal/5 border border-teal/10 rounded-full">
            <Globe size={14} className="text-teal" />
            <span className="text-[9px] font-bold text-teal uppercase tracking-[0.2em]">Global AI Infrastructure</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-semibold tracking-tighter leading-[0.95]">
            Digital Skin <br />
            <span className="italic font-serif text-teal">Bio-markers.</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-xl text-charcoal/50 max-w-xl leading-relaxed font-medium">
            The integration-first platform for wellness diagnostics. An API-native SaaS designed to build longitudinal digital twins with heuristic precision.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center gap-8 pt-6">
            <Link 
              href="/signup" 
              onClick={() => handleNav('/signup')}
              className="group flex items-center gap-4 bg-charcoal text-white px-10 py-5 rounded-full text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-teal transition-all shadow-2xl shadow-charcoal/20 min-w-[200px] justify-center"
            >
              {navigatingTo === '/signup' ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>Platform Demo <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </Link>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono font-bold text-teal tracking-widest uppercase mb-1">Status: Production</span>
              <span className="text-[10px] font-mono text-charcoal/30 tracking-widest uppercase">Nodes: Global_v2.4</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Hero Mockup */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="relative rounded-[2.5rem] overflow-hidden border border-stone bg-white p-3 shadow-[0_40px_100px_-20px_rgba(20,27,38,0.15)]">
            <div className="aspect-[16/10] bg-stone/20 rounded-[2rem] overflow-hidden relative group">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80')] bg-cover bg-center grayscale-[5%] opacity-90 contrast-[1.05]" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent" />

              {/* HUD Overlay */}
              <div className="absolute top-8 left-8 flex flex-col gap-3">
                <div className="px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/10 text-[10px] font-mono text-white tracking-widest uppercase shadow-lg">
                  Bio_Status: Active
                </div>
                <div className="px-4 py-2 bg-teal/80 backdrop-blur-xl rounded-full text-[10px] font-mono text-white tracking-widest uppercase shadow-lg shadow-teal/20">
                  CV_ENGINE: OPTIMAL
                </div>
              </div>
              
              <div className="absolute bottom-8 left-8">
                <div className="text-[11px] text-white/60 select-none">
                  <InlineMath math="L(x,y) = \nabla^2 I" />
                </div>
              </div>

              <motion.div 
                animate={{ top: ["0%", "100%"] }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-[2px] bg-teal/60 z-10 shadow-[0_0_20px_rgba(0,109,119,0.5)]"
              />
            </div>
          </div>
          
          <motion.div 
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-12 -left-12 bg-white p-8 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-stone w-72 space-y-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-[0.2em]">Bio-Marker: Stability</span>
              <Activity size={16} className="text-teal" />
            </div>
            <div className="h-1.5 w-full bg-stone/30 rounded-full overflow-hidden">
              <div className="h-full w-[84%] bg-teal shadow-[0_0_10px_rgba(0,109,119,0.3)]" />
            </div>
            <div className="flex justify-between items-end">
              <span className="text-3xl font-mono font-bold text-charcoal tracking-tighter">84.2%</span>
              <span className="text-[10px] font-mono font-bold text-teal uppercase tracking-widest">Digital_Twin: Sync</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 3. PLATFORM FLOW SECTION */}
      <section id="platform" className="py-40 px-6 md:px-12 bg-white/40 backdrop-blur-md border-y border-stone relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto space-y-24">
          <div className="text-center space-y-6 max-w-2xl mx-auto">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-teal">Heuristic Architecture</h2>
            <h3 className="text-5xl font-semibold tracking-tight">The Integration-First Flow</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
            {/* Step 01 */}
            <div className="space-y-8 relative">
              <div className="text-[10px] font-mono font-bold text-stone-300 uppercase tracking-widest">Step 01</div>
              <div className="space-y-4">
                <h4 className="text-2xl font-semibold tracking-tight">Capture</h4>
                <p className="text-charcoal/50 text-sm leading-relaxed">
                  High-resolution image acquisition via any web or mobile interface. Platform-agnostic data intake with real-time normalization.
                </p>
              </div>
            </div>

            {/* Step 02 */}
            <div className="space-y-8 relative">
              <div className="text-[10px] font-mono font-bold text-teal/40 uppercase tracking-widest">Step 02</div>
              <div className="space-y-4">
                <h4 className="text-2xl font-semibold tracking-tight">Analysis</h4>
                <p className="text-charcoal/50 text-sm leading-relaxed">
                  Real-time processing via our OpenCV Heuristic Engine. Deterministic evaluation of epidermal stability and bio-marker variance.
                </p>
                <div className="pt-2">
                  <InlineMath math="L(x,y) = \nabla^2 I" />
                </div>
              </div>
            </div>

            {/* Step 03 */}
            <div className="space-y-8 relative">
              <div className="text-[10px] font-mono font-bold text-stone-300 uppercase tracking-widest">Step 03</div>
              <div className="space-y-4">
                <h4 className="text-2xl font-semibold tracking-tight">Action</h4>
                <p className="text-charcoal/50 text-sm leading-relaxed">
                  Instant wellness recommendations and 'Beauty Passport' synchronization. Longitudinal digital twin updates with zero latency.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ENTERPRISE FEATURES */}
      <section id="markers" className="py-48 px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
          <div className="space-y-16">
            <div className="space-y-6">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-teal">Platform Capabilities</h2>
              <h3 className="text-5xl font-semibold tracking-tighter leading-tight">
                Infrastructure Built for <br />
                Global Scalability.
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={20} className="text-teal" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Enterprise Security</span>
                </div>
                <p className="text-charcoal/50 text-sm leading-relaxed">
                  Enterprise-Grade Data Isolation via Row-Level Security (RLS). HIPAA-compliant bio-storage protocols.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Layers size={20} className="text-teal" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest">15+ Bio-markers</span>
                </div>
                <p className="text-charcoal/50 text-sm leading-relaxed">
                  Real-time analysis of Texture Stability, Pore Density, and Inflammation Index using heuristic heuristics.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Database size={20} className="text-teal" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest">API-First SaaS</span>
                </div>
                <p className="text-charcoal/50 text-sm leading-relaxed">
                  Headless diagnostic engine designed for seamless integration into existing POS and CRM wellness stacks.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Cpu size={20} className="text-teal" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Cloud-Native Core</span>
                </div>
                <p className="text-charcoal/50 text-sm leading-relaxed">
                  Deterministic analysis executed on edge nodes for sub-second global inference latency.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-charcoal rounded-[3rem] p-20 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 group-hover:opacity-15 transition-opacity">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal via-transparent to-transparent" />
              </div>
              <div className="relative z-10 flex flex-col items-center text-center space-y-12">
                <div className="text-white/40 text-[10px] font-mono tracking-[0.4em] uppercase">Digital Twin Engine</div>
                <div className="text-4xl md:text-6xl font-mono text-teal tracking-tighter select-none">
                  <BlockMath math="L(x,y) = \frac{\partial^2 I}{\partial x^2} + \frac{\partial^2 I}{\partial y^2}" />
                </div>
                <div className="space-y-2">
                  <p className="text-white/30 text-[9px] uppercase tracking-[0.4em] font-medium">Omorfia_Platform_v1.0</p>
                  <p className="text-teal/40 text-[9px] uppercase font-mono tracking-widest">Inference: Stable // Heuristic: Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DUAL GATEWAY (INSTITUTIONAL STYLE) */}
      <section className="py-40 px-6 md:px-12 max-w-[1400px] mx-auto bg-stone/10 rounded-[3rem] border border-stone/30">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Card 1: Clinics */}
          <div className="bg-white rounded-[2rem] p-16 border-[0.5px] border-stone flex flex-col justify-between group h-[520px] relative">
            <div className="space-y-10 relative z-10">
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 rounded-2xl bg-teal/5 flex items-center justify-center">
                  <Layers size={24} className="text-teal" />
                </div>
                <span className="text-[9px] font-mono text-stone-300 font-bold uppercase tracking-[0.3em]">Portal_01</span>
              </div>
              <div className="space-y-4">
                <h3 className="text-4xl font-semibold tracking-tight">Clinic <br /><span className="text-teal italic font-serif">Intelligence.</span></h3>
                <p className="text-charcoal/50 text-sm leading-relaxed max-w-sm">
                  Maximize AOV via automated wellness diagnostics. Platform-integrated protocol synchronization for enterprise scale.
                </p>
              </div>
            </div>
            <div className="space-y-8 relative z-10">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 text-[9px] font-mono font-bold uppercase tracking-widest text-charcoal/30">
                  <span className="w-1 h-1 rounded-full bg-teal" />
                  AOV Optimization: Active
                </div>
                <div className="flex items-center gap-3 text-[9px] font-mono font-bold uppercase tracking-widest text-charcoal/30">
                  <span className="w-1 h-1 rounded-full bg-teal" />
                  Multi-tenant Isolation: RLS
                </div>
              </div>
              <Link 
                href="/login" 
                onClick={() => handleNav('/login')}
                className="w-full flex items-center justify-center py-5 bg-charcoal text-white rounded-full text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-teal transition-all shadow-xl shadow-charcoal/10 gap-3"
              >
                {navigatingTo === '/login' && <Loader2 size={16} className="animate-spin text-teal" />}
                Clinic Portal Login
              </Link>
            </div>
          </div>

          {/* Card 2: Customers */}
          <div className="bg-white rounded-[2rem] p-16 border-[0.5px] border-stone flex flex-col justify-between group h-[520px] relative">
            <div className="space-y-10 relative z-10">
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 rounded-2xl bg-teal/5 flex items-center justify-center">
                  <Fingerprint size={24} className="text-teal" />
                </div>
                <span className="text-[9px] font-mono text-stone-300 font-bold uppercase tracking-[0.3em]">Portal_02</span>
              </div>
              <div className="space-y-4">
                <h3 className="text-4xl font-semibold tracking-tight">Beauty <br /><span className="text-teal italic font-serif">Passport.</span></h3>
                <p className="text-charcoal/50 text-sm leading-relaxed max-w-sm">
                  Longitudinal Digital Twin tracking for personalized wellness journeys. Secure access to heuristic bio-marker history.
                </p>
              </div>
            </div>
            <div className="space-y-8 relative z-10">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 text-[9px] font-mono font-bold uppercase tracking-widest text-charcoal/30">
                  <span className="w-1 h-1 rounded-full bg-teal" />
                  Twin Sync: Real-time
                </div>
                <div className="flex items-center gap-3 text-[9px] font-mono font-bold uppercase tracking-widest text-charcoal/30">
                  <span className="w-1 h-1 rounded-full bg-teal" />
                  Data Privacy: Tier-0
                </div>
              </div>
              <Link 
                href="/customer-login" 
                onClick={() => handleNav('/customer-login')}
                className="w-full flex items-center justify-center py-5 bg-charcoal text-white rounded-full text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-teal transition-all shadow-xl shadow-charcoal/10 gap-3"
              >
                {navigatingTo === '/customer-login' && <Loader2 size={16} className="animate-spin text-teal" />}
                Customer Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CONTACT SECTION (GLOBAL NATIVE) */}
      <section id="contact" className="py-48 px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-32">
          <div className="space-y-10">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-teal">Integration Inquiries</h2>
            <h3 className="text-5xl font-semibold tracking-tight leading-tight">Connect with the <br />Omorfia Infrastructure.</h3>
            <p className="text-charcoal/50 text-lg leading-relaxed max-w-sm font-medium">
              Scaling wellness diagnostics globally. Our platform team is standing by for API integration and enterprise onboarding.
            </p>
          </div>

          <form className="space-y-8 bg-white p-12 rounded-[2.5rem] border border-stone shadow-2xl shadow-stone/20">
            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-[0.2em]">Platform ID / Business Name</label>
                <input type="text" className="w-full bg-wheat/30 border border-stone/50 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-teal transition-colors" placeholder="Enterprise_Node_01" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-[0.2em]">Contact Node / Email</label>
                <input type="email" className="w-full bg-wheat/30 border border-stone/50 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-teal transition-colors" placeholder="admin@omorfia.global" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-[0.2em]">Inquiry Context</label>
                <textarea rows={4} className="w-full bg-wheat/30 border border-stone/50 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-teal transition-colors" placeholder="Describe your integration requirements..." />
              </div>
            </div>
            <button className="w-full py-5 bg-charcoal text-white rounded-full text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-teal transition-all shadow-2xl shadow-charcoal/10">
              Synchronize Request
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-24 px-6 md:px-12 max-w-[1400px] mx-auto border-t border-stone">
        <div className="flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="font-serif text-teal text-4xl font-bold tracking-tighter">Ω</div>
          <div className="flex gap-16">
            <Link href="#" className="text-[10px] font-mono font-bold uppercase tracking-widest text-charcoal/30 hover:text-charcoal transition-colors">Privacy Protocol</Link>
            <Link href="#" className="text-[10px] font-mono font-bold uppercase tracking-widest text-charcoal/30 hover:text-charcoal transition-colors">Terms of Service</Link>
            <Link href="#" className="text-[10px] font-mono font-bold uppercase tracking-widest text-charcoal/30 hover:text-charcoal transition-colors">Integration Support</Link>
          </div>
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-stone-700">© 2026 Omorfia Infrastructure. Cloud-Native Core.</p>
        </div>
      </footer>
    </div>
  );
}
