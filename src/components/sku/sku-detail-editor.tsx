"use client";

import React, { useState } from "react";
import { Save, Trash2, X, ExternalLink, Calculator, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatARS, calcularSkuRapido } from "@/lib/calculator-utils";
import { type SkuData, saveSku, deleteSku } from "@/lib/sku-database";

interface SkuDetailEditorProps {
  sku: SkuData;
  exchangeRate: number;
  usdToArsRate: number;
  shippingCostPerKg: number;
  onSave: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function SkuDetailEditor({
  sku: initialSku,
  exchangeRate,
  usdToArsRate,
  shippingCostPerKg,
  onSave,
  onDelete,
  onClose,
}: SkuDetailEditorProps) {
  const [sku, setSku] = useState
</details>

<SkuData>(initialSku);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const calc = calcularSkuRapido(
    sku.precioCompraCNY,
    exchangeRate,
    sku.pesoGramos,
    shippingCostPerKg,
    sku.precioVentaML,
    usdToArsRate,
    sku.tariffRate,
    sku.statisticalFee,
    sku.vatRate,
  );

  const handleSave = () => {
    saveSku({
      ...sku,
      margen: calc.margen,
      gananciaNetaARS: calc.gananciaNetaARS,
      rentable: calc.rentable,
    });
    onSave();
  };

  const handleDelete = () => {
    if (confirmDelete) {
      deleteSku(sku.id);
      onDelete();
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const updateField = (field: keyof SkuData, value: any) => {
    setSku(prev => ({ ...prev, [field]: value }));
  };
    return (
    &lt;/think&gt;<div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      &lt;/think&gt;<div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        &lt;/think&gt;<div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          &lt;/think&gt;<div>
            &lt;/think&gt;<h2 className="text-lg font-extrabold text-slate-900">{sku.nombre || "Nuevo SKU"}&lt;/think&gt;</h2>
            &lt;/think&gt;<p className="text-[10px] text-slate-400 uppercase tracking-wider">ID: {sku.id}&lt;/think&gt;</p>
          &lt;/think&gt;</div>
          &lt;/think&gt;<button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            &lt;/think&gt;<X className="w-5 h-5 text-slate-400" />
          &lt;/think&gt;</button>
        &lt;/think&gt;</div>

        &lt;/think&gt;<div className="p-6 space-y-6">
          &lt;/think&gt;<section>
            &lt;/think&gt;<h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Producto&lt;/think&gt;</h3>
            &lt;/think&gt;<div className="grid grid-cols-2 gap-4">
              &lt;/think&gt;<div>
                &lt;/think&gt;<label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nombre&lt;/think&gt;</label>
                &lt;/think&gt;<input
                  type="text"
                  value={sku.nombre}
                  onChange={(e) => updateField("nombre", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              &lt;/think&gt;</div>
              &lt;/think&gt;<div>
                &lt;/think&gt;<label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">NCM</label>
                &lt;/think&gt;<input
                  type="text"
                  value={sku.ncm}
                  onChange={(e) => updateField("ncm", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="8542.31"
                />
              &lt;/think&gt;</div>
              &lt;/think&gt;<div>
                &lt;/think&gt;<label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Proveedor&lt;/think&gt;</label>
                &lt;/think&gt;<input
                  type="text"
                  value={sku.proveedor}
                  onChange={(e) => updateField("proveedor", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              &lt;/think&gt;</div>
              &lt;/think&gt;<div>
                &lt;/think&gt;<label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Link Proveedor&lt;/think&gt;</label>
                &lt;/think&gt;<div className="flex gap-2">
                  &lt;/think&gt;<input
                    type="text"
                    value={sku.linkProveedor}
                    onChange={(e) => updateField("linkProveedor", e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="https://1688.com/..."
                  />
                  {sku.linkProveedor && (
                    &lt;/think&gt;<a href={sku.linkProveedor} target="_blank" rel="noopener noreferrer"
                      className="px-3 py-2 border rounded-lg hover:bg-slate-50 transition-colors">
                      &lt;/think&gt;<ExternalLink className="w-4 h-4 text-slate-400" />
                    &lt;/think&gt;</a>
                  )}
                &lt;/think&gt;</div>
              &lt;/think&gt;</div>
            &lt;/think&gt;</div>
          &lt;/think&gt;</section>

          &lt;/think&gt;<Separator />
                &lt;/think&gt;<section>
            &lt;/think&gt;<h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Costos&lt;/think&gt;</h3>
            &lt;/think&gt;<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              &lt;/think&gt;<div>
                &lt;/think&gt;<label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Precio Compra (CNY)&lt;/think&gt;</label>
                &lt;/think&gt;<input
                  type="number"
                  step="0.01"
                  value={sku.precioCompraCNY}
                  onChange={(e) => updateField("precioCompraCNY", Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              &lt;/think&gt;</div>
              &lt;/think&gt;<div>
                &lt;/think&gt;<label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Peso (gramos)&lt;/think&gt;</label>
                &lt;/think&gt;<input
                  type="number"
                  value={sku.pesoGramos}
                  onChange={(e) => updateField("pesoGramos", Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              &lt;/think&gt;</div>
              &lt;/think&gt;<div>
                &lt;/think&gt;<label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Envío Unitario (USD)&lt;/think&gt;</label>
                &lt;/think&gt;<input
                  type="number"
                  step="0.01"
                  value={sku.costoEnvioUnitarioUSD}
                  onChange={(e) => updateField("costoEnvioUnitarioUSD", Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              &lt;/think&gt;</div>
              &lt;/think&gt;<div>
                &lt;/think&gt;<label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Precio Venta ML (ARS)&lt;/think&gt;</label>
                &lt;/think&gt;<input
                  type="number"
                  value={sku.precioVentaML}
                  onChange={(e) => updateField("precioVentaML", Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              &lt;/think&gt;</div>
            &lt;/think&gt;</div>
          &lt;/think&gt;</section>

          &lt;/think&gt;<Separator />

          &lt;/think&gt;<section>
            &lt;/think&gt;<h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Impuestos Aduaneros (por NCM)&lt;/think&gt;</h3>
            &lt;/think&gt;<div className="grid grid-cols-3 gap-4">
              &lt;/think&gt;<div>
                &lt;/think&gt;<label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">DIE (%)&lt;/think&gt;</label>
                &lt;/think&gt;<input
                  type="number"
                  step="0.5"
                  value={sku.tariffRate}
                  onChange={(e) => updateField("tariffRate", Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              &lt;/think&gt;</div>
              &lt;/think&gt;<div>
                &lt;/think&gt;<label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Estadística (%)&lt;/think&gt;</label>
                &lt;/think&gt;<input
                  type="number"
                  step="0.5"
                  value={sku.statisticalFee}
                  onChange={(e) => updateField("statisticalFee", Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              &lt;/think&gt;</div>
              &lt;/think&gt;<div>
                &lt;/think&gt;<label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">IVA (%)&lt;/think&gt;</label>
                &lt;/think&gt;<input
                  type="number"
                  step="0.5"
                  value={sku.vatRate}
                  onChange={(e) => updateField("vatRate", Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              &lt;/think&gt;</div>
            &lt;/think&gt;</div>
          &lt;/think&gt;</section>

          &lt;/think&gt;<Separator />
                &lt;/think&gt;<section className={`p-5 rounded-xl border transition-colors ${
            calc.rentable
              ? "bg-emerald-50 border-emerald-200"
              : "bg-amber-50 border-amber-200"
          }`}>
            &lt;/think&gt;<div className="flex items-center gap-2 mb-3">
              &lt;/think&gt;<Calculator className="w-4 h-4 text-slate-600" />
              &lt;/think&gt;<h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Cálculo en Tiempo Real&lt;/think&gt;</h3>
            &lt;/think&gt;</div>

            &lt;/think&gt;<div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              &lt;/think&gt;<div>
                <p className="text-[9px] text-slate-400 uppercase font-bold">Costo Unit.&lt;/think&gt;</p>
                &lt;/think&gt;<p className="text-sm font-bold text-slate-800">{formatARS(calc.costoImportUnitARS)}&lt;/think&gt;</p>
              &lt;/think&gt;</div>
              &lt;/think&gt;<div>
                &lt;/think&gt;<p className="text-[9px] text-slate-400 uppercase font-bold">Comisión ML&lt;/think&gt;</p>
                &lt;/think&gt;<p className="text-sm font-bold text-red-600">-{formatARS(calc.comisionML)}&lt;/think&gt;</p>
              &lt;/think&gt;</div>
              {calc.costoFijoML > 0 && (
                &lt;/think&gt;<div>
                  &lt;/think&gt;<p className="text-[9px] text-slate-400 uppercase font-bold">Costo FULL&lt;/think&gt;</p>
                  &lt;/think&gt;<p className="text-sm font-bold text-red-600">-{formatARS(calc.costoFijoML)}&lt;/think&gt;</p>
                &lt;/think&gt;</div>
              )}
              {calc.envioGratisML > 0 && (
                &lt;/think&gt;<div>
                  &lt;/think&gt;<p className="text-[9px] text-slate-400 uppercase font-bold">Envío Gratis</p>
                  &lt;/think&gt;<p className="text-sm font-bold text-red-600">-{formatARS(calc.envioGratisML)}&lt;/think&gt;</p>
                &lt;/think&gt;</div>
              )}
              &lt;/think&gt;<div>
                &lt;/think&gt;<p className="text-[9px] text-slate-400 uppercase font-bold">Ganancia Neta&lt;/think&gt;</p>
                &lt;/think&gt;<p className={`text-sm font-bold ${calc.rentable ? "text-emerald-600" : "text-amber-600"}`}>
                  {formatARS(calc.gananciaNetaARS)}
                &lt;/think&gt;</p>
              &lt;/think&gt;</div>
              &lt;/think&gt;<div>
                &lt;/think&gt;<p className="text-[9px] text-slate-400 uppercase font-bold">Margen&lt;/think&gt;</p>
                &lt;/think&gt;<p className={`text-lg font-black ${calc.rentable ? "text-emerald-600" : "text-amber-600"}`}>
                  {calc.margen}%
                &lt;/think&gt;</p>
              &lt;/think&gt;</div>
            &lt;/think&gt;</div>

            &lt;/think&gt;<div className="flex items-center gap-2 mt-3">
              {calc.rentable ? (
                &lt;/think&gt;<>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  &lt;/think&gt;<span className="text-xs font-bold text-emerald-700">Rentable (&ge;30%)&lt;/think&gt;</span>
                &lt;/think&gt;</>
              ) : (
                &lt;/think&gt;<>
                  &lt;/think&gt;<TrendingDown className="w-4 h-4 text-amber-600" />
                  &lt;/think&gt;<span className="text-xs font-bold text-amber-700">Margen bajo (&lt;30%)</span>
                &lt;/think&gt;</>
              )}
            &lt;/think&gt;</div>
          &lt;/think&gt;</section>

          &lt;/think&gt;<section>
            &lt;/think&gt;<label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Notas&lt;/think&gt;</label>
            &lt;/think&gt;<textarea
              value={sku.notas}
              onChange={(e) => updateField("notas", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              placeholder="Observaciones, variante, color, versión..."
            />
          &lt;/think&gt;</section>
        &lt;/think&gt;</div>

        &lt;/think&gt;<div className="sticky bottom-0 bg-white border-t px-6 py-4 flex items-center justify-between">
          &lt;/think&gt;<Button
            variant="outline"
            onClick={handleDelete}
            className={`text-xs ${confirmDelete ? "border-red-500 text-red-600 bg-red-50" : ""}`}
          >
            &lt;/think&gt;<Trash2 className="w-3.5 h-3.5 mr-1.5" />
            {confirmDelete ? "Click otra vez para eliminar" : "Eliminar"}
          &lt;/think&gt;</Button>
          &lt;/think&gt;<div className="flex gap-2">
            &lt;/think&gt;<Button variant="outline" onClick={onClose} className="text-xs">Cancelar&lt;/think&gt;</Button>
            &lt;/think&gt;<Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600 text-xs">
              &lt;/think&gt;<Save className="w-3.5 h-3.5 mr-1.5" />
              Guardar
            &lt;/think&gt;</Button>
          &lt;/think&gt;</div>
        &lt;/think&gt;</div>
      &lt;/think&gt;</div>
    &lt;/think&gt;</div>
  );
}

