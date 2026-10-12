'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Mountain } from 'lucide-react';
import {
  GG_PRICES,
  VERSIONS,
  assignVersion,
  generateRespondentId,
  type FrequencyMatrix,
} from '@/lib/survey';
import type { Stage, SurveyState } from '@/lib/types';
import { Backdrop } from './Backdrop';
import { ConsentScreen } from './ConsentScreen';
import { EndScreen } from './EndScreen';
import { Step1Practice } from './Step1Practice';
import { Step2Habits } from './Step2Habits';
import { Step3Product } from './Step3Product';
import { Step4Measures, parseVw } from './Step4Measures';
import { Step5Profile } from './Step5Profile';

// Incrémenter la version quand la structure des réponses change (ex. paliers de prix).
const STORAGE_KEY = 'etude-veste-outdoor:v5';
const STAGES: Stage[] = ['consent', 'step1', 'step2', 'step3', 'step4', 'step5', 'done', 'screenout'];

/** Tirage aléatoire de la version A/B effectué une seule fois, au chargement. */
function createInitialState(): SurveyState {
  return {
    respondentId: generateRespondentId(),
    version: assignVersion(),
    // Paliers Gabor-Granger présentés du prix le plus bas au plus élevé.
    ggOrder: [...GG_PRICES].sort((a, b) => a - b),
    startedAt: null,
    consent: false,
    q1: null,
    q2: {
      randonnee: null,
      trail: null,
      ski: null,
      alpinisme: null,
      vtt: null,
      nautique: null,
      camping: null,
      autre: null,
    },
    q2AutreText: '',
    q3: null,
    q4: null,
    q5: null,
    q5b: null,
    q6: [null, null, null],
    brandKnown: null,
    qpFiabilite: null,
    qpFabrication: null,
    qpQualite: null,
    qpConfiance: null,
    qpDurabilite: null,
    vw: { m5: '', m6: '', m7: '', m8: '' },
    gg: Object.fromEntries(GG_PRICES.map((price) => [String(price), null])),
    manipCheck: null,
    genre: null,
    age: null,
    situation: null,
    engRessources: null,
    engTemps: null,
    engEfforts: null,
    engPlace: null,
    engOccasions: null,
  };
}

/**
 * Reprise après rechargement de la page : le répondant conserve sa version A/B,
 * son ordre de paliers et ses réponses (stockage limité à l'onglet courant).
 */
function restoreSession(): { state: SurveyState; stage: Stage } | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as { state?: SurveyState; stage?: Stage };
    if (
      saved.state &&
      typeof saved.state.respondentId === 'string' &&
      VERSIONS.includes(saved.state.version) &&
      Array.isArray(saved.state.ggOrder) &&
      saved.stage &&
      STAGES.includes(saved.stage)
    ) {
      return { state: saved.state, stage: saved.stage };
    }
  } catch {
    // Stockage indisponible ou corrompu : on repart d'une session vierge.
  }
  return null;
}

async function postSubmission(payload: unknown): Promise<boolean> {
  try {
    const response = await fetch('/api/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
    return response.ok;
  } catch {
    return false;
  }
}

export default function Survey() {
  const [state, setState] = useState<SurveyState | null>(null);
  const [stage, setStage] = useState<Stage>('consent');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const restored = restoreSession();
    if (restored) {
      setState(restored.state);
      setStage(restored.stage);
    } else {
      setState(createInitialState());
    }
  }, []);

  useEffect(() => {
    if (!state) return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ state, stage }));
    } catch {
      // Navigation privée stricte : le questionnaire fonctionne sans reprise.
    }
  }, [state, stage]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [stage]);

  const update = useCallback((patch: Partial<SurveyState>) => {
    setState((current) => (current ? { ...current, ...patch } : current));
  }, []);

  if (!state) {
    return (
      <main className="flex min-h-screen items-center justify-center text-slate-500">
        <Backdrop />
        <Loader2 className="h-6 w-6 animate-spin" aria-label="Chargement" />
      </main>
    );
  }

  const identity = {
    respondentId: state.respondentId,
    version: state.version,
    startedAt: state.startedAt ?? new Date().toISOString(),
  };

  const start = () => {
    if (!state.consent) return;
    update({ startedAt: new Date().toISOString() });
    setStage('step1');
  };

  // Le screen-out est enregistré pour pouvoir calculer le taux d'éligibilité.
  const screenOutQ2 = (q2: FrequencyMatrix) => {
    setStage('screenout');
    void postSubmission({
      ...identity,
      status: 'screened_out_q2',
      q1: 'oui',
      q2,
      q2AutreText: state.q2AutreText.trim(),
    });
  };

  const submit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    // Q1 = Non : Q2 à Q4 et l'échelle d'engagement n'ont pas été posées, elles restent
    // vides même si le répondant avait commencé à y répondre avant de changer d'avis.
    const practises = state.q1 === 'oui';
    const ok = await postSubmission({
      ...identity,
      status: 'completed',
      ggOrder: state.ggOrder,
      q1: state.q1,
      q2: practises ? state.q2 : null,
      q2AutreText: practises ? state.q2AutreText.trim() : '',
      q3: practises ? state.q3 : null,
      q4: practises ? state.q4 : null,
      q5: state.q5,
      q5b: state.q5 === 'non_jamais' ? null : state.q5b,
      q6: state.q6,
      brandKnown: state.brandKnown,
      qpFiabilite: state.qpFiabilite,
      qpFabrication: state.qpFabrication,
      qpQualite: state.qpQualite,
      qpConfiance: state.qpConfiance,
      qpDurabilite: state.qpDurabilite,
      vw: parseVw(state.vw),
      gg: state.gg,
      manipCheck: state.manipCheck,
      genre: state.genre,
      age: state.age,
      situation: state.situation,
      engRessources: practises ? state.engRessources : null,
      engTemps: practises ? state.engTemps : null,
      engEfforts: practises ? state.engEfforts : null,
      engPlace: practises ? state.engPlace : null,
      engOccasions: practises ? state.engOccasions : null,
    });
    setSubmitting(false);
    if (ok) {
      setStage('done');
    } else {
      setSubmitError(
        "L'envoi de vos réponses a échoué. Vérifiez votre connexion puis cliquez à nouveau sur « Envoyer mes réponses ».",
      );
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-6 sm:pt-10">
      <Backdrop />
      <header className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-700">
        <Mountain className="h-5 w-5 text-emerald-700" aria-hidden />
        Master Marketing-Vente · IAE Clermont-Auvergne
      </header>

      {stage === 'consent' && (
        <ConsentScreen
          consent={state.consent}
          onConsentChange={(consent) => update({ consent })}
          onStart={start}
        />
      )}
      {stage === 'step1' && (
        <Step1Practice
          state={state}
          update={update}
          onNext={() => setStage('step2')}
          onScreenOutQ2={screenOutQ2}
        />
      )}
      {stage === 'step2' && (
        <Step2Habits state={state} update={update} onNext={() => setStage('step3')} onBack={() => setStage('step1')} />
      )}
      {stage === 'step3' && (
        <Step3Product state={state} update={update} onNext={() => setStage('step4')} onBack={() => setStage('step2')} />
      )}
      {stage === 'step4' && <Step4Measures state={state} update={update} onNext={() => setStage('step5')} />}
      {stage === 'step5' && (
        <Step5Profile
          state={state}
          update={update}
          onSubmit={submit}
          onBack={() => setStage('step4')}
          submitting={submitting}
          submitError={submitError}
        />
      )}
      {stage === 'done' && <EndScreen variant="done" />}
      {stage === 'screenout' && <EndScreen variant="screenout" />}
    </main>
  );
}
