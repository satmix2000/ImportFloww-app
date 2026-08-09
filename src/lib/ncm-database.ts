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

/**
 * Agrega o actualiza una entrada NCM en la base local.
 * Si ya existe, incrementa el contador de uso y actualiza los datos.
 */
export function saveNcmEntry(entry: Omit<NcmEntry, 'lastUsed' | 'useCount'>): NcmEntry {
  const db = getDatabase();
  const existing = db.entries[entry.hsCode];

  const saved: NcmEntry = {
    ...entry,
    lastUsed: new Date().toISOString(),
    useCount: existing ? existing.useCount + 1 : 1,
    tags: entry.tags.length > 0 ? entry.tags : generateTags(entry.description),
  };

  db.entries[entry.hsCode] = saved;
  db.totalQueries += 1;
  saveDatabase(db);
  return saved;
}

/**
 * Busca entradas por texto libre (descripción, código, tags).
 * Retorna resultados ordenados por relevancia.
 */
export function searchNcm(query: string): NcmSearchResult[] {
  const db = getDatabase();
  const q = query.toLowerCase().trim();
  if (!q) return getAllEntries().map(e => ({ entry: e, score: 0 }));

  const results: NcmSearchResult[] = [];

  for (const entry of Object.values(db.entries)) {
    let score = 0;

    // Coincidencia exacta de código → máxima prioridad
    if (entry.hsCode === q || entry.hsCode.replace(/\./g, '') === q.replace(/\./g, '')) {
      score = 100;
    }
    // Código empieza con la query
    else if (entry.hsCode.startsWith(q)) {
      score = 80;
    }
    // Código contiene la query
    else if (entry.hsCode.includes(q)) {
      score = 60;
    }

    // Coincidencia en descripción
    const desc = entry.description.toLowerCase();
    if (desc.includes(q)) {
      score += 40;
      // Palabra completa en descripción
      if (desc.split(/\s+/).some(w => w.startsWith(q))) {
        score += 15;
      }
    }

    // Coincidencia en tags
    if (entry.tags.some(t => t.toLowerCase().includes(q))) {
      score += 25;
    }

    // Coincidencia en categoría
    if (entry.tariffCategory.toLowerCase().includes(q)) {
      score += 20;
    }

    // Bonus por uso frecuente
    score += Math.min(entry.useCount * 2, 10);

    if (score > 0) {
      results.push({ entry, score });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

/**
 * Obtiene una entrada por código NCM.
 */
export function getNcmByCode(hsCode: string): NcmEntry | null {
  const db = getDatabase();
  return db.entries[hsCode] || null;
}

/**
 * Obtiene todas las entradas ordenadas por último uso.
 */
export function getAllEntries(): NcmEntry[] {
  const db = getDatabase();
  return Object.values(db.entries).sort(
    (a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()
  );
}

/**
 * Obtiene las entradas más usadas.
 */
export function getTopEntries(limit: number = 10): NcmEntry[] {
  const db = getDatabase();
  return Object.values(db.entries)
    .sort((a, b) => b.useCount - a.useCount)
    .slice(0, limit);
}

/**
 * Elimina una entrada por código NCM.
 */
export function deleteNcmEntry(hsCode: string): boolean {
  const db = getDatabase();
  if (db.entries[hsCode]) {
    delete db.entries[hsCode];
    saveDatabase(db);
    return true;
  }
  return false;
}

/**
 * Actualiza notas del usuario para una entrada.
 */
export function updateNcmNotes(hsCode: string, notes: string): boolean {
  const db = getDatabase();
  if (db.entries[hsCode]) {
    db.entries[hsCode].notes = notes;
    saveDatabase(db);
    return true;
  }
  return false;
}

/**
 * Obtiene estadísticas de la base de datos.
 */
export function getNcmStats(): {
  totalEntries: number;
  totalQueries: number;
  lastUpdated: string;
  topCategories: { category: string; count: number }[];
} {
  const db = getDatabase();
  const entries = Object.values(db.entries);

  // Contar categorías
  const catCounts: Record<string, number> = {};
  for (const e of entries) {
    const cat = e.tariffCategory || 'Sin categoría';
    catCounts[cat] = (catCounts[cat] || 0) + 1;
  }

  const topCategories = Object.entries(catCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalEntries: entries.length,
    totalQueries: db.totalQueries,
    lastUpdated: db.lastUpdated,
    topCategories,
  };
}

/**
 * Exporta toda la base como JSON (para backup).
 */
export function exportDatabase(): string {
  const db = getDatabase();
  return JSON.stringify(db, null, 2);
}

/**
 * Importa un JSON de backup.
 */
export function importDatabase(json: string): { success: boolean; imported: number } {
  try {
    const db = JSON.parse(json) as NcmDatabase;
    if (db.version !== DB_VERSION) {
      return { success: false, imported: 0 };
    }
    saveDatabase(db);
    return { success: true, imported: Object.keys(db.entries).length };
  } catch {
    return { success: false, imported: 0 };
  }
}

// ─── Utilities ───

function generateTags(description: string): string[] {
  const words = description
    .toLowerCase()
    .replace(/[^\w\sáéíóúñü]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3)
    .filter(w => !['para', 'como', 'esta', 'tiene', 'puede', 'donde', 'sobre'].includes(w));
  return [...new Set(words)].slice(0, 8);
}

/**
 * Carga el seed data inicial si la base está vacía.
 */
export function initializeDatabaseWithSeed(): number {
  const db = getDatabase();
  if (Object.keys(db.entries).length > 0) return 0; // Ya tiene datos

  const seedEntries = getSeedData();
  for (const entry of seedEntries) {
    db.entries[entry.hsCode] = {
      ...entry,
      lastUsed: new Date().toISOString(),
      useCount: 0,
      origin: 'seed',
    };
  }
  saveDatabase(db);
  return seedEntries.length;
}

// ─── Seed Data: Códigos NCM comunes para importación Argentina ───

function getSeedData(): Omit<NcmEntry, 'lastUsed' | 'useCount' | 'origin'>[] {
  return [
    // Electrónica
    {
      hsCode: '8471.30.00',
      description: 'Laptops y computadoras portátiles',
      tariffCategory: 'Máquinas automáticas para procesamiento de datos',
      reasoning: 'Nota de Sección XVI. Incluye laptops, notebooks y portátiles. Exento de tasa estadística según decreto.',
      suggestedTariffRate: 0,
      suggestedStatisticalFee: 0,
      suggestedVatRate: 21,
      tags: ['laptop', 'notebook', 'computadora', 'portatil', 'electronica'],
    },
    {
      hsCode: '8517.12.00',
      description: 'Teléfonos celulares y smartphones',
      tariffCategory: 'Teléfonos para redes celulares',
      reasoning: 'Incluye smartphones, teléfonos móviles. DIE 0% por Resolución. IVA 21%.',
      suggestedTariffRate: 0,
      suggestedStatisticalFee: 0,
      suggestedVatRate: 21,
      tags: ['celular', 'smartphone', 'telefono', 'movil', 'iphone', 'samsung', 'xiaomi'],
    },
    {
      hsCode: '8528.72.00',
      description: 'Monitores y pantallas LCD/LED',
      tariffCategory: 'Aparatos de recepción de televisión',
      reasoning: 'Monitores sin tuner de TV. Pantallas LCD, LED, OLED. DIE variable según tamaño.',
      suggestedTariffRate: 16,
      suggestedStatisticalFee: 3,
      suggestedVatRate: 21,
      tags: ['monitor', 'pantalla', 'lcd', 'led', 'oled', 'display'],
    },
    {
      hsCode: '8542.31.00',
      description: 'Procesadores y microprocesadores',
      tariffCategory: 'Circuitos electrónicos integrados',
      reasoning: 'Incluye CPUs, GPUs, procesadores. Exento de tasa estadística por su naturaleza.',
      suggestedTariffRate: 0,
      suggestedStatisticalFee: 0,
      suggestedVatRate: 21,
      tags: ['procesador', 'cpu', 'gpu', 'chip', 'intel', 'amd', 'microprocesador'],
    },
    {
      hsCode: '8504.40.00',
      description: 'Fuentes de alimentación, cargadores y adaptadores',
      tariffCategory: 'Convertidores estáticos',
      reasoning: 'Incluye cargadores USB, adaptadores AC/DC, power banks. DIE según potencia.',
      suggestedTariffRate: 14,
      suggestedStatisticalFee: 3,
      suggestedVatRate: 21,
      tags: ['cargador', 'adaptador', 'fuente', 'power bank', 'usb', 'cable'],
    },
    // Componentes electrónicos
    {
      hsCode: '8534.00.00',
      description: 'Circuitos impresos y PCBs',
      tariffCategory: 'Circuitos impresos',
      reasoning: 'Placas de circuito impreso, PCBs. Incluye placas pobladas y desnudas.',
      suggestedTariffRate: 12,
      suggestedStatisticalFee: 3,
      suggestedVatRate: 21,
      tags: ['pcb', 'circuito', 'placa', 'board', 'electronic'],
    },
    {
      hsCode: '8541.40.00',
      description: 'LEDs, diodos emisores de luz, fotoceldas',
      tariffCategory: 'Dispositivos semiconductores',
      reasoning: 'Incluye LEDs de todo tipo, diodos emisores, fotoceldas. DIE 2% general.',
      suggestedTariffRate: 2,
      suggestedStatisticalFee: 3,
      suggestedVatRate: 21,
      tags: ['led', 'diodo', 'fotocelda', 'semiconductor', 'luz'],
    },
    {
      hsCode: '8536.90.00',
      description: 'Conectores eléctricos, enchufes, zócalos',
      tariffCategory: 'Aparatos para conexiones eléctricas',
      reasoning: 'Incluye conectores USB, HDMI, RJ45, terminales, bornes. Hasta 1000V.',
      suggestedTariffRate: 14,
      suggestedStatisticalFee: 3,
      suggestedVatRate: 21,
      tags: ['conector', 'enchufe', 'zocalo', 'usb', 'hdmi', 'rj45', 'terminal'],
    },
    // Audio y video
    {
      hsCode: '8518.30.00',
      description: 'Auriculares, audífonos, cascos de audio',
      tariffCategory: 'Auriculares y micrófonos',
      reasoning: 'Incluye auriculares con o sin micrófono, cascos, earbuds. DIE 16%.',
      suggestedTariffRate: 16,
      suggestedStatisticalFee: 3,
      suggestedVatRate: 21,
      tags: ['auricular', 'audifono', 'casco', 'headphone', 'earbuds', 'airpods'],
    },
    {
      hsCode: '8519.81.00',
      description: 'Reproductores de audio digital (MP3, streaming)',
      tariffCategory: 'Aparatos de grabación o reproducción de sonido',
      reasoning: 'Incluye reproductores portátiles, DACs, streamers de audio.',
      suggestedTariffRate: 16,
      suggestedStatisticalFee: 3,
      suggestedVatRate: 21,
      tags: ['reproductor', 'mp3', 'dac', 'audio', 'streaming'],
    },
    // Iluminación
    {
      hsCode: '9405.42.00',
      description: 'Lámparas LED y luminarias',
      tariffCategory: 'Aparatos de iluminación eléctrica',
      reasoning: 'Lámparas LED, focos, tiras LED, paneles LED. DIE 18% general.',
      suggestedTariffRate: 18,
      suggestedStatisticalFee: 3,
      suggestedVatRate: 21,
      tags: ['lampara', 'led', 'foco', 'luz', 'luminaria', 'tira led'],
    },
    // Herramientas
    {
      hsCode: '8467.21.00',
      description: 'Taladros eléctricos',
      tariffCategory: 'Herramientas neumáticas o eléctricas',
      reasoning: 'Taladros de todo tipo con motor eléctrico. DIE 18%.',
      suggestedTariffRate: 18,
      suggestedStatisticalFee: 3,
      suggestedVatRate: 21,
      tags: ['taladro', 'herramienta', 'electrico', 'perforador'],
    },
    // Sensores y medición
    {
      hsCode: '9031.80.00',
      description: 'Sensores, instrumentos de medición',
      tariffCategory: 'Instrumentos de medición o control',
      reasoning: 'Incluye sensores de proximidad, temperatura, presión. Amplia gama.',
      suggestedTariffRate: 14,
      suggestedStatisticalFee: 3,
      suggestedVatRate: 21,
      tags: ['sensor', 'medicion', 'instrumento', 'control', 'industrial'],
    },
    // Robótica y makers
    {
      hsCode: '8542.39.00',
      description: 'Microcontroladores (Arduino, ESP32, STM32)',
      tariffCategory: 'Circuitos electrónicos integrados - otros',
      reasoning: 'Microcontroladores y SoCs. Similar a procesadores pero para control embebido.',
      suggestedTariffRate: 0,
      suggestedStatisticalFee: 0,
      suggestedVatRate: 21,
      tags: ['arduino', 'esp32', 'stm32', 'microcontrolador', 'mcu', 'maker', 'robotica'],
    },
    // Baterías
    {
      hsCode: '8507.60.00',
      description: 'Baterías de litio (Li-ion, LiPo)',
      tariffCategory: 'Acumuladores eléctricos de litio',
      reasoning: 'Baterías recargables de litio. DIE 16%. Regulaciones de transporte IATA.',
      suggestedTariffRate: 16,
      suggestedStatisticalFee: 3,
      suggestedVatRate: 21,
      tags: ['bateria', 'litio', 'li-ion', 'lipo', 'recargable', 'powerbank'],
    },
    // Impresión 3D
    {
      hsCode: '8485.20.00',
      description: 'Impresoras 3D y filamentos',
      tariffCategory: 'Máquinas de impresión tridimensional',
      reasoning: 'Impresoras 3D, filamentos PLA/ABS. DIE 14% para impresoras.',
      suggestedTariffRate: 14,
      suggestedStatisticalFee: 3,
      suggestedVatRate: 21,
      tags: ['impresora', '3d', 'filamento', 'pla', 'abs', 'maker'],
    },
    // Cámaras y vigilancia
    {
      hsCode: '8525.89.00',
      description: 'Cámaras de vigilancia, webcams, cámaras IP',
      tariffCategory: 'Aparatos de televisión, cámaras de vídeo',
      reasoning: 'Cámaras digitales, webcams, cámaras IP de vigilancia. DIE 16%.',
      suggestedTariffRate: 16,
      suggestedStatisticalFee: 3,
      suggestedVatRate: 21,
      tags: ['camara', 'webcam', 'vigilancia', 'ip', 'seguridad', 'cctv'],
    },
    // Textil / Indumentaria
    {
      hsCode: '6109.10.00',
      description: 'Remeras y camisetas de algodón',
      tariffCategory: 'Camisetas de punto de algodón',
      reasoning: 'Prendas de punto, algodón. DIE 35% para extrazona. MERCOSUR 0%.',
      suggestedTariffRate: 35,
      suggestedStatisticalFee: 3,
      suggestedVatRate: 21,
      tags: ['remera', 'camiseta', 'algodon', 'ropa', 'textil', 'indumentaria'],
    },
    // Calzado
    {
      hsCode: '6403.99.00',
      description: 'Zapatillas y calzado deportivo',
      tariffCategory: 'Calzado deportivo de cuero',
      reasoning: 'Calzado deportivo. DIE 35% extrazona. Las zapatillas comunes van acá.',
      suggestedTariffRate: 35,
      suggestedStatisticalFee: 3,
      suggestedVatRate: 21,
      tags: ['zapatilla', 'calzado', 'deportivo', 'zapato', 'nike', 'adidas'],
    },
    // Juguetes
    {
      hsCode: '9503.00.00',
      description: 'Juguetes, juegos, modelos a escala',
      tariffCategory: 'Juguetes y juegos',
      reasoning: 'Amplia gama de juguetes. DIE 35% para extrazona. Incluye drones de juguete.',
      suggestedTariffRate: 35,
      suggestedStatisticalFee: 3,
      suggestedVatRate: 21,
      tags: ['juguete', 'juego', 'modelo', 'rc', 'drone', 'nino'],
    },
    // Relojes
    {
      hsCode: '9102.12.00',
      description: 'Relojes de pulsera digitales/smartwatches',
      tariffCategory: 'Relojes de pulsera',
      reasoning: 'Relojes electrónicos y smartwatches. DIE 18% extrazona.',
      suggestedTariffRate: 18,
      suggestedStatisticalFee: 3,
      suggestedVatRate: 21,
      tags: ['reloj', 'smartwatch', 'pulsera', 'digital', 'apple watch'],
    },
    // Gafas
    {
      hsCode: '9004.10.00',
      description: 'Gafas de sol',
      tariffCategory: 'Gafas y artículos similares',
      reasoning: 'Gafas de sol. DIE 18% extrazona.',
      suggestedTariffRate: 18,
      suggestedStatisticalFee: 3,
      suggestedVatRate: 21,
      tags: ['gafas', 'lentes', 'sol', 'rayban', 'ojos'],
    },
    // Mochilas y bolsos
    {
      hsCode: '4202.92.00',
      description: 'Mochilas, bolsos, neceseres',
      tariffCategory: 'Artículos de marroquineria',
      reasoning: 'Mochilas y bolsos de materiales plásticos o textiles. DIE 35%.',
      suggestedTariffRate: 35,
      suggestedStatisticalFee: 3,
      suggestedVatRate: 21,
      tags: ['mochila', 'bolso', 'neceser', 'cartera', 'maletin'],
    },
    // Cocina / Hogar
    {
      hsCode: '8516.60.00',
      description: 'Hornos eléctricos, air fryers, tostadoras',
      tariffCategory: 'Aparatos electrothermicos de cocción',
      reasoning: 'Hornos eléctricos, freidoras de aire, tostadoras. DIE 20%.',
      suggestedTariffRate: 20,
      suggestedStatisticalFee: 3,
      suggestedVatRate: 21,
      tags: ['horno', 'air fryer', 'tostadora', 'cocina', 'electrodomestico'],
    },
    // Drones
    {
      hsCode: '8802.20.00',
      description: 'Drones y vehículos aéreos no tripulados',
      tariffCategory: 'Aerodinos de peso inferior a 2000 kg',
      reasoning: 'Drones con cámara o sin ella. DIE 2%. Regulaciones ANAC.',
      suggestedTariffRate: 2,
      suggestedStatisticalFee: 3,
      suggestedVatRate: 21,
      tags: ['drone', 'uav', 'aereo', 'camara', 'dji', 'vuelo'],
    },
    // Instrumentos musicales
    {
      hsCode: '9207.90.00',
      description: 'Teclados y sintetizadores electrónicos',
      tariffCategory: 'Instrumentos musicales eléctricos',
      reasoning: 'Teclados musicales, sintetizadores, MIDI controllers. DIE 20%.',
      suggestedTariffRate: 20,
      suggestedStatisticalFee: 3,
      suggestedVatRate: 21,
      tags: ['teclado', 'sintetizador', 'musica', 'midi', 'piano'],
    },
    // Fuentes de poder industriales
    {
      hsCode: '8504.40.90',
      description: 'Inversores y convertidores de potencia',
      tariffCategory: 'Convertidores estáticos - otros',
      reasoning: 'Inversores DC-AC, convertidores de voltaje, UPS. DIE 14%.',
      suggestedTariffRate: 14,
      suggestedStatisticalFee: 3,
      suggestedVatRate: 21,
      tags: ['inversor', 'convertidor', 'ups', 'potencia', 'industrial'],
    },
  ];
}
