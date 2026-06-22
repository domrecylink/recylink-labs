// Motor de cálculo de emisiones GEI — selectores compartidos por las 3 pantallas de Impacto.

// Ids de sucursales sin factor de emisión: reportan electricidad en un sistema
// eléctrico distinto del SEN sin factor cargado. Se deriva en vivo de la config
// (la app es data-driven: las sucursales llegan de onboarding / Google Sheets).
function sucSinFactorIds(state) {
  return (state.configSucursales || []).filter(s => {
    const elec = s.items && s.items.electricidad;
    if (!elec || !elec.activo) return false;
    return (elec.subcats || []).some(sc => sc.sistemaElectrico && sc.sistemaElectrico !== "SEN");
  }).map(s => s.id);
}

// Factor vigente para una sucursal+key: override personalizado o valor de empresa.
function factorFor(state, sucId, key) {
  const ov = state.emissions.factoresSucursal[sucId];
  if (ov && ov[key]) return ov[key].value;
  const emp = state.emissions.factoresEmpresa[key];
  return emp ? emp.value : null;
}

function isCustomFactor(state, sucId, key) {
  const ov = state.emissions.factoresSucursal[sucId];
  return !!(ov && ov[key]);
}

function sucByName(state) {
  const m = {};
  state.configSucursales.forEach(s => { m[s.nombre] = s; });
  return m;
}

// Convierte cada registro activo en su emisión tCO2e usando el factor vigente.
function emissionsByRecord(state) {
  const byName = sucByName(state);
  const sinFactorIds = sucSinFactorIds(state);
  return state.records
    .filter(r => r.estado !== "eliminada")
    .map(r => {
      const suc = byName[r.sucursal];
      const sucId = suc ? suc.id : null;
      const key = r.type === "combustible" ? r.subcat : r.type;
      const f = factorFor(state, sucId, key);
      const def = state.emissions.factoresEmpresa[key];
      const scope = def ? def.scope : (r.type === "electricidad" ? 2 : r.type === "agua" ? 3 : 1);
      const sinFactor = sucId != null && sinFactorIds.includes(sucId);
      const tco2e = (f != null && !sinFactor) ? (r.cantidad * f) / 1000 : 0;
      return { ...r, sucId, factor: f, scope, tco2e, sinFactor };
    });
}

// Emisiones de refrigerantes (Alcance 1) → filas tipo {sucId, sucursal, tipo, gwp, cargaKg, mes, tco2e}
function refrigEmissionRows(state) {
  const gwpById = {};
  REFRIGERANTES_CATALOG.forEach(r => { gwpById[r.id] = r.gwp; });
  const rows = [];
  state.configSucursales.forEach(suc => {
    const list = state.emissions.refrigerantesSucursal[suc.id] || [];
    list.forEach(rf => {
      const gwp = gwpById[rf.tipo] || 0;
      rows.push({
        sucId: suc.id, sucursal: suc.nombre,
        tipo: rf.tipo, gwp, cargaKg: rf.cargaKg, mes: rf.mes,
        tco2e: (rf.cargaKg * gwp) / 1000,
      });
    });
  });
  return rows;
}

// Agregado total por alcance + por categoría (electricidad/combustible/agua/refrigerantes)
function emissionsAggregate(state) {
  const recs = emissionsByRecord(state);
  const refs = refrigEmissionRows(state);

  const byScope = { 1: 0, 2: 0, 3: 0 };
  const byCat = { electricidad: 0, combustible: 0, agua: 0, refrigerantes: 0 };

  recs.forEach(r => {
    byScope[r.scope] += r.tco2e;
    byCat[r.type] += r.tco2e;
  });
  refs.forEach(r => { byScope[1] += r.tco2e; byCat.refrigerantes += r.tco2e; });

  const total = byScope[1] + byScope[2] + byScope[3];
  return { total, byScope, byCat, recs, refs };
}

// Evolución mensual del total tCO2e (12 meses), opcionalmente filtrada por alcance.
function emissionsByMonth(state, scopeFilter = "all") {
  const recs = emissionsByRecord(state);
  const refs = refrigEmissionRows(state);
  const data = months.map(mk => {
    let v = 0;
    recs.forEach(r => {
      if (r.date.startsWith(mk) && (scopeFilter === "all" || r.scope === +scopeFilter)) v += r.tco2e;
    });
    if (scopeFilter === "all" || +scopeFilter === 1) {
      refs.forEach(r => { if (r.mes === mk) v += r.tco2e; });
    }
    return v;
  });
  return { months: months.slice(), data };
}

// tCO2e por sucursal (incluye refrigerantes), marca activas/inactivas.
function emissionsBySucursal(state, scopeFilter = "all") {
  const recs = emissionsByRecord(state);
  const refs = refrigEmissionRows(state);
  const sinFactorIds = sucSinFactorIds(state);
  return state.configSucursales.map(suc => {
    let v = 0;
    recs.forEach(r => {
      if (r.sucId === suc.id && (scopeFilter === "all" || r.scope === +scopeFilter)) v += r.tco2e;
    });
    if (scopeFilter === "all" || +scopeFilter === 1) {
      refs.forEach(r => { if (r.sucId === suc.id) v += r.tco2e; });
    }
    const sinFactor = sinFactorIds.includes(suc.id);
    return { id: suc.id, nombre: suc.nombre, activa: suc.activa, sinFactor, tco2e: v };
  });
}

// Lista de nombres de sucursales sin factor configurado.
function sucursalesSinFactorNombres(state) {
  const byId = {};
  state.configSucursales.forEach(s => { byId[s.id] = s; });
  return sucSinFactorIds(state)
    .map(id => byId[id])
    .filter(s => s && s.activa)
    .map(s => s.nombre);
}

// Overrides con revisión pendiente: empresa cambió el factor base.
function pendingOverrides(state) {
  const out = [];
  const byId = {};
  state.configSucursales.forEach(s => { byId[s.id] = s; });
  Object.entries(state.emissions.factoresSucursal).forEach(([sucId, factors]) => {
    Object.entries(factors).forEach(([key, f]) => {
      if (f.pendingReview) {
        out.push({
          sucId, sucNombre: byId[sucId] ? byId[sucId].nombre : sucId,
          key, label: state.emissions.factoresEmpresa[key] ? state.emissions.factoresEmpresa[key].label : key,
          sucValue: f.value,
          empValue: state.emissions.factoresEmpresa[key] ? state.emissions.factoresEmpresa[key].value : null,
          unit: state.emissions.factoresEmpresa[key] ? state.emissions.factoresEmpresa[key].unit : "",
        });
      }
    });
  });
  return out;
}

const SCOPE_COLORS = {
  1: { stroke: "var(--rl-fuel)",        fill: "var(--rl-fuel-bg)" },
  2: { stroke: "var(--rl-primary-900)", fill: "var(--rl-primary-50)" },
  3: { stroke: "var(--rl-success-700)", fill: "var(--rl-success-50)" },
};
const CAT_META = {
  electricidad:  { label: "Electricidad",  icon: "bolt",              color: "var(--rl-primary-900)", bg: "var(--rl-primary-50)" },
  combustible:   { label: "Combustibles",  icon: "local_gas_station", color: "var(--rl-fuel)",        bg: "var(--rl-fuel-bg)" },
  agua:          { label: "Agua",          icon: "water_drop",        color: "var(--rl-success-700)", bg: "var(--rl-success-50)" },
  refrigerantes: { label: "Refrigerantes", icon: "snowflake",         color: "#6366F1",               bg: "#EEF0FE" },
};

Object.assign(window, {
  sucSinFactorIds, factorFor, isCustomFactor, emissionsByRecord, refrigEmissionRows,
  emissionsAggregate, emissionsByMonth, emissionsBySucursal,
  sucursalesSinFactorNombres, pendingOverrides,
  SCOPE_COLORS, CAT_META,
});
