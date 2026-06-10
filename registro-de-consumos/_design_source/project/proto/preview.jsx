// Preview editable table — review extracted rows before writing to records

const PreviewEditableView = () => {
  const { state, dispatch } = useApp();
  const rows = state.previewRows;
  const okCount = rows.filter(r => r.status !== "error").length;
  const warnCount = rows.filter(r => r.status === "warn").length;
  const errCount = rows.filter(r => r.status === "error").length;

  return (
    <div>
      <SectionHead
        eyebrow="Subir documento · paso 3 de 3"
        title="Revisa los datos extraídos"
        sub="Haz clic en cualquier celda para editarla. Los datos no se guardan hasta que confirmes."
        right={<Btn kind="ghost" icon="arrow_back" onClick={() => dispatch({ type: "UPLOAD/SET_STEP", step: 2 })}>Volver a la cola</Btn>}
      />
      <div style={{ marginBottom: 22 }}>
        <Steps items={["Proveedor", "Subir", "Revisar"]} current={2} />
      </div>

      {/* Status banner */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div className="prt-row" style={{
          background: "var(--rl-success-50)", border: "1px solid var(--rl-success-200)",
          borderRadius: 10, padding: "10px 14px", gap: 8,
        }}>
          <Icon name="check_circle" size={18} style={{ color: "var(--rl-success-700)" }} />
          <span style={{ font: "600 13px/1 var(--rl-font-display)", color: "var(--rl-success-700)" }}>
            {okCount} {okCount === 1 ? "registro listo" : "registros listos"} para guardar
          </span>
        </div>
        {warnCount > 0 && (
          <div className="prt-row" style={{
            background: "var(--rl-warning-50)", border: "1px solid var(--rl-warning-200)",
            borderRadius: 10, padding: "10px 14px", gap: 8,
          }}>
            <Icon name="warning" size={18} style={{ color: "var(--rl-warning-700)" }} />
            <span style={{ font: "600 13px/1 var(--rl-font-display)", color: "var(--rl-warning-700)" }}>
              {warnCount} con valor atípico — revisar
            </span>
          </div>
        )}
        {errCount > 0 && (
          <div className="prt-row" style={{
            background: "var(--rl-error-50)", border: "1px solid var(--rl-error-200)",
            borderRadius: 10, padding: "10px 14px", gap: 8,
          }}>
            <Icon name="error" size={18} style={{ color: "var(--rl-error-700)" }} />
            <span style={{ font: "600 13px/1 var(--rl-font-display)", color: "var(--rl-error-700)" }}>
              {errCount} con campos vacíos — completa o elimina
            </span>
          </div>
        )}
      </div>

      <Card flush>
        <div className="prt-card-head">
          <div className="prt-h3">{rows.length} filas detectadas</div>
          <div className="prt-hint">Editables · click en celda</div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="prt-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th>Fecha</th>
                <th>Sucursal</th>
                <th>Tipo</th>
                <th>Subcategoría</th>
                <th className="num">Cantidad</th>
                <th className="num">Costo (CLP)</th>
                <th>Archivo</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => <PreviewRow key={r.id} row={r} />)}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="prt-spread" style={{ marginTop: 22 }}>
        <Btn kind="ghost" onClick={() => dispatch({ type: "UPLOAD/RESET" })}>Cancelar todo</Btn>
        <Btn
          kind="primary"
          icon="check"
          disabled={okCount === 0}
          onClick={() => {
            dispatch({ type: "PREVIEW/CONFIRM_ALL" });
            dispatch({ type: "NAVIGATE", view: "dashboard" });
            dispatch({ type: "TOAST/SHOW", toast: {
              kind: "success",
              title: `${okCount} registros guardados`,
              body: "Los datos ya aparecen en el dashboard.",
            }});
          }}
        >
          Guardar {okCount} registros{warnCount + errCount > 0 ? ` (omitir ${errCount} con error)` : ""}
        </Btn>
      </div>
    </div>
  );
};

const PreviewRow = ({ row }) => {
  const { state, dispatch } = useApp();
  const [editing, setEditing] = React.useState(null);

  const update = (field, value) => {
    const patch = { [field]: value };
    // Auto-clear error status if all required filled
    if (row.status === "error" && row.cantidad && row.costo && field === "cantidad" && value) patch.status = "ok";
    dispatch({ type: "PREVIEW/UPDATE_ROW", id: row.id, patch });
  };

  const rowCls = row.status === "warn" ? "row-warn" : row.status === "error" ? "row-error" : "";
  const subOptions = state.subcategories[row.type] || [];

  const editCell = (field) => setEditing(field);
  const commit = () => setEditing(null);

  return (
    <tr className={"editable " + rowCls}>
      <td>
        {row.status === "warn" && <Icon name="warning" size={18} style={{ color: "var(--rl-warning-700)" }} />}
        {row.status === "error" && <Icon name="error" size={18} style={{ color: "var(--rl-error-700)" }} />}
        {row.status === "ok" && <Icon name="check_circle" size={18} style={{ color: "var(--rl-success-600)" }} fill />}
      </td>

      {/* Fecha */}
      <td onClick={() => editCell("date")} className={editing === "date" ? "cell-edit" : ""}>
        {editing === "date"
          ? <input type="date" value={row.date} autoFocus onChange={e => update("date", e.target.value)} onBlur={commit} />
          : fmtDate(row.date)}
      </td>

      {/* Sucursal */}
      <td onClick={() => editCell("sucursal")} className={editing === "sucursal" ? "cell-edit" : ""}>
        {editing === "sucursal"
          ? <select autoFocus value={row.sucursal} onChange={e => update("sucursal", e.target.value)} onBlur={commit} style={{ border: "none", outline: "none", background: "transparent", width: "100%", padding: "0 16px", height: 44, font: "500 13px/1 var(--rl-font-body)", color: "var(--rl-gray-900)" }}>
              {SUCURSALES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          : row.sucursal}
      </td>

      {/* Tipo */}
      <td>
        <TypeIndicator type={row.type} withLabel />
      </td>

      {/* Subcategoría */}
      <td onClick={() => editCell("subcat")} className={editing === "subcat" ? "cell-edit" : ""}>
        {editing === "subcat" && subOptions.length > 0
          ? <select autoFocus value={row.subcat || ""} onChange={e => update("subcat", e.target.value)} onBlur={commit} style={{ border: "none", outline: "none", background: "transparent", width: "100%", padding: "0 16px", height: 44, font: "500 13px/1 var(--rl-font-body)", color: "var(--rl-gray-900)" }}>
              <option value="">—</option>
              {subOptions.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          : (row.subcat ? <Chip>{subcatLabel(row.type, row.subcat)}</Chip>
              : (subOptions.length > 0 ? <em style={{ color: "var(--rl-gray-400)" }}>elegir…</em> : <span className="prt-hint">—</span>))}
      </td>

      {/* Cantidad */}
      <td className="num" onClick={() => editCell("cantidad")} style={editing === "cantidad" ? { background: "var(--rl-primary-50)", outline: "2px solid var(--rl-primary-900)", outlineOffset: -2, padding: 0 } : {}}>
        {editing === "cantidad"
          ? <input type="number" value={row.cantidad} autoFocus onChange={e => update("cantidad", e.target.value)} onBlur={commit} onKeyDown={e => e.key === "Enter" && commit()} style={{ width: "100%", height: 44, border: "none", outline: "none", background: "transparent", padding: "0 16px", font: "500 13px/1 var(--rl-font-body)", textAlign: "right", color: "var(--rl-gray-900)" }} />
          : (row.cantidad === "" ? <span style={{ color: "var(--rl-error-700)", fontStyle: "italic" }}>vacío</span> : <span>{fmtNum(row.cantidad)} <span style={{ color: "var(--rl-gray-500)", fontSize: 12 }}>{TYPES[row.type].unit}</span></span>)}
      </td>

      {/* Costo */}
      <td className="num" onClick={() => editCell("costo")} style={editing === "costo" ? { background: "var(--rl-primary-50)", outline: "2px solid var(--rl-primary-900)", outlineOffset: -2, padding: 0 } : {}}>
        {editing === "costo"
          ? <input type="number" value={row.costo} autoFocus onChange={e => update("costo", e.target.value)} onBlur={commit} onKeyDown={e => e.key === "Enter" && commit()} style={{ width: "100%", height: 44, border: "none", outline: "none", background: "transparent", padding: "0 16px", font: "500 13px/1 var(--rl-font-body)", textAlign: "right", color: "var(--rl-gray-900)" }} />
          : (row.costo === "" ? <span style={{ color: "var(--rl-error-700)", fontStyle: "italic" }}>vacío</span> : fmtCLP(row.costo))}
      </td>

      {/* Archivo */}
      <td>
        <span className="prt-hint" title={row.sourceFile} style={{ display: "inline-block", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.sourceFile}</span>
      </td>

      {/* Actions */}
      <td>
        <div className="prt-row" style={{ gap: 4 }}>
          <button
            onClick={() => dispatch({ type: "PREVIEW/DUPLICATE_ROW", id: row.id })}
            title="Duplicar fila"
            style={{ all: "unset", cursor: "pointer", padding: 6, color: "var(--rl-gray-500)", borderRadius: 6 }}
          ><Icon name="content_copy" size={16} /></button>
          <button
            onClick={() => dispatch({ type: "PREVIEW/DELETE_ROW", id: row.id })}
            title="Eliminar fila"
            style={{ all: "unset", cursor: "pointer", padding: 6, color: "var(--rl-error-600)", borderRadius: 6 }}
          ><Icon name="delete" size={16} /></button>
        </div>
      </td>
    </tr>
  );
};

Object.assign(window, { PreviewEditableView });
