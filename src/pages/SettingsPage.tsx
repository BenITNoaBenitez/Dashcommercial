import { useState } from 'react';
import { Save, Plus, Trash2 } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { settings, updateSettings, parsedData } = useData();
  const [activeTab, setActiveTab] = useState('objectifs');

  const [objectifCA, setObjectifCA] = useState(settings.objectifCA.toString());
  const [modeMargeType, setModeMargeType] = useState(settings.modeMargeType);
  const [ponderations, setPonderations] = useState(settings.ponderations);
  const [margesFamille, setMargesFamille] = useState(settings.margesFamille);
  const [statutsPipeline, setStatutsPipeline] = useState(settings.statutsPipeline);
  const [newStatut, setNewStatut] = useState('');

  const handleSave = () => {
    updateSettings({
      objectifCA: parseFloat(objectifCA) || 0,
      modeMargeType,
      ponderations,
      margesFamille,
      statutsPipeline,
    });
    toast({
      title: 'Paramètres sauvegardés',
      description: 'Les modifications ont été appliquées.',
    });
  };

  const updatePonderation = (index: number, poids: number) => {
    const updated = [...ponderations];
    updated[index] = { ...updated[index], poids };
    setPonderations(updated);
  };

  const updateMargeFamille = (index: number, tauxMarge: number) => {
    const updated = [...margesFamille];
    updated[index] = { ...updated[index], tauxMarge };
    setMargesFamille(updated);
  };

  const addStatutPipeline = () => {
    if (newStatut && !statutsPipeline.includes(newStatut)) {
      setStatutsPipeline([...statutsPipeline, newStatut]);
      setNewStatut('');
    }
  };

  const removeStatutPipeline = (statut: string) => {
    setStatutsPipeline(statutsPipeline.filter((s) => s !== statut));
  };

  return (
    <div className="p-8">
      <div className="page-header flex items-center justify-between gap-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Paramètres</h1>
          <p className="text-white/70">
            Configurez les objectifs, pondérations et marges
          </p>
        </div>

        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Sauvegarder
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="objectifs">Objectifs</TabsTrigger>
          <TabsTrigger value="ponderations">Pondérations</TabsTrigger>
          <TabsTrigger value="marges">Marges</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
        </TabsList>

        <TabsContent value="objectifs">
          <div className="max-w-md rounded-3xl border border-primary/10 bg-white/80 p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)] backdrop-blur-xl">
            <h3 className="mb-4 font-semibold">Objectif CA</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="objectifCA">Objectif CA annuel (€)</Label>
                <Input
                  id="objectifCA"
                  type="number"
                  value={objectifCA}
                  onChange={(e) => setObjectifCA(e.target.value)}
                  placeholder="Ex: 500000"
                  className="mt-2"
                />
                <p className="mt-2 text-sm text-muted-foreground">
                  Utilisé pour calculer le taux d&apos;atteinte objectif
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ponderations">
          <div className="max-w-lg rounded-3xl border border-primary/10 bg-white/80 p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)] backdrop-blur-xl">
            <h3 className="mb-4 font-semibold">Pondérations par statut</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Coefficient appliqué aux devis pour le forecast pondéré
            </p>

            <div className="space-y-4">
              {ponderations.map((p, index) => (
                <div key={p.statut} className="flex items-center gap-4">
                  <Label className="w-32">{p.statut}</Label>
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={p.poids}
                    onChange={(e) => updatePonderation(index, parseFloat(e.target.value) || 0)}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">
                    ({(p.poids * 100).toFixed(0)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="marges">
          <div className="max-w-lg space-y-6">
            <div className="rounded-3xl border border-primary/10 bg-white/80 p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)] backdrop-blur-xl">
              <h3 className="mb-4 font-semibold">Mode de calcul</h3>
              <Select
                value={modeMargeType}
                onValueChange={(val) => setModeMargeType(val as 'taux' | 'cout')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="taux">Taux par famille</SelectItem>
                  <SelectItem value="cout">Coûts par pièce</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {modeMargeType === 'taux' && (
              <div className="rounded-3xl border border-primary/10 bg-white/80 p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)] backdrop-blur-xl">
                <h3 className="mb-4 font-semibold">Taux de marge par famille</h3>

                {margesFamille.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {parsedData
                      ? 'Aucune famille détectée dans les données.'
                      : 'Importez des données pour voir les familles.'
                    }
                  </p>
                ) : (
                  <div className="space-y-4">
                    {margesFamille.map((m, index) => (
                      <div key={m.famille} className="flex items-center gap-4">
                        <Label className="min-w-[150px] truncate">{m.famille}</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={m.tauxMarge}
                          onChange={(e) => updateMargeFamille(index, parseFloat(e.target.value) || 0)}
                          className="w-24"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {modeMargeType === 'cout' && (
              <div className="rounded-3xl border border-primary/10 bg-white/80 p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)] backdrop-blur-xl">
                <h3 className="mb-4 font-semibold">Coûts par pièce</h3>
                <p className="text-sm text-muted-foreground">
                  Fonctionnalité à venir: import CSV des coûts par numéro de pièce.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pipeline">
          <div className="max-w-lg rounded-3xl border border-primary/10 bg-white/80 p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)] backdrop-blur-xl">
            <h3 className="mb-4 font-semibold">Statuts du pipeline</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Statuts considérés comme "vivants" pour le calcul du pipeline
            </p>

            <div className="space-y-4">
              {statutsPipeline.map((statut) => (
                <div key={statut} className="flex items-center justify-between rounded-2xl bg-muted/80 p-3">
                  <span>{statut}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStatutPipeline(statut)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}

              <div className="flex gap-2">
                <Input
                  placeholder="Nouveau statut"
                  value={newStatut}
                  onChange={(e) => setNewStatut(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addStatutPipeline()}
                />
                <Button onClick={addStatutPipeline} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
