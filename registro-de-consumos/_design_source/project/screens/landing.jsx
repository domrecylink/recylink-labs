// Landing / Selector de modo — 2 variantes

// ---- Variant A: dos tarjetas grandes lado a lado ----
const LandingA = () => (
  <div className="wf-screen">
    <EmbedBar host="acme-corp.host / Recylink · Consumos" />
    <div className="wf-body">
      <ScreenHeader
        eyebrow="Registro de consumos"
        title={<>Hola Acme Corp · <span className="wf-scribble">Marzo 2026</span></>}
        right={<>
          <Chip kind="info">Empresa fija desde host</Chip>
          <Btn kind="ghost" ico="↗">Ver dashboard</Btn>
        </>}
      />
      <div className="wf-muted" style={{ maxWidth: 620, marginBottom: 4 }}>
        ¿Cómo quieres ingresar tus consumos de este mes? Puedes registrarlos
        a mano o subir las facturas y boletas que ya tienes.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 8 }}>
        {/* Tile 1 */}
        <div className="wf-box" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 14, minHeight: 280 }}>
          <Ico tag="✎" size="xl" kind="brand" />
          <div className="wf-h2"><span className="ink">Registrar manualmente</span></div>
          <div className="wf-muted">
            Ingresa un consumo a la vez completando un formulario corto.
            Ideal cuando no tienes el documento o son pocos datos.
          </div>
          <ul style={{ margin: "4px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
            <li className="wf-hint">· 1–2 minutos por registro</li>
            <li className="wf-hint">· Validación inline + preview antes de guardar</li>
          </ul>
          <div style={{ marginTop: "auto" }}>
            <Btn kind="primary" size="lg">Empezar registro manual →</Btn>
          </div>
        </div>

        {/* Tile 2 */}
        <div className="wf-box" style={{ padding: 28, display: "flex", flexDirection: "column", gap: 14, minHeight: 280, position: "relative" }}>
          <Ico tag="⇪" size="xl" kind="brand" />
          <div className="wf-h2"><span className="ink">Subir documento</span></div>
          <div className="wf-muted">
            Carga facturas o boletas en PDF / Excel. Las extraemos
            automáticamente y tú confirmas antes de guardar.
          </div>
          <div className="row" style={{ flexWrap: "wrap", gap: 6 }}>
            <Chip>Enel</Chip>
            <Chip>Aguas Andinas</Chip>
            <Chip>Iconstruye Petróleo</Chip>
            <Chip>Iconstruye Gas</Chip>
          </div>
          <div style={{ marginTop: "auto" }}>
            <Btn kind="primary" size="lg">Subir documento →</Btn>
          </div>
        </div>
      </div>

      {/* Secondary access */}
      <div className="wf-box-dashed" style={{ padding: 18, marginTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="row">
          <Ico tag="≣" size="lg" />
          <div>
            <div className="wf-h3">¿Solo quieres revisar?</div>
            <div className="wf-hint">Ve tus consumos, KPIs y la tabla detallada por sucursal.</div>
          </div>
        </div>
        <Btn>Ver dashboard</Btn>
      </div>

      <div className="wf-hint" style={{ marginTop: "auto" }}>
        Última actualización · 02 Jun 2026 09:14 · 124 registros este mes
      </div>
    </div>
  </div>
);

// ---- Variant B: Wizard-pregunta (dos círculos) ----
const LandingB = () => (
  <div className="wf-screen">
    <EmbedBar host="acme-corp.host / Recylink · Consumos" />
    <div className="wf-body" style={{ alignItems: "center", justifyContent: "center", gap: 28 }}>
      <div style={{ textAlign: "center", maxWidth: 560 }}>
        <div className="wf-eyebrow">Acme Corp · Marzo 2026</div>
        <div className="wf-h1" style={{ marginTop: 8, fontSize: 32, lineHeight: "38px" }}>
          ¿Qué quieres hacer hoy?
        </div>
        <div className="wf-muted" style={{ marginTop: 8 }}>
          Elige una opción para empezar. Siempre puedes volver atrás.
        </div>
      </div>

      <div style={{ display: "flex", gap: 40, justifyContent: "center", alignItems: "flex-start", marginTop: 8 }}>
        {/* circle A */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: 220 }}>
          <div style={{
            width: 160, height: 160, borderRadius: "50%",
            border: "2px solid var(--rl-action)", background: "var(--rl-primary-50)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
            color: "var(--rl-action)"
          }}>
            <Ico tag="✎" size="xl" kind="brand" style={{ background: "#FFF" }} />
            <div style={{ font: "700 15px/20px var(--rl-font-display)" }}>Registrar a mano</div>
          </div>
          <div className="wf-hint" style={{ textAlign: "center" }}>
            1 consumo a la vez. Form corto + preview antes de guardar.
          </div>
        </div>

        {/* circle B */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, width: 220 }}>
          <div style={{
            width: 160, height: 160, borderRadius: "50%",
            border: "2px dashed var(--rl-gray-400)", background: "#FFF",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
            color: "var(--rl-fg)"
          }}>
            <Ico tag="⇪" size="xl" />
            <div style={{ font: "700 15px/20px var(--rl-font-display)" }}>Subir documento</div>
          </div>
          <div className="wf-hint" style={{ textAlign: "center" }}>
            PDF o Excel de Enel, Aguas Andinas, Iconstruye…
          </div>
        </div>
      </div>

      <div className="divider" style={{ maxWidth: 480, marginTop: 12 }}></div>

      <div className="row" style={{ justifyContent: "center" }}>
        <span className="wf-hint">¿Solo quieres mirar?</span>
        <Btn kind="ghost" ico="↗">Ir al dashboard</Btn>
      </div>

      <Anno style={{ position: "static", maxWidth: 360, marginTop: 24 }}>
        Variante "pregunta directa" — la opción seleccionada queda con borde
        sólido azul; la otra opción se mantiene punteada hasta hover.
      </Anno>
    </div>
  </div>
);

Object.assign(window, { LandingA, LandingB });
