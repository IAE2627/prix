'use client';

import { useState } from 'react';
import { MatrixQuestion, type MatrixRow } from '@/components/ui/MatrixQuestion';
import { QuestionBlock } from '@/components/ui/QuestionBlock';
import { RadioList } from '@/components/ui/RadioList';
import { StepLayout } from '@/components/ui/StepLayout';
import {
  FREQUENCIES,
  LEVELS,
  SPORTS,
  YES_NO,
  practicedSports,
  sportLabel,
  type Frequency,
  type FrequencyMatrix,
  type SportKey,
  type YesNo,
} from '@/lib/survey';
import type { StepProps } from '@/lib/types';

interface Step1Props extends StepProps {
  onNext: () => void;
  onScreenOutQ2: (q2: FrequencyMatrix) => void;
}

export function Step1Practice({ state, update, onNext, onScreenOutQ2 }: Step1Props) {
  const [showErrors, setShowErrors] = useState(false);

  const autreText = state.q2AutreText.trim();
  const practiced = practicedSports(state.q2);

  const handleQ1 = (value: YesNo) => {
    update({ q1: value });
  };

  const handleFrequency = (rowKey: string, value: Frequency) => {
    const q2 = { ...state.q2, [rowKey]: value } as FrequencyMatrix;
    // Le sport principal n'a de sens que s'il est toujours pratiqué.
    const q3StillValid = state.q3 !== null && practicedSports(q2).includes(state.q3);
    update(q3StillValid ? { q2 } : { q2, q3: null, q4: null });
  };

  const handleQ3 = (value: SportKey) => {
    if (value !== state.q3) update({ q3: value, q4: null });
  };

  const missingRows = SPORTS.filter((sport) => sport.key !== 'autre' && state.q2[sport.key] === null).map(
    (sport) => sport.key as string,
  );
  const autreNeedsFrequency = autreText !== '' && state.q2.autre === null;
  const autreNeedsText = state.q2.autre !== null && state.q2.autre !== 'jamais' && autreText === '';

  let q2Error: string | null = null;
  if (missingRows.length > 0) q2Error = 'Merci d’indiquer une fréquence pour chaque activité.';
  else if (autreNeedsFrequency) q2Error = 'Merci d’indiquer la fréquence de l’activité saisie dans « Autre ».';
  else if (autreNeedsText) q2Error = 'Merci de préciser l’activité « Autre », ou de la passer à « Jamais ».';

  const handleNext = () => {
    // Les non-pratiquants passent directement aux habitudes d'achat (Q5), sans Q2 à Q4.
    if (state.q1 === 'non') {
      onNext();
      return;
    }
    if (state.q1 !== 'oui' || q2Error) {
      setShowErrors(true);
      return;
    }
    const q2: FrequencyMatrix = { ...state.q2, autre: state.q2.autre ?? 'jamais' };
    if (practicedSports(q2).length === 0) {
      onScreenOutQ2(q2);
      return;
    }
    if (state.q3 === null || state.q4 === null) {
      setShowErrors(true);
      return;
    }
    update({ q2 });
    onNext();
  };

  const rows: MatrixRow[] = SPORTS.map((sport) => {
    if (sport.key !== 'autre') {
      return {
        key: sport.key,
        label: sport.label,
        ariaLabel: sport.label,
        invalid: showErrors && missingRows.includes(sport.key),
      };
    }
    return {
      key: sport.key,
      ariaLabel: autreText ? `Autre (${autreText})` : 'Autre',
      invalid: showErrors && (autreNeedsFrequency || autreNeedsText),
      label: (
        <span className="flex items-center gap-2">
          <span className="shrink-0">Autre :</span>
          <input
            type="text"
            value={state.q2AutreText}
            onChange={(event) => update({ q2AutreText: event.currentTarget.value })}
            maxLength={80}
            placeholder="précisez"
            aria-label="Autre activité, précisez"
            className="w-full min-w-0 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-normal text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
          />
        </span>
      ),
    };
  });

  const q3Options = practiced.map((key) => ({ value: key, label: sportLabel(key, state.q2AutreText) }));
  const hasErrors =
    state.q1 === null ||
    (state.q1 === 'oui' &&
      (q2Error !== null || (practiced.length > 0 && (state.q3 === null || state.q4 === null))));

  return (
    <StepLayout
      step={1}
      title="Votre pratique outdoor"
      onNext={handleNext}
      alert={showErrors && hasErrors ? 'Merci de compléter les questions signalées avant de continuer.' : null}
    >
      <QuestionBlock
        title="Pratiquez-vous des activités sportives outdoor ?"
        error={showErrors && state.q1 === null ? 'Merci de répondre à cette question.' : null}
      >
        <RadioList name="q1" options={YES_NO} value={state.q1} onChange={handleQ1} columns={2} />
      </QuestionBlock>

      {state.q1 === 'oui' && (
        <QuestionBlock
          title="Au cours des 12 derniers mois, à quelle fréquence avez-vous pratiqué chacune de ces activités ?"
          hint="Une seule réponse par ligne."
          error={showErrors ? q2Error : null}
        >
          <MatrixQuestion
            name="q2"
            rowHeader="Activité"
            rows={rows}
            columns={FREQUENCIES}
            values={state.q2}
            onChange={handleFrequency}
          />
        </QuestionBlock>
      )}

      {state.q1 === 'oui' && practiced.length > 0 && (
        <QuestionBlock
          title="Parmi les activités que vous pratiquez, laquelle pratiquez-vous le plus ?"
          error={showErrors && state.q3 === null ? 'Merci de sélectionner votre activité principale.' : null}
        >
          <RadioList name="q3" options={q3Options} value={state.q3} onChange={handleQ3} columns={2} />
        </QuestionBlock>
      )}

      {state.q1 === 'oui' && state.q3 !== null && (
        <QuestionBlock
          title={`Quel est votre niveau en « ${sportLabel(state.q3, state.q2AutreText)} » ?`}
          error={showErrors && state.q4 === null ? 'Merci d’indiquer votre niveau.' : null}
        >
          <RadioList
            name="q4"
            options={LEVELS}
            value={state.q4}
            onChange={(value) => update({ q4: value })}
            columns={4}
          />
        </QuestionBlock>
      )}
    </StepLayout>
  );
}
