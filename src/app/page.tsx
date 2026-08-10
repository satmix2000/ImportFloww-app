"use client";

import React, { useState, useEffect } from "react";
import { ImportForm, type ImportFormData } from "@/components/calculator/import-form";
import { ResultsDisplay } from "@/components/calculator/results-display";
import { calculateImportBreakdown, type ImportBreakdown } from "@/lib/calculator-utils";
import { Globe, TrendingUp, Ship, Plane, Package, ArrowRight, Anchor, Container, BarChart3, Shield, Zap } from "lucide-react";

function RateTicker() {
  const [rates, setRates] = useState<{ usd: number; cny: number }>({ usd: 1100, cny: 0 });

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch("https://dolarapi.com/v1/dolares/blue");
        const data = await res.json();
        if (data?.venta) setRates(prev => ({ ...prev, usd: Math.round(data.venta) }));
      } catch {}
    };
    fetchRates();
    const interval = setInterval(fetchRates, 60000);
    return () => clearInterval(interval);
  }, []);

  const items = [
    { label: "USD Blue", value: `$${rates.usd}`, color: "text-emerald-600" },
    { label: "DIE Extrazona", value: "0-35%", color: "text-blue-600" },
    { label: "IVA Aduana", value: "21%", color: "text-amber-600" },
    { label: "Tasa Estadística", value: "3%", color: "text-slate-500" },
    { label: "Envío Courier", value: "~$14.50/kg", color: "text-blue-600" },
  ];

  return (
    <div className="bg-slate-900 text-white overflow-hidden">
      <div className="ticker-bar py-2">
        <div className="ticker-content">
          {[...items, ...items].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
              <span className="text-slate-400 font-medium">{item.label}</span>
              <span className={`font-bold font-mono-nums ${item.color}`}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ImportGraphic() {
  return (
    <div className="relative w-full h-48 md:h-64 overflow-hidden">
      {/* Water/ocean background */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-blue-100/60 to-transparent" />
      
      {/* Ship */}
      <div className="absolute bottom-12 left-[10%] animate-ship">
        <svg width="80" height="40" viewBox="0 0 80 40" fill="none" className="text-slate-600">
          <path d="M5 30 L15 15 L65 15 L75 30 Z" fill="currentColor" opacity="0.15" />
          <path d="M10 30 L20 18 L60 18 L70 30 Z" fill="currentColor" opacity="0.25" />
          <rect x="30" y="10" width="3" height="20" fill="currentColor" opacity="0.3" />
          <rect x="35" y="5" width="12" height="15" fill="currentColor" opacity="0.2" />
          {/* Containers */}
          <rect x="22" y="16" width="8" height="5" rx="0.5" fill="#3b82f6" opacity="0.6" />
          <rect x="32" y="16" width="8" height="5" rx="0.5" fill="#f59e0b" opacity="0.6" />
          <rect x="42" y="16" width="8" height="5" rx="0.5" fill="#10b981" opacity="0.6" />
          <rect x="52" y="16" width="8" height="5" rx="0.5" fill="#8b5cf6" opacity="0.6" />
        </svg>
      </div>

      {/* Plane */}
      <div className="absolute top-6 right-[15%] animate-plane">
        <svg width="50" height="24" viewBox="0 0 50 24" fill="none" className="text-slate-500">
          <path d="M5 12 L15 8 L45 10 L48 12 L45 14 L15 16 Z" fill="currentColor" opacity="0.2" />
          <path d="M20 8 L25 2 L28 8" fill="currentColor" opacity="0.15" />
          <path d="M35 14 L38 20 L40 14" fill="currentColor" opacity="0.15" />
          {/* Trail */}
          <line x1="0" y1="12" x2="5" y2="12" stroke="currentColor" strokeWidth="0.5" opacity="0.1" strokeDasharray="2 2" />
        </svg>
      </div>

      {/* Container */}
      <div className="absolute bottom-8 right-[30%] animate-container">
        <svg width="36" height="24" viewBox="0 0 36 24" fill="none">
          <rect x="2" y="4" width="32" height="16" rx="1" fill="#3b82f6" opacity="0.3" />
          <rect x="2" y="4" width="32" height="16" rx="1" stroke="#3b82f6" strokeWidth="0.5" opacity="0.4" />
          {/* Ribs */}
          <line x1="10" y1="4" x2="10" y2="20" stroke="#3b82f6" strokeWidth="0.3" opacity="0.3" />
          <line x1="18" y1="4" x2="18" y2="20" stroke="#3b82f6" strokeWidth="0.3" opacity="0.3" />
          <line x1="26" y1="4" x2="26" y2="20" stroke="#3b82f6" strokeWidth="0.3" opacity="0.3" />
        </svg>
      </div>

      {/* Globe */}
      <div className="absolute top-8 left-[20%] animate-float opacity-20">
        <Globe className="w-16 h-16 text-blue-400" strokeWidth={0.8} />
      </div>

      {/* Dotted route line */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <path
          d="M 80% 25% Q 50% 10% 20% 60%"
          stroke="hsl(var(--primary))"
          strokeWidth="1"
          strokeDasharray="4 6"
          fill="none"
          opacity="0.15"
        />
      </svg>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-100 shadow-sm">
      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
        <p className="text-sm font-bold font-mono-nums">{value}</p>
        {sub && <p className="text-[9px] text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

export default function Home() {
  const [calculation, setCalculation] = useState<{
    formData: ImportFormData;
    breakdown: ImportBreakdown;
  } | null>(null);

  const handleCalculate = (data: ImportFormData & { metricasML?: any }) => {
    const breakdown = calculateImportBreakdown(data);
    setCalculation({ formData: data, breakdown });
    
    if (window.innerWidth < 768) {
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Live Rate Ticker */}
      <RateTicker />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/20">
              <TrendingUp className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-primary tracking-tight leading-none">ImportFlow</h1>
              <p className="text-[9px] text-muted-foreground tracking-wider uppercase">by ElecNeo</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-muted-foreground">
            <span className="text-primary">Calculadora</span>
            <a href="/ncm" className="hover:text-primary transition-colors">Códigos NCM</a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        {!calculation && (
          <section className="pt-8 pb-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4 animate-slide-in-up">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                  <Zap className="w-3 h-3" />
                  Calculadora Profesional
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-[1.1]">
                  Calculá el costo real de
                  <br />
                  <span className="text-gradient">importar desde China</span>
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                  Simulá aranceles, flete, impuestos y margen de venta en Mercado Libre.
                  Todo en una sola herramienta con asistente IA.
                </p>
              </div>
              <div className="hidden lg:block animate-fade-in">
                <ImportGraphic />
              </div>
            </div>

            {/* Mini stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 animate-slide-in-up" style={{ animationDelay: "0.2s" }}>
              <MiniStat icon={Shield} label="Aranceles" value="AFIP/VUCE" sub="Datos oficiales" />
              <MiniStat icon={Ship} label="Flete" value="Courier" sub="Desde China" />
              <MiniStat icon={BarChart3} label="Simulación" value="ML Full" sub="Margen real" />
              <MiniStat icon={Package} label="NCM" value="27+ códigos" sub="Base local" />
            </div>
          </section>
        )}

        {/* Calculator */}
        <section className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-start ${calculation ? 'pt-8' : 'pt-6'} pb-12`}>
          <div className="lg:col-span-7">
            <ImportForm onCalculate={handleCalculate} />
          </div>
          
          <div id="results-section" className="lg:col-span-5">
            {calculation ? (
              <ResultsDisplay 
                formData={calculation.formData} 
                breakdown={calculation.breakdown} 
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-10 bg-white rounded-xl border border-dashed border-slate-200 text-center space-y-4 animate-slide-in-right">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center">
                  <Globe className="w-8 h-8 text-slate-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-500">Esperando datos</h3>
                  <p className="text-xs text-muted-foreground max-w-[200px] mt-1">
                    Completá el formulario para ver el desglose de costos
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Features */}
        {!calculation && (
          <section className="pb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  icon: Shield,
                  title: "Confiable",
                  desc: "Algoritmos actualizados para IVA, DIE y tasa estadística según normativa AFIP.",
                  color: "bg-blue-50 text-blue-600",
                  borderColor: "border-blue-100",
                },
                {
                  icon: Ship,
                  title: "Global",
                  desc: "Compatible con el Sistema Armonizado (HS) utilizado por más de 200 países.",
                  color: "bg-emerald-50 text-emerald-600",
                  borderColor: "border-emerald-100",
                },
                {
                  icon: BarChart3,
                  title: "Transparente",
                  desc: "Vé exactamente de dónde viene cada centavo de tu costo de adquisición.",
                  color: "bg-amber-50 text-amber-600",
                  borderColor: "border-amber-100",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className={`group p-5 bg-white rounded-xl border ${feature.borderColor} hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className={`w-10 h-10 rounded-lg ${feature.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm mb-1.5">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="font-extrabold text-primary text-sm tracking-tight">ImportFlow</span>
          </div>
          <p className="text-xs text-slate-500">
            Creado por <span className="font-semibold text-primary">ElecNeo</span> · G.O.B.
          </p>
          <p className="text-[10px] text-slate-400 mt-2">
            © {new Date().getFullYear()} ImportFlow Solutions · Herramienta de simulación logística
          </p>
        </div>
      </footer>
    </div>
  );
}
