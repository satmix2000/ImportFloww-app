"use client";

import { MLSettingsPanel } from "@/components/calculator/ml-settings-panel";
import React, { useState, useEffect } from "react";
import { ImportForm, type ImportFormData } from "@/components/calculator/import-form";
import { ResultsDisplay } from "@/components/calculator/results-display";
import { calculateImportBreakdown, type ImportBreakdown } from "@/lib/calculator-utils";
import { Globe, TrendingUp, Ship, Package, BarChart3, Shield, Zap, ArrowRight, Anchor, FileText, DollarSign, MapPin, Boxes, Truck } from "lucide-react";

function RateTicker() {
  const [rates, setRates] = useState<{ usd: number; cny: number }>({ usd: 0, cny: 0 });

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
    { label: "USD BLUE", value: rates.usd ? `$${rates.usd}` : "...", labelColor: "#0e7490", valueColor: "#facc15" },
    { label: "DIE EXTRAZONA", value: "0-35%", labelColor: "#0e7490", valueColor: "#22d3ee" },
    { label: "IVA ADUANA", value: "10.5-21%", labelColor: "#0e7490", valueColor: "#22d3ee" },
    { label: "TASA ESTADISTICA", value: "0-3%", labelColor: "#0e7490", valueColor: "#22d3ee" },
    { label: "ENVIO COURIER", value: "~$11.2/KG", labelColor: "#0e7490", valueColor: "#facc15" },
  ];

  return (
    <div className="ticker-bar">
      <div className="ticker-content">
        {items.length > 0 && [
          ...Array(3).fill(0).flatMap((_, repetition) =>
            items.map((item, idx) => ({
              ...item,
              key: `${item.label}-${repetition}-${idx}`,
            }))
          )
        ].map(({ key, ...item }) => (
          <div key={key} className="ticker-item">
            <span className="ticker-dot" />
            <span className="ticker-label" style={{ color: item.labelColor }}>{item.label}</span>
            <span className="ticker-value" style={{ color: item.valueColor }}>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SupplyChainGraphic() {
  return (
    <div className="relative w-full h-80 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-blue-50/30 to-white border border-slate-200 shadow-lg">
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="ediGrid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e3a5f" strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ediGrid)" />
      </svg>
      <svg className="absolute inset-0 w-full h-full opacity-[0.05]" viewBox="0 0 400 200" fill="none">
        <ellipse cx="200" cy="100" rx="180" ry="85" stroke="#1e3a5f" strokeWidth="0.5" strokeDasharray="4 6" />
        <ellipse cx="200" cy="100" rx="130" ry="60" stroke="#1e3a5f" strokeWidth="0.3" strokeDasharray="3 5" />
        <ellipse cx="200" cy="100" rx="80" ry="35" stroke="#1e3a5f" strokeWidth="0.3" strokeDasharray="2 4" />
        <line x1="200" y1="15" x2="200" y2="185" stroke="#1e3a5f" strokeWidth="0.2" strokeDasharray="2 4" />
        <line x1="100" y1="25" x2="100" y2="175" stroke="#1e3a5f" strokeWidth="0.2" strokeDasharray="2 4" />
        <line x1="300" y1="25" x2="300" y2="175" stroke="#1e3a5f" strokeWidth="0.2" strokeDasharray="2 4" />
      </svg>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200">
        <path d="M 320 55 Q 250 30 180 60 Q 110 90 60 140" stroke="#1e3a5f" strokeWidth="2" strokeDasharray="8 6" fill="none" opacity="0.2" className="animate-dash" />
        <circle cx="320" cy="55" r="5" fill="#f97316" opacity="0.6" />
        <circle cx="320" cy="55" r="10" fill="none" stroke="#f97316" strokeWidth="1" opacity="0.2">
          <animate attributeName="r" from="5" to="15" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="60" cy="140" r="5" fill="#1e3a5f" opacity="0.6" />
        <circle cx="60" cy="140" r="10" fill="none" stroke="#1e3a5f" strokeWidth="1" opacity="0.2">
          <animate attributeName="r" from="5" to="15" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite" />
        </circle>
      </svg>
      <div className="absolute bottom-20 left-[15%] animate-ship">
        <svg width="90" height="45" viewBox="0 0 90 45" fill="none">
          <path d="M8 35 L15 18 L75 18 L82 35 Z" fill="#1e3a5f" opacity="0.08" />
          <path d="M12 35 L18 20 L72 20 L78 35 Z" fill="#1e3a5f" opacity="0.15" />
          <rect x="35" y="10" width="4" height="16" fill="#1e3a5f" opacity="0.2" />
          <rect x="40" y="5" width="14" height="10" rx="1" fill="#1e3a5f" opacity="0.12" />
          <rect x="20" y="20" width="10" height="6" rx="0.5" fill="#3b82f6" opacity="0.4" />
          <rect x="32" y="20" width="10" height="6" rx="0.5" fill="#f97316" opacity="0.4" />
          <rect x="44" y="20" width="10" height="6" rx="0.5" fill="#10b981" opacity="0.4" />
          <rect x="56" y="20" width="10" height="6" rx="0.5" fill="#f59e0b" opacity="0.4" />
        </svg>
      </div>
      <div className="absolute top-10 right-[20%] animate-plane">
        <svg width="55" height="26" viewBox="0 0 55 26" fill="none">
          <path d="M6 13 L15 8 L48 11 L52 13 L48 15 L15 18 Z" fill="#1e3a5f" opacity="0.15" />
          <path d="M22 8 L27 2 L30 8" fill="#1e3a5f" opacity="0.1" />
          <path d="M38 15 L41 22 L43 15" fill="#1e3a5f" opacity="0.1" />
        </svg>
      </div>
      <div className="absolute bottom-8 right-[15%]">
        <svg width="60" height="50" viewBox="0 0 60 50" fill="none">
          <rect x="0" y="25" width="28" height="16" rx="1" fill="#3b82f6" opacity="0.15" stroke="#3b82f6" strokeWidth="0.5" />
          <rect x="30" y="25" width="28" height="16" rx="1" fill="#f97316" opacity="0.15" stroke="#f97316" strokeWidth="0.5" />
          <rect x="8" y="8" width="28" height="16" rx="1" fill="#10b981" opacity="0.15" stroke="#10b981" strokeWidth="0.5" />
          <rect x="38" y="8" width="20" height="16" rx="1" fill="#f59e0b" opacity="0.15" stroke="#f59e0b" strokeWidth="0.5" />
        </svg>
      </div>
      <div className="absolute top-8 right-[12%] flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-slate-200 px-2.5 py-1 rounded-md shadow-sm">
        <MapPin className="w-3 h-3 text-orange-500" />
        <span className="text-[10px] font-bold text-slate-700 tracking-wider">CHINA</span>
      </div>
      <div className="absolute bottom-28 left-[8%] flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-slate-200 px-2.5 py-1 rounded-md shadow-sm">
        <MapPin className="w-3 h-3 text-blue-600" />
        <span className="text-[10px] font-bold text-slate-700 tracking-wider">ARGENTINA</span>
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg px-5 py-2.5 shadow-md">
        <div className="text-center">
          <p className="text-[8px] text-slate-400 font-bold tracking-wider">TRANSITO</p>
          <p className="text-xs font-bold text-slate-800">15-20 DIAS</p>
        </div>
        <div className="w-px h-6 bg-slate-200" />
        <div className="text-center">
          <p className="text-[8px] text-slate-400 font-bold tracking-wider">PESO MAX</p>
          <p className="text-xs font-bold text-slate-800">70 KG</p>
        </div>
        <div className="w-px h-6 bg-slate-200" />
        <div className="text-center">
          <p className="text-[8px] text-slate-400 font-bold tracking-wider">INCOTERM</p>
          <p className="text-xs font-bold text-slate-800">DDP</p>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
  return (
    <div className="group relative p-6 rounded-2xl bg-white border border-slate-100 shadow-premium hover:shadow-premium-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* Gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content */}
      <div className="relative space-y-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-premium flex items-center justify-center group-hover:shadow-glow group-hover:scale-110 transition-all duration-300">
          <Icon className="w-6 h-6 text-white" />
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">{label}</p>
          <p className="text-lg font-black text-foreground mt-1">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-2">{sub}</p>}
        </div>
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
    try {
      const breakdown = calculateImportBreakdown(data);
      setCalculation({ formData: data, breakdown });

      if (window.innerWidth < 768) {
        setTimeout(() => {
          document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al calcular. Verifique los datos ingresados.';
      alert(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-primary/5 to-white text-foreground">
      <div className="fixed inset-0 pointer-events-none opacity-[0.01] z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <RateTicker />

      <header className="glass sticky top-0 z-50 border-b border-slate-200/50 shadow-premium">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-premium flex items-center justify-center shadow-glow animate-bounce-gentle">
              <Truck className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gradient">ImportFlow</h1>
              <p className="text-[8px] text-muted-foreground tracking-widest uppercase font-semibold">Professional Logistics</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <span className="text-primary border-b-2 border-accent pb-1 transition-smooth">Calculadora</span>
            <a href="/ncm" className="text-foreground/70 hover:text-primary transition-smooth hover:border-b-2 hover:border-accent pb-1">Códigos NCM</a>
            <a href="/skus" className="text-foreground/70 hover:text-primary transition-smooth hover:border-b-2 hover:border-accent pb-1">Base SKUs</a>
            <a href="/orders" className="text-foreground/70 hover:text-primary transition-smooth hover:border-b-2 hover:border-accent pb-1">Órdenes</a>
          </nav>
        </div>
      </header>

      <MLSettingsPanel />

      <main className="max-w-7xl mx-auto px-4">
        {!calculation && (
          <section className="pt-16 pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: Hero Content */}
              <div className="space-y-6 animate-fade-in-scale">
                <div className="accent-line" />

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest border border-primary/20">
                  <Zap className="w-4 h-4" />
                  Solución Premium
                </div>

                <div>
                  <h2 className="text-5xl md:text-6xl font-black tracking-tight leading-[1.1] mb-4">
                    Calcula el costo real de
                    <span className="text-gradient block mt-2">importar desde China</span>
                  </h2>
                  <p className="text-lg text-foreground/70 leading-relaxed max-w-2xl">
                    Simula aranceles, impuestos, flete y márgenes de venta en Mercado Libre con precisión profesional. Control total de tu cadena de suministro.
                  </p>
                </div>

                {/* Feature Pills */}
                <div className="flex flex-wrap gap-2 pt-4">
                  {[
                    { icon: Shield, label: "AFIP Certificado", color: "bg-blue-50 text-blue-700 border-blue-200" },
                    { icon: Ship, label: "Courier DHL", color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
                    { icon: Package, label: "27+ Códigos NCM", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                    { icon: BarChart3, label: "ML Analytics", color: "bg-primary/10 text-primary border-primary/20" },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg border font-medium text-sm ${item.color} transition-smooth hover:shadow-md`}>
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Graphic */}
              <div className="hidden lg:block">
                <SupplyChainGraphic />
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
              <MiniStat icon={Shield} label="Aranceles" value="AFIP/VUCE" sub="Datos oficiales" />
              <MiniStat icon={Ship} label="Flete" value="Courier DHL" sub="Desde China" />
              <MiniStat icon={BarChart3} label="Simulación" value="ML Full" sub="Margen real" />
              <MiniStat icon={Package} label="NCM" value="27+ códigos" sub="Base local + IA" />
            </div>
          </section>
        )}

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
              <div className="h-full flex flex-col items-center justify-center p-12 bg-gradient-to-br from-white to-slate-50 rounded-2xl border border-slate-100/50 shadow-premium relative overflow-hidden">
                {/* Gradient accent */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -z-1" />

                {/* Content */}
                <div className="relative space-y-6">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-premium flex items-center justify-center shadow-glow animate-bounce-gentle">
                    <Boxes className="w-12 h-12 text-white" />
                  </div>

                  <div className="text-center space-y-3">
                    <h3 className="font-black text-2xl text-foreground">Esperando datos</h3>
                    <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                      Completa el formulario para ver el desglose detallado de costos y análisis de rentabilidad
                    </p>
                  </div>

                  <div className="pt-4">
                    <div className="inline-block px-4 py-2 rounded-lg bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                      ↓ Formulario abajo
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {!calculation && (
          <section className="pb-20">
            <div className="text-center mb-10">
              <div className="accent-line mx-auto mb-4" />
              <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">Todo lo que necesitas</h3>
              <p className="text-sm text-slate-400 mt-2">Herramientas profesionales para tu negocio de importacion</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  icon: Shield,
                  title: "Confiable",
                  desc: "Algoritmos actualizados para IVA, DIE y tasa estadistica segun normativa AFIP. Datos verificados contra VUCE.",
                  accent: "border-t-blue-500",
                },
                {
                  icon: Globe,
                  title: "Global",
                  desc: "Compatible con el Sistema Armonizado (HS) utilizado por mas de 200 paises. Asistente IA para clasificacion NCM.",
                  accent: "border-t-orange-500",
                },
                {
                  icon: BarChart3,
                  title: "Transparente",
                  desc: "Ves exactamente de donde viene cada centavo de tu costo de adquisicion. Desglose visual con graficos.",
                  accent: "border-t-emerald-500",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className={`group p-6 bg-white rounded-2xl border border-slate-100 border-t-4 ${feature.accent} shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-extrabold text-base mb-2 text-slate-900">{feature.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-16 bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <div className="text-center mb-8">
                <div className="accent-line mx-auto mb-4" />
                <h3 className="text-lg font-extrabold tracking-tight text-slate-900">Como funciona</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { step: "01", icon: FileText, title: "Describe", desc: "Tu producto y la IA busca el NCM y las tasas correctas" },
                  { step: "02", icon: DollarSign, title: "Ingresa", desc: "Precio en yuanes, peso y tarifa de flete" },
                  { step: "03", icon: Anchor, title: "Calcula", desc: "Aranceles, impuestos y costos logisticos" },
                  { step: "04", icon: TrendingUp, title: "Analiza", desc: "Margen real vendiendo en Mercado Libre" },
                ].map((item, i) => (
                  <div key={i} className="text-center space-y-3 relative">
                    <div className="text-4xl font-black text-slate-100">{item.step}</div>
                    <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center mx-auto">
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                    {i < 3 && (
                      <div className="hidden md:flex absolute top-12 -right-3 items-center">
                        <ArrowRight className="w-4 h-4 text-slate-200" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Truck className="w-5 h-5 text-slate-900" />
            <span className="font-extrabold text-slate-900 text-lg tracking-tight">ImportFlow</span>
          </div>
          <p className="text-xs text-slate-400">
            Creado por <span className="font-bold text-slate-700">ElecNeo</span>
          </p>
          <p className="text-[10px] text-slate-300 mt-2 tracking-wider">
            HERRAMIENTA DE SIMULACION LOGISTICA
          </p>
        </div>
      </footer>
    </div>
  );
}
