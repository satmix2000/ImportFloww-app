"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, Trash2, TrendingUp, TrendingDown, Package, ArrowLeft, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatARS, calcularSkuRapido } from "@/lib/calculator-utils";
import { getAllSkus, saveSku, deleteSku, type SkuData } from "@/lib/sku-database";
import { SkuDetailEditor } from "@/components/sku/sku-detail-editor";

const EXCHANGE_RATE = 0.14;
const SHIPPING_COST_PER_KG = 11.2;

export default function SkusPage() {
  const [skus, setSkus] = useState<SkuData[]>([]);
  const [search, setSearch] = useState("");
  const [editingSku, setEditingSku] = useState<SkuData | null>(null);
  const [usdToArs, setUsdToArs] = useState(1550);

  useEffect(() => {
    setSkus(getAllSkus());
    const fetchRate = async () => {
      try {
        const res = await fetch("https://dolarapi.com/v1/dolares/blue");
        const data = await res.json();
        if (data?.venta) setUsdToArs(Math.round(data.venta));
      } catch {}
    };
    fetchRate();
  }, []);

  const reloadSkus = () => setSkus(getAllSkus());

  const filtered = skus.filter(s =>
    s.nombre.toLowerCase().includes(search.toLowerCase()) ||
    s.ncm.includes(search) ||
    s.proveedor.toLowerCase().includes(search.toLowerCase())
  );

  const recalcularTodos = () => {
    const actualizados = skus.map(sku => {
      const calc = calcularSkuRapido(
        sku.precioCompraCNY,
        sku.exchangeRate,
        sku.pesoGramos,
        SHIPPING_COST_PER_KG,
        sku.precioVentaML,
        sku.usdToArsRate,
        sku.tariffRate,
        sku.statisticalFee,
        sku.vatRate,
      );
      return {
        ...sku,
        margen: calc.margen,
        gananciaNetaARS: calc.gananciaNetaARS,
        rentable: calc.rentable,
      };
    });
    actualizados.forEach(s => saveSku(s));
    setSkus(actualizados);
  };

  const handleNewSku = () => {
    const newSku: SkuData = {
      id: "nuevo-sku-" + Date.now(),
      nombre: "Nuevo SKU",
      proveedor: "",
      linkProveedor: "",
      ncm: "",
      precioCompraCNY: 0,
      pesoGramos: 100,
      costoEnvioUnitarioUSD: 0,
      precioVentaML: 0,
      margen: 0,
      gananciaNetaARS: 0,
      rentable: false,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
      notas: "",
      tariffRate: 18,
      statisticalFee: 3,
      vatRate: 21,
      exchangeRate: 0.14,
      usdToArsRate: 1550,
    };
    setEditingSku(newSku);
  };

  const rentables = skus.filter(s => s.rentable).length;
  const margenPromedio = skus.length > 0
    ? (skus.reduce((acc, s) => acc + s.margen, 0) / skus.length).toFixed(1)
    : "0";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4 text-slate-600" />
            </a>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
                <Package className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-base font-extrabold text-slate-900">Base de SKUs</h1>
                <p className="text-[9px] text-slate-400 tracking-widest uppercase">ImportFlow</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={recalcularTodos} className="text-xs h-8">
              <RefreshCw className="w-3 h-3 mr-1" />
              Recalcular todo
            </Button>
            <Button size="sm" onClick={handleNewSku} className="bg-orange-500 hover:bg-orange-600 text-xs h-8">
              <Plus className="w-3 h-3 mr-1" />
              Nuevo SKU
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Total SKUs</p>
            <p className="text-2xl font-black text-slate-900">{skus.length}</p>
          </div>
          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Rentables</p>
            <p className="text-2xl font-black text-emerald-600">{rentables}</p>
          </div>
          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <p className="text-[10px] text-slate-400 font-bold uppercase">No Rentables</p>
            <p className="text-2xl font-black text-amber-600">{skus.length - rentables}</p>
          </div>
          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Margen Promedio</p>
            <p className="text-2xl font-black text-slate-900">{margenPromedio}%</p>
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Buscar por nombre, NCM o proveedor..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 border rounded-xl text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <h3 className="font-bold text-slate-400">{skus.length === 0 ? "No hay SKUs guardados" : "Sin resultados"}</h3>
            <p className="text-xs text-slate-400 mt-1">{skus.length === 0 ? "Usá la calculadora para guardar tu primer SKU" : "Probá con otra búsqueda"}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((sku) => {
              const calc = calcularSkuRapido(
                sku.precioCompraCNY,
                sku.exchangeRate,
                sku.pesoGramos,
                SHIPPING_COST_PER_KG,
                sku.precioVentaML,
                sku.usdToArsRate,
                sku.tariffRate,
                sku.statisticalFee,
                sku.vatRate,
              );
              return (
                <div key={sku.id} className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => setEditingSku(sku)}>
                  <div className="p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-sm text-slate-900 truncate">{sku.nombre}</h3>
                        {sku.ncm && <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-mono text-slate-500 shrink-0">{sku.ncm}</span>}
                        {sku.pesoGramos > 0 && <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-mono text-slate-500 shrink-0">{sku.pesoGramos}g</span>}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        {sku.proveedor && <span>{sku.proveedor}</span>}
                        <span>CNY {sku.precioCompraCNY}</span>
                        <span>→</span>
                        <span>ML {formatARS(sku.precioVentaML)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className={`text-xl font-black ${calc.rentable ? "text-emerald-600" : "text-amber-600"}`}>{calc.margen}%</p>
                        <p className="text-[10px] text-slate-400 font-mono">{formatARS(calc.gananciaNetaARS)}</p>
                      </div>
                      {calc.rentable ? <TrendingUp className="w-5 h-5 text-emerald-500" /> : <TrendingDown className="w-5 h-5 text-amber-500" />}
                      {sku.linkProveedor && (
                        <a href={sku.linkProveedor} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-1.5 hover:bg-slate-100 rounded transition-colors">
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        </a>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); if (confirm(`Eliminar "${sku.nombre}"?`)) { deleteSku(sku.id); reloadSkus(); } }} className="p-1.5 hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {editingSku && (
        <SkuDetailEditor
          sku={editingSku}
          exchangeRate={EXCHANGE_RATE}
          usdToArsRate={usdToArs}
          shippingCostPerKg={SHIPPING_COST_PER_KG}
          onSave={() => { setEditingSku(null); reloadSkus(); }}
          onDelete={() => { setEditingSku(null); reloadSkus(); }}
          onClose={() => setEditingSku(null)}
        />
      )}
    </div>
  );
}
