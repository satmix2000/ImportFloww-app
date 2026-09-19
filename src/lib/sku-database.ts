// src/lib/sku-database.ts

export interface SkuData {
  id: string;
  nombre: string;
  proveedor: string;
  linkProveedor: string;
  ncm: string;
  precioCompraCNY: number;
  costoEnvioUnitarioUSD: number;
  precioVentaML: number;
  margen: number;
  gananciaNetaARS: number;
  rentable: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
  notas: string;
}

export interface SkuCalculado extends SkuData {
  costoImportacionUnitUSD: number;
  costoImportacionUnitARS: number;
  comisionML: number;
  costoFijoML: number;
  envioGratisML: number;
  gananciaBrutaARS: number;
}

const DB_KEY = "importflow-skus-db";

export function getAllSkus(): SkuData[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DB_KEY);
    return raw ? JSON.parse(raw) : [];
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
