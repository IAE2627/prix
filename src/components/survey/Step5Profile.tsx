'use client';

import { useState } from 'react';
import { LikertScale } from '@/components/ui/LikertScale';
import { QuestionBlock } from '@/components/ui/QuestionBlock';
import { RadioList } from '@/components/ui/RadioList';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { StepLayout } from '@/components/ui/StepLayout';
import {
  AGE_MAX,
  AGE_MIN,
  AGREEMENT_MAX_LABEL,
  AGREEMENT_MIN_LABEL,
  ENGAGEMENT_ITEMS,
  GENDERS,
  SITUATIONS,
} from '@/lib/survey';
import type { StepProps } from '@/lib/types';

interface Step5Props extends StepProps {
  onSubmit: () => void;
  onBack: () => void;
  submitting: boolean;
  submitError: string | null;
}

const REQUIRED = 'Merci de répondre à cette question.';
const SLIDER_REQUIRED = 'Merci de déplacer le curseur pour indiquer votre réponse.';

export function Step5Profile({ state, update, onSubmit, onBack, submitting, submitError }: Step5Props) {
  const [showErrors, setShowErrors] = useState(false);

  const hasErrors =
    state.genre === null ||
    state.age === null ||
    state.situation === null ||
    ENGAGEMENT_ITEMS.some((item) => state[item.key] === null);

  const handleSubmit = () => {
    if (hasErrors) {
      setShowErrors(true);
      return;
    }
    onSubmit();
  };

  let alert: string | null = null;
  if (showErrors && hasErrors) alert = 'Merci de compléter les questions signalées avant d’envoyer.';
  else if (submitError) alert = submitError;

  return (
    <StepLayout
      step={5}
      title="Votre profil"
      onNext={handleSubmit}
      onBack={onBack}
      nextLabel={submitting ? 'Envoi en cours…' : 'Envoyer mes réponses'}
      busy={submitting}
      alert={alert}
    >
      <QuestionBlock title="Vous êtes :" error={showErrors && state.genre === null ? REQUIRED : null}>
        <RadioList
          name="genre"
          options={GENDERS}
          value={state.genre}
          onChange={(value) => update({ genre: value })}
          columns={3}
        />
      </QuestionBlock>

      <QuestionBlock title="Quel âge avez-vous ?" error={showErrors && state.age === null ? SLIDER_REQUIRED : null}>
        <RangeSlider
          id="age"
          min={AGE_MIN}
          max={AGE_MAX}
          value={state.age}
          onChange={(value) => update({ age: value })}
          format={(value) => `${value} ans`}
          minLabel={`${AGE_MIN} ans`}
          maxLabel={`${AGE_MAX} ans`}
          ariaLabel="Votre âge"
        />
      </QuestionBlock>

      <QuestionBlock title="Votre situation :" error={showErrors && state.situation === null ? REQUIRED : null}>
        <RadioList
          name="situation"
          options={SITUATIONS}
          value={state.situation}
          onChange={(value) => update({ situation: value })}
          columns={2}
        />
      </QuestionBlock>

      <p className="pt-2 text-sm font-medium leading-relaxed text-slate-800">
        Pour finir, indiquez votre degré d&apos;accord avec les affirmations suivantes.
      </p>

      {ENGAGEMENT_ITEMS.map((item) => (
        <QuestionBlock
          key={item.key}
          title={item.statement}
          error={showErrors && state[item.key] === null ? REQUIRED : null}
        >
          <LikertScale
            name={item.key}
            value={state[item.key]}
            onChange={(value) => update({ [item.key]: value })}
            minLabel={AGREEMENT_MIN_LABEL}
            maxLabel={AGREEMENT_MAX_LABEL}
          />
        </QuestionBlock>
      ))}
    </StepLayout>
  );
}
