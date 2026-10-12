'use client';

import { useState } from 'react';
import { Tag } from 'lucide-react';
import { QuestionBlock } from '@/components/ui/QuestionBlock';
import { RadioList } from '@/components/ui/RadioList';
import { StepLayout } from '@/components/ui/StepLayout';
import { DISCOUNT_LABEL, PRICE, PRODUCT_IMAGE, REFERENCE_PRICE, YES_NO } from '@/lib/survey';
import type { StepProps } from '@/lib/types';

interface Step3Props extends StepProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step3Product({ state, update, onNext, onBack }: Step3Props) {
  const [showErrors, setShowErrors] = useState(false);
  const hasErrors = state.brandKnown === null;

  const handleNext = () => {
    if (hasErrors) {
      setShowErrors(true);
      return;
    }
    onNext();
  };

  return (
    <StepLayout
      step={3}
      title="Le produit"
      onNext={handleNext}
      onBack={onBack}
      alert={showErrors && hasErrors ? 'Merci de répondre à la question avant de continuer.' : null}
    >
      <p className="text-sm leading-relaxed text-slate-600">
        Prenez le temps d&apos;observer la fiche produit ci-dessous : les questions suivantes porteront sur
        cette veste.
      </p>

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid sm:grid-cols-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={PRODUCT_IMAGE}
            alt="Veste Abstral 2.5L de la marque Picture"
            className="aspect-square w-full bg-slate-100 object-cover"
          />
          <div className="flex flex-col justify-center p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Picture</p>
            <h3 className="mt-1 text-xl font-bold text-slate-900">Veste Abstral 2.5L</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              Veste imperméable et respirante en construction 2,5 couches, avec capuche ajustable, poches
              zippées et format compact. Conçue pour la randonnée et les sorties en conditions variables.
            </p>

            {state.version === 'A' ? (
              <p className="mt-6 text-3xl font-bold tabular-nums text-slate-900" data-testid="prix">
                {PRICE} €
              </p>
            ) : (
              <div className="mt-6" data-testid="prix">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                  <Tag className="h-3.5 w-3.5" aria-hidden />
                  Promotion
                </span>
                <p className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <s className="text-xl tabular-nums text-slate-500">
                    <span className="sr-only">Ancien prix : </span>
                    {REFERENCE_PRICE} €
                  </s>
                  <span className="text-3xl font-bold tabular-nums text-red-700">{PRICE} €</span>
                  <span className="text-lg font-semibold text-red-700">({DISCOUNT_LABEL})</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </article>

      <QuestionBlock
        title="Connaissiez-vous la marque Picture avant ce questionnaire ?"
        error={showErrors && hasErrors ? 'Merci de répondre à cette question.' : null}
      >
        <RadioList
          name="brandKnown"
          options={YES_NO}
          value={state.brandKnown}
          onChange={(value) => update({ brandKnown: value })}
          columns={2}
        />
      </QuestionBlock>
    </StepLayout>
  );
}
