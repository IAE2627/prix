/**
 * Arrière-plan du questionnaire : photo de montagne floutée et éclaircie par un
 * voile blanc, pour rester discrète et garder les textes lisibles.
 */
export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Débordement négatif : évite les bords transparents créés par le flou. */}
      <div
        className="absolute -inset-8 bg-cover bg-center blur-[2px]"
        style={{ backgroundImage: 'url(/fond-montagne.webp)' }}
      />
      <div className="absolute inset-0 bg-white/40" />
    </div>
  );
}
