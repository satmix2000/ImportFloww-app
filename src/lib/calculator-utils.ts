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
  fobAdjustmentUSD?: number;
  fscPercentage?: number; // Fuel Surcharge % sobre flete (default 28%)
  customsFreightPercentage?: number; // % del FOB que DHL declara como flete aduanero (default 10.7%)
  dhlHandlingFee?: number; // Cargo fijo de DHL por manejo de documentación (default 15 USD)
};

export type ImportBreakdown = {
  itemValueUSD: number;
  baseShipping: number;
  fscAmount: number;
  insurance: number;
  dhlHandlingFee: number;
  totalLogisticsUSD: number;
  customsFreight: number;
  cifValue: number;
  dutyAmount: number;
  statisticalAmount: number;
  taxableBaseForVat: number;
  vatAmount: number;
  totalTaxesUSD: number;
  totalAcquisitionCostUSD: number;
  totalAcquisitionCostARS: number;
};

export function calculateImportBreakdown(costs: ImportCosts): ImportBreakdown {
  const {
    itemValueCNY, exchangeRate, weight, shippingCostPerKg,
    miscellaneous, tariffRate, statisticalFee, vatRate,
    usdToArsRate, fobAdjustmentUSD = 0,
    fscPercentage = 28,
    customsFreightPercentage = 10.7,
    dhlHandlingFee = 15,
  } = costs;

  // 1. FOB Declarado
  const itemValueUSD = itemValueCNY * exchangeRate;

  // 2. Logística Real (lo que pagás al forwarder)
  const weightKg = weight / 1000;
  const baseShipping = weightKg * shippingCostPerKg;
  const fscAmount = baseShipping * (fscPercentage / 100);
  const insurance = itemValueUSD * 0.01; // 1% del FOB
  const totalLogisticsUSD = baseShipping + fscAmount + insurance + dhlHandlingFee;

  // 3. Base Aduana (CIF) — lo que DHL declara a Aduana
  // El flete aduanero es lo que DHL declara, no lo que vos pagás
  const customsFreight = itemValueUSD * (customsFreightPercentage / 100);
  const cifValue = itemValueUSD + customsFreight + insurance;

  // 4. Impuestos (calculados sobre CIF)
  const dutyAmount = cifValue * (tariffRate / 100);
  const statisticalAmount = cifValue * (statisticalFee / 100);
  const taxableBaseForVat = cifValue + dutyAmount + statisticalAmount;
  const vatAmount = taxableBaseForVat * (vatRate / 100);
  const totalTaxesUSD = dutyAmount + statisticalAmount + vatAmount;

  // 5. Costo Total Real de Bolsillo
  const totalAcquisitionCostUSD = itemValueUSD + fobAdjustmentUSD + totalLogisticsUSD + totalTaxesUSD + (miscellaneous || 0);
  const totalAcquisitionCostARS = totalAcquisitionCostUSD * usdToArsRate;

  return {
    itemValueUSD, baseShipping, fscAmount, insurance, dhlHandlingFee,
    totalLogisticsUSD, customsFreight, cifValue, dutyAmount,
    statisticalAmount, taxableBaseForVat, vatAmount,
    totalTaxesUSD, totalAcquisitionCostUSD, totalAcquisitionCostARS,
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
