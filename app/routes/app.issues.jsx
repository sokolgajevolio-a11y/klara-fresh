import { useEffect, useMemo, useState } from "react";
import { useLoaderData, useFetcher, useSearchParams } from "react-router";
import PropTypes from "prop-types";

import { authenticate } from "../shopify.server";
import { getIssues } from "../utils/fixEngine.server";
import prisma from "../db.server";
import { ImageFixCard } from "../components/ImageFixCard";

import {
  generateProductDescription,
  generateSeoDescription,
  generateSeoTitle,
  generateAltText,
  generateSku,
} from "../utils/aiGenerator.server";

const ISSUE_LABELS = {
  missing_description: "Missing Description",
  missing_seo_description: "Missing SEO Description",
  missing_seo_title: "Missing SEO Title",
  missing_alt_text: "Missing Alt Text",
  missing_sku: "Missing SKU",
  missing_tags: " " ,
  missing_vendor: "Missing Vendor",
  missing_product_type: "Missing Product Type",
  missing_images: "No Images",
  low_image_count: "Only 1 Image",
  out_of_stock: "Out of Stock",
  not_in_collection: "Not in Collection",
};

const AI_FIXABLE = new Set([
  "missing_description",
  "missing_seo_description",
  "missing_seo_title",
  "missing_alt_text",
  "missing_sku",
]);

const MANUAL_ONLY = new Set(["missing_images", "low_image_count", "out_of_stock"]);

function Pill({ children, tone }) {
  const cfg =
    tone === "good"
      ? { bg: "#dcfce7", fg: "#166534", bd: "#bbf7d0" }
      : tone === "warn"
        ? { bg: "#fef3c7", fg: "#92400e", bd: "#fde68a" }
        : { bg: "#eef2ff", fg: "#3730a3", bd: "#c7d2fe" };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 900,
        background: cfg.bg,
        color: cfg.fg,
        border: `1px solid ${cfg.bd}`,
        gap: 6,
      }}
    >
      {children}
    </span>
  );
}

Pill.propTypes = {
  children: PropTypes.node.isRequired,
  tone: PropTypes.oneOf(["good", "warn", "info"]),
};

Pill.defaultProps = {
  tone: "info",
};

function PrimaryButton({ children, onClick, variant, disabled }) {
  const styles =
    variant === "secondary"
      ? {
          background: "#ffffff",
          color: "#4f46e5",
          border: "1px solid #c7d2fe",
        }
      : variant === "danger"
        ? {
            background: "#ef4444",
            color: "#ffffff",
            border: "1px solid #ef4444",
          }
        : {
            background: "#4f46e5",
            color: "#ffffff",
            border: "1px solid #4f46e5",
          };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "10px 14px",
        borderRadius: 12,
        fontWeight: 900,
        fontSize: 13,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.65 : 1,
        ...styles,
      }}
    >
      {children}
    </button>
  );
}

PrimaryButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(["primary", "secondary", "danger"]),
  disabled: PropTypes.bool,
};

PrimaryButton.defaultProps = {
  variant: "primary",
  disabled: false,
};

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  const issues = await getIssues(session.shop);

  const fixedIssueIds = issues.filter((i) => i.status === "fixed").map((i) => i.id);

  const fixHistory = await prisma.fixHistory.findMany({
    where: { issueId: { in: fixedIssueIds }, success: true },
    orderBy: { createdAt: "desc" },
  });

  const fixHistoryMap = {};
  fixHistory.forEach((fh) => {
    if (!fixHistoryMap[fh.issueId]) fixHistoryMap[fh.issueId] = fh;
  });

  return { issues, fixHistoryMap };
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const formData = await request.formData();
  const issueId = formData.get("issueId");
  const intent = formData.get("intent");

  const issue = await prisma.issue.findUnique({ where: { id: issueId } });
  if (!issue) return { error: "Issue not found", issueId };

  if (intent === "generate") {
    let productId = issue.entityId;
    if (issue.entityType === "image" || issue.entityType === "variant") {
      productId = issue.parentId || issue.entityId;
    }

    const productResponse = await admin.graphql(
      `query($id: ID!) {
        product(id: $id) {
          id
          title
          vendor
          productType
          tags
        }
      }`,
      { variables: { id: productId } },
    );

    const productData = await productResponse.json();
    const product = productData.data?.product;
    if (!product) return { error: "Could not fetch product", issueId };

    try {
      let generated = "";

      if (issue.issueType === "missing_description") generated = await generateProductDescription(product);
      else if (issue.issueType === "missing_seo_description") generated = await generateSeoDescription(product);
      else if (issue.issueType === "missing_seo_title") generated = await generateSeoTitle(product);
      else if (issue.issueType === "missing_alt_text") generated = await generateAltText(product, 0);
      else if (issue.issueType === "missing_sku") generated = await generateSku(product);
      else return { error: "This issue type is not auto-fixable yet", issueId };

      return { generated, issueId, intent: "generate" };
    } catch (err) {
      return { error: `AI error: ${err.message}`, issueId };
    }
  }

  if (intent === "apply") {
    const newValue = formData.get("newValue");
    if (!newValue) return { error: "No value provided", issueId };

    let success = false;
    let errorMessage = null;
    let afterSnapshot = {};

    try {
      if (issue.issueType === "missing_seo_description") {
        const res = await admin.graphql(
          `mutation($input: ProductInput!) {
            productUpdate(input: $input) {
              product { id }
              userErrors { field message }
            }
          }`,
          { variables: { input: { id: issue.entityId, seo: { description: newValue } } } },
        );

        const data = await res.json();
        if (data.data?.productUpdate?.userErrors?.length) throw new Error(data.data.productUpdate.userErrors[0].message);

        afterSnapshot = { seoDescription: newValue };
        success = true;
      } else if (issue.issueType === "missing_seo_title") {
        const res = await admin.graphql(
          `mutation($input: ProductInput!) {
            productUpdate(input: $input) {
              product { id }
              userErrors { field message }
            }
          }`,
          { variables: { input: { id: issue.entityId, seo: { title: newValue } } } },
        );

        const data = await res.json();
        if (data.data?.productUpdate?.userErrors?.length) throw new Error(data.data.productUpdate.userErrors[0].message);

        afterSnapshot = { seoTitle: newValue };
        success = true;
      } else if (issue.issueType === "missing_description") {
        const res = await admin.graphql(
          `mutation($input: ProductInput!) {
            productUpdate(input: $input) {
              product { id }
              userErrors { field message }
            }
          }`,
          { variables: { input: { id: issue.entityId, descriptionHtml: `<p>${newValue}</p>` } } },
        );

        const data = await res.json();
        if (data.data?.productUpdate?.userErrors?.length) throw new Error(data.data.productUpdate.userErrors[0].message);

        afterSnapshot = { description: newValue };
        success = true;
      } else if (issue.issueType === "missing_alt_text") {
        const res = await admin.graphql(
          `mutation($productId: ID!, $media: [UpdateMediaInput!]!) {
            productUpdateMedia(productId: $productId, media: $media) {
              media { id }
              userErrors { field message }
            }
          }`,
          { variables: { productId: issue.parentId, media: [{ id: issue.entityId, alt: newValue }] } },
        );

        const data = await res.json();
        if (data.data?.productUpdateMedia?.userErrors?.length)
          throw new Error(data.data.productUpdateMedia.userErrors[0].message);

        afterSnapshot = { altText: newValue };
        success = true;
      } else if (issue.issueType === "missing_sku") {
        const res = await admin.graphql(
          `mutation($input: ProductVariantInput!) {
            productVariantUpdate(input: $input) {
              productVariant { id }
              userErrors { field message }
            }
          }`,
          { variables: { input: { id: issue.entityId, sku: newValue } } },
        );

        const data = await res.json();
        if (data.data?.productVariantUpdate?.userErrors?.length)
          throw new Error(data.data.productVariantUpdate.userErrors[0].message);

        afterSnapshot = { sku: newValue };
        success = true;
      } else {
        return { error: "Unsupported issue type for apply", issueId };
      }

      if (success) {
        await prisma.issue.update({ where: { id: issue.id }, data: { status: "fixed" } });
        await prisma.fixHistory.create({
          data: {
            issueId: issue.id,
            action: `fix_${issue.issueType}`,
            beforeSnapshot: JSON.stringify({}),
            afterSnapshot: JSON.stringify(afterSnapshot),
            success: true,
          },
        });
      }
    } catch (err) {
      success = false;
      errorMessage = err.message;
    }

    return { applied: true, success, error: errorMessage, issueId, afterSnapshot };
  }

  return { error: "Unknown intent", issueId };
};

function IssueCard({ issue, fixHistoryMap, onOpen }) {
  const [expanded, setExpanded] = useState(false);
  const [generatedValue, setGeneratedValue] = useState("");
  const [editedValue, setEditedValue] = useState("");
  const [applied, setApplied] = useState(false);
  const [appliedValue, setAppliedValue] = useState("");

  const fetcher = useFetcher();

  const isFixed = issue.status === "fixed" || applied;
  const isAiFixable = AI_FIXABLE.has(issue.issueType);
  const isManualOnly = MANUAL_ONLY.has(issue.issueType);

  const isLoading = fetcher.state !== "idle";
  const historicalFix = fixHistoryMap[issue.id];

  useEffect(() => {
    if (!fetcher.data || fetcher.data.issueId !== issue.id) return;

    if (fetcher.data.intent === "generate" && fetcher.data.generated) {
      setGeneratedValue(fetcher.data.generated);
      setEditedValue(fetcher.data.generated);
    }

    if (fetcher.data.applied && fetcher.data.success) {
      const v = Object.values(fetcher.data.afterSnapshot || {})[0] || editedValue;
      setApplied(true);
      setAppliedValue(v);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.data, issue.id]);

  const label = ISSUE_LABELS[issue.issueType] || issue.issueType;

  const handleGenerate = () => {
    setGeneratedValue("");
    setEditedValue("");
    fetcher.submit({ issueId: issue.id, intent: "generate" }, { method: "post" });
  };

  const handleApply = () => {
    fetcher.submit({ issueId: issue.id, intent: "apply", newValue: editedValue }, { method: "post" });
  };

  return (
    <div
      style={{
        border: isFixed ? "1px solid #bbf7d0" : "1px solid #e5e7eb",
        background: isFixed ? "#f0fdf4" : "#ffffff",
        borderRadius: 18,
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => {
          setExpanded((v) => !v);
          onOpen(issue);
        }}
        style={{
          width: "100%",
          textAlign: "left",
          background: "transparent",
          border: "none",
          padding: "16px 18px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ display: "grid", gap: 6 }}>
          <div style={{ fontWeight: 900, color: "#0f172a", fontSize: 14 }}>{issue.title}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <Pill tone={isFixed ? "good" : "info"}>{label}</Pill>
            {isFixed ? <Pill tone="good">✓ Fixed</Pill> : null}
            {isManualOnly ? <Pill tone="warn">Human check</Pill> : null}
          </div>
        </div>

        <div style={{ color: "#94a3b8", fontWeight: 900 }}>{expanded ? "▲" : "▼"}</div>
      </button>

      {expanded ? (
        <div style={{ borderTop: "1px solid #e5e7eb", padding: 18 }}>
          {isFixed && historicalFix && !applied ? (
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: 14,
                padding: 14,
              }}
            >
              <div style={{ fontWeight: 900, color: "#065f46", marginBottom: 6 }}>Already fixed</div>
              <div style={{ fontSize: 13, color: "#166534" }}>
                {(() => {
                  try {
                    return Object.values(JSON.parse(historicalFix.afterSnapshot || "{}"))[0] || "";
                  } catch {
                    return "";
                  }
                })()}
              </div>
            </div>
          ) : null}

          {applied ? (
            <div
              style={{
                background: "#ecfdf5",
                border: "1px solid #a7f3d0",
                borderRadius: 14,
                padding: 14,
                display: "grid",
                gap: 10,
              }}
            >
              <div style={{ fontWeight: 900, color: "#065f46" }}>✓ Fixed instantly</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Before</div>
                  <div style={{ background: "#fee2e2", borderRadius: 12, padding: 12, color: "#991b1b" }}>(empty)</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>After</div>
                  <div style={{ background: "#dcfce7", borderRadius: 12, padding: 12, color: "#166534" }}>
                    {appliedValue}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {!isFixed && isManualOnly ? (
            <div
              style={{
                background: "#fef3c7",
                border: "1px solid #fde68a",
                borderRadius: 14,
                padding: 14,
                color: "#92400e",
              }}
            >
              <div style={{ fontWeight: 900, marginBottom: 6 }}>Human check required</div>
              <div style={{ fontSize: 13, lineHeight: 1.35 }}>
                {issue.issueType === "missing_images"
                  ? "This product needs images uploaded. Klara can’t create real product photos yet."
                  : issue.issueType === "low_image_count"
                    ? "Add more images for better conversion. Klara can’t generate photos yet."
                    : "Inventory is zero. Klara won’t change inventory automatically for safety."}
              </div>
            </div>
          ) : null}

          {!isFixed && isAiFixable ? (
            <div style={{ display: "grid", gap: 12 }}>
              {!generatedValue ? (
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <PrimaryButton onClick={handleGenerate} disabled={isLoading}>
                    {isLoading ? "Generating…" : "Generate Klara Fix"}
                  </PrimaryButton>
                  <span style={{ fontSize: 12, color: "#64748b" }}>
                    Click once. You’ll get a real before/after + one-click apply.
                  </span>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Before</div>
                      <div
                        style={{
                          background: "#fee2e2",
                          borderRadius: 12,
                          padding: 12,
                          color: "#991b1b",
                          minHeight: 70,
                        }}
                      >
                        (empty)
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>After</div>
                      <textarea
                        value={editedValue}
                        onChange={(e) => setEditedValue(e.target.value)}
                        style={{
                          width: "100%",
                          minHeight: 70,
                          borderRadius: 12,
                          padding: 12,
                          border: "1px solid #c7d2fe",
                          background: "#eef2ff",
                          color: "#111827",
                          fontFamily: "inherit",
                          resize: "vertical",
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <PrimaryButton onClick={handleApply} disabled={isLoading}>
                      {isLoading ? "Applying…" : "Apply Fix"}
                    </PrimaryButton>
                    <PrimaryButton onClick={handleGenerate} variant="secondary" disabled={isLoading}>
                      Regenerate
                    </PrimaryButton>
                  </div>
                </div>
              )}

              {fetcher.data?.error && fetcher.data.issueId === issue.id ? (
                <div
                  style={{
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: 14,
                    padding: 12,
                    color: "#b91c1c",
                    fontSize: 13,
                  }}
                >
                  Error: {fetcher.data.error}
                </div>
              ) : null}
            </div>
          ) : null}

          {!isFixed && !isAiFixable && !isManualOnly ? (
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ color: "#64748b", fontSize: 13 }}>
                This issue type is not wired yet. Klara will handle it next.
              </div>
              <PrimaryButton onClick={handleGenerate} disabled={isLoading}>
                {isLoading ? "Generating…" : "Try Generate"}
              </PrimaryButton>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

IssueCard.propTypes = {
  issue: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    issueType: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
  }).isRequired,
  fixHistoryMap: PropTypes.object.isRequired,
  onOpen: PropTypes.func.isRequired,
};

export default function Issues() {
  const { issues, fixHistoryMap } = useLoaderData();

  const [focused, setFocused] = useState(null);
  const [searchParams] = useSearchParams();
  const typeFilter = searchParams.get("type");

  const openIssues = useMemo(() => issues.filter((i) => i.status === "open"), [issues]);
  const fixedIssues = useMemo(() => issues.filter((i) => i.status === "fixed"), [issues]);

  // Filter by type if specified
  const filteredOpenIssues = useMemo(() => {
    if (typeFilter === "images") {
      return openIssues.filter(
        (i) => i.issueType === "missing_images" || i.issueType === "low_image_count"
      );
    }
    return openIssues;
  }, [openIssues, typeFilter]);

  const filteredFixedIssues = useMemo(() => {
    if (typeFilter === "images") {
      return fixedIssues.filter(
        (i) => i.issueType === "missing_images" || i.issueType === "low_image_count"
      );
    }
    return fixedIssues;
  }, [fixedIssues, typeFilter]);

  const handleIssueFixed = (issueId) => {
    // Reload page to refresh issue list
    window.location.reload();
  };

  // If showing only image issues, use ImageFixCard
  const showImageFixes = typeFilter === "images";

  return (
    <div style={{ padding: 18 }}>
      <div style={{ display: "grid", gap: 10 }}>
        <div
          style={{
            border: "1px solid #e5e7eb",
            background: "linear-gradient(180deg, #ffffff 0%, #fbfbfd 100%)",
            borderRadius: 18,
            padding: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "grid", gap: 4 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#0f172a" }}>
              {showImageFixes ? "Fix Missing Images" : "Click an issue → fix it on the spot"}
            </div>
            <div style={{ fontSize: 12, color: "#64748b" }}>
              {showImageFixes
                ? "Add images from other products, variants, or collections in your store."
                : "No menu-hopping. Klara fixes right where you're looking."}
            </div>
          </div>

          {focused && !showImageFixes ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Pill tone="info">Selected</Pill>
              <div style={{ fontSize: 12, color: "#334155", fontWeight: 900 }}>
                {ISSUE_LABELS[focused.issueType] || focused.issueType}
              </div>
            </div>
          ) : (
            <Pill tone="info">{showImageFixes ? `${filteredOpenIssues.length} products` : "Pick an issue"}</Pill>
          )}
        </div>

        {filteredOpenIssues.length ? (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#0f172a" }}>Open Issues</div>
              <Pill tone="info">{filteredOpenIssues.length}</Pill>
            </div>

            {showImageFixes ? (
              // Use ImageFixCard for image issues
              filteredOpenIssues.map((issue) => (
                <ImageFixCard key={issue.id} issue={issue} onFixed={handleIssueFixed} />
              ))
            ) : (
              // Use regular IssueCard for other issues
              filteredOpenIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} fixHistoryMap={fixHistoryMap} onOpen={setFocused} />
              ))
            )}
          </div>
        ) : null}

        {filteredFixedIssues.length ? (
          <div style={{ display: "grid", gap: 12, marginTop: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#0f172a" }}>Fixed</div>
              <Pill tone="good">{filteredFixedIssues.length}</Pill>
            </div>

            {showImageFixes ? (
              filteredFixedIssues.map((issue) => (
                <ImageFixCard key={issue.id} issue={issue} onFixed={handleIssueFixed} />
              ))
            ) : (
              filteredFixedIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} fixHistoryMap={fixHistoryMap} onOpen={setFocused} />
              ))
            )}
          </div>
        ) : null}

        {!filteredOpenIssues.length && !filteredFixedIssues.length ? (
          <div style={{ padding: 32, textAlign: "center", color: "#64748b" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>✨</div>
            <div style={{ fontWeight: 900, color: "#0f172a" }}>
              {showImageFixes ? "No image issues found" : "No issues found"}
            </div>
            <div style={{ fontSize: 13, marginTop: 6 }}>
              {showImageFixes ? "All products have images!" : "Run a scan from the dashboard."}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
