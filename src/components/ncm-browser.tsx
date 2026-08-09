"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  Database,
  Trash2,
  Copy,
  Star,
  Clock,
  Hash,
  Tag,
  ChevronDown,
  ChevronUp,
  Download,
  Upload,
  BarChart3,
  Info,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  searchNcm,
  getAllEntries,
  deleteNcmEntry,
  updateNcmNotes,
  getNcmStats,
  exportDatabase,
  importDatabase,
  type NcmEntry,
  type NcmSearchResult,
} from "@/lib/ncm-database";

interface NcmBrowserProps {
  /** Si se pasa, al seleccionar un NCM se ejecuta este callback */
  onSelect?: (entry: NcmEntry) => void;
  /** Modo compacto para integrar en el formulario */
  compact?: boolean;
}

export function NcmBrowser({ onSelect, compact = false }: NcmBrowserProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NcmSearchResult[]>([]);
  const [allEntries, setAllEntries] = useState<NcmEntry[]>([]);
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState("");
  const [initialized, setInitialized] = useState(false);

  // Cargar datos
  useEffect(() => {
    const entries = getAllEntries();
    setAllEntries(entries);
    setResults(entries.map((e) => ({ entry: e, score: 0 })));
    setInitialized(true);
  }, []);

  // Búsqueda en tiempo real
  useEffect(() => {
    if (!query.trim()) {
      setResults(allEntries.map((e) => ({ entry: e, score: 0 })));
      return;
    }
    const searchResults = searchNcm(query);
    setResults(searchResults);
  }, [query, allEntries]);

  const handleDelete = (hsCode: string) => {
    if (confirm(`¿Eliminar ${hsCode} de la base local?`)) {
      deleteNcmEntry(hsCode);
      setAllEntries(getAllEntries());
    }
  };

  const handleCopyCode = (hsCode: string) => {
    navigator.clipboard.writeText(hsCode);
    setCopiedCode(hsCode);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  const handleSaveNotes = (hsCode: string) => {
    updateNcmNotes(hsCode, notesText);
    setEditingNotes(null);
    setAllEntries(getAllEntries());
  };

  const handleExport = () => {
    const json = exportDatabase();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `importflow-ncm-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = importDatabase(ev.target?.result as string);
        if (result.success) {
          alert(`✅ Importados ${result.imported} códigos NCM`);
          setAllEntries(getAllEntries());
        } else {
          alert("❌ Error al importar. Verifica el formato del archivo.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const stats = useMemo(() => getNcmStats(), [allEntries]);

  const toggleExpand = (hsCode: string) => {
    setExpandedCode(expandedCode === hsCode ? null : hsCode);
  };

  if (!initialized) return null;

  return (
    <div className="space-y-4">
      {/* Header con búsqueda */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código NCM, descripción o palabra clave..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>

        {/* Barra de acciones */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Database className="w-3 h-3" />
              {stats.totalEntries} códigos
            </Badge>
            <Badge variant="outline" className="gap-1">
              <BarChart3 className="w-3 h-3" />
              {stats.totalQueries} consultas
            </Badge>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[10px] gap-1"
              onClick={() => setShowStats(!showStats)}
            >
              <BarChart3 className="w-3 h-3" />
              Stats
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[10px] gap-1"
              onClick={handleExport}
            >
              <Download className="w-3 h-3" />
              Exportar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[10px] gap-1"
              onClick={handleImport}
            >
              <Upload className="w-3 h-3" />
              Importar
            </Button>
          </div>
        </div>

        {/* Panel de estadísticas */}
        {showStats && (
          <Card className="border-dashed">
            <CardContent className="pt-4 space-y-2">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">
                    Total Códigos
                  </p>
                  <p className="font-bold text-lg">{stats.totalEntries}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">
                    Total Consultas
                  </p>
                  <p className="font-bold text-lg">{stats.totalQueries}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">
                    Última Actualización
                  </p>
                  <p className="font-bold text-sm">
                    {stats.lastUpdated
                      ? new Date(stats.lastUpdated).toLocaleDateString("es-AR")
                      : "Nunca"}
                  </p>
                </div>
              </div>
              {stats.topCategories.length > 0 && (
                <>
                  <Separator />
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">
                    Categorías Principales
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {stats.topCategories.slice(0, 5).map((cat) => (
                      <Badge key={cat.category} variant="outline" className="text-[10px]">
                        {cat.category} ({cat.count})
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Lista de resultados */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
        {results.length === 0 && query && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No se encontraron resultados para "{query}"</p>
            <p className="text-xs mt-1">
              Usa el Asistente IA en el formulario para generar nuevos códigos
            </p>
          </div>
        )}

        {results.length === 0 && !query && (
          <div className="text-center py-8 text-muted-foreground">
            <Database className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Base de datos vacía</p>
            <p className="text-xs mt-1">
              Los códigos se guardan automáticamente cuando usas el Asistente IA
            </p>
          </div>
        )}

        {results.map(({ entry, score }) => (
          <Card
            key={entry.hsCode}
            className={`transition-all hover:shadow-md ${
              expandedCode === entry.hsCode ? "ring-2 ring-primary/30" : ""
            } ${onSelect ? "cursor-pointer hover:border-primary/50" : ""}`}
            onClick={() => onSelect?.(entry)}
          >
            <CardContent className="p-3">
              {/* Línea principal */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="font-bold text-sm bg-primary/10 text-primary px-2 py-0.5 rounded">
                      {entry.hsCode}
                    </code>
                    <span className="text-[10px] text-muted-foreground">
                      DIE: {entry.suggestedTariffRate}%
                    </span>
                    {entry.origin === "ai" && (
                      <Badge variant="secondary" className="text-[9px] px-1 py-0">
                        IA
                      </Badge>
                    )}
                    {entry.origin === "seed" && (
                      <Badge variant="outline" className="text-[9px] px-1 py-0">
                        Base
                      </Badge>
                    )}
                    {entry.useCount > 1 && (
                      <span className="text-[10px] text-amber-600 flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5" />
                        {entry.useCount}x
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium leading-tight truncate">
                    {entry.description}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {entry.tariffCategory}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyCode(entry.hsCode);
                    }}
                  >
                    {copiedCode === entry.hsCode ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(entry.hsCode);
                    }}
                  >
                    {expandedCode === entry.hsCode ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Tags */}
              {entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {entry.tags.slice(0, compact ? 3 : 6).map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-[9px] px-1.5 py-0 cursor-pointer hover:bg-muted"
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuery(tag);
                      }}
                    >
                      <Tag className="w-2 h-2 mr-0.5" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Panel expandido */}
              {expandedCode === entry.hsCode && (
                <div className="mt-3 pt-3 border-t border-dashed space-y-3">
                  {/* Detalles impositivos */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-muted/50 rounded-lg p-2">
                      <p className="text-[9px] text-muted-foreground uppercase">
                        DIE Extrazona
                      </p>
                      <p className="font-bold text-primary">
                        {entry.suggestedTariffRate}%
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2">
                      <p className="text-[9px] text-muted-foreground uppercase">
                        Estadística
                      </p>
                      <p className="font-bold">{entry.suggestedStatisticalFee}%</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2">
                      <p className="text-[9px] text-muted-foreground uppercase">IVA</p>
                      <p className="font-bold">{entry.suggestedVatRate}%</p>
                    </div>
                  </div>

                  {/* Reasoning */}
                  {entry.reasoning && (
                    <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3">
                      <p className="text-[10px] font-bold text-blue-800 uppercase mb-1 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        Justificación Técnica
                      </p>
                      <p className="text-xs text-blue-700 leading-relaxed">
                        {entry.reasoning}
                      </p>
                    </div>
                  )}

                  {/* Notas del usuario */}
                  <div>
                    {editingNotes === entry.hsCode ? (
                      <div className="space-y-2">
                        <textarea
                          className="w-full text-xs p-2 border rounded-lg resize-none"
                          rows={3}
                          placeholder="Agregar notas sobre este código..."
                          value={notesText}
                          onChange={(e) => setNotesText(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            className="h-6 text-[10px]"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveNotes(entry.hsCode);
                            }}
                          >
                            Guardar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[10px]"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingNotes(null);
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingNotes(entry.hsCode);
                          setNotesText(entry.notes || "");
                        }}
                      >
                        {entry.notes ? (
                          <p className="bg-muted/30 p-2 rounded italic">
                            📝 {entry.notes}
                          </p>
                        ) : (
                          <p className="text-[10px] text-muted-foreground/50">
                            + Agregar notas...
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Último uso:{" "}
                      {new Date(entry.lastUsed).toLocaleDateString("es-AR")}
                    </span>
                    {!onSelect && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 text-[10px] text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(entry.hsCode);
                        }}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Eliminar
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
