// Registro manual — form, preview, éxito

const MANUAL_UNITS = {
  Combustible: { unit: "L", proveedor: "Iconstruye Petróleo" },
  Electricidad: { unit: "kWh", proveedor: "Enel" },
  Agua: { unit: "m³", proveedor: "Aguas Andinas" },
};

// ---- Form state (with inline validation) ----
const ManualForm = () => (
  <div className="wf-screen">
    <EmbedBar host="acme-corp.host / Recylink · Consumos" />
    <div className="wf-body">
      <div className="row" style={{ marginBottom: 4 }}>
        <Btn size="sm" kind="ghost" ico="←">Volver</Btn>
        <span className="wf-hint">/ Registro manual</span>
      </div>
      <ScreenHeader
        eyebrow="Registro manual · Paso 1 de 2"
        title="Registrar un consumo"
        right={<Chip kind="info">Acme Corp · empresa fija</Chip>}
      />
      <div className="wf-muted" style={{ maxWidth: 620 }}>
        Completa los campos. Validamos al salir de cada campo, no te bloqueamos mientras escribes.
      </div>

      <div className="wf-card" style={{ marginTop: 8 }}>
        <div className="bd" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <Field label="Empresa">
            <Input value="Acme Corp" suffix="🔒" />
            <div className="wf-help">Definida por la plataforma. No editable.</div>
          </Field>

          <Field label="Sucursal" required>
            <Select value="Planta Norte — Antofagasta" />
          </Field>

          <Field label="Mes de registro" required>
            <Select value="Marzo 2026" />
          </Field>

          <Field label="Tipo de consumo" required>
            <div className="row" style={{ gap: 8 }}>
              <Chip kind="info">⛽ Combustible</Chip>
              <Chip>⚡ Electricidad</Chip>
              <Chip>💧 Agua</Chip>
            </div>
            <div className="wf-help" style={{ marginTop: 6 }}>Determina la unidad de medida del campo "Cantidad".</div>
          </Field>

          <Field label="Subcategoría" helper="Opcional. Si no eliges, queda como 'Sin subcategoría'.">
            <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
              <Chip kind="info">Petróleo Diésel</Chip>
              <Chip>Kerosene</Chip>
              <Chip>GLP</Chip>
              <Chip>Gas Natural</Chip>
              <Chip dot={false}>+ Crear nueva</Chip>
            </div>
          </Field>

          <Field label="Proveedor" required>
            <Select value="Iconstruye Petróleo" />
          </Field>

          <Field label="N° de documento (opcional)">
            <Input placeholder="Ej. 0023412" />
          </Field>

          <Field label="Cantidad" required helper="Litros consumidos en el mes." style={{ position: "relative" }}>
            <Input value="3.420" suffix="L" focused />
          </Field>

          <Field label="Costo" required helperKind="error" helper="Ingresa un monto mayor que 0.">
            <Input placeholder="0" suffix="CLP" error />
          </Field>
        </div>

        <div className="divider"></div>

        <div className="bd" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="wf-hint">Los cambios no se guardan hasta que confirmes en el preview.</div>
          <div className="row">
            <Btn>Cancelar</Btn>
            <Btn kind="primary">Continuar al preview →</Btn>
          </div>
        </div>
      </div>

      <Anno style={{ position: "absolute", right: 36, top: 360 }}>
        Estado "focus" del input — borde azul + ring 4px (translúcido).
      </Anno>
      <Anno style={{ position: "absolute", right: 36, top: 460 }}>
        Estado "error" inline — borde rojo, helper en rojo, sin bloquear otros campos.
      </Anno>
      <Anno style={{ position: "absolute", left: 36, top: 500 }}>
        Campo "Subcategoría" — aparece sólo si tipo es Combustible o Agua.
        Las primeras vienen predefinidas por admin; "+ Crear nueva" abre la pantalla de configuración.
      </Anno>
    </div>
  </div>
);

// ---- Preview before save ----
const ManualPreview = () => (
  <div className="wf-screen">
    <EmbedBar host="acme-corp.host / Recylink · Consumos" />
    <div className="wf-body">
      <div className="row" style={{ marginBottom: 4 }}>
        <Btn size="sm" kind="ghost" ico="←">Editar</Btn>
        <span className="wf-hint">/ Registro manual / Preview</span>
      </div>
      <ScreenHeader
        eyebrow="Registro manual · Paso 2 de 2"
        title="Revisa antes de guardar"
      />

      <div className="wf-card">
        <div className="hd">
          <div className="wf-h3">Resumen del registro</div>
          <Chip kind="success">Validación ok</Chip>
        </div>
        <div className="bd" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", rowGap: 18, columnGap: 24 }}>
          {[
            ["Empresa", "Acme Corp"],
            ["Sucursal", "Planta Norte — Antofagasta"],
            ["Mes", "Marzo 2026"],
            ["Tipo de consumo", "⛽ Combustible"],
            ["Subcategoría", "Petróleo Diésel"],
            ["Proveedor", "Iconstruye Petróleo"],
            ["N° documento", "—"],
            ["Cantidad", "3.420 L"],
            ["Costo", "$1.847.230 CLP"],
            ["Costo unitario", "$540 / L"],
          ].map(([k, v]) => (
            <div key={k}>
              <div className="wf-eyebrow">{k}</div>
              <div style={{ font: "600 15px/22px var(--rl-font-display)", color: "var(--rl-fg)", marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>

        <div className="divider"></div>

        <div className="bd" style={{ background: "var(--rl-warning-25)" }}>
          <div className="row" style={{ alignItems: "flex-start", gap: 10 }}>
            <Ico tag="!" size="lg" kind="warning" />
            <div>
              <div className="wf-h3" style={{ color: "var(--rl-warning-800)" }}>Dato atípico detectado</div>
              <div className="wf-muted" style={{ marginTop: 2 }}>
                Tu consumo de combustible para <b>Planta Norte</b> en Marzo es <b>+38%</b> sobre el promedio
                de los últimos 6 meses (2.480 L). Puedes seguir guardando — solo queremos que lo veas.
              </div>
            </div>
          </div>
        </div>

        <div className="divider"></div>

        <div className="bd spread">
          <Btn kind="ghost" ico="←">Volver a editar</Btn>
          <div className="row">
            <Btn>Descartar</Btn>
            <Btn kind="primary" ico="✓">Confirmar y guardar</Btn>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ---- Success toast state ----
const ManualSuccess = () => (
  <div className="wf-screen" style={{ position: "relative" }}>
    <EmbedBar host="acme-corp.host / Recylink · Consumos" />
    <div className="wf-body">
      <ScreenHeader
        eyebrow="Registro manual"
        title="¡Listo! Consumo guardado"
      />
      <div className="wf-box" style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center", borderColor: "var(--rl-success-300)", background: "var(--rl-success-25)" }}>
        <div style={{ width: 56, height: 56, borderRadius: 999, background: "var(--rl-success-100)", color: "var(--rl-success-700)", display: "flex", alignItems: "center", justifyContent: "center", font: "700 28px/1 var(--rl-font-display)" }}>✓</div>
        <div className="wf-h2">1 registro agregado a tu base de datos</div>
        <div className="wf-muted" style={{ maxWidth: 460 }}>
          Combustible · <b>Petróleo Diésel</b> · Planta Norte · Marzo 2026 · 3.420 L · $1.847.230 CLP.
          Ya aparece en el dashboard y en la tabla detallada.
        </div>
        <div className="row" style={{ marginTop: 4 }}>
          <Btn>Registrar otro</Btn>
          <Btn kind="primary" ico="↗">Ver en dashboard</Btn>
          <Btn kind="ghost">Deshacer</Btn>
        </div>
      </div>

      <Toast kind="success" title="1 registro agregado"
        body="Acme Corp · Planta Norte · Marzo 2026 · Combustible"
        style={{ bottom: 20, right: 20 }} />
    </div>
  </div>
);

Object.assign(window, { ManualForm, ManualPreview, ManualSuccess });
