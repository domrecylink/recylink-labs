// Step 2: Ítems a registrar — all items now use subcategories

const Step2Items = ({ sucursales, items, updateItem, setItems, errors }) => {
  const [activeSuc, setActiveSuc] = React.useState(sucursales[0]?.id || "");
  const suc = sucursales.find(s => s.id === activeSuc) || sucursales[0];
  const sucItems = suc ? items[suc.id] : null;

  const toggleItem = (type) => {
    if (!suc || !sucItems) return;
    const current = sucItems[type];
    const patch = { activo: !current.activo };
    if (!current.activo && current.subcats.length === 0) {
      patch.subcats = [mkSubcatFor(type)];
    }
    updateItem(suc.id, type, patch);
  };

  const addSubcat = (type) => {
    const item = sucItems[type];
    updateItem(suc.id, type, { subcats: [...item.subcats, mkSubcatFor(type)] });
  };

  const updateSubcat = (type, subId, patch) => {
    const item = sucItems[type];
    updateItem(suc.id, type, {
      subcats: item.subcats.map(sc => sc.id === subId ? { ...sc, ...patch } : sc)
    });
  };

  const removeSubcat = (type, subId) => {
    const item = sucItems[type];
    updateItem(suc.id, type, { subcats: item.subcats.filter(sc => sc.id !== subId) });
  };

  if (!suc || !sucItems) return null;

  return (
    <div className="prt-stack-lg">
      {sucursales.length > 1 && (
        <div className="ob-suc-tabs">
          {sucursales.map(s => {
            const si = items[s.id];
            const count = si ? ["electricidad","combustible","agua","refrigerantes"].filter(t => si[t].activo).length : 0;
            return (
              <button key={s.id} className={"ob-suc-tab" + (s.id === activeSuc ? " active" : "")} onClick={() => setActiveSuc(s.id)}>
                <span>{s.nombre || "Sin nombre"}</span>
                {count > 0 && <span className="ob-suc-tab-badge">{count}</span>}
              </button>
            );
          })}
        </div>
      )}

      <div className="prt-stack-md">
        {["electricidad", "combustible", "agua", "refrigerantes"].map(type => {
          const def = OB_ITEM_DEFS[type];
          const item = sucItems[type];
          return (
            <div key={type} className={"ob-item-card" + (item.activo ? " active" : "")}>
              <div className="ob-item-head" onClick={() => toggleItem(type)}>
                <span className="ob-item-ico" style={{ background: def.bg, color: def.color }}>
                  <Icon name={def.icon} size={20} />
                </span>
                <span className="ob-item-label">{def.label}</span>
                <button
                  className={"ob-toggle" + (item.activo ? " active" : "")}
                  onClick={e => { e.stopPropagation(); toggleItem(type); }}
                  aria-label={"Activar " + def.label}
                ></button>
              </div>
              {item.activo && (
                <div className="ob-item-body">
                  {type === "electricidad" && (
                    <ObElectricidadForm item={item}
                      onUpdate={(subId, patch) => updateSubcat(type, subId, patch)}
                      onAdd={() => addSubcat(type)}
                      onRemove={(subId) => removeSubcat(type, subId)} />
                  )}
                  {type === "combustible" && (
                    <ObCombustibleForm item={item}
                      onUpdate={(subId, patch) => updateSubcat(type, subId, patch)}
                      onAdd={() => addSubcat(type)}
                      onRemove={(subId) => removeSubcat(type, subId)} />
                  )}
                  {type === "agua" && (
                    <ObAguaForm item={item}
                      onUpdate={(subId, patch) => updateSubcat(type, subId, patch)}
                      onAdd={() => addSubcat(type)}
                      onRemove={(subId) => removeSubcat(type, subId)} />
                  )}
                  {type === "refrigerantes" && (
                    <ObRefrigerantesForm item={item}
                      onUpdate={(subId, patch) => updateSubcat(type, subId, patch)}
                      onAdd={() => addSubcat(type)}
                      onRemove={(subId) => removeSubcat(type, subId)} />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---- Electricidad form (subcategories with sistema eléctrico) ----
const ObElectricidadForm = ({ item, onUpdate, onAdd, onRemove }) => (
  <div className="prt-stack-md">
    {item.subcats.map((sc, i) => (
      <div key={sc.id} className="ob-subcat-block">
        <div className="ob-subcat-head">
          <span className="prt-hint" style={{ fontWeight: 700 }}>Subcategoría {i + 1}</span>
          {item.subcats.length > 1 && (
            <button className="ob-icon-btn sm" onClick={() => onRemove(sc.id)} title="Eliminar"><Icon name="close" size={14} /></button>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label={
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              Sistema eléctrico<span className="req">*</span>
              <span className="ob-tooltip-wrap">
                <Icon name="info" size={13} style={{ color: "var(--rl-gray-400)" }} />
                <span className="ob-tooltip">Determina el factor de emisión de electricidad aplicable</span>
              </span>
            </span>
          }>
            <Select value={sc.sistemaElectrico} onChange={v => onUpdate(sc.id, { sistemaElectrico: v })} options={OB_SISTEMAS} placeholder="Seleccionar…" />
          </Field>
          <Field label="Proveedor">
            <Select value={sc.proveedor} onChange={v => onUpdate(sc.id, { proveedor: v })} options={providerOpts("electricidad")} placeholder="Seleccionar proveedor…" />
          </Field>
          {sc.proveedor === "__otro" && (
            <Field label="Nombre del proveedor">
              <Input value={sc.proveedorCustom} onChange={v => onUpdate(sc.id, { proveedorCustom: v })} placeholder="Ingresa el nombre…" />
            </Field>
          )}
          <Field label="N° de cliente" helper="Sirve para el match automático con facturas">
            <Input value={sc.numCliente} onChange={v => onUpdate(sc.id, { numCliente: v })} placeholder="Opcional" />
          </Field>
        </div>
      </div>
    ))}
    <button className="ob-add-btn sm" onClick={onAdd}>
      <Icon name="add" size={16} /><span>Agregar subcategoría</span>
    </button>
  </div>
);

// ---- Combustible form (with unidad de medida) ----
const ObCombustibleForm = ({ item, onUpdate, onAdd, onRemove }) => (
  <div className="prt-stack-md">
    {item.subcats.map((sc, i) => (
      <div key={sc.id} className="ob-subcat-block">
        <div className="ob-subcat-head">
          <span className="prt-hint" style={{ fontWeight: 700 }}>Subcategoría {i + 1}</span>
          {item.subcats.length > 1 && (
            <button className="ob-icon-btn sm" onClick={() => onRemove(sc.id)} title="Eliminar"><Icon name="close" size={14} /></button>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Tipo" required>
            <Select value={sc.tipo} onChange={v => {
              const defUnit = fuelDefaultUnit(v);
              onUpdate(sc.id, { tipo: v, ...(defUnit ? { unidad: defUnit } : {}) });
            }} options={OB_TIPOS_COMBUSTIBLE.map(t => ({
              value: t.value,
              label: t.defaultUnit ? `${t.label} · ${t.defaultUnit}` : t.label,
            }))} placeholder="Seleccionar…" />
          </Field>
          {sc.tipo === "__otro" && (
            <Field label="Nombre del combustible">
              <Input value={sc.tipoCustom || ""} onChange={v => onUpdate(sc.id, { tipoCustom: v })} placeholder="Ej: Biogás" />
            </Field>
          )}
          <Field label={
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              Uso<span className="req">*</span>
              <span className="ob-tooltip-wrap">
                <Icon name="info" size={13} style={{ color: "var(--rl-gray-400)" }} />
                <span className="ob-tooltip">El uso (estacionario o móvil) determina el factor de emisión aplicable</span>
              </span>
            </span>
          }>
            <Select value={sc.uso} onChange={v => onUpdate(sc.id, { uso: v })} options={OB_USOS_COMBUSTIBLE} placeholder="Seleccionar…" />
          </Field>
          <Field label={sc.tipo && fuelDefaultUnit(sc.tipo)
            ? <span>Unidad de medida <span className="prt-hint" style={{ fontWeight: 400 }}>(pred: {fuelDefaultUnit(sc.tipo)})</span></span>
            : "Unidad de medida"}>
            <Select value={sc.unidad} onChange={v => onUpdate(sc.id, { unidad: v })} options={fuelUnitsForTipo(sc.tipo)} placeholder="Seleccionar…" />
          </Field>
          <Field label="Proveedor">
            <Select value={sc.proveedor} onChange={v => onUpdate(sc.id, { proveedor: v })} options={providerOpts("combustible")} placeholder="Seleccionar…" />
          </Field>
          {sc.proveedor === "__otro" && (
            <Field label="Nombre del proveedor">
              <Input value={sc.proveedorCustom} onChange={v => onUpdate(sc.id, { proveedorCustom: v })} placeholder="Nombre…" />
            </Field>
          )}
          <Field label="N° de cliente" helper="Match automático con facturas">
            <Input value={sc.numCliente} onChange={v => onUpdate(sc.id, { numCliente: v })} placeholder="Opcional" />
          </Field>
        </div>
      </div>
    ))}
    <button className="ob-add-btn sm" onClick={onAdd}>
      <Icon name="add" size={16} /><span>Agregar subcategoría</span>
    </button>
  </div>
);

// ---- Agua form (subcategories) ----
const ObAguaForm = ({ item, onUpdate, onAdd, onRemove }) => (
  <div className="prt-stack-md">
    {item.subcats.map((sc, i) => (
      <div key={sc.id} className="ob-subcat-block">
        <div className="ob-subcat-head">
          <span className="prt-hint" style={{ fontWeight: 700 }}>Subcategoría {i + 1}</span>
          {item.subcats.length > 1 && (
            <button className="ob-icon-btn sm" onClick={() => onRemove(sc.id)} title="Eliminar"><Icon name="close" size={14} /></button>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Tipo de agua" required>
            <Select value={sc.tipo} onChange={v => onUpdate(sc.id, { tipo: v })} options={OB_TIPOS_AGUA} placeholder="Seleccionar…" />
          </Field>
          {sc.tipo === "__otro" && (
            <Field label="Nombre del tipo">
              <Input value={sc.tipoCustom || ""} onChange={v => onUpdate(sc.id, { tipoCustom: v })} placeholder="Ej: Riego" />
            </Field>
          )}
          <Field label="Proveedor">
            <Select value={sc.proveedor} onChange={v => onUpdate(sc.id, { proveedor: v })} options={providerOpts("agua")} placeholder="Seleccionar proveedor…" />
          </Field>
          {sc.proveedor === "__otro" && (
            <Field label="Nombre del proveedor">
              <Input value={sc.proveedorCustom} onChange={v => onUpdate(sc.id, { proveedorCustom: v })} placeholder="Ingresa el nombre…" />
            </Field>
          )}
          <Field label="N° de cliente" helper="Sirve para el match automático con facturas">
            <Input value={sc.numCliente} onChange={v => onUpdate(sc.id, { numCliente: v })} placeholder="Opcional" />
          </Field>
        </div>
      </div>
    ))}
    <button className="ob-add-btn sm" onClick={onAdd}>
      <Icon name="add" size={16} /><span>Agregar subcategoría</span>
    </button>
  </div>
);

// ---- Refrigerantes form ----
const ObRefrigerantesForm = ({ item, onUpdate, onAdd, onRemove }) => (
  <div className="prt-stack-md">
    {item.subcats.map((sc, i) => (
      <div key={sc.id} className="ob-subcat-block">
        <div className="ob-subcat-head">
          <span className="prt-hint" style={{ fontWeight: 700 }}>Subcategoría {i + 1}</span>
          {item.subcats.length > 1 && (
            <button className="ob-icon-btn sm" onClick={() => onRemove(sc.id)} title="Eliminar"><Icon name="close" size={14} /></button>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Tipo de refrigerante" required>
            <Select value={sc.tipo} onChange={v => onUpdate(sc.id, { tipo: v })} options={OB_TIPOS_REFRIGERANTE} placeholder="Seleccionar…" />
          </Field>
          {sc.tipo === "__otro" && (
            <Field label="Nombre del refrigerante">
              <Input value={sc.tipoCustom || ""} onChange={v => onUpdate(sc.id, { tipoCustom: v })} placeholder="Ej: R-32" />
            </Field>
          )}
          <Field label="Proveedor">
            <Select value={sc.proveedor} onChange={v => onUpdate(sc.id, { proveedor: v })} options={providerOpts("refrigerantes")} placeholder="Opcional" />
          </Field>
          {sc.proveedor === "__otro" && (
            <Field label="Nombre del proveedor">
              <Input value={sc.proveedorCustom} onChange={v => onUpdate(sc.id, { proveedorCustom: v })} placeholder="Nombre…" />
            </Field>
          )}
        </div>
      </div>
    ))}
    <button className="ob-add-btn sm" onClick={onAdd}>
      <Icon name="add" size={16} /><span>Agregar subcategoría</span>
    </button>
  </div>
);

Object.assign(window, { Step2Items, ObElectricidadForm, ObCombustibleForm, ObAguaForm, ObRefrigerantesForm });
