import { useRef } from "react";
import { useClimbTrack } from "@/context/ClimbTrackContext";
import { Download, Upload, Trash2, RotateCcw, AlertTriangle } from "lucide-react";
import { SESSIONS } from "@/data/sessions";
import { useToast } from "@/hooks/use-toast";

export function ReglagesPage() {
  const { exportData, importData, clearData, resetDefaults } = useClimbTrack();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importData(content);
      if (success) {
        toast({ title: "Import réussi", description: "Les données ont été restaurées avec succès." });
      } else {
        toast({ variant: "destructive", title: "Erreur", description: "Fichier invalide ou corrompu." });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClear = () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer TOUTES vos données ? Cette action est irréversible.")) {
      clearData();
      toast({ title: "Données effacées", description: "L'application a été remise à zéro." });
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm("Rétablir toutes les valeurs par défaut des exercices ?")) {
      resetDefaults();
      toast({ title: "Valeurs rétablies", description: "Les valeurs d'origine ont été restaurées." });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 pt-safe">
      <header className="px-5 py-6 bg-background/95 backdrop-blur-md sticky top-0 z-10 border-b border-border">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Réglages</h1>
      </header>

      <main className="p-5 space-y-8">
        
        {/* Data Management */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Données</h2>
          
          <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
            <button onClick={exportData} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
              <span className="font-medium">Exporter la sauvegarde</span>
              <Download size={20} className="text-muted-foreground" />
            </button>
            
            <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
              <span className="font-medium">Importer une sauvegarde</span>
              <Upload size={20} className="text-muted-foreground" />
            </button>
            <input 
              type="file" 
              accept=".json" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImport} 
            />
          </div>
        </section>

        {/* App Settings */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Application</h2>
          
          <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
            <button onClick={handleResetDefaults} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
              <span className="font-medium">Rétablir les valeurs par défaut</span>
              <RotateCcw size={20} className="text-muted-foreground" />
            </button>
            
            <button onClick={handleClear} className="w-full flex items-center justify-between p-4 hover:bg-destructive/10 transition-colors group">
              <span className="font-medium text-destructive group-hover:text-destructive/80">Supprimer toutes les données</span>
              <Trash2 size={20} className="text-destructive group-hover:text-destructive/80" />
            </button>
          </div>
        </section>

        {/* Footer info */}
        <div className="text-center pt-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white text-black mb-3">
            <span className="font-black text-xl">CT</span>
          </div>
          <p className="text-sm font-bold text-white tracking-wide">ClimbTrack</p>
          <p className="text-xs text-muted-foreground mt-1">v1.0.0 • Local Storage Only</p>
        </div>

      </main>
    </div>
  );
}