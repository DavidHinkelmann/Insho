import { useCallback, useMemo, useState } from "react";
import BarcodeScanner from "@/components/BarcodeScanner.tsx";
import { consumeFood, lookupFood } from "@/service/api";
import type { FoodLookupResponse } from "@/service/api";

export default function ScanPage() {
  const [ean, setEan] = useState<string | null>(null);
  const [lookup, setLookup] = useState<FoodLookupResponse | null>(null);
  const [grams, setGrams] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(0); // remount scanner to restart

  const handleDetected = useCallback(async (code: string) => {
    setEan(code);
    setError(null);
    setLookup(null);
    setGrams("");
    try {
      const res = await lookupFood(code);
      setLookup(res);
    } catch (e: any) {
      setError(e?.message || "Fehler bei der Lebensmittelsuche");
    }
  }, []);

  const content = useMemo(() => {
    if (ean) {
      return (
        <div className="space-y-4 text-center">
          <p className="text-lg">Gefundene EAN:</p>
          <p className="text-3xl font-bold text-[#38E07A]">{ean}</p>
          {lookup?.food ? (
            <div className="space-y-2">
              <p className="text-base">Produkt:</p>
              <p className="text-xl font-semibold">{lookup.food.name ?? "Unbekannt"}</p>
              <div className="text-sm text-white/70">
                <p>pro 100g: {fmt(lookup.food.calories_per_100g)} kcal, {fmt(lookup.food.proteins_per_100g)}g Protein, {fmt(lookup.food.carbs_per_100g)}g Kohlenhydrate, {fmt(lookup.food.fats_per_100g)}g Fett</p>
                <p className="text-xs">Quelle: {lookup.source}</p>
              </div>
            </div>
          ) : (
            <p className="text-white/70">{lookup ? "Kein Produkt gefunden." : "Lade Produktinformationen…"}</p>
          )}
          {error ? <p className="text-red-400 text-sm">{error}</p> : null}
          <div className="mt-4 grid gap-3 place-items-center">
            <label className="text-sm text-white/80" htmlFor="grams">Wie viel wurde konsumiert? (in Gramm)</label>
            <input
              id="grams"
              inputMode="decimal"
              placeholder="z.B. 75"
              className="w-40 rounded-md bg-white/10 px-3 py-2 text-center outline-none ring-1 ring-white/20 focus:ring-[#38E07A]"
              value={grams}
              onChange={(e) => setGrams(e.target.value)}
            />
            {lookup?.food ? (
              <ComputedMacros grams={grams} cals={lookup.food.calories_per_100g} p={lookup.food.proteins_per_100g} c={lookup.food.carbs_per_100g} f={lookup.food.fats_per_100g} />
            ) : null}
            <button
              disabled={submitting || !ean || !grams || !lookup?.food}
              className="inline-flex items-center justify-center rounded-md bg-[#38E07A] px-4 py-2 font-semibold text-black disabled:opacity-50"
              onClick={async () => {
                if (!ean) return;
                const g = Number(grams);
                if (!isFinite(g) || g <= 0) {
                  setError("Bitte eine gültige Grammzahl eingeben.");
                  return;
                }
                try {
                  setSubmitting(true);
                  setError(null);
                  await consumeFood(ean, g);
                  // Reset back to scanning
                  setEan(null);
                  setLookup(null);
                  setGrams("");
                  setKey((k) => k + 1);
                } catch (e: any) {
                  setError(e?.message || "Fehler beim Speichern der Menge");
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              Speichern
            </button>
          </div>
          <button
            className="mt-6 inline-flex items-center justify-center rounded-md bg-[#38E07A] px-4 py-2 font-semibold text-black hover:bg-[#38E08B]"
            onClick={() => {
              setEan(null);
              setLookup(null);
              setGrams("");
              setKey((k) => k + 1);
            }}
          >
            Erneut scannen
          </button>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        <p className="text-center">Richten Sie die Kamera auf den Barcode (EAN-8 oder EAN-13).</p>
        <BarcodeScanner key={key} onDetected={handleDetected} />
      </div>
    );
  }, [ean, handleDetected, key, lookup, grams, submitting, error]);

  return (
    <div className="min-h-screen bg-[#122117] text-white p-4">
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Barcode scannen</h1>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-white/20 px-3 py-1 text-sm hover:bg-white/10"
            aria-label="Zur Startseite"
          >
            Startseite
          </a>
        </header>
        {content}
        <footer className="text-xs text-white/60">
          Hinweis: Für den Kamerazugriff ist HTTPS erforderlich. Auf iOS kann eine Nutzerinteraktion nötig sein, um die Kamera zu starten.
        </footer>
      </div>
    </div>
  );
}

function fmt(n?: number | null): string {
  if (n == null) return "—";
  return Number(n).toFixed(1);
}

function ComputedMacros({ grams, cals, p, c, f }: { grams: string; cals?: number | null; p?: number | null; c?: number | null; f?: number | null }) {
  const g = Number(grams);
  if (!isFinite(g) || g <= 0) return null;
  const factor = g / 100;
  const kcal = cals == null ? null : cals * factor;
  const pp = p == null ? null : p * factor;
  const cc = c == null ? null : c * factor;
  const ff = f == null ? null : f * factor;
  return (
    <div className="text-sm text-white/80 mt-2">
      <p>für {g}g: {fmt(kcal)} kcal, {fmt(pp)}g Protein, {fmt(cc)}g Kohlenhydrate, {fmt(ff)}g Fett</p>
    </div>
  );
}
