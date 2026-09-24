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
  TIPOS_INICIALES,
  siguienteId,
  useTablaLocal,
  type TipoProducto,
} from "@/lib/inventario";

export const Route = createFileRoute("/tipos")({
  head: () => ({
    meta: [
      { title: "Tipos de producto — InvenTrack" },
      {
        name: "description",
        content: "Categorías de equipos disponibles en el inventario.",
      },
      { property: "og:title", content: "Tipos de producto — InvenTrack" },
      {
        property: "og:description",
        content: "Categorías de equipos disponibles en el inventario.",
      },
    ],
  }),
  component: PaginaTipos,
});

const vacio = (): Omit<TipoProducto, "id"> => ({ nombre: "", descripcion: "" });

function PaginaTipos() {
  const tipos = useTablaLocal<TipoProducto>(CLAVES.tipos, TIPOS_INICIALES);
  const [abierto, setAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<TipoProducto, "id">>(vacio());
  const [aviso, setAviso] = useState<string | null>(null);

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (editandoId === null) {
      tipos.guardar([...tipos.datos, { id: siguienteId(tipos.datos), ...form }]);
      setAviso("Tipo creado correctamente");
    } else {
      tipos.guardar(
        tipos.datos.map((t) => (t.id === editandoId ? { id: editandoId, ...form } : t)),
      );
      setAviso("Tipo actualizado correctamente");
    }
    setAbierto(false);
  }

  return (
    <>
      <EncabezadoPagina
        titulo="Tipos de producto"
        descripcion={`${tipos.datos.length} categorías registradas`}
        accion={
          <BotonPrimario
            onClick={() => {
              setEditandoId(null);
              setForm(vacio());
              setAbierto(true);
            }}
          >
            ➕ Nuevo Tipo
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
                          if (!window.confirm(`¿Eliminar el tipo ${t.nombre}?`)) return;
                          tipos.guardar(tipos.datos.filter((x) => x.id !== t.id));
                          setAviso("Tipo eliminado");
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
        titulo={editandoId === null ? "Nuevo Tipo" : "Editar Tipo"}
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
