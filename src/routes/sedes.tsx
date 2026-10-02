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
  SEDES_INICIALES,
  siguienteId,
  useTablaLocal,
  type Sede,
} from "@/lib/inventario";

export const Route = createFileRoute("/sedes")({
  head: () => ({
    meta: [
      { title: "Sedes — InvenTrack" },
      { name: "description", content: "Administra las sedes físicas donde se ubican los equipos." },
      { property: "og:title", content: "Sedes — InvenTrack" },
      {
        property: "og:description",
        content: "Administra las sedes físicas donde se ubican los equipos.",
      },
    ],
  }),
  component: PaginaSedes,
});

const vacio = (): Omit<Sede, "id"> => ({ nombre_sede: "", direccion: "" });

function PaginaSedes() {
  const sedes = useTablaLocal<Sede>(CLAVES.sedes, SEDES_INICIALES);
  const [abierto, setAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<Sede, "id">>(vacio());
  const [aviso, setAviso] = useState<string | null>(null);

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (editandoId === null) {
      sedes.guardar([...sedes.datos, { id: siguienteId(sedes.datos), ...form }]);
      setAviso("Sede creada correctamente");
    } else {
      sedes.guardar(
        sedes.datos.map((s) => (s.id === editandoId ? { id: editandoId, ...form } : s)),
      );
      setAviso("Sede actualizada correctamente");
    }
    setAbierto(false);
  }

  return (
    <>
      <EncabezadoPagina
        titulo="Sedes"
        descripcion={`${sedes.datos.length} sedes registradas`}
        accion={
          <BotonPrimario
            onClick={() => {
              setEditandoId(null);
              setForm(vacio());
              setAbierto(true);
            }}
          >
            ➕ Nueva Sede
          </BotonPrimario>
        }
      />
      <Tarjeta>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse text-sm">
            <thead>
              <tr className="bg-secondary text-left">
                {["ID", "Nombre", "Dirección", "Acciones"].map((c) => (
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
              {sedes.datos.map((s) => (
                <tr key={s.id} className="border-t border-border hover:bg-muted/60">
                  <td className="px-4 py-3">{s.id}</td>
                  <td className="px-4 py-3 font-medium">{s.nombre_sede}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.direccion}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        title="Editar"
                        className="rounded-md px-2 py-1 hover:bg-accent"
                        onClick={() => {
                          const { id, ...resto } = s;
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
                          if (!window.confirm(`¿Eliminar la sede ${s.nombre_sede}?`)) return;
                          sedes.guardar(sedes.datos.filter((x) => x.id !== s.id));
                          setAviso("Sede eliminada");
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
        titulo={editandoId === null ? "Nueva Sede" : "Editar Sede"}
        onCerrar={() => setAbierto(false)}
      >
        <form onSubmit={guardar} className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Nombre de la sede">
            <input
              required
              className={claseInput}
              value={form.nombre_sede}
              onChange={(e) => setForm({ ...form, nombre_sede: e.target.value })}
            />
          </Campo>
          <Campo etiqueta="Dirección">
            <input
              className={claseInput}
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
            />
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
