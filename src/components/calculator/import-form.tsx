"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Calculator, Sparkles, RefreshCcw, Package, Truck, Landmark, Loader2, ExternalLink } from "lucide-react";

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

const formSchema = z.object({
  itemValueCNY: z.coerce.number().min(0, "Debe ser positivo"),
  exchangeRate: z.coerce.number().min(0.0001, "Tasa inválida").default(0.138),
  weight: z.coerce.number().min(0, "Debe ser positivo").default(0),
  shippingCostPerKg: z.coerce.number().min(0, "Debe ser positivo").default(14.50),
  miscellaneous: z.coerce.number().min(0, "Debe ser positivo").default(0),
  productDescription: z.string().min(5, "Descripción muy corta"),
  hsCode: z.string().optional(),
  tariffRate: z.coerce.number().min(0).max(100).default(18), // Ajustado al 18% Extrazona común
  statisticalFee: z.coerce.number().min(0).max(100).default(3),
  vatRate: z.coerce.number().min(0).max(100).default(21),
  usdToArsRate: z.coerce.number().min(1, "Tasa inválida").default(1100),
});

export type ImportFormData = z.infer<typeof formSchema>;

interface ImportFormProps {
  onCalculate: (data: ImportFormData) => void;
}

export function ImportForm({ onCalculate }: ImportFormProps) {
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isRatesLoading, setIsRatesLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<HsCodeSuggestionOutput>([]);

  const form = useForm<ImportFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemValueCNY: 0,
      exchangeRate: 0.138,
      weight: 0,
      shippingCostPerKg: 14.50,
      miscellaneous: 0,
      productDescription: "",
      hsCode: "",
      tariffRate: 18,
      statisticalFee: 3,
      vatRate: 21,
      usdToArsRate: 1100,
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

  useEffect(() => { fetchRates(); }, []);

  const watchCNY = form.watch("itemValueCNY");
  const watchRate = form.watch("exchangeRate");
  const usdEquivalent = (watchCNY || 0) * (watchRate || 0);

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

  const selectSuggestion = (s: any) => {
    form.setValue("hsCode", s.hsCode);
    if (s.suggestedTariffRate !== undefined) form.setValue("tariffRate", s.suggestedTariffRate);
    if (s.suggestedStatisticalFee !== undefined) form.setValue("statisticalFee", s.suggestedStatisticalFee);
    if (s.suggestedVatRate !== undefined) form.setValue("vatRate", s.suggestedVatRate);
  };

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onCalculate)} className="space-y-6">
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
                    <FormLabel>Monto en Yuanes (¥)</FormLabel>
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
                    <FormLabel>Tasa CNY/USD</FormLabel>
                    <FormControl><Input type="number" step="0.0001" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Card Logística */}
          <Card className="border-none shadow-md overflow-hidden bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-slate-800 text-white pb-6">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-accent" />
                <CardTitle className="font-headline tracking-tight">Logística y Flete</CardTitle>
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
                      <FormLabel>Descripción del Producto</FormLabel>
                      <Button type="button" variant="outline" size="sm" className="h-7 text-[10px] gap-1 border-accent text-accent-foreground font-bold" onClick={handleAiAssist} disabled={isAiLoading}>
                        <Sparkles className="w-3 h-3" />
                        {isAiLoading ? "Consultando..." : "ASISTENTE IA"}
                      </Button>
                    </div>
                    <FormControl><Input placeholder="Ej. Sensor de proximidad..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              {/* Validación VUCE */}
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
                  <FormItem><FormLabel className="text-xs">Estadística (%)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="vatRate" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs">IVA (%)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="hsCode" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs">Posición NCM</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
                )} />
              </div>
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
