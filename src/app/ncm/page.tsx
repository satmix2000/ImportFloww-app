"use client";

import React, { useEffect } from "react";
import { Database, TrendingUp, ArrowLeft } from "lucide-react";
import { NcmBrowser } from "@/components/ncm/ncm-browser";
import { initializeDatabaseWithSeed } from "@/lib/ncm-database";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NcmDatabasePage() {
  useEffect(() => {
    const seeded = initializeDatabaseWithSeed();
    if (seeded > 0) {
      console.log(`[NCM DB] Base inicializada con ${seeded} códigos seed`);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="bg-primary rounded-lg p-1.5 shadow-lg shadow-primary/20">
                <Database className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-primary tracking-tight">
                  Base de Datos NCM
                </h1>
                <p className="text-[10px] text-muted-foreground -mt-0.5">
                  Catálogo local de códigos arancelarios
                </p>
              </div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              Calculadora
            </Link>
            <span className="text-primary font-bold">Códigos NCM</span>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-primary/5 border border-blue-100 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 rounded-lg p-2">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-blue-900">
                Tu base de datos NCM personal
              </h3>
              <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                Cada vez que usas el <strong>Asistente IA</strong> en la calculadora y
                aceptas una sugerencia, el código se guarda automáticamente aquí.
                Puedes buscar, agregar notas, exportar como backup, y reutilizar
                códigos en futuros cálculos.
              </p>
            </div>
          </div>
        </div>

        <NcmBrowser />
      </main>

      <footer className="bg-white border-t py-8 mt-16">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="font-extrabold text-primary text-sm">ImportFlow</span>
          </div>
          <p className="text-[10px] text-slate-400">
            © {new Date().getFullYear()} ImportFlow Solutions — Base de datos NCM local
          </p>
        </div>
      </footer>
    </div>
  );
}
