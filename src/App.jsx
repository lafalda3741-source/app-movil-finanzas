import React, { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "./supabaseClient";
import {
  Home,
  X,
  Menu,
  ChevronLeft,
  ChevronRight,
  Delete,
  CreditCard,
  ListChecks,
  Plus,
  LogOut,
  Pencil,
  Trash2,
  Calendar,
  HandCoins,
  TrendingUp,
  TrendingDown,
  LayoutDashboard,
  PiggyBank,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

// ============================================================
// Configuración por persona. Cada instalación (Ariel / Cielo)
// se despliega con una variable de entorno distinta:
//   VITE_PERSONA=ariel   ó   VITE_PERSONA=cielo
// Todo lo demás del código es idéntico para las dos apps.
// ============================================================
const PERSONA_ACTUAL = (typeof import.meta !== "undefined" && import.meta.env?.VITE_PERSONA) || "ariel";

const PERSONAS = {
  ariel: { nombre: "Ariel", pin: "1234", color: "#2563EB" },
  cielo: { nombre: "Cielo", pin: "1234", color: "#8B5CF6" },
};
const persona = PERSONAS[PERSONA_ACTUAL] || PERSONAS.ariel;
const personaKey = PERSONAS[PERSONA_ACTUAL] ? PERSONA_ACTUAL : "ariel";

// Logos de los bancos (los mismos del Panel de Control).
const LOGOS_BANCO = {
  "Banco Hipotecario": "data:image/png;base64,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",
  "Banco Credicoop": "data:image/png;base64,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",
};
// Logo de la tarjeta: la imagen propia que se cargó en el panel o, si no tiene, la del banco (Hipotecario / Credicoop).
function logoDeTarjeta(t) {
  if (t.logo) return t.logo;
  const b = (t.banco || "").toLowerCase();
  if (b.includes("hipotecario")) return LOGOS_BANCO["Banco Hipotecario"];
  if (b.includes("credicoop")) return LOGOS_BANCO["Banco Credicoop"];
  return null;
}

// Tarjetas de arranque (por si todavía no cargó la base). Las reales se leen de la tabla "tarjetas",
// que se administra desde Configuración en el Panel de Control. "titular" dice en qué app se pueden cargar consumos.
const TARJETAS_INICIALES = [
  { id: "visa-ariel", nombre: "VISA ARIEL", banco: "Banco Hipotecario", titular: "ariel", color: "#F08018" },
  { id: "visa-cielo", nombre: "VISA CIELO", banco: "Banco Hipotecario", titular: "cielo", color: "#F08018" },
  { id: "cabal-ariel", nombre: "CABAL ARIEL", banco: "Banco Credicoop", titular: "ariel", color: "#585048" },
  { id: "cabal-cielo", nombre: "CABAL CIELO", banco: "Banco Credicoop", titular: "cielo", color: "#585048" },
];
function tarjetaDesdeDb(r) {
  return {
    id: r.id,
    nombre: r.nombre || r.id,
    banco: r.banco || "",
    logo: r.logo || "",
    titular: r.titular === "cielo" ? "cielo" : "ariel",
    color: /^#[0-9a-f]{6}$/i.test(r.color || "") ? r.color : "#0F766E",
  };
}

// Meses sin tope: el índice 0 es Ago 2026 y los siguientes se calculan solos (no hay lista fija).
function nombreMes(i) {
  const d = new Date(2026, 7 + i, 1);
  return `${MESES_ABREV[d.getMonth()]} ${d.getFullYear()}`;
}
function indicesMeses(desde, cant) {
  return Array.from({ length: cant }, (_, k) => desde + k).map((i) => ({ i, m: nombreMes(i) }));
}
// Sueldos por mes: para meses que todavía no tienen valor cargado se repite el último conocido.
function montoDelMes(arr, i) {
  if (!arr || arr.length === 0) return 0;
  return i < arr.length ? arr[i] : arr[arr.length - 1];
}
// Cambia solo el monto de un mes (el resto queda como estaba).
function conMontoEnMes(arr, i, valor) {
  const nuevos = [...arr];
  const previo = montoDelMes(arr, i);
  const ultimo = nuevos.length ? nuevos[nuevos.length - 1] : 0;
  while (nuevos.length <= i) nuevos.push(ultimo);
  nuevos[i] = valor;
  if (nuevos.length === i + 1) nuevos.push(previo);
  return nuevos;
}
// Cambia el monto desde un mes en adelante (para los aumentos).
function conMontoDesdeMes(arr, i, valor) {
  const nuevos = [...arr];
  const ultimo = nuevos.length ? nuevos[nuevos.length - 1] : 0;
  while (nuevos.length <= i) nuevos.push(ultimo);
  for (let k = i; k < nuevos.length; k++) nuevos[k] = valor;
  return nuevos;
}
const MESES_ABREV = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

// Mismo anclaje que la función SQL mes_actual_index() (Ago 2026 = índice 0).
function mesActualIndex() {
  const hoy = new Date();
  return (hoy.getFullYear() - 2026) * 12 + (hoy.getMonth() - 7);
}
function mesActualClamp() {
  return Math.max(mesActualIndex(), 0);
}
function proximoMesIndex() {
  return Math.max(mesActualIndex() + 1, 0);
}

function mesEnOffset(offset) {
  const base = new Date(2026, 7, 1); // Ago 2026 = offset 0
  const d = new Date(base.getFullYear(), base.getMonth() + offset, 1);
  return `${MESES_ABREV[d.getMonth()]} ${d.getFullYear()}`;
}

const fmt = (n) => (Number(n) || 0).toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

// Valor de un cargo en un mes dado (igual que en el Panel de Control) —
// respeta el mes de inicio: antes de eso, o después de terminar, no aparece.
function valorCargoEnMes(cargo, mesIndex) {
  const inicio = cargo.mesInicio || 0;
  if (mesIndex < inicio) return null;
  if (cargo.cuotaTotal == null) return cargo.monto;
  return mesIndex < inicio + cargo.cuotaTotal ? cargo.monto : null;
}

// Suma de todos los cargos de una tarjeta en un mes dado (igual que en el Panel de Control).
function totalTarjetaEnMes(cargosTarjeta, mesIndex) {
  return (cargosTarjeta || []).reduce((acc, c) => acc + (valorCargoEnMes(c, mesIndex) || 0), 0);
}

const SECCIONES = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "carga", label: "Carga de Compras", icon: Plus },
  { id: "gastos", label: "Gastos Mensuales", icon: ListChecks },
  { id: "tarjetas", label: "Cuotas de Tarjetas", icon: CreditCard },
  { id: "ingresos", label: "Ingresos", icon: HandCoins },
];

export default function AppMovil() {
  const [tarjetas, setTarjetas] = useState(TARJETAS_INICIALES);
  // Tarjetas de esta persona: son las únicas donde puede cargar consumos nuevos.
  const idsPropias = tarjetas.filter((t) => t.titular === personaKey).map((t) => t.id);
  const [desbloqueado, setDesbloqueado] = useState(false);
  const [pinIngresado, setPinIngresado] = useState("");
  const [pinError, setPinError] = useState(false);
  const [pinReal, setPinReal] = useState(persona.pin); // fallback mientras carga
  const [pinListo, setPinListo] = useState(false);

  // Trae el PIN individual de esta persona desde Supabase (columna "pin" en
  // "enlaces_apps"). Corre ANTES de desbloquear, así que va aparte del resto
  // de la carga de datos (que solo corre después de desbloqueado).
  useEffect(() => {
    supabase
      .from("enlaces_apps")
      .select("pin")
      .eq("persona", PERSONA_ACTUAL)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!error && data?.pin) setPinReal(data.pin);
        setPinListo(true);
      });
  }, []);

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState("carga");

  // Si se abrió desde el acceso directo "Cargar pago" (?accion=carga), asegura
  // que arranque ahí, sin pasar por el menú.
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("accion") === "carga") setSeccionActiva("carga");
    }
  }, []);
  const [mesIndex, setMesIndex] = useState(mesActualClamp()); // arranca en el mes actual del sistema
  // Columnas de tablas/gráficos: ventana móvil que acompaña al mes elegido.
  const mesesVista = indicesMeses(Math.max(0, mesIndex - 1), 5);
  // Opciones de "Mes de inicio": desde Ago 2026 hasta 5 años adelante de hoy (se corre solo).
  const opcionesMes = indicesMeses(0, Math.max(mesActualIndex() + 61, mesIndex + 13));

  const [cargando, setCargando] = useState(true);
  const [recargarKey, setRecargarKey] = useState(0); // tocar "Actualizar" fuerza releer todo
  const [cargosPorTarjeta, setCargosPorTarjeta] = useState({});
  const [saldosTarjetas, setSaldosTarjetas] = useState({}); // { [tarjetaId]: saldo } — viene de la tabla "tarjetas", mantenida por el trigger
  const [gastosBase, setGastosMensuales] = useState([]);
  // "Pagado" es por mes: viene de la tabla pagos_mensuales (gasto_id + mes_index), no del gasto en sí.
  const [pagosPorMes, setPagosPorMes] = useState({}); // { "gastoId:mesIndex": true/false }
  const gastosMensuales = useMemo(
    () => gastosBase.map((g) => ({ ...g, pagado: !!pagosPorMes[`${g.id}:${mesIndex}`] })),
    [gastosBase, pagosPorMes, mesIndex]
  );
  const [categorias, setCategorias] = useState([]);
  const [sueldos, setSueldos] = useState({
    ariel: { titular: "Ariel", montosPorMes: Array(12).fill(0), aumentosPorMes: {} },
    cielo: { titular: "Cielo", montosPorMes: Array(12).fill(0), aumentosPorMes: {} },
  });
  const [aumentoPorcPorPersona, setAumentoPorcPorPersona] = useState({ ariel: "", cielo: "" });
  const [editandoSueldo, setEditandoSueldo] = useState(null); // "ariel" | "cielo" | null
  const [editandoAumento, setEditandoAumento] = useState(null); // "ariel" | "cielo" | null

  // ---- Otros ingresos (además de los sueldos) ----
  const [ingresosExtra, setIngresosExtra] = useState([]); // { id, nombre, monto }
  const [modalNuevoIngreso, setModalNuevoIngreso] = useState(false);
  const [formIngreso, setFormIngreso] = useState({ nombre: "", monto: "" });
  const [editandoIngresoExtra, setEditandoIngresoExtra] = useState(null); // "id:campo"

  const actualizarCampoIngresoExtra = async (id, campo, valor) => {
    setIngresosExtra((prev) => prev.map((ig) => (ig.id === id ? { ...ig, [campo]: valor } : ig)));
    const { error } = await supabase.from("ingresos_extra").update({ [campo]: valor }).eq("id", id);
    if (error) console.error("Error actualizando ingreso extra:", error);
  };

  const eliminarIngresoExtra = async (id) => {
    setIngresosExtra((prev) => prev.filter((ig) => ig.id !== id));
    const { error } = await supabase.from("ingresos_extra").delete().eq("id", id);
    if (error) console.error("Error eliminando ingreso extra:", error);
  };

  const agregarIngresoExtra = async () => {
    if (!formIngreso.nombre.trim() || !formIngreso.monto) return;
    const nuevo = { id: `ig${Date.now()}`, nombre: formIngreso.nombre.trim(), monto: Number(formIngreso.monto) };
    setIngresosExtra((prev) => [...prev, nuevo]);
    const { error } = await supabase.from("ingresos_extra").insert(nuevo);
    if (error) console.error("Error guardando ingreso extra:", error);
    setFormIngreso({ nombre: "", monto: "" });
    setModalNuevoIngreso(false);
  };

  // ---- PIN ----
  const ingresarDigito = (d) => {
    if (!pinListo) return; // evita comparar contra el fallback mientras carga el pin real
    if (pinError) setPinError(false);
    setPinIngresado((prev) => {
      if (prev.length >= 4) return prev;
      const nuevo = prev + d;
      if (nuevo.length === 4) {
        if (nuevo === pinReal) {
          setTimeout(() => setDesbloqueado(true), 120);
        } else {
          setTimeout(() => {
            setPinError(true);
            setPinIngresado("");
          }, 300);
        }
      }
      return nuevo;
    });
  };
  const borrarDigito = () => {
    setPinError(false);
    setPinIngresado((prev) => prev.slice(0, -1));
  };

  // ---- Carga inicial desde Supabase (misma base que el Panel de Control) ----
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const { data: tarjetasDb } = await supabase.from("tarjetas").select("*").order("orden");
        let listaTarjetas = TARJETAS_INICIALES;
        if (tarjetasDb && tarjetasDb.length > 0) {
          const saldos = {};
          tarjetasDb.forEach((t) => (saldos[t.id] = Number(t.saldo) || 0));
          setSaldosTarjetas(saldos);
          const desdeDb = tarjetasDb.filter((r) => r.nombre).map(tarjetaDesdeDb);
          if (desdeDb.length > 0) {
            listaTarjetas = desdeDb;
            setTarjetas(desdeDb);
          }
        }

        const { data: cats } = await supabase.from("categorias_gasto").select("*");
        setCategorias((cats || []).map((c) => ({ id: c.id, nombre: c.nombre, color: c.color })));

        const { data: cargosDb } = await supabase.from("cargos_tarjeta").select("*").order("orden");
        const agrupados = {};
        listaTarjetas.forEach((t) => (agrupados[t.id] = []));
        (cargosDb || []).forEach((c) => {
          if (!agrupados[c.tarjeta_id]) agrupados[c.tarjeta_id] = [];
          agrupados[c.tarjeta_id].push({ id: c.id, nombre: c.nombre, monto: Number(c.monto), cuotaTotal: c.cuota_total, mesInicio: Number.isFinite(Number(c.mes_inicio)) ? Number(c.mes_inicio) : 0 });
        });
        setCargosPorTarjeta(agrupados);

        const { data: pagosDb } = await supabase.from("pagos_mensuales").select("gasto_id, mes_index, pagado");
        const mapaPagos = {};
        (pagosDb || []).forEach((p) => { mapaPagos[`${p.gasto_id}:${p.mes_index}`] = !!p.pagado; });
        setPagosPorMes(mapaPagos);

        const { data: gastosDb } = await supabase.from("gastos_mensuales").select("*");
        let listaGastos = gastosDb || [];

        // Reparación automática: si falta alguna de las 4 tarjetas, la vuelve a crear.
        const idsTarjetaPresentes = new Set(listaGastos.filter((g) => g.es_tarjeta).map((g) => g.tarjeta_id));
        const faltantesTarjeta = listaTarjetas.filter((t) => !idsTarjetaPresentes.has(t.id));
        if (faltantesTarjeta.length > 0) {
          const nuevasFilas = faltantesTarjeta.map((t) => ({
            id: `gm-${t.id}`,
            tarjeta_id: t.id,
            nombre: t.nombre,
            monto: 0,
            es_tarjeta: true,
            categoria_id: "cat-tarjetas",
            pagado: false,
          }));
          const { error } = await supabase.from("gastos_mensuales").insert(nuevasFilas);
          if (!error) listaGastos = [...listaGastos, ...nuevasFilas];
        }

        setGastosMensuales(
          listaGastos.map((g) => ({
            id: g.id,
            nombre: g.nombre,
            monto: Number(g.monto),
            esTarjeta: g.es_tarjeta,
            tarjetaId: g.tarjeta_id,
            categoriaId: g.categoria_id,
            pagado: g.pagado,
          }))
        );

        const { data: sueldosDb } = await supabase.from("sueldos").select("*");
        const nuevosSueldos = {
          ariel: { titular: "Ariel", montosPorMes: Array(12).fill(0), aumentosPorMes: {} },
          cielo: { titular: "Cielo", montosPorMes: Array(12).fill(0), aumentosPorMes: {} },
        };
        const faltantes = [];
        for (const key of ["ariel", "cielo"]) {
          const fila = (sueldosDb || []).find((s) => s.persona === key);
          if (fila) {
            nuevosSueldos[key] = {
              titular: fila.titular,
              montosPorMes: fila.montos_por_mes && fila.montos_por_mes.length ? fila.montos_por_mes : Array(12).fill(0),
              aumentosPorMes: fila.aumentos_por_mes || {},
            };
          } else {
            faltantes.push(key);
          }
        }
        setSueldos(nuevosSueldos);
        // Primera vez: crea las filas que falten en la tabla compartida "sueldos"
        for (const key of faltantes) {
          await supabase.from("sueldos").insert({
            persona: key,
            titular: PERSONAS[key].nombre,
            montos_por_mes: nuevosSueldos[key].montosPorMes,
            aumentos_por_mes: nuevosSueldos[key].aumentosPorMes,
          });
        }

        const { data: ingresosExtraDb } = await supabase.from("ingresos_extra").select("*");
        setIngresosExtra((ingresosExtraDb || []).map((ig) => ({ id: ig.id, nombre: ig.nombre, monto: Number(ig.monto) })));
      } catch (err) {
        console.error("Error cargando datos compartidos:", err);
      } finally {
        setCargando(false);
      }
    };
    if (desbloqueado) cargarDatos();
  }, [desbloqueado, seccionActiva, recargarKey]);

  // ---- Carga de Compras ----
  const [formCompra, setFormCompra] = useState({
    tarjetaId: TARJETAS_INICIALES.find((t) => t.titular === personaKey)?.id || "",
    tipo: "cuotas", // "cuotas" | "recurrente"
    descripcion: "",
    importe: "",
    cuotas: "1",
    mesInicio: proximoMesIndex(),
  });
  const [cargoEnEdicion, setCargoEnEdicion] = useState(null); // { tarjetaId, cargoId } | null (null = alta nueva)
  useEffect(() => {
    if (cargoEnEdicion) return;
    setFormCompra((prev) => (idsPropias.includes(prev.tarjetaId) ? prev : { ...prev, tarjetaId: idsPropias[0] || "" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tarjetas]);

  // El mes de inicio del formulario arranca en el mes siguiente al actual
  // (mes vencido) cada vez que entrás a "Carga de Compras" para dar de alta
  // algo nuevo — pero seguís pudiendo cambiarlo a mano. Si entraste para
  // EDITAR un cargo existente, no lo tocamos (ya viene precargado).
  useEffect(() => {
    if (seccionActiva === "carga" && !cargoEnEdicion) {
      setFormCompra((prev) => ({ ...prev, mesInicio: proximoMesIndex() }));
    }
  }, [seccionActiva]);

  const [compraGuardadaOk, setCompraGuardadaOk] = useState(false);
  const [erroGuardarCompra, setErrorGuardarCompra] = useState(false);

  const abrirEdicionCargo = (tarjetaId, cargo) => {
    const esCuotas = cargo.cuotaTotal != null;
    setCargoEnEdicion({ tarjetaId, cargoId: cargo.id });
    setFormCompra({
      tarjetaId,
      tipo: esCuotas ? "cuotas" : "recurrente",
      descripcion: cargo.nombre,
      importe: String(esCuotas ? cargo.monto * cargo.cuotaTotal : cargo.monto),
      cuotas: esCuotas ? String(cargo.cuotaTotal) : "1",
      mesInicio: cargo.mesInicio || 0,
    });
    setSeccionActiva("carga");
  };

  const cancelarEdicionCarga = () => {
    setCargoEnEdicion(null);
    setFormCompra({
      tarjetaId: idsPropias[0] || "",
      tipo: "cuotas",
      descripcion: "",
      importe: "",
      cuotas: "1",
      mesInicio: proximoMesIndex(),
    });
  };

  const guardarCompra = async () => {
    if (!formCompra.descripcion.trim() || !formCompra.importe) return;
    const esCuotas = formCompra.tipo === "cuotas";
    const cuotaTotal = esCuotas ? Number(formCompra.cuotas) || 1 : null;
    const montoPorMes = esCuotas ? Number(formCompra.importe) / cuotaTotal : Number(formCompra.importe);
    const mesInicio = Number(formCompra.mesInicio) || 0;

    if (cargoEnEdicion) {
      // ---- Editar un cargo ya cargado ----
      const { tarjetaId: tarjetaOriginal, cargoId } = cargoEnEdicion;
      const tarjetaDestino = formCompra.tarjetaId;
      const actualizado = { id: cargoId, nombre: formCompra.descripcion.trim(), monto: montoPorMes, cuotaTotal, mesInicio };

      setCargosPorTarjeta((prev) => {
        const siguiente = { ...prev };
        siguiente[tarjetaOriginal] = (siguiente[tarjetaOriginal] || []).filter((c) => c.id !== cargoId);
        siguiente[tarjetaDestino] = [...(siguiente[tarjetaDestino] || []), actualizado];
        return siguiente;
      });

      const { error } = await supabase
        .from("cargos_tarjeta")
        .update({
          tarjeta_id: tarjetaDestino,
          nombre: actualizado.nombre,
          monto: actualizado.monto,
          cuota_total: actualizado.cuotaTotal,
          mes_inicio: mesInicio,
        })
        .eq("id", cargoId);

      if (error) {
        console.error("Error editando cargo:", error);
        setErrorGuardarCompra(true);
        setTimeout(() => setErrorGuardarCompra(false), 2600);
        return;
      }

      setCargoEnEdicion(null);
      setFormCompra({ tarjetaId: idsPropias[0] || "", tipo: "cuotas", descripcion: "", importe: "", cuotas: "1", mesInicio: proximoMesIndex() });
      setCompraGuardadaOk(true);
      setTimeout(() => setCompraGuardadaOk(false), 2200);
      return;
    }

    // ---- Compra nueva ----
    const nuevo = { id: `c${Date.now()}`, nombre: formCompra.descripcion.trim(), monto: montoPorMes, cuotaTotal, mesInicio };

    setCargosPorTarjeta((prev) => ({
      ...prev,
      [formCompra.tarjetaId]: [...(prev[formCompra.tarjetaId] || []), nuevo],
    }));

    const { error } = await supabase.from("cargos_tarjeta").insert({
      id: nuevo.id,
      tarjeta_id: formCompra.tarjetaId,
      nombre: nuevo.nombre,
      monto: nuevo.monto,
      cuota_total: nuevo.cuotaTotal,
      mes_inicio: mesInicio,
      orden: (cargosPorTarjeta[formCompra.tarjetaId] || []).length,
    });

    if (error) {
      console.error("Error guardando compra:", error);
      setErrorGuardarCompra(true);
      setTimeout(() => setErrorGuardarCompra(false), 2600);
      return;
    }

    setFormCompra({ ...formCompra, descripcion: "", importe: "", cuotas: "1" });
    setCompraGuardadaOk(true);
    setTimeout(() => setCompraGuardadaOk(false), 2200);
  };

  // ---- Cuotas de Tarjetas: eliminar cargo ----
  const eliminarCargo = async (tarjetaId, cargoId) => {
    const cargo = (cargosPorTarjeta[tarjetaId] || []).find((c) => c.id === cargoId);
    if (!window.confirm(`¿Seguro que querés eliminar "${cargo?.nombre || "este cargo"}"?`)) return;
    setCargosPorTarjeta((prev) => ({ ...prev, [tarjetaId]: prev[tarjetaId].filter((c) => c.id !== cargoId) }));
    const { error } = await supabase.from("cargos_tarjeta").delete().eq("id", cargoId);
    if (error) console.error("Error eliminando cargo:", error);
  };

  // ---- Gastos Mensuales: marcar pagado ----
  const togglePagado = async (id) => {
    const clave = `${id}:${mesIndex}`;
    const nuevoValor = !pagosPorMes[clave];
    setPagosPorMes((prev) => ({ ...prev, [clave]: nuevoValor }));
    const { error } = await supabase
      .from("pagos_mensuales")
      .upsert({ gasto_id: id, mes_index: mesIndex, pagado: nuevoValor, updated_at: new Date().toISOString() }, { onConflict: "gasto_id,mes_index" });
    if (error) {
      console.error("Error actualizando pagado:", error);
      // si falla, revertimos para no mostrar algo que no quedó guardado
      setPagosPorMes((prev) => ({ ...prev, [clave]: !nuevoValor }));
    }
  };

  // ---- Ingresos: sueldos de Ariel y Cielo (los dos, ambas apps ven y editan los dos) ----
  const actualizarMontoSueldo = async (key, valor) => {
    const nuevosMontos = conMontoEnMes(sueldos[key].montosPorMes, mesIndex, valor);
    setSueldos((prev) => ({ ...prev, [key]: { ...prev[key], montosPorMes: nuevosMontos } }));
    const { error } = await supabase.from("sueldos").update({ montos_por_mes: nuevosMontos }).eq("persona", key);
    if (error) console.error("Error actualizando sueldo:", error);
  };

  const aplicarAumentoSueldo = async (key) => {
    const porc = Number(aumentoPorcPorPersona[key]);
    if (!porc) return;
    const s = sueldos[key];
    const anterior = montoDelMes(s.montosPorMes, mesIndex);
    const nuevo = Math.round(anterior * (1 + porc / 100));
    const nuevosMontos = conMontoDesdeMes(s.montosPorMes, mesIndex, nuevo);
    const nuevosAumentos = { ...s.aumentosPorMes, [mesIndex]: { porc, anterior, nuevo } };
    setSueldos((prev) => ({ ...prev, [key]: { ...prev[key], montosPorMes: nuevosMontos, aumentosPorMes: nuevosAumentos } }));
    setAumentoPorcPorPersona((prev) => ({ ...prev, [key]: "" }));
    setEditandoAumento(null);
    const { error } = await supabase
      .from("sueldos")
      .update({ montos_por_mes: nuevosMontos, aumentos_por_mes: nuevosAumentos })
      .eq("persona", key);
    if (error) console.error("Error aplicando aumento:", error);
  };

  const refTablaCuotas = useRef(null);
  useEffect(() => {
    const el = refTablaCuotas.current;
    if (!el) return;
    const ths = el.querySelectorAll("thead th");
    const stickyTh = ths[0];
    // La tabla muestra una ventana de meses que arranca un mes antes del elegido,
      // así que el mes elegido es la columna 1 (o 0 si es el primer mes) + la columna fija.
      const targetTh = ths[mesIndex - Math.max(0, mesIndex - 1) + 1];
    if (stickyTh && targetTh) {
      el.scrollTo({ left: targetTh.offsetLeft - stickyTh.getBoundingClientRect().width, behavior: "smooth" });
    }
  }, [mesIndex, seccionActiva]);

  // ============================================================
  // Pantalla de bloqueo (PIN)
  // ============================================================
  if (!desbloqueado) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center px-6"
        style={{ fontFamily: "Inter, sans-serif", background: `linear-gradient(160deg, #0D9488, ${persona.color})` }}
      >
        <div className="w-full max-w-sm bg-white rounded-[28px] p-8 flex flex-col items-center">
          <div
            className="h-16 w-16 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: `linear-gradient(135deg, #0D9488, ${persona.color})` }}
          >
            <Home size={28} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 text-center mb-1">
            Finanzas Familiar - {persona.nombre}
          </h1>
          <p className={`text-sm mb-6 ${pinError ? "text-red-500" : "text-slate-500"}`}>
            {pinError ? "PIN incorrecto, intentá de nuevo" : "Ingrese el PIN para acceder"}
          </p>

          <div className="flex gap-4 mb-8">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-3 w-3 rounded-full"
                style={{ background: i < pinIngresado.length ? (pinError ? "#EF4444" : "#0D9488") : "#E2E8F0" }}
              />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 w-full">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
              <button
                key={d}
                onClick={() => ingresarDigito(d)}
                className="h-16 rounded-2xl bg-slate-50 text-xl font-semibold text-slate-900 active:scale-95 transition-transform"
              >
                {d}
              </button>
            ))}
            <div />
            <button
              onClick={() => ingresarDigito("0")}
              className="h-16 rounded-2xl bg-slate-50 text-xl font-semibold text-slate-900 active:scale-95 transition-transform"
            >
              0
            </button>
            <button onClick={borrarDigito} className="h-16 rounded-2xl flex items-center justify-center text-slate-400">
              <Delete size={20} />
            </button>
          </div>

          <p className="text-xs text-slate-400 mt-6">🔒 Acceso protegido</p>
        </div>
      </div>
    );
  }

  const seccionInfo = SECCIONES.find((s) => s.id === seccionActiva);

  // ============================================================
  // App principal
  // ============================================================
  return (
    <div className="min-h-screen w-full bg-slate-50" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Overlay del menú */}
      {menuAbierto && <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setMenuAbierto(false)} />}

      {/* Menú lateral */}
      <aside
        className="fixed top-0 left-0 h-full w-72 z-50 bg-white transition-transform duration-300"
        style={{ transform: menuAbierto ? "translateX(0)" : "translateX(-100%)" }}
      >
        <div className="text-white p-5" style={{ background: "#0D9488" }}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Home size={22} />
              <span className="font-bold text-lg">Finanzas Familiar</span>
            </div>
            <button onClick={() => setMenuAbierto(false)} className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
              <X size={16} />
            </button>
          </div>
          <p className="text-white/80 text-sm ml-8">{persona.nombre}</p>
        </div>

        <nav className="p-3">
          {SECCIONES.map((s) => {
            const Icon = s.icon;
            const activa = seccionActiva === s.id;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setSeccionActiva(s.id);
                  setMenuAbierto(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left mb-1 transition-colors"
                style={activa ? { background: "#ECFDF5", color: "#0D9488" } : { color: "#334155" }}
              >
                <Icon size={20} />
                <span className="font-medium">{s.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-100">
          <button
            onClick={() => {
              setDesbloqueado(false);
              setPinIngresado("");
              setMenuAbierto(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-red-500 font-medium"
          >
            <LogOut size={20} />
            Bloquear
          </button>
        </div>
      </aside>

      {/* Header */}
      <header className="text-white sticky top-0 z-30" style={{ background: "#0D9488" }}>
        <div className="flex items-center gap-3 px-4 pt-3">
          <button onClick={() => setMenuAbierto(true)} className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <Menu size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-bold truncate leading-tight">Finanzas Familiar</p>
            <p className="text-white/75 text-xs">{persona.nombre}</p>
          </div>
        </div>
        {/* Selector de mes grande, en su propia fila */}
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => setMesIndex((i) => Math.max(0, i - 1))}
            disabled={mesIndex === 0}
            className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 active:bg-white/30 disabled:opacity-40"
            aria-label="Mes anterior"
          >
            <ChevronLeft size={24} />
          </button>
          <span className="flex-1 bg-white/20 rounded-2xl py-3 text-center text-xl font-bold whitespace-nowrap">{nombreMes(mesIndex)}</span>
          <button
            onClick={() => setMesIndex((i) => i + 1)}
            className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 active:bg-white/30"
            aria-label="Mes siguiente"
          >
            <ChevronRight size={24} />
          </button>
        </div>
        <div className="flex items-center justify-between gap-1.5 px-4 pb-2.5 text-white/90 text-sm">
          <div className="flex items-center gap-1.5">
            {seccionInfo && <seccionInfo.icon size={14} />}
            {seccionInfo?.label}
          </div>
          <button
            onClick={() => setRecargarKey((k) => k + 1)}
            className="flex items-center gap-1 text-xs text-white/75 active:text-white"
            aria-label="Actualizar datos"
          >
            <RefreshCw size={13} className={cargando ? "animate-spin" : ""} /> Actualizar
          </button>
        </div>
      </header>

      {/* Contenido */}
      <main className="p-4 pb-10">
        {cargando && <p className="text-center text-sm text-slate-400 py-10">Cargando datos...</p>}

        {!cargando && seccionActiva === "dashboard" && (
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Dashboard</h1>
            <p className="text-sm text-slate-500 mb-4">Resumen de {nombreMes(mesIndex)}</p>

            {(() => {
              const ingresoArielMes = montoDelMes(sueldos.ariel.montosPorMes, mesIndex) || 0;
              const ingresoCieloMes = montoDelMes(sueldos.cielo.montosPorMes, mesIndex) || 0;
              const totalIngresosExtra = ingresosExtra.reduce((acc, ig) => acc + ig.monto, 0);
              const ingresosMes = ingresoArielMes + ingresoCieloMes + totalIngresosExtra;

              const sumaTarjetasDelMes = tarjetas.reduce((acc, t) => acc + totalTarjetaEnMes(cargosPorTarjeta[t.id], mesIndex), 0);
              const sumaGastosFijos = gastosMensuales.filter((g) => !g.esTarjeta).reduce((acc, g) => acc + g.monto, 0);
              const gastosMes = sumaTarjetasDelMes + sumaGastosFijos;

              const ahorroMes = ingresosMes - gastosMes;

              return (
                <div className="bg-white rounded-3xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: "#DCFCE7" }}>
                        <TrendingUp size={17} style={{ color: "#16A34A" }} />
                      </div>
                      <span className="text-sm text-slate-600">Ingresos del mes</span>
                    </div>
                    <span className="text-lg font-bold" style={{ color: "#16A34A" }}>{fmt(ingresosMes)}</span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: "#FEE2E2" }}>
                        <TrendingDown size={17} style={{ color: "#EF4444" }} />
                      </div>
                      <span className="text-sm text-slate-600">Gastos totales del mes</span>
                    </div>
                    <span className="text-lg font-bold" style={{ color: "#EF4444" }}>{fmt(gastosMes)}</span>
                  </div>

                  <div className="h-px bg-slate-100 my-1" />

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: `${persona.color}1F` }}>
                        <PiggyBank size={17} style={{ color: persona.color }} />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{ahorroMes >= 0 ? "Ahorro del mes" : "Déficit del mes"}</span>
                    </div>
                    <span className="text-2xl font-bold" style={{ color: ahorroMes >= 0 ? persona.color : "#EF4444" }}>
                      {fmt(ahorroMes)}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {!cargando && seccionActiva === "carga" && (
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-4">
              {cargoEnEdicion ? "Editar Cargo" : "Carga Rápida de Compras"}
            </h1>
            {cargoEnEdicion && (
              <div
                className="flex items-center justify-between rounded-2xl px-4 py-3 mb-4 text-sm font-medium"
                style={{ background: "#EDE9FE", color: "#7C3AED" }}
              >
                Editando un cargo ya cargado
                <button onClick={cancelarEdicionCarga} className="underline">Cancelar</button>
              </div>
            )}
            <div className="bg-white rounded-3xl p-5">
              <label className="block text-sm text-slate-600 mb-2">Tarjeta</label>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {(cargoEnEdicion ? tarjetas : tarjetas.filter((t) => t.titular === personaKey)).map((t) => {
                  const activa = formCompra.tarjetaId === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setFormCompra({ ...formCompra, tarjetaId: t.id })}
                      className="rounded-2xl py-3 text-sm font-semibold border-2 transition-colors flex items-center justify-center gap-2"
                      style={activa ? { borderColor: "#0D9488", background: "#ECFDF5", color: "#0D9488" } : { borderColor: "#E2E8F0", color: "#334155" }}
                    >
                      {logoDeTarjeta(t) && (
                        <span className="bg-white rounded-md p-0.5 border border-slate-200 flex shrink-0">
                          <img src={logoDeTarjeta(t)} alt="" className="h-5 w-auto block" />
                        </span>
                      )}
                      {t.nombre}
                    </button>
                  );
                })}
              </div>

              <label className="block text-sm text-slate-600 mb-2">Tipo de cargo</label>
              <div className="grid grid-cols-2 gap-2 mb-5">
                <button
                  onClick={() => setFormCompra({ ...formCompra, tipo: "cuotas" })}
                  className="rounded-2xl py-3 text-sm font-semibold border-2 transition-colors"
                  style={formCompra.tipo === "cuotas" ? { borderColor: "#0D9488", background: "#ECFDF5", color: "#0D9488" } : { borderColor: "#E2E8F0", color: "#334155" }}
                >
                  Cuotas
                </button>
                <button
                  onClick={() => setFormCompra({ ...formCompra, tipo: "recurrente" })}
                  className="rounded-2xl py-3 text-sm font-semibold border-2 transition-colors"
                  style={formCompra.tipo === "recurrente" ? { borderColor: "#0D9488", background: "#ECFDF5", color: "#0D9488" } : { borderColor: "#E2E8F0", color: "#334155" }}
                >
                  Recurrente
                </button>
              </div>

              <label className="block text-sm text-slate-600 mb-2">Detalle / Comercio</label>
              <input
                type="text"
                value={formCompra.descripcion}
                onChange={(e) => setFormCompra({ ...formCompra, descripcion: e.target.value })}
                placeholder="Dónde / qué se compró"
                className="w-full rounded-2xl bg-slate-50 px-4 py-3.5 text-base mb-5 outline-none"
              />

              <label className="block text-sm text-slate-600 mb-2">Mes de inicio</label>
              <select
                value={formCompra.mesInicio}
                onChange={(e) => setFormCompra({ ...formCompra, mesInicio: Number(e.target.value) })}
                className="w-full rounded-2xl bg-slate-50 px-4 py-3.5 text-base mb-5 outline-none"
              >
                {opcionesMes.map(({ m, i }) => (
                  <option key={m} value={i}>{m}</option>
                ))}
              </select>

              <label className="block text-sm text-slate-600 mb-2">
                {formCompra.tipo === "cuotas" ? "Importe Total" : "Monto mensual"}
              </label>
              <input
                type="number"
                value={formCompra.importe}
                onChange={(e) => setFormCompra({ ...formCompra, importe: e.target.value })}
                placeholder="0"
                className="w-full rounded-2xl bg-slate-50 px-4 py-3.5 text-base mb-5 outline-none"
              />

              {formCompra.tipo === "cuotas" && (
                <>
                  <label className="block text-sm text-slate-600 mb-2">Cantidad de Cuotas</label>
                  <input
                    type="number"
                    min={1}
                    value={formCompra.cuotas}
                    onChange={(e) => setFormCompra({ ...formCompra, cuotas: e.target.value })}
                    className="w-full rounded-2xl bg-slate-50 px-4 py-3.5 text-base mb-5 outline-none"
                  />
                </>
              )}

              {compraGuardadaOk && (
                <div
                  className="flex items-center gap-2 rounded-2xl px-4 py-3 mb-4 text-sm font-medium"
                  style={{ background: "#DCFCE7", color: "#16A34A" }}
                >
                  <CheckCircle2 size={18} />
                  {cargoEnEdicion ? "¡Cambios guardados!" : "¡Gasto cargado con éxito!"}
                </div>
              )}
              {erroGuardarCompra && (
                <div
                  className="flex items-center gap-2 rounded-2xl px-4 py-3 mb-4 text-sm font-medium"
                  style={{ background: "#FEE2E2", color: "#EF4444" }}
                >
                  No se pudo guardar. Probá de nuevo.
                </div>
              )}

              <button
                onClick={guardarCompra}
                className="w-full rounded-2xl py-4 text-white font-semibold flex items-center justify-center gap-2 transition-colors duration-300"
                style={{ background: compraGuardadaOk ? "#16A34A" : "#0D9488" }}
              >
                {compraGuardadaOk ? (
                  <>
                    <CheckCircle2 size={18} /> ¡Guardado!
                  </>
                ) : cargoEnEdicion ? (
                  <>
                    <Pencil size={18} /> Guardar Cambios
                  </>
                ) : (
                  <>
                    <Plus size={18} /> Guardar Compra
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {!cargando && seccionActiva === "tarjetas" && (
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Cuotas de Tarjetas</h1>

            {/* Tabla resumen de las 4 tarjetas */}
            <div className="bg-white rounded-3xl overflow-hidden mb-2">
              <div className="overflow-x-auto" ref={refTablaCuotas}>
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="sticky left-0 bg-white z-10 text-left px-4 py-3 font-medium text-slate-500 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                        Tarjeta
                      </th>
                      {mesesVista.map(({ m, i }) => (
                        <th key={m} className="px-4 py-3 font-medium whitespace-nowrap" style={i === mesIndex ? { color: "#0D9488", background: "#ECFDF5" } : { color: "#94A3B8" }}>
                          {m.split(" ")[0]}<br />{m.split(" ")[1]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tarjetas.map((t) => (
                      <tr key={t.id} className="border-t border-slate-100">
                        <td className="sticky left-0 bg-white z-10 px-4 py-3 whitespace-nowrap shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                          <span className="inline-block h-2.5 w-2.5 rounded-full mr-2" style={{ background: t.color }} />
                          {logoDeTarjeta(t) && <img src={logoDeTarjeta(t)} alt="" className="inline-block h-4 w-auto mr-1.5 align-middle rounded-sm" />}
                          <span className="font-semibold text-slate-800">{t.nombre}</span>
                        </td>
                        {mesesVista.map(({ m, i }) => {
                          const total = (cargosPorTarjeta[t.id] || []).reduce((acc, c) => acc + (valorCargoEnMes(c, i) || 0), 0);
                          return (
                            <td key={m} className="px-4 py-3 text-right font-semibold whitespace-nowrap" style={i === mesIndex ? { background: "#ECFDF5", color: "#0D9488" } : { color: "#1E293B" }}>
                              {total > 0 ? fmt(total) : "—"}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-center text-xs text-slate-400 mb-6">← Desliza para ver todos los meses →</p>

            {/* Un banner + lista de cargos por cada tarjeta */}
            {tarjetas.map((t) => {
              const todosLosCargos = cargosPorTarjeta[t.id] || [];
              // Solo se listan los cargos activos en el mes seleccionado en la cabecera —
              // los que ya terminaron (o todavía no arrancaron) quedan ocultos.
              const cargos = todosLosCargos.filter((c) => valorCargoEnMes(c, mesIndex) != null);
              const totalMes = cargos.reduce((acc, c) => acc + (valorCargoEnMes(c, mesIndex) || 0), 0);
              return (
                <div key={t.id} className="rounded-3xl overflow-hidden mb-5">
                  <div className="p-5 text-white" style={{ background: t.color }}>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">{t.nombre}</span>
                      {logoDeTarjeta(t) ? (
                        <span className="bg-white rounded-lg p-1 flex shrink-0 shadow-sm">
                          <img src={logoDeTarjeta(t)} alt={t.banco} className="h-8 w-auto block" />
                        </span>
                      ) : (
                        <CreditCard size={20} className="opacity-80" />
                      )}
                    </div>
                    <p className="text-3xl font-bold mt-2">{fmt(totalMes)}</p>
                    <p className="text-white/80 text-sm">Total del mes</p>
                  </div>
                  <div className="bg-white">
                    {cargos.length === 0 && <p className="text-center text-sm text-slate-400 py-6">Sin cargos activos este mes</p>}
                    {cargos.map((c) => {
                      const cuotaTotal = c.cuotaTotal || 1;
                      const mesInicioCargo = c.mesInicio || 0;
                      const cuotaActual = Math.min(mesIndex - mesInicioCargo + 1, cuotaTotal);
                      const progresoPct = Math.min((cuotaActual / cuotaTotal) * 100, 100);
                      const esRecurrente = cuotaTotal >= 100;
                      const totalCargo = esRecurrente ? c.monto : c.monto * cuotaTotal;
                      return (
                        <div key={c.id} className="px-5 py-4 border-b border-slate-100 last:border-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-base font-semibold text-slate-900">{c.nombre}</span>
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => abrirEdicionCargo(t.id, c)}
                                className="h-8 w-8 rounded-xl flex items-center justify-center"
                                style={{ background: "#EDE9FE", color: "#7C3AED" }}
                                aria-label="Editar"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => eliminarCargo(t.id, c.id)}
                                className="h-8 w-8 rounded-xl flex items-center justify-center"
                                style={{ background: "#FEE2E2", color: "#EF4444" }}
                                aria-label="Eliminar"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold" style={{ color: t.color }}>{cuotaActual}/{cuotaTotal}</span>
                            <span className="text-sm font-bold text-slate-800">{fmt(c.monto)}/mes</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                            <div className="h-full rounded-full" style={{ width: `${progresoPct}%`, background: t.color }} />
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} /> Desde: {mesEnOffset(mesInicioCargo)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={12} /> Termina: {mesEnOffset(mesInicioCargo + cuotaTotal - 1)}
                            </span>
                          </div>
                          <div className="flex items-center justify-end text-xs text-slate-500">
                            <span>Total: {fmt(totalCargo)}</span>
                          </div>
                        </div>
                      );
                    })}
                    {(() => {
                      // Cargos que todavía no empezaron a cobrarse: no suman en este mes, pero se ven acá para no "perderlos".
                      const proximos = todosLosCargos.filter((c) => (c.mesInicio || 0) > mesIndex);
                      if (proximos.length === 0) return null;
                      return (
                        <div className="bg-slate-50 px-5 py-3 border-t border-slate-100">
                          <p className="text-xs font-semibold text-slate-500 mb-2">Se cobran en los meses siguientes</p>
                          {proximos.map((c) => (
                            <div key={c.id} className="flex items-center justify-between gap-2 py-1.5">
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate">{c.nombre}</p>
                                <p className="text-xs text-slate-500">Desde {mesEnOffset(c.mesInicio || 0)} · {fmt(c.monto)}{c.cuotaTotal ? ` · ${c.cuotaTotal} cuota${c.cuotaTotal > 1 ? "s" : ""}` : "/mes"}</p>
                              </div>
                              <div className="flex gap-2 shrink-0">
                                <button onClick={() => abrirEdicionCargo(t.id, c)} className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: "#EDE9FE", color: "#7C3AED" }} aria-label="Editar">
                                  <Pencil size={14} />
                                </button>
                                <button onClick={() => eliminarCargo(t.id, c.id)} className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: "#FEE2E2", color: "#EF4444" }} aria-label="Eliminar">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!cargando && seccionActiva === "gastos" && (
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Gastos Mensuales</h1>
            {(() => {
              const sumaTarjetasDelMes = tarjetas.reduce((acc, t) => acc + totalTarjetaEnMes(cargosPorTarjeta[t.id], mesIndex), 0);
              const sumaGastosFijos = gastosMensuales.filter((g) => !g.esTarjeta).reduce((acc, g) => acc + g.monto, 0);
              const totalGeneral = sumaTarjetasDelMes + sumaGastosFijos;
              return (
                <div className="bg-white rounded-3xl p-5 mb-5">
                  <p className="text-sm text-slate-500 mb-1">Total general</p>
                  <p className="text-3xl font-bold text-slate-900 mb-3">{fmt(totalGeneral)}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Tarjetas ({nombreMes(mesIndex)})</span>
                    <span className="font-semibold text-slate-700">{fmt(sumaTarjetasDelMes)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-slate-500">Gastos fijos</span>
                    <span className="font-semibold text-slate-700">{fmt(sumaGastosFijos)}</span>
                  </div>
                </div>
              );
            })()}
            {[...categorias]
              .sort((a, b) => (a.id === "cat-tarjetas" ? -1 : b.id === "cat-tarjetas" ? 1 : 0))
              .map((cat) => {
              const items = gastosMensuales.filter((g) => g.categoriaId === cat.id);
              if (items.length === 0) return null;
              return (
                <div key={cat.id} className="mb-5">
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: cat.color }} />
                    <span className="text-sm font-semibold text-slate-700">{cat.nombre} ({items.length})</span>
                  </div>
                  <div className="bg-white rounded-3xl overflow-hidden">
                    {items.map((g, i) => (
                      <div
                        key={g.id}
                        className="flex items-center gap-3 px-4 py-3.5"
                        style={i < items.length - 1 ? { borderBottom: "1px solid #F1F5F9" } : undefined}
                      >
                        <button
                          onClick={() => togglePagado(g.id)}
                          className="h-6 w-6 rounded-full flex items-center justify-center shrink-0"
                          style={g.pagado ? { background: "#0D9488" } : { border: "2px solid #E2E8F0" }}
                        >
                          {g.pagado && <span className="text-white text-xs">✓</span>}
                        </button>
                        <span
                          className="flex-1 text-sm font-medium"
                          style={{ color: g.pagado ? "#94A3B8" : "#1E293B", textDecoration: g.pagado ? "line-through" : "none" }}
                        >
                          {g.nombre}
                        </span>
                        <span className="text-sm font-semibold text-slate-700 tabular-nums">
                          {fmt(g.esTarjeta ? totalTarjetaEnMes(cargosPorTarjeta[g.tarjetaId], mesIndex) : g.monto)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!cargando && seccionActiva === "ingresos" && (
          <div>
            <div className="flex items-start justify-between mb-1 gap-3">
              <h1 className="text-2xl font-bold text-slate-900">Ingresos</h1>
              <button
                onClick={() => setModalNuevoIngreso(true)}
                className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium text-white shrink-0 whitespace-nowrap"
                style={{ background: persona.color }}
              >
                <Plus size={14} /> Agregar ingreso
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-4">Sueldos de {nombreMes(mesIndex)}</p>

            <div className="space-y-4 mb-5">
              {Object.entries(sueldos).map(([key, s]) => {
                const colorPersona = PERSONAS[key].color;
                return (
                  <div key={key} className="bg-white rounded-3xl p-5">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="h-11 w-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${colorPersona}1F` }}>
                        <TrendingUp size={20} style={{ color: colorPersona }} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{s.titular}</p>
                        <p className="text-xs text-slate-500">Ingreso mensual</p>
                      </div>
                    </div>

                    <label className="block text-sm text-slate-600 mb-2">Salario base</label>
                    {editandoSueldo === key ? (
                      <input
                        autoFocus
                        type="number"
                        defaultValue={montoDelMes(s.montosPorMes, mesIndex)}
                        onBlur={(e) => {
                          const n = Number(e.target.value);
                          if (!isNaN(n) && n >= 0) actualizarMontoSueldo(key, n);
                          setEditandoSueldo(null);
                        }}
                        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                        className="w-full rounded-2xl bg-slate-50 px-4 py-3.5 text-xl font-bold mb-5 outline-none"
                        style={{ color: "#0F172A" }}
                      />
                    ) : (
                      <p onClick={() => setEditandoSueldo(key)} className="text-2xl font-bold text-slate-900 mb-5">
                        {fmt(montoDelMes(s.montosPorMes, mesIndex))}
                      </p>
                    )}

                    <label className="block text-sm text-slate-600 mb-2">% de aumento desde {nombreMes(mesIndex)}</label>
                    <div className="flex gap-2 mb-4">
                      <input
                        type="number"
                        step="0.01"
                        value={aumentoPorcPorPersona[key]}
                        onChange={(e) => setAumentoPorcPorPersona((prev) => ({ ...prev, [key]: e.target.value }))}
                        placeholder="Ej: 4.5"
                        className="flex-1 rounded-2xl bg-slate-50 px-4 py-3 text-base outline-none"
                      />
                      <button
                        onClick={() => aplicarAumentoSueldo(key)}
                        disabled={!aumentoPorcPorPersona[key]}
                        className="rounded-2xl px-5 text-sm font-semibold text-white disabled:opacity-30"
                        style={{ background: colorPersona }}
                      >
                        Aplicar
                      </button>
                    </div>

                    {s.aumentosPorMes[mesIndex] && (
                      <div className="rounded-2xl px-4 py-3 text-sm" style={{ background: `${colorPersona}14`, color: colorPersona }}>
                        Aumento aplicado (+{s.aumentosPorMes[mesIndex].porc}%): {fmt(s.aumentosPorMes[mesIndex].anterior)} → {fmt(s.aumentosPorMes[mesIndex].nuevo)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Otros ingresos */}
            {ingresosExtra.length > 0 && (
              <>
                <h3 className="text-sm font-semibold mb-2 text-slate-700">
                  Otros ingresos <span className="font-normal text-slate-400">({ingresosExtra.length})</span>
                </h3>
                <div className="bg-white rounded-3xl overflow-hidden">
                  {ingresosExtra.map((ig, i, arr) => (
                    <div
                      key={ig.id}
                      className="flex items-center gap-3 px-4 py-3.5"
                      style={i < arr.length - 1 ? { borderBottom: "1px solid #F1F5F9" } : undefined}
                    >
                      <div className="h-9 w-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "#DCFCE7" }}>
                        <HandCoins size={16} style={{ color: "#16A34A" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        {editandoIngresoExtra === `${ig.id}:nombre` ? (
                          <input
                            autoFocus
                            type="text"
                            value={ig.nombre}
                            onChange={(e) => actualizarCampoIngresoExtra(ig.id, "nombre", e.target.value)}
                            onBlur={() => setEditandoIngresoExtra(null)}
                            onKeyDown={(e) => e.key === "Enter" && setEditandoIngresoExtra(null)}
                            className="text-sm font-medium border-b-2 outline-none w-full"
                            style={{ borderColor: persona.color }}
                          />
                        ) : (
                          <p
                            className="text-sm font-medium text-slate-900"
                            onClick={() => setEditandoIngresoExtra(`${ig.id}:nombre`)}
                          >
                            {ig.nombre}
                          </p>
                        )}
                      </div>
                      {editandoIngresoExtra === `${ig.id}:monto` ? (
                        <input
                          autoFocus
                          type="number"
                          defaultValue={ig.monto}
                          onBlur={(e) => {
                            const n = Number(e.target.value);
                            if (!isNaN(n) && n >= 0) actualizarCampoIngresoExtra(ig.id, "monto", n);
                            setEditandoIngresoExtra(null);
                          }}
                          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                          className="w-24 text-right text-sm font-semibold border-b-2 outline-none tabular-nums shrink-0"
                          style={{ borderColor: persona.color }}
                        />
                      ) : (
                        <span
                          className="text-sm font-semibold text-slate-700 tabular-nums shrink-0"
                          onClick={() => setEditandoIngresoExtra(`${ig.id}:monto`)}
                        >
                          {fmt(ig.monto)}
                        </span>
                      )}
                      <button
                        onClick={() => eliminarIngresoExtra(ig.id)}
                        className="shrink-0 opacity-50 active:opacity-90"
                        aria-label={`Eliminar ${ig.nombre}`}
                      >
                        <Trash2 size={15} className="text-slate-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Modal: nuevo ingreso extra */}
        {modalNuevoIngreso && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: "rgba(15,23,42,0.35)" }}
            onClick={() => setModalNuevoIngreso(false)}
          >
            <div className="w-full bg-white rounded-t-3xl p-5" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">Nuevo ingreso</h3>
                <button onClick={() => setModalNuevoIngreso(false)} className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                  <X size={16} className="text-slate-500" />
                </button>
              </div>

              <label className="block text-sm text-slate-600 mb-2">Descripción</label>
              <input
                type="text"
                value={formIngreso.nombre}
                onChange={(e) => setFormIngreso({ ...formIngreso, nombre: e.target.value })}
                placeholder="Ej: Alquiler que cobramos, Freelance..."
                className="w-full rounded-2xl bg-slate-50 px-4 py-3.5 text-base mb-4 outline-none"
              />

              <label className="block text-sm text-slate-600 mb-2">Monto mensual</label>
              <input
                type="number"
                value={formIngreso.monto}
                onChange={(e) => setFormIngreso({ ...formIngreso, monto: e.target.value })}
                placeholder="0"
                className="w-full rounded-2xl bg-slate-50 px-4 py-3.5 text-base mb-5 outline-none"
              />

              <button
                onClick={agregarIngresoExtra}
                className="w-full rounded-2xl py-4 text-white font-semibold"
                style={{ background: persona.color }}
              >
                Guardar
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

