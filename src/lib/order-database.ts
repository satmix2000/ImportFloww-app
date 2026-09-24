export type OrderEstado = "borrador" | "enviada" | "recibida" | "cancelada";

export interface OrderItem {
  skuId: string;
  nombre: string;
  ncm: string;
  proveedor: string;
  linkProveedor: string;
  precioCompraCNY: number;
  pesoGramos: number;
  cantidad: number;
  tariffRate: number;
  statisticalFee: number;
  vatRate: number;
}

export interface OrderData {
  id: string;
  nombre: string;
  proveedor: string;
  items: OrderItem[];
  estado: OrderEstado;
  pesoObjetivoGramos: number;
  exchangeRate: number;
  usdToArsRate: number;
  fechaCreacion: string;
  fechaActualizacion: string;
  notas: string;
}

const DB_KEY = "importflow-orders-db";

export function getAllOrders(): OrderData[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((o: any) => ({
      id: o.id || "",
      nombre: o.nombre || "Sin nombre",
      proveedor: o.proveedor || "",
      items: o.items || [],
      estado: o.estado || "borrador",
      pesoObjetivoGramos: o.pesoObjetivoGramos || 20000,
      exchangeRate: o.exchangeRate ?? 0.14,
      usdToArsRate: o.usdToArsRate ?? 1550,
      fechaCreacion: o.fechaCreacion || new Date().toISOString(),
      fechaActualizacion: o.fechaActualizacion || new Date().toISOString(),
      notas: o.notas || "",
    }));
  } catch {
    return [];
  }
}

export function saveOrder(order: OrderData): void {
  if (typeof window === "undefined") return;
  try {
    const all = getAllOrders();
    const idx = all.findIndex(o => o.id === order.id);
    if (idx >= 0) {
      all[idx] = { ...order, fechaActualizacion: new Date().toISOString() };
    } else {
      all.push({ ...order, fechaCreacion: new Date().toISOString(), fechaActualizacion: new Date().toISOString() });
    }
    localStorage.setItem(DB_KEY, JSON.stringify(all));
  } catch (e) {
    console.error("Error saving order:", e);
  }
}

export function deleteOrder(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const all = getAllOrders().filter(o => o.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(all));
  } catch (e) {
    console.error("Error deleting order:", e);
  }
}

export function getOrderById(id: string): OrderData | undefined {
  return getAllOrders().find(o => o.id === id);
}

export function makeOrderId(nombre: string): string {
  return nombre.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

// Helpers de cálculo
export function getOrderWeightGramos(order: OrderData): number {
  return order.items.reduce((acc, item) => acc + item.pesoGramos * item.cantidad, 0);
}

export function getOrderCostCNY(order: OrderData): number {
  return order.items.reduce((acc, item) => acc + item.precioCompraCNY * item.cantidad, 0);
}

export function getOrderCostUSD(order: OrderData): number {
  return getOrderCostCNY(order) * order.exchangeRate;
}

export function getOrderCostARS(order: OrderData): number {
  return getOrderCostUSD(order) * order.usdToArsRate;
}
