import { useEffect } from "react";

export function Notificacion({
  mensaje,
  onCerrar,
}: {
  mensaje: string | null;
  onCerrar: () => void;
}) {
  useEffect(() => {
    if (!mensaje) return;
    const t = setTimeout(onCerrar, 3000);
    return () => clearTimeout(t);
  }, [mensaje, onCerrar]);

  if (!mensaje) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[60] rounded-xl border border-exito/30 bg-card px-4 py-3 text-sm font-medium text-foreground shadow-panel">
      <span className="mr-2 text-exito">✓</span>
      {mensaje}
    </div>
  );
}
