'use client';

import { useState } from 'react';
import { QuestionBlock } from '@/components/ui/QuestionBlock';
import { RadioList } from '@/components/ui/RadioList';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { StepLayout } from '@/components/ui/StepLayout';
import {
  AGE_MAX,
  AGE_MIN,
  BUDGET_MAX,
  BUDGET_MIN,
  BUDGET_STEP,
  GENDERS,
  SITUATIONS,
  formatBudget,
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
    state.genre === null || state.age === null || state.situation === null || state.budget === null;

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

      <QuestionBlock
        title="Votre budget mensuel « loisirs / équipement sportif » approximatif :"
        error={showErrors && state.budget === null ? SLIDER_REQUIRED : null}
      >
        <RangeSlider
          id="budget"
          min={BUDGET_MIN}
          max={BUDGET_MAX}
          step={BUDGET_STEP}
          value={state.budget}
          onChange={(value) => update({ budget: value })}
          format={formatBudget}
          minLabel={`${BUDGET_MIN} €`}
          maxLabel={`${BUDGET_MAX} € et plus`}
          ariaLabel="Votre budget mensuel loisirs et équipement sportif"
        />
      </QuestionBlock>
    </StepLayout>
  );
}
