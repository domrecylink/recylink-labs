// Step 3: Resumen — confirmation view (no empresa card, all items use subcats)

const Step3Resumen = ({ sucursales, items }) => (
  <div className="prt-stack-lg">
    {sucursales.map(suc => {
      const si = items[suc.id];
      if (!si) return null;
      const active = ["electricidad","combustible","agua","refrigerantes"].filter(t => si[t].activo);
      if (active.length === 0) return null;
      return (
        <Card key={suc.id}>
          <div className="ob-summary-suc-head">
            <div>
              <div className="prt-h4">{suc.nombre || "Sin nombre"}</div>
              {suc.direccion && <div className="prt-hint" style={{ marginTop: 2 }}>{suc.direccion}</div>}
            </div>
            <Chip size="sm">{active.length} ítem{active.length !== 1 ? "s" : ""}</Chip>
          </div>
          <div className="ob-summary-items">
            {active.map(type => (
              <ObSummaryItem key={type} type={type} data={si[type]} />
            ))}
          </div>
        </Card>
      );
    })}
  </div>
);

// Individual item in the summary — all types now have subcats
const ObSummaryItem = ({ type, data }) => {
  const def = OB_ITEM_DEFS[type];

  return (
    <div className="ob-summary-item">
      <div className="ob-summary-item-head">
        <span className="ob-item-ico sm" style={{ background: def.bg, color: def.color }}>
          <Icon name={def.icon} size={16} />
        </span>
        <span style={{ font: "600 14px/1 var(--rl-font-display)", color: "var(--rl-gray-900)" }}>{def.label}</span>
        {data.subcats && <span className="prt-hint" style={{ marginLeft: "auto" }}>{data.subcats.length} subcategoría{data.subcats.length !== 1 ? "s" : ""}</span>}
      </div>
      {data.subcats && data.subcats.length > 0 && (
        <div className="ob-summary-subcats">
          {data.subcats.map(sc => (
            <div key={sc.id} className="ob-summary-subcat-row">
              <span className="ob-summary-subcat-label">
                {type === "electricidad" && (
                  sistemaLabel(sc.sistemaElectrico) || "Sin sistema"
                )}
                {type === "combustible" && (
                  (tipoComLabel(sc.tipo, sc.tipoCustom) || "Sin tipo")
                  + (sc.uso ? " · " + usoLabel(sc.uso) : "")
                  + (sc.unidad ? " · " + unidadLabel(sc.unidad) : "")
                )}
                {type === "agua" && (
                  tipoAguaLabel(sc.tipo, sc.tipoCustom) || "Sin tipo"
                )}
                {type === "refrigerantes" && (
                  sc.tipo === "__otro" ? (sc.tipoCustom || "Otro") : (tipoRefriLabel(sc.tipo) || "Sin tipo")
                )}
              </span>
              <span className="prt-hint" style={{ flex: 1 }}>{proveedorDisplay(sc.proveedor, sc.proveedorCustom)}</span>
              {(type === "electricidad" || type === "combustible" || type === "agua") && (
                <ObClientBadge hasNum={!!sc.numCliente} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ObClientBadge = ({ hasNum }) => hasNum
  ? <Chip kind="success" size="sm"><Icon name="check" size={12} /> N° cliente</Chip>
  : <Chip size="sm">Sin N° cliente</Chip>;

Object.assign(window, { Step3Resumen, ObSummaryItem, ObClientBadge });
