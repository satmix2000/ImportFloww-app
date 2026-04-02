"use client";

import React from "react";
import { BarChart3, ReceiptText, ShieldCheck, Truck, Landmark, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatYuan, formatARS, type ImportBreakdown } from "@/lib/calculator-utils";
import { ImportFormData } from "./import-form";

interface ResultsDisplayProps {
  formData: ImportFormData;
  breakdown: ImportBreakdown;
}

export function ResultsDisplay({ formData, breakdown }: ResultsDisplayProps) {
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
                    <span className="text-foreground font-bold text-xs uppercase tracking-tight">Equivalente en Pesos Argentinos</span>
                  </div>
                  <div className="bg-white/80 p-4 rounded-lg border border-accent/20 shadow-inner">
                    <span className="text-3xl md:text-4xl font-black text-slate-900 block text-right break-words tracking-tighter">
                      {formatARS(breakdown.totalAcquisitionCostARS)}
                    </span>
                    <p className="text-[10px] font-bold text-muted-foreground text-right mt-1">
                      COTIZACIÓN USD LIBRE: {formData.usdToArsRate}
                    </p>
                  </div>
                </div>
              </div>
            </section>
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
