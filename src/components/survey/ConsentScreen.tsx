'use client';

import { ArrowRight, ShieldCheck } from 'lucide-react';
import { STUDY_TITLE } from '@/lib/survey';

interface ConsentScreenProps {
  consent: boolean;
  onConsentChange: (consent: boolean) => void;
  onStart: () => void;
}

export function ConsentScreen({ consent, onConsentChange, onStart }: ConsentScreenProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{STUDY_TITLE}</h1>

      <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-slate-700">
        <p className="font-semibold text-slate-900">Bienvenue et merci de votre participation !</p>
        <p>
          Dans le cadre de notre master Marketing-Vente et de notre cours « Prix et budget marketing » à
          L’IAE Clermont-Auvergne, nous réalisons une étude sur la perception du prix d&apos;une veste
          outdoor. Vos réponses nous aideront à comprendre ce que les consommateurs sont prêts à payer pour
          ce type de produit.
        </p>
        <p>
          Je comprends que ma participation à cette étude est volontaire et que je peux y mettre fin à tout
          moment, sans avoir à fournir de justification. Je suis conscient(e) que mes réponses resteront
          anonymes et confidentielles, et qu’elles ne seront utilisées qu’à des fins pédagogiques. J’ai
          également été informé(e) que je suis libre de ne pas répondre à certaines questions si je le
          souhaite.
        </p>
      </div>

      <label
        className={`mt-6 flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
          consent ? 'border-emerald-700 bg-emerald-50 ring-1 ring-emerald-700' : 'border-slate-300 bg-slate-50'
        }`}
      >
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => onConsentChange(event.currentTarget.checked)}
          className="h-5 w-5 shrink-0"
        />
        <span className="font-semibold text-slate-900">Je suis consentant</span>
      </label>

      <button
        type="button"
        onClick={onStart}
        disabled={!consent}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 sm:w-auto"
      >
        Démarrer le questionnaire
        <ArrowRight className="h-5 w-5" aria-hidden />
      </button>

      <p className="mt-5 flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden />
        Questionnaire anonyme, environ 5 minutes.
      </p>
    </div>
  );
}
