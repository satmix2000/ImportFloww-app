// src/lib/ml-constants.ts
// Configuración de costos Mercado Libre FULL
// Actualizado: Septiembre 2026

export const ML_DEFAULTS = {
  comisionPorcentaje: 16,

  costosFijos: [
    { hasta: 14999, costo: 1330 },
    { hasta: 23999, costo: 2740 },
    { hasta: 32999, costo: 3320 },
  ],

  envioGratis: [
    { desde: 33000, hasta: 49999, costo: 6190 },
    { desde: 50000, hasta: Infinity, costo: 6790 },
  ],
};

export type MLConfig = typeof ML_DEFAULTS;

const ML_STORAGE_KEY = "importflow-ml-config";

export function getMLConfig(): MLConfig {
  if (typeof window === "undefined") return ML_DEFAULTS;
  try {
    const raw = localStorage.getItem(ML_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return ML_DEFAULTS;
}

export function saveMLConfig(config: MLConfig): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ML_STORAGE_KEY, JSON.stringify(config));
  } catch {}
}
