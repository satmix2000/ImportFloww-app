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

  // 1. Valor FOB (Convertido de CNY a USD)
  const itemValueUSD = itemValueCNY * exchangeRate;

  // 2. Flete Base (Peso en gramos -> kg * costo por kg)
  const weightKg = weight / 1000;
  const baseShipping = weightKg * shippingCostPerKg;

  // 3. Cargos Courier Automatizados
  const fscScreen = baseShipping * 0.28; // 28% del valor del flete
  const almacenaje = weightKg * 1; // 1 USD por kg
  const cargoTerminal = itemValueUSD * 0.10; // 10% del valor FOB
  
  // 4. Seguro: 1% del valor FOB (Gravado con IVA 21%)
  const insurance = itemValueUSD * 0.01;

  // 5. IVA sobre Servicios (21% sobre Almacenaje, Cargo Terminal e Insurance)
  const logisticsServiceIva = (almacenaje + cargoTerminal + insurance) * 0.21;

  // 6. Total Logística y Flete (Incluye servicios gravados e IVA de servicios)
  const totalLogisticsUSD = baseShipping + fscScreen + almacenaje + cargoTerminal + insurance + logisticsServiceIva;

  // 7. Valor CIF (Base Aduana) = FOB + Logística Total + Gastos Varios
  const cifValue = itemValueUSD + totalLogisticsUSD + miscellaneous;
  
  // 8. Impuestos Aduaneros (Sobre CIF)
  const dutyAmount = cifValue * (tariffRate / 100);
  const statisticalAmount = cifValue * (statisticalFee / 100);
  
  // 9. Base Imponible IVA Aduana (CIF + DIE + Tasa Estadística)
  const taxableBaseForVat = cifValue + dutyAmount + statisticalAmount;
  const vatAmount = taxableBaseForVat * (vatRate / 100);
  
  // 10. Totales Finales
  const totalAcquisitionCostUSD = taxableBaseForVat + vatAmount;
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