"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Calculator, Sparkles, RefreshCcw, Package, Truck, Landmark, Loader2, ExternalLink, ShoppingBag, Database, Search } from "lucide-react";

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
import { suggestHsCode, type HsCodeSuggestionOutput } from "@/ai/flows/hs-code-suggestion";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/calculator-utils";
import { saveNcmEntry, initializeDatabaseWithSeed, searchNcm, type NcmEntry } from "@/lib/ncm-database";

const formSchema = z.object({
  itemValueCNY: z.coerce.number().min(0, "Debe ser positivo"),
  fobAdjustmentUSD: z.coerce.number().default(0),
  exchangeRate: z.coerce.number().min(0.0001, "Tasa invalida").default(0.138),
  weight: z.coerce.number().min(0, "Debe ser positivo").default(0),
  shippingCostPerKg: z.coerce.number().min(0, "Debe ser positivo").default(13.00),
  fscPercentage: z.coerce.number().min(0).max(100).default(28),
  customsFreightPercentage: z.coerce.number().min(0).max(100).default(10.7),
  dhlHandlingFee: z.coerce.number().min(0).default(15),
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
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isRatesLoading, setIsRatesLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<HsCodeSuggestionOutput>([]);
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
      shippingCostPerKg: 13.00,
      fscPercentage: 28,
      customsFreightPercentage: 10.7,
      dhlHandlingFee: 15,
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

  useEffect(() => { fetchRates(); initializeDatabaseWithSeed(); }, []);

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

  const handleAiAssist = async () => {
    const description = form.getValues("productDescription");
    if (!description || description.length < 5) return;
    setIsAiLoading(true);
    try {
      const suggestions = await suggestHsCode({ productDescription: description });
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Buscar en base local
  const handleLocalDbSearch = (q: string) => {
    setLocalDbQuery(q);
    if (q.trim().length < 2) {
      setLocalDbResults([]);
      return;
    }
    const results = searchNcm(q);
    setLocalDbResults(results.slice(0, 8).map(r => r.entry));
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

  const selectSuggestion = (s: any) => {
    form.setValue("hsCode", s.hsCode);
    if (s.suggestedTariffRate !== undefined) form.setValue("tariffRate", s.suggestedTariffRate);
    if (s.suggestedStatisticalFee !== undefined) form.setValue("statisticalFee", s.suggestedStatisticalFee);
    if (s.suggestedVatRate !== undefined) form.setValue("vatRate", s.suggestedVatRate);

    // Auto-guardar en la base de datos NCM local
    saveNcmEntry({
      hsCode: s.hsCode,
      description: form.getValues("productDescription"),
      tariffCategory: s.tariffCategory || "",
      reasoning: s.reasoning || "",
      suggestedTariffRate: s.suggestedTariffRate ?? form.getValues("tariffRate"),
      suggestedStatisticalFee: s.suggestedStatisticalFee ?? form.getValues("statisticalFee"),
      suggestedVatRate: s.suggestedVatRate ?? form.getValues("vatRate"),
      origin: "ai",
      tags: [],
    });
  };

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Card FOB */}
          <Card className="border-none shadow-md overflow-hidden bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-primary text-primary-foreground pb-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  <CardTitle className="font-headline tracking-tight">Valor FOB (China)</CardTitle>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={fetchRates} disabled={isRatesLoading}>
                  {isRatesLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="itemValueCNY"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center mb-1">
                      <FormLabel>Monto en Yuanes</FormLabel>
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
                        className="text-[9px] text-slate-300 hover:text-primary transition-all flex items-center gap-1 opacity-40 hover:opacity-100 px-1 border border-transparent hover:border-slate-100 rounded"
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>adj.</span>
                      </button>
                    </div>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormDescription className="text-xs font-bold text-primary">
                      Equivalente: {formatCurrency(usdEquivalent)} USD
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
                    <div className="flex justify-between items-center mb-1">
                      <FormLabel>Tasa CNY/USD</FormLabel>
                      <FormField
                        control={form.control}
                        name="usdToArsRate"
                        render={({ field: arsField }) => (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            Blue: ${arsField.value}
                          </span>
                        )}
                      />
                    </div>
                    <FormControl><Input type="number" step="0.0001" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Card Logistica */}
          <Card className="border-none shadow-md overflow-hidden bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-slate-800 text-white pb-6">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-accent" />
                <CardTitle className="font-headline tracking-tight">Logistica y Flete</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso Total (gramos)</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shippingCostPerKg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Flete por Kilo (USD)</FormLabel>
                    <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                    <FormDescription className="text-[10px] text-slate-400">
                      Tarifa del forwarder por kg
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fscPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>FSC Surcharge (%)</FormLabel>
                    <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                    <FormDescription className="text-[10px] text-slate-400">
                      Fuel Surcharge sobre el flete (varia mensual)
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
                    <FormLabel>Flete Aduanero (%)</FormLabel>
                    <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                    <FormDescription className="text-[10px] text-slate-400">
                      % del FOB que DHL declara como flete ante Aduana
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dhlHandlingFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo DHL Manejo (USD)</FormLabel>
                    <FormControl><Input type="number" step="1" {...field} /></FormControl>
                    <FormDescription className="text-[10px] text-slate-400">
                      Cargo fijo de DHL por gestion aduanera
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
                    <FormLabel>Gastos Varios (USD)</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                    <FormDescription className="text-[10px] text-slate-400">
                      Otros gastos no incluidos arriba
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Card Aduana e IA */}
          <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-slate-100 text-slate-900 border-b pb-4">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-primary" />
                <CardTitle className="font-headline tracking-tight text-lg">Impuestos e Inteligencia NCM</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <FormField
                control={form.control}
                name="productDescription"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center mb-1">
                      <FormLabel>Descripcion del Producto</FormLabel>
                      <div className="flex gap-1">
                        <Button type="button" variant="outline" size="sm" className="h-7 text-[10px] gap-1 border-primary text-primary font-bold" onClick={() => setShowLocalDb(!showLocalDb)}>
                          <Database className="w-3 h-3" />
                          BASE LOCAL
                        </Button>
                        <Button type="button" variant="outline" size="sm" className="h-7 text-[10px] gap-1 border-accent text-accent-foreground font-bold" onClick={handleAiAssist} disabled={isAiLoading}>
                          <Sparkles className="w-3 h-3" />
                          {isAiLoading ? "Consultando..." : "ASISTENTE IA"}
                        </Button>
                      </div>
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

              {/* Sugerencias de IA */}
              {aiSuggestions.length > 0 && (
                <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 space-y-3">
                  <p className="text-[10px] font-bold text-blue-800 uppercase">Sugerencias IA:</p>
                  <div className="flex flex-col gap-2">
                    {aiSuggestions.map((s, i) => (
                      <Badge key={i} variant="secondary" className="cursor-pointer hover:bg-blue-100 p-3 text-left flex flex-col items-start w-full bg-white border-blue-200" onClick={() => selectSuggestion(s)}>
                        <div className="flex justify-between w-full border-b border-blue-50 pb-1 mb-1">
                          <span className="font-bold text-sm text-slate-800">{s.hsCode}</span>
                          <span className="font-bold text-primary">DIE: {s.suggestedTariffRate}%</span>
                        </div>
                        {s.reasoning && <p className="text-[10px] text-slate-500 italic leading-tight">{s.reasoning}</p>}
                      </Badge>
                    ))}
                  </div>
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
