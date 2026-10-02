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
  ORGANISMOS_INICIALES,
  siguienteId,
  useTablaLocal,
  type OrganismoEntidad,
} from "@/lib/inventario";

export const Route = createFileRoute("/organismos")({
  head: () => ({
    meta: [
      { title: "Organismos — InvenTrack" },
      {
        name: "description",
        content: "Organismos que comparten las sedes, como SVSH y FEV.",
      },
      { property: "og:title", content: "Organismos — InvenTrack" },
      {
        property: "og:description",
        content: "Organismos que comparten las sedes, como SVSH y FEV.",
      },
    ],
  }),
  component: PaginaOrganismos,
});

const vacio = (): Omit<OrganismoEntidad, "id"> => ({ sigla: "", nombre: "" });

function PaginaOrganismos() {
  const tipos = useTablaLocal<OrganismoEntidad>(CLAVES.organismos, ORGANISMOS_INICIALES);
  const [abierto, setAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<OrganismoEntidad, "id">>(vacio());
  const [aviso, setAviso] = useState<string | null>(null);

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (editandoId === null) {
      tipos.guardar([...tipos.datos, { id: siguienteId(tipos.datos), ...form }]);
      setAviso("Organismo creado correctamente");
    } else {
      tipos.guardar(
        tipos.datos.map((t) => (t.id === editandoId ? { id: editandoId, ...form } : t)),
      );
      setAviso("Organismo actualizado correctamente");
    }
    setAbierto(false);
  }

  return (
    <>
      <EncabezadoPagina
        titulo="Organismos"
        descripcion={`${tipos.datos.length} organismos registrados`}
        accion={
          <BotonPrimario
            onClick={() => {
              setEditandoId(null);
              setForm(vacio());
              setAbierto(true);
            }}
          >
            ➕ Nuevo Organismo
          </BotonPrimario>
        }
      />
      <Tarjeta>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-sm">
            <thead>
              <tr className="bg-secondary text-left">
                {["ID", "Sigla", "Nombre", "Acciones"].map((c) => (
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
                  <td className="px-4 py-3 font-medium">{t.sigla}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.nombre}</td>
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
                          if (!window.confirm(`¿Eliminar el organismo ${t.sigla}?`)) return;
                          tipos.guardar(tipos.datos.filter((x) => x.id !== t.id));
                          setAviso("Organismo eliminado");
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
        titulo={editandoId === null ? "Nuevo Organismo" : "Editar Organismo"}
        onCerrar={() => setAbierto(false)}
      >
        <form onSubmit={guardar} className="grid gap-4">
          <Campo etiqueta="Sigla">
            <input
              required
              className={claseInput}
              value={form.sigla}
              onChange={(e) => setForm({ ...form, sigla: e.target.value })}
            />
          </Campo>
          <Campo etiqueta="Nombre completo">
            <input
              required
              className={claseInput}
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
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
