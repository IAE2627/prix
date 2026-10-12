'use client';

import type { ReactNode } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

export const TOTAL_STEPS = 5;

interface StepLayoutProps {
  step: number;
  title: string;
  children: ReactNode;
  onNext: () => void;
  onBack?: () => void;
  nextLabel?: string;
  /** Message affiché au-dessus des boutons (erreurs de validation ou d'envoi). */
  alert?: string | null;
  busy?: boolean;
}

export function StepLayout({
  step,
  title,
  children,
  onNext,
  onBack,
  nextLabel = 'Suivant',
  alert,
  busy = false,
}: StepLayoutProps) {
  const progress = Math.round((step / TOTAL_STEPS) * 100);

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-semibold text-emerald-800">
            Étape {step} sur {TOTAL_STEPS}
          </span>
          <span className="tabular-nums text-slate-500">{progress} %</span>
        </div>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-label="Progression du questionnaire"
          className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"
        >
          <div className="h-full rounded-full bg-emerald-700 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">{title}</h2>
      </div>

      <div className="space-y-5">{children}</div>

      {alert && (
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-medium text-red-800"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <span>{alert}</span>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between gap-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Précédent
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={onNext}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          {nextLabel}
          {!busy && <ArrowRight className="h-4 w-4" aria-hidden />}
        </button>
      </div>
    </div>
  );
}
