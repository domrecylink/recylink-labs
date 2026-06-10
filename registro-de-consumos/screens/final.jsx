// Versiones FINALES — Landing (variante B refinada) + Dashboard (variante A refinada).
// Sabor más cercano al sistema de marca Recylink: card con sombra cálida suave,
// chips de subcategoría con header de tipo, insight callout, jerarquía limpia.

// =====================================================================
// LANDING — wizard de 2 opciones, refinado
// =====================================================================
const LandingFinal = () => (
  <div className="wf-screen">
    <EmbedBar host="acme-corp.host / Recylink · Consumos" />
    <div className="wf-body" style={{ alignItems: "center", justifyContent: "center", gap: 28, paddingTop: 36 }}>

      {/* Context strip: empresa + periodo + estado */}
      <div className="row" style={{
        padding: "8px 14px",
        background: "var(--rl-gray-50)",
        border: "1px solid var(--rl-border-subtle)",
        borderRadius: 999,
        gap: 16,
      }}>
        <span className="row" style={{ gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--rl-success-500)" }}></span>
          <span style={{ font: "600 12px/1 var(--rl-font-display)", color: "var(--rl-fg)" }}>Acme Corp</span>
        </span>
        <span style={{ width: 1, height: 14, background: "var(--rl-gray-300)" }}></span>
        <span style={{ font: "600 12px/1 var(--rl-font-display)", color: "var(--rl-fg)" }}>Marzo 2026</span>
        <span style={{ width: 1, height: 14, background: "var(--rl-gray-300)" }}></span>
        <span className="wf-hint">12 registros este mes · 4 documentos pendientes</span>
      </div>

      {/* Pregunta principal */}
      <div style={{ textAlign: "center", maxWidth: 580 }}>
        <div className="wf-h1" style={{ fontSize: 34, lineHeight: "42px" }}>
          ¿Qué quieres hacer hoy?
        </div>
        <div className="wf-muted" style={{ marginTop: 10, fontSize: 15, lineHeight: "22px" }}>
          Elige cómo prefieres ingresar tus consumos de este mes. Puedes volver
          atrás en cualquier momento.
        </div>
      </div>

      {/* 2 círculos: opción primaria (filled brand) + alternativa (outlined dashed) */}
      <div style={{ display: "flex", gap: 56, justifyContent: "center", alignItems: "flex-start", marginTop: 4 }}>

        {/* Opción 1 — primaria, llamada principal */}
        <button style={{
          all: "unset", cursor: "default",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: 240,
        }}>
          <div style={{
            position: "relative",
            width: 180, height: 180, borderRadius: "50%",
            background: "var(--rl-action)",
            color: "#FFF",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: "0 12px 32px -8px rgba(0,105,166,0.45), 0 0 0 8px var(--rl-primary-50)",
          }}>
            <span style={{
              width: 52, height: 52, borderRadius: 12,
              background: "rgba(255,255,255,0.16)",
              display: "flex", alignItems: "center", justifyContent: "center",
              font: "400 26px/1 var(--rl-font-display)",
            }}>✎</span>
            <div style={{ font: "700 16px/22px var(--rl-font-display)", letterSpacing: "-0.01em" }}>
              Registrar a mano
            </div>
            {/* atajo de teclado */}
            <span style={{
              position: "absolute", top: 14, right: 14,
              width: 24, height: 24, borderRadius: 6,
              background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              font: "700 11px/1 var(--rl-font-mono)", color: "#FFF",
            }}>1</span>
          </div>
          <div style={{ textAlign: "center" }}>
            <div className="wf-hint" style={{ fontSize: 13, lineHeight: "18px" }}>
              Un consumo a la vez con un formulario corto.
            </div>
            <div className="wf-hint" style={{ marginTop: 2, fontSize: 12 }}>
              ~ 1 min · validación inline
            </div>
          </div>
        </button>

        {/* Opción 2 — alternativa */}
        <button style={{
          all: "unset", cursor: "default",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: 240,
        }}>
          <div style={{
            position: "relative",
            width: 180, height: 180, borderRadius: "50%",
            background: "#FFFFFF",
            color: "var(--rl-fg)",
            border: "2px dashed var(--rl-gray-400)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <span style={{
              width: 52, height: 52, borderRadius: 12,
              background: "var(--rl-gray-50)",
              border: "1.5px solid var(--rl-gray-200)",
              display: "flex", alignItems: "center", justifyContent: "center",
              font: "400 26px/1 var(--rl-font-display)", color: "var(--rl-fg-muted)",
            }}>⇪</span>
            <div style={{ font: "700 16px/22px var(--rl-font-display)", letterSpacing: "-0.01em" }}>
              Subir documento
            </div>
            <span style={{
              position: "absolute", top: 14, right: 14,
              width: 24, height: 24, borderRadius: 6,
              background: "var(--rl-gray-100)",
              display: "flex", alignItems: "center", justifyContent: "center",
              font: "700 11px/1 var(--rl-font-mono)", color: "var(--rl-fg-muted)",
            }}>2</span>
          </div>
          <div style={{ textAlign: "center" }}>
            <div className="wf-hint" style={{ fontSize: 13, lineHeight: "18px" }}>
              Sube PDFs o Excel de tus proveedores.
            </div>
            <div className="row" style={{ justifyContent: "center", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
              <Chip dot={false}>Enel</Chip>
              <Chip dot={false}>Aguas Andinas</Chip>
              <Chip dot={false}>Iconstruye</Chip>
            </div>
          </div>
        </button>
      </div>

      {/* divider */}
      <div className="divider" style={{ maxWidth: 540, marginTop: 16 }}></div>

      {/* Acceso secundario al dashboard + última actividad */}
      <div style={{ width: "100%", maxWidth: 720, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24 }}>
        <div className="row" style={{ gap: 10 }}>
          <span style={{
            width: 32, height: 32, borderRadius: 8,
            border: "1.5px solid var(--rl-gray-200)",
            background: "var(--rl-gray-50)",
            display: "flex", alignItems: "center", justifyContent: "center",
            font: "400 16px/1 var(--rl-font-display)", color: "var(--rl-fg-muted)",
          }}>≣</span>
          <div>
            <div style={{ font: "600 13px/18px var(--rl-font-display)", color: "var(--rl-fg)" }}>
              ¿Solo quieres revisar?
            </div>
            <div className="wf-hint" style={{ fontSize: 12 }}>Consumos, KPIs y la tabla por sucursal.</div>
          </div>
        </div>
        <Btn kind="ghost" ico="↗">Ir al dashboard</Btn>
      </div>

      <div className="wf-hint" style={{ fontSize: 11, color: "var(--rl-gray-400)" }}>
        Última actividad · 28 feb 2026 · Combustible Diésel — Planta Norte
      </div>
    </div>
  </div>
);

// =====================================================================
// DASHBOARD — KPIs + tabs por tipo + subcat. (variante A refinada)
// =====================================================================

// KPI con sombra cálida + chip de icono a la derecha (estilo Recylink)
const KpiCard = ({ label, value, unit, ico, icoColor, delta, deltaKind, sub }) => (
  <div style={{
    background: "#FFFFFF",
    borderRadius: 10,
    padding: "18px 22px",
    boxShadow: "0 4px 36px 0 rgba(190,190,190,0.25)",
    display: "flex", flexDirection: "column", gap: 8,
    minWidth: 0,
  }}>
    <div className="spread">
      <div className="wf-eyebrow" style={{ color: "var(--rl-fg-muted)" }}>{label}</div>
      <div style={{
        width: 36, height: 36, borderRadius: 999,
        background: icoColor + "1F",
        color: icoColor,
        display: "flex", alignItems: "center", justifyContent: "center",
        font: "400 16px/1 var(--rl-font-display)",
        flexShrink: 0,
      }}>{ico}</div>
    </div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
      <span style={{ font: "700 28px/32px var(--rl-font-display)", letterSpacing: "-0.02em", color: "var(--rl-fg)" }}>{value}</span>
      {unit && <span style={{ font: "600 13px/1 var(--rl-font-display)", color: "var(--rl-fg-muted)" }}>{unit}</span>}
    </div>
    {(delta || sub) && (
      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        {delta && <span className={"wf-kpi-delta " + (deltaKind || "")} style={{
          font: "600 11px/1 var(--rl-font-ui)",
          padding: "3px 7px", borderRadius: 999,
          background: deltaKind === "dn" ? "var(--rl-success-50)" : deltaKind === "up" ? "var(--rl-warning-50)" : "var(--rl-gray-100)",
          color: deltaKind === "dn" ? "var(--rl-success-700)" : deltaKind === "up" ? "var(--rl-warning-700)" : "var(--rl-fg-muted)",
        }}>{delta}</span>}
        {sub && <span className="wf-hint" style={{ fontSize: 11 }}>{sub}</span>}
      </div>
    )}
  </div>
);

// Tabs por tipo de consumo (Electricidad / Combustible / Agua) — más limpios
const TypeTabs = ({ active = 1 }) => {
  const tabs = [
    { ico: "⚡", label: "Electricidad", unit: "kWh", color: "var(--rl-action)", total: "36.150 kWh" },
    { ico: "⛽", label: "Combustible",  unit: "L",   color: "#C7842B",          total: "8.500 L" },
    { ico: "💧", label: "Agua",         unit: "m³",  color: "var(--rl-success-600)", total: "412 m³" },
  ];
  return (
    <div style={{ display: "flex", gap: 8, padding: "10px 18px 0", borderBottom: "1px solid var(--rl-border-subtle)" }}>
      {tabs.map((t, i) => {
        const isActive = i === active;
        return (
          <div key={i} style={{
            padding: "10px 14px 12px",
            display: "flex", alignItems: "center", gap: 8,
            borderBottom: isActive ? "2.5px solid " + t.color : "2.5px solid transparent",
            marginBottom: -1,
            cursor: "default",
          }}>
            <span style={{
              width: 28, height: 28, borderRadius: 8,
              background: isActive ? t.color + "1F" : "var(--rl-gray-50)",
              color: isActive ? t.color : "var(--rl-fg-muted)",
              display: "flex", alignItems: "center", justifyContent: "center",
              font: "400 14px/1 var(--rl-font-display)",
            }}>{t.ico}</span>
            <div>
              <div style={{
                font: "700 14px/18px var(--rl-font-display)",
                color: isActive ? "var(--rl-fg)" : "var(--rl-fg-muted)",
              }}>{t.label}</div>
              <div className="wf-hint" style={{ fontSize: 11, color: isActive ? t.color : "var(--rl-fg-subtle)" }}>
                {t.total} · {t.unit}
              </div>
            </div>
          </div>
        );
      })}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, paddingBottom: 8 }}>
        <Btn size="sm" kind="ghost" ico="⤓">Exportar</Btn>
      </div>
    </div>
  );
};

// Subcat chips bar limpia
const SubcatBar = ({ options, activeIdx = 0, color }) => (
  <div className="row" style={{
    flexWrap: "wrap", gap: 8,
    padding: "12px 18px",
    background: "var(--rl-gray-25)",
    borderBottom: "1px solid var(--rl-border-subtle)",
  }}>
    <span className="wf-eyebrow" style={{ marginRight: 4 }}>Subcategoría</span>
    <button style={{
      all: "unset", cursor: "default",
      padding: "4px 10px",
      borderRadius: 999,
      font: "600 12px/1 var(--rl-font-ui)",
      background: activeIdx === 0 ? color : "transparent",
      color: activeIdx === 0 ? "#FFF" : "var(--rl-fg)",
      border: "1px solid " + (activeIdx === 0 ? color : "var(--rl-gray-300)"),
    }}>Todas</button>
    {options.map((o, i) => {
      const isActive = activeIdx === i + 1;
      return (
        <button key={i} style={{
          all: "unset", cursor: "default",
          padding: "4px 10px",
          borderRadius: 999,
          font: "600 12px/1 var(--rl-font-ui)",
          background: isActive ? color : "#FFFFFF",
          color: isActive ? "#FFF" : "var(--rl-fg)",
          border: "1px solid " + (isActive ? color : "var(--rl-gray-300)"),
        }}>{o}</button>
      );
    })}
    <button style={{
      all: "unset", cursor: "default",
      padding: "4px 10px",
      borderRadius: 999,
      font: "600 12px/1 var(--rl-font-ui)",
      background: "transparent",
      color: "var(--rl-fg-muted)",
      border: "1px dashed var(--rl-gray-400)",
    }}>+ Crear nueva</button>
    <span className="wf-hint" style={{ marginLeft: "auto", fontSize: 11 }}>
      Filtra gráfico y tabla. Comparable porque todas usan {color === "var(--rl-success-600)" ? "m³" : "L"}.
    </span>
  </div>
);

// Insight callout (Recylink-style) — pequeña pista contextual del mes
const InsightCallout = () => (
  <div style={{
    display: "flex",
    gap: 14,
    padding: "12px 16px",
    background: "var(--rl-primary-50)",
    border: "1px solid var(--rl-primary-200)",
    borderRadius: 10,
    alignItems: "center",
  }}>
    <span style={{
      width: 32, height: 32, borderRadius: 8,
      background: "var(--rl-action)", color: "#FFF",
      display: "flex", alignItems: "center", justifyContent: "center",
      font: "700 12px/1 var(--rl-font-display)",
      letterSpacing: "0.06em",
      flexShrink: 0,
    }}>IA</span>
    <div className="grow">
      <div style={{ font: "600 13px/18px var(--rl-font-display)", color: "var(--rl-fg)" }}>
        Combustible bajó <b style={{ color: "var(--rl-success-700)" }}>2,1%</b> este mes — el descenso viene principalmente de Planta Norte.
      </div>
      <div className="wf-hint" style={{ fontSize: 11, marginTop: 2 }}>
        Hay 1 documento con error en Bodega RM que aún no se contabiliza.
      </div>
    </div>
    <Btn size="sm" kind="ghost">Ver detalles →</Btn>
    <button style={{
      all: "unset", cursor: "default",
      width: 24, height: 24, borderRadius: 6,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "var(--rl-fg-muted)",
    }}>×</button>
  </div>
);

const FinalFilterBar = () => (
  <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
    <Select value="Todas las sucursales (6)" w={220} />
    <Select value="Ene 2026 — Mar 2026" w={200} />
    <Select value="Tipo · todos" w={160} />
    <Btn size="sm" kind="ghost">Más filtros</Btn>
    <div style={{ marginLeft: "auto" }} className="row" style={{ gap: 8 }}>
      <span className="wf-hint" style={{ fontSize: 11 }}>Actualizado 09:14</span>
      <Chip kind="success">Sincronizado</Chip>
    </div>
  </div>
);

const DashboardFinal = () => (
  <div className="wf-screen">
    <EmbedBar host="acme-corp.host / Recylink · Consumos" />
    <div className="wf-body" style={{ gap: 18 }}>

      <ScreenHeader
        eyebrow="Dashboard · Acme Corp"
        title="Consumos de servicios básicos"
        right={<>
          <Btn ico="✎">Registrar manual</Btn>
          <Btn kind="primary" ico="⇪">Subir documento</Btn>
        </>}
      />

      <FinalFilterBar />

      <InsightCallout />

      {/* KPI row — Recylink-style cards (soft warm shadow, icon chip) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <KpiCard
          label="Combustible mes"
          value="8.500" unit="L"
          ico="⛽" icoColor="#C7842B"
          delta="↓ 2,1%" deltaKind="dn"
          sub="vs. feb · subcat. comparables"
        />
        <KpiCard
          label="Costo total mes"
          value="$4.382.140"
          ico="$" icoColor="var(--rl-action)"
          delta="↓ 1,8%" deltaKind="dn"
          sub="combustible + luz + agua"
        />
        <KpiCard
          label="Sucursales reportadas"
          value="6" unit="/ 6"
          ico="⌂" icoColor="var(--rl-success-600)"
          sub="Todas al día"
        />
        <KpiCard
          label="Documentos procesados"
          value="21"
          ico="▣" icoColor="var(--rl-fg-muted)"
          sub="17 ok · 3 avisos · 1 error"
        />
      </div>

      {/* Charts area — ONE tipo at a time + subcat chips */}
      <div style={{
        background: "#FFFFFF",
        borderRadius: 10,
        boxShadow: "0 4px 36px 0 rgba(190,190,190,0.25)",
        overflow: "hidden",
      }}>
        <TypeTabs active={1} />
        <SubcatBar
          options={["Petróleo Diésel", "Kerosene", "GLP", "Gas Natural"]}
          activeIdx={0}
          color="#C7842B"
        />
        <div style={{ padding: "18px 22px 22px", display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: 28 }}>
          <div>
            <div className="spread" style={{ marginBottom: 8 }}>
              <div>
                <div className="wf-h3">Tendencia por subcategoría</div>
                <div className="wf-hint" style={{ fontSize: 11 }}>L / mes · últimos 12 meses</div>
              </div>
              <div className="row" style={{ gap: 6 }}>
                <Chip dot={false}>L</Chip>
                <Btn size="sm" kind="ghost">Vista costos</Btn>
              </div>
            </div>
            <MultiLineChart unit="L" series={[
              { label: "Petróleo Diésel", value: "5.420 L", color: "#C7842B",
                data: [0.32, 0.4, 0.38, 0.46, 0.5, 0.42, 0.55, 0.48, 0.58, 0.62, 0.55, 0.68] },
              { label: "Kerosene",        value: "2.180 L", color: "var(--rl-action)",
                data: [0.18, 0.22, 0.2, 0.28, 0.3, 0.25, 0.32, 0.3, 0.36, 0.38, 0.35, 0.42] },
              { label: "GLP",             value: "680 L",   color: "var(--rl-success-600)", dashed: true,
                data: [0.08, 0.1, 0.09, 0.12, 0.13, 0.11, 0.14, 0.13, 0.16, 0.18, 0.15, 0.2] },
              { label: "Gas Natural",     value: "220 L",   color: "var(--rl-error-500)", dashed: true,
                data: [0.04, 0.05, 0.05, 0.06, 0.07, 0.06, 0.08, 0.07, 0.09, 0.1, 0.08, 0.11] },
            ]} />
          </div>
          <div>
            <div className="spread" style={{ marginBottom: 8 }}>
              <div>
                <div className="wf-h3">Consumo por sucursal</div>
                <div className="wf-hint" style={{ fontSize: 11 }}>Suma de subcategorías · L</div>
              </div>
              <Chip dot={false}>Heatmap</Chip>
            </div>
            <Heatmap color="#C7842B" />
            <div className="wf-hint" style={{ fontSize: 11, marginTop: 6 }}>
              Bodega RM concentra el mayor consumo de Kerosene.
            </div>
          </div>
        </div>
      </div>

      {/* Compact detail table */}
      <div style={{
        background: "#FFFFFF",
        borderRadius: 10,
        boxShadow: "0 4px 36px 0 rgba(190,190,190,0.25)",
        overflow: "hidden",
      }}>
        <div className="spread" style={{ padding: "14px 18px", borderBottom: "1px solid var(--rl-border-subtle)" }}>
          <div>
            <div className="wf-h3">Tabla detallada · últimos registros</div>
            <div className="wf-hint" style={{ fontSize: 11 }}>Edita una celda haciendo clic. Los cambios se guardan al instante.</div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <Chip dot={false}>32 filas</Chip>
            <Btn size="sm" kind="ghost" ico="✎">Editar inline</Btn>
            <Btn size="sm">Ver todo →</Btn>
          </div>
        </div>
        <table className="wf-table">
          <thead>
            <tr>
              <th>Fecha</th><th>Sucursal</th><th>Tipo</th><th>Subcategoría</th><th>Proveedor</th>
              <th className="num">Cantidad</th><th className="num">Costo (CLP)</th><th>Origen</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>31/03/26</td><td>Planta Norte</td>
              <td><span className="row" style={{ gap: 6 }}><span style={{ color: "var(--rl-action)" }}>⚡</span> Electricidad</span></td>
              <td className="wf-hint" style={{ fontStyle: "italic" }}>—</td>
              <td>Enel</td>
              <td className="num">12.480 kWh</td><td className="num">980.412</td>
              <td><Chip dot={false}>PDF</Chip></td>
            </tr>
            <tr>
              <td>31/03/26</td><td>Planta Norte</td>
              <td><span className="row" style={{ gap: 6 }}><span style={{ color: "#C7842B" }}>⛽</span> Combustible</span></td>
              <td><Chip dot={false}>Petróleo Diésel</Chip></td>
              <td>Iconstruye Petróleo</td>
              <td className="num">3.420 L</td><td className="num">1.847.230</td>
              <td className="wf-hint">Manual</td>
            </tr>
            <tr>
              <td>31/03/26</td><td>Bodega RM</td>
              <td><span className="row" style={{ gap: 6 }}><span style={{ color: "#C7842B" }}>⛽</span> Combustible</span></td>
              <td><Chip dot={false}>Kerosene</Chip></td>
              <td>Iconstruye Petróleo</td>
              <td className="num">5.240 L</td><td className="num">3.604.200</td>
              <td><Chip dot={false}>PDF</Chip></td>
            </tr>
            <tr>
              <td>31/03/26</td><td>Bodega RM</td>
              <td><span className="row" style={{ gap: 6 }}><span style={{ color: "var(--rl-success-600)" }}>💧</span> Agua</span></td>
              <td><Chip dot={false}>Agua Potable</Chip></td>
              <td>Aguas Andinas</td>
              <td className="num">142 m³</td><td className="num">189.420</td>
              <td><Chip dot={false}>PDF</Chip></td>
            </tr>
            <tr>
              <td>31/03/26</td><td>Oficina Central</td>
              <td><span className="row" style={{ gap: 6 }}><span style={{ color: "var(--rl-success-600)" }}>💧</span> Agua</span></td>
              <td><Chip dot={false}>Agua Gris</Chip></td>
              <td>—</td>
              <td className="num">38 m³</td><td className="num">42.180</td>
              <td className="wf-hint">Manual</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
);

Object.assign(window, { LandingFinal, DashboardFinal });
