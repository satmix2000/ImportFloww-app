"use client";

import React, { useState } from "react";
import { ImportForm, type ImportFormData } from "@/components/calculator/import-form";
import { ResultsDisplay } from "@/components/calculator/results-display";
import { calculateImportBreakdown, type ImportBreakdown } from "@/lib/calculator-utils";
import { Globe, Plane, ShieldCheck, TrendingUp } from "lucide-react";

export default function Home() {
  const [calculation, setCalculation] = useState<{
    formData: ImportFormData;
    breakdown: ImportBreakdown;
  } | null>(null);

  const handleCalculate = (data: ImportFormData) => {
    const breakdown = calculateImportBreakdown(data);
    setCalculation({ formData: data, breakdown });
    
    // Smooth scroll to results on mobile
    if (window.innerWidth < 768) {
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/30">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-lg p-1.5 shadow-lg shadow-primary/20">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-extrabold text-primary tracking-tight font-headline">
              ImportFlow
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Calculadora</a>
            <a href="#" className="hover:text-primary transition-colors">Códigos HS</a>
            <a href="#" className="hover:text-primary transition-colors">Ayuda</a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-primary mb-4 font-headline tracking-tight">
            Calculadora de Importación
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Estime sus costos de importación, aranceles e impuestos de forma precisa y profesional con el asistente de IA.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
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
              <div className="h-full flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed border-muted-foreground/30 text-center space-y-4">
                <div className="bg-muted rounded-full p-6">
                  <Globe className="w-12 h-12 text-muted-foreground opacity-40" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground/70">Esperando Datos</h3>
                  <p className="text-sm text-muted-foreground max-w-[250px] mx-auto mt-2">
                    Complete el formulario para ver el desglose detallado de sus costos de importación.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        {!calculation && (
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-xl shadow-sm border border-primary/5 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-bold text-lg mb-2">Confiable</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Algoritmos actualizados para el cálculo de IVA y derechos arancelarios estándar.
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm border border-primary/5 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Plane className="w-6 h-6 text-accent-foreground" />
              </div>
              <h4 className="font-bold text-lg mb-2">Global</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Compatible con el Sistema Armonizado (HS) utilizado por más de 200 países.
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm border border-primary/5 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-bold text-lg mb-2">Transparente</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Vea exactamente de dónde viene cada centavo de su costo de adquisición.
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="font-extrabold text-primary font-headline tracking-tight">ImportFlow</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ImportFlow Solutions. Herramienta de simulación logística profesional.
          </p>
        </div>
      </footer>
    </div>
  );
}