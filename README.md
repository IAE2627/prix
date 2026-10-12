# Étude sur la perception du prix d'une veste outdoor

Application de collecte pour une étude marketing (master Marketing-Vente, IAE Clermont-Auvergne) :
questionnaire multi-étapes avec A/B testing du prix, Van Westendorp, Gabor-Granger, espace `/admin`
et export CSV.

Stack : Next.js (App Router, TypeScript), Tailwind CSS, Lucide Icons, Prisma + Postgres (Neon), Zod.

## Démarrage local

```bash
npm install
cp .env.example .env        # puis renseigner les deux URL Neon et ADMIN_PASSWORD
npx prisma db push          # crée la table dans la base Neon
npm run dev                 # http://localhost:3000
```

- Questionnaire : http://localhost:3000
- Administration : http://localhost:3000/admin (mot de passe = `ADMIN_PASSWORD`)

En local, l'application écrit dans la base indiquée par `.env`. Pour ne pas mélanger essais et
vraies réponses, utiliser une branche Neon distincte (Neon > Branches) pour le développement.

## Arborescence

```
.
├── .env.example                  Variables d'environnement (base Neon, ADMIN_PASSWORD)
├── next.config.ts
├── postcss.config.mjs            Tailwind CSS v4
├── tsconfig.json
├── package.json
├── prisma/
│   └── schema.prisma             Modèle Response (une ligne par participant)
├── public/
│   ├── veste.webp                Photo de la veste (étape 3)
│   └── fond-montagne.webp        Arrière-plan du questionnaire
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── globals.css
    │   ├── page.tsx              Questionnaire
    │   ├── admin/
    │   │   ├── page.tsx          Tableau récapitulatif + bouton d'export
    │   │   ├── LoginForm.tsx
    │   │   ├── DeleteButton.tsx
    │   │   └── LogoutButton.tsx
    │   └── api/
    │       ├── responses/route.ts        POST : validation + enregistrement
    │       └── admin/
    │           ├── login/route.ts        POST : ouverture de session
    │           ├── logout/route.ts       POST : fermeture de session
    │           ├── responses/[id]/route.ts  DELETE : suppression d'une réponse
    │           └── export/route.ts       GET  : CSV complet
    ├── components/
    │   ├── survey/
    │   │   ├── Survey.tsx        Orchestrateur : randomisation, étapes, envoi
    │   │   ├── Backdrop.tsx      Arrière-plan flouté
    │   │   ├── ConsentScreen.tsx
    │   │   ├── Step1Practice.tsx Q1 à Q4 + screen-out Q2
    │   │   ├── Step2Habits.tsx   Q5, Q5b, Q6
    │   │   ├── RankingMatrix.tsx Matrice de classement Q6
    │   │   ├── Step3Product.tsx  Fiche produit A/B
    │   │   ├── Step4Measures.tsx Qualité perçue, Van Westendorp, Gabor-Granger, manipulation check
    │   │   ├── Step5Profile.tsx  Profil + envoi
    │   │   └── EndScreen.tsx
    │   └── ui/
    │       ├── StepLayout.tsx    Progression, navigation, alertes
    │       ├── QuestionBlock.tsx
    │       ├── RadioList.tsx
    │       ├── LikertScale.tsx
    │       ├── MatrixQuestion.tsx
    │       └── RangeSlider.tsx
    └── lib/
        ├── survey.ts             Libellés, codes et règles métier partagées
        ├── types.ts              État du formulaire
        ├── validation.ts         Schéma Zod (validation serveur)
        ├── prisma.ts
        ├── auth.ts               Session admin (cookie signé HMAC)
        └── csv.ts                Export CSV
```

## Règles méthodologiques implémentées

| Règle | Implémentation |
| --- | --- |
| Randomisation A/B 50/50 | Tirage `crypto` au chargement, conservé pour l'onglet (un rechargement ne change pas la condition), enregistré dans `assigned_version`. |
| Q1 = Non | Le répondant saute Q2 à Q4 et poursuit à partir de Q5 ; l'échelle d'engagement (étape 5) ne lui est pas posée. Ces colonnes restent vides dans le CSV. |
| Screen-out Q2 | Toutes les lignes à « Jamais » (y compris « Autre ») : écran de fin au clic sur « Suivant ». |
| Q3 dynamique | Uniquement les sports pratiqués en Q2 ; « Autre » affiche le texte saisi. |
| Q4 contextualisée | « Quel est votre niveau en « sport » ? » |
| Q6 | Une case par ligne et par colonne ; cliquer un rang déjà pris remplace l'ancien critère. |
| Van Westendorp | Alerte en temps réel et blocage si M5 < M6 < M7 < M8 n'est pas respecté. |
| Gabor-Granger | 6 paliers uniques (99, 129, 179, 195, 239, 259 €), présentés par ordre croissant (du moins cher au plus cher) ; l'ordre affiché est enregistré dans `gg_ordre_affichage`. |
| Manipulation check | `is_valid_manipulation` recalculé côté serveur. |

Choix complémentaires :

- Les screen-outs sont enregistrés (`status`) pour pouvoir calculer le taux d'éligibilité.
- Pas de bouton « Précédent » à l'étape 4 : revoir la fiche produit fausserait le manipulation check.
- La réglette d'âge n'a pas de valeur par défaut : le répondant doit la déplacer.
- Toutes les réponses sont revalidées côté serveur (`src/lib/validation.ts`).
- Aucune adresse IP ni donnée identifiante n'est stockée.

## Export CSV

UTF-8 avec BOM, séparateur `;`, fins de ligne CRLF. Une ligne par participant.

| Variable | Valeurs |
| --- | --- |
| `status` | `completed`, `screened_out_q2` (`screened_out_q1` : ancien statut, plus produit) |
| `assigned_version` | `A` (195 €), `B` (245 € barré, 195 €, -20 %) |
| `is_valid_manipulation` | `true` / `false` |
| `q2_*` | `jamais`, `quelques_fois_par_an`, `1_a_3_fois_par_mois`, `chaque_semaine` |
| `q3_sport_principal` | clé du sport ; `q3_sport_principal_libelle` contient le libellé affiché |
| `q4_niveau` | `debutant`, `intermediaire`, `confirme`, `expert` |
| `q5_achat_veste_technique` | `oui_12_derniers_mois`, `oui_1_a_3_ans`, `oui_plus_de_3_ans`, `non_jamais` |
| `q5b_budget_derniere_veste` | `moins_de_80` … `plus_de_300`, `ne_sait_plus` (vide si Q5 = jamais) |
| `q6_rang1..3` | critère classé à ce rang ; `q6_rang_<critère>` = 1, 2, 3 ou vide |
| `qp_fiabilite`, `qp_fabrication`, `qp_qualite`, `qp_confiance`, `qp_durabilite` | Qualité perçue, 1 à 5 (5 = perception la plus favorable) |
| `vw_m5..m8` | euros entiers |
| `gg_99`, `gg_129`, `gg_179`, `gg_195`, `gg_239`, `gg_259` | `oui_certainement`, `probablement`, `probablement_pas`, `non` |
| `manipulation_check` | `oui`, `non` |
| `eng_ressources`, `eng_temps`, `eng_efforts`, `eng_place`, `eng_occasions` | Engagement dans la pratique, 1 (pas du tout d'accord) à 5 (tout à fait d'accord) |

Lecture sous R : `read.csv2("fichier.csv", fileEncoding = "UTF-8-BOM")`.

## Visuel de la veste

La photo affichée à l'étape 3 est `public/veste.webp`. Pour la changer, remplacer ce fichier, ou
déposer une autre image dans `public/` et modifier `PRODUCT_IMAGE` dans `src/lib/survey.ts`.

## Déploiement (Vercel + Neon, gratuit)

1. Sur vercel.com, importer le dépôt GitHub (Add New > Project).
2. Dans le projet : Storage > Create Database > Neon, puis connecter la base au projet. Vercel
   ajoute alors `DATABASE_URL` et `DATABASE_URL_UNPOOLED`.
3. Settings > Environment Variables : ajouter `ADMIN_PASSWORD` (valeur longue et unique).
4. Deployments > Redeploy. Le script `vercel-build` crée la table puis construit le site.

Chaque `git push` sur `main` redéploie ensuite automatiquement.
