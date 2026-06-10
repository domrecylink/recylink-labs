// Preview editable — antes de escribir en BBDD

const PreviewEditable = () => (
  <div className="wf-screen">
    <EmbedBar host="acme-corp.host / Recylink · Consumos" />
    <div className="wf-body">
      <div className="row">
        <Btn size="sm" kind="ghost" ico="←">Volver a la cola</Btn>
        <span className="wf-hint">/ Subir documento / Revisar antes de guardar</span>
      </div>
      <ScreenHeader
        eyebrow="Preview editable · antes de escribir en BBDD"
        title={<>Revisa los datos extraídos · <span className="wf-scribble">8 filas</span></>}
        right={<>
          <Chip kind="info">Proveedor · Iconstruye Petróleo</Chip>
          <Chip>Tipo · Combustible</Chip>
          <Chip>L</Chip>
        </>}
      />
      <div className="wf-muted" style={{ maxWidth: 720 }}>
        Estos datos aún no están guardados. Haz click sobre cualquier celda para corregirla.
        La <b>Subcategoría</b> se prellenó desde el proveedor — puedes cambiarla por fila o dejar "Sin subcategoría".
      </div>

      {/* table */}
      <div className="wf-card" style={{ overflow: "visible" }}>
        <div className="hd">
          <div className="row">
            <div className="wf-h3">Datos extraídos</div>
            <Chip kind="success">5 ok</Chip>
            <Chip kind="warning">2 con aviso</Chip>
            <Chip kind="error">1 obligatorio falta</Chip>
          </div>
          <div className="row">
            <Btn size="sm" kind="ghost" ico="≡">Asignar subcat. en masa</Btn>
            <Btn size="sm" kind="ghost" ico="⇩">Exportar CSV</Btn>
          </div>
        </div>

        <table className="wf-table">
          <thead>
            <tr>
              <th style={{ width: 28 }}><input type="checkbox" defaultChecked /></th>
              <th>Sucursal</th>
              <th>Subcategoría</th>
              <th>Mes</th>
              <th className="num">Cantidad (L)</th>
              <th className="num">Costo (CLP)</th>
              <th>N° doc.</th>
              <th>Origen</th>
              <th style={{ width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><input type="checkbox" defaultChecked /></td>
              <td>Planta Norte</td>
              <td><Chip kind="info">Petróleo Diésel</Chip></td>
              <td>Marzo 2026</td>
              <td className="num">3.420</td>
              <td className="num">1.847.230</td>
              <td>0023412</td>
              <td className="wf-mono">petroleo_planta_norte…pdf</td>
              <td><Chip kind="success" dot={false}>✓</Chip></td>
            </tr>

            {/* row with focused / editing cell (subcat dropdown abierto) */}
            <tr>
              <td><input type="checkbox" defaultChecked /></td>
              <td>Planta Sur</td>
              <td className="cell-edit" style={{ position: "relative" }}>
                <span style={{ font: "600 12px/1 var(--rl-font-ui)", color: "var(--rl-action)" }}>Petróleo Diésel ▾</span>
                {/* open dropdown preview */}
                <div style={{
                  position: "absolute", left: 8, top: "calc(100% - 2px)", zIndex: 5,
                  width: 200, background: "#FFF",
                  border: "1.5px solid var(--rl-gray-300)",
                  borderRadius: 8, boxShadow: "var(--rl-shadow-md)", padding: 4,
                }}>
                  <div style={{ padding: "6px 10px", borderRadius: 6, background: "var(--rl-primary-50)", color: "var(--rl-action)", font: "600 12px/1 var(--rl-font-ui)" }}>Petróleo Diésel</div>
                  <div style={{ padding: "6px 10px", font: "var(--rl-text-sm)" }}>Kerosene</div>
                  <div style={{ padding: "6px 10px", font: "var(--rl-text-sm)" }}>GLP</div>
                  <div style={{ padding: "6px 10px", font: "var(--rl-text-sm)" }}>Gas Natural</div>
                  <div style={{ padding: "6px 10px", font: "var(--rl-text-sm)", color: "var(--rl-fg-muted)" }}>Sin subcategoría</div>
                  <div style={{ borderTop: "1px solid var(--rl-border-subtle)", padding: "6px 10px", font: "600 12px/1 var(--rl-font-ui)", color: "var(--rl-action)" }}>+ Crear nueva subcategoría…</div>
                </div>
              </td>
              <td>Marzo 2026</td>
              <td className="num">2.840</td>
              <td className="num">1.512.300</td>
              <td>0023415</td>
              <td className="wf-mono">petroleo_planta_sur…pdf</td>
              <td><Chip kind="success" dot={false}>✓</Chip></td>
            </tr>

            {/* outlier row */}
            <tr className="row-warn">
              <td><input type="checkbox" defaultChecked /></td>
              <td>Bodega RM</td>
              <td><Chip>Kerosene</Chip></td>
              <td>Marzo 2026</td>
              <td className="num"><b>5.240</b></td>
              <td className="num">3.604.200</td>
              <td>0023418</td>
              <td className="wf-mono">petroleo_bodega_RM…pdf</td>
              <td><Chip kind="warning" dot={false}>!</Chip></td>
            </tr>
            <tr className="row-warn">
              <td colSpan="9" style={{ padding: "8px 16px 12px 56px", borderBottom: "1px solid var(--rl-border-subtle)" }}>
                <div className="row" style={{ alignItems: "flex-start", gap: 10 }}>
                  <Ico tag="!" kind="warning" />
                  <div className="wf-hint" style={{ color: "var(--rl-warning-900)" }}>
                    <b>Dato atípico —</b> 5.240 L de Kerosene es <b>+52%</b> sobre el promedio de Bodega RM
                    para esta subcategoría (3.440 L, últimos 6 meses). No bloquea el guardado.
                    <a href="#" style={{ marginLeft: 8 }}>Ver historial</a>
                  </div>
                </div>
              </td>
            </tr>

            {/* duplicate row, inline resolution */}
            <tr className="row-warn">
              <td><input type="checkbox" /></td>
              <td>Oficina Central</td>
              <td><Chip>Petróleo Diésel</Chip></td>
              <td>Marzo 2026</td>
              <td className="num">412</td>
              <td className="num">342.180</td>
              <td>0023420</td>
              <td className="wf-mono">petroleo_oficina_central…pdf</td>
              <td><Chip kind="warning" dot={false}>⚠</Chip></td>
            </tr>
            <tr className="row-warn">
              <td colSpan="9" style={{ padding: "8px 16px 14px 56px", borderBottom: "1px solid var(--rl-border-subtle)" }}>
                <div style={{ background: "#FFF", border: "1.5px solid var(--rl-warning-300)", borderRadius: 8, padding: 12 }}>
                  <div className="spread" style={{ alignItems: "flex-start" }}>
                    <div style={{ display:"flex", gap: 10, alignItems: "flex-start" }}>
                      <Ico tag="⚠" kind="warning" />
                      <div>
                        <div style={{ font: "600 13px/18px var(--rl-font-display)", color: "var(--rl-warning-900)" }}>
                          Ya existe un registro para Oficina Central · Petróleo Diésel · Marzo 2026
                        </div>
                        <div className="wf-hint" style={{ marginTop: 2 }}>
                          Guardado el 28 Feb 2026 · 405 L / $329.880
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <Btn size="sm">Ignorar (no importar)</Btn>
                      <Btn size="sm" kind="primary">Sobrescribir existente</Btn>
                      <Btn size="sm" kind="ghost">Ver diff ▾</Btn>
                    </div>
                  </div>
                  <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div className="wf-box" style={{ padding: 10 }}>
                      <div className="wf-eyebrow">Existente (BBDD)</div>
                      <div className="row" style={{ gap: 18, marginTop: 6 }}>
                        <div><div className="wf-hint">Cantidad</div><div style={{ font: "600 14px/18px var(--rl-font-display)" }}>405 L</div></div>
                        <div><div className="wf-hint">Costo</div><div style={{ font: "600 14px/18px var(--rl-font-display)" }}>$329.880</div></div>
                        <div><div className="wf-hint">Subcat.</div><div style={{ font: "600 14px/18px var(--rl-font-display)" }}>Petróleo Diésel</div></div>
                      </div>
                    </div>
                    <div className="wf-box" style={{ padding: 10, borderColor: "var(--rl-action)", background: "var(--rl-primary-50)" }}>
                      <div className="wf-eyebrow" style={{ color: "var(--rl-action)" }}>Nuevo (este archivo)</div>
                      <div className="row" style={{ gap: 18, marginTop: 6 }}>
                        <div><div className="wf-hint">Cantidad</div><div style={{ font: "600 14px/18px var(--rl-font-display)" }}>412 L <span style={{ color: "var(--rl-warning-700)" }}>(+1,7%)</span></div></div>
                        <div><div className="wf-hint">Costo</div><div style={{ font: "600 14px/18px var(--rl-font-display)" }}>$342.180 <span style={{ color: "var(--rl-warning-700)" }}>(+3,7%)</span></div></div>
                        <div><div className="wf-hint">Subcat.</div><div style={{ font: "600 14px/18px var(--rl-font-display)" }}>Petróleo Diésel</div></div>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>

            {/* error / missing required */}
            <tr className="row-error">
              <td><input type="checkbox" defaultChecked /></td>
              <td>Planta Oeste</td>
              <td><span className="wf-hint" style={{ fontStyle: "italic" }}>Sin subcategoría</span></td>
              <td>Marzo 2026</td>
              <td className="num"><span style={{ color: "var(--rl-error-700)", fontWeight: 600 }}>—</span></td>
              <td className="num">1.520.044</td>
              <td>0023422</td>
              <td className="wf-mono">petroleo_planta_oeste…pdf</td>
              <td><Chip kind="error" dot={false}>×</Chip></td>
            </tr>
            <tr className="row-error">
              <td colSpan="9" style={{ padding: "8px 16px 12px 56px" }}>
                <div className="row" style={{ alignItems: "flex-start", gap: 10 }}>
                  <Ico tag="×" kind="error" />
                  <div className="wf-hint" style={{ color: "var(--rl-error-800)" }}>
                    <b>Falta el campo "Cantidad" —</b> no extrajimos el valor en litros del PDF.
                    Edita la celda para continuar, o desmarca la fila para no importarla.
                  </div>
                </div>
              </td>
            </tr>

            <tr>
              <td><input type="checkbox" defaultChecked /></td>
              <td>Sucursal V</td>
              <td><Chip>Petróleo Diésel</Chip></td>
              <td>Marzo 2026</td>
              <td className="num">1.820</td>
              <td className="num">980.910</td>
              <td>0023425</td>
              <td className="wf-mono">petroleo_sucursal_V…pdf</td>
              <td><Chip kind="success" dot={false}>✓</Chip></td>
            </tr>
          </tbody>
        </table>

        <div style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--rl-gray-50)" }}>
          <div className="wf-hint">
            <b>6 filas listas para guardar</b> · 1 fila con dato obligatorio faltante · 1 duplicado pendiente
          </div>
          <div className="row">
            <Btn kind="danger">Descartar todo</Btn>
            <Btn>Guardar borrador</Btn>
            <Btn kind="primary" ico="✓">Confirmar y guardar (6)</Btn>
          </div>
        </div>
      </div>

      <Anno style={{ position: "absolute", right: 36, top: 320 }}>
        Subcat. editable por fila — dropdown contextual con las predefinidas + opción
        "Sin subcategoría" + acceso a "Crear nueva".
      </Anno>
    </div>
  </div>
);

Object.assign(window, { PreviewEditable });
