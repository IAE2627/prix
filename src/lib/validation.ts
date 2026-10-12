import { z } from 'zod';
import {
  AGE_MAX,
  AGE_MIN,
  CRITERIA,
  FREQUENCIES,
  GENDERS,
  GG_OPTIONS,
  GG_PRICES,
  LAST_BUDGET_OPTIONS,
  LEVELS,
  MANIP_OPTIONS,
  PURCHASE_OPTIONS,
  SITUATIONS,
  SPORTS,
  VERSIONS,
  VW_MAX,
  practicedSports,
  vwCoherenceErrors,
  type FrequencyMatrix,
} from './survey';

/** Validation serveur des réponses : le client n'est jamais cru sur parole. */

function valuesOf<T extends string>(options: readonly { value: T }[]): [T, ...T[]] {
  return options.map((option) => option.value) as [T, ...T[]];
}

const sportKeys = SPORTS.map((sport) => sport.key) as [
  (typeof SPORTS)[number]['key'],
  ...(typeof SPORTS)[number]['key'][],
];
const criterionKeys = CRITERIA.map((criterion) => criterion.key) as [
  (typeof CRITERIA)[number]['key'],
  ...(typeof CRITERIA)[number]['key'][],
];

const frequency = z.enum(valuesOf(FREQUENCIES));
const likert = z.number().int().min(1).max(5);
const euro = z.number().int().min(1).max(VW_MAX);
const ggAnswer = z.enum(valuesOf(GG_OPTIONS));

const frequencyMatrix = z.object({
  randonnee: frequency,
  trail: frequency,
  ski: frequency,
  alpinisme: frequency,
  vtt: frequency,
  nautique: frequency,
  camping: frequency,
  autre: frequency,
});

const base = {
  respondentId: z.string().regex(/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i),
  version: z.enum(VERSIONS),
  startedAt: z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Date invalide'),
};

const screenedOutQ2 = z
  .object({
    ...base,
    status: z.literal('screened_out_q2'),
    q1: z.literal('oui'),
    q2: frequencyMatrix,
    q2AutreText: z.string().trim().max(80),
  })
  .superRefine((data, ctx) => {
    if (practicedSports(data.q2 as FrequencyMatrix).length > 0) {
      ctx.addIssue({ code: 'custom', path: ['q2'], message: 'Profil éligible : screen-out refusé.' });
    }
  });

const completed = z
  .object({
    ...base,
    status: z.literal('completed'),
    ggOrder: z.array(z.number().int()).length(GG_PRICES.length),

    // Q1 = Non : le répondant saute Q2 à Q4, qui doivent alors rester vides.
    q1: z.enum(['oui', 'non']),
    q2: frequencyMatrix.nullable(),
    q2AutreText: z.string().trim().max(80),
    q3: z.enum(sportKeys).nullable(),
    q4: z.enum(valuesOf(LEVELS)).nullable(),

    q5: z.enum(valuesOf(PURCHASE_OPTIONS)),
    q5b: z.enum(valuesOf(LAST_BUDGET_OPTIONS)).nullable(),
    q6: z.tuple([z.enum(criterionKeys), z.enum(criterionKeys), z.enum(criterionKeys)]),

    brandKnown: z.enum(['oui', 'non']),

    qpFiabilite: likert,
    qpFabrication: likert,
    qpQualite: likert,
    qpConfiance: likert,
    qpDurabilite: likert,
    vw: z.object({ m5: euro, m6: euro, m7: euro, m8: euro }),
    gg: z.object({
      '99': ggAnswer,
      '129': ggAnswer,
      '179': ggAnswer,
      '195': ggAnswer,
      '239': ggAnswer,
      '259': ggAnswer,
    }),
    manipCheck: z.enum(valuesOf(MANIP_OPTIONS)),

    genre: z.enum(valuesOf(GENDERS)),
    age: z.number().int().min(AGE_MIN).max(AGE_MAX),
    situation: z.enum(valuesOf(SITUATIONS)),
    // Échelle d'engagement : posée uniquement si Q1 = Oui.
    engRessources: likert.nullable(),
    engTemps: likert.nullable(),
    engEfforts: likert.nullable(),
    engPlace: likert.nullable(),
    engOccasions: likert.nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.q1 === 'non') {
      if (data.q2 !== null || data.q3 !== null || data.q4 !== null || data.q2AutreText.length > 0) {
        ctx.addIssue({ code: 'custom', path: ['q2'], message: 'Q2 à Q4 ne doivent pas être renseignées si Q1 = Non.' });
      }
    } else if (data.q2 === null || data.q3 === null || data.q4 === null) {
      ctx.addIssue({ code: 'custom', path: ['q2'], message: 'Q2 à Q4 sont requises si Q1 = Oui.' });
    } else {
      const q2 = data.q2 as FrequencyMatrix;
      const practiced = practicedSports(q2);

      if (practiced.length === 0) {
        ctx.addIssue({ code: 'custom', path: ['q2'], message: 'Aucune activité pratiquée.' });
      }
      if (q2.autre !== 'jamais' && data.q2AutreText.length === 0) {
        ctx.addIssue({ code: 'custom', path: ['q2AutreText'], message: 'Activité « Autre » non précisée.' });
      }
      if (!practiced.includes(data.q3)) {
        ctx.addIssue({ code: 'custom', path: ['q3'], message: 'Sport principal non pratiqué en Q2.' });
      }
    }

    if (data.q5 === 'non_jamais' && data.q5b !== null) {
      ctx.addIssue({ code: 'custom', path: ['q5b'], message: 'Q5b ne doit pas être renseignée.' });
    }
    if (data.q5 !== 'non_jamais' && data.q5b === null) {
      ctx.addIssue({ code: 'custom', path: ['q5b'], message: 'Q5b est requise.' });
    }

    const engagement = [data.engRessources, data.engTemps, data.engEfforts, data.engPlace, data.engOccasions];
    if (data.q1 === 'oui' && engagement.some((item) => item === null)) {
      ctx.addIssue({ code: 'custom', path: ['engRessources'], message: "L'échelle d'engagement est requise si Q1 = Oui." });
    }
    if (data.q1 === 'non' && engagement.some((item) => item !== null)) {
      ctx.addIssue({ code: 'custom', path: ['engRessources'], message: "L'échelle d'engagement ne doit pas être renseignée si Q1 = Non." });
    }

    if (new Set(data.q6).size !== data.q6.length) {
      ctx.addIssue({ code: 'custom', path: ['q6'], message: 'Un critère ne peut occuper qu’un seul rang.' });
    }

    for (const message of vwCoherenceErrors(data.vw)) {
      ctx.addIssue({ code: 'custom', path: ['vw'], message });
    }

    const sortedOrder = [...data.ggOrder].sort((a, b) => a - b);
    if (sortedOrder.some((price, index) => price !== GG_PRICES[index])) {
      ctx.addIssue({ code: 'custom', path: ['ggOrder'], message: 'Ordre des paliers invalide.' });
    }
  });

export const submissionSchema = z.discriminatedUnion('status', [screenedOutQ2, completed]);

export type Submission = z.infer<typeof submissionSchema>;
export type CompletedSubmission = z.infer<typeof completed>;
