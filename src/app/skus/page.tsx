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
        EXCHANGE_RATE,
        sku.pesoGramos,
        SHIPPING_COST_PER_KG,
        sku.precioVentaML,
        usdToArs,
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
    };
    setEditingSku(newSku);
  };

  const rentables = skus.filter(s => s.rentable).length;
  const margenPromedio = skus.length > 0
    ? (skus.reduce((acc, s) => acc + s.margen, 0) / skus.length).toFixed(1)
    : "0";
    return (
</details>

<div className="min-h-screen bg-slate-50">
      &lt;/think&gt;<header className="bg-white border-b sticky top-0 z-40">
        &lt;/think&gt;<div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          &lt;/think&gt;<div className="flex items-center gap-3">
            &lt;/think&gt;<a href="/" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              &lt;/think&gt;<ArrowLeft className="w-4 h-4 text-slate-600" />
            &lt;/think&gt;</a>
            &lt;/think&gt;<div className="flex items-center gap-2">
              &lt;/think&gt;<div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
                &lt;/think&gt;<Package className="w-4 h-4 text-white" />
              &lt;/think&gt;</div>
              &lt;/think&gt;<div>
                &lt;/think&gt;<h1 className="text-base font-extrabold text-slate-900">Base de SKUs&lt;/think&gt;</h1>
                &lt;/think&gt;<p className="text-[9px] text-slate-400 tracking-widest uppercase">ImportFlow&lt;/think&gt;</p>
              &lt;/think&gt;</div>
            &lt;/think&gt;</div>
          &lt;/think&gt;</div>
          &lt;/think&gt;<div className="flex items-center gap-2">
            &lt;/think&gt;<Button variant="outline" size="sm" onClick={recalcularTodos} className="text-xs h-8">
              &lt;/think&gt;<RefreshCw className="w-3 h-3 mr-1" />
              Recalcular todo
            &lt;/think&gt;</Button>
            &lt;/think&gt;<Button size="sm" onClick={handleNewSku} className="bg-orange-500 hover:bg-orange-600 text-xs h-8">
              &lt;/think&gt;<Plus className="w-3 h-3 mr-1" />
              Nuevo SKU
            &lt;/think&gt;</Button>
          &lt;/think&gt;</div>
        &lt;/think&gt;</div>
      &lt;/think&gt;</header>

      &lt;/think&gt;<main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        &lt;/think&gt;<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          &lt;/think&gt;<div className="bg-white rounded-xl border p-4 shadow-sm">
            &lt;/think&gt;<p className="text-[10px] text-slate-400 font-bold uppercase">Total SKUs&lt;/think&gt;</p>
            &lt;/think&gt;<p className="text-2xl font-black text-slate-900">{skus.length}&lt;/think&gt;</p>
          &lt;/think&gt;</div>
          &lt;/think&gt;<div className="bg-white rounded-xl border p-4 shadow-sm">
            &lt;/think&gt;<p className="text-[10px] text-slate-400 font-bold uppercase">Rentables&lt;/think&gt;</p>
            &lt;/think&gt;<p className="text-2xl font-black text-emerald-600">{rentables}&lt;/think&gt;</p>
          &lt;/think&gt;</div>
          &lt;/think&gt;<div className="bg-white rounded-xl border p-4 shadow-sm">
            &lt;/think&gt;<p className="text-[10px] text-slate-400 font-bold uppercase">No Rentables&lt;/think&gt;</p>
            &lt;/think&gt;<p className="text-2xl font-black text-amber-600">{skus.length - rentables}&lt;/think&gt;</p>
          &lt;/think&gt;</div>
          &lt;/think&gt;<div className="bg-white rounded-xl border p-4 shadow-sm">
            &lt;/think&gt;<p className="text-[10px] text-slate-400 font-bold uppercase">Margen Promedio&lt;/think&gt;</p>
            &lt;/think&gt;<p className="text-2xl font-black text-slate-900">{margenPromedio}%&lt;/think&gt;</p>
          &lt;/think&gt;</div>
        &lt;/think&gt;</div>

        &lt;/think&gt;<div className="relative">
          &lt;/think&gt;<Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          &lt;/think&gt;<input
            type="text"
            placeholder="Buscar por nombre, NCM o proveedor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-xl text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        &lt;/think&gt;</div>
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
          <input
            type="text"
            placeholder="Buscar por nombre, NCM o proveedor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-xl text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
               </details>

</div>
          &lt;/think&gt;</div>
        )}
      &lt;/think&gt;</main>

      {editingSku && (
        &lt;/think&gt;<SkuDetailEditor
          sku={editingSku}
          exchangeRate={EXCHANGE_RATE}
          usdToArsRate={usdToArs}
          shippingCostPerKg={SHIPPING_COST_PER_KG}
          onSave={() => { setEditingSku(null); reloadSkus(); }}
          onDelete={() => { setEditingSku(null); reloadSkus(); }}
          onClose={() => setEditingSku(null)}
        />
      )}
    &lt;/think&gt;</div>
  );
}
