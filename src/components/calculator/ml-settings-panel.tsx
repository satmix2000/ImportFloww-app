"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save, RotateCcw, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ML_DEFAULTS, getMLConfig, saveMLConfig, type MLConfig } from "@/lib/ml-constants";

export function MLSettingsPanel() {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<MLConfig>(ML_DEFAULTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setConfig(getMLConfig());
  }, []);

  const handleSave = () => {
    saveMLConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setConfig(ML_DEFAULTS);
    saveMLConfig(ML_DEFAULTS);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateCostoFijo = (index: number, field: "hasta" | "costo", value: number) => {
    setConfig(prev => ({
      ...prev,
      costosFijos: prev.costosFijos.map((r, i) =>
        i === index ? { ...r, [field]: value } : r
      ),
    }));
  };

  const updateEnvioGratis = (index: number, field: "desde" | "costo", value: number) => {
    setConfig(prev => ({
      ...prev,
      envioGratis: prev.envioGratis.map((r, i) =>
        i === index ? { ...r, [field]: value } : r
      ),
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pt-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <Settings className="w-3.5 h-3.5" />
        Configurar costos Mercado Libre
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {open && (
        <Card className="mt-3 border-orange-200 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <CardHeader className="bg-orange-50 py-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-bold text-orange-800 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configuración Mercado Libre
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="text-xs h-7"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Reset
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="bg-orange-500 hover:bg-orange-600 text-xs h-7"
                >
                  {saved ? (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      Guardado
                    </>
                  ) : (
                    <>
                      <Save className="w-3 h-3 mr-1" />
                      Guardar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 pb-5 px-5 space-y-5">
            {/* Comisión */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Comisión ML (%)
              </label>
              <input
                type="number"
                value={config.comisionPorcentaje}
                onChange={(e) =>
                  setConfig(prev => ({ ...prev, comisionPorcentaje: Number(e.target.value) }))
                }
                className="w-24 px-3 py-1.5 border rounded-lg text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <Separator />

            {/* Costos Fijos FULL */}
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                Costos Fijos FULL (&lt; $33.000)
              </p>
              <div className="space-y-2">
                {config.costosFijos.map((rango, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-slate-400 text-xs w-16">Hasta $</span>
                    <input
                      type="number"
                      value={rango.hasta}
                      onChange={(e) => updateCostoFijo(i, "hasta", Number(e.target.value))}
                      className="w-28 px-2 py-1 border rounded text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <span className="text-slate-400 text-xs">→</span>
                    <span className="text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={rango.costo}
                      onChange={(e) => updateCostoFijo(i, "costo", Number(e.target.value))}
                      className="w-24 px-2 py-1 border rounded text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Envío Gratis */}
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                Envío Gratis (≥ $33.000)
              </p>
              <div className="space-y-2">
                {config.envioGratis.map((rango, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-slate-400 text-xs w-16">Desde $</span>
                    <input
                      type="number"
                      value={rango.desde}
                      onChange={(e) => updateEnvioGratis(i, "desde", Number(e.target.value))}
                      className="w-28 px-2 py-1 border rounded text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <span className="text-slate-400 text-xs">→</span>
                    <span className="text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      value={rango.costo === Infinity ? 0 : rango.costo}
                      onChange={(e) => updateEnvioGratis(i, "costo", Number(e.target.value))}
                      className="w-24 px-2 py-1 border rounded text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
