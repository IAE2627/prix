import type {
  CriterionKey,
  FrequencyMatrix,
  Gender,
  GgAnswer,
  GgPrice,
  LastBudget,
  Level,
  ManipAnswer,
  PurchaseAnswer,
  Ranking,
  Situation,
  SportKey,
  Version,
  VwKey,
  YesNo,
} from './survey';

export type Stage =
  | 'consent'
  | 'step1'
  | 'step2'
  | 'step3'
  | 'step4'
  | 'step5'
  | 'done'
  | 'screenout';

/** État du formulaire côté navigateur (null = question pas encore répondue). */
export interface SurveyState {
  respondentId: string;
  version: Version;
  ggOrder: GgPrice[];
  startedAt: string | null;

  consent: boolean;

  q1: YesNo | null;
  q2: FrequencyMatrix;
  q2AutreText: string;
  q3: SportKey | null;
  q4: Level | null;

  q5: PurchaseAnswer | null;
  q5b: LastBudget | null;
  q6: Ranking;

  brandKnown: YesNo | null;

  qpFiabilite: number | null;
  qpFabrication: number | null;
  qpQualite: number | null;
  qpConfiance: number | null;
  qpDurabilite: number | null;
  vw: Record<VwKey, string>;
  gg: Record<string, GgAnswer | null>;
  manipCheck: ManipAnswer | null;

  genre: Gender | null;
  age: number | null;
  situation: Situation | null;
  budget: number | null;
}

export type UpdateState = (patch: Partial<SurveyState>) => void;

export interface StepProps {
  state: SurveyState;
  update: UpdateState;
}

export type { CriterionKey };
