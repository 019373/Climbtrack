import {
  useRef,
  useState,
} from "react";

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Download,
  Dumbbell,
  FileJson,
  HeartPulse,
  RotateCcw,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  ExerciseManager,
} from "@/components/ExerciseManager";

import {
  useClimbTrack,
} from "@/context/ClimbTrackContext";

import {
  cn,
} from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type FeedbackMessage = {
  type:
    | "success"
    | "error";

  title: string;

  text?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared components
// ─────────────────────────────────────────────────────────────────────────────

function SettingsSection({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      {title && (
        <h2 className="px-1 text-[11px] font-black uppercase tracking-[0.16em] text-muted-foreground">
          {title}
        </h2>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {children}
      </div>
    </section>
  );
}

function SettingsRow({
  icon,
  title,
  description,
  onClick,
  destructive = false,
  rightContent,
}: {
  icon: React.ReactNode;

  title: string;

  description?: string;

  onClick?: () => void;

  destructive?: boolean;

  rightContent?: React.ReactNode;
}) {
  const content = (
    <>
      <div
        className={cn(
          "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border",

          destructive
            ? "border-destructive/30 bg-destructive/10 text-destructive"
            : "border-border bg-background text-white",
        )}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-black",

            destructive
              ? "text-destructive"
              : "text-white",
          )}
        >
          {title}
        </p>

        {description && (
          <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {rightContent ?? (
        onClick ? (
          <ChevronRight
            size={17}
            className="flex-shrink-0 text-muted-foreground"
          />
        ) : null
      )}
    </>
  );

  if (
    !onClick
  ) {
    return (
      <div className="flex items-center gap-3 border-b border-border/60 px-3.5 py-3 last:border-b-0">
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className="flex w-full items-center gap-3 border-b border-border/60 px-3.5 py-3 text-left transition-colors last:border-b-0 active:bg-white/[0.06]"
    >
      {content}
    </button>
  );
}

function FeedbackToast({
  feedback,
  onClose,
}: {
  feedback: FeedbackMessage;

  onClose: () => void;
}) {
  const success =
    feedback.type ===
    "success";

  return (
    <div className="pointer-events-none fixed inset-x-4 top-[calc(env(safe-area-inset-top)+16px)] z-[100000] flex justify-center">
      <div
        className={cn(
          "pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl",

          success
            ? "border-success/40 bg-[#142019]/95"
            : "border-destructive/40 bg-[#211414]/95",
        )}
      >
        <div
          className={cn(
            "mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",

            success
              ? "bg-success/15 text-success"
              : "bg-destructive/15 text-destructive",
          )}
        >
          {success ? (
            <CheckCircle2
              size={18}
            />
          ) : (
            <AlertTriangle
              size={18}
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-sm font-black",

              success
                ? "text-success"
                : "text-destructive",
            )}
          >
            {
              feedback.title
            }
          </p>

          {feedback.text && (
            <p className="mt-1 text-xs leading-relaxed text-white/70">
              {
                feedback.text
              }
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={
            onClose
          }
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white/50 active:scale-90"
          aria-label="Fermer le message"
        >
          <X
            size={16}
          />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getArrayLength(
  value: unknown,
): number {
  return Array.isArray(
    value,
  )
    ? value.length
    : 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export function ReglagesPage() {
  const navigate =
    useNavigate();

  const {
    data,
    exportData,
    importData,
    resetDefaults,
    clearData,
  } =
    useClimbTrack();

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null,
    );

  const [
    showExerciseManager,
    setShowExerciseManager,
  ] =
    useState(
      false,
    );

  const [
    feedback,
    setFeedback,
  ] =
    useState<FeedbackMessage | null>(
      null,
    );

  const activeInjuries =
    data.injuries.filter(
      (injury) =>
        injury.status ===
        "active",
    ).length;

  const improvingInjuries =
    data.injuries.filter(
      (injury) =>
        injury.status ===
        "amelioration",
    ).length;

  function showFeedback(
    message: FeedbackMessage,
  ) {
    setFeedback(
      message,
    );
  }

  function handleResetDefaults() {
    const confirmed =
      window.confirm(
        "Réinitialiser toutes les valeurs permanentes des exercices ? Ton historique sera conservé.",
      );

    if (
      !confirmed
    ) {
      return;
    }

    resetDefaults();

    showFeedback({
      type:
        "success",

      title:
        "Valeurs restaurées",

      text:
        "Les valeurs par défaut des exercices ont été réinitialisées.",
    });
  }

  function handleClearData() {
    const firstConfirmation =
      window.confirm(
        "Supprimer toutes les séances, blessures, réglages personnalisés et badges ?",
      );

    if (
      !firstConfirmation
    ) {
      return;
    }

    const secondConfirmation =
      window.confirm(
        "Cette action est irréversible. As-tu exporté une sauvegarde ?",
      );

    if (
      !secondConfirmation
    ) {
      return;
    }

    clearData();

    showFeedback({
      type:
        "success",

      title:
        "Données effacées",

      text:
        "Toutes les données locales ont été supprimées.",
    });
  }

  function handleExport() {
    try {
      exportData();

      showFeedback({
        type:
          "success",

        title:
          "Sauvegarde exportée",

        text:
          `${data.sessionLogs.length} séance${
            data.sessionLogs.length !==
            1
              ? "s"
              : ""
          } incluse${
            data.sessionLogs.length !==
            1
              ? "s"
              : ""
          } dans le fichier.`,
      });
    } catch {
      showFeedback({
        type:
          "error",

        title:
          "Export impossible",

        text:
          "La sauvegarde n’a pas pu être créée.",
      });
    }
  }

  async function handleImportFile(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    /*
     * Remettre l'input à zéro permet de sélectionner
     * deux fois de suite exactement le même fichier.
     */
    event.target.value =
      "";

    if (
      !file
    ) {
      return;
    }

    try {
      const text =
        await file.text();

      let parsed:
        Record<
          string,
          unknown
        >;

      try {
        const rawParsed =
          JSON.parse(
            text,
          );

        if (
          !rawParsed ||
          typeof rawParsed !==
            "object" ||
          Array.isArray(
            rawParsed,
          )
        ) {
          throw new Error(
            "Format invalide",
          );
        }

        parsed =
          rawParsed as Record<
            string,
            unknown
          >;
      } catch {
        showFeedback({
          type:
            "error",

          title:
            "Fichier invalide",

          text:
            "Ce fichier n’est pas une sauvegarde JSON ClimbTrack valide.",
        });

        return;
      }

      if (
        !Array.isArray(
          parsed.sessionLogs,
        )
      ) {
        showFeedback({
          type:
            "error",

          title:
            "Sauvegarde non reconnue",

          text:
            "Le fichier ne contient pas les données attendues par ClimbTrack.",
        });

        return;
      }

      const sessionCount =
        getArrayLength(
          parsed.sessionLogs,
        );

      const injuryCount =
        getArrayLength(
          parsed.injuries,
        );

      const customExerciseCount =
        getArrayLength(
          parsed.customExercises,
        );

      const confirmed =
        window.confirm(
          `Importer cette sauvegarde ?\n\n${sessionCount} séance${
            sessionCount !==
            1
              ? "s"
              : ""
          }\n${injuryCount} blessure${
            injuryCount !==
            1
              ? "s"
              : ""
          }\n${customExerciseCount} exercice${
            customExerciseCount !==
            1
              ? "s"
              : ""
          } personnalisé${
            customExerciseCount !==
            1
              ? "s"
              : ""
          }\n\nLes données actuellement enregistrées seront remplacées.`,
        );

      if (
        !confirmed
      ) {
        return;
      }

      const success =
        importData(
          text,
        );

      if (
        !success
      ) {
        showFeedback({
          type:
            "error",

          title:
            "Import impossible",

          text:
            "ClimbTrack n’a pas pu restaurer cette sauvegarde.",
        });

        return;
      }

      showFeedback({
        type:
          "success",

        title:
          "Données importées",

        text:
          `${sessionCount} séance${
            sessionCount !==
            1
              ? "s"
              : ""
          } · ${injuryCount} blessure${
            injuryCount !==
            1
              ? "s"
              : ""
          } · ${customExerciseCount} exercice${
            customExerciseCount !==
            1
              ? "s"
              : ""
          } personnalisé${
            customExerciseCount !==
            1
              ? "s"
              : ""
          }.`,
      });
    } catch {
      showFeedback({
        type:
          "error",

        title:
          "Lecture impossible",

        text:
          "Impossible de lire le fichier sélectionné.",
      });
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background pb-28 pt-safe">
      {feedback && (
        <FeedbackToast
          feedback={
            feedback
          }
          onClose={() =>
            setFeedback(
              null,
            )
          }
        />
      )}

      <header className="border-b border-border bg-background px-5 py-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">
          Réglages
        </h1>
      </header>

      <main className="space-y-5 p-5">
        <SettingsSection title="Santé">
          <SettingsRow
            icon={
              <HeartPulse
                size={18}
              />
            }
            title="Blessures et douleurs"
            description={
              activeInjuries +
                improvingInjuries >
              0
                ? `${activeInjuries} active${
                    activeInjuries >
                    1
                      ? "s"
                      : ""
                  } · ${improvingInjuries} en amélioration`
                : "Aucune blessure active"
            }
            onClick={() =>
              navigate(
                "/blessures",
              )
            }
          />
        </SettingsSection>

        <SettingsSection title="Exercices">
          <button
            type="button"
            onClick={() =>
              setShowExerciseManager(
                (previous) =>
                  !previous,
              )
            }
            className="flex w-full items-center gap-3 px-3.5 py-3 text-left active:bg-white/[0.06]"
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-background text-white">
              <Dumbbell
                size={18}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-white">
                Gérer les exercices
              </p>

              <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                Modifier les exercices, catégories, séances et valeurs.
              </p>
            </div>

            {showExerciseManager ? (
              <ChevronUp
                size={17}
                className="text-muted-foreground"
              />
            ) : (
              <ChevronDown
                size={17}
                className="text-muted-foreground"
              />
            )}
          </button>

          {showExerciseManager && (
            <div className="border-t border-border bg-background/40 p-3">
              <ExerciseManager />
            </div>
          )}
        </SettingsSection>

        <SettingsSection title="Valeurs permanentes">
          <SettingsRow
            icon={
              <RotateCcw
                size={18}
              />
            }
            title="Réinitialiser les exercices"
            description="Restaure les valeurs proposées par défaut."
            onClick={
              handleResetDefaults
            }
          />
        </SettingsSection>

        <SettingsSection title="Sauvegarde">
          <SettingsRow
            icon={
              <Download
                size={18}
              />
            }
            title="Exporter mes données"
            description="Créer une sauvegarde JSON de ClimbTrack."
            onClick={
              handleExport
            }
          />

          <SettingsRow
            icon={
              <Upload
                size={18}
              />
            }
            title="Importer une sauvegarde"
            description="Remplacer les données actuelles par une sauvegarde."
            onClick={() =>
              fileInputRef.current?.click()
            }
          />

          <input
            ref={
              fileInputRef
            }
            type="file"
            accept=".json,application/json"
            onChange={
              handleImportFile
            }
            className="hidden"
          />

          <SettingsRow
            icon={
              <FileJson
                size={18}
              />
            }
            title="Éléments enregistrés"
            description={`${data.sessionLogs.length} séance${
              data.sessionLogs.length !==
              1
                ? "s"
                : ""
            } · ${data.injuries.length} blessure${
              data.injuries.length !==
              1
                ? "s"
                : ""
            } · ${data.customExercises.length} exercice${
              data.customExercises.length !==
              1
                ? "s"
                : ""
            } personnalisé${
              data.customExercises.length !==
              1
                ? "s"
                : ""
            }`}
          />
        </SettingsSection>

        {/*
         * Pas de titre "Zone dangereuse" :
         * l'utilisateur voit directement l'action.
         */}
        <SettingsSection>
          <SettingsRow
            icon={
              <Trash2
                size={18}
              />
            }
            title="Effacer toutes les données"
            description="Supprime définitivement toutes les données."
            onClick={
              handleClearData
            }
            destructive
          />
        </SettingsSection>

        <p className="px-3 text-center text-xs leading-relaxed text-muted-foreground/60">
          Les données sont enregistrées localement sur cet appareil.
        </p>
      </main>
    </div>
  );
}