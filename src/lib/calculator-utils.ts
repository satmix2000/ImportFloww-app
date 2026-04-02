export type ImportCosts = {
  itemValueCNY: number;
  exchangeRate: number; // 1 CNY = X USD
  weight: number; // En gramos
  shippingCostPerKg: number;
  miscellaneous: number;
  tariffRate: number;
  statisticalFee: number; // Tasa de Estadística (%)
  vatRate: number;
  usdToArsRate: number; // 1 USD = X ARS
};

export type ImportBreakdown = {
  itemValueUSD: number;
  baseShipping: number;
  fscScreen: number;
  almacenaje: number;
  cargoTerminal: number;
  insurance: number;
  logisticsServiceIva: number; // IVA 21% sobre Almacenaje, Terminal e Insurance
  totalLogisticsUSD: number;
  cifValue: number;
  dutyAmount: number;
  statisticalAmount: number;
  taxableBaseForVat: number;
  vatAmount: number;
  totalAcquisitionCostUSD: number;
  totalAcquisitionCostARS: number;
};

export function calculateImportBreakdown(costs: ImportCosts): ImportBreakdown {
  const { 
    itemValueCNY, 
    exchangeRate, 
    weight, 
    shippingCostPerKg, 
    miscellaneous, 
    tariffRate, 
    statisticalFee,
    vatRate,
    usdToArsRate
  } = costs;

  // 1. Valor FOB Real (Convertido de CNY a USD)
  const itemValueUSD = itemValueCNY * exchangeRate;

  // 2. Logística Real (Lo que realmente pagás al courier/transporte)
  const weightKg = weight / 1000;
  const baseShipping = weightKg * shippingCostPerKg;
  const fscScreen = baseShipping * 0.28; // 28% Fuel Surcharge
  const almacenaje = weightKg * 1; // 1 USD por kg
  const cargoTerminal = itemValueUSD * 0.10; // 10% del valor FOB
  const insurance = itemValueUSD * 0.01; // Seguro estimado

  // 3. IVA sobre Servicios Logísticos (21% sobre los cargos gravados)
  const logisticsServiceIva = (almacenaje + cargoTerminal + insurance) * 0.21;

  // 4. Total Logística USD (Costo real de bolsillo)
  const totalLogisticsUSD = baseShipping + fscScreen + almacenaje + cargoTerminal + insurance + logisticsServiceIva;

  // --- 🚨 LÓGICA DE ADUANA (VALORACIÓN) ---
  // La Aduana determina el CIF sumando un 20% de ajuste (flete presunto) + Seguro al FOB
  const aduanaFreightAdjustment = itemValueUSD * 0.20; 
  const cifValue = itemValueUSD + aduanaFreightAdjustment + insurance;
  // ----------------------------------------
  
  // 5. Impuestos Aduaneros (Calculados sobre el CIF Ajustado)
  const dutyAmount = cifValue * (tariffRate / 100);
  const statisticalAmount = cifValue * (statisticalFee / 100);
  
  // 6. Base Imponible IVA Aduana (CIF + DIE + Tasa Estadística)
  const taxableBaseForVat = cifValue + dutyAmount + statisticalAmount;
  const vatAmount = taxableBaseForVat * (vatRate / 100);
  
  // 7. Totales Finales de Adquisición
  // El costo total es la suma de la base imponible + el IVA de aduana + gastos varios
  const totalAcquisitionCostUSD = taxableBaseForVat + vatAmount + (miscellaneous || 0);
  const totalAcquisitionCostARS = totalAcquisitionCostUSD * usdToArsRate;

  return {
    itemValueUSD,
    baseShipping,
    fscScreen,
    almacenaje,
    cargoTerminal,
    insurance,
    logisticsServiceIva,
    totalLogisticsUSD,
    cifValue,
    dutyAmount,
    statisticalAmount,
    taxableBaseForVat,
    vatAmount,
    totalAcquisitionCostUSD,
    totalAcquisitionCostARS,
  };
}

// Formateadores de Moneda para la interfaz
export const formatCurrency = (value: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(value);
};

export const formatYuan = (value: number) => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
  }).format(value);
};

export const formatARS = (value: number) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(value);
};
