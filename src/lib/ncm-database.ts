/**
 * NCM Local Database Service
 * Base de datos local de códigos NCM que crece con cada consulta IA.
 * Se almacena en localStorage del navegador.
 */

export interface NcmEntry {
  hsCode: string;                    // Código NCM 8 dígitos
  description: string;               // Descripción del producto
  tariffCategory: string;            // Categoría arancelaria
  reasoning: string;                 // Justificación técnica
  suggestedTariffRate: number;       // DIE Extrazona (%)
  suggestedStatisticalFee: number;   // Tasa Estadística (%)
  suggestedVatRate: number;          // IVA (%)
  origin: 'ai' | 'manual' | 'seed'; // Cómo se agregó
  lastUsed: string;                  // ISO timestamp
  useCount: number;                  // Veces que se usó
  tags: string[];                    // Tags para búsqueda
  notes?: string;                    // Notas del usuario
}

export interface NcmSearchResult {
  entry: NcmEntry;
  score: number; // Relevancia de búsqueda
}

const STORAGE_KEY = 'importflow_ncm_database';
const DB_VERSION = 1;

interface NcmDatabase {
  version: number;
  entries: Record<string, NcmEntry>; // keyed by hsCode
  lastUpdated: string;
  totalQueries: number;
}

// ─── Storage helpers ───

function getDatabase(): NcmDatabase {
  if (typeof window === 'undefined') {
    return { version: DB_VERSION, entries: {}, lastUpdated: new Date().toISOString(), totalQueries: 0 };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const db = JSON.parse(raw) as NcmDatabase;
      if (db.version === DB_VERSION) return db;
    }
  } catch (e) {
    console.warn('[NCM DB] Error reading database:', e);
  }
  return { version: DB_VERSION, entries: {}, lastUpdated: new Date().toISOString(), totalQueries: 0 };
}

function saveDatabase(db: NcmDatabase): void {
  if (typeof window === 'undefined') return;
  try {
    db.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.warn('[NCM DB] Error saving database:', e);
  }
}

// ─── CRUD Operations ───
