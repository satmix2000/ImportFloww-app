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
  fobAdjustmentUSD?: number; // <--- NUEVO: El "ajuste" que no ve la aduana
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
    itemValueCNY, exchangeRate, weight, shippingCostPerKg, 
    miscellaneous, tariffRate, statisticalFee, vatRate, 
    usdToArsRate, fobAdjustmentUSD = 0 // <--- Recuperamos el ajuste con valor default 0
  } = costs;

  // 1. FOB Declarado (el que bajamos con el botón "adj." para Aduana)
  const itemValueUSD = itemValueCNY * exchangeRate;

  // 2. Logística Real (Lo que realmente pagás al courier/transporte)
  const weightKg = weight / 1000;
  const baseShipping = weightKg * shippingCostPerKg;
  const fscScreen = baseShipping * 0.28; 
  const almacenaje = weightKg * 1; 
  const cargoTerminal = itemValueUSD * 0.10; 
  const insurance = itemValueUSD * 0.01; 
  const logisticsServiceIva = (almacenaje + cargoTerminal + insurance) * 0.21;
  const totalLogisticsUSD = baseShipping + fscScreen + almacenaje + cargoTerminal + insurance + logisticsServiceIva;

  // 3. Base Aduana (Sobre el valor FOB Declarado)
  const aduanaFreightAdjustment = itemValueUSD * 0.20; 
  const cifValue = itemValueUSD + aduanaFreightAdjustment + insurance;
  
  const dutyAmount = cifValue * (tariffRate / 100);
  const statisticalAmount = cifValue * (statisticalFee / 100);
  const taxableBaseForVat = cifValue + dutyAmount + statisticalAmount;
  const vatAmount = taxableBaseForVat * (vatRate / 100);
  
  // 4. Totales Finales (Costo Real de Bolsillo)
  const totalTaxesAduana = dutyAmount + statisticalAmount + vatAmount;
  
  // Aquí está la clave: Sumamos el fobAdjustmentUSD para que el costo total sea el real
  const totalAcquisitionCostUSD = itemValueUSD + fobAdjustmentUSD + totalLogisticsUSD + totalTaxesAduana + (miscellaneous || 0);
  const totalAcquisitionCostARS = totalAcquisitionCostUSD * usdToArsRate;

  return {
    itemValueUSD, baseShipping, fscScreen, almacenaje, cargoTerminal, insurance,
    logisticsServiceIva, totalLogisticsUSD, cifValue, dutyAmount,
    statisticalAmount, taxableBaseForVat, vatAmount,
    totalAcquisitionCostUSD, totalAcquisitionCostARS,
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
