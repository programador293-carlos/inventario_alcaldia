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
  AREAS_INICIALES,
  siguienteId,
  useTablaLocal,
  type Area,
} from "@/lib/inventario";

export const Route = createFileRoute("/areas")({
  head: () => ({
    meta: [
      { title: "Áreas — InvenTrack" },
      {
        name: "description",
        content: "Áreas de trabajo a las que se asignan los equipos.",
      },
      { property: "og:title", content: "Áreas — InvenTrack" },
      {
        property: "og:description",
        content: "Áreas de trabajo a las que se asignan los equipos.",
      },
    ],
  }),
  component: PaginaAreas,
});

const vacio = (): Omit<Area, "id"> => ({ nombre: "", descripcion: "" });

function PaginaAreas() {
  const tipos = useTablaLocal<Area>(CLAVES.areas, AREAS_INICIALES);
  const [abierto, setAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<Area, "id">>(vacio());
  const [aviso, setAviso] = useState<string | null>(null);

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (editandoId === null) {
      tipos.guardar([...tipos.datos, { id: siguienteId(tipos.datos), ...form }]);
      setAviso("Área creada correctamente");
    } else {
      tipos.guardar(
        tipos.datos.map((t) => (t.id === editandoId ? { id: editandoId, ...form } : t)),
      );
      setAviso("Área actualizada correctamente");
    }
    setAbierto(false);
  }

  return (
    <>
      <EncabezadoPagina
        titulo="Áreas"
        descripcion={`${tipos.datos.length} áreas registradas`}
        accion={
          <BotonPrimario
            onClick={() => {
              setEditandoId(null);
              setForm(vacio());
              setAbierto(true);
            }}
          >
            ➕ Nueva Área
          </BotonPrimario>
        }
      />
      <Tarjeta>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-sm">
            <thead>
              <tr className="bg-secondary text-left">
                {["ID", "Nombre", "Descripción", "Acciones"].map((c) => (
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
              {tipos.datos.map((t) => (
                <tr key={t.id} className="border-t border-border hover:bg-muted/60">
                  <td className="px-4 py-3">{t.id}</td>
                  <td className="px-4 py-3 font-medium">{t.nombre}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.descripcion}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        title="Editar"
                        className="rounded-md px-2 py-1 hover:bg-accent"
                        onClick={() => {
                          const { id, ...resto } = t;
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
                          if (!window.confirm(`¿Eliminar el área ${t.nombre}?`)) return;
                          tipos.guardar(tipos.datos.filter((x) => x.id !== t.id));
                          setAviso("Área eliminada");
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
        titulo={editandoId === null ? "Nueva Área" : "Editar Área"}
        onCerrar={() => setAbierto(false)}
      >
        <form onSubmit={guardar} className="grid gap-4">
          <Campo etiqueta="Nombre">
            <input
              required
              className={claseInput}
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </Campo>
          <Campo etiqueta="Descripción">
            <textarea
              rows={3}
              className={claseInput}
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            />
          </Campo>
          <div className="flex justify-end gap-2">
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
