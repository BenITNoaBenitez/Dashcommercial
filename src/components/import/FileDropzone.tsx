import { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import { ColumnMapper } from './ColumnMapper';
import {
  parseExcelFile,
  autoDetectColumns,
  applyMappingToPieces,
  calculateSalesCycle,
  ColumnMapping,
} from '@/lib/fileParser';
import { DEMO_DATA, DEMO_SETTINGS_MARGES } from '@/lib/demoData';

type ImportStep = 'upload' | 'mapping' | 'processing';

export function FileDropzone() {
  const [isDragging, setIsDragging] = useState(false);
  const [step, setStep] = useState<ImportStep>('upload');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, unknown>[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping[]>([]);

  const { importData, updateSettings } = useData();
  const navigate = useNavigate();

  // ── Load demo data ────────────────────────────────────────────────────────────
  const handleLoadDemo = useCallback(async () => {
    setIsDemoLoading(true);
    setError(null);
    try {
      // Pre-fill margin settings
      updateSettings({ margesFamille: DEMO_SETTINGS_MARGES, objectifCA: 850_000 });
      await importData(DEMO_DATA);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement de la démo');
    } finally {
      setIsDemoLoading(false);
    }
  }, [importData, updateSettings, navigate]);

  // ── Process real file ─────────────────────────────────────────────────────────
  const processFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const result = parseExcelFile(buffer);
      const { headers, rows } = result;

      if (rows.length === 0) throw new Error('Le fichier ne contient aucune donnée');

      const mapping = autoDetectColumns(headers);
      setRawHeaders(headers);
      setRawRows(rows);
      setColumnMapping(mapping);
      setStep('mapping');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du parsing');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleConfirmMapping = useCallback(async () => {
    setStep('processing');
    setIsLoading(true);
    try {
      const parsedData = applyMappingToPieces(rawRows, columnMapping);
      const piecesWithCycle = calculateSalesCycle(parsedData.pieces);
      await importData({ ...parsedData, pieces: piecesWithCycle });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'import");
      setStep('mapping');
    } finally {
      setIsLoading(false);
    }
  }, [rawRows, columnMapping, importData, navigate]);

  const handleCancelMapping = useCallback(() => {
    setStep('upload');
    setRawHeaders([]);
    setRawRows([]);
    setColumnMapping([]);
    setError(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  // ── Column mapping step ───────────────────────────────────────────────────────
  if (step === 'mapping') {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-start justify-center p-8">
        <div className="w-full max-w-4xl animate-fade-in">
          <ColumnMapper
            mapping={columnMapping}
            onMappingChange={setColumnMapping}
            onConfirm={handleConfirmMapping}
            onCancel={handleCancelMapping}
            previewData={rawRows.slice(0, 3)}
          />
        </div>
      </div>
    );
  }

  // ── Upload step ───────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/30 p-8">
      <div className="w-full max-w-xl animate-fade-in space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
            <FileSpreadsheet className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Commercial</h1>
          <p className="text-muted-foreground">
            Analysez vos performances commerciales en temps réel
          </p>
        </div>

        {/* Demo CTA */}
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-primary font-semibold">
            <Sparkles className="h-5 w-5" />
            <span>Mode Démo</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Chargez un jeu de données fictif (12 clients, 5 commerciaux, 160 pièces sur 2024) et explorez toutes les fonctionnalités instantanément.
          </p>
          <Button
            onClick={handleLoadDemo}
            disabled={isDemoLoading}
            className="w-full gap-2"
            size="lg"
          >
            {isDemoLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Chargement...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Lancer la démo
              </>
            )}
          </Button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          <span>ou importez vos propres données</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Dropzone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn('dropzone', isDragging && 'active')}
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                {step === 'processing' ? 'Import en cours...' : 'Analyse du fichier...'}
              </p>
            </div>
          ) : (
            <>
              <Upload className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="mb-1 font-medium">Glissez votre fichier Excel ici</p>
              <p className="mb-5 text-sm text-muted-foreground">Format .xlsx ou .xls</p>
              <label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileInput}
                  className="hidden"
                />
                <Button variant="outline" asChild size="sm">
                  <span>Parcourir les fichiers</span>
                </Button>
              </label>
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl bg-destructive/10 p-4 text-destructive">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
