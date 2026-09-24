"use client";

import React, { useState, useEffect } from "react";
import {
  Save, Trash2, X, Search, Plus, Minus, Weight,
  Download, ShoppingCart, ArrowRight, Package, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatARS, calcularSkuRapido } from "@/lib/calculator-utils";
import {
  saveOrder, deleteOrder, type OrderData, type OrderItem, type OrderEstado,
  getOrderWeightGramos, getOrderCostCNY, getOrderCostUSD, getOrderCostARS,
} from "@/lib/order-database";
import { getAllSkus, type SkuData } from "@/lib/sku-database";

interface OrderEditorProps {
  order: OrderData;
  onSave: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function OrderEditor({ order: initialOrder, onSave, onDelete, onClose }: OrderEditorProps) {
  const [order, setOrder] = useState<OrderData>(initialOrder);
  const [skuSearch, setSkuSearch] = useState("");
  const [skus, setSkus] = useState<SkuData[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setSkus(getAllSkus());
  }, []);

  // Totales en tiempo real
  const pesoGramos = getOrderWeightGramos(order);
  const pesoKg = pesoGramos / 1000;
  const costoCNY = getOrderCostCNY(order);
  const costoUSD = getOrderCostUSD(order);
  const costoARS = getOrderCostARS(order);
  const totalUnidades = order.items.reduce((acc, i) => acc + i.cantidad, 0);

  // Barra de peso
  const pesoObjetivoKg = order.pesoObjetivoGramos / 1000;
  const pesoAlertaKg = pesoObjetivoKg * 1.2;
  const pesoPercent = Math.min((pesoKg / pesoAlertaKg) * 100, 100);
  const pesoColor = pesoKg <= pesoObjetivoKg
    ? "bg-emerald-500"
    : pesoKg <= pesoAlertaKg
      ? "bg-amber-500"
      : "bg-red-500";

  // Búsqueda de SKUs
  const filteredSkus = skus.filter(s => {
    if (!skuSearch.trim()) return true;
    const q = skuSearch.toLowerCase();
    return s.nombre.toLowerCase().includes(q) || s.ncm.includes(q) || s.proveedor.toLowerCase().includes(q);
  });

  // Agregar SKU a la orden
  const addSkuToOrder = (sku: SkuData) => {
    const existing = order.items.find(i => i.skuId === sku.id);
    if (existing) {
      updateItemCantidad(sku.id, existing.cantidad + 1);
    } else {
      const newItem: OrderItem = {
        skuId: sku.id,
        nombre: sku.nombre,
        ncm: sku.ncm,
        proveedor: sku.proveedor,
        linkProveedor: sku.linkProveedor,
        precioCompraCNY: sku.precioCompraCNY,
        pesoGramos: sku.pesoGramos,
        cantidad: 1,
        tariffRate: sku.tariffRate,
        statisticalFee: sku.statisticalFee,
        vatRate: sku.vatRate,
      };
      setOrder(prev => ({ ...prev, items: [...prev.items, newItem] }));
    }
    setSkuSearch("");
    setShowAdd(false);
  };

  // Actualizar cantidad
  const updateItemCantidad = (skuId: string, cantidad: number) => {
    if (cantidad < 1) return;
    setOrder(prev => ({
      ...prev,
      items: prev.items.map(i => i.skuId === skuId ? { ...i, cantidad } : i),
    }));
  };

  // Eliminar item
  const removeItem = (skuId: string) => {
    setOrder(prev => ({
      ...prev,
      items: prev.items.filter(i => i.skuId !== skuId),
    }));
  };

  // Guardar
  const handleSave = () => {
    saveOrder(order);
    onSave();
  };

  // Eliminar orden
  const handleDelete = () => {
    if (confirmDelete) {
      deleteOrder(order.id);
      onDelete();
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  // Exportar PDF
  const handleExportPDF = () => {
    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Orden de Compra - ${order.nombre}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1e293b; }
    .header { border-bottom: 3px solid #f97316; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { font-size: 24px; color: #0f172a; }
    .header p { color: #64748b; font-size: 13px; margin-top: 4px; }
    .meta { display: flex; gap: 40px; margin-bottom: 20px; }
    .meta div { flex: 1; }
    .meta label { font-size: 10px; text-transform: uppercase; color: #94a3b8; font-weight: bold; letter-spacing: 1px; }
    .meta p { font-size: 15px; font-weight: 600; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #f8fafc; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; }
    td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
    tr:hover td { background: #f8fafc; }
    .right { text-align: right; }
    .totals { margin-top: 20px; border-top: 2px solid #e2e8f0; padding-top: 20px; }
    .totals .row { display: flex; justify-content: space-between; padding: 6px 0; }
    .totals .row.total { font-size: 18px; font-weight: 900; border-top: 2px solid #f97316; padding-top: 12px; margin-top: 8px; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
    .badge-borrador { background: #f1f5f9; color: #475569; }
    .badge-enviada { background: #dbeafe; color: #1e40af; }
    .badge-recibida { background: #d1fae5; color: #065f46; }
    .badge-cancelada { background: #fee2e2; color: #991b1b; }
    .notes { margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 8px; }
    .notes p { font-size: 12px; color: #64748b; }
    .footer { margin-top: 40px; text-align: center; color: #94a3b8; font-size: 10px; border-top: 1px solid #e2e8f0; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📦 Orden de Compra</h1>
    <p>Generado desde ImportFlow - ${new Date().toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}</p>
  </div>

  <div class="meta">
    <div>
      <label>Orden</label>
      <p>${order.nombre}</p>
    </div>
    <div>
      <label>Proveedor</label>
      <p>${order.proveedor || "—"}</p>
    </div>
    <div>
      <label>Estado</label>
      <p><span class="badge badge-${order.estado}">${order.estado}</span></p>
    </div>
    <div>
      <label>Items</label>
      <p>${order.items.length} productos / ${totalUnidades} unidades</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Producto</th>
        <th>NCM</th>
        <th class="right">Precio Unit. (CNY)</th>
        <th class="right">Peso Unit. (g)</th>
        <th class="right">Cantidad</th>
        <th class="right">Subtotal CNY</th>
        <th class="right">Subtotal Peso</th>
      </tr>
    </thead>
    <tbody>
      ${order.items.map((item, i) => `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${item.nombre}</strong>${item.linkProveedor ? ` <a href="${item.linkProveedor}" style="color:#f97316;text-decoration:none;font-size:11px;">↗</a>` : ""}</td>
          <td>${item.ncm || "—"}</td>
          <td class="right">¥${item.precioCompraCNY.toFixed(2)}</td>
          <td class="right">${item.pesoGramos}g</td>
          <td class="right">${item.cantidad}</td>
          <td class="right">¥${(item.precioCompraCNY * item.cantidad).toFixed(2)}</td>
          <td class="right">${(item.pesoGramos * item.cantidad)}g</td>
        </tr>
      `).join("")}
    </tbody>
  </table>

  <div class="totals">
    <div class="row">
      <span>Peso Total</span>
      <span><strong>${pesoKg.toFixed(3)} kg</strong> (${pesoGramos}g)</span>
    </div>
    <div class="row">
      <span>Tipo de Cambio CNY/USD</span>
      <span>${order.exchangeRate}</span>
    </div>
    <div class="row">
      <span>Tipo de Cambio USD/ARS</span>
      <span>$${order.usdToArsRate}</span>
    </div>
    <div class="row">
      <span>Costo Total CNY</span>
      <span><strong>¥{costoCNY.toFixed(2)}</strong></span>
    </div>
    <div class="row">
      <span>Costo Total USD</span>
      <span><strong>$$$${costoUSD.toFixed(2)}</strong></span>
    </div>
    <div class="row total">
      <span>Costo Total ARS</span>
      <span>${formatARS(costoARS)}</span>
    </div>
  </div>

  ${order.notas ? `
    <div class="notes">
      <p><strong>Notas:</strong> ${order.notas}</p>
    </div>
  ` : ""}

  <div class="footer">
    ImportFlow - Documento generado automáticamente
  </div>
</body>
</html>`;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  const updateField = (field: keyof OrderData, value: any) => {
    setOrder(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5 text-orange-500" />
            <div>
              <input
                type="text"
                value={order.nombre}
                onChange={(e) => updateField("nombre", e.target.value)}
                className="text-lg font-extrabold text-slate-900 bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-full"
                placeholder="Nombre de la orden"
              />
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">{order.items.length} productos · {totalUnidades} unidades</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Meta */}
          <section className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Proveedor</label>
              <input
                type="text"
                value={order.proveedor}
                onChange={(e) => updateField("proveedor", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Nombre del proveedor"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Estado</label>
              <select
                value={order.estado}
                onChange={(e) => updateField("estado", e.target.value as OrderEstado)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              >
                <option value="borrador">Borrador</option>
                <option value="enviada">Enviada</option>
                <option value="recibida">Recibida</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Peso Objetivo (kg)</label>
              <input
                type="number"
                value={order.pesoObjetivoGramos / 1000}
                onChange={(e) => updateField("pesoObjetivoGramos", Number(e.target.value) * 1000)}
                className="w-full px-3 py-2 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </section>

          {/* Tasas de cambio */}
          <section className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tasa CNY/USD</label>
              <input
                type="number"
                step="0.0001"
                value={order.exchangeRate}
                onChange={(e) => updateField("exchangeRate", Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tasa USD/ARS</label>
              <input
                type="number"
                value={order.usdToArsRate}
                onChange={(e) => updateField("usdToArsRate", Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </section>

          <Separator />

          {/* Buscar y agregar SKUs */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Productos en la Orden</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdd(!showAdd)}
                className="text-xs h-7"
              >
                <Plus className="w-3 h-3 mr-1" />
                Agregar SKU
              </Button>
            </div>

            {showAdd && (
              <div className="mb-3 space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar SKU por nombre, NCM o proveedor..."
                    value={skuSearch}
                    onChange={(e) => setSkuSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    autoFocus
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 border rounded-lg p-1">
                  {filteredSkus.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">
                      {skus.length === 0 ? "No hay SKUs en la base" : "Sin resultados"}
                    </p>
                  ) : (
                    filteredSkus.map(sku => (
                      <div
                        key={sku.id}
                        onClick={() => addSkuToOrder(sku)}
                        className="flex items-center justify-between p-2 rounded hover:bg-orange-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Package className="w-3.5 h-3.5 text-slate-400" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">{sku.nombre}</p>
                            <p className="text-[10px] text-slate-400">
                              {sku.ncm && `NCM: ${sku.ncm} · `}¥{sku.precioCompraCNY} · {sku.pesoGramos}g
                              {sku.proveedor && ` · ${sku.proveedor}`}
                            </p>
                          </div>
                        </div>
                        <Plus className="w-4 h-4 text-orange-500" />
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Items de la orden */}
            {order.items.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
                <ShoppingCart className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No hay productos en esta orden</p>
                <p className="text-[10px] text-slate-300 mt-1">Hacé click en "Agregar SKU" para empezar</p>
              </div>
            ) : (
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.skuId} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-800 truncate">{item.nombre}</p>
                        {item.ncm && <span className="text-[9px] font-mono bg-slate-200 px-1.5 py-0.5 rounded text-slate-500">{item.ncm}</span>}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        ¥{item.precioCompraCNY} × {item.cantidad} = <strong>¥{(item.precioCompraCNY * item.cantidad).toFixed(2)}</strong>
                        {" · "}{item.pesoGramos}g × {item.cantidad} = <strong>{(item.pesoGramos * item.cantidad)}g</strong>
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => updateItemCantidad(item.skuId, item.cantidad - 1)}
                        className="w-7 h-7 rounded border bg-white hover:bg-slate-100 flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-3 h-3 text-slate-500" />
                      </button>
                      <input
                        type="number"
                        value={item.cantidad}
                        onChange={(e) => updateItemCantidad(item.skuId, Math.max(1, Number(e.target.value)))}
                        className="w-12 h-7 text-center border rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                      <button
                        onClick={() => updateItemCantidad(item.skuId, item.cantidad + 1)}
                        className="w-7 h-7 rounded border bg-white hover:bg-slate-100 flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-3 h-3 text-slate-500" />
                      </button>
                    </div>

                    {item.linkProveedor && (
                      <a
                        href={item.linkProveedor}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 hover:bg-slate-200 rounded transition-colors"
                      >
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    )}

                    <button
                      onClick={() => removeItem(item.skuId)}
                      className="p-1.5 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3 text-slate-400 hover:text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Barra de peso */}
          {order.items.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <Weight className="w-4 h-4 text-slate-500" />
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Peso de la Orden</h3>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border">
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <p className={`text-2xl font-black ${
                      pesoKg <= pesoObjetivoKg ? "text-emerald-600" : pesoKg <= pesoAlertaKg ? "text-amber-600" : "text-red-600"
                    }`}>
                      {pesoKg.toFixed(2)} kg
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {pesoGramos}g · Objetivo: {pesoObjetivoKg} kg · Alerta: {pesoAlertaKg.toFixed(1)} kg
                    </p>
                  </div>
                  <div className="text-right">
                    {pesoKg <= pesoObjetivoKg && (
                      <p className="text-xs font-bold text-emerald-600">✓ Dentro del objetivo</p>
                    )}
                    {pesoKg > pesoObjetivoKg && pesoKg <= pesoAlertaKg && (
                      <p className="text-xs font-bold text-amber-600">⚠ Cerca del límite ({pesoAlertaKg} kg)</p>
                    )}
                    {pesoKg > pesoAlertaKg && (
                      <p className="text-xs font-bold text-red-600">✗ Supera el límite ({pesoAlertaKg} kg)</p>
                    )}
                  </div>
                </div>

                {/* Barra visual */}
                <div className="h-4 bg-slate-200 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${pesoColor}`}
                    style={{ width: `${pesoPercent}%` }}
                  />
                  {/* Marker objetivo */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-700 opacity-60"
                    style={{ left: `${(pesoObjetivoKg / pesoAlertaKg) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                  <span>0 kg</span>
                  <span className="font-bold text-slate-600">{pesoObjetivoKg} kg (objetivo)</span>
                  <span>{pesoAlertaKg.toFixed(1)} kg (límite)</span>
                </div>
              </div>
            </section>
          )}

          {/* Totales */}
          {order.items.length > 0 && (
            <section className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Total Productos</span>
                <span className="font-bold">{order.items.length} SKUs · {totalUnidades} unidades</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Costo CNY</span>
                <span className="font-bold">¥{costoCNY.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Costo USD</span>
                <span className="font-bold">${costoUSD.toFixed(2)}</span>
              </div>
              <Separator className="my-1" />
              <div className="flex justify-between text-lg">
                <span className="font-bold text-slate-700">Costo Total ARS</span>
                <span className="font-black text-primary">{formatARS(costoARS)}</span>
              </div>
            </section>
          )}

          {/* Notas */}
          <section>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Notas</label>
            <textarea
              value={order.notas}
              onChange={(e) => updateField("notas", e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              placeholder="Observaciones, link del chat con el proveedor, condiciones especiales..."
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
            <Button
              variant="outline"
              onClick={handleExportPDF}
              disabled={order.items.length === 0}
              className="text-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Exportar PDF
            </Button>
            <Button variant="outline" onClick={onClose} className="text-xs">Cancelar</Button>
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
