import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  BadgeEstado,
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
  ETIQUETAS_MOVIMIENTO,
  MOVIMIENTOS_INICIALES,
  PRODUCTOS_INICIALES,
  SEDES_INICIALES,
  TIPOS_INICIALES,
  hoy,
  siguienteId,
  useTablaLocal,
  type Empleado,
  type EstadoProducto,
  type Movimiento,
  type Producto,
  type Sede,
  type TipoMovimiento,
  type TipoProducto,
} from "@/lib/inventario";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Inventario de equipos — InvenTrack" },
      {
        name: "description",
        content:
          "Consulta, registra y traslada equipos del inventario con historial de movimientos.",
      },
      { property: "og:title", content: "Inventario de equipos — InvenTrack" },
      {
        property: "og:description",
        content:
          "Consulta, registra y traslada equipos del inventario con historial de movimientos.",
      },
    ],
  }),
  component: PaginaInicio,
});

const COLUMNAS = [
  "ID Producto",
  "Número de Serie",
  "Tipo Producto",
  "Sede",
  "Organismo",
  "Área",
  "Usuario Responsable",
  "Usuario Actual",
  "Marca",
  "Estado",
  "Último Movimiento",
  "RAM",
  "Disco Duro",
  "Procesador",
  "Observaciones",
  "Acciones",
];

const productoVacio = (): Omit<Producto, "id"> => ({
  numero_serie: "",
  tipo_producto_id: 0,
  descripcion: "",
  marca: "",
  modelo: "",
  usuario_responsable_id: 0,
  usuario_actual_id: 0,
  sede_id: 0,
  ultimo_movimiento: hoy(),
  estado: "bueno",
  ram: "",
  disco_duro: "",
  procesador: "",
  observaciones: "",
});

function PaginaInicio() {
  const productos = useTablaLocal<Producto>(CLAVES.productos, PRODUCTOS_INICIALES);
  const sedes = useTablaLocal<Sede>(CLAVES.sedes, SEDES_INICIALES);
  const empleados = useTablaLocal<Empleado>(CLAVES.empleados, EMPLEADOS_INICIALES);
  const tipos = useTablaLocal<TipoProducto>(CLAVES.tipos, TIPOS_INICIALES);
  const movimientos = useTablaLocal<Movimiento>(
    CLAVES.movimientos,
    MOVIMIENTOS_INICIALES,
  );

  const [busqueda, setBusqueda] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);
  const [modalProducto, setModalProducto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<Producto, "id">>(productoVacio());
  const [productoMovimiento, setProductoMovimiento] = useState<Producto | null>(
    null,
  );
  const [formMov, setFormMov] = useState({
    tipo_movimiento: "traslado" as TipoMovimiento,
    empleado_destino_id: 0,
    sede_destino_id: 0,
    observaciones_movimiento: "",
  });

  const nombreSede = (id: number) =>
    sedes.datos.find((s) => s.id === id)?.nombre_sede ?? "—";
  const datoSede = (id: number, campo: "organismo" | "area") =>
    sedes.datos.find((s) => s.id === id)?.[campo] ?? "—";
  const nombreEmpleado = (id: number) =>
    empleados.datos.find((e) => e.id === id)?.nombre_completo ?? "—";
  const nombreTipo = (id: number) =>
    tipos.datos.find((t) => t.id === id)?.nombre ?? "—";

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return productos.datos;
    return productos.datos.filter((p) =>
      [
        p.numero_serie,
        p.marca,
        p.modelo,
        p.descripcion,
        p.observaciones,
        nombreTipo(p.tipo_producto_id),
        nombreSede(p.sede_id),
        nombreEmpleado(p.usuario_actual_id),
        nombreEmpleado(p.usuario_responsable_id),
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda, productos.datos, sedes.datos, empleados.datos, tipos.datos]);

  function abrirNuevo() {
    setEditandoId(null);
    setForm(productoVacio());
    setModalProducto(true);
  }

  function abrirEditar(p: Producto) {
    const { id, ...resto } = p;
    setEditandoId(id);
    setForm(resto);
    setModalProducto(true);
  }

  function guardarProducto(e: React.FormEvent) {
    e.preventDefault();
    if (editandoId === null) {
      const nuevo: Producto = { id: siguienteId(productos.datos), ...form };
      productos.guardar([...productos.datos, nuevo]);
      setAviso("Producto creado correctamente");
    } else {
      productos.guardar(
        productos.datos.map((p) =>
          p.id === editandoId ? { id: editandoId, ...form } : p,
        ),
      );
      setAviso("Producto actualizado correctamente");
    }
    setModalProducto(false);
  }

  function eliminarProducto(p: Producto) {
    if (!window.confirm(`¿Eliminar el producto ${p.numero_serie}?`)) return;
    productos.guardar(productos.datos.filter((x) => x.id !== p.id));
    setAviso("Producto eliminado");
  }

  function abrirMovimiento(p: Producto) {
    setProductoMovimiento(p);
    setFormMov({
      tipo_movimiento: "traslado",
      empleado_destino_id: p.usuario_actual_id,
      sede_destino_id: p.sede_id,
      observaciones_movimiento: "",
    });
  }

  function guardarMovimiento(e: React.FormEvent) {
    e.preventDefault();
    const p = productoMovimiento;
    if (!p) return;
    const fecha = hoy();
    const nuevo: Movimiento = {
      id: siguienteId(movimientos.datos),
      producto_id: p.id,
      tipo_movimiento: formMov.tipo_movimiento,
      empleado_origen_id: p.usuario_actual_id,
      empleado_destino_id: Number(formMov.empleado_destino_id),
      sede_origen_id: p.sede_id,
      sede_destino_id: Number(formMov.sede_destino_id),
      observaciones_movimiento: formMov.observaciones_movimiento,
      fecha,
    };
    movimientos.guardar([...movimientos.datos, nuevo]);
    productos.guardar(
      productos.datos.map((x) =>
        x.id === p.id
          ? {
              ...x,
              usuario_actual_id: Number(formMov.empleado_destino_id),
              sede_id: Number(formMov.sede_destino_id),
              ultimo_movimiento: fecha,
            }
          : x,
      ),
    );
    setProductoMovimiento(null);
    setAviso("Movimiento registrado correctamente");
  }

  return (
    <>
      <EncabezadoPagina
        titulo="Inventario"
        descripcion={`${productos.datos.length} equipos registrados`}
        accion={
          <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por serie, marca, sede, usuario…"
              className={claseInput + " sm:w-80"}
            />
            <BotonPrimario onClick={abrirNuevo}>
              ➕ Nuevo Producto
            </BotonPrimario>
          </div>
        }
      />

      <Tarjeta>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1800px] border-collapse text-sm">
            <thead>
              <tr className="bg-secondary text-left">
                {COLUMNAS.map((c) => (
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
              {filtrados.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-border transition-colors hover:bg-muted/60"
                >
                  <td className="px-4 py-3 font-medium">{p.id}</td>
                  <td className="whitespace-nowrap px-4 py-3">{p.numero_serie}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {nombreTipo(p.tipo_producto_id)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {nombreSede(p.sede_id)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {datoSede(p.sede_id, "organismo")}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {datoSede(p.sede_id, "area")}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {nombreEmpleado(p.usuario_responsable_id)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {nombreEmpleado(p.usuario_actual_id)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{p.marca}</td>
                  <td className="px-4 py-3">
                    <BadgeEstado estado={p.estado} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {p.ultimo_movimiento || "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{p.ram || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {p.disco_duro || "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {p.procesador || "—"}
                  </td>
                  <td className="max-w-[240px] px-4 py-3 text-muted-foreground">
                    {p.observaciones || "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => abrirMovimiento(p)}
                        title="Registrar Movimiento"
                        className="rounded-md px-2 py-1 transition-colors hover:bg-accent"
                      >
                        🔄
                      </button>
                      <button
                        onClick={() => abrirEditar(p)}
                        title="Editar"
                        className="rounded-md px-2 py-1 transition-colors hover:bg-accent"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => eliminarProducto(p)}
                        title="Eliminar"
                        className="rounded-md px-2 py-1 transition-colors hover:bg-destructive/10"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td
                    colSpan={COLUMNAS.length}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    No hay productos que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Tarjeta>

      <Modal
        abierto={modalProducto}
        titulo={editandoId === null ? "Nuevo Producto" : "Editar Producto"}
        onCerrar={() => setModalProducto(false)}
      >
        <form onSubmit={guardarProducto} className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Número de serie">
            <input
              required
              className={claseInput}
              value={form.numero_serie}
              onChange={(e) => setForm({ ...form, numero_serie: e.target.value })}
            />
          </Campo>
          <Campo etiqueta="Tipo de producto">
            <select
              required
              className={claseInput}
              value={form.tipo_producto_id}
              onChange={(e) =>
                setForm({ ...form, tipo_producto_id: Number(e.target.value) })
              }
            >
              <option value={0}>Seleccione…</option>
              {tipos.datos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </Campo>
          <Campo etiqueta="Marca">
            <input
              className={claseInput}
              value={form.marca}
              onChange={(e) => setForm({ ...form, marca: e.target.value })}
            />
          </Campo>
          <Campo etiqueta="Modelo">
            <input
              className={claseInput}
              value={form.modelo}
              onChange={(e) => setForm({ ...form, modelo: e.target.value })}
            />
          </Campo>
          <Campo etiqueta="Usuario responsable">
            <select
              className={claseInput}
              value={form.usuario_responsable_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  usuario_responsable_id: Number(e.target.value),
                })
              }
            >
              <option value={0}>Sin asignar</option>
              {empleados.datos.map((em) => (
                <option key={em.id} value={em.id}>
                  {em.nombre_completo}
                </option>
              ))}
            </select>
          </Campo>
          <Campo etiqueta="Usuario actual">
            <select
              className={claseInput}
              value={form.usuario_actual_id}
              onChange={(e) =>
                setForm({ ...form, usuario_actual_id: Number(e.target.value) })
              }
            >
              <option value={0}>Sin asignar</option>
              {empleados.datos.map((em) => (
                <option key={em.id} value={em.id}>
                  {em.nombre_completo}
                </option>
              ))}
            </select>
          </Campo>
          <Campo etiqueta="Sede">
            <select
              required
              className={claseInput}
              value={form.sede_id}
              onChange={(e) =>
                setForm({ ...form, sede_id: Number(e.target.value) })
              }
            >
              <option value={0}>Seleccione…</option>
              {sedes.datos.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre_sede}
                </option>
              ))}
            </select>
          </Campo>
          <Campo etiqueta="Estado">
            <select
              className={claseInput}
              value={form.estado}
              onChange={(e) =>
                setForm({ ...form, estado: e.target.value as EstadoProducto })
              }
            >
              <option value="bueno">Bueno</option>
              <option value="regular">Regular</option>
              <option value="malo">Malo</option>
            </select>
          </Campo>
          <Campo etiqueta="Último movimiento">
            <input
              type="date"
              className={claseInput}
              value={form.ultimo_movimiento}
              onChange={(e) =>
                setForm({ ...form, ultimo_movimiento: e.target.value })
              }
            />
          </Campo>
          <Campo etiqueta="RAM">
            <input
              className={claseInput}
              value={form.ram}
              onChange={(e) => setForm({ ...form, ram: e.target.value })}
            />
          </Campo>
          <Campo etiqueta="Disco duro">
            <input
              className={claseInput}
              value={form.disco_duro}
              onChange={(e) => setForm({ ...form, disco_duro: e.target.value })}
            />
          </Campo>
          <Campo etiqueta="Procesador">
            <input
              className={claseInput}
              value={form.procesador}
              onChange={(e) => setForm({ ...form, procesador: e.target.value })}
            />
          </Campo>
          <div className="sm:col-span-2">
            <Campo etiqueta="Descripción">
              <input
                className={claseInput}
                value={form.descripcion}
                onChange={(e) =>
                  setForm({ ...form, descripcion: e.target.value })
                }
              />
            </Campo>
          </div>
          <div className="sm:col-span-2">
            <Campo etiqueta="Observaciones">
              <textarea
                rows={3}
                className={claseInput}
                value={form.observaciones}
                onChange={(e) =>
                  setForm({ ...form, observaciones: e.target.value })
                }
              />
            </Campo>
          </div>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <BotonSecundario type="button" onClick={() => setModalProducto(false)}>
              Cancelar
            </BotonSecundario>
            <BotonPrimario type="submit">Guardar</BotonPrimario>
          </div>
        </form>
      </Modal>

      <Modal
        abierto={productoMovimiento !== null}
        titulo={`Registrar movimiento · ${productoMovimiento?.numero_serie ?? ""}`}
        onCerrar={() => setProductoMovimiento(null)}
      >
        <form onSubmit={guardarMovimiento} className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Tipo de movimiento">
            <select
              className={claseInput}
              value={formMov.tipo_movimiento}
              onChange={(e) =>
                setFormMov({
                  ...formMov,
                  tipo_movimiento: e.target.value as TipoMovimiento,
                })
              }
            >
              {Object.entries(ETIQUETAS_MOVIMIENTO).map(([valor, etiqueta]) => (
                <option key={valor} value={valor}>
                  {etiqueta}
                </option>
              ))}
            </select>
          </Campo>
          <Campo etiqueta="Empleado destino">
            <select
              className={claseInput}
              value={formMov.empleado_destino_id}
              onChange={(e) =>
                setFormMov({
                  ...formMov,
                  empleado_destino_id: Number(e.target.value),
                })
              }
            >
              <option value={0}>Sin asignar</option>
              {empleados.datos
                .filter((em) => em.activo === 1)
                .map((em) => (
                  <option key={em.id} value={em.id}>
                    {em.nombre_completo}
                  </option>
                ))}
            </select>
          </Campo>
          <Campo etiqueta="Sede destino">
            <select
              required
              className={claseInput}
              value={formMov.sede_destino_id}
              onChange={(e) =>
                setFormMov({
                  ...formMov,
                  sede_destino_id: Number(e.target.value),
                })
              }
            >
              <option value={0}>Seleccione…</option>
              {sedes.datos.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre_sede}
                </option>
              ))}
            </select>
          </Campo>
          <div className="sm:col-span-2">
            <Campo etiqueta="Observaciones del movimiento">
              <textarea
                rows={3}
                className={claseInput}
                value={formMov.observaciones_movimiento}
                onChange={(e) =>
                  setFormMov({
                    ...formMov,
                    observaciones_movimiento: e.target.value,
                  })
                }
              />
            </Campo>
          </div>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <BotonSecundario
              type="button"
              onClick={() => setProductoMovimiento(null)}
            >
              Cancelar
            </BotonSecundario>
            <BotonPrimario type="submit">Guardar movimiento</BotonPrimario>
          </div>
        </form>
      </Modal>

      <Notificacion mensaje={aviso} onCerrar={() => setAviso(null)} />
    </>
  );
}
