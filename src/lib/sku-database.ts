// src/lib/sku-database.ts

export interface SkuData {
  id: string;
  nombre: string;
  proveedor: string;
  linkProveedor: string;
  ncm: string;
  precioCompraCNY: number;
  pesoGramos: number;
  costoEnvioUnitarioUSD: number;
  precioVentaML: number;
  margen: number;
  gananciaNetaARS: number;
  rentable: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
  notas: string;
  tariffRate: number;
  statisticalFee: number;
  vatRate: number;
  exchangeRate: number;
  usdToArsRate: number;
}

const DB_KEY = "importflow-skus-db";

export function getAllSkus(): SkuData[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((s: any) => ({
      id: s.id || "",
      nombre: s.nombre || s.id || "Sin nombre",
      proveedor: s.proveedor || "",
      linkProveedor: s.linkProveedor || "",
      ncm: s.ncm || "",
      precioCompraCNY: s.precioCompraCNY || 0,
      pesoGramos: s.pesoGramos || 100,
      costoEnvioUnitarioUSD: s.costoEnvioUnitarioUSD || 0,
      precioVentaML: s.precioVentaML || s.precio || 0,
      margen: s.margen || 0,
      gananciaNetaARS: s.gananciaNetaARS || 0,
      rentable: s.rentable || s.margen >= 30 || false,
      fechaCreacion: s.fechaCreacion || s.fecha || new Date().toISOString(),
      fechaActualizacion: s.fechaActualizacion || s.fecha || new Date().toISOString(),
      notas: s.notas || "",
      exchangeRate: s.exchangeRate ?? 0.14,
      usdToArsRate: s.usdToArsRate ?? 1550,
      tariffRate: s.tariffRate ?? 18,
      statisticalFee: s.statisticalFee ?? 3,
      vatRate: s.vatRate ?? 21,
    }));
  } catch {
    return [];
  }
}
export function saveSku(sku: SkuData): void {
  if (typeof window === "undefined") return;
  try {
    const all = getAllSkus();
    const idx = all.findIndex(s => s.id === sku.id);
    if (idx >= 0) {
      all[idx] = { ...sku, fechaActualizacion: new Date().toISOString() };
    } else {
      all.push({ ...sku, fechaCreacion: new Date().toISOString(), fechaActualizacion: new Date().toISOString() });
    }
    localStorage.setItem(DB_KEY, JSON.stringify(all));
  } catch (e) {
    console.error("Error saving SKU:", e);
  }
}

export function deleteSku(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const all = getAllSkus().filter(s => s.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(all));
  } catch (e) {
    console.error("Error deleting SKU:", e);
  }
}

export function getSkuById(id: string): SkuData | undefined {
  return getAllSkus().find(s => s.id === id);
}

export function makeSkuId(nombre: string): string {
  return nombre.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}
