import { useCallback, useMemo, useState } from "react";
import BarcodeScanner from "@/components/BarcodeScanner.tsx";

export default function ScanPage() {
  const [ean, setEan] = useState<string | null>(null);
  const [key, setKey] = useState(0); // remount scanner to restart

  const handleDetected = useCallback((code: string) => {
    setEan(code);
  }, []);

  const content = useMemo(() => {
    if (ean) {
      return (
        <div className="space-y-4 text-center">
          <p className="text-lg">Gefundene EAN:</p>
          <p className="text-3xl font-bold text-[#38E07A]">{ean}</p>
          <button
            className="mt-6 inline-flex items-center justify-center rounded-md bg-[#38E07A] px-4 py-2 font-semibold text-black hover:bg-[#38E08B]"
            onClick={() => {
              setEan(null);
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
  }, [ean, handleDetected, key]);

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
