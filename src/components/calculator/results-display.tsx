"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, ReceiptText, ShieldCheck, Truck, Landmark, Info, ShoppingBag, ArrowUpRight, AlertTriangle, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatYuan, formatARS, type ImportBreakdown } from "@/lib/calculator-utils";
import { ImportFormData } from "./import-form";

interface ResultsDisplayProps {
  formData: ImportFormData & { metricasML?: any };
  breakdown: ImportBreakdown;
}

interface SkuExistente {
  id: string;
  margen: number;
  precio: number;
  fecha: string;
}

const SKU_STORAGE_KEY = "importflow-skus-db";

function getSkusFromStorage(): SkuExistente[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SKU_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSkuToStorage(sku: SkuExistente): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getSkusFromStorage();
    const idx = existing.findIndex(s => s.id === sku.id);
    if (idx >= 0) {
      existing[idx] = sku;
    } else {
      existing.push(sku);
    }
    localStorage.setItem(SKU_STORAGE_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error("Error saving SKU:", e);
  }
}

export function ResultsDisplay({ formData, breakdown }: ResultsDisplayProps) {
  const [skuName, setSkuName] = useState("");
  const [skusGuardados, setSkusGuardados] = useState<SkuExistente[]>([]);
  const [coincidencias, setCoincidencias] = useState<SkuExistente[]>([]);
  const [saved, setSaved] = useState(false);

  const precioCompetencia = formData.precioCompetenciaML || 0;
  const comisionPorcentaje = formData.comisionMLPorcentaje || 16;
  const costoImportacionARS = breakdown.totalAcquisitionCostARS;

  // Simulación ML
  let simulaciónML = null;

  if (precioCompetencia > 0) {
    const comisionPesos = precioCompetencia * (comisionPorcentaje / 100);
    let costoFijoML = 0;
    let envioGratisML = 0;

    if (precioCompetencia < 33000) {
      if (precioCompetencia <= 15999) costoFijoML = 1230;
      else if (precioCompetencia <= 23999) costoFijoML = 2455;
      else costoFijoML = 2925;
    } else {
      envioGratisML = 4500;
    }

    const gananciaNetaARS = precioCompetencia - comisionPesos - costoFijoML - envioGratisML - costoImportacionARS;
    const margenRealPercentage = (gananciaNetaARS / precioCompetencia) * 100;
    const esRentable = margenRealPercentage >= 30;

    simulaciónML = {
      comisionPesos,
      costoFijoML,
      envioGratisML,
      gananciaNetaARS,
      margenRealPercentage: Number(margenRealPercentage.toFixed(2)),
      esRentable
    };
  }

  // Cargar SKUs guardados
  useEffect(() => {
    setSkusGuardados(getSkusFromStorage());
  }, [saved]);

  // Filtrar coincidencias en tiempo real
  useEffect(() => {
    if (!skuName.trim()) {
      setCoincidencias([]);
      return;
    }
    const busqueda = skuName.toLowerCase().trim();
    const filtrados = skusGuardados.filter(item => item.id.toLowerCase().includes(busqueda));
    setCoincidencias(filtrados);
  }, [skuName, skusGuardados]);

  // Guardar SKU en localStorage
  const handleGuardarSKU = () => {
    if (!skuName.trim()) return;

    const skuID = skuName.trim().toLowerCase().replace(/\s+/g, "-");

    const skuData: SkuExistente = {
      id: skuID,
      margen: simulaciónML?.margenRealPercentage || 0,
      precio: precioCompetencia,
      fecha: new Date().toISOString(),
    };

    saveSkuToStorage(skuData);
    setSaved(true);
    setSkuName("");
    setTimeout(() => setSaved(false), 3000);
  };

  const yaExisteSkuExacto = skusGuardados.some(
    item => item.id === skuName.trim().toLowerCase().replace(/\s+/g, "-")
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <Card className="border-none shadow-xl bg-white overflow-hidden">
        <CardHeader className="bg-primary text-primary-foreground">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ReceiptText className="w-5 h-5 text-accent" />
              <CardTitle className="font-headline tracking-tight text-lg">Reporte Detallado</CardTitle>
            </div>
            <BarChart3 className="w-6 h-6 opacity-20" />
          </div>
        </CardHeader>
        <CardContent className="pt-6 px-6 pb-8">
          <div className="space-y-6">
            {/* Sección de Conversión */}
            <section className="bg-muted/30 p-4 rounded-lg border border-dashed">
              <div className="flex justify-between items-end gap-2">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Valor FOB Original</p>
                  <p className="font-bold text-lg">{formatYuan(formData.itemValueCNY)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">FOB en USD ({formData.exchangeRate})</p>
                  <p className="font-bold text-lg text-primary">{formatCurrency(breakdown.itemValueUSD)} USD</p>
                </div>
              </div>
            </section>

            {/* Logística Detallada */}
            <section>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                <Truck className="w-4 h-4" /> Costos Logísticos (Courier)
              </h3>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-foreground/70">Flete Base ({formData.weight}g)</span>
                  <span className="font-medium">{formatCurrency(breakdown.baseShipping)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-foreground/70">Fsc Screen (28% flete)</span>
                  <span className="font-medium">{formatCurrency(breakdown.fscScreen)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-foreground/70">Almacenaje (1 USD/kg) - Gravado</span>
                  <span className="font-medium">{formatCurrency(breakdown.almacenaje)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-foreground/70">Cargo Terminal (10% FOB) - Gravado</span>
                  <span className="font-medium">{formatCurrency(breakdown.cargoTerminal)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-foreground/70">Seguro (1% FOB) - Gravado</span>
                  <span className="font-medium">{formatCurrency(breakdown.insurance)}</span>
                </div>
                <div className="flex justify-between items-center text-sm italic text-destructive">
                  <span className="text-foreground/70 font-semibold text-[10px] uppercase">IVA 21% s/ Servicios gravados</span>
                  <span className="font-bold">{formatCurrency(breakdown.logisticsServiceIva)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center text-base font-bold text-primary">
                  <span>Total CIF (Base Imponible)</span>
                  <span>{formatCurrency(breakdown.cifValue)}</span>
                </div>
              </div>
            </section>

            {/* Impuestos */}
            <section>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Gravámenes Aduaneros (AFIP)
              </h3>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-foreground/70">Derecho Importación ({formData.tariffRate}%)</span>
                  <span className="font-medium">{formatCurrency(breakdown.dutyAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-foreground/70">Tasa Estadística ({formData.statisticalFee}%)</span>
                  <span className="font-medium">{formatCurrency(breakdown.statisticalAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span className="text-foreground/70">IVA Aduana ({formData.vatRate}%)</span>
                  <span className="font-medium text-destructive">{formatCurrency(breakdown.vatAmount)}</span>
                </div>
              </div>
            </section>

            <Separator className="bg-primary/10 h-[2px]" />

            {/* TOTALES FINALES */}
            <section className="bg-primary/5 p-5 rounded-xl border border-primary/20 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-primary font-bold text-sm uppercase">Costo Total USD</span>
                <span className="text-2xl font-black text-primary">{formatCurrency(breakdown.totalAcquisitionCostUSD)}</span>
              </div>
              
              <div className="pt-3 border-t border-primary/10">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-accent" />
                    <span className="text-foreground font-bold text-xs uppercase tracking-tight">Costo de Entrada Puesto en Argentina (ARS)</span>
                  </div>
                  <div className="bg-white/80 p-4 rounded-lg border border-accent/20 shadow-inner">
                    <span className="text-3xl md:text-4xl font-black text-slate-900 block text-right break-words tracking-tighter">
                      {formatARS(costoImportacionARS)}
                    </span>
                    <p className="text-[10px] font-bold text-muted-foreground text-right mt-1">
                      COTIZACIÓN USD LIBRE: {formData.usdToArsRate}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Simulación MercadoLibre */}
            {simulaciónML && (
              <section className="space-y-4 pt-2">
                <Separator className="bg-orange-200 h-[1px]" />
                <h3 className="text-xs font-bold text-orange-600 uppercase tracking-widest flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" /> Desglose de Salida: Mercado Libre FULL
                </h3>
                
                <div className="space-y-2 text-sm bg-orange-50/30 p-4 rounded-lg border border-orange-100">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Precio Objetivo al Público:</span>
                    <span className="font-semibold text-slate-900">{formatARS(precioCompetencia)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Comisión ML ({comisionPorcentaje}%):</span>
                    <span className="font-medium text-destructive">-{formatARS(simulaciónML.comisionPesos)}</span>
                  </div>
                  {simulaciónML.costoFijoML > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Costo Fijo Logístico FULL (&lt;100g):</span>
                      <span className="font-medium text-destructive">-{formatARS(simulaciónML.costoFijoML)}</span>
                    </div>
                  )}
                  {simulaciónML.envioGratisML > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Envío Gratis Obligatorio (&gt;$33.000):</span>
                      <span className="font-medium text-destructive">-{formatARS(simulaciónML.envioGratisML)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center border-t border-orange-200/50 pt-2 font-medium">
                    <span className="text-slate-600">Costo Base de Importación:</span>
                    <span className="text-slate-700">-{formatARS(costoImportacionARS)}</span>
                  </div>
                </div>

                {/* Indicador de Margen */}
                <div className={`p-5 rounded-xl border flex flex-col md:flex-row md:justify-between md:items-center gap-4 transition-colors ${
                  simulaciónML.esRentable 
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900" 
                    : "bg-amber-500/10 border-amber-500/30 text-amber-900"
                }`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-wide">
                      {simulaciónML.esRentable ? (
                        <>
                          <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                          <span className="text-emerald-700">¡Margen Objetivo Aprobado!</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                          <span className="text-amber-700">Margen por debajo del objetivo</span>
                        </>
                      )}
                    </div>
                    <p className={`text-[11px] leading-tight ${simulaciónML.esRentable ? "text-emerald-700/80" : "text-amber-700/80"}`}>
                      {simulaciónML.esRentable 
                        ? "Este SKU supera el 30% neto. Excelente candidato para el interés compuesto por volumen."
                        : "Revisá el precio de compra o buscá un SKU de mayor densidad de valor para optimizar el flete."}
                    </p>
                  </div>

                  <div className="text-right shrink-0 bg-white/90 px-4 py-2 rounded-lg shadow-sm border border-black/5">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Ganancia Neta / Margen Real</span>
                    <span className={`text-2xl font-black block tracking-tight ${simulaciónML.esRentable ? "text-emerald-600" : "text-amber-600"}`}>
                      {formatARS(simulaciónML.gananciaNetaARS)}
                    </span>
                    <span className={`text-xs font-bold ${simulaciónML.esRentable ? "text-emerald-700" : "text-amber-700"}`}>
                      {simulaciónML.margenRealPercentage}% Neto
                    </span>
                  </div>
                </div>

                <Separator className="bg-orange-200 h-[1px] my-2" />

                {/* SKU y coincidencias */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                      Identificador único del SKU
                    </label>
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Ej: cocodrilo-5, esp32-c3..."
                        value={skuName}
                        onChange={(e) => setSkuName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  {coincidencias.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>¡Atención! Coincidencias en la base de datos:</span>
                      </div>
                      <div className="max-h-24 overflow-y-auto space-y-1 pr-1 text-xs">
                        {coincidencias.map((item) => (
                          <div 
                            key={item.id} 
                            onClick={() => setSkuName(item.id)}
                            className="flex justify-between items-center p-2 bg-white rounded border border-amber-100 hover:bg-amber-100/50 cursor-pointer transition-colors"
                          >
                            <span className="font-mono font-bold text-slate-800">{item.id}</span>
                            <span className="text-slate-500">Margen: {item.margen}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {yaExisteSkuExacto && (
                    <p className="text-[10px] text-orange-600 font-bold">
                      ⚠️ Este SKU ya existe. Se sobrescribirá con los nuevos datos.
                    </p>
                  )}

                  <Button
                    onClick={handleGuardarSKU}
                    disabled={!skuName.trim()}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold"
                  >
                    {saved ? "✅ SKU Guardado" : "Guardar SKU en Base Local"}
                  </Button>
                </div>
              </section>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-500 shrink-0" />
        <div className="text-[11px] text-blue-800 leading-tight space-y-1">
          <p><strong>Reglas de Negocio:</strong> Seguro es el 1% del FOB.</p>
          <p><strong>Gravados con IVA 21%:</strong> Almacenaje, Cargo Terminal e Insurance (Seguro).</p>
          <p>El CIF se calcula sumando FOB + Logística Total + Gastos Varios.</p>
        </div>
      </div>
    </div>
  );
}
