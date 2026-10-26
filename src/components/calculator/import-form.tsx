"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Calculator, RefreshCcw, Package, Truck, Landmark, Loader2, ExternalLink, ShoppingBag, Database, Search } from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/calculator-utils";
import { saveNcmEntry, initializeNcmDatabaseOnce, searchNcm, type NcmEntry } from "@/lib/ncm-database";

const formSchema = z.object({
  itemValueCNY: z.coerce.number().min(0, "Debe ser positivo"),
  fobAdjustmentUSD: z.coerce.number().default(0),
  exchangeRate: z.coerce.number().min(0.0001, "Tasa invalida").default(0.138),
  weight: z.coerce.number().min(0, "Debe ser positivo").default(0),
  shippingCostPerKg: z.coerce.number().min(0, "Debe ser positivo").default(13.00),
  customsFreightPercentage: z.coerce.number().min(0).max(100).default(10.7),
  miscellaneous: z.coerce.number().min(0, "Debe ser positivo").default(0),
  productDescription: z.string().min(5, "Descripcion muy corta"),
  hsCode: z.string().optional(),
  tariffRate: z.coerce.number().min(0).max(100).default(18),
  statisticalFee: z.coerce.number().min(0).max(100).default(3),
  vatRate: z.coerce.number().min(0).max(100).default(21),
  usdToArsRate: z.coerce.number().min(1, "Tasa invalida").default(1100),
  // Campos MercadoLibre
  precioCompetenciaML: z.coerce.number().min(0, "Debe ser positivo").default(0),
  comisionMLPorcentaje: z.coerce.number().min(0).max(100).default(16),
});

export type ImportFormData = z.infer<typeof formSchema>;

interface ImportFormProps {
  onCalculate: (data: ImportFormData & { metricasML?: any }) => void;
}

export function ImportForm({ onCalculate }: ImportFormProps) {
  const [isRatesLoading, setIsRatesLoading] = useState(false);
  const [showLocalDb, setShowLocalDb] = useState(false);
  const [localDbQuery, setLocalDbQuery] = useState("");
  const [localDbResults, setLocalDbResults] = useState<NcmEntry[]>([]);

  const form = useForm<ImportFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemValueCNY: 0,
      fobAdjustmentUSD: 0,
      exchangeRate: 0.138,
      weight: 0,
      shippingCostPerKg: 11.20,
      customsFreightPercentage: 10.7,
      miscellaneous: 0,
      productDescription: "",
      hsCode: "",
      tariffRate: 18,
      statisticalFee: 3,
      vatRate: 21,
      usdToArsRate: 1100,
      precioCompetenciaML: 0,
      comisionMLPorcentaje: 16,
    },
  });

  const fetchRates = async () => {
    setIsRatesLoading(true);
    try {
      const marketResponse = await fetch("https://open.er-api.com/v6/latest/USD");
      const marketData = await marketResponse.json();
      if (marketData?.rates?.CNY) {
        form.setValue("exchangeRate", Number((1 / marketData.rates.CNY).toFixed(4)));
      }
      const arsResponse = await fetch("https://dolarapi.com/v1/dolares/blue");
      const arsData = await arsResponse.json();
      if (arsData?.venta) {
        form.setValue("usdToArsRate", Math.round(arsData.venta));
      }
    } catch (error) {
      console.error("Error rates:", error);
    } finally {
      setIsRatesLoading(false);
    }
  };

  useEffect(() => { fetchRates(); initializeNcmDatabaseOnce(); }, []);

  const watchCNY = form.watch("itemValueCNY");
  const watchRate = form.watch("exchangeRate");
  const usdEquivalent = (watchCNY || 0) * (watchRate || 0);

  // Calculo interno de metricas ML
  const calcularMetricasMLInterno = (precioCompetencia: number, comisionPorcentaje: number) => {
    if (!precioCompetencia || precioCompetencia <= 0) return null;

    let costoFijo = 0;
    let envioGratis = 0;
    const comisionMLDecimal = comisionPorcentaje / 100;

    if (precioCompetencia < 33000) {
      if (precioCompetencia <= 15999) costoFijo = 1230;
      else if (precioCompetencia <= 23999) costoFijo = 2455;
      else costoFijo = 2925;
    } else {
      envioGratis = 4500;
    }

    return {
      costoFijoML: costoFijo,
      envioGratisML: envioGratis,
      comisionPesos: Number((precioCompetencia * comisionMLDecimal).toFixed(2))
    };
  };

  // Submit con metricas ML
  const handleFormSubmit = (data: ImportFormData) => {
    const metricasML = calcularMetricasMLInterno(data.precioCompetenciaML, data.comisionMLPorcentaje);
    onCalculate({ ...data, metricasML });
  };

  // Buscar en base local
  const handleLocalDbSearch = (q: string) => {
    setLocalDbQuery(q);
    if (q.trim().length < 2) {
      setLocalDbResults([]);
      return;
    }
    const results = searchNcm(q);
    setLocalDbResults(results.slice(0, 8).map(r => r.entry).filter(Boolean));
  };

  // Seleccionar de base local
  const selectFromLocalDb = (entry: NcmEntry) => {
    form.setValue("hsCode", entry.hsCode);
    form.setValue("tariffRate", entry.suggestedTariffRate);
    form.setValue("statisticalFee", entry.suggestedStatisticalFee);
    form.setValue("vatRate", entry.suggestedVatRate);
    form.setValue("productDescription", entry.description);
    setShowLocalDb(false);
    setLocalDbQuery("");
    setLocalDbResults([]);
  };

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Card FOB - PREMIUM REDESIGN */}
          <Card className="border border-primary/20 shadow-premium-lg overflow-hidden bg-gradient-to-br from-white via-primary/5 to-white">
            <CardHeader className="bg-gradient-premium text-primary-foreground pb-8">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black tracking-tight">Valor FOB</CardTitle>
                    <p className="text-xs text-white/70 mt-1">Precio de compra en China</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={fetchRates}
                  disabled={isRatesLoading}
                  className="text-white hover:bg-white/20"
                >
                  {isRatesLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCcw className="w-5 h-5" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="itemValueCNY"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center mb-3">
                      <FormLabel className="text-base font-bold">Monto en Yuanes</FormLabel>
                      <button
                        type="button"
                        onClick={() => {
                          const currentCNY = form.getValues("itemValueCNY");
                          const rate = form.getValues("exchangeRate");
                          if (currentCNY > 0) {
                            const discountCNY = currentCNY * 0.30;
                            const discountUSD = discountCNY * rate;
                            form.setValue("itemValueCNY", Number((currentCNY - discountCNY).toFixed(2)));
                            const currentAdj = form.getValues("fobAdjustmentUSD") || 0;
                            form.setValue("fobAdjustmentUSD", currentAdj + discountUSD);
                          }
                        }}
                        className="text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-primary/10"
                      >
                        <RefreshCcw className="w-3.5 h-3.5" />
                        <span>Ajustar -30%</span>
                      </button>
                    </div>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        className="h-11 text-base font-semibold border-2 border-primary/20 focus:border-primary rounded-lg transition-colors"
                      />
                    </FormControl>
                    <FormDescription className="text-sm font-bold text-primary mt-3 bg-primary/10 px-3 py-2 rounded-lg">
                      ≈ {formatCurrency(usdEquivalent)} USD
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="exchangeRate"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center mb-3">
                      <FormLabel className="text-base font-bold">Tasa CNY/USD</FormLabel>
                      <FormField
                        control={form.control}
                        name="usdToArsRate"
                        render={({ field: arsField }) => (
                          <span className="text-xs font-bold text-white bg-gradient-premium px-3 py-1.5 rounded-full">
                            USD/ARS: ${arsField.value}
                          </span>
                        )}
                      />
                    </div>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.0001"
                        {...field}
                        className="h-11 text-base font-semibold border-2 border-primary/20 focus:border-primary rounded-lg transition-colors"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Card Logistica - PREMIUM REDESIGN */}
          <Card className="border border-accent/20 shadow-premium-lg overflow-hidden bg-gradient-to-br from-white via-accent/5 to-white">
            <CardHeader className="bg-gradient-to-r from-slate-900 via-primary to-accent text-white pb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black tracking-tight">Logística y Flete</CardTitle>
                  <p className="text-xs text-white/70 mt-1">Costos de envío desde China</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-bold">Peso Total (gramos)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        className="h-11 text-base font-semibold border-2 border-accent/20 focus:border-accent rounded-lg transition-colors mt-3"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shippingCostPerKg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-bold">Flete por Kg (USD)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        {...field}
                        className="h-11 text-base font-semibold border-2 border-accent/20 focus:border-accent rounded-lg transition-colors mt-3"
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground mt-2">
                      Tarifa del forwarder por kilogramo
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customsFreightPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-bold">Flete Aduanero (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        {...field}
                        className="h-11 text-base font-semibold border-2 border-accent/20 focus:border-accent rounded-lg transition-colors mt-3"
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground mt-2">
                      % del FOB que DHL declara ante Aduana
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="miscellaneous"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-bold">Gastos Varios (USD)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        className="h-11 text-base font-semibold border-2 border-accent/20 focus:border-accent rounded-lg transition-colors mt-3"
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground mt-2">
                      Otros gastos no incluidos
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Card Aduana e IA - PREMIUM REDESIGN */}
          <Card className="border border-primary/20 shadow-premium-lg bg-gradient-to-br from-white via-primary/5 to-white overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary via-accent to-cyan-500 text-white pb-8 border-b-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black tracking-tight">Impuestos e Inteligencia NCM</CardTitle>
                  <p className="text-xs text-white/70 mt-1">Clasificación arancelaria y análisis automático</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <FormField
                control={form.control}
                name="productDescription"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center mb-1">
                      <FormLabel>Descripcion del Producto</FormLabel>
                      <Button type="button" variant="outline" size="sm" className="h-7 text-[10px] gap-1 border-primary text-primary font-bold" onClick={() => setShowLocalDb(!showLocalDb)}>
                        <Database className="w-3 h-3" />
                        BASE LOCAL
                      </Button>
                    </div>
                    <FormControl><Input placeholder="Ej. Sensor de proximidad..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Busqueda en base local */}
              {showLocalDb && (
                <div className="bg-green-50/50 p-3 rounded-lg border border-green-100 space-y-3">
                  <p className="text-[10px] font-bold text-green-800 uppercase flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    Buscar en base local
                  </p>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por codigo o descripcion..."
                      value={localDbQuery}
                      onChange={(e) => handleLocalDbSearch(e.target.value)}
                      className="pl-7 h-8 text-xs"
                      autoFocus
                    />
                  </div>
                  {localDbResults.length > 0 && (
                    <div className="flex flex-col gap-1">
                      {localDbResults.map((entry) => (
                        <Badge
                          key={entry.hsCode}
                          variant="secondary"
                          className="cursor-pointer hover:bg-green-100 p-2 text-left flex flex-col items-start w-full bg-white border-green-200"
                          onClick={() => selectFromLocalDb(entry)}
                        >
                          <div className="flex justify-between w-full">
                            <span className="font-bold text-xs text-slate-800">{entry.hsCode}</span>
                            <span className="text-[10px] text-primary font-bold">DIE: {entry.suggestedTariffRate}%</span>
                          </div>
                          <p className="text-[10px] text-slate-500 truncate w-full">{entry.description}</p>
                        </Badge>
                      ))}
                    </div>
                  )}
                  {localDbQuery.length >= 2 && localDbResults.length === 0 && (
                    <p className="text-[10px] text-muted-foreground text-center py-2">
                      Sin resultados. Usa el Asistente IA para generar nuevos codigos.
                    </p>
                  )}
                  <a href="/ncm" target="_blank" className="text-[10px] text-green-700 hover:underline flex items-center gap-1">
                    <ExternalLink className="w-2.5 h-2.5" />
                    Ver catalogo completo
                  </a>
                </div>
              )}

              {/* Validacion VUCE */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fuente Oficial</span>
                <a href="https://vuce.gob.ar/vuce-consultas-arancelarias/" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1">
                  CONSULTAR VUCE EXTRAZONA <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="tariffRate" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs">DIE Extrazona (%)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="statisticalFee" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs">Estadistica (%)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="vatRate" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs">IVA (%)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="hsCode" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs">Posicion NCM</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          {/* Card MercadoLibre */}
          <Card className="border-dashed border-2 border-orange-200 shadow-sm overflow-hidden bg-orange-50/20 backdrop-blur-sm">
            <CardHeader className="bg-orange-500 text-white pb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                <div>
                  <CardTitle className="font-headline text-base tracking-tight">Simulador de Salida: Mercado Libre FULL</CardTitle>
                  <CardDescription className="text-orange-100 text-[11px]">Calibrado para componentes livianos (&lt;100g)</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="precioCompetenciaML"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-medium text-xs">Precio de la Competencia (ARS $)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ej. 5818 (Opcional)" className="border-orange-200 focus:border-orange-500 bg-white" {...field} />
                    </FormControl>
                    <FormDescription className="text-[10px] text-slate-400">
                      Dejalo en 0 si solo queres ver el costo de importacion.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="comisionMLPorcentaje"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-medium text-xs">Comision de la Categoria (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" className="border-orange-200 focus:border-orange-500 bg-white" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button type="submit" className="w-full h-12 text-lg font-bold bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg">
            CALCULAR COSTO TOTAL
          </Button>
        </form>
      </Form>
    </div>
  );
}
