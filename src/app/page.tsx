"use client";

import React, { useState, useEffect } from "react";
import { ImportForm, type ImportFormData } from "@/components/calculator/import-form";
import { ResultsDisplay } from "@/components/calculator/results-display";
import { calculateImportBreakdown, type ImportBreakdown } from "@/lib/calculator-utils";
import { Globe, TrendingUp, Ship, Plane, Package, BarChart3, Shield, Zap, ArrowRight, Anchor, FileText, DollarSign, MapPin, Boxes, Truck, Container } from "lucide-react";

function RateTicker() {
  const [rates, setRates] = useState<{ usd: number; cny: number }>({ usd: 1430, cny: 0 });

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
    { label: "USD BLUE", value: `$${rates.usd}`, color: "text-orange-400" },
    { label: "DIE EXTRAZONA", value: "0-35%", color: "text-blue-300" },
    { label: "IVA ADUANA", value: "10.5-21%", color: "text-orange-300" },
    { label: "TASA ESTADISTICA", value: "0-3%", color: "text-slate-400" },
    { label: "ENVIO COURIER", value: "~$13/KG", color: "text-blue-300" },
  ];

  return (
    <div className="bg-slate-950 text-white overflow-hidden border-b border-orange-900/30">
      <div className="ticker-bar py-2.5">
        <div className="ticker-content">
          {[...items, ...items, ...items].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs px-5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-slate-500 font-bold tracking-widest text-[10px]">{item.label}</span>
              <span className={`font-black font-mono ${item.color}`}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SupplyChainGraphic() {
  return (
    <div className="relative w-full h-80 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700">
      {/* Grid pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="logiGrid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#f97316" strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#logiGrid)" />
      </svg>

      {/* World map outline - simplified */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 400 200" fill="none">
        <ellipse cx="200" cy="100" rx="180" ry="85" stroke="#f97316" strokeWidth="0.5" strokeDasharray="4 6" />
        <ellipse cx="200" cy="100" rx="130" ry="60" stroke="#3b82f6" strokeWidth="0.3" strokeDasharray="3 5" />
        <ellipse cx="200" cy="100" rx="80" ry="35" stroke="#f97316" strokeWidth="0.3" strokeDasharray="2 4" />
        {/* Meridians */}
        <line x1="200" y1="15" x2="200" y2="185" stroke="#f97316" strokeWidth="0.2" strokeDasharray="2 4" />
        <line x1="100" y1="25" x2="100" y2="175" stroke="#3b82f6" strokeWidth="0.2" strokeDasharray="2 4" />
        <line x1="300" y1="25" x2="300" y2="175" stroke="#3b82f6" strokeWidth="0.2" strokeDasharray="2 4" />
      </svg>

      {/* Route line - China to Argentina */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200">
        <path
          d="M 320 55 Q 250 30 180 60 Q 110 90 60 140"
          stroke="#f97316"
          strokeWidth="2"
          strokeDasharray="8 6"
          fill="none"
          opacity="0.4"
          className="animate-dash"
        />
        {/* Origin dot */}
        <circle cx="320" cy="55" r="5" fill="#f97316" opacity="0.6" />
        <circle cx="320" cy="55" r="10" fill="none" stroke="#f97316" strokeWidth="1" opacity="0.2">
          <animate attributeName="r" from="5" to="15" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
        </circle>
        {/* Destination dot */}
        <circle cx="60" cy="140" r="5" fill="#3b82f6" opacity="0.6" />
        <circle cx="60" cy="140" r="10" fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.2">
          <animate attributeName="r" from="5" to="15" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>

      {/* Ship */}
      <div className="absolute bottom-20 left-[15%] animate-ship">
        <svg width="90" height="45" viewBox="0 0 90 45" fill="none">
          <path d="M8 35 L15 18 L75 18 L82 35 Z" fill="#f97316" opacity="0.15" />
          <path d="M12 35 L18 20 L72 20 L78 35 Z" fill="#f97316" opacity="0.25" />
          <rect x="35" y="10" width="4" height="16" fill="#f97316" opacity="0.3" />
          <rect x="40" y="5" width="14" height="10" rx="1" fill="#f97316" opacity="0.2" />
          <rect x="20" y="20" width="10" height="6" rx="0.5" fill="#3b82f6" opacity="0.5" />
          <rect x="32" y="20" width="10" height="6" rx="0.5" fill="#f97316" opacity="0.5" />
          <rect x="44" y="20" width="10" height="6" rx="0.5" fill="#10b981" opacity="0.5" />
          <rect x="56" y="20" width="10" height="6" rx="0.5" fill="#f59e0b" opacity="0.5" />
        </svg>
      </div>

      {/* Plane */}
      <div className="absolute top-10 right-[20%] animate-plane">
        <svg width="55" height="26" viewBox="0 0 55 26" fill="none">
          <path d="M6 13 L15 8 L48 11 L52 13 L48 15 L15 18 Z" fill="#f97316" opacity="0.3" />
          <path d="M22 8 L27 2 L30 8" fill="#f97316" opacity="0.2" />
          <path d="M38 15 L41 22 L43 15" fill="#f97316" opacity="0.2" />
        </svg>
      </div>

      {/* Containers stack */}
      <div className="absolute bottom-8 right-[15%]">
        <svg width="60" height="50" viewBox="0 0 60 50" fill="none">
          <rect x="0" y="25" width="28" height="16" rx="1" fill="#3b82f6" opacity="0.3" stroke="#3b82f6" strokeWidth="0.5" opacity="0.4" />
          <rect x="30" y="25" width="28" height="16" rx="1" fill="#f97316" opacity="0.3" stroke="#f97316" strokeWidth="0.5" opacity="0.4" />
          <rect x="8" y="8" width="28" height="16" rx="1" fill="#10b981" opacity="0.3" stroke="#10b981" strokeWidth="0.5" opacity="0.4" />
          <rect x="38" y="8" width="20" height="16" rx="1" fill="#f59e0b" opacity="0.3" stroke="#f59e0b" strokeWidth="0.5" opacity="0.4" />
        </svg>
      </div>

      {/* Location labels */}
      <div className="absolute top-8 right-[12%] flex items-center gap-1.5 bg-orange-500/20 border border-orange-500/30 px-2.5 py-1 rounded-md">
        <MapPin className="w-3 h-3 text-orange-400" />
        <span className="text-[10px] font-black text-orange-400 tracking-wider">CHINA</span>
      </div>
      <div className="absolute bottom-28 left-[8%] flex items-center gap-1.5 bg-blue-500/20 border border-blue-500/30 px-2.5 py-1 rounded-md">
        <MapPin className="w-3 h-3 text-blue-400" />
        <span className="text-[10px] font-black text-blue-400 tracking-wider">ARGENTINA</span>
      </div>

      {/* Stats overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-lg px-4 py-2">
        <div className="text-center">
          <p className="text-[8px] text-slate-500 font-bold tracking-wider">TRANSITO</p>
          <p className="text-xs font-black text-orange-400">15-20 DIAS</p>
        </div>
        <div className="w-px h-6 bg-slate-700" />
        <div className="text-center">
          <p className="text-[8px] text-slate-500 font-bold tracking-wider">PESO MAX</p>
          <p className="text-xs font-black text-blue-400">70 KG</p>
        </div>
        <div className="w-px h-6 bg-slate-700" />
        <div className="text-center">
          <p className="text-[8px] text-slate-500 font-bold tracking-wider">INCOTERM</p>
          <p className="text-xs font-black text-orange-400">DDP</p>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
  return (
    <div className="group flex items-center gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300 hover:-translate-y-0.5">
      <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
        <Icon className="w-5 h-5 text-orange-400" />
      </div>
      <div>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{label}</p>
        <p className="text-sm font-black text-white">{value}</p>
        {sub && <p className="text-[9px] text-slate-500 mt-0.5">{sub}</p>}
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
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Grain overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Live Rate Ticker */}
      <RateTicker />

      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Truck className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-base font-black text-white tracking-tight leading-none">ImportFlow</h1>
              <p className="text-[9px] text-orange-400 tracking-widest uppercase font-bold">Supply Chain Tools</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold tracking-wide text-slate-400">
            <span className="text-orange-400">CALCULADORA</span>
            <a href="/ncm" className="hover:text-orange-400 transition-colors">CODIGOS NCM</a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        {!calculation && (
          <section className="pt-10 pb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-black uppercase tracking-widest">
                  <Zap className="w-3 h-3" />
                  HERRAMIENTA PROFESIONAL
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.05]">
                  Calcula el costo real
                  <br />
                  <span className="text-orange-400">
                    de importar desde China
                  </span>
                </h2>
                <p className="text-base text-slate-400 leading-relaxed max-w-lg">
                  Simula aranceles, flete, impuestos y margen de venta en Mercado Libre.
                  Control total de tu cadena de suministro con asistente IA.
                </p>
                <div className="flex items-center gap-4 pt-2">
                  {[
                    { icon: Shield, label: "AFIP", color: "text-blue-400" },
                    { icon: Ship, label: "DHL", color: "text-orange-400" },
                    { icon: Package, label: "NCM", color: "text-emerald-400" },
                    { icon: BarChart3, label: "ML", color: "text-violet-400" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-md px-2.5 py-1.5">
                      <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                      <span className="text-[10px] font-black text-slate-300 tracking-wider">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="hidden lg:block">
                <SupplyChainGraphic />
              </div>
            </div>

            {/* Mini stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
              <MiniStat icon={Shield} label="Aranceles" value="AFIP/VUCE" sub="Datos oficiales" />
              <MiniStat icon={Ship} label="Flete" value="Courier DHL" sub="Desde China" />
              <MiniStat icon={BarChart3} label="Simulacion" value="ML Full" sub="Margen real" />
              <MiniStat icon={Package} label="NCM" value="27+ codigos" sub="Base local + IA" />
            </div>
          </section>
        )}

        {/* Calculator */}
        <section className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-start ${calculation ? 'pt-8' : 'pt-8'} pb-16`}>
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
              <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-900 rounded-2xl border border-dashed border-slate-700 text-center space-y-5">
                <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <Boxes className="w-10 h-10 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-500 tracking-wide">ESPERANDO DATOS</h3>
                  <p className="text-xs text-slate-600 max-w-[220px] mt-2 leading-relaxed">
                    Completa el formulario para ver el desglose de costos y el analisis de rentabilidad
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Features */}
        {!calculation && (
          <section className="pb-20">
            <div className="text-center mb-10">
              <p className="text-[10px] text-orange-400 font-black tracking-widest uppercase mb-2">CAPACIDADES</p>
              <h3 className="text-2xl font-black tracking-tight">Todo lo que necesitas</h3>
              <p className="text-sm text-slate-500 mt-2">Herramientas profesionales para tu negocio de importacion</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  icon: Shield,
                  title: "CONFIABLE",
                  desc: "Algoritmos actualizados para IVA, DIE y tasa estadistica segun normativa AFIP. Datos verificados contra VUCE.",
                  borderColor: "border-blue-800/30 hover:border-blue-500/40",
                  iconColor: "text-blue-400",
                  iconBg: "bg-blue-500/10 border-blue-500/20",
                },
                {
                  icon: Globe,
                  title: "GLOBAL",
                  desc: "Compatible con el Sistema Armonizado (HS) utilizado por mas de 200 paises. Asistente IA para clasificacion NCM.",
                  borderColor: "border-orange-800/30 hover:border-orange-500/40",
                  iconColor: "text-orange-400",
                  iconBg: "bg-orange-500/10 border-orange-500/20",
                },
                {
                  icon: BarChart3,
                  title: "TRANSPARENTE",
                  desc: "Ves exactamente de donde viene cada centavo de tu costo de adquisicion. Desglose visual con graficos.",
                  borderColor: "border-emerald-800/30 hover:border-emerald-500/40",
                  iconColor: "text-emerald-400",
                  iconBg: "bg-emerald-500/10 border-emerald-500/20",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className={`group p-6 bg-slate-900 rounded-2xl border ${feature.borderColor} hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 hover:-translate-y-1`}
                >
                  <div className={`w-12 h-12 rounded-xl ${feature.iconBg} border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>
                  <h4 className="font-black text-sm tracking-wider mb-2">{feature.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>

            {/* Process steps */}
            <div className="mt-16 bg-slate-900 rounded-2xl border border-slate-800 p-8">
              <div className="text-center mb-8">
                <p className="text-[10px] text-orange-400 font-black tracking-widest uppercase mb-2">PROCESO</p>
                <h3 className="text-lg font-black tracking-tight">Como funciona</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { step: "01", icon: FileText, title: "DESCRIBE", desc: "Tu producto y la IA busca el NCM y las tasas correctas" },
                  { step: "02", icon: DollarSign, title: "INGRESA", desc: "Precio en yuanes, peso y tarifa de flete" },
                  { step: "03", icon: Anchor, title: "CALCULA", desc: "Aranceles, impuestos y costos logisticos" },
                  { step: "04", icon: TrendingUp, title: "ANALIZA", desc: "Margen real vendiendo en Mercado Libre" },
                ].map((item, i) => (
                  <div key={i} className="text-center space-y-3 relative">
                    <div className="text-4xl font-black text-orange-500/10">{item.step}</div>
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto">
                      <item.icon className="w-5 h-5 text-orange-400" />
                    </div>
                    <h4 className="font-black text-xs tracking-widest">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
                    {i < 3 && (
                      <div className="hidden md:flex absolute top-12 -right-3 items-center">
                        <ArrowRight className="w-4 h-4 text-slate-700" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Truck className="w-5 h-5 text-orange-400" />
            <span className="font-black text-white text-lg tracking-tight">ImportFlow</span>
          </div>
          <p className="text-xs text-slate-500">
            Creado por <span className="font-bold text-orange-400">ElecNeo</span>
          </p>
          <p className="text-[10px] text-slate-600 mt-2 tracking-wider">
            HERRAMIENTA DE SIMULACION LOGISTICA
          </p>
        </div>
      </footer>
    </div>
  );
}
