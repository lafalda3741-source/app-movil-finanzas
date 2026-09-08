import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";

// ============================================================
// Configuración por persona. Cada instalación (Ariel / Cielo)
// se despliega con una variable de entorno distinta:
//   VITE_PERSONA=ariel   ó   VITE_PERSONA=cielo
// Todo lo demás del código es idéntico para las dos apps.
// ============================================================
const PERSONA_ACTUAL = (typeof import.meta !== "undefined" && import.meta.env?.VITE_PERSONA) || "ariel";

const PERSONAS = {
  ariel: { nombre: "Ariel", pin: "1234", color: "#2563EB", tarjetasPropias: ["visa-ariel", "cabal-ariel"] },
  cielo: { nombre: "Cielo", pin: "1234", color: "#8B5CF6", tarjetasPropias: ["visa-cielo", "cabal-cielo"] },
};
const persona = PERSONAS[PERSONA_ACTUAL] || PERSONAS.ariel;

// Mismas 4 tarjetas y mismos ids que el Panel de Control (tabla cargos_tarjeta compartida)
const TARJETAS = [
  { id: "visa-ariel", nombre: "Visa Ariel", color: "#2563EB" },
  { id: "visa-cielo", nombre: "Visa Cielo", color: "#8B5CF6" },
  { id: "cabal-ariel", nombre: "Cabal Ariel", color: "#10B981" },
  { id: "cabal-cielo", nombre: "Cabal Cielo", color: "#F97316" },
];

const MESES = ["Ago 2026", "Sep 2026", "Oct 2026", "Nov 2026", "Dic 2026", "Ene 2027", "Feb 2027", "Mar 2027", "Abr 2027"];
const MESES_ABREV = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function mesEnOffset(offset) {
  const base = new Date(2026, 7, 1); // Ago 2026 = offset 0
  const d = new Date(base.getFullYear(), base.getMonth() + offset, 1);
  return `${MESES_ABREV[d.getMonth()]} ${d.getFullYear()}`;
}

const fmt = (n) => (Number(n) || 0).toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

// Valor de un cargo en un mes dado (igual que en el Panel de Control)
function valorCargoEnMes(cargo, mesIndex) {
  if (cargo.cuotaTotal == null) return cargo.monto;
  return mesIndex < cargo.cuotaTotal ? cargo.monto : null;
}

const SECCIONES = [
  { id: "carga", label: "Carga de Compras", icon: Plus },
  { id: "gastos", label: "Gastos Mensuales", icon: ListChecks },
  { id: "tarjetas", label: "Cuotas de Tarjetas", icon: CreditCard },
  { id: "ingresos", label: "Ingresos", icon: HandCoins },
];

export default function AppMovil() {
  const [desbloqueado, setDesbloqueado] = useState(false);
  const [pinIngresado, setPinIngresado] = useState("");
  const [pinError, setPinError] = useState(false);

  const [menuAbierto, setMenuAbierto] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState("carga");
  const [mesIndex, setMesIndex] = useState(1); // Sep 2026, igual que el Panel de Control

  const [cargando, setCargando] = useState(true);
  const [cargosPorTarjeta, setCargosPorTarjeta] = useState({});
  const [saldosTarjetas, setSaldosTarjetas] = useState({}); // { [tarjetaId]: saldo } — viene de la tabla "tarjetas", mantenida por el trigger
  const [gastosMensuales, setGastosMensuales] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [sueldos, setSueldos] = useState({
    ariel: { titular: "Ariel", montosPorMes: Array(MESES.length).fill(0), aumentosPorMes: {} },
    cielo: { titular: "Cielo", montosPorMes: Array(MESES.length).fill(0), aumentosPorMes: {} },
  });
  const [aumentoPorcPorPersona, setAumentoPorcPorPersona] = useState({ ariel: "", cielo: "" });
  const [editandoSueldo, setEditandoSueldo] = useState(null); // "ariel" | "cielo" | null
  const [editandoAumento, setEditandoAumento] = useState(null); // "ariel" | "cielo" | null

  // ---- PIN ----
  const ingresarDigito = (d) => {
    if (pinError) setPinError(false);
    setPinIngresado((prev) => {
      if (prev.length >= 4) return prev;
      const nuevo = prev + d;
      if (nuevo.length === 4) {
        if (nuevo === persona.pin) {
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
        const { data: tarjetasDb } = await supabase.from("tarjetas").select("id, saldo");
        if (tarjetasDb && tarjetasDb.length > 0) {
          const saldos = {};
          tarjetasDb.forEach((t) => (saldos[t.id] = Number(t.saldo) || 0));
          setSaldosTarjetas(saldos);
        }

        const { data: cats } = await supabase.from("categorias_gasto").select("*");
        setCategorias((cats || []).map((c) => ({ id: c.id, nombre: c.nombre, color: c.color })));

        const { data: cargosDb } = await supabase.from("cargos_tarjeta").select("*").order("orden");
        const agrupados = {};
        TARJETAS.forEach((t) => (agrupados[t.id] = []));
        (cargosDb || []).forEach((c) => {
          if (!agrupados[c.tarjeta_id]) agrupados[c.tarjeta_id] = [];
          agrupados[c.tarjeta_id].push({ id: c.id, nombre: c.nombre, monto: Number(c.monto), cuotaTotal: c.cuota_total });
        });
        setCargosPorTarjeta(agrupados);

        const { data: gastosDb } = await supabase.from("gastos_mensuales").select("*");
        setGastosMensuales(
          (gastosDb || []).map((g) => ({
            id: g.id,
            nombre: g.nombre,
            monto: Number(g.monto),
            categoriaId: g.categoria_id,
            pagado: g.pagado,
          }))
        );

        const { data: sueldosDb } = await supabase.from("sueldos").select("*");
        const nuevosSueldos = {
          ariel: { titular: "Ariel", montosPorMes: Array(MESES.length).fill(0), aumentosPorMes: {} },
          cielo: { titular: "Cielo", montosPorMes: Array(MESES.length).fill(0), aumentosPorMes: {} },
        };
        const faltantes = [];
        for (const key of ["ariel", "cielo"]) {
          const fila = (sueldosDb || []).find((s) => s.persona === key);
          if (fila) {
            nuevosSueldos[key] = {
              titular: fila.titular,
              montosPorMes: fila.montos_por_mes && fila.montos_por_mes.length ? fila.montos_por_mes : Array(MESES.length).fill(0),
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
      } catch (err) {
        console.error("Error cargando datos compartidos:", err);
      } finally {
        setCargando(false);
      }
    };
    if (desbloqueado) cargarDatos();
  }, [desbloqueado]);

  // ---- Carga de Compras ----
  const [formCompra, setFormCompra] = useState({
    tarjetaId: persona.tarjetasPropias[0],
    descripcion: "",
    importe: "",
    cuotas: "1",
  });

  const guardarCompra = async () => {
    if (!formCompra.descripcion.trim() || !formCompra.importe) return;
    const cuotaTotal = Number(formCompra.cuotas) || 1;
    const montoPorCuota = Number(formCompra.importe) / cuotaTotal;
    const nuevo = { id: `c${Date.now()}`, nombre: formCompra.descripcion.trim(), monto: montoPorCuota, cuotaTotal };

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
      orden: (cargosPorTarjeta[formCompra.tarjetaId] || []).length,
    });
    if (error) console.error("Error guardando compra:", error);

    setFormCompra({ tarjetaId: formCompra.tarjetaId, descripcion: "", importe: "", cuotas: "1" });
  };

  // ---- Cuotas de Tarjetas: editar / eliminar cargo ----
  const eliminarCargo = async (tarjetaId, cargoId) => {
    setCargosPorTarjeta((prev) => ({ ...prev, [tarjetaId]: prev[tarjetaId].filter((c) => c.id !== cargoId) }));
    const { error } = await supabase.from("cargos_tarjeta").delete().eq("id", cargoId);
    if (error) console.error("Error eliminando cargo:", error);
  };

  const [editandoCargo, setEditandoCargo] = useState(null); // "tarjetaId:cargoId"
  const actualizarNombreCargo = async (tarjetaId, cargoId, nombre) => {
    setCargosPorTarjeta((prev) => ({
      ...prev,
      [tarjetaId]: prev[tarjetaId].map((c) => (c.id === cargoId ? { ...c, nombre } : c)),
    }));
    const { error } = await supabase.from("cargos_tarjeta").update({ nombre }).eq("id", cargoId);
    if (error) console.error("Error actualizando cargo:", error);
  };

  // ---- Gastos Mensuales: marcar pagado ----
  const togglePagado = async (id) => {
    let nuevoValor;
    setGastosMensuales((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          nuevoValor = !g.pagado;
          return { ...g, pagado: nuevoValor };
        }
        return g;
      })
    );
    const { error } = await supabase.from("gastos_mensuales").update({ pagado: nuevoValor }).eq("id", id);
    if (error) console.error("Error actualizando pagado:", error);
  };

  // ---- Ingresos: sueldos de Ariel y Cielo (los dos, ambas apps ven y editan los dos) ----
  const actualizarMontoSueldo = async (key, valor) => {
    const nuevosMontos = [...sueldos[key].montosPorMes];
    nuevosMontos[mesIndex] = valor;
    setSueldos((prev) => ({ ...prev, [key]: { ...prev[key], montosPorMes: nuevosMontos } }));
    const { error } = await supabase.from("sueldos").update({ montos_por_mes: nuevosMontos }).eq("persona", key);
    if (error) console.error("Error actualizando sueldo:", error);
  };

  const aplicarAumentoSueldo = async (key) => {
    const porc = Number(aumentoPorcPorPersona[key]);
    if (!porc) return;
    const s = sueldos[key];
    const anterior = s.montosPorMes[mesIndex];
    const nuevo = Math.round(anterior * (1 + porc / 100));
    const nuevosMontos = [...s.montosPorMes];
    for (let i = mesIndex; i < nuevosMontos.length; i++) nuevosMontos[i] = nuevo;
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
    const targetTh = ths[mesIndex + 1];
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
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => setMenuAbierto(true)} className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <Menu size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-bold truncate leading-tight">Finanzas Familiar</p>
            <p className="text-white/75 text-xs">{persona.nombre}</p>
          </div>
          <button
            onClick={() => setMesIndex((i) => Math.max(0, i - 1))}
            disabled={mesIndex === 0}
            className="h-9 w-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0 disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="bg-white/15 rounded-xl px-3 py-2 text-sm font-semibold whitespace-nowrap shrink-0">{MESES[mesIndex]}</span>
          <button
            onClick={() => setMesIndex((i) => Math.min(MESES.length - 1, i + 1))}
            disabled={mesIndex === MESES.length - 1}
            className="h-9 w-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0 disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="flex items-center gap-1.5 px-4 pb-2.5 text-white/90 text-sm">
          {seccionInfo && <seccionInfo.icon size={14} />}
          {seccionInfo?.label}
        </div>
      </header>

      {/* Contenido */}
      <main className="p-4 pb-10">
        {cargando && <p className="text-center text-sm text-slate-400 py-10">Cargando datos...</p>}

        {!cargando && seccionActiva === "carga" && (
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Carga Rápida de Compras</h1>
            <div className="bg-white rounded-3xl p-5">
              <label className="block text-sm text-slate-600 mb-2">Tarjeta</label>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {persona.tarjetasPropias.map((tid) => {
                  const t = TARJETAS.find((x) => x.id === tid);
                  const activa = formCompra.tarjetaId === tid;
                  return (
                    <button
                      key={tid}
                      onClick={() => setFormCompra({ ...formCompra, tarjetaId: tid })}
                      className="rounded-2xl py-3 text-sm font-semibold border-2 transition-colors"
                      style={activa ? { borderColor: "#0D9488", background: "#ECFDF5", color: "#0D9488" } : { borderColor: "#E2E8F0", color: "#334155" }}
                    >
                      {t.nombre}
                    </button>
                  );
                })}
              </div>

              <label className="block text-sm text-slate-600 mb-2">Detalle / Comercio</label>
              <input
                type="text"
                value={formCompra.descripcion}
                onChange={(e) => setFormCompra({ ...formCompra, descripcion: e.target.value })}
                placeholder="Dónde / qué se compró"
                className="w-full rounded-2xl bg-slate-50 px-4 py-3.5 text-base mb-5 outline-none"
              />

              <label className="block text-sm text-slate-600 mb-2">Importe Total</label>
              <input
                type="number"
                value={formCompra.importe}
                onChange={(e) => setFormCompra({ ...formCompra, importe: e.target.value })}
                placeholder="0"
                className="w-full rounded-2xl bg-slate-50 px-4 py-3.5 text-base mb-5 outline-none"
              />

              <label className="block text-sm text-slate-600 mb-2">Cantidad de Cuotas</label>
              <input
                type="number"
                min={1}
                value={formCompra.cuotas}
                onChange={(e) => setFormCompra({ ...formCompra, cuotas: e.target.value })}
                className="w-full rounded-2xl bg-slate-50 px-4 py-3.5 text-base mb-5 outline-none"
              />

              <button
                onClick={guardarCompra}
                className="w-full rounded-2xl py-4 text-white font-semibold flex items-center justify-center gap-2"
                style={{ background: "#0D9488" }}
              >
                <Plus size={18} /> Guardar Compra
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
                      {MESES.slice(0, 5).map((m, i) => (
                        <th key={m} className="px-4 py-3 font-medium whitespace-nowrap" style={i === mesIndex ? { color: "#0D9488", background: "#ECFDF5" } : { color: "#94A3B8" }}>
                          {m.split(" ")[0]}<br />{m.split(" ")[1]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TARJETAS.map((t) => (
                      <tr key={t.id} className="border-t border-slate-100">
                        <td className="sticky left-0 bg-white z-10 px-4 py-3 whitespace-nowrap shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                          <span className="inline-block h-2.5 w-2.5 rounded-full mr-2" style={{ background: t.color }} />
                          <span className="font-semibold text-slate-800">{t.nombre}</span>
                        </td>
                        {MESES.slice(0, 5).map((m, i) => {
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
            {TARJETAS.map((t) => {
              const cargos = cargosPorTarjeta[t.id] || [];
              const totalMes = cargos.reduce((acc, c) => acc + (valorCargoEnMes(c, mesIndex) || 0), 0);
              return (
                <div key={t.id} className="rounded-3xl overflow-hidden mb-5">
                  <div className="p-5 text-white" style={{ background: t.color }}>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">{t.nombre}</span>
                      <CreditCard size={20} className="opacity-80" />
                    </div>
                    <p className="text-3xl font-bold mt-2">{fmt(totalMes)}</p>
                    <p className="text-white/80 text-sm">Total del mes</p>
                  </div>
                  <div className="bg-white">
                    {cargos.length === 0 && <p className="text-center text-sm text-slate-400 py-6">Sin cargos cargados</p>}
                    {cargos.map((c) => {
                      const cuotaTotal = c.cuotaTotal || 1;
                      const progresoPct = Math.min((1 / cuotaTotal) * 100, 100);
                      const esRecurrente = cuotaTotal >= 100;
                      const totalCargo = esRecurrente ? c.monto : c.monto * cuotaTotal;
                      return (
                        <div key={c.id} className="px-5 py-4 border-b border-slate-100 last:border-0">
                          <div className="flex items-center justify-between mb-1.5">
                            {editandoCargo === c.id ? (
                              <input
                                autoFocus
                                type="text"
                                value={c.nombre}
                                onChange={(e) => actualizarNombreCargo(t.id, c.id, e.target.value)}
                                onBlur={() => setEditandoCargo(null)}
                                onKeyDown={(e) => e.key === "Enter" && setEditandoCargo(null)}
                                className="text-base font-semibold border-b-2 outline-none flex-1 mr-2"
                                style={{ borderColor: t.color }}
                              />
                            ) : (
                              <span className="text-base font-semibold text-slate-900">{c.nombre}</span>
                            )}
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => setEditandoCargo(c.id)}
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
                            <span className="text-sm font-semibold" style={{ color: t.color }}>1/{cuotaTotal}</span>
                            <span className="text-sm font-bold text-slate-800">{fmt(c.monto)}/mes</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                            <div className="h-full rounded-full" style={{ width: `${progresoPct}%`, background: t.color }} />
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} /> Termina: {mesEnOffset(cuotaTotal - 1)}
                            </span>
                            <span>Total: {fmt(totalCargo)}</span>
                          </div>
                        </div>
                      );
                    })}
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
              const sumaSaldosTarjetas = Object.values(saldosTarjetas).reduce((acc, s) => acc + (Number(s) || 0), 0);
              const sumaGastosFijos = gastosMensuales.filter((g) => !g.esTarjeta).reduce((acc, g) => acc + g.monto, 0);
              const totalGeneral = sumaSaldosTarjetas + sumaGastosFijos;
              return (
                <div className="bg-white rounded-3xl p-5 mb-5">
                  <p className="text-sm text-slate-500 mb-1">Total general</p>
                  <p className="text-3xl font-bold text-slate-900 mb-3">{fmt(totalGeneral)}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Tarjetas (saldo)</span>
                    <span className="font-semibold text-slate-700">{fmt(sumaSaldosTarjetas)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-slate-500">Gastos fijos</span>
                    <span className="font-semibold text-slate-700">{fmt(sumaGastosFijos)}</span>
                  </div>
                </div>
              );
            })()}
            {categorias.map((cat) => {
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
                        <span className="text-sm font-semibold text-slate-700 tabular-nums">{fmt(g.monto)}</span>
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
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Ingresos</h1>
            <p className="text-sm text-slate-500 mb-4">Sueldos de {MESES[mesIndex]}</p>

            <div className="space-y-4">
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
                        defaultValue={s.montosPorMes[mesIndex]}
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
                        {fmt(s.montosPorMes[mesIndex])}
                      </p>
                    )}

                    <label className="block text-sm text-slate-600 mb-2">% de aumento desde {MESES[mesIndex]}</label>
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
          </div>
        )}
      </main>
    </div>
  );
}
