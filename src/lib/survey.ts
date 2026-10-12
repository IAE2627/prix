/**
 * Référentiel du questionnaire : libellés, codes stockés en base et règles
 * méthodologiques partagées entre le client et le serveur.
 */

export const STUDY_TITLE = "Étude sur la perception du prix d'une veste outdoor";

// ---------------------------------------------------------------------------
// A/B testing
// ---------------------------------------------------------------------------

export const VERSIONS = ['A', 'B'] as const;
export type Version = (typeof VERSIONS)[number];

export const PRICE = 195;
export const REFERENCE_PRICE = 245;
/** Remise calculée à partir des deux prix, pour que l'affichage reste toujours exact. */
export const DISCOUNT_LABEL = `-${Math.round((1 - PRICE / REFERENCE_PRICE) * 100)} %`;

/** Photo de la veste présentée à l'étape 3 (fichier dans public/). */
export const PRODUCT_IMAGE = '/veste.webp';

// ---------------------------------------------------------------------------
// Partie 1 : pratique outdoor
// ---------------------------------------------------------------------------

export const YES_NO = [
  { value: 'oui', label: 'Oui' },
  { value: 'non', label: 'Non' },
] as const;
export type YesNo = (typeof YES_NO)[number]['value'];

export const FREQUENCIES = [
  { value: 'jamais', label: 'Jamais' },
  { value: 'quelques_fois_par_an', label: 'Quelques fois par an' },
  { value: '1_a_3_fois_par_mois', label: '1 à 3 fois par mois' },
  { value: 'chaque_semaine', label: 'Chaque semaine' },
] as const;
export type Frequency = (typeof FREQUENCIES)[number]['value'];

export const SPORTS = [
  { key: 'randonnee', label: 'Randonnée' },
  { key: 'trail', label: 'Trail / course à pied' },
  { key: 'ski', label: 'Ski / snowboard' },
  { key: 'alpinisme', label: 'Alpinisme / escalade' },
  { key: 'vtt', label: 'VTT / vélo' },
  { key: 'nautique', label: 'Sports nautiques' },
  { key: 'camping', label: 'Camping / bivouac' },
  { key: 'autre', label: 'Autre' },
] as const;
export type SportKey = (typeof SPORTS)[number]['key'];

export const LEVELS = [
  { value: 'debutant', label: 'Débutant' },
  { value: 'intermediaire', label: 'Intermédiaire' },
  { value: 'confirme', label: 'Confirmé' },
  { value: 'expert', label: 'Expert' },
] as const;
export type Level = (typeof LEVELS)[number]['value'];

// ---------------------------------------------------------------------------
// Partie 2 : habitudes d'achat
// ---------------------------------------------------------------------------

export const PURCHASE_OPTIONS = [
  { value: 'oui_12_derniers_mois', label: 'Oui, dans les 12 derniers mois' },
  { value: 'oui_1_a_3_ans', label: 'Oui, il y a 1 à 3 ans' },
  { value: 'oui_plus_de_3_ans', label: 'Oui, il y a plus de 3 ans' },
  { value: 'non_jamais', label: 'Non, jamais' },
] as const;
export type PurchaseAnswer = (typeof PURCHASE_OPTIONS)[number]['value'];

export const LAST_BUDGET_OPTIONS = [
  { value: 'moins_de_80', label: 'Moins de 80 €' },
  { value: '80_a_120', label: '80 à 120 €' },
  { value: '120_a_160', label: '120 à 160 €' },
  { value: '160_a_200', label: '160 à 200 €' },
  { value: '200_a_300', label: '200 à 300 €' },
  { value: 'plus_de_300', label: 'Plus de 300 €' },
  { value: 'ne_sait_plus', label: 'Je ne sais plus' },
] as const;
export type LastBudget = (typeof LAST_BUDGET_OPTIONS)[number]['value'];

export const CRITERIA = [
  { key: 'impermeabilite', label: 'Imperméabilité' },
  { key: 'respirabilite', label: 'Respirabilité' },
  { key: 'legerete', label: 'Légèreté / compacité' },
  { key: 'prix', label: 'Prix' },
  { key: 'marque', label: 'Marque' },
  { key: 'durabilite', label: 'Durabilité / résistance' },
  { key: 'eco_responsabilite', label: 'Éco-responsabilité' },
  { key: 'design', label: 'Design / style' },
  { key: 'coupe_confort', label: 'Coupe et confort' },
  { key: 'avis', label: 'Avis et recommandations' },
] as const;
export type CriterionKey = (typeof CRITERIA)[number]['key'];

export const RANK_LABELS = ['1er (le plus important)', '2e', '3e'] as const;
export type Ranking = [CriterionKey | null, CriterionKey | null, CriterionKey | null];

// ---------------------------------------------------------------------------
// Partie 4 : mesures
// ---------------------------------------------------------------------------

/**
 * Qualité perçue : 5 items sur une échelle de 1 à 5, où 5 correspond toujours
 * à la perception la plus favorable.
 */
export const QUALITY_ITEMS = [
  {
    key: 'qpFiabilite',
    statement: 'La probabilité que le produit soit fiable est :',
    minLabel: 'Très faible',
    maxLabel: 'Très élevée',
  },
  {
    key: 'qpFabrication',
    statement: 'La qualité de fabrication du produit serait :',
    minLabel: 'Très faible',
    maxLabel: 'Très élevée',
  },
  {
    key: 'qpQualite',
    statement: 'Ce produit devrait être de :',
    minLabel: 'Très mauvaise qualité',
    maxLabel: 'Très bonne qualité',
  },
  {
    key: 'qpConfiance',
    statement: 'La probabilité que ce produit soit digne de confiance est :',
    minLabel: 'Très faible',
    maxLabel: 'Très élevée',
  },
  {
    key: 'qpDurabilite',
    statement: 'Ce produit semble durable.',
    minLabel: "Pas du tout d'accord",
    maxLabel: "Tout à fait d'accord",
  },
] as const;
export type QualityKey = (typeof QUALITY_ITEMS)[number]['key'];

export const VW_FIELDS = [
  {
    key: 'm5',
    short: 'trop bon marché',
    label:
      'À partir de quel prix cette veste serait-elle si bon marché que vous douteriez de sa qualité ?',
  },
  {
    key: 'm6',
    short: 'bonne affaire',
    label: 'À partir de quel prix serait-elle une bonne affaire, un prix attractif pour sa qualité ?',
  },
  {
    key: 'm7',
    short: 'cher',
    label:
      "À partir de quel prix commencerait-elle à vous paraître chère, mais que vous envisageriez encore de l'acheter ?",
  },
  {
    key: 'm8',
    short: 'trop cher',
    label: "À partir de quel prix serait-elle trop chère, au point que vous ne l'envisageriez plus ?",
  },
] as const;
export type VwKey = (typeof VW_FIELDS)[number]['key'];
export const VW_MAX = 100000;

export const GG_PRICES = [99, 129, 179, 195, 239, 259] as const;
export type GgPrice = (typeof GG_PRICES)[number];

export const GG_OPTIONS = [
  { value: 'oui_certainement', label: 'Oui, certainement' },
  { value: 'probablement', label: 'Probablement' },
  { value: 'probablement_pas', label: 'Probablement pas' },
  { value: 'non', label: 'Non' },
] as const;
export type GgAnswer = (typeof GG_OPTIONS)[number]['value'];

export const MANIP_OPTIONS = [
  { value: 'oui', label: 'Oui' },
  { value: 'non', label: 'Non' },
] as const;
export type ManipAnswer = (typeof MANIP_OPTIONS)[number]['value'];

// ---------------------------------------------------------------------------
// Partie 5 : profil
// ---------------------------------------------------------------------------

export const GENDERS = [
  { value: 'femme', label: 'Une femme' },
  { value: 'homme', label: 'Un homme' },
  { value: 'autre_nsp', label: 'Autre / ne souhaite pas répondre' },
] as const;
export type Gender = (typeof GENDERS)[number]['value'];

export const SITUATIONS = [
  { value: 'etudiant', label: 'Étudiant(e)' },
  { value: 'en_activite', label: 'En activité' },
  { value: 'sans_emploi', label: 'Sans emploi' },
  { value: 'retraite', label: 'Retraité(e)' },
] as const;
export type Situation = (typeof SITUATIONS)[number]['value'];

export const AGE_MIN = 18;
export const AGE_MAX = 90;

/** Engagement dans la pratique : 5 items, de 1 (pas du tout d'accord) à 5 (tout à fait d'accord). */
export const ENGAGEMENT_ITEMS = [
  {
    key: 'engRessources',
    statement: 'Je suis prêt(e) à consacrer des ressources (temps ou argent) à cette passion.',
  },
  { key: 'engTemps', statement: 'Je consacre beaucoup de temps à ma passion.' },
  { key: 'engEfforts', statement: 'Je fais des efforts pour progresser dans cette activité.' },
  { key: 'engPlace', statement: 'Ma passion occupe une place importante dans ma vie.' },
  { key: 'engOccasions', statement: 'Je cherche régulièrement des occasions de pratiquer ma passion.' },
] as const;
export type EngagementKey = (typeof ENGAGEMENT_ITEMS)[number]['key'];
export const AGREEMENT_MIN_LABEL = "Pas du tout d'accord";
export const AGREEMENT_MAX_LABEL = "Tout à fait d'accord";

export const RESPONSE_STATUSES = ['completed', 'screened_out_q1', 'screened_out_q2'] as const;
export type ResponseStatus = (typeof RESPONSE_STATUSES)[number];

// ---------------------------------------------------------------------------
// Règles métier
// ---------------------------------------------------------------------------

export type FrequencyMatrix = Record<SportKey, Frequency | null>;

/** Tirage entier uniforme dans [0, max[ sans biais de modulo. */
function randomInt(max: number): number {
  const buffer = new Uint32Array(1);
  const limit = Math.floor(0x100000000 / max) * max;
  do {
    crypto.getRandomValues(buffer);
  } while (buffer[0] >= limit);
  return buffer[0] % max;
}

/** Assignation aléatoire simple 50/50. */
export function assignVersion(): Version {
  return randomInt(2) === 0 ? 'A' : 'B';
}

/** crypto.randomUUID n'existe pas hors contexte sécurisé (test en http sur le réseau local). */
export function generateRespondentId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Sports pratiqués au moins « quelques fois par an », dans l'ordre de la matrice Q2. */
export function practicedSports(q2: FrequencyMatrix): SportKey[] {
  return SPORTS.map((sport) => sport.key).filter((key) => {
    const frequency = q2[key];
    return frequency !== null && frequency !== 'jamais';
  });
}

/** Libellé affiché pour un sport ; « Autre » reprend le texte saisi par le répondant. */
export function sportLabel(key: SportKey, autreText: string): string {
  if (key === 'autre') return autreText.trim() || 'Autre';
  return SPORTS.find((sport) => sport.key === key)?.label ?? key;
}

/**
 * Manipulation check : la version A ne présente aucune promotion, la version B
 * en présente une. Toute réponse incohérente avec la condition invalide le flag.
 */
export function isValidManipulation(version: Version, answer: ManipAnswer): boolean {
  if (version === 'A' && answer === 'oui') return false;
  if (version === 'B' && answer !== 'oui') return false;
  return true;
}

/** Convertit une saisie en euros entiers strictement positifs, sinon null. */
export function parseEuro(raw: string): number | null {
  const trimmed = raw.trim();
  if (!/^\d{1,6}$/.test(trimmed)) return null;
  const value = Number(trimmed);
  return value > 0 && value <= VW_MAX ? value : null;
}

/**
 * Contrôle de cohérence Van Westendorp : M5 < M6 < M7 < M8.
 * Compare chaque valeur saisie à la précédente valeur saisie, ce qui permet
 * d'alerter en temps réel avant même que les 4 champs soient remplis.
 */
export function vwCoherenceErrors(values: Record<VwKey, number | null>): string[] {
  const errors: string[] = [];
  let previous: { short: string; value: number } | null = null;
  for (const field of VW_FIELDS) {
    const value = values[field.key];
    if (value === null) continue;
    if (previous && value <= previous.value) {
      errors.push(
        `Le prix « ${field.short} » (${value} €) doit être strictement supérieur au prix « ${previous.short} » (${previous.value} €).`,
      );
    }
    previous = { short: field.short, value };
  }
  return errors;
}

export function labelOf(
  options: readonly { value: string; label: string }[],
  value: string | null | undefined,
): string {
  if (!value) return '';
  return options.find((option) => option.value === value)?.label ?? value;
}
