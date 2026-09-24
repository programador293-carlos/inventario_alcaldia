import { useEffect, type ReactNode } from "react";
import type { EstadoProducto } from "@/lib/inventario";

export function Modal({
  abierto,
  titulo,
  onCerrar,
  children,
}: {
  abierto: boolean;
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!abierto) return;
    const escuchar = (e: KeyboardEvent) => e.key === "Escape" && onCerrar();
    window.addEventListener("keydown", escuchar);
    return () => window.removeEventListener("keydown", escuchar);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/40 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-panel">
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight text-card-foreground">
            {titulo}
          </h2>
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Campo({
  etiqueta,
  children,
}: {
  etiqueta: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-muted-foreground">{etiqueta}</span>
      {children}
    </label>
  );
}

export const claseInput =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-shadow focus:border-ring focus:ring-2 focus:ring-ring/30";

export function BotonPrimario({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition-colors hover:bg-primary/90 disabled:opacity-50 " +
        (props.className ?? "")
      }
    >
      {children}
    </button>
  );
}

export function BotonSecundario({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        "inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted " +
        (props.className ?? "")
      }
    >
      {children}
    </button>
  );
}

export function BadgeEstado({ estado }: { estado: EstadoProducto }) {
  const estilos: Record<EstadoProducto, string> = {
    bueno: "bg-exito/15 text-exito",
    regular: "bg-alerta/20 text-alerta",
    malo: "bg-destructive/15 text-destructive",
  };
  const texto: Record<EstadoProducto, string> = {
    bueno: "Bueno",
    regular: "Regular",
    malo: "Malo",
  };
  return (
    <span
      className={
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold " +
        estilos[estado]
      }
    >
      {texto[estado]}
    </span>
  );
}

export function Tarjeta({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-soft">
      {children}
    </div>
  );
}

export function EncabezadoPagina({
  titulo,
  descripcion,
  accion,
}: {
  titulo: string;
  descripcion: string;
  accion?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          {titulo}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{descripcion}</p>
      </div>
      {accion}
    </div>
  );
}
