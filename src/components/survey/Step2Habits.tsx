'use client';

import { useState } from 'react';
import { ChevronDown, Info } from 'lucide-react';
import { QuestionBlock } from '@/components/ui/QuestionBlock';
import { RadioList } from '@/components/ui/RadioList';
import { StepLayout } from '@/components/ui/StepLayout';
import { LAST_BUDGET_OPTIONS, PURCHASE_OPTIONS, type PurchaseAnswer } from '@/lib/survey';
import type { StepProps } from '@/lib/types';
import { RankingMatrix } from './RankingMatrix';

interface Step2Props extends StepProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step2Habits({ state, update, onNext, onBack }: Step2Props) {
  const [showErrors, setShowErrors] = useState(false);
  const [definitionOpen, setDefinitionOpen] = useState(true);

  const hasBought = state.q5 !== null && state.q5 !== 'non_jamais';
  const rankingComplete = state.q6.every((criterion) => criterion !== null);
  const hasErrors = state.q5 === null || (hasBought && state.q5b === null) || !rankingComplete;

  const handleQ5 = (value: PurchaseAnswer) => {
    update(value === 'non_jamais' ? { q5: value, q5b: null } : { q5: value });
  };

  const handleNext = () => {
    if (hasErrors) {
      setShowErrors(true);
      return;
    }
    onNext();
  };

  return (
    <StepLayout
      step={2}
      title="Vos habitudes d’achat"
      onNext={handleNext}
      onBack={onBack}
      alert={showErrors && hasErrors ? 'Merci de compléter les questions signalées avant de continuer.' : null}
    >
      <div className="rounded-2xl border border-sky-200 bg-sky-50">
        <button
          type="button"
          onClick={() => setDefinitionOpen((open) => !open)}
          aria-expanded={definitionOpen}
          aria-controls="definition-veste-technique"
          className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
        >
          <span className="flex items-center gap-2 font-semibold text-sky-950">
            <Info className="h-5 w-5 shrink-0" aria-hidden />
            Qu&apos;est-ce qu&apos;une veste technique ?
          </span>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-sky-900 transition-transform ${definitionOpen ? 'rotate-180' : ''}`}
            aria-hidden
          />
        </button>
        {definitionOpen && (
          <div id="definition-veste-technique" className="space-y-3 px-5 pb-5 text-sm leading-relaxed text-sky-950">
            <p>
              C&apos;est une veste conçue pour la pratique d&apos;une activité en extérieur et pour protéger
              des conditions météo. Elle est généralement imperméable ou déperlante, respirante (elle évacue
              la transpiration) et coupe-vent, avec des caractéristiques comme une capuche ajustable, des
              coutures étanches ou un format compact.
            </p>
            <p>
              <strong>Exemples :</strong> veste hardshell (imperméable), veste 2,5 ou 3 couches, softshell,
              veste coupe-vent légère de trail.
            </p>
            <p>
              <strong>Ne sont pas concernés :</strong> les vestes de ville, les doudounes sans fonction
              imperméable, les sweats et les polaires.
            </p>
          </div>
        )}
      </div>

      <QuestionBlock
        title="Avez-vous déjà acheté une veste technique, au sens de la définition ci-dessus ?"
        error={showErrors && state.q5 === null ? 'Merci de répondre à cette question.' : null}
      >
        <RadioList name="q5" options={PURCHASE_OPTIONS} value={state.q5} onChange={handleQ5} columns={2} />
      </QuestionBlock>

      {hasBought && (
        <QuestionBlock
          title="Budget de votre dernière veste technique"
          error={showErrors && state.q5b === null ? 'Merci de répondre à cette question.' : null}
        >
          <RadioList
            name="q5b"
            options={LAST_BUDGET_OPTIONS}
            value={state.q5b}
            onChange={(value) => update({ q5b: value })}
            columns={2}
          />
        </QuestionBlock>
      )}

      <QuestionBlock
        title="Parmi les critères suivants, classez les 3 plus importants pour vous dans l'achat d'une veste outdoor."
        hint="Cochez une seule case par colonne et une seule case par ligne."
        error={
          showErrors && !rankingComplete ? 'Merci de classer 3 critères : un 1er, un 2e et un 3e.' : null
        }
      >
        <RankingMatrix value={state.q6} onChange={(q6) => update({ q6 })} />
      </QuestionBlock>
    </StepLayout>
  );
}
