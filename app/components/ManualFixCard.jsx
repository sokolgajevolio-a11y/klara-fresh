import PropTypes from "prop-types";

/**
 * ManualFixCard
 * This component is for issues Klara cannot safely auto-fix (ex: missing images).
 * It shows clean cards and lets you dismiss them.
 */

function SeverityPill({ severity }) {
  const cfg =
    severity === "critical"
      ? { bg: "#fee2e2", fg: "#991b1b", bd: "#fecaca", label: "Critical" }
      : severity === "warning"
        ? { bg: "#fef3c7", fg: "#92400e", bd: "#fde68a", label: "Warning" }
        : { bg: "#e0f2fe", fg: "#075985", bd: "#bae6fd", label: "Info" };

  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 800,
        padding: "3px 10px",
        borderRadius: 999,
        background: cfg.bg,
        color: cfg.fg,
        border: `1px solid ${cfg.bd}`,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
      }}
      title={cfg.label}
    >
      {cfg.label}
    </span>
  );
}

SeverityPill.propTypes = {
  severity: PropTypes.oneOf(["critical", "warning", "info"]),
};

SeverityPill.defaultProps = {
  severity: "info",
};

function ManualFixItem({ issue, shop, onDismiss }) {
  const title = issue?.title || "Manual Fix Needed";
  const type = issue?.type || "manual";
  const resourceTitle = issue?.resourceTitle || "Item";
  const resourceId = issue?.resourceId || "";

  const whyText =
    type === "missing_images"
      ? "This item needs images uploaded. Klara cannot create real product photos yet."
      : type === "out_of_stock"
        ? "Inventory is zero. Klara will not change inventory automatically for safety."
        : "This item needs a manual check to avoid unintended changes.";

  const link = resourceId
    ? `https://${shop}/admin/${type === "product" ? "products" : "products"}/${resourceId}`
    : null;

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        background: "#ffffff",
        borderRadius: 16,
        padding: 14,
        display: "grid",
        gap: 10,
        boxShadow: "0 1px 0 rgba(15,23,42,0.03)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "grid", gap: 2 }}>
          <div style={{ fontWeight: 900, color: "#0f172a", fontSize: 14 }}>{title}</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            {resourceTitle}
            {resourceId ? ` · ID ${resourceId}` : ""}
          </div>
        </div>

        <SeverityPill severity={issue?.severity || "warning"} />
      </div>

      <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.35 }}>{whyText}</div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            style={{
              textDecoration: "none",
              padding: "9px 12px",
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              background: "#f8fafc",
              color: "#0f172a",
              fontWeight: 900,
              fontSize: 13,
            }}
          >
            Open in Shopify
          </a>
        ) : null}

        <button
          type="button"
          onClick={() => onDismiss(issue)}
          style={{
            padding: "9px 12px",
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            background: "#ffffff",
            color: "#334155",
            fontWeight: 900,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

ManualFixItem.propTypes = {
  issue: PropTypes.shape({
    type: PropTypes.string,
    title: PropTypes.string,
    severity: PropTypes.oneOf(["critical", "warning", "info"]),
    resourceId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    resourceTitle: PropTypes.string,
  }).isRequired,
  shop: PropTypes.string.isRequired,
  onDismiss: PropTypes.func.isRequired,
};

export default function ManualFixCard({ issues, shop, onDismiss }) {
  const items = Array.isArray(issues) ? issues : [];

  if (items.length === 0) {
    return (
      <div
        style={{
          border: "1px solid #e5e7eb",
          background: "#ffffff",
          borderRadius: 18,
          padding: 18,
          color: "#64748b",
          fontSize: 13,
        }}
      >
        No manual items right now.
      </div>
    );
  }

  const counts = items.reduce(
    (acc, it) => {
      const sev = it?.severity || "warning";
      acc[sev] = (acc[sev] || 0) + 1;
      return acc;
    },
    { critical: 0, warning: 0, info: 0 },
  );

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "grid", gap: 3 }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#0f172a" }}>Needs a human check</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            These are intentionally not auto-fixed to avoid risky changes.
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {counts.critical ? <SeverityPill severity="critical" /> : null}
          {counts.warning ? <SeverityPill severity="warning" /> : null}
          {counts.info ? <SeverityPill severity="info" /> : null}
        </div>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {items.map((issue, idx) => (
          <ManualFixItem key={`${issue?.resourceId || "x"}-${idx}`} issue={issue} shop={shop} onDismiss={onDismiss} />
        ))}
      </div>
    </div>
  );
}

ManualFixCard.propTypes = {
  issues: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string,
      title: PropTypes.string,
      severity: PropTypes.oneOf(["critical", "warning", "info"]),
      resourceId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      resourceTitle: PropTypes.string,
    }),
  ),
  shop: PropTypes.string.isRequired,
  onDismiss: PropTypes.func.isRequired,
};

ManualFixCard.defaultProps = {
  issues: [],
};

 