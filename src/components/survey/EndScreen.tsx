import { CheckCircle2, Heart } from 'lucide-react';

interface EndScreenProps {
  variant: 'done' | 'screenout';
}

export function EndScreen({ variant }: EndScreenProps) {
  if (variant === 'screenout') {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <Heart className="mx-auto h-12 w-12 text-emerald-700" aria-hidden />
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Merci pour votre temps !</h1>
        <p className="mt-3 text-slate-700">Votre profil ne correspond pas à la cible de cette étude.</p>
        <p className="mt-6 text-sm text-slate-500">Vous pouvez à présent fermer cette page.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-700" aria-hidden />
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Un grand merci pour votre participation !</h1>
      <p className="mt-3 leading-relaxed text-slate-700">
        Vos réponses ont bien été enregistrées. Elles sont anonymes et seront utilisées uniquement à des fins
        pédagogiques, dans le cadre du cours « Prix et budget marketing » du master Marketing-Vente de
        l’IAE Clermont-Auvergne.
      </p>
      <p className="mt-3 leading-relaxed text-slate-700">
        Votre contribution nous aide concrètement à mener à bien notre étude : merci d’avoir pris ces
        quelques minutes pour nous.
      </p>
      <p className="mt-6 text-sm text-slate-500">Vous pouvez à présent fermer cette page.</p>
    </div>
  );
}
