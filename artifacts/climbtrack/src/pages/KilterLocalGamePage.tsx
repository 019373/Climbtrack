import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Crown, HelpCircle, Plus, RotateCcw, Trophy, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fontGradeToV, getDefaultFontGradeForV, KILTER_FONT_GRADES, useClimbTrack, type KilterFontGrade, type SessionLog } from "@/context/ClimbTrackContext";

type Player = { id: string; name: string; max: number; system: "v" | "font"; useHistory?: boolean; dnf?: boolean };
type Turn = { id: string; playerId: string; round: number; grade: number; angle: number; bonus: boolean; attempts: number; status: "active" | "won" | "failed" };
type Game = { version: 1; id: string; phase: "setup" | "play" | "finished"; angle: number; attemptLimit: number; perRound: number; round: number; players: Player[]; turns: Turn[]; awards: Record<string, string[]>; rulesOpen: boolean; tiebreakPlayers: string[] };
const KEY = "climbtrack_kilter_local_game_v1";
const ROUND_NAMES = ["Facile", "Moyenne", "Difficile", "Départage"];
const label = (g: number) => `V${g}`;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, Math.round(v)));
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
const initial = (): Game => ({ version: 1, id: uid(), phase: "setup", angle: 30, attemptLimit: 6, perRound: 3, round: 0, players: [{ id: "host", name: "Moi", max: 4, system: "v", useHistory: true }, { id: uid(), name: "Joueur 2", max: 4, system: "v" }], turns: [], awards: {}, rulesOpen: false, tiebreakPlayers: [] });
function load(): Game {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || "null");
    if (value?.version === 1 && Array.isArray(value.players) && Array.isArray(value.turns) && value.players.length) return value as Game;
  } catch { /* Ancienne sauvegarde illisible : partie neuve. */ }
  return initial();
}
function drawGrade(max: number, round: number, bonus: boolean) {
  if (bonus) return clamp(max + Math.floor(Math.random() * 2), 1, 17);
  const high = Math.max(1, max - 1);
  const low = Math.max(1, max - 5);
  const pool = Array.from({ length: high - low + 1 }, (_, i) => low + i);
  const weights = pool.map((_, i) => round === 0 ? pool.length - i : round === 1 ? Math.max(1, pool.length - Math.abs(i - (pool.length - 1) / 2) * 1.4) : i + 1);
  let roll = Math.random() * weights.reduce((a, b) => a + b, 0);
  return pool.find((g, i) => (roll -= weights[i]) < 0) ?? high;
}
function points(t: Turn, attemptLimit: number) {
  if (t.status === "active") return 0;
  if (t.status === "failed") return attemptLimit;
  if (t.attempts === 1) return t.bonus ? -2 : 0;
  if (!t.bonus) return t.attempts;
  return t.attempts === 2 ? 1 : t.attempts / 2 + 0.5;
}
function score(g: Game, id: string) {
  const base = g.turns.filter(t => t.playerId === id).reduce((s, t) => s + points(t, g.attemptLimit), 0);
  const reward = Object.values(g.awards).filter(ids => ids.includes(id)).length * 0.5;
  return base - reward;
}
const btn = "rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-bold disabled:opacity-40 active:scale-[0.98]";
const primary = "rounded-xl bg-primary px-4 py-3 text-sm font-black text-primary-foreground disabled:opacity-40 active:scale-[0.98]";
const field = "w-full min-w-0 rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground";

export function KilterLocalGamePage() {
  const navigate = useNavigate();
  const { data, addSessionLog } = useClimbTrack();
  // KILTER_EDITABLE_ZERO_V1
  const [game, setGame] = useState<Game>(load);
  const [perRoundInput, setPerRoundInput] =
    useState(() => String(game.perRound));
  const [attemptLimitInput, setAttemptLimitInput] =
    useState(() => String(game.attemptLimit));
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmNext, setConfirmNext] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(game)); } catch { setNotice("Stockage local saturé : sauvegarde de la partie impossible."); } }, [game]);
  const change = (f: (g: Game) => Game) => setGame(g => f(g));

  function updateNumberInput(
    field: "perRound" | "attemptLimit",
    text: string
  ) {
    if (text !== "" && !/^\d{1,2}$/.test(text)) return;

    if (field === "perRound") {
      setPerRoundInput(text);
    } else {
      setAttemptLimitInput(text);
    }

    const maximum = field === "perRound" ? 12 : 20;

    change(g => ({
      ...g,
      [field]: text === ""
        ? 0
        : Math.min(Number(text), maximum),
    }));
  }

  function finishNumberInput(
    field: "perRound" | "attemptLimit",
    text: string
  ) {
    const maximum = field === "perRound" ? 12 : 20;
    const value = clamp(Number(text) || 0, 0, maximum);

    if (field === "perRound") {
      setPerRoundInput(String(value));
    } else {
      setAttemptLimitInput(String(value));
    }

    change(g => ({ ...g, [field]: value }));
  }
  const autoGrade = useMemo(() => {
    const successes = data.sessionLogs.flatMap(s => s.kilterEntries || []).filter(e => e.result === "reussi" && e.angle === game.angle);
    return successes.length ? Math.max(...successes.map(e => e.grade)) : null;
  }, [data.sessionLogs, game.angle]);
  const maxOf = (p: Player) => p.id === "host" && p.useHistory && autoGrade !== null ? autoGrade : p.max;
  const activePlayers = game.players.filter(p => !p.dnf && (game.round !== 3 || game.tiebreakPlayers.includes(p.id)));
  const quota = game.round === 3 ? 1 : game.perRound;
  const playerTurns = (id: string) => game.turns.filter(t => t.playerId === id && t.round === game.round);
  const myTurn = selected ? playerTurns(selected).find(t => t.status === "active") : undefined;
  const myPlayer = game.players.find(p => p.id === selected);
  const ranked = [...game.players].sort((a, b) => Number(!!a.dnf) - Number(!!b.dnf) || score(game, a.id) - score(game, b.id) || a.name.localeCompare(b.name, "fr"));
  const done = activePlayers.every(p => playerTurns(p.id).length >= quota && playerTurns(p.id).every(t => t.status !== "active"));
  const savedId = `kilter-local-game-${game.id}`;
  const alreadySaved = data.sessionLogs.some(s => s.id === savedId);
  const hostTurns = game.turns.filter(t => t.playerId === "host" && t.status !== "active" && t.attempts > 0);
  const finalists = ranked.filter(p => !p.dnf);
  const tieNeedsDuel = game.round === 2 && finalists.length > 1 && score(game, finalists[0].id) === score(game, finalists[1].id);

  const addPlayer = () => change(g => ({ ...g, players: [...g.players, { id: uid(), name: `Joueur ${g.players.length + 1}`, max: 4, system: "v" }] }));
  const updatePlayer = (id: string, patch: Partial<Player>) => change(g => ({ ...g, players: g.players.map(p => p.id === id ? { ...p, ...patch } : p) }));
  function draw(id: string, bonus: boolean) {
    const p = game.players.find(x => x.id === id);
    if (!p || p.dnf || playerTurns(id).length >= quota || playerTurns(id).some(t => t.status === "active")) return;
    const used = playerTurns(id).filter(t => t.bonus).length;
    if (bonus && (game.round === 3 || used >= 2)) return;
    const turn: Turn = { id: uid(), playerId: id, round: game.round, grade: drawGrade(maxOf(p), game.round, bonus), angle: game.angle, bonus, attempts: 0, status: "active" };
    change(g => ({ ...g, turns: [...g.turns, turn] }));
    setSelected(id);
  }
  function mark(win: boolean) {
    if (!myTurn) return;
    change(g => ({ ...g, turns: g.turns.map(t => t.id === myTurn.id ? { ...t, attempts: t.attempts + 1, status: win ? "won" : t.attempts + 1 >= g.attemptLimit ? "failed" : "active" } : t) }));
    if (win || myTurn.attempts + 1 >= game.attemptLimit) setSelected(null);
  }
  function failEarly() {
    if (!myTurn || !window.confirm("Abandonner ce bloc ? Il comptera comme échoué.")) return;
    change(g => ({ ...g, turns: g.turns.map(t => t.id === myTurn.id ? { ...t, status: "failed" } : t) }));
    setSelected(null);
  }
  function quitPlayer(id: string) {
    if (!window.confirm("Ce joueur abandonne la partie ? Il sera classé DNF, derrière les autres.")) return;
    change(g => ({ ...g, players: g.players.map(p => p.id === id ? { ...p, dnf: true } : p) }));
    setSelected(null);
  }
  function nextRound() {
    const remaining = activePlayers.some(p => playerTurns(p.id).length < quota || playerTurns(p.id).some(t => t.status === "active"));
    if (remaining && !confirmNext) { setConfirmNext(true); return; }
    change(g => {
      const filled = [...g.turns];
      for (const p of activePlayers) {
        const existing = filled.filter(t => t.playerId === p.id && t.round === g.round);
        for (const t of existing.filter(t => t.status === "active")) {
          const i = filled.findIndex(x => x.id === t.id);
          filled[i] = { ...t, status: "failed" };
        }
        for (let n = existing.length; n < quota; n++) filled.push({ id: uid(), playerId: p.id, round: g.round, grade: Math.max(1, maxOf(p) - 1), angle: g.angle, bonus: false, attempts: 0, status: "failed" });
      }
      const awards = { ...g.awards };
      if (g.round < 2 && activePlayers.length > 0) {
        const sums = activePlayers.map(p => ({ id: p.id, tries: filled.filter(t => t.playerId === p.id && t.round === g.round).reduce((s, t) => s + (t.status === "failed" ? g.attemptLimit : t.attempts), 0) }));
        const minimum = Math.min(...sums.map(x => x.tries));
        awards[String(g.round)] = sums.filter(x => x.tries === minimum).map(x => x.id);
      }
      return { ...g, turns: filled, awards, round: g.round >= 2 ? g.round : g.round + 1, phase: g.round >= 2 ? "finished" : "play" };
    });
    setSelected(null); setConfirmNext(false);
  }
  function startTiebreak() {
    const contenders = ranked.filter(p => !p.dnf && score(game, p.id) === score(game, ranked.find(x => !x.dnf)!.id));
    if (contenders.length < 2) return;
    change(g => ({ ...g, phase: "play", round: 3, tiebreakPlayers: contenders.map(p => p.id) }));
  }
  function saveOwn() {
    if (alreadySaved || hostTurns.length === 0) return;
    const today = new Date();
    const date = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, "0"), String(today.getDate()).padStart(2, "0")].join("-");
    const log: SessionLog = { id: savedId, date, completedAt: today.toISOString(), sessionId: "kilter", exerciseLogs: [], kilterEntries: hostTurns.map(t => ({ id: t.id, angle: t.angle, grade: t.grade, gradeSystem: "v", displayGrade: label(t.grade), result: t.status === "won" ? "reussi" : "echoue", attempts: t.attempts || undefined })), climbingDurationMinutes: Math.max(5, hostTurns.reduce((s, t) => s + t.attempts, 0) * 2), note: "Jeu Kilter local. Durée estimée à partir des essais ; seuls les résultats de l'organisateur sont enregistrés." };
    addSessionLog(log);
    setNotice("Tes blocs Kilter ont été enregistrés dans ton historique.");
  }
  function reset() { if (!confirmReset) { setConfirmReset(true); return; } setGame(initial()); setPerRoundInput("3"); setAttemptLimitInput("6"); setSelected(null); setConfirmReset(false); setConfirmNext(false); setNotice(""); }

  return <div className="min-h-screen bg-background pb-24 text-foreground">
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-md">
      <button onClick={() => navigate(-1)} className="rounded-full p-2" aria-label="Retour"><ArrowLeft size={19}/></button>
      <div className="min-w-0 flex-1"><h1 className="text-base font-black">Kilter Game</h1><p className="text-xs text-muted-foreground">Original 12×12 · Kickboard · 1 téléphone</p></div>
      <button onClick={() => change(g => ({ ...g, rulesOpen: true }))} aria-label="Règles" className="rounded-full p-2 text-muted-foreground"><HelpCircle size={19}/></button>
    </header>
    <main className="mx-auto max-w-2xl space-y-4 p-4">
      {notice && <p role="status" className="rounded-xl border border-border bg-card p-3 text-sm">{notice}</p>}
      {game.phase === "setup" && <>
        <section className="space-y-3 rounded-2xl border border-border bg-card p-4"><h2 className="font-black">Paramètres de la partie</h2>
          <div className="grid grid-cols-3 gap-2"><label className="text-xs">Angle<select className={field} value={game.angle} onChange={e => change(g => ({ ...g, angle: Number(e.target.value) }))}>{Array.from({length:11},(_,i)=>20+i*5).map(x=><option key={x} value={x}>{x}°</option>)}</select></label>
          <label className="text-xs">Blocs / manche<input className={field} type="number" min={0} max={12} value={perRoundInput} onChange={e=>updateNumberInput("perRound",e.target.value)} onBlur={e=>finishNumberInput("perRound",e.target.value)}/></label>
          <label className="text-xs">Essais max.<input className={field} type="number" min={0} max={20} value={attemptLimitInput} onChange={e=>updateNumberInput("attemptLimit",e.target.value)} onBlur={e=>finishNumberInput("attemptLimit",e.target.value)}/></label></div>
          <p className="text-xs text-muted-foreground">Trois manches : facile, moyenne, difficile. Même nombre de blocs pour chacun.</p>
        </section>
        <section className="space-y-3 rounded-2xl border border-border bg-card p-4"><h2 className="font-black">Participants</h2>
        {game.players.map(p=><div key={p.id} className="space-y-2 rounded-xl border border-border p-3"><div className="flex gap-2"><input aria-label="Pseudo" className={field} value={p.name} maxLength={30} onChange={e=>updatePlayer(p.id,{name:e.target.value})}/>{p.id!=="host" && <button className={btn} onClick={()=>change(g=>({...g,players:g.players.filter(x=>x.id!==p.id)}))} aria-label="Retirer joueur"><X size={16}/></button>}</div>
          <div className="flex items-end gap-2"><label className="flex-1 text-xs">Niveau maximum<select className={field} value={p.system==="font"?getDefaultFontGradeForV(p.max):String(p.max)} disabled={p.id==="host"&&p.useHistory&&autoGrade!==null} onChange={e=>updatePlayer(p.id,{max:p.system==="font"?fontGradeToV(e.target.value as KilterFontGrade):Number(e.target.value)})}>{p.system==="v"?Array.from({length:17},(_,i)=><option key={i} value={i+1}>V{i+1}</option>):KILTER_FONT_GRADES.filter(x=>fontGradeToV(x)>=1).map(x=><option key={x} value={x}>{x.toUpperCase()}</option>)}</select></label>
            <label className="text-xs">Échelle<select className={field} value={p.system} onChange={e=>updatePlayer(p.id,{system:e.target.value as "v"|"font"})}><option value="v">V</option><option value="font">Font</option></select></label></div>
            {p.id==="host" && <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={!!p.useHistory} onChange={e=>updatePlayer(p.id,{useHistory:e.target.checked})}/>Déduire mon maximum de mes résultats Kilter à {game.angle}° {autoGrade!==null?`(V${autoGrade})`:"(aucun record : valeur manuelle)"}</label>}
          </div>)}
          <button className={btn+" flex items-center gap-2"} onClick={addPlayer}><Plus size={16}/>Ajouter un joueur</button>
          <p className="text-xs text-muted-foreground">Le premier joueur correspond au propriétaire de ClimbTrack. Les autres scores restent locaux et ne modifient pas son historique.</p>
        </section>
        <button className={primary+" w-full"} disabled={game.players.some(p=>!p.name.trim()) || game.perRound < 1 || game.attemptLimit < 1 || perRoundInput === "" || attemptLimitInput === ""} onClick={()=>change(g=>({...g,phase:"play",rulesOpen:true}))}>Commencer la partie</button>
      </>}
      {game.phase !== "setup" && <>
        <div className="flex items-center justify-between gap-2"><div><p className="text-xs text-muted-foreground">{game.phase==="finished"?"Partie terminée":`Manche ${game.round+1}/${game.round===3?4:3}`}</p><h2 className="text-xl font-black">{ROUND_NAMES[game.round]}</h2></div>
          <label className="text-xs text-muted-foreground">Inclinaison pour les prochains blocs<select className={field} value={game.angle} onChange={e=>change(g=>({...g,angle:Number(e.target.value)}))}>{Array.from({length:11},(_,i)=>20+i*5).map(x=><option key={x} value={x}>{x}°</option>)}</select></label></div>
        {myPlayer && game.phase==="play" ? <section className="space-y-4 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between"><h3 className="font-black">Tour de {myPlayer.name}</h3><button className={btn} onClick={()=>setSelected(null)}>Pause / retour</button></div>
          {myTurn ? <><div className="rounded-xl border border-border bg-background p-5 text-center"><p className="text-xs text-muted-foreground">Bloc à chercher dans Kilter Board App</p><div className="my-2 text-5xl font-black">{label(myTurn.grade)}</div><p className="text-sm">{getDefaultFontGradeForV(myTurn.grade)} · {myTurn.angle}° {myTurn.bonus?"· BONUS":""}</p></div>
            <p className="text-center text-sm">{myTurn.attempts} essai(s) raté(s) · limite {game.attemptLimit}</p>
            <div className="grid grid-cols-2 gap-2"><button className={primary} onClick={()=>mark(true)}>Réussi au prochain essai</button><button className={btn} onClick={()=>mark(false)}>Essai raté</button></div>
            <button className={btn+" w-full"} onClick={failEarly}>Abandonner ce bloc (échec)</button>
          </> : <><p className="text-sm text-muted-foreground">Choisis ton mode avant de découvrir la cotation. Le bloc sera choisi dans Kilter Board App par le joueur.</p>
            <button className={primary+" w-full"} disabled={playerTurns(myPlayer.id).length>=quota} onClick={()=>draw(myPlayer.id,false)}>Tirer une cotation normale</button>
            {game.round!==3&&<button className={btn+" w-full"} disabled={playerTurns(myPlayer.id).length>=quota||playerTurns(myPlayer.id).filter(t=>t.bonus).length>=2} onClick={()=>draw(myPlayer.id,true)}>Bonus +2 de difficulté · {2-playerTurns(myPlayer.id).filter(t=>t.bonus).length} restant(s)</button>}
          </>}
        </section> : <>
          <section className="space-y-3 rounded-2xl border border-border bg-card p-4"><div className="flex items-center gap-2"><Trophy size={18}/><h3 className="font-black">Classement</h3><span className="ml-auto text-xs text-muted-foreground">Moins de points = mieux</span></div>
            <div className="space-y-2">{ranked.map((p,i)=><motion.div layout key={p.id} transition={{type:"spring",stiffness:320,damping:32}} className="flex items-center gap-3 rounded-xl border border-border bg-background p-3"><span className="w-8 text-center text-lg font-black">{i===0&&!p.dnf?<Crown className="mx-auto text-yellow-500" size={19}/>:i+1}</span><span className="min-w-0 flex-1 truncate text-sm font-bold">{p.name} {p.dnf?"· DNF":""}</span><span className="text-sm font-black tabular-nums">{score(game,p.id).toLocaleString("fr-CH")} pt</span></motion.div>)}</div>
          </section>
          {game.phase==="play" && <section className="space-y-2 rounded-2xl border border-border bg-card p-4"><h3 className="font-black">À qui le tour ?</h3>{activePlayers.map(p=>{const turns=playerTurns(p.id);const active=turns.some(t=>t.status==="active");const finished=turns.length>=quota&&!active;return <button key={p.id} disabled={finished} onClick={()=>setSelected(p.id)} className={btn+" flex w-full items-center justify-between"}><span>{p.name} · {turns.length}/{quota} bloc(s)</span><span className="flex items-center gap-1 text-xs">{finished?"Terminé":active?"Reprendre":"Jouer"}<ChevronRight size={14}/></span></button>})}</section>}
          {game.phase==="play"&&<><button className={primary+" w-full"} onClick={nextRound}>{game.round>=2?"Terminer la partie":"Passer à la manche suivante"}{!done?" (blocs manquants)":""}</button>{confirmNext&&<div className="rounded-xl border border-destructive p-3 text-sm"><p>Les blocs non terminés ou non tirés seront comptés comme échoués.</p><div className="mt-2 flex gap-2"><button className={btn} onClick={()=>setConfirmNext(false)}>Annuler</button><button className={primary} onClick={nextRound}>Confirmer</button></div></div>}{activePlayers.map(p=><button key={p.id} className="mr-2 text-xs text-muted-foreground underline" onClick={()=>quitPlayer(p.id)}>DNF : {p.name}</button>)}</>}
          {game.phase==="finished"&&<><p className="text-xs text-muted-foreground">Les autres joueurs ne sont jamais enregistrés dans ton historique ClimbTrack.</p><button className={primary+" w-full"} disabled={alreadySaved||hostTurns.length===0||tieNeedsDuel} onClick={saveOwn}>{alreadySaved?"Mes résultats sont enregistrés":tieNeedsDuel?"Terminer le duel avant l’enregistrement":"Enregistrer mes blocs dans mon ClimbTrack"}</button>{game.round===3?null:ranked.filter(p=>!p.dnf).length>=2&&ranked.filter(p=>!p.dnf&&score(game,p.id)===score(game,ranked.find(x=>!x.dnf)!.id)).length>=2&&<button className={btn+" w-full"} onClick={startTiebreak}>Duel de départage · 1 bloc, sans bonus</button>}</>}
        </>}
      </>}
      <button className={btn+" flex items-center gap-2 text-xs"} onClick={reset}><RotateCcw size={14}/>Nouvelle partie</button>{confirmReset&&<div className="flex gap-2 rounded-xl border border-destructive p-3"><p className="flex-1 text-xs">La partie actuelle sera remplacée. Enregistre d'abord tes résultats personnels.</p><button className={btn} onClick={()=>setConfirmReset(false)}>Annuler</button><button className={primary} onClick={reset}>Confirmer</button></div>}
    </main>
    <AnimatePresence>{game.rulesOpen&&<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[100] overflow-y-auto bg-black/85 p-4"><div className="mx-auto max-w-lg space-y-3 rounded-2xl border border-border bg-background p-5"><button onClick={()=>change(g=>({...g,rulesOpen:false}))} className="rounded-full p-2" aria-label="Fermer les règles"><X size={20}/></button><h2 className="text-xl font-black">Règles du jeu Kilter</h2><p className="text-sm">Chaque joueur cherche lui-même un bloc de la cotation tirée dans Kilter Board App, sur le mur Original 12×12 avec kickboard, à l'angle affiché. On joue sur la confiance.</p><p className="text-sm">Trois manches : facile, moyenne et difficile. Le maximum est individuel. Les cotations vont de V1 à V17, et les angles de 20° à 70°.</p><p className="text-sm">Un flash vaut 0 point ; à partir de deux essais, le score normal est le nombre d'essais. Le bonus, à choisir avant le tirage, donne −2 pour un flash, 1 pour deux essais, puis essais ÷ 2 + 0,5.</p><p className="text-sm">Deux bonus par manche, sans cumul. Un bloc échoué vaut la limite d'essais. Un joueur peut faire une pause, reprendre ou abandonner son bloc. DNF termine dernier.</p><p className="text-sm">Après les deux premières manches, le moins d'essais cumulés de la manche rapporte −0,5 point. Égalité finale : duel d'un bloc sans bonus. Seuls les résultats de l'organisateur peuvent être enregistrés dans son ClimbTrack.</p></div></motion.div>}</AnimatePresence>
  </div>;
}
