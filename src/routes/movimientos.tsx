import { createFileRoute } from "@tanstack/react-router";
import { EncabezadoPagina, Tarjeta } from "@/components/inventario/ui";
import {
  CLAVES,
  EMPLEADOS_INICIALES,
  ETIQUETAS_MOVIMIENTO,
  MOVIMIENTOS_INICIALES,
  PRODUCTOS_INICIALES,
  SEDES_INICIALES,
  useTablaLocal,
  type Empleado,
  type Movimiento,
  type Producto,
  type Sede,
} from "@/lib/inventario";

export const Route = createFileRoute("/movimientos")({
  head: () => ({
    meta: [
      { title: "Historial de movimientos — InvenTrack" },
      {
        name: "description",
        content: "Historial de asignaciones, traslados, devoluciones y bajas de equipos.",
      },
      { property: "og:title", content: "Historial de movimientos — InvenTrack" },
      {
        property: "og:description",
        content: "Historial de asignaciones, traslados, devoluciones y bajas de equipos.",
      },
    ],
  }),
  component: PaginaMovimientos,
});

function PaginaMovimientos() {
  const movimientos = useTablaLocal<Movimiento>(
    CLAVES.movimientos,
    MOVIMIENTOS_INICIALES,
  );
  const productos = useTablaLocal<Producto>(CLAVES.productos, PRODUCTOS_INICIALES);
  const empleados = useTablaLocal<Empleado>(CLAVES.empleados, EMPLEADOS_INICIALES);
  const sedes = useTablaLocal<Sede>(CLAVES.sedes, SEDES_INICIALES);

  const serie = (id: number) =>
    productos.datos.find((p) => p.id === id)?.numero_serie ?? "—";
  const empleado = (id: number) =>
    empleados.datos.find((e) => e.id === id)?.nombre_completo ?? "—";
  const sede = (id: number) =>
    sedes.datos.find((s) => s.id === id)?.nombre_sede ?? "—";

  const filas = [...movimientos.datos].sort((a, b) => b.id - a.id);

  return (
    <>
      <EncabezadoPagina
        titulo="Movimientos"
        descripcion={`${filas.length} movimientos registrados`}
      />
      <Tarjeta>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse text-sm">
            <thead>
              <tr className="bg-secondary text-left">
                {[
                  "ID",
                  "Producto",
                  "Tipo",
                  "Empleado origen",
                  "Empleado destino",
                  "Sede origen",
                  "Sede destino",
                  "Observaciones",
                  "Fecha",
                ].map((c) => (
                  <th
                    key={c}
                    className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-secondary-foreground"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map((m) => (
                <tr key={m.id} className="border-t border-border hover:bg-muted/60">
                  <td className="px-4 py-3">{m.id}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {serie(m.producto_id)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {ETIQUETAS_MOVIMIENTO[m.tipo_movimiento]}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {empleado(m.empleado_origen_id)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {empleado(m.empleado_destino_id)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {sede(m.sede_origen_id)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {sede(m.sede_destino_id)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {m.observaciones_movimiento || "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{m.fecha}</td>
                </tr>
              ))}
              {filas.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                    Aún no hay movimientos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Tarjeta>
    </>
  );
}
