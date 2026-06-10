// Dashboard — 2 variantes + empty + success edit

const ChartTabs = ({ active = 0 }) => {
  const tabs = [
    { ico: "⚡", label: "Electricidad", unit: "kWh", color: "var(--rl-action)" },
    { ico: "⛽", label: "Combustible",  unit: "L",   color: "var(--rl-warning-600)" },
    { ico: "💧", label: "Agua",         unit: "m³",  color: "var(--rl-success-600)" },
  ];
  return (
    <div className="row" style={{ gap: 0, borderBottom: "1.5px solid var(--rl-gray-200)" }}>
      {tabs.map((t, i) => (
        <div key={i} style={{
          padding: "10px 16px",
          font: "600 13px/1 var(--rl-font-display)",
          color: i === active ? t.color : "var(--rl-fg-muted)",
          borderBottom: i === active ? "2px solid " + t.color : "2px solid transparent",
          marginBottom: -1.5,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span>{t.ico}</span>{t.label} <span className="wf-hint" style={{ marginLeft: 4 }}>{t.unit}</span>
        </div>
      ))}
      <div style={{ marginLeft: "auto", padding: "8px 12px" }}>
        <Btn size="sm" kind="ghost" ico="⤓">Exportar</Btn>
      </div>
    </div>
  );
};

// Subcategoría chips bar — aparece sólo cuando el tipo activo es Combustible o Agua
const SubcatChips = ({ kind, options, activeIdx = 0 }) => (
  <div className="row" style={{ flexWrap: "wrap", gap: 8, padding: "10px 18px", background: "var(--rl-gray-50)", borderBottom: "1px solid var(--rl-border-subtle)" }}>
    <span className="wf-eyebrow" style={{ marginRight: 4 }}>Subcategoría</span>
    <Chip kind={activeIdx === 0 ? "info" : ""} dot={false}>Todas</Chip>
    {options.map((o, i) => (
      <Chip key={i} kind={activeIdx === i + 1 ? "info" : ""} dot={false}>{o}</Chip>
    ))}
    <Chip dot={false}>+ Crear nueva</Chip>
    <span className="wf-hint" style={{ marginLeft: "auto" }}>Filtra el gráfico y la tabla. Misma unidad, comparable.</span>
  </div>
);

const FilterBar = ({ tipoActivo, subcats }) => (
  <div className="row" style={{ flexWrap: "wrap", gap: 8, padding: "12px 0" }}>
    <Select value="Acme Corp" w={180} />
    <Select value="Todas las sucursales (6)" w={220} />
    <Select value={tipoActivo || "Todos los tipos"} w={180} />
    {/* Filtro contextual de subcategoría — aparece sólo si se eligió Agua o Combustible */}
    {subcats && (
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "4px 8px 4px 6px",
        background: "var(--rl-primary-50)",
        border: "1.5px solid var(--rl-primary-200)",
        borderRadius: 8,
      }}>
        <span className="wf-eyebrow" style={{ color: "var(--rl-action)" }}>Subcat.</span>
        <Select value={subcats} w={180} />
        <span className="wf-hint" style={{ color: "var(--rl-action)" }}>nuevo</span>
      </div>
    )}
    <Select value="Ene 2026 – Mar 2026" w={200} />
    <Btn size="sm" kind="ghost">Limpiar filtros</Btn>
    <div style={{ marginLeft: "auto" }} className="row">
      <Chip>Última actualización 09:14</Chip>
    </div>
  </div>
);

// ---- Variant A: KPIs grandes + tabs por tipo + tabla compacta ----
const DashboardA = () => (
  <div className="wf-screen">
    <EmbedBar host="acme-corp.host / Recylink · Consumos" />
    <div className="wf-body">
      <ScreenHeader
        eyebrow="Dashboard · Acme Corp"
        title="Consumos de servicios básicos"
        right={<>
          <Btn>Registrar manual</Btn>
          <Btn kind="primary" ico="⇪">Subir documento</Btn>
        </>}
      />
      <FilterBar tipoActivo="Combustible" subcats="Todas las subcat. (4)" />

      {/* KPI row — 4 tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <div className="wf-kpi">
          <div className="row spread">
            <div className="lbl">Consumo del mes</div>
            <Ico tag="⛽" />
          </div>
          <div className="val">8.500 <span style={{ font: "600 14px/1 var(--rl-font-display)", color: "var(--rl-fg-muted)" }}>L</span></div>
          <div className="row" style={{ gap: 6 }}>
            <span className="trend dn">↓ 2,1%</span>
            <span className="wf-hint">vs. febrero</span>
          </div>
          <div className="sub">Combustible total. Cada subcat. (Diésel/Kerosene/GLP) tiene unidad L compartida.</div>
        </div>
        <div className="wf-kpi">
          <div className="row spread"><div className="lbl">Costo total mes</div><Ico tag="$" /></div>
          <div className="val">$4.382.140</div>
          <div className="row" style={{ gap: 6 }}>
            <span className="trend dn">↓ 1,8%</span>
            <span className="wf-hint">vs. febrero</span>
          </div>
          <div className="sub">Combustible + electricidad + agua, CLP.</div>
        </div>
        <div className="wf-kpi">
          <div className="row spread"><div className="lbl">Sucursales activas</div><Ico tag="⌂" /></div>
          <div className="val">6 <span style={{ font: "600 14px/1 var(--rl-font-display)", color: "var(--rl-fg-muted)" }}>/ 6</span></div>
          <div className="wf-hint">Todas reportaron este mes.</div>
        </div>
        <div className="wf-kpi">
          <div className="row spread"><div className="lbl">Documentos procesados</div><Ico tag="▣" /></div>
          <div className="val">21</div>
          <div className="row" style={{ gap: 6 }}>
            <Chip kind="success">17 ok</Chip>
            <Chip kind="warning">3 avisos</Chip>
            <Chip kind="error">1 error</Chip>
          </div>
        </div>
      </div>

      {/* Charts area — ONE consumption type at a time + subcatías */}
      <div className="wf-card" style={{ overflow: "visible" }}>
        <ChartTabs active={1} />
        <SubcatChips options={["Petróleo Diésel", "Kerosene", "GLP", "Gas Natural"]} activeIdx={0} />
        <div className="bd" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24 }}>
          <div>
            <div className="row spread" style={{ marginBottom: 6 }}>
              <div className="wf-h3">Tendencia por subcategoría · litros / mes</div>
              <Chip>L</Chip>
            </div>
            <MultiLineChart unit="L" series={[
              { label: "Petróleo Diésel", value: "5.420 L", color: "var(--rl-warning-600)",
                data: [0.32, 0.4, 0.38, 0.46, 0.5, 0.42, 0.55, 0.48, 0.58, 0.62, 0.55, 0.68] },
              { label: "Kerosene",        value: "2.180 L", color: "var(--rl-action)",
                data: [0.18, 0.22, 0.2, 0.28, 0.3, 0.25, 0.32, 0.3, 0.36, 0.38, 0.35, 0.42] },
              { label: "GLP",             value: "680 L",   color: "var(--rl-success-600)", dashed: true,
                data: [0.08, 0.1, 0.09, 0.12, 0.13, 0.11, 0.14, 0.13, 0.16, 0.18, 0.15, 0.2] },
              { label: "Gas Natural",     value: "220 L",   color: "var(--rl-error-500)", dashed: true,
                data: [0.04, 0.05, 0.05, 0.06, 0.07, 0.06, 0.08, 0.07, 0.09, 0.1, 0.08, 0.11] },
            ]} />
            <div className="wf-hint" style={{ marginTop: 6 }}>Líneas separadas por subcategoría. Mismo eje (L) — todas las subcat. de Combustible comparten unidad.</div>
          </div>
          <div>
            <div className="row spread" style={{ marginBottom: 6 }}>
              <div className="wf-h3">Consumo por sucursal (L)</div>
              <Chip>Heatmap</Chip>
            </div>
            <Heatmap color="var(--rl-warning-600)" />
            <div className="wf-hint" style={{ marginTop: 4 }}>Suma de subcategorías · el filtro de arriba afecta este heatmap.</div>
          </div>
        </div>
      </div>

      {/* Compact detail table */}
      <div className="wf-card">
        <div className="hd">
          <div className="wf-h3">Tabla detallada · últimos registros</div>
          <div className="row">
            <Chip>32 filas</Chip>
            <Btn size="sm" kind="ghost">Editar inline ✎</Btn>
            <Btn size="sm" kind="ghost">Ver todo →</Btn>
          </div>
        </div>
        <table className="wf-table">
          <thead>
            <tr>
              <th>Fecha</th><th>Sucursal</th><th>Tipo</th><th>Subcat.</th><th>Proveedor</th>
              <th className="num">Cantidad</th><th className="num">Costo (CLP)</th><th>Origen</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>31/03/26</td><td>Planta Norte</td><td>⚡ Electricidad</td><td className="wf-hint" style={{ fontStyle: "italic" }}>—</td><td>Enel</td><td className="num">12.480 kWh</td><td className="num">980.412</td><td className="wf-mono">PDF</td></tr>
            <tr><td>31/03/26</td><td>Planta Norte</td><td>⛽ Combustible</td><td><Chip>Petróleo Diésel</Chip></td><td>Iconstruye Petróleo</td><td className="num">3.420 L</td><td className="num">1.847.230</td><td className="wf-hint">Manual</td></tr>
            <tr><td>31/03/26</td><td>Bodega RM</td><td>⛽ Combustible</td><td><Chip>Kerosene</Chip></td><td>Iconstruye Petróleo</td><td className="num">5.240 L</td><td className="num">3.604.200</td><td className="wf-mono">PDF</td></tr>
            <tr><td>31/03/26</td><td>Bodega RM</td><td>💧 Agua</td><td><Chip>Agua Potable</Chip></td><td>Aguas Andinas</td><td className="num">142 m³</td><td className="num">189.420</td><td className="wf-mono">PDF</td></tr>
            <tr><td>31/03/26</td><td>Oficina Central</td><td>💧 Agua</td><td><Chip>Agua Gris</Chip></td><td>—</td><td className="num">38 m³</td><td className="num">42.180</td><td className="wf-hint">Manual</td></tr>
          </tbody>
        </table>
      </div>

      <Anno style={{ position: "absolute", right: 36, top: 540 }}>
        Tab activo = Combustible. La barra de subcategorías aparece automáticamente
        (Agua también la tiene; Electricidad no). Cada subcat. es una línea — todas en L.
      </Anno>
    </div>
  </div>
);

// ---- Variant B: cada tipo en su propio bloque (stacked) ----
const TypeBlock = ({ tipo, ico, unit, color, total, costo, delta, deltaKind, data, series, subcats }) => (
  <div className="wf-card">
    <div className="hd">
      <div className="row">
        <div style={{ width: 36, height: 36, borderRadius: 8, border: "1.5px solid " + color, background: "#FFF", display:"flex", alignItems:"center", justifyContent:"center", fontSize: 18 }}>{ico}</div>
        <div>
          <div className="wf-h3">{tipo}</div>
          <div className="wf-hint">Unidad · {unit}{subcats && <> · {subcats.length} subcategorías</>}</div>
        </div>
      </div>
      <div className="row" style={{ gap: 20 }}>
        <div>
          <div className="wf-eyebrow">Consumo mes</div>
          <div style={{ font: "700 22px/26px var(--rl-font-display)", color: "var(--rl-fg)" }}>{total} <span style={{ font: "600 12px/1 var(--rl-font-display)", color: "var(--rl-fg-muted)" }}>{unit}</span></div>
        </div>
        <div>
          <div className="wf-eyebrow">Costo mes</div>
          <div style={{ font: "700 22px/26px var(--rl-font-display)", color: "var(--rl-fg)" }}>{costo}</div>
        </div>
        <div style={{ alignSelf: "center" }}>
          <Chip kind={deltaKind}>{delta} vs. feb</Chip>
        </div>
      </div>
    </div>
    {subcats && (
      <div className="row" style={{ flexWrap: "wrap", gap: 8, padding: "10px 18px", background: "var(--rl-gray-50)", borderBottom: "1px solid var(--rl-border-subtle)" }}>
        <span className="wf-eyebrow" style={{ marginRight: 4 }}>Subcat.</span>
        <Chip kind="info" dot={false}>Todas</Chip>
        {subcats.map((s, i) => (<Chip key={i} dot={false}>{s}</Chip>))}
        <Chip dot={false}>+ Crear nueva</Chip>
      </div>
    )}
    <div className="bd" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }}>
      <div>
        <div className="wf-hint" style={{ marginBottom: 4 }}>
          {series ? "Tendencia por subcategoría · " + unit + " / mes" : "Tendencia · " + unit + " / mes"}
        </div>
        {series
          ? <MultiLineChart h={170} unit={unit} series={series} />
          : <LineChart h={160} color={color} data={data} unit={unit} />}
      </div>
      <div>
        <div className="wf-hint" style={{ marginBottom: 4 }}>Consumo por sucursal · 12 meses ({unit})</div>
        <Heatmap color={color} />
      </div>
    </div>
  </div>
);

const DashboardB = () => (
  <div className="wf-screen">
    <EmbedBar host="acme-corp.host / Recylink · Consumos" />
    <div className="wf-body">
      <ScreenHeader
        eyebrow="Dashboard · Acme Corp"
        title="Consumos por tipo de servicio"
        right={<>
          <Btn>Registrar manual</Btn>
          <Btn kind="primary" ico="⇪">Subir documento</Btn>
        </>}
      />
      <FilterBar />

      {/* Top KPIs — transversales (no por tipo) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <div className="wf-kpi"><div className="lbl">Costo total mes</div><div className="val">$4.382.140</div><span className="trend dn">↓ 1,8% vs. feb</span></div>
        <div className="wf-kpi"><div className="lbl">Sucursales activas</div><div className="val">6 / 6</div><span className="wf-hint">Todas reportaron.</span></div>
        <div className="wf-kpi"><div className="lbl">Documentos del mes</div><div className="val">21</div><span className="wf-hint">17 ok · 3 avisos · 1 error</span></div>
        <div className="wf-kpi"><div className="lbl">Próximo cierre</div><div className="val">12 días</div><span className="wf-hint">Cierre mensual 14 abr.</span></div>
      </div>

      <TypeBlock tipo="Electricidad" ico="⚡" unit="kWh" color="var(--rl-action)"
        total="36.150" costo="$2.840.420" delta="↑ 4,2%" deltaKind="warning"
        data={[[0,0.35],[1,0.42],[2,0.38],[3,0.5],[4,0.55],[5,0.45],[6,0.6],[7,0.52],[8,0.65],[9,0.7],[10,0.62],[11,0.78]]} />

      <TypeBlock tipo="Combustible" ico="⛽" unit="L" color="var(--rl-warning-600)"
        total="8.500" costo="$1.252.300" delta="↓ 2,1%" deltaKind="success"
        subcats={["Petróleo Diésel","Kerosene","GLP","Gas Natural"]}
        series={[
          { label: "Petróleo Diésel", value: "5.420 L", color: "var(--rl-warning-600)",
            data: [0.32, 0.4, 0.38, 0.46, 0.5, 0.42, 0.55, 0.48, 0.58, 0.62, 0.55, 0.68] },
          { label: "Kerosene",        value: "2.180 L", color: "var(--rl-action)",
            data: [0.18, 0.22, 0.2, 0.28, 0.3, 0.25, 0.32, 0.3, 0.36, 0.38, 0.35, 0.42] },
          { label: "GLP",             value: "680 L",   color: "var(--rl-success-600)", dashed: true,
            data: [0.08, 0.1, 0.09, 0.12, 0.13, 0.11, 0.14, 0.13, 0.16, 0.18, 0.15, 0.2] },
          { label: "Gas Natural",     value: "220 L",   color: "var(--rl-error-500)", dashed: true,
            data: [0.04, 0.05, 0.05, 0.06, 0.07, 0.06, 0.08, 0.07, 0.09, 0.1, 0.08, 0.11] },
        ]} />

      <TypeBlock tipo="Agua" ico="💧" unit="m³" color="var(--rl-success-600)"
        total="412" costo="$289.420" delta="→ 0,3%" deltaKind=""
        subcats={["Agua Potable","Agua Gris","Riego"]}
        series={[
          { label: "Agua Potable", value: "280 m³", color: "var(--rl-success-600)",
            data: [0.28, 0.3, 0.32, 0.34, 0.38, 0.36, 0.4, 0.38, 0.42, 0.4, 0.38, 0.36] },
          { label: "Agua Gris",    value: "92 m³",  color: "var(--rl-action)",
            data: [0.1, 0.11, 0.12, 0.13, 0.15, 0.14, 0.16, 0.15, 0.17, 0.16, 0.15, 0.14] },
          { label: "Riego",        value: "40 m³",  color: "var(--rl-warning-600)", dashed: true,
            data: [0.02, 0.03, 0.05, 0.08, 0.12, 0.13, 0.14, 0.13, 0.1, 0.06, 0.04, 0.03] },
        ]} />

      {/* compact table */}
      <div className="wf-card">
        <div className="hd">
          <div className="wf-h3">Tabla detallada · edición inline</div>
          <div className="row">
            <Chip>32 filas</Chip>
            <Btn size="sm" kind="ghost">Ver todo →</Btn>
          </div>
        </div>
        <table className="wf-table">
          <thead>
            <tr>
              <th>Sucursal</th><th>Tipo</th><th>Subcat.</th><th>Mes</th>
              <th className="num">Cantidad</th><th className="num">Costo</th><th>Proveedor</th><th></th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Planta Norte</td><td>⚡ Electricidad</td><td className="wf-hint" style={{ fontStyle: "italic" }}>—</td><td>Mar 26</td><td className="num">12.480 kWh</td><td className="num">$980.412</td><td>Enel</td><td><Ico tag="✎"/></td></tr>
            <tr><td>Planta Norte</td><td>⛽ Combustible</td><td><Chip>Petróleo Diésel</Chip></td><td>Mar 26</td><td className="num">3.420 L</td><td className="num">$1.847.230</td><td>Iconstruye Petróleo</td><td><Ico tag="✎"/></td></tr>
            <tr><td>Bodega RM</td><td>⛽ Combustible</td><td><Chip>Kerosene</Chip></td><td>Mar 26</td><td className="num">5.240 L</td><td className="num">$3.604.200</td><td>Iconstruye Petróleo</td><td><Ico tag="✎"/></td></tr>
            <tr><td>Bodega RM</td><td>💧 Agua</td><td><Chip>Agua Potable</Chip></td><td>Mar 26</td><td className="num">142 m³</td><td className="num">$189.420</td><td>Aguas Andinas</td><td><Ico tag="✎"/></td></tr>
            <tr><td>Oficina Central</td><td>💧 Agua</td><td><Chip>Agua Gris</Chip></td><td>Mar 26</td><td className="num">38 m³</td><td className="num">$42.180</td><td>—</td><td><Ico tag="✎"/></td></tr>
          </tbody>
        </table>
      </div>

      <Anno style={{ position: "absolute", right: 36, top: 320 }}>
        Variante "por tipo": cada servicio tiene su propio bloque con
        KPI + líneas por subcategoría + heatmap. Fácil de escanear cuando
        sólo quieres ver UN tipo (ej. solo combustible).
      </Anno>
    </div>
  </div>
);

// ---- Empty state (sin datos) ----
const DashboardEmpty = () => (
  <div className="wf-screen">
    <EmbedBar host="acme-corp.host / Recylink · Consumos" />
    <div className="wf-body">
      <ScreenHeader eyebrow="Dashboard · Acme Corp" title="Consumos de servicios básicos" />
      <FilterBar />

      <div className="wf-box-dashed" style={{ padding: 56, display:"flex", flexDirection:"column", alignItems:"center", gap: 14, textAlign:"center" }}>
        <div style={{ width: 64, height: 64, borderRadius: 12, border: "2px dashed var(--rl-gray-400)", display:"flex", alignItems:"center", justifyContent:"center", fontSize: 28, color: "var(--rl-gray-500)" }}>◯</div>
        <div className="wf-h2">Aún no hay consumos registrados</div>
        <div className="wf-muted" style={{ maxWidth: 460 }}>
          Cuando ingreses tu primer consumo (a mano o subiendo documentos), aquí verás
          KPIs, tendencias por tipo y la tabla detallada.
        </div>
        <div className="row" style={{ marginTop: 6 }}>
          <Btn kind="primary" ico="✎">Registrar manualmente</Btn>
          <Btn ico="⇪">Subir documento</Btn>
        </div>
        <div className="wf-hint" style={{ marginTop: 8 }}>
          Empieza por un mes — luego te mostraremos comparativas mes a mes.
        </div>
      </div>

      {/* skeleton hint cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, opacity: 0.55 }}>
        {[1,2,3,4].map(i => (
          <div key={i} className="wf-box" style={{ padding: 18, display:"flex", flexDirection:"column", gap: 10 }}>
            <div className="wf-fill" style={{ height: 12, width: "60%" }}></div>
            <div className="wf-fill" style={{ height: 28, width: "80%" }}></div>
            <div className="wf-fill" style={{ height: 10, width: "50%" }}></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ---- Edit success state ----
const DashboardEditSuccess = () => (
  <div className="wf-screen" style={{ position: "relative" }}>
    <EmbedBar host="acme-corp.host / Recylink · Consumos" />
    <div className="wf-body">
      <ScreenHeader eyebrow="Dashboard · Tabla detallada" title="Edición inline · cambio guardado" />

      <div className="wf-card">
        <div className="hd">
          <div className="wf-h3">Últimos registros</div>
          <Chip>32 filas</Chip>
        </div>
        <table className="wf-table">
          <thead>
            <tr><th>Sucursal</th><th>Tipo</th><th>Subcat.</th><th>Mes</th><th className="num">Cantidad</th><th className="num">Costo</th><th>Proveedor</th></tr>
          </thead>
          <tbody>
            <tr><td>Planta Norte</td><td>⚡ Electricidad</td><td className="wf-hint" style={{ fontStyle: "italic" }}>—</td><td>Mar 26</td><td className="num">12.480 kWh</td><td className="num">$980.412</td><td>Enel</td></tr>
            <tr style={{ background: "var(--rl-success-25)" }}>
              <td>Planta Norte</td><td>⛽ Combustible</td>
              <td><Chip kind="success">Petróleo Diésel <span style={{ marginLeft: 4, font: "700 9px/1 var(--rl-font-mono)", color: "var(--rl-success-700)" }}>actualizado</span></Chip></td>
              <td>Mar 26</td>
              <td className="num"><b>3.420 L</b></td>
              <td className="num" style={{ position: "relative" }}>
                <b>$1.847.230</b>
                <span style={{ position: "absolute", left: 0, top: -2, font: "700 9px/1 var(--rl-font-mono)", color: "var(--rl-success-700)" }}>antes $1.812.000</span>
              </td>
              <td>Iconstruye Petróleo <Chip kind="success" dot={false}>✓ guardado</Chip></td>
            </tr>
            <tr><td>Planta Sur</td><td>⚡ Electricidad</td><td className="wf-hint" style={{ fontStyle: "italic" }}>—</td><td>Mar 26</td><td className="num">9.840 kWh</td><td className="num">$812.300</td><td>Enel</td></tr>
            <tr><td>Bodega RM</td><td>💧 Agua</td><td><Chip>Agua Potable</Chip></td><td>Mar 26</td><td className="num">142 m³</td><td className="num">$189.420</td><td>Aguas Andinas</td></tr>
          </tbody>
        </table>
      </div>

      <Toast kind="success"
        title="Costo actualizado"
        body={<>Planta Norte · Combustible · Mar 2026 · <a href="#">Deshacer</a></>}
        style={{ bottom: 20, right: 20 }} />

      <Anno style={{ position: "absolute", right: 36, top: 220 }}>
        Confirmación NO intrusiva — toast inferior derecho con "Deshacer".
        La fila editada queda con fill verde muy claro por ~3s.
      </Anno>
    </div>
  </div>
);

// ---- Config de subcategorías ----
const SubcatRow = ({ name, kind = "predef", count }) => (
  <div className="row spread" style={{ padding: "10px 14px", borderBottom: "1px solid var(--rl-border-subtle)" }}>
    <div className="row">
      <span style={{ width: 8, height: 8, borderRadius: 999, background: "var(--rl-gray-300)" }}></span>
      <div style={{ font: "600 14px/18px var(--rl-font-display)", color: "var(--rl-fg)" }}>{name}</div>
      {kind === "predef" && <Chip dot={false}>Predefinida</Chip>}
      {kind === "custom" && <Chip kind="info" dot={false}>Personalizada</Chip>}
      <span className="wf-hint">· {count || 0} registros la usan</span>
    </div>
    <div className="row">
      <Btn size="sm" kind="ghost" ico="✎">Renombrar</Btn>
      {kind === "custom"
        ? <Btn size="sm" kind="ghost" style={{ color: "var(--rl-error-700)" }} ico="🗑">Eliminar</Btn>
        : <span className="wf-hint" style={{ fontStyle: "italic" }}>Las predefinidas no se pueden eliminar</span>}
    </div>
  </div>
);

const SubcatConfig = () => (
  <div className="wf-screen">
    <EmbedBar host="acme-corp.host / Recylink · Consumos" />
    <div className="wf-body">
      <div className="row"><Btn size="sm" kind="ghost" ico="←">Volver</Btn><span className="wf-hint">/ Configuración / Subcategorías</span></div>
      <ScreenHeader
        eyebrow="Configuración · Subcategorías"
        title="Gestiona las subcategorías por tipo"
        right={<Chip kind="info">Acme Corp · empresa fija</Chip>}
      />
      <div className="wf-muted" style={{ maxWidth: 720 }}>
        Las <b>predefinidas</b> vienen del admin de Recylink y no se pueden eliminar.
        Puedes <b>crear nuevas</b> para tu empresa — aparecerán automáticamente en el form,
        en la subida de documentos y en los filtros del dashboard.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 8 }}>
        {/* Combustible */}
        <div className="wf-card">
          <div className="hd">
            <div className="row">
              <div style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid var(--rl-warning-600)", display:"flex", alignItems:"center", justifyContent:"center", fontSize: 16 }}>⛽</div>
              <div>
                <div className="wf-h3">Combustible</div>
                <div className="wf-hint">Unidad · L · 4 subcategorías</div>
              </div>
            </div>
            <Btn size="sm" kind="primary" ico="+">Nueva subcategoría</Btn>
          </div>
          <SubcatRow name="Petróleo Diésel" kind="predef" count={42} />
          <SubcatRow name="Kerosene" kind="predef" count={18} />
          <SubcatRow name="GLP" kind="predef" count={6} />
          <SubcatRow name="Gas Natural" kind="custom" count={3} />
        </div>

        {/* Agua */}
        <div className="wf-card">
          <div className="hd">
            <div className="row">
              <div style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid var(--rl-success-600)", display:"flex", alignItems:"center", justifyContent:"center", fontSize: 16 }}>💧</div>
              <div>
                <div className="wf-h3">Agua</div>
                <div className="wf-hint">Unidad · m³ · 3 subcategorías</div>
              </div>
            </div>
            <Btn size="sm" kind="primary" ico="+">Nueva subcategoría</Btn>
          </div>
          <SubcatRow name="Agua Potable" kind="predef" count={28} />
          <SubcatRow name="Agua Gris" kind="predef" count={9} />
          <SubcatRow name="Riego" kind="custom" count={4} />
        </div>

        {/* Electricidad — sin subcat */}
        <div className="wf-card" style={{ gridColumn: "1 / -1", background: "var(--rl-gray-50)" }}>
          <div className="bd" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid var(--rl-gray-300)", display:"flex", alignItems:"center", justifyContent:"center", fontSize: 16, background: "#FFF" }}>⚡</div>
            <div className="grow">
              <div className="wf-h3">Electricidad</div>
              <div className="wf-hint">No usa subcategorías por ahora. Si lo necesitas más adelante, lo habilita el admin de Recylink.</div>
            </div>
            <Chip>Sin subcategorías</Chip>
          </div>
        </div>
      </div>

      {/* Modal-like new subcat form (inline preview) */}
      <div className="wf-box" style={{ padding: 18, marginTop: 8, borderColor: "var(--rl-action)" }}>
        <div className="row spread" style={{ marginBottom: 12 }}>
          <div>
            <div className="wf-eyebrow" style={{ color: "var(--rl-action)" }}>Crear nueva subcategoría</div>
            <div className="wf-h3">Para · Combustible</div>
          </div>
          <Btn size="sm" kind="ghost">Cerrar ×</Btn>
        </div>
        <div className="row" style={{ alignItems: "flex-end", gap: 12 }}>
          <Field label="Nombre" required style={{ flex: 1 }}>
            <Input value="Biodiésel" focused />
          </Field>
          <Field label="Unidad" style={{ width: 140 }}>
            <Select value="L (fijo por tipo)" />
          </Field>
          <Btn>Cancelar</Btn>
          <Btn kind="primary">Crear</Btn>
        </div>
        <div className="wf-help" style={{ marginTop: 8 }}>
          La unidad se hereda del tipo padre — no es editable. Esto garantiza que los gráficos sigan siendo comparables.
        </div>
      </div>

      <Anno style={{ position: "absolute", right: 36, top: 380 }}>
        Electricidad aparece deshabilitada — refleja la decisión actual
        de NO tener subcategorías ahí. Fácil de habilitar más adelante.
      </Anno>
    </div>
  </div>
);

Object.assign(window, { DashboardA, DashboardB, DashboardEmpty, DashboardEditSuccess, SubcatConfig });
