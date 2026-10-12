'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { LikertScale } from '@/components/ui/LikertScale';
import { MatrixQuestion } from '@/components/ui/MatrixQuestion';
import { QuestionBlock } from '@/components/ui/QuestionBlock';
import { StepLayout } from '@/components/ui/StepLayout';
import {
  GG_OPTIONS,
  QUALITY_ITEMS,
  SCALE_MANIP,
  VW_FIELDS,
  parseEuro,
  vwCoherenceErrors,
  type GgAnswer,
  type VwKey,
} from '@/lib/survey';
import type { StepProps, SurveyState } from '@/lib/types';

interface Step4Props extends StepProps {
  onNext: () => void;
}

const REQUIRED = 'Merci de répondre à cette question.';

export function parseVw(vw: SurveyState['vw']): Record<VwKey, number | null> {
  return { m5: parseEuro(vw.m5), m6: parseEuro(vw.m6), m7: parseEuro(vw.m7), m8: parseEuro(vw.m8) };
}

/**
 * Pas de bouton « Précédent » sur cet écran : revenir à la fiche produit
 * fausserait le manipulation check, qui mesure le souvenir de la promotion.
 */
export function Step4Measures({ state, update, onNext }: Step4Props) {
  const [showErrors, setShowErrors] = useState(false);

  const vwValues = parseVw(state.vw);
  const vwMissing = VW_FIELDS.some((field) => vwValues[field.key] === null);
  // Contrôle de cohérence évalué à chaque frappe, indépendamment du clic sur « Suivant ».
  const vwErrors = vwCoherenceErrors(vwValues);

  const ggMissing = state.ggOrder.filter((price) => state.gg[String(price)] === null);

  const hasErrors =
    QUALITY_ITEMS.some((item) => state[item.key] === null) ||
    vwMissing ||
    vwErrors.length > 0 ||
    ggMissing.length > 0 ||
    state.manipCheck === null;

  const handleNext = () => {
    if (hasErrors) {
      setShowErrors(true);
      return;
    }
    onNext();
  };

  const handleVw = (key: VwKey, raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 6);
    update({ vw: { ...state.vw, [key]: digits } });
  };

  let alert: string | null = null;
  if (vwErrors.length > 0) alert = 'Les 4 prix doivent être strictement croissants : corrigez-les pour continuer.';
  else if (showErrors && hasErrors) alert = 'Merci de compléter les questions signalées avant de continuer.';

  return (
    <StepLayout step={4} title="Votre avis sur cette veste" onNext={handleNext} alert={alert}>
      {QUALITY_ITEMS.map((item) => (
        <QuestionBlock
          key={item.key}
          title={item.statement}
          error={showErrors && state[item.key] === null ? REQUIRED : null}
        >
          <LikertScale
            name={item.key}
            value={state[item.key]}
            onChange={(value) => update({ [item.key]: value })}
            labels={item.labels}
          />
        </QuestionBlock>
      ))}

      <QuestionBlock
        title="Votre perception du prix de cette veste"
        hint="Indépendamment du prix affiché, répondez selon votre propre perception. Montants en euros, sans centimes."
        error={showErrors && vwMissing ? 'Merci de saisir un montant en euros dans chacun des 4 champs.' : null}
      >
        <div className="space-y-4">
          {VW_FIELDS.map((field) => {
            const missing = showErrors && vwValues[field.key] === null;
            return (
              <div key={field.key} className="sm:flex sm:items-center sm:justify-between sm:gap-6">
                <label htmlFor={`vw-${field.key}`} className="block text-sm leading-relaxed text-slate-800">
                  {field.label}
                </label>
                <div className="relative mt-2 w-full shrink-0 sm:mt-0 sm:w-36">
                  <input
                    id={`vw-${field.key}`}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={state.vw[field.key]}
                    onChange={(event) => handleVw(field.key, event.currentTarget.value)}
                    aria-invalid={missing || vwErrors.length > 0}
                    className={`w-full rounded-xl border bg-white py-2.5 pl-3 pr-9 text-right text-base font-semibold tabular-nums text-slate-900 focus:outline-none focus:ring-2 ${
                      missing || vwErrors.length > 0
                        ? 'border-red-400 focus:ring-red-500'
                        : 'border-slate-300 focus:border-emerald-700 focus:ring-emerald-700'
                    }`}
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-500">
                    €
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {vwErrors.length > 0 && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800"
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <div>
              <p className="font-semibold">
                Vos réponses ne sont pas cohérentes : chaque prix doit être strictement supérieur au précédent.
              </p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {vwErrors.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </QuestionBlock>

      <QuestionBlock
        title="Seriez-vous prêt(e) à acheter cette veste aux prix suivants ?"
        hint="Une seule réponse par ligne."
        error={showErrors && ggMissing.length > 0 ? 'Merci de répondre pour chacun des prix.' : null}
      >
        <MatrixQuestion
          name="gg"
          rowHeader="Prix"
          rows={state.ggOrder.map((price) => ({
            key: String(price),
            label: <span className="tabular-nums">{price} €</span>,
            ariaLabel: `${price} €`,
            invalid: showErrors && ggMissing.includes(price),
          }))}
          columns={GG_OPTIONS}
          values={state.gg}
          onChange={(rowKey, value: GgAnswer) => update({ gg: { ...state.gg, [rowKey]: value } })}
        />
      </QuestionBlock>

      <QuestionBlock
        title="Est-ce que la veste, vue précédemment, était en promotion ?"
        error={showErrors && state.manipCheck === null ? REQUIRED : null}
      >
        <LikertScale
          name="manipCheck"
          value={state.manipCheck}
          onChange={(value) => update({ manipCheck: value })}
          labels={SCALE_MANIP}
        />
      </QuestionBlock>
    </StepLayout>
  );
}
