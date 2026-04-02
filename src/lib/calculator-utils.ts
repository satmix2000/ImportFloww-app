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
  logisticsServiceIva: number; 
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

  // 1. Valor FOB Real (USD)
  const itemValueUSD = itemValueCNY * exchangeRate;

  // 2. Flete y Logística Real
  const weightKg = weight / 1000;
  const baseShipping = weightKg * shippingCostPerKg;
  const fscScreen = baseShipping * 0.28; 
  const almacenaje = weightKg * 1; 
  const cargoTerminal = itemValueUSD * 0.10; 
  const insurance = itemValueUSD * 0.01; 

  // 3. IVA sobre Servicios (Almacenaje, Terminal, Seguro)
  const logisticsServiceIva = (almacenaje + cargoTerminal + insurance) * 0.21;

  // 4. Total Logística de Bolsillo
  const totalLogisticsUSD = baseShipping + fscScreen + almacenaje + cargoTerminal + insurance + logisticsServiceIva;

  // --- 🚨 LÓGICA DE ADUANA (VALORACIÓN) ---
  // Base CIF = FOB + 20% Ajuste (Flete Presunto) + Seguro
  const aduanaFreightAdjustment = itemValueUSD * 0.20; 
  const cifValue = itemValueUSD + aduanaFreightAdjustment + insurance;
  
  // 5. Impuestos Aduaneros sobre CIF Ajustado
  const dutyAmount = cifValue * (tariffRate / 100);
  const statisticalAmount = cifValue * (statisticalFee / 100);
  
  // 6. Base Imponible IVA Aduana
  const taxableBaseForVat = cifValue + dutyAmount + statisticalAmount;
  const vatAmount = taxableBaseForVat * (vatRate / 100);
  
  // --- 🚨 PASO 10: TOTAL FINAL CORREGIDO ---
  // Sumamos: El producto (FOB) + Todo lo que te cobra el transporte + Los impuestos de AFIP
  const totalTaxesAduana = dutyAmount + statisticalAmount + vatAmount;
  
  const totalAcquisitionCostUSD = itemValueUSD + totalLogisticsUSD + totalTaxesAduana + (miscellaneous || 0);
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

// Formateadores
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
