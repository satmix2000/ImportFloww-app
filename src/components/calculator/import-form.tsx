
"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Calculator, Sparkles, RefreshCcw, Package, Truck, Landmark, Loader2, Info } from "lucide-react";

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
import { Separator } from "@/components/ui/separator";
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
  tariffRate: z.coerce.number().min(0).max(100).default(0),
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
      tariffRate: 0,
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
      
      if (marketData && marketData.rates && marketData.rates.CNY) {
        const cnyToUsd = 1 / marketData.rates.CNY;
        form.setValue("exchangeRate", Number(cnyToUsd.toFixed(4)));
      }

      const arsResponse = await fetch("https://dolarapi.com/v1/dolares/blue");
      const arsData = await arsResponse.json();
      
      if (arsData && arsData.venta) {
        form.setValue("usdToArsRate", Math.round(arsData.venta));
      }
    } catch (error) {
      console.error("Error fetching rates:", error);
    } finally {
      setIsRatesLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const watchCNY = form.watch("itemValueCNY");
  const watchRate = form.watch("exchangeRate");
  const usdEquivalent = (watchCNY || 0) * (watchRate || 0);

  const onSubmit = (data: ImportFormData) => {
    onCalculate(data);
  };

  const handleAiAssist = async () => {
    const description = form.getValues("productDescription");
    if (!description || description.length < 5) {
      form.setError("productDescription", { message: "Describa su producto primero para usar la IA." });
      return;
    }

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

  const selectSuggestion = (suggestion: any) => {
    form.setValue("hsCode", suggestion.hsCode);
    if (suggestion.suggestedTariffRate !== undefined) {
      form.setValue("tariffRate", suggestion.suggestedTariffRate);
    }
    if (suggestion.suggestedStatisticalFee !== undefined) {
      form.setValue("statisticalFee", suggestion.suggestedStatisticalFee);
    }
    if (suggestion.suggestedVatRate !== undefined) {
      form.setValue("vatRate", suggestion.suggestedVatRate);
    }
  };

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Valor FOB */}
          <Card className="border-none shadow-md overflow-hidden bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-primary text-primary-foreground pb-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  <CardTitle className="font-headline tracking-tight">Valor FOB (China)</CardTitle>
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="text-primary-foreground hover:bg-white/10"
                  onClick={fetchRates}
                  disabled={isRatesLoading}
                >
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
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
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
                    <FormLabel>Tasa (1 CNY = ? USD)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.0001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Logística */}
          <Card className="border-none shadow-md overflow-hidden bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-slate-800 text-white pb-6">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-accent" />
                <CardTitle className="font-headline tracking-tight">Logística y Flete</CardTitle>
              </div>
              <CardDescription className="text-slate-300">
                Los cargos adicionales (FSC, Almacenaje, etc.) se calculan automáticamente.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso Total (gramos)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type="number" step="1" placeholder="0" {...field} />
                        <Package className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground opacity-50" />
                      </div>
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
                    <FormLabel>Flete por Kilo (USD)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="miscellaneous"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Otros Gastos Especiales (USD)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormDescription className="text-[10px]">Gastos adicionales no contemplados en las reglas estándar.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Aduana */}
          <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-slate-100 text-slate-900 border-b pb-4">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-primary" />
                <CardTitle className="font-headline tracking-tight text-lg">Impuestos y VUCE</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <FormField
                control={form.control}
                name="usdToArsRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cotización Dólar Blue (USD/ARS)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type="number" step="1" {...field} />
                        <RefreshCcw className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground opacity-50 cursor-pointer" onClick={fetchRates} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator className="my-2" />

              <FormField
                control={form.control}
                name="productDescription"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center mb-1">
                      <FormLabel>Descripción del Producto</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-[10px] gap-1 border-accent text-accent-foreground"
                        onClick={handleAiAssist}
                        disabled={isAiLoading}
                      >
                        <Sparkles className="w-3 h-3" />
                        {isAiLoading ? "Consultando VUCE..." : "Asistente NCM"}
                      </Button>
                    </div>
                    <FormControl>
                      <Input placeholder="Ej. Placa de video para workstation..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {aiSuggestions.length > 0 && (
                <div className="bg-muted/50 p-3 rounded-md border space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {aiSuggestions.map((s, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="cursor-pointer hover:bg-accent hover:text-accent-foreground p-2 text-left flex flex-col items-start gap-1 w-full"
                        onClick={() => selectSuggestion(s)}
                      >
                        <div className="flex justify-between w-full">
                          <span className="font-bold">{s.hsCode}</span>
                          <span className="font-bold text-primary">DIE: {s.suggestedTariffRate}%</span>
                        </div>
                        <div className="flex justify-between w-full text-[10px] opacity-70">
                          <span>Est: {s.suggestedStatisticalFee}%</span>
                          <span>IVA: {s.suggestedVatRate}%</span>
                        </div>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tariffRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DIE (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="statisticalFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estadística (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vatRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IVA (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hsCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Posición NCM</FormLabel>
                      <FormControl>
                        <Input placeholder="NCM" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full h-12 text-lg font-bold bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg">
            Calcular Costo Final
          </Button>
        </form>
      </Form>
    </div>
  );
}
