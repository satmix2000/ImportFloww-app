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
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Migrar SKUs viejos al formato nuevo
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
      rentable: s.rentable || false,
      fechaCreacion: s.fechaCreacion || s.fecha || new Date().toISOString(),
      fechaActualizacion: s.fechaActualizacion || s.fecha || new Date().toISOString(),
      notas: s.notas || "",
    }));
  } catch {
    return [];
  }
}

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
    }));
  } catch {
    return [];
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
