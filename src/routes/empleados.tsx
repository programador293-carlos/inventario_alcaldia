import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  BotonPrimario,
  BotonSecundario,
  Campo,
  EncabezadoPagina,
  Modal,
  Tarjeta,
  claseInput,
} from "@/components/inventario/ui";
import { Notificacion } from "@/components/inventario/Notificacion";
import {
  CLAVES,
  EMPLEADOS_INICIALES,
  SEDES_INICIALES,
  siguienteId,
  useTablaLocal,
  type Empleado,
  type Sede,
  type TipoEmpleado,
} from "@/lib/inventario";

export const Route = createFileRoute("/empleados")({
  head: () => ({
    meta: [
      { title: "Empleados y contratistas — InvenTrack" },
      {
        name: "description",
        content: "Registro de empleados y contratistas responsables de los equipos.",
      },
      { property: "og:title", content: "Empleados y contratistas — InvenTrack" },
      {
        property: "og:description",
        content: "Registro de empleados y contratistas responsables de los equipos.",
      },
    ],
  }),
  component: PaginaEmpleados,
});

const vacio = (): Omit<Empleado, "id"> => ({
  nombre_completo: "",
  tipo: "empleado",
  sede_id: 0,
  documento: "",
  email: "",
  activo: 1,
});

function PaginaEmpleados() {
  const empleados = useTablaLocal<Empleado>(CLAVES.empleados, EMPLEADOS_INICIALES);
  const sedes = useTablaLocal<Sede>(CLAVES.sedes, SEDES_INICIALES);
  const [abierto, setAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<Empleado, "id">>(vacio());
  const [aviso, setAviso] = useState<string | null>(null);

  const nombreSede = (id: number) =>
    sedes.datos.find((s) => s.id === id)?.nombre_sede ?? "—";

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (editandoId === null) {
      empleados.guardar([
        ...empleados.datos,
        { id: siguienteId(empleados.datos), ...form },
      ]);
      setAviso("Empleado creado correctamente");
    } else {
      empleados.guardar(
        empleados.datos.map((em) =>
          em.id === editandoId ? { id: editandoId, ...form } : em,
        ),
      );
      setAviso("Empleado actualizado correctamente");
    }
    setAbierto(false);
  }

  return (
    <>
      <EncabezadoPagina
        titulo="Empleados"
        descripcion={`${empleados.datos.length} personas registradas`}
        accion={
          <BotonPrimario
            onClick={() => {
              setEditandoId(null);
              setForm(vacio());
              setAbierto(true);
            }}
          >
            ➕ Nuevo Empleado
          </BotonPrimario>
        }
      />
      <Tarjeta>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="bg-secondary text-left">
                {["ID", "Nombre completo", "Tipo", "Sede", "Documento", "Email", "Estado", "Acciones"].map(
                  (c) => (
                    <th
                      key={c}
                      className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-secondary-foreground"
                    >
                      {c}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {empleados.datos.map((em) => (
                <tr key={em.id} className="border-t border-border hover:bg-muted/60">
                  <td className="px-4 py-3">{em.id}</td>
                  <td className="px-4 py-3 font-medium">{em.nombre_completo}</td>
                  <td className="px-4 py-3 capitalize">{em.tipo}</td>
                  <td className="px-4 py-3">{nombreSede(em.sede_id)}</td>
                  <td className="px-4 py-3">{em.documento}</td>
                  <td className="px-4 py-3 text-muted-foreground">{em.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold " +
                        (em.activo === 1
                          ? "bg-exito/15 text-exito"
                          : "bg-muted text-muted-foreground")
                      }
                    >
                      {em.activo === 1 ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        title="Editar"
                        className="rounded-md px-2 py-1 hover:bg-accent"
                        onClick={() => {
                          const { id, ...resto } = em;
                          setEditandoId(id);
                          setForm(resto);
                          setAbierto(true);
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        title="Eliminar"
                        className="rounded-md px-2 py-1 hover:bg-destructive/10"
                        onClick={() => {
                          if (!window.confirm(`¿Eliminar a ${em.nombre_completo}?`)) return;
                          empleados.guardar(
                            empleados.datos.filter((x) => x.id !== em.id),
                          );
                          setAviso("Empleado eliminado");
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Tarjeta>

      <Modal
        abierto={abierto}
        titulo={editandoId === null ? "Nuevo Empleado" : "Editar Empleado"}
        onCerrar={() => setAbierto(false)}
      >
        <form onSubmit={guardar} className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Nombre completo">
            <input
              required
              className={claseInput}
              value={form.nombre_completo}
              onChange={(e) => setForm({ ...form, nombre_completo: e.target.value })}
            />
          </Campo>
          <Campo etiqueta="Tipo">
            <select
              className={claseInput}
              value={form.tipo}
              onChange={(e) =>
                setForm({ ...form, tipo: e.target.value as TipoEmpleado })
              }
            >
              <option value="empleado">Empleado</option>
              <option value="contratista">Contratista</option>
            </select>
          </Campo>
          <Campo etiqueta="Sede">
            <select
              required
              className={claseInput}
              value={form.sede_id}
              onChange={(e) => setForm({ ...form, sede_id: Number(e.target.value) })}
            >
              <option value={0}>Seleccione…</option>
              {sedes.datos.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre_sede}
                </option>
              ))}
            </select>
          </Campo>
          <Campo etiqueta="Documento">
            <input
              className={claseInput}
              value={form.documento}
              onChange={(e) => setForm({ ...form, documento: e.target.value })}
            />
          </Campo>
          <Campo etiqueta="Email">
            <input
              type="email"
              className={claseInput}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Campo>
          <Campo etiqueta="Estado">
            <select
              className={claseInput}
              value={form.activo}
              onChange={(e) =>
                setForm({ ...form, activo: Number(e.target.value) === 1 ? 1 : 0 })
              }
            >
              <option value={1}>Activo</option>
              <option value={0}>Inactivo</option>
            </select>
          </Campo>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <BotonSecundario type="button" onClick={() => setAbierto(false)}>
              Cancelar
            </BotonSecundario>
            <BotonPrimario type="submit">Guardar</BotonPrimario>
          </div>
        </form>
      </Modal>
      <Notificacion mensaje={aviso} onCerrar={() => setAviso(null)} />
    </>
  );
}
