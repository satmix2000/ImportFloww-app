"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, Package, ArrowLeft, ShoppingCart, Weight, DollarSign, Trash2, ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatARS } from "@/lib/calculator-utils";
import {
  getAllOrders, deleteOrder, type OrderData,
  getOrderWeightGramos, getOrderCostCNY, getOrderCostUSD, getOrderCostARS,
} from "@/lib/order-database";
import { OrderEditor } from "@/components/orders/order-editor";

const ESTADO_COLORS: Record<string, string> = {
  borrador: "bg-slate-100 text-slate-700",
  enviada: "bg-blue-100 text-blue-700",
  recibida: "bg-emerald-100 text-emerald-700",
  cancelada: "bg-red-100 text-red-700",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [search, setSearch] = useState("");
  const [editingOrder, setEditingOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    setOrders(getAllOrders());
  }, []);

  const reloadOrders = () => setOrders(getAllOrders());

  const filtered = orders.filter(o =>
    o.nombre.toLowerCase().includes(search.toLowerCase()) ||
    o.proveedor.toLowerCase().includes(search.toLowerCase())
  );

  const handleNewOrder = () => {
    const newOrder: OrderData = {
      id: "orden-" + Date.now(),
      nombre: "Nueva Orden",
      proveedor: "",
      items: [],
      estado: "borrador",
      pesoObjetivoGramos: 20000,
      exchangeRate: 0.14,
      usdToArsRate: 1550,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
      notas: "",
    };
    setEditingOrder(newOrder);
  };

  const totalPeso = orders.reduce((acc, o) => acc + getOrderWeightGramos(o), 0);
  const totalARS = orders.reduce((acc, o) => acc + getOrderCostARS(o), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4 text-slate-600" />
            </a>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-base font-extrabold text-slate-900">Órdenes de Compra</h1>
                <p className="text-[9px] text-slate-400 tracking-widest uppercase">ImportFlow</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="/skus" className="px-3 py-1.5 border rounded-lg text-xs hover:bg-slate-50 transition-colors flex items-center gap-1">
              <Package className="w-3 h-3" /> SKUs
            </a>
            <Button size="sm" onClick={handleNewOrder} className="bg-orange-500 hover:bg-orange-600 text-xs h-8">
              <Plus className="w-3 h-3 mr-1" />
              Nueva Orden
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Total Órdenes</p>
            <p className="text-2xl font-black text-slate-900">{orders.length}</p>
          </div>
          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Peso Total</p>
            <p className="text-2xl font-black text-slate-900">{(totalPeso / 1000).toFixed(1)} kg</p>
          </div>
          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Inversión Total</p>
            <p className="text-2xl font-black text-emerald-600">{formatARS(totalARS)}</p>
          </div>
          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <p className="text-[10px] text-slate-400 font-bold uppercase">Items Totales</p>
            <p className="text-2xl font-black text-slate-900">
              {orders.reduce((acc, o) => acc + o.items.length, 0)}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar orden o proveedor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-xl text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Orders List */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <h3 className="font-bold text-slate-400">{orders.length === 0 ? "No hay órdenes creadas" : "Sin resultados"}</h3>
            <p className="text-xs text-slate-400 mt-1">
              {orders.length === 0 ? "Creá tu primera orden de compra" : "Probá con otra búsqueda"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => {
              const peso = getOrderWeightGramos(order);
              const costoCNY = getOrderCostCNY(order);
              const costoARS = getOrderCostARS(order);
              const totalItems = order.items.reduce((acc, i) => acc + i.cantidad, 0);
              const pesoKg = peso / 1000;
              const pesoObjetivoKg = order.pesoObjetivoGramos / 1000;
              const pesoPercent = Math.min((peso / order.pesoObjetivoGramos) * 100, 100);
              const pesoColor = pesoKg <= pesoObjetivoKg
                ? "bg-emerald-500"
                : pesoKg <= pesoObjetivoKg * 1.2
                  ? "bg-amber-500"
                  : "bg-red-500";

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setEditingOrder(order)}
                >
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-sm text-slate-900 truncate">{order.nombre}</h3>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${ESTADO_COLORS[order.estado]}`}>
                            {order.estado}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400">
                          <span className="font-medium">{order.proveedor || "Sin proveedor"}</span>
                          <span>{order.items.length} productos</span>
                          <span>{totalItems} unidades</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <p className="text-lg font-black text-slate-900">{pesoKg.toFixed(2)} kg</p>
                          <p className="text-[10px] text-slate-400">¥{costoCNY.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-emerald-600">{formatARS(costoARS)}</p>
                          <p className="text-[10px] text-slate-400">{order.items.length} items</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Eliminar orden "${order.nombre}"?`)) {
                              deleteOrder(order.id);
                              reloadOrders();
                            }
                          }}
                          className="p-1.5 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
                        </button>
                      </div>
                    </div>

                    {/* Weight bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>0 kg</span>
                        <span className="font-bold text-slate-600">{pesoKg.toFixed(2)} / {pesoObjetivoKg} kg</span>
                        <span>{pesoObjetivoKg * 1.2} kg</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden relative">
                        <div
                          className={`h-full rounded-full transition-all ${pesoColor}`}
                          style={{ width: `${pesoPercent}%` }}
                        />
                        {/* Target marker */}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-slate-600"
                          style={{ left: `${(order.pesoObjetivoGramos / (order.pesoObjetivoGramos * 1.2)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {editingOrder && (
        <OrderEditor
          order={editingOrder}
          onSave={() => { setEditingOrder(null); reloadOrders(); }}
          onDelete={() => { setEditingOrder(null); reloadOrders(); }}
          onClose={() => setEditingOrder(null)}
        />
      )}
    </div>
  );
}
