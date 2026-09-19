"use client";

import React, { useState } from "react";
import { Save, Trash2, X, ExternalLink, Calculator, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatARS, calcularSkuRapido } from "@/lib/calculator-utils";
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
  const [sku, setSku] = useState<SkuData>(initialSku);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const calc = calcularSkuRapido(
    sku.precioCompraCNY,
    exchangeRate,
    sku.pesoGramos,
    shippingCostPerKg,
    sku.precioVentaML,
    usdToArsRate,
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">{sku.nombre || "Nuevo SKU"}</h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">ID: {sku.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Datos del producto */}
          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Producto</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nombre</label>
                <input
                  type="text"
                  value={sku.nombre}
                  onChange={(e) => updateField("nombre", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">NCM</label>
                <input
                  type="text"
                  value={sku.ncm}
                  onChange={(e) => updateField("ncm", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="8542.31"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Proveedor</label>
                <input
                  type="text"
                  value={sku.proveedor}
                  onChange={(e) => updateField("proveedor", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Link Proveedor</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sku.linkProveedor}
                    onChange={(e) => updateField("linkProveedor", e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="https://1688.com/..."
                  />
                  {sku.linkProveedor && (
                    <a href={sku.linkProveedor} target="_blank" rel="noopener noreferrer"
                      className="px-3 py-2 border rounded-lg hover:bg-slate-50 transition-colors">
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* Costos */}
          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Costos</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Precio Compra (CNY)</label>
                <input
                  type="number"
                  step="0.01"
                  value={sku.precioCompraCNY}
                  onChange={(e) => updateField("precioCompraCNY", Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Peso (gramos)</label>
                <input
                  type="number"
                  value={sku.pesoGramos}
                  onChange={(e) => updateField("pesoGramos", Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Envío Unitario (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={sku.costoEnvioUnitarioUSD}
                  onChange={(e) => updateField("costoEnvioUnitarioUSD", Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Precio Venta ML (ARS)</label>
                <input
                  type="number"
                  value={sku.precioVentaML}
                  onChange={(e) => updateField("precioVentaML", Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* Resultado en tiempo real */}
          <section className={`p-5 rounded-xl border transition-colors ${
            calc.rentable
              ? "bg-emerald-50 border-emerald-200"
              : "bg-amber-50 border-amber-200"
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-4 h-4 text-slate-600" />
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Cálculo en Tiempo Real</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-[9px] text-slate-400 uppercase font-bold">Costo Unit.</p>
                <p className="text-sm font-bold text-slate-800">{formatARS(calc.costoImportUnitARS)}</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-400 uppercase font-bold">Comisión ML</p>
                <p className="text-sm font-bold text-red-600">-{formatARS(calc.comisionML)}</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-400 uppercase font-bold">Ganancia Neta</p>
                <p className={`text-sm font-bold ${calc.rentable ? "text-emerald-600" : "text-amber-600"}`}>
                  {formatARS(calc.gananciaNetaARS)}
                </p>
              </div>
              <div>
                <p className="text-[9px] text-slate-400 uppercase font-bold">Margen</p>
                <p className={`text-lg font-black ${calc.rentable ? "text-emerald-600" : "text-amber-600"}`}>
                  {calc.margen}%
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-3">
              {calc.rentable ? (
                <>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-700">Rentable (&ge;30%)</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-amber-700">Margen bajo (&lt;30%)</span>
                </>
              )}
            </div>
          </section>

          {/* Notas */}
          <section>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Notas</label>
            <textarea
              value={sku.notas}
              onChange={(e) => updateField("notas", e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              placeholder="Observaciones, variante, color, versión..."
            />
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleDelete}
            className={`text-xs ${confirmDelete ? "border-red-500 text-red-600 bg-red-50" : ""}`}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            {confirmDelete ? "Click otra vez para eliminar" : "Eliminar"}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="text-xs">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600 text-xs">
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Guardar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
