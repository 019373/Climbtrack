import { useState } from "react";
import { Link, useLocation } from "wouter";
import { SESSIONS } from "@/data/sessions";
import { SessionCard } from "@/components/SessionCard";

export function SeancesPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background pb-24 pt-safe">
      <header className="px-5 py-6 bg-background/95 backdrop-blur-md sticky top-0 z-10 border-b border-border">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Séances</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">Programme d'entraînement</p>
      </header>

      <main className="p-5 space-y-4">
        {SESSIONS.map((session) => (
          <SessionCard 
            key={session.id} 
            session={session} 
            onClick={() => setLocation(`/seance/${session.id}`)} 
          />
        ))}
      </main>
    </div>
  );
}