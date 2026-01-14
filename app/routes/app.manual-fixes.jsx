import { useEffect, useMemo, useState } from "react";
import { useLoaderData } from "react-router";
import PropTypes from "prop-types";

import { authenticate } from "../shopify.server";
import { getIssues } from "../utils/fixEngine.server";

import ManualFixCard from "../components/ManualFixCard";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const issues = await getIssues(session.shop);

  const manual = issues.filter((i) => i.status === "open" && ["missing_images", "low_image_count", "out_of_stock"].includes(i.issueType));

  const manualCards = manual.map((i) => ({
    type: i.issueType,
    title: i.title,
    severity: i.issueType === "out_of_stock" ? "warning" : "info",
    resourceId: i.entityId,
    resourceTitle: i.title,
  }));

  return { shop: session.shop, manualCards };
};

function StatPill({ label, value }) {
  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        background: "#ffffff",
        borderRadius: 14,
        padding: "10px 12px",
        display: "flex",
        gap: 10,
        alignItems: "baseline",
      }}
    >
      <div style={{ fontSize: 12, color: "#64748b", fontWeight: 900 }}>{label}</div>
      <div style={{ fontSize: 14, color: "#0f172a", fontWeight: 900 }}>{value}</div>
    </div>
  );
}

StatPill.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default function ManualFixes() {
  const { shop, manualCards } = useLoaderData();

  const [dismissed, setDismissed] = useState([]);

  const visible = useMemo(() => {
    const set = new Set(dismissed);
    return (manualCards || []).filter((c, idx) => !set.has(`${c.resourceId || "x"}-${idx}`));
  }, [dismissed, manualCards]);

  const stats = useMemo(() => {
    const items = visible;
    const critical = items.filter((i) => i.severity === "critical").length;
    const warning = items.filter((i) => i.severity === "warning").length;
    const info = items.filter((i) => i.severity === "info").length;
    return { total: items.length, critical, warning, info };
  }, [visible]);

  useEffect(() => {
    // this effect is intentionally tied to stats
    // (keeps the page reactive without the eslint warning)
    void stats;
  }, [stats]);

  const onDismiss = (issue) => {
    // build a stable-ish key
    const idx = (manualCards || []).findIndex((x) => x === issue);
    setDismissed((prev) => [...prev, `${issue.resourceId || "x"}-${idx}`]);
  };

  return (
    <div style={{ padding: 18, display: "grid", gap: 14 }}>
      <div
        style={{
          border: "1px solid #e5e7eb",
          background: "linear-gradient(180deg, #ffffff 0%, #fbfbfd 100%)",
          borderRadius: 18,
          padding: 16,
          display: "grid",
          gap: 10,
        }}
      >
        <div style={{ display: "grid", gap: 4 }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#0f172a" }}>Manual checks</div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            Klara flags these because auto-fixing them could break inventory or require real photos.
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Store: {shop}</div>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <StatPill label="Total" value={stats.total} />
          <StatPill label="Critical" value={stats.critical} />
          <StatPill label="Warning" value={stats.warning} />
          <StatPill label="Info" value={stats.info} />
        </div>
      </div>

      <ManualFixCard issues={visible} shop={shop} onDismiss={onDismiss} />
    </div>
  );
}

