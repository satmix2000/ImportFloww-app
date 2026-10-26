import { getMLConfig } from "./ml-constants";

// Constante centralizada: threshold de margen rentable (%)
export const MARGEN_RENTABLE_THRESHOLD = 30;

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
  customsFreightPercentage?: number; // % del FOB que DHL declara como flete aduanero (default 10.7%)
};

export type ImportBreakdown = {
  itemValueUSD: number;
  baseShipping: number;
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

// Constante fija: cargo de gestion aduanera DHL por item
// Referencia: USD 15 / 690 items = ~USD 0.022 por item
const DHL_HANDLING_FEE = 0.02;

export function calculateImportBreakdown(costs: ImportCosts): ImportBreakdown {
  const {
    itemValueCNY, exchangeRate, weight, shippingCostPerKg,
    miscellaneous, tariffRate, statisticalFee, vatRate,
    usdToArsRate, fobAdjustmentUSD = 0,
    customsFreightPercentage = 10.7,
  } = costs;

  // Validación: tasa de cambio no puede ser 0
  if (usdToArsRate <= 0) {
    throw new Error('Tasa USD/ARS inválida: debe ser mayor a 0. Verifique la conexión o refresque los datos.');
  }

  // Validación: tasa de conversión CNY no puede ser 0
  if (exchangeRate <= 0) {
    throw new Error('Tasa de cambio CNY/USD inválida: debe ser mayor a 0.');
  }

  // 1. FOB Declarado
  const itemValueUSD = itemValueCNY * exchangeRate;

  // 2. Logistica Real (lo que pagas al forwarder)
  const weightKg = weight / 1000;
  const baseShipping = weightKg * shippingCostPerKg;
  const insurance = itemValueUSD * 0.01; // 1% del FOB
  const dhlHandlingFee = DHL_HANDLING_FEE;
  const totalLogisticsUSD = baseShipping + insurance + dhlHandlingFee;

  // 3. CIF (Base Aduana) - lo que DHL declara a Aduana
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
    itemValueUSD, baseShipping, insurance, dhlHandlingFee,
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

/**
 * Calcula métricas de margen y rentabilidad para Mercado Libre.
 * Lógica centralizada para evitar duplicación.
 */
export type MLMetrics = {
  comisionPesos: number;
  costoFijoML: number;
  envioGratisML: number;
  gananciaNetaARS: number;
  margenRealPercentage: number;
  esRentable: boolean;
};

export function calcularMetricasML(
  precioVentaML: number,
  costoTotalARS: number
): MLMetrics {
  const mlConfig = getMLConfig();
  const comisionPorcentaje = mlConfig.comisionPorcentaje;

  const comisionPesos = precioVentaML * (comisionPorcentaje / 100);
  const rangoFijo = mlConfig.costosFijos.find(r => precioVentaML <= r.hasta);
  const costoFijoML = rangoFijo?.costo || 0;
  const rangoEnvio = mlConfig.envioGratis.find(
    r => precioVentaML >= r.desde && precioVentaML <= r.hasta
  );
  const envioGratisML = rangoEnvio?.costo || 0;

  const gananciaNetaARS = precioVentaML - comisionPesos - costoFijoML - envioGratisML - costoTotalARS;
  const margenRealPercentage = precioVentaML > 0
    ? (gananciaNetaARS / precioVentaML) * 100
    : 0;
  const esRentable = margenRealPercentage >= MARGEN_RENTABLE_THRESHOLD;

  return {
    comisionPesos,
    costoFijoML,
    envioGratisML,
    gananciaNetaARS,
    margenRealPercentage: Number(margenRealPercentage.toFixed(2)),
    esRentable,
  };
}

// Cálculo rápido de SKU desde la base
export function calcularSkuRapido(
  precioCompraCNY: number,
  exchangeRate: number,
  pesoGramos: number,
  shippingCostPerKg: number,
  precioVentaML: number,
  usdToArsRate: number,
  tariffRate: number = 18,
  statisticalFee: number = 3,
  vatRate: number = 21,
) {
  // Validación: tasa de cambio no puede ser 0
  if (usdToArsRate <= 0) {
    throw new Error('Tasa USD/ARS inválida: debe ser mayor a 0. Verifique la conexión o refresque los datos.');
  }

  if (exchangeRate <= 0) {
    throw new Error('Tasa de cambio CNY/USD inválida: debe ser mayor a 0.');
  }

  const breakdown = calculateImportBreakdown({
    itemValueCNY: precioCompraCNY,
    exchangeRate,
    weight: pesoGramos,
    shippingCostPerKg,
    miscellaneous: 0,
    tariffRate,
    statisticalFee,
    vatRate,
    usdToArsRate,
    fobAdjustmentUSD: 0,
    customsFreightPercentage: 10.7,
  });

  const costoTotalARS = breakdown.totalAcquisitionCostARS;
  const metricas = calcularMetricasML(precioVentaML, costoTotalARS);

  return {
    costoImportUnitUSD: breakdown.totalAcquisitionCostUSD,
    costoImportUnitARS: costoTotalARS,
    comisionML: metricas.comisionPesos,
    costoFijoML: metricas.costoFijoML,
    envioGratisML: metricas.envioGratisML,
    gananciaBrutaARS: precioVentaML - metricas.comisionPesos - metricas.costoFijoML - metricas.envioGratisML,
    gananciaNetaARS: metricas.gananciaNetaARS,
    margen: metricas.margenRealPercentage,
    rentable: metricas.esRentable,
  };
}
